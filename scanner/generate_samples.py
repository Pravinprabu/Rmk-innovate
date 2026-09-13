"""
generate_samples.py - Generates realistic synthetic document photos
taken from skewed angles on desktop textures for testing.
"""

import os
import numpy as np
import cv2


def create_wooden_background(w: int = 1280, h: int = 960) -> np.ndarray:
    """Generates a textured desk surface background."""
    base = np.full((h, w, 3), (45, 65, 95), dtype=np.uint8)  # Wood brown in BGR
    # Add subtle wood grain / noise
    noise = np.random.normal(0, 8, (h, w, 3)).astype(np.int16)
    bg = np.clip(base.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    
    # Add some horizontal grain streaks
    for y in range(0, h, 25):
        streak_color = np.random.randint(-15, 15)
        bg[y:y+3, :, :] = np.clip(bg[y:y+3, :, :].astype(np.int16) + streak_color, 0, 255).astype(np.uint8)
    
    return bg


def create_invoice_document(w: int = 600, h: int = 850) -> np.ndarray:
    """Draws a clean white invoice with text, headers, and table lines."""
    doc = np.full((h, w, 3), (250, 250, 252), dtype=np.uint8)  # Off-white paper

    # Header
    cv2.putText(doc, "ACME INVOICE CORP", (40, 70), cv2.FONT_HERSHEY_DUPLEX, 1.0, (20, 20, 20), 2, cv2.LINE_AA)
    cv2.putText(doc, "TAX INVOICE #INV-2026-904", (40, 110), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (90, 90, 90), 1, cv2.LINE_AA)
    cv2.putText(doc, "Date: 13-Sep-2026", (420, 110), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (90, 90, 90), 1, cv2.LINE_AA)

    # Dividing line
    cv2.line(doc, (40, 130), (560, 130), (180, 180, 180), 2)

    # Bill To
    cv2.putText(doc, "Billed To: John Doe", (40, 170), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (30, 30, 30), 1, cv2.LINE_AA)
    cv2.putText(doc, "100 Innovation Parkway, Suite 400", (40, 195), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (80, 80, 80), 1, cv2.LINE_AA)

    # Table Header
    cv2.rectangle(doc, (40, 240), (560, 275), (230, 230, 230), -1)
    cv2.putText(doc, "Description", (50, 262), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (20, 20, 20), 1, cv2.LINE_AA)
    cv2.putText(doc, "Qty", (350, 262), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (20, 20, 20), 1, cv2.LINE_AA)
    cv2.putText(doc, "Total ($)", (470, 262), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (20, 20, 20), 1, cv2.LINE_AA)

    items = [
        ("AI Document Scanner License", "1", "149.00"),
        ("Computer Vision SDK Support", "2", "198.00"),
        ("Cloud Processing Credits", "500", "50.00"),
        ("Priority Technical Service", "1", "75.00"),
    ]

    y = 315
    for desc, qty, tot in items:
        cv2.putText(doc, desc, (50, y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (40, 40, 40), 1, cv2.LINE_AA)
        cv2.putText(doc, qty, (360, y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (40, 40, 40), 1, cv2.LINE_AA)
        cv2.putText(doc, tot, (480, y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (40, 40, 40), 1, cv2.LINE_AA)
        cv2.line(doc, (40, y + 15), (560, y + 15), (240, 240, 240), 1)
        y += 45

    # Total Box
    cv2.rectangle(doc, (340, 560), (560, 620), (220, 240, 230), -1)
    cv2.rectangle(doc, (340, 560), (560, 620), (100, 180, 120), 1)
    cv2.putText(doc, "TOTAL AMOUNT:", (350, 595), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (20, 20, 20), 1, cv2.LINE_AA)
    cv2.putText(doc, "$472.00", (480, 595), cv2.FONT_HERSHEY_DUPLEX, 0.65, (10, 120, 40), 2, cv2.LINE_AA)

    # Footer barcode simulation
    for bx in range(50, 280, 4):
        thickness = np.random.choice([1, 2, 3])
        cv2.line(doc, (bx, 730), (bx, 780), (30, 30, 30), thickness)
    cv2.putText(doc, "* 8 3 9 2 0 1 7 4 5 *", (60, 805), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (80, 80, 80), 1, cv2.LINE_AA)

    return doc


def create_receipt_document(w: int = 400, h: int = 700) -> np.ndarray:
    """Draws a store register receipt."""
    receipt = np.full((h, w, 3), (252, 252, 250), dtype=np.uint8)

    cv2.putText(receipt, "SUPERMARKET CENTRAL", (70, 50), cv2.FONT_HERSHEY_DUPLEX, 0.6, (10, 10, 10), 1, cv2.LINE_AA)
    cv2.putText(receipt, "Store #412 - New York, NY", (95, 75), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (80, 80, 80), 1, cv2.LINE_AA)
    cv2.line(receipt, (20, 95), (380, 95), (100, 100, 100), 1, cv2.LINE_AA)

    cv2.putText(receipt, "ORGANIC APPLES 2LB", (30, 140), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (20, 20, 20), 1, cv2.LINE_AA)
    cv2.putText(receipt, "$4.99", (310, 140), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (20, 20, 20), 1, cv2.LINE_AA)

    cv2.putText(receipt, "WHOLE ALMOND MILK", (30, 180), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (20, 20, 20), 1, cv2.LINE_AA)
    cv2.putText(receipt, "$3.49", (310, 180), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (20, 20, 20), 1, cv2.LINE_AA)

    cv2.putText(receipt, "SOURDOUGH BREAD", (30, 220), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (20, 20, 20), 1, cv2.LINE_AA)
    cv2.putText(receipt, "$5.25", (310, 220), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (20, 20, 20), 1, cv2.LINE_AA)

    cv2.putText(receipt, "COLD BREW COFFEE 32OZ", (30, 260), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (20, 20, 20), 1, cv2.LINE_AA)
    cv2.putText(receipt, "$6.99", (310, 260), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (20, 20, 20), 1, cv2.LINE_AA)

    cv2.line(receipt, (20, 310), (380, 310), (150, 150, 150), 1)
    cv2.putText(receipt, "SUBTOTAL", (30, 340), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (20, 20, 20), 1, cv2.LINE_AA)
    cv2.putText(receipt, "$20.72", (310, 340), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (20, 20, 20), 1, cv2.LINE_AA)

    cv2.putText(receipt, "TAX (8.875%)", (30, 370), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (20, 20, 20), 1, cv2.LINE_AA)
    cv2.putText(receipt, "$1.84", (310, 370), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (20, 20, 20), 1, cv2.LINE_AA)

    cv2.putText(receipt, "TOTAL PAID", (30, 420), cv2.FONT_HERSHEY_DUPLEX, 0.65, (10, 10, 10), 2, cv2.LINE_AA)
    cv2.putText(receipt, "$22.56", (300, 420), cv2.FONT_HERSHEY_DUPLEX, 0.65, (10, 10, 10), 2, cv2.LINE_AA)

    cv2.putText(receipt, "THANK YOU FOR SHOPPING!", (80, 520), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (70, 70, 70), 1, cv2.LINE_AA)

    return receipt


def warp_onto_scene(
    doc: np.ndarray,
    scene: np.ndarray,
    target_corners: np.ndarray,
    add_shadow: bool = True
) -> np.ndarray:
    """Warps a document onto a desktop background with perspective & soft shadow."""
    h_doc, w_doc = doc.shape[:2]
    h_bg, w_bg = scene.shape[:2]

    src_corners = np.array([
        [0, 0],
        [w_doc - 1, 0],
        [w_doc - 1, h_doc - 1],
        [0, h_doc - 1]
    ], dtype=np.float32)

    M = cv2.getPerspectiveTransform(src_corners, target_corners.astype(np.float32))
    warped_doc = cv2.warpPerspective(doc, M, (w_bg, h_bg))

    # Mask of document
    doc_mask = cv2.warpPerspective(np.full((h_doc, w_doc), 255, dtype=np.uint8), M, (w_bg, h_bg))

    output = scene.copy()

    # Create soft shadow underneath
    if add_shadow:
        shadow_mask = cv2.warpPerspective(
            np.full((h_doc, w_doc), 255, dtype=np.uint8),
            M, (w_bg, h_bg)
        )
        # Shift shadow slightly down-right
        shadow_trans = np.float32([[1, 0, 12], [0, 1, 15]])
        shadow_shifted = cv2.warpAffine(shadow_mask, shadow_trans, (w_bg, h_bg))
        shadow_blur = cv2.GaussianBlur(shadow_shifted, (35, 35), 0)
        # Darken scene where shadow falls
        shadow_factor = (1.0 - (shadow_blur.astype(np.float32) / 255.0) * 0.4)[:, :, None]
        output = np.clip(output.astype(np.float32) * shadow_factor, 0, 255).astype(np.uint8)

    # Blend document onto scene
    mask_3ch = (doc_mask[:, :, None] / 255.0)
    output = (warped_doc * mask_3ch + output * (1.0 - mask_3ch)).astype(np.uint8)

    return output


def generate_all_samples(output_dir: str = "samples"):
    os.makedirs(output_dir, exist_ok=True)

    # 1. Tilted Invoice on desk
    bg1 = create_wooden_background(1280, 960)
    doc1 = create_invoice_document(600, 850)
    # Skewed corners (camera angle from bottom-left perspective)
    corners1 = np.array([
        [280, 120],   # Top-Left
        [980, 190],   # Top-Right
        [890, 880],   # Bottom-Right
        [150, 780]    # Bottom-Left
    ], dtype=np.float32)
    sample1 = warp_onto_scene(doc1, bg1, corners1)
    p1 = os.path.join(output_dir, "sample_invoice.jpg")
    cv2.imwrite(p1, sample1)
    print(f"Generated {p1}")

    # 2. Skewed Receipt on desk
    bg2 = create_wooden_background(1280, 960)
    doc2 = create_receipt_document(400, 700)
    corners2 = np.array([
        [390, 150],   # Top-Left
        [860, 110],   # Top-Right
        [810, 890],   # Bottom-Right
        [320, 830]    # Bottom-Left
    ], dtype=np.float32)
    sample2 = warp_onto_scene(doc2, bg2, corners2)
    p2 = os.path.join(output_dir, "sample_receipt.jpg")
    cv2.imwrite(p2, sample2)
    print(f"Generated {p2}")

    # 3. Highly angled document (perspective challenge)
    bg3 = create_wooden_background(1280, 960)
    corners3 = np.array([
        [350, 220],   # Top-Left
        [840, 140],   # Top-Right
        [1060, 840],  # Bottom-Right
        [210, 890]    # Bottom-Left
    ], dtype=np.float32)
    sample3 = warp_onto_scene(doc1, bg3, corners3)
    p3 = os.path.join(output_dir, "sample_angled_doc.jpg")
    cv2.imwrite(p3, sample3)
    print(f"Generated {p3}")


if __name__ == "__main__":
    generate_all_samples()
