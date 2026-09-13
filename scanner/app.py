"""
app.py - AI Document Scanner & Auto-Cropper Web Application
Built with OpenCV and Gradio with Live Camera & File Upload support.
"""

import os
import tempfile
import base64
import cv2
import numpy as np
import gradio as gr
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from scanner import DocumentScanner

# Initialize Document Scanner
scanner = DocumentScanner()

# Mode mapping
MODE_MAPPING = {
    "Magic Color (CamScanner Style)": "magic_color",
    "Crisp B&W Document (Clean Text)": "bw_clean",
    "Clean Grayscale": "grayscale",
    "Original (Perspective Corrected)": "original"
}


def process_document(
    image: np.ndarray,
    mode_name: str,
    sharpen: bool,
    contrast: float,
    brightness: int,
    rotate_deg: int = 0
):
    """
    Processes the input image:
    1. Optionally rotates the image (if shot sideways/upside down)
    2. Detects document corners
    3. Dewarps perspective
    4. Enhances image
    5. Generates PDF file for download
    """
    if image is None:
        return (
            None,
            None,
            "⚠️ Please upload an image or capture a photo from your camera first.",
            None
        )

    mode = MODE_MAPPING.get(mode_name, "magic_color")

    # Gradio delivers RGB numpy array; OpenCV works internally with BGR
    bgr_img = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

    # Apply manual orientation rotation if specified
    if rotate_deg == 90:
        bgr_img = cv2.rotate(bgr_img, cv2.ROTATE_90_CLOCKWISE)
    elif rotate_deg == 180:
        bgr_img = cv2.rotate(bgr_img, cv2.ROTATE_180)
    elif rotate_deg == 270:
        bgr_img = cv2.rotate(bgr_img, cv2.ROTATE_90_COUNTERCLOCKWISE)

    # Run scanner pipeline
    result = scanner.scan(
        bgr_img,
        mode=mode,
        sharpen=sharpen,
        contrast_boost=contrast,
        brightness_boost=brightness
    )

    # Convert BGR outputs back to RGB for Gradio display
    annotated_rgb = cv2.cvtColor(result["annotated_image"], cv2.COLOR_BGR2RGB)
    cropped_rgb = cv2.cvtColor(result["cropped_image"], cv2.COLOR_BGR2RGB)

    # Generate a temporary PDF file for user download
    temp_dir = tempfile.gettempdir()
    pdf_path = os.path.join(temp_dir, "scanned_document.pdf")
    scanner.save_pdf(result["cropped_image"], pdf_path)

    conf_pct = int(result["confidence"] * 100)
    status_markdown = f"""
### 📊 Scan Summary
- **Detection Status:** ✅ Document Located Successfully
- **Confidence Score:** `{conf_pct}%`
- **Output Dimensions:** `{result['dimensions']}`
- **Aspect Ratio:** `{result['aspect_ratio']}`
- **Applied Filter:** `{mode_name}`
    """

    return annotated_rgb, cropped_rgb, status_markdown, pdf_path


def create_app():
    custom_css = """
    body, .gradio-container {
        background-color: #F5F8FE !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
        max-width: 1200px !important;
        margin: auto !important;
    }
    .medikiosk-header {
        background: linear-gradient(135deg, #1E3A8A 0%, #1E3A5F 50%, #0F172A 100%);
        border-radius: 16px;
        padding: 24px 30px;
        margin-bottom: 20px;
        color: white;
        box-shadow: 0 4px 14px rgba(30, 58, 138, 0.12);
    }
    .brand-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(255, 255, 255, 0.15);
        padding: 4px 12px;
        border-radius: 9999px;
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 0.5px;
        margin-bottom: 12px;
    }
    .brand-badge .plus-icon {
        font-size: 15px;
        color: #93C5FD;
        font-weight: 900;
    }
    .portal-title {
        font-size: 26px !important;
        font-weight: 800 !important;
        color: #FFFFFF !important;
        margin: 0 0 6px 0 !important;
    }
    .portal-subtitle {
        font-size: 13.5px !important;
        color: #DBEAFE !important;
        margin: 0 !important;
        line-height: 1.5 !important;
    }
    """

    with gr.Blocks(title="MediKiosk Document Scanner") as demo:
        gr.HTML("""
        <div class="medikiosk-header">
            <div class="brand-badge">
                <span class="plus-icon">┼</span>
                <span>MediKiosk Patient Portal</span>
            </div>
            <h1 class="portal-title">📷 AI Document Scanner & Auto-Cropper</h1>
            <p class="portal-subtitle">Capture medical prescriptions, lab reports & discharge summaries with smart 4-point corner detection, automatic perspective dewarping, and CamScanner clinical enhancements.</p>
        </div>
        """)

        with gr.Row():
            # Left Column: Input & Controls
            with gr.Column(scale=5):
                image_input = gr.Image(
                    sources=["upload", "webcam"],
                    type="numpy",
                    label="📷 Input Image (Upload File or Use Live Webcam)",
                    height=380
                )

                with gr.Row():
                    rotate_deg = gr.Radio(
                        choices=[("0°", 0), ("90° CW", 90), ("180°", 180), ("270° CW", 270)],
                        value=0,
                        label="🔄 Orientation Correction"
                    )

                with gr.Accordion("⚙️ Scanner Enhancements & Filters", open=True):
                    filter_mode = gr.Dropdown(
                        choices=list(MODE_MAPPING.keys()),
                        value="Magic Color (CamScanner Style)",
                        label="Color & Enhancement Mode"
                    )
                    with gr.Row():
                        sharpen_chk = gr.Checkbox(value=True, label="Text Sharpening")
                        contrast_slider = gr.Slider(
                            minimum=0.8, maximum=2.0, value=1.0, step=0.05,
                            label="Contrast Multiplier"
                        )
                        brightness_slider = gr.Slider(
                            minimum=-50, maximum=50, value=0, step=5,
                            label="Brightness Offset"
                        )

                with gr.Row():
                    scan_btn = gr.Button("🚀 Scan & Crop Document", variant="primary", scale=2)
                    clear_btn = gr.Button("🔄 Clear", variant="secondary", scale=1)

            # Right Column: Visual Outputs
            with gr.Column(scale=6):
                with gr.Row():
                    annotated_out = gr.Image(
                        label="1. Detected Document Corners",
                        interactive=False,
                        height=280
                    )
                    cropped_out = gr.Image(
                        label="2. Flattened & Cropped Scan",
                        interactive=False,
                        height=280
                    )

                status_info = gr.Markdown(
                    "Ready. Capture with your camera or click an example below to begin."
                )

                pdf_download = gr.File(
                    label="📥 Download Scanned Document as PDF",
                    interactive=False
                )

        # Scan button triggers processing
        scan_btn.click(
            fn=process_document,
            inputs=[
                image_input,
                filter_mode,
                sharpen_chk,
                contrast_slider,
                brightness_slider,
                rotate_deg
            ],
            outputs=[annotated_out, cropped_out, status_info, pdf_download]
        )

        # Auto-trigger scan when image changes
        image_input.change(
            fn=lambda img, mode, shp, cont, brt, rot: process_document(img, mode, shp, cont, brt, rot) if img is not None else (None, None, "Ready. Upload or capture an image.", None),
            inputs=[
                image_input,
                filter_mode,
                sharpen_chk,
                contrast_slider,
                brightness_slider,
                rotate_deg
            ],
            outputs=[annotated_out, cropped_out, status_info, pdf_download]
        )

        def clear_all():
            return None, None, None, "Ready. Capture with your camera or upload an image.", None, 0

        clear_btn.click(
            fn=clear_all,
            inputs=[],
            outputs=[
                image_input,
                annotated_out,
                cropped_out,
                status_info,
                pdf_download,
                rotate_deg
            ]
        )

        # Preloaded Examples
        sample_files = [
            ["samples/sample_invoice.jpg", "Magic Color (CamScanner Style)"],
            ["samples/sample_receipt.jpg", "Crisp B&W Document (Clean Text)"],
            ["samples/sample_angled_doc.jpg", "Magic Color (CamScanner Style)"]
        ]

        if all(os.path.exists(f[0]) for f in sample_files):
            gr.Examples(
                examples=sample_files,
                inputs=[image_input, filter_mode],
                label="💡 Try Example Documents (Click to load & test immediately)"
            )

    return demo, custom_css


def create_server():
    demo, css = create_app()

    fastapi_app = FastAPI(title="MediKiosk Document Scanner")

    fastapi_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @fastapi_app.get("/api/health")
    def health():
        return {"status": "ok", "service": "MediKiosk Document Scanner Engine"}

    @fastapi_app.post("/api/scan")
    async def api_scan(
        file: UploadFile = File(...),
        mode: str = Form("magic_color"),
        sharpen: bool = Form(True),
        contrast: float = Form(1.0),
        brightness: int = Form(0),
        rotate_deg: int = Form(0)
    ):
        try:
            contents = await file.read()
            nparr = np.frombuffer(contents, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if img is None:
                return {"ok": False, "error": "Could not decode input image file."}

            if rotate_deg == 90:
                img = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
            elif rotate_deg == 180:
                img = cv2.rotate(img, cv2.ROTATE_180)
            elif rotate_deg == 270:
                img = cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE)

            actual_mode = MODE_MAPPING.get(mode, mode)
            if actual_mode not in ["magic_color", "bw_clean", "grayscale", "original"]:
                actual_mode = "magic_color"

            scan_result = scanner.scan(
                img,
                mode=actual_mode,
                sharpen=sharpen,
                contrast_boost=contrast,
                brightness_boost=brightness
            )

            _, cropped_buf = cv2.imencode(".jpg", scan_result["cropped_image"], [int(cv2.IMWRITE_JPEG_QUALITY), 92])
            cropped_b64 = "data:image/jpeg;base64," + base64.b64encode(cropped_buf).decode("utf-8")

            _, annotated_buf = cv2.imencode(".jpg", scan_result["annotated_image"], [int(cv2.IMWRITE_JPEG_QUALITY), 85])
            annotated_b64 = "data:image/jpeg;base64," + base64.b64encode(annotated_buf).decode("utf-8")

            temp_pdf = os.path.join(tempfile.gettempdir(), f"scan_{int(scan_result['confidence']*100)}.pdf")
            scanner.save_pdf(scan_result["cropped_image"], temp_pdf)
            with open(temp_pdf, "rb") as f_pdf:
                pdf_b64 = "data:application/pdf;base64," + base64.b64encode(f_pdf.read()).decode("utf-8")

            return {
                "ok": True,
                "confidence": round(float(scan_result["confidence"]), 2),
                "confidence_pct": int(scan_result["confidence"] * 100),
                "dimensions": scan_result["dimensions"],
                "aspect_ratio": scan_result["aspect_ratio"],
                "cropped_image_base64": cropped_b64,
                "annotated_image_base64": annotated_b64,
                "pdf_base64": pdf_b64,
                "mode": actual_mode,
            }
        except Exception as e:
            return {"ok": False, "error": str(e)}

    app = gr.mount_gradio_app(fastapi_app, demo, path="/")
    return app


if __name__ == "__main__":
    app = create_server()
    uvicorn.run(app, host="0.0.0.0", port=7860)
