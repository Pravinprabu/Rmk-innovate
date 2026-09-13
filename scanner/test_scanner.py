"""
test_scanner.py - Automated validation suite for DocumentScanner.
Tests corner detection accuracy, perspective transformation,
all enhancement filters, and PDF export.
"""

import os
import cv2
import numpy as np
from scanner import DocumentScanner


def test_scanner():
    scanner = DocumentScanner()
    samples = [
        "samples/sample_invoice.jpg",
        "samples/sample_receipt.jpg",
        "samples/sample_angled_doc.jpg"
    ]

    os.makedirs("test_outputs", exist_ok=True)

    for sample_path in samples:
        assert os.path.exists(sample_path), f"Sample {sample_path} does not exist"
        img = cv2.imread(sample_path)
        assert img is not None, f"Failed to load {sample_path}"

        print(f"\n--- Testing on {sample_path} ({img.shape[1]}x{img.shape[0]}) ---")

        # 1. Corner Detection
        corners, confidence = scanner.detect_document_corners(img)
        print(f"Detected Corners:\n{corners}")
        print(f"Confidence: {confidence:.2f}")
        assert len(corners) == 4, "Must detect exactly 4 corners"
        assert confidence > 0.5, "Confidence should be high on clear samples"

        # 2. Perspective Transform
        warped = scanner.four_point_transform(img, corners)
        assert warped.shape[0] > 100 and warped.shape[1] > 100
        print(f"Dewarped Dimensions: {warped.shape[1]}x{warped.shape[0]} px")

        # 3. Test All Enhancement Modes
        base_name = os.path.splitext(os.path.basename(sample_path))[0]
        modes = ["magic_color", "bw_clean", "grayscale", "original"]

        for mode in modes:
            enhanced = scanner.enhance_document(warped, mode=mode, sharpen=True)
            out_file = f"test_outputs/{base_name}_{mode}.jpg"
            cv2.imwrite(out_file, enhanced)
            assert os.path.exists(out_file), f"Output file {out_file} not created"
            print(f"  [PASS] Mode '{mode}' saved to {out_file}")

        # 4. Test Annotation
        annotated = scanner.annotate_detection(img, corners, confidence)
        cv2.imwrite(f"test_outputs/{base_name}_annotated.jpg", annotated)

        # 5. Full Pipeline & PDF Export
        result = scanner.scan(img, mode="magic_color")
        pdf_path = f"test_outputs/{base_name}.pdf"
        scanner.save_pdf(result["cropped_image"], pdf_path)
        assert os.path.exists(pdf_path), "PDF generation failed"
        print(f"  [PASS] PDF exported successfully: {pdf_path} ({os.path.getsize(pdf_path)} bytes)")

    print("\n==========================================")
    print(" ALL TESTS PASSED SUCCESSFULLY! ")
    print("==========================================")


if __name__ == "__main__":
    test_scanner()
