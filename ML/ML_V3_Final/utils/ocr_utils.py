import io, base64, re, numpy as np, cv2
from PIL import Image
import pytesseract
import os
from pathlib import Path
from dotenv import load_dotenv

# Assuming this file is in root/ML/ml_v3_final/utils/
SCRIPT_DIR = Path(__file__).resolve().parent
ML_DIR = SCRIPT_DIR.parent.parent
dotenv_path = ML_DIR / ".env"
load_dotenv(dotenv_path=dotenv_path)

# # ---- Configure Tesseract ----
TESSERACT_CMD = os.getenv("TESSERACT_CMD")
TESSERACT_TESSDATA_PREFIX = os.getenv("TESSERACT_TESSDATA_PREFIX")
pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD
os.environ["TESSDATA_PREFIX"] = TESSERACT_TESSDATA_PREFIX

# ---- PreProcessing for OCR ----
'''This first function for cleaning image before sending to OCR engine
    1. Convert to Grayscale -> reduce noise from color channels
    2. Denoise image using Non-local Means Denoising --> smoothing background, sharpening text
    3. Apply Otsu's thresholding ---> to get binary image and make text more distinct in black/white 
'''
def preprocess_for_ocr(pil_image):
    gray = np.array(pil_image.convert("L"))
    denoised = cv2.fastNlMeansDenoising(gray, h=10, templateWindowSize=7, searchWindowSize=21)
    _, thresh = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return Image.fromarray(thresh)

'''Processing User-defined Boxes : Align with Segmentation step in OCR Pipeline
    - Instead of sending whole image to OCR engine, we will crop each box
    and send to OCR engine based on the users drawing text box region on image
    - This helps to improve accuracy, reduce noise from irrelevant areas, and handle complex layouts like tables signs,..
'''
def process_user_boxes(image_bytes, boxes):
    pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    detections = []

    for box in boxes:
        if not (isinstance(box, list) and len(box) == 4):
            continue
        x1, y1, x2, y2 = map(int, box)
        cropped = pil_image.crop((x1, y1, x2, y2))
        preprocessed = preprocess_for_ocr(cropped)
        try:
            # Text Recognition and Extraction Stages using Tesseract OCR with Khmer language
            # Using regex to clean up whitespace characters after passing the cleaned cropping image into Tesseract
            text = re.sub(r"\s+", " ", pytesseract.image_to_string(preprocessed, lang="khm+eng")).strip()
        except Exception:
            text = ""

        buffer = io.BytesIO()
        preprocessed.save(buffer, format="PNG")
        img_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

        ''' Post-Processing & Output Packaging steps of OCR pipeline 
            - Each detected text box is represented as a dictionary with:
                - box_coordinates: The coordinates of the bounding box
                - extracted_text: The text extracted from the cropped image
                - cropped_image_base64: The base64-encoded string of the cropped image
        '''
        detections.append({
            "box_coordinates": [x1, y1, x2, y2],
            "extracted_text": text,
            "cropped_image_base64": img_base64
        })
    return detections

