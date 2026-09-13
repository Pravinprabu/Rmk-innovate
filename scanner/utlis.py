"""
utlis.py - Helper functions for Automatic Document Scanner using OpenCV.
Implements trackbars, contour analysis, point reordering, bounding box drawing,
and multi-image grid stacking.
"""

import cv2
import numpy as np


def nothing(x):
    pass


def initializeTrackbars(initialTrackBarVals=[100, 200]):
    """Creates an OpenCV window with trackbars for real-time Canny edge tuning."""
    cv2.namedWindow("Trackbars", cv2.WINDOW_NORMAL)
    cv2.resizeWindow("Trackbars", 360, 240)
    cv2.createTrackbar("Threshold1", "Trackbars", initialTrackBarVals[0], 255, nothing)
    cv2.createTrackbar("Threshold2", "Trackbars", initialTrackBarVals[1], 255, nothing)


def valTrackbars():
    """Reads current trackbar threshold values."""
    try:
        Threshold1 = cv2.getTrackbarPos("Threshold1", "Trackbars")
        Threshold2 = cv2.getTrackbarPos("Threshold2", "Trackbars")
        if Threshold1 == -1 or Threshold2 == -1:
            return 100, 200
        return Threshold1, Threshold2
    except Exception:
        return 100, 200


def biggestContour(contours, min_area=5000):
    """
    Finds the largest 4-sided polygon contour (representing the document paper).
    Returns (biggest_points, max_area).
    """
    biggest = np.array([])
    max_area = 0

    for i in contours:
        area = cv2.contourArea(i)
        if area > min_area:
            peri = cv2.arcLength(i, True)
            approx = cv2.approxPolyDP(i, 0.02 * peri, True)
            if area > max_area and len(approx) == 4:
                biggest = approx
                max_area = area

    # Fallback: if no exact 4-point polygon was found, try dynamic epsilon or convex hull
    if biggest.size == 0 and contours:
        for i in contours:
            area = cv2.contourArea(i)
            if area > min_area:
                hull = cv2.convexHull(i)
                peri = cv2.arcLength(hull, True)
                for eps in [0.03, 0.04, 0.05]:
                    approx = cv2.approxPolyDP(hull, eps * peri, True)
                    if len(approx) == 4 and area > max_area:
                        biggest = approx
                        max_area = area
                        break

    return biggest, max_area


def reorder(myPoints):
    """
    Reorders 4 points to:
    [0]: Top-Left     [0, 0]
    [1]: Top-Right    [width, 0]
    [2]: Bottom-Left  [0, height]
    [3]: Bottom-Right [width, height]
    """
    myPoints = myPoints.reshape((4, 2))
    myPointsNew = np.zeros((4, 1, 2), dtype=np.int32)
    add = myPoints.sum(1)

    # Top-Left has smallest sum, Bottom-Right has largest sum
    myPointsNew[0] = myPoints[np.argmin(add)]
    myPointsNew[3] = myPoints[np.argmax(add)]

    # Difference (y - x): Top-Right has smallest diff, Bottom-Left has largest diff
    diff = np.diff(myPoints, axis=1)
    myPointsNew[1] = myPoints[np.argmin(diff)]
    myPointsNew[2] = myPoints[np.argmax(diff)]

    return myPointsNew


def drawRectangle(img, biggest, thickness=2):
    """Draws boundary lines between the 4 detected corners."""
    cv2.line(img, (biggest[0][0][0], biggest[0][0][1]), (biggest[1][0][0], biggest[1][0][1]), (0, 255, 0), thickness)
    cv2.line(img, (biggest[0][0][0], biggest[0][0][1]), (biggest[2][0][0], biggest[2][0][1]), (0, 255, 0), thickness)
    cv2.line(img, (biggest[3][0][0], biggest[3][0][1]), (biggest[2][0][0], biggest[2][0][1]), (0, 255, 0), thickness)
    cv2.line(img, (biggest[3][0][0], biggest[3][0][1]), (biggest[1][0][0], biggest[1][0][1]), (0, 255, 0), thickness)
    return img


def stackImages(imgArray, scale, labels=[]):
    """
    Stacks 2D/3D images into a clean multi-view grid with scaling and text labels.
    Handles mixtures of 1-channel (grayscale/binary) and 3-channel (BGR) images.
    """
    rows = len(imgArray)
    cols = len(imgArray[0])
    rowsAvailable = isinstance(imgArray[0], list)

    width = imgArray[0][0].shape[1]
    height = imgArray[0][0].shape[0]

    if rowsAvailable:
        for x in range(rows):
            for y in range(cols):
                # Resize image
                if imgArray[x][y].shape[:2] == (height, width):
                    imgArray[x][y] = cv2.resize(imgArray[x][y], (0, 0), None, scale, scale)
                else:
                    imgArray[x][y] = cv2.resize(imgArray[x][y], (int(width * scale), int(height * scale)))

                # If 1-channel, convert to 3-channel BGR
                if len(imgArray[x][y].shape) == 2:
                    imgArray[x][y] = cv2.cvtColor(imgArray[x][y], cv2.COLOR_GRAY2BGR)

        # Blank placeholder for concatenation
        imageBlank = np.zeros((height, width, 3), np.uint8)
        hor = [imageBlank] * rows
        for x in range(rows):
            hor[x] = np.hstack(imgArray[x])
        ver = np.vstack(hor)
    else:
        for x in range(rows):
            if imgArray[x].shape[:2] == (height, width):
                imgArray[x] = cv2.resize(imgArray[x], (0, 0), None, scale, scale)
            else:
                imgArray[x] = cv2.resize(imgArray[x], (int(width * scale), int(height * scale)))

            if len(imgArray[x].shape) == 2:
                imgArray[x] = cv2.cvtColor(imgArray[x], cv2.COLOR_GRAY2BGR)
        hor = np.hstack(imgArray)
        ver = hor

    # Draw text labels on each tile
    if len(labels) != 0:
        eachImgWidth = int(ver.shape[1] / cols)
        eachImgHeight = int(ver.shape[0] / rows)
        for d in range(rows):
            for c in range(cols):
                cv2.rectangle(ver, (c * eachImgWidth, d * eachImgHeight),
                              (c * eachImgWidth + len(labels[d][c]) * 13 + 27, 30 + d * eachImgHeight),
                              (255, 255, 255), cv2.FILLED)
                cv2.putText(ver, labels[d][c], (c * eachImgWidth + 10, d * eachImgHeight + 20),
                            cv2.FONT_HERSHEY_COMPLEX, 0.55, (255, 0, 255), 1)

    return ver
