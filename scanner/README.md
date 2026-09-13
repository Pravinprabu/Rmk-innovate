# 📄 Automatic Document Scanner using OpenCV

An intelligent document scanner built with OpenCV and Python. This project includes both the **Classic OpenCV Desktop Application** (following the GeeksforGeeks / Murtaza tutorial specification with live trackbars, 8-stage stacked visualization, and 's' key saving) and a **Modern Web Application** with live camera capture and PDF export.

---

## 📁 Project Architecture & File Structure

```
doc scan/
├── Doc_Scanner.py        # Main OpenCV Document Scanner application
├── utlis.py              # Trackbars, contour analysis, reordering, and image stacking
├── Scanned/              # Output directory for saved digital documents
├── app.py                # Modern Web App (Gradio) with webcam & PDF export
├── scanner.py            # Computer Vision engine for the web app
├── generate_samples.py   # Test sample generator (skewed invoices & receipts)
├── test_scanner.py       # Automated test suite
├── samples/              # Test sample documents
│   ├── sample_invoice.jpg
│   ├── sample_receipt.jpg
│   └── sample_angled_doc.jpg
├── requirements.txt      # Python dependencies
└── README.md             # Documentation
```

---

## 🎯 Interface 1: Classic OpenCV Desktop Scanner (`Doc_Scanner.py`)

Follows the 11-step pipeline from the reference guide:
- **Real-time Trackbars**: Interactive `Threshold1` and `Threshold2` sliders to calibrate Canny edge detection.
- **8-Stage Stacked Visualization**:
  - Row 1: `Original` | `Gray` | `Threshold` | `Contours`
  - Row 2: `Biggest Contour` | `Warp Perspective` | `Warp Gray` | `Adaptive Threshold`
- **Keybindings**:
  - Press **`s`**: Saves current warped scan to `Scanned/myImage{count}.jpg` and displays a green **"Scan Saved"** banner.
  - Press **`q`**: Closes the application and releases camera resources.

### Running the Desktop Scanner:
- **With Live Webcam**:
  ```bash
  python Doc_Scanner.py
  ```
- **With a Specific Image File**:
  ```bash
  python Doc_Scanner.py --image samples/sample_invoice.jpg
  ```
- **With an IP Camera / Smartphone Camera URL**:
  ```bash
  python Doc_Scanner.py --camera http://192.168.1.6:8080/video
  ```
- **Headless / Batch Processing**:
  ```bash
  python Doc_Scanner.py --image samples/sample_receipt.jpg --headless
  ```

---

## 🌐 Interface 2: Modern Web Application (`app.py`)

If you prefer a browser-based UI:
```bash
python app.py
```
Open your browser at `http://127.0.0.1:7860`:
- Snap photos directly via your laptop/USB webcam or upload files.
- CamScanner-style enhancement filters (*Magic Color*, *Crisp B&W Text*, *Grayscale*).
- One-click **Download as PDF** and high-resolution images.
- 1-click preloaded example documents.

---

## 🧪 Testing & Verification

Run the automated test suite to verify corner detection, perspective warping, and filter enhancements:
```bash
python test_scanner.py
```
