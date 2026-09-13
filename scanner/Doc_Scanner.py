"""
Doc_Scanner.py - Automatic Document Scanner using OpenCV.
Detects, perspective-warps, and scans documents using webcam or image input.
Features real-time threshold trackbars, multi-stage pipeline grid, and 's' key saving.
"""

import sys
import os
import argparse
import cv2
import numpy as np
import utlis

# Ensure Scanned directory exists
os.makedirs("Scanned", exist_ok=True)


def parse_args():
    parser = argparse.ArgumentParser(description="Automatic Document Scanner using OpenCV")
    parser.add_argument("--image", type=str, default=None,
                        help="Path to an image file (if provided, scans the image instead of live webcam)")
    parser.add_argument("--camera", type=str, default="0",
                        help="Camera device index (e.g. 0) or RTSP/HTTP video stream URL")
    parser.add_argument("--headless", action="store_true",
                        help="Run once and auto-save without opening GUI windows")
    parser.add_argument("--width", type=int, default=480, help="Processing frame width (default: 480)")
    parser.add_argument("--height", type=int, default=640, help="Processing frame height (default: 640)")
    return parser.parse_args()


def main():
    args = parse_args()
    widthImg = args.width
    heightImg = args.height

    # Determine input mode: Image file or Camera feed
    use_static_image = False
    static_img_raw = None

    if args.image and os.path.exists(args.image):
        use_static_image = True
        static_img_raw = cv2.imread(args.image)
        if static_img_raw is None:
            print(f"Error: Unable to load image at '{args.image}'")
            return
        print(f"Loaded static image: {args.image}")
    else:
        # Try opening camera
        cam_source = int(args.camera) if args.camera.isdigit() else args.camera
        cap = cv2.VideoCapture(cam_source)
        cap.set(10, 160)  # Brightness

        # Test if camera is working
        test_success, _ = cap.read()
        if not test_success:
            print(f"Warning: Camera {args.camera} not accessible. Falling back to default sample image.")
            fallback_sample = "samples/sample_invoice.jpg"
            if os.path.exists(fallback_sample):
                use_static_image = True
                static_img_raw = cv2.imread(fallback_sample)
            else:
                print("Error: No camera or sample image available.")
                return

    # Initialize trackbars if not headless
    if not args.headless:
        utlis.initializeTrackbars([100, 200])

    count = 0
    print("Scanner started!")
    print("Controls:")
    print("  's' : Save current scanned document to Scanned/ directory")
    print("  'q' : Quit application")

    while True:
        if use_static_image:
            img = static_img_raw.copy()
            success = True
        else:
            success, img = cap.read()

        if not success or img is None or img.size == 0:
            print("Failed to read frame.")
            break

        # Step 6: Image Preprocessing
        img = cv2.resize(img, (widthImg, heightImg))
        imgBlank = np.zeros((heightImg, widthImg, 3), np.uint8)
        imgGray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        imgBlur = cv2.GaussianBlur(imgGray, (5, 5), 1)

        # Step 7: Edge Detection
        if not args.headless:
            thres = utlis.valTrackbars()
        else:
            thres = (100, 200)

        imgThreshold = cv2.Canny(imgBlur, thres[0], thres[1])

        # Step 8: Morphological Operations & Finding Biggest Contour
        kernel = np.ones((5, 5), np.uint8)
        imgDial = cv2.dilate(imgThreshold, kernel, iterations=2)
        imgThresholdClean = cv2.erode(imgDial, kernel, iterations=1)

        imgContours = img.copy()
        imgBigContour = img.copy()

        contours, hierarchy = cv2.findContours(
            imgThresholdClean, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )
        cv2.drawContours(imgContours, contours, -1, (0, 255, 0), 10)

        biggest, maxArea = utlis.biggestContour(contours)

        if biggest.size != 0:
            biggest = utlis.reorder(biggest)
            cv2.drawContours(imgBigContour, biggest, -1, (0, 255, 0), 20)
            imgBigContour = utlis.drawRectangle(imgBigContour, biggest, 2)

            pts1 = np.float32(biggest)
            pts2 = np.float32([[0, 0], [widthImg, 0], [0, heightImg], [widthImg, heightImg]])
            matrix = cv2.getPerspectiveTransform(pts1, pts2)
            imgWarpColored = cv2.warpPerspective(img, matrix, (widthImg, heightImg))

            # Step 9: Configuring The Image (Border removal & adaptive thresholding)
            margin = 20
            if imgWarpColored.shape[0] > 2 * margin and imgWarpColored.shape[1] > 2 * margin:
                imgWarpColored = imgWarpColored[margin:imgWarpColored.shape[0] - margin,
                                                margin:imgWarpColored.shape[1] - margin]
            imgWarpColored = cv2.resize(imgWarpColored, (widthImg, heightImg))

            # Adaptive threshold for clean document text
            imgWarpGray = cv2.cvtColor(imgWarpColored, cv2.COLOR_BGR2GRAY)
            imgAdaptiveThre = cv2.adaptiveThreshold(imgWarpGray, 255, 1, 1, 7, 2)
            imgAdaptiveThre = cv2.bitwise_not(imgAdaptiveThre)
            imgAdaptiveThre = cv2.medianBlur(imgAdaptiveThre, 3)

            imageArray = (
                [img, imgGray, imgThresholdClean, imgContours],
                [imgBigContour, imgWarpColored, imgWarpGray, imgAdaptiveThre]
            )
        else:
            imgWarpColored = imgBlank.copy()
            imageArray = (
                [img, imgGray, imgThresholdClean, imgContours],
                [imgBlank, imgBlank, imgBlank, imgBlank]
            )

        labels = [
            ["Original", "Gray", "Threshold", "Contours"],
            ["Biggest Contour", "Warp Perspective", "Warp Gray", "Adaptive Threshold"]
        ]

        stackedImage = utlis.stackImages(imageArray, 0.75, labels)

        # Headless mode: save and exit immediately
        if args.headless:
            save_path = f"Scanned/myImage{count}.jpg"
            if biggest.size != 0:
                cv2.imwrite(save_path, imgWarpColored)
                print(f"[HEADLESS] Saved scanned document to {save_path}")
            else:
                cv2.imwrite(save_path, img)
                print(f"[HEADLESS] No contour detected, saved raw image to {save_path}")
            break

        cv2.imshow("Result", stackedImage)

        key = cv2.waitKey(1) & 0xFF

        # Step 10: Saving the Image when 's' key is pressed
        if key == ord('s'):
            save_path = f"Scanned/myImage{count}.jpg"
            cv2.imwrite(save_path, imgWarpColored)
            print(f"Saved: {save_path}")

            # Draw "Scan Saved" banner on screen
            h_stack, w_stack = stackedImage.shape[:2]
            center_x = int(w_stack / 2)
            center_y = int(h_stack / 2)

            banner = stackedImage.copy()
            cv2.rectangle(banner, (center_x - 220, center_y - 60),
                          (center_x + 220, center_y + 40), (0, 255, 0), cv2.FILLED)
            cv2.putText(banner, "Scan Saved", (center_x - 170, center_y + 15),
                        cv2.FONT_HERSHEY_DUPLEX, 1.8, (0, 0, 180), 3, cv2.LINE_AA)
            cv2.imshow("Result", banner)
            cv2.waitKey(400)
            count += 1

        elif key == ord('q'):
            print("Exiting...")
            break

    # Step 11: Closing the window and releasing resources
    if not use_static_image and 'cap' in locals():
        cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
