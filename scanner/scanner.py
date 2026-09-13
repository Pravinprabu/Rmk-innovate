"""
scanner.py - Core Computer Vision & AI Document Detection, Auto-Cropping,
and Perspective Transform Engine.
"""

from typing import Tuple, List, Optional, Dict, Any
import numpy as np
import cv2
from PIL import Image
import os


class DocumentScanner:
    """
    Intelligent document boundary detector and perspective transform engine.
    Detects paper documents (receipts, contracts, notes, cards) in images
    taken from any angle, corrects perspective distortion, and applies
    professional document enhancements (CamScanner style).
    """

    def __init__(self, target_processing_dim: int = 1000):
        self.target_dim = target_processing_dim

    def order_points(self, pts: np.ndarray) -> np.ndarray:
        """
        Orders coordinates in clockwise order:
        [top-left, top-right, bottom-right, bottom-left].
        """
        pts = np.array(pts, dtype="float32").reshape((4, 2))
        rect = np.zeros((4, 2), dtype="float32")

        # Top-left has smallest sum (x + y), bottom-right has largest sum
        s = pts.sum(axis=1)
        rect[0] = pts[np.argmin(s)]
        rect[2] = pts[np.argmax(s)]

        # Top-right has smallest diff (y - x), bottom-left has largest diff
        diff = np.diff(pts, axis=1)
        rect[1] = pts[np.argmin(diff)]
        rect[3] = pts[np.argmax(diff)]

        return rect

    def _is_valid_quad(self, pts: np.ndarray, img_area: float) -> bool:
        """
        Checks if the 4 points form a geometrically valid document quad:
        - Must be convex
        - Area must be at least 6% and at most 99% of total image area
        - Internal angles should roughly resemble a quad (between 35 and 145 degrees)
        """
        if len(pts) != 4:
            return False

        pts_int = pts.astype(np.int32)
        if not cv2.isContourConvex(pts_int):
            return False

        area = cv2.contourArea(pts_int)
        if area < 0.06 * img_area or area > 0.99 * img_area:
            return False

        # Check internal angles
        ordered = self.order_points(pts)
        for i in range(4):
            p1 = ordered[i]
            p2 = ordered[(i + 1) % 4]
            p3 = ordered[(i + 2) % 4]

            v1 = p1 - p2
            v2 = p3 - p2
            denom = (np.linalg.norm(v1) * np.linalg.norm(v2)) + 1e-7
            cos_angle = np.dot(v1, v2) / denom
            angle = np.degrees(np.arccos(np.clip(cos_angle, -1.0, 1.0)))

            if angle < 35 or angle > 145:
                return False

        return True

    def detect_document_corners(self, image: np.ndarray) -> Tuple[np.ndarray, float]:
        """
        Detects the 4 corner points of a document in the image.
        Returns:
            corners: np.ndarray of shape (4, 2) in full-resolution coordinates.
            confidence: float between 0.0 and 1.0.
        """
        h_orig, w_orig = image.shape[:2]
        img_area = h_orig * w_orig

        # Scale image down for fast, uniform edge detection
        ratio = max(h_orig, w_orig) / float(self.target_dim)
        if ratio > 1.0:
            h_proc = int(h_orig / ratio)
            w_proc = int(w_orig / ratio)
            resized = cv2.resize(image, (w_proc, h_proc), interpolation=cv2.INTER_AREA)
        else:
            resized = image.copy()
            ratio = 1.0

        proc_area = resized.shape[0] * resized.shape[1]

        # Convert to grayscale
        if len(resized.shape) == 3:
            gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
        else:
            gray = resized.copy()

        # Method A: Bilateral filter + Morphological gradient + Adaptive Canny
        blurred = cv2.bilateralFilter(gray, d=9, sigmaColor=75, sigmaSpace=75)
        
        # Calculate Otsu threshold to calibrate Canny bounds
        high_thresh, _ = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        low_thresh = 0.5 * high_thresh

        edged = cv2.Canny(blurred, low_thresh, high_thresh)

        # Dilate and close to connect fragmented edges
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
        closed = cv2.morphologyEx(edged, cv2.MORPH_CLOSE, kernel, iterations=2)

        candidates = []

        # Find external contours
        contours, _ = cv2.findContours(closed, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
        contours = sorted(contours, key=cv2.contourArea, reverse=True)[:15]

        for cnt in contours:
            peri = cv2.arcLength(cnt, True)
            # Try dynamic epsilon values
            for eps_mult in [0.02, 0.025, 0.03, 0.035, 0.015, 0.04]:
                approx = cv2.approxPolyDP(cnt, eps_mult * peri, True)
                if len(approx) == 4:
                    pts = approx.reshape(4, 2).astype(np.float32)
                    if self._is_valid_quad(pts, proc_area):
                        area = cv2.contourArea(pts.astype(np.int32))
                        candidates.append((pts, area, 0.95))
                        break

        # Method B: Otsu binary thresholding + largest convex hull
        if not candidates:
            _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            # If document is dark on light or light on dark, check both
            for mask in [thresh, cv2.bitwise_not(thresh)]:
                clean_mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)
                clean_mask = cv2.morphologyEx(clean_mask, cv2.MORPH_CLOSE, kernel, iterations=2)
                sub_contours, _ = cv2.findContours(clean_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                sub_contours = sorted(sub_contours, key=cv2.contourArea, reverse=True)[:5]
                for cnt in sub_contours:
                    hull = cv2.convexHull(cnt)
                    peri = cv2.arcLength(hull, True)
                    for eps_mult in [0.02, 0.03, 0.04]:
                        approx = cv2.approxPolyDP(hull, eps_mult * peri, True)
                        if len(approx) == 4:
                            pts = approx.reshape(4, 2).astype(np.float32)
                            if self._is_valid_quad(pts, proc_area):
                                candidates.append((pts, cv2.contourArea(pts.astype(np.int32)), 0.85))
                                break

        # Method C: Minimum area bounding rectangle around largest salient contour
        if not candidates and contours:
            largest_cnt = contours[0]
            if cv2.contourArea(largest_cnt) > 0.08 * proc_area:
                rect = cv2.minAreaRect(largest_cnt)
                box = cv2.boxPoints(rect).astype(np.float32)
                if self._is_valid_quad(box, proc_area):
                    candidates.append((box, cv2.contourArea(box.astype(np.int32)), 0.70))

        # Final Fallback: Frame margin (90% centered rectangle)
        if not candidates:
            h_p, w_p = resized.shape[:2]
            margin_x = int(w_p * 0.05)
            margin_y = int(h_p * 0.05)
            fallback_pts = np.array([
                [margin_x, margin_y],
                [w_p - margin_x, margin_y],
                [w_p - margin_x, h_p - margin_y],
                [margin_x, h_p - margin_y]
            ], dtype=np.float32)
            candidates.append((fallback_pts, (w_p - 2 * margin_x) * (h_p - 2 * margin_y), 0.40))

        # Pick the candidate with the largest reasonable area
        candidates.sort(key=lambda item: item[1], reverse=True)
        best_pts, _, confidence = candidates[0]

        # Scale corners back to original image resolution
        full_res_pts = best_pts * ratio
        ordered_full_res = self.order_points(full_res_pts)

        return ordered_full_res, confidence

    def four_point_transform(self, image: np.ndarray, pts: np.ndarray) -> np.ndarray:
        """
        Applies perspective warp on the image given 4 corner points.
        Returns a flat, rectangular image.
        """
        rect = self.order_points(pts)
        (tl, tr, br, bl) = rect

        # Compute width of the new image
        width_a = np.hypot(br[0] - bl[0], br[1] - bl[1])
        width_b = np.hypot(tr[0] - tl[0], tr[1] - tl[1])
        max_width = max(int(width_a), int(width_b))

        # Compute height of the new image
        height_a = np.hypot(tr[0] - br[0], tr[1] - br[1])
        height_b = np.hypot(tl[0] - bl[0], tl[1] - bl[1])
        max_height = max(int(height_a), int(height_b))

        # Prevent degenerate dimensions
        max_width = max(max_width, 100)
        max_height = max(max_height, 100)

        # Destination coordinates
        dst = np.array([
            [0, 0],
            [max_width - 1, 0],
            [max_width - 1, max_height - 1],
            [0, max_height - 1]
        ], dtype="float32")

        # Compute perspective transform matrix & warp
        M = cv2.getPerspectiveTransform(rect, dst)
        warped = cv2.warpPerspective(
            image, M, (max_width, max_height),
            flags=cv2.INTER_LANCZOS4,
            borderMode=cv2.BORDER_REPLICATE
        )

        return warped

    def enhance_document(
        self,
        image: np.ndarray,
        mode: str = "magic_color",
        sharpen: bool = True,
        contrast_boost: float = 1.0,
        brightness_boost: int = 0
    ) -> np.ndarray:
        """
        Applies CamScanner-grade enhancement filters to scanned documents:
        - 'magic_color': White-balanced, high-contrast, vivid text & graphics (CLAHE + unsharp).
        - 'bw_clean': Crystal clear black & white text with pure white background (adaptive threshold).
        - 'grayscale': Clean monochrome scan with smoothed background.
        - 'original': Straight perspective crop without color changes.
        """
        result = image.copy()

        # Optional brightness/contrast pre-adjustment
        if contrast_boost != 1.0 or brightness_boost != 0:
            result = cv2.convertScaleAbs(result, alpha=contrast_boost, beta=brightness_boost)

        if mode == "original":
            if sharpen:
                result = self._apply_unsharp_mask(result, strength=0.8)
            return result

        elif mode == "magic_color":
            # Convert to LAB color space
            lab = cv2.cvtColor(result, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)

            # Apply CLAHE to L-channel
            clahe = cv2.createCLAHE(clipLimit=2.2, tileGridSize=(8, 8))
            cl = clahe.apply(l)

            # Recombine and convert back to BGR
            limg = cv2.merge((cl, a, b))
            enhanced = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)

            # Auto white balance normalization
            enhanced = self._auto_white_balance(enhanced)

            if sharpen:
                enhanced = self._apply_unsharp_mask(enhanced, strength=1.2)
            return enhanced

        elif mode == "bw_clean":
            # Convert to grayscale
            if len(result.shape) == 3:
                gray = cv2.cvtColor(result, cv2.COLOR_BGR2GRAY)
            else:
                gray = result

            # Smooth paper grain while preserving text
            smooth = cv2.bilateralFilter(gray, d=7, sigmaColor=50, sigmaSpace=50)

            # Adaptive Gaussian Thresholding (removes shadows completely)
            bw = cv2.adaptiveThreshold(
                smooth, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv2.THRESH_BINARY, blockSize=21, C=10
            )

            # Light median blur to remove single-pixel speckles
            bw = cv2.medianBlur(bw, 3)

            # Convert back to 3 channels for consistency
            return cv2.cvtColor(bw, cv2.COLOR_GRAY2BGR)

        elif mode == "grayscale":
            if len(result.shape) == 3:
                gray = cv2.cvtColor(result, cv2.COLOR_BGR2GRAY)
            else:
                gray = result

            # CLAHE on grayscale
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            gray_clahe = clahe.apply(gray)

            if sharpen:
                gray_clahe = self._apply_unsharp_mask(gray_clahe, strength=0.9)

            return cv2.cvtColor(gray_clahe, cv2.COLOR_GRAY2BGR)

        return result

    def _auto_white_balance(self, img: np.ndarray, percentile: float = 0.5) -> np.ndarray:
        """
        Normalizes color casts so paper appears clean and white.
        """
        result = img.astype(np.float32)
        for i in range(3):
            low = np.percentile(result[:, :, i], percentile)
            high = np.percentile(result[:, :, i], 100.0 - percentile)
            if high > low:
                result[:, :, i] = np.clip((result[:, :, i] - low) * (255.0 / (high - low)), 0, 255)
        return result.astype(np.uint8)

    def _apply_unsharp_mask(self, img: np.ndarray, strength: float = 1.0) -> np.ndarray:
        """
        Sharpens text and fine lines using unsharp masking.
        """
        blurred = cv2.GaussianBlur(img, (0, 0), sigmaX=2.0)
        sharpened = cv2.addWeighted(img, 1.0 + strength, blurred, -strength, 0)
        return np.clip(sharpened, 0, 255).astype(np.uint8)

    def annotate_detection(
        self,
        image: np.ndarray,
        pts: np.ndarray,
        confidence: float = 1.0
    ) -> np.ndarray:
        """
        Draws the detected document quadrilateral, corner points, and labels
        over a copy of the original image for clear visual feedback.
        """
        overlay = image.copy()
        pts_int = pts.astype(np.int32)

        # Fill semi-transparent polygon over detected document
        mask = np.zeros_like(image)
        cv2.fillPoly(mask, [pts_int], (0, 220, 100))
        overlay = cv2.addWeighted(overlay, 0.82, mask, 0.18, 0)

        # Draw bright boundary lines
        cv2.polylines(overlay, [pts_int], isClosed=True, color=(0, 255, 128), thickness=3, lineType=cv2.LINE_AA)

        # Corner labels and rings
        corner_names = ["TL", "TR", "BR", "BL"]
        colors = [(255, 0, 100), (0, 200, 255), (0, 255, 0), (255, 180, 0)]

        for i, (pt, name, col) in enumerate(zip(pts_int, corner_names, colors)):
            x, y = int(pt[0]), int(pt[1])
            # Outer ring
            cv2.circle(overlay, (x, y), 10, col, -1, lineType=cv2.LINE_AA)
            cv2.circle(overlay, (x, y), 12, (255, 255, 255), 2, lineType=cv2.LINE_AA)
            # Label
            cv2.putText(
                overlay, name, (x + 14, y + 5),
                cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 255, 255), 3, cv2.LINE_AA
            )
            cv2.putText(
                overlay, name, (x + 14, y + 5),
                cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 0, 0), 1, cv2.LINE_AA
            )

        # Status banner at top
        banner_text = f"Document Detected (Conf: {int(confidence * 100)}%)"
        cv2.rectangle(overlay, (0, 0), (min(360, overlay.shape[1]), 36), (20, 20, 20), -1)
        cv2.putText(
            overlay, banner_text, (10, 24),
            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 150), 1, cv2.LINE_AA
        )

        return overlay

    def scan(
        self,
        image: np.ndarray,
        mode: str = "magic_color",
        sharpen: bool = True,
        contrast_boost: float = 1.0,
        brightness_boost: int = 0
    ) -> Dict[str, Any]:
        """
        End-to-end scanning pipeline:
        1. Detects document corners
        2. Warps perspective to flat rectangle
        3. Applies enhancement filter
        4. Annotates original image
        """
        corners, confidence = self.detect_document_corners(image)
        warped = self.four_point_transform(image, corners)
        enhanced = self.enhance_document(
            warped,
            mode=mode,
            sharpen=sharpen,
            contrast_boost=contrast_boost,
            brightness_boost=brightness_boost
        )
        annotated = self.annotate_detection(image, corners, confidence)

        h, w = enhanced.shape[:2]
        return {
            "cropped_image": enhanced,
            "annotated_image": annotated,
            "corners": corners.tolist(),
            "confidence": confidence,
            "dimensions": f"{w} x {h} px",
            "aspect_ratio": f"{w / max(h, 1):.2f}"
        }

    def save_pdf(self, image: np.ndarray, output_path: str) -> str:
        """
        Saves the cropped document image as a high-quality PDF document.
        """
        # Convert BGR to RGB for PIL
        if len(image.shape) == 3:
            rgb_img = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        else:
            rgb_img = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)

        pil_img = Image.fromarray(rgb_img)
        pil_img.save(output_path, "PDF", resolution=150.0)
        return output_path
