"""
OCR Testing and Debugging Script
This script tests the OCR functionality step by step to identify issues
"""
import sys
import os
from PIL import Image
import numpy as np

print("=" * 60)
print("STARTING OCR DEBUGGING TESTS")
print("=" * 60)

# Test 1: Check Tesseract Installation
print("\n[TEST 1] Checking Tesseract Installation...")
try:
    import pytesseract
    tesseract_path = r"D:\Pytesseract\tesseract.exe"
    if os.path.exists(tesseract_path):
        print(f"✓ Tesseract found at: {tesseract_path}")
        pytesseract.pytesseract.tesseract_cmd = tesseract_path
        os.environ["TESSDATA_PREFIX"] = r"D:\Pytesseract\tessdata"
        
        # Test version
        version = pytesseract.get_tesseract_version()
        print(f"✓ Tesseract version: {version}")
    else:
        print(f"✗ Tesseract NOT found at: {tesseract_path}")
        sys.exit(1)
except Exception as e:
    print(f"✗ Error checking Tesseract: {e}")
    sys.exit(1)

# Test 2: Check Language Data
print("\n[TEST 2] Checking Language Data...")
tessdata_path = r"D:\Pytesseract\tessdata"
khm_data = os.path.join(tessdata_path, "khm.traineddata")
eng_data = os.path.join(tessdata_path, "eng.traineddata")

if os.path.exists(khm_data):
    print(f"✓ Khmer language data found: {khm_data}")
else:
    print(f"✗ Khmer language data NOT found: {khm_data}")
    
if os.path.exists(eng_data):
    print(f"✓ English language data found: {eng_data}")
else:
    print(f"✗ English language data NOT found: {eng_data}")

# Test 3: Test OCR with sample text
print("\n[TEST 3] Testing OCR with Simple Image...")
try:
    # Create a simple test image with text
    from PIL import Image, ImageDraw, ImageFont
    
    # Create white background
    img = Image.new('RGB', (400, 100), color='white')
    draw = ImageDraw.Draw(img)
    
    # Draw simple text (we'll use basic text since we may not have Khmer font)
    draw.text((10, 30), "Test 123", fill='black')
    
    # Save test image
    test_img_path = "test_ocr_image.png"
    img.save(test_img_path)
    print(f"✓ Created test image: {test_img_path}")
    
    # Test OCR on English
    text_eng = pytesseract.image_to_string(img, lang='eng')
    print(f"✓ OCR Result (English): '{text_eng.strip()}'")
    
    # Test OCR on Khmer (will be empty for this test but checks if language works)
    try:
        text_khm = pytesseract.image_to_string(img, lang='khm')
        print(f"✓ Khmer OCR executed (result may be empty for English text)")
    except Exception as e:
        print(f"✗ Khmer OCR failed: {e}")
    
except Exception as e:
    print(f"✗ OCR test failed: {e}")

# Test 4: Test Preprocessing Functions
print("\n[TEST 4] Testing Preprocessing Functions...")
try:
    import cv2
    from utils.ocr_utils import preprocess_for_ocr
    
    # Create test image
    test_img = Image.new('RGB', (200, 100), color='white')
    draw = ImageDraw.Draw(test_img)
    draw.text((10, 30), "Test", fill='black')
    
    # Test preprocessing
    processed = preprocess_for_ocr(test_img)
    print(f"✓ Preprocessing successful")
    print(f"  Original size: {test_img.size}")
    print(f"  Processed size: {processed.size}")
    
except Exception as e:
    print(f"✗ Preprocessing failed: {e}")

# Test 5: Test process_user_boxes function
print("\n[TEST 5] Testing process_user_boxes Function...")
try:
    from utils.ocr_utils import process_user_boxes
    import io
    
    # Create test image with text
    test_img = Image.new('RGB', (400, 200), color='white')
    draw = ImageDraw.Draw(test_img)
    draw.rectangle([50, 50, 350, 150], outline='black', width=2)
    draw.text((60, 70), "Sample Text 123", fill='black')
    
    # Convert to bytes
    buffer = io.BytesIO()
    test_img.save(buffer, format='PNG')
    img_bytes = buffer.getvalue()
    
    # Test with bounding box
    boxes = [[50, 50, 350, 150]]
    detections = process_user_boxes(img_bytes, boxes)
    
    print(f"✓ process_user_boxes executed successfully")
    print(f"  Number of detections: {len(detections)}")
    if len(detections) > 0:
        print(f"  First detection text: '{detections[0]['extracted_text']}'")
        print(f"  Box coordinates: {detections[0]['box_coordinates']}")
    
except Exception as e:
    print(f"✗ process_user_boxes failed: {e}")
    import traceback
    traceback.print_exc()

# Test 6: Check Python Dependencies
print("\n[TEST 6] Checking Python Dependencies...")
dependencies = [
    'pytesseract', 'PIL', 'cv2', 'numpy', 
    'fastapi', 'uvicorn', 'httpx'
]

for dep in dependencies:
    try:
        if dep == 'PIL':
            __import__('PIL')
        elif dep == 'cv2':
            __import__('cv2')
        else:
            __import__(dep)
        print(f"✓ {dep} installed")
    except ImportError:
        print(f"✗ {dep} NOT installed")

print("\n" + "=" * 60)
print("DEBUGGING TESTS COMPLETED")
print("=" * 60)
print("\nIf all tests passed, the OCR system should work.")
print("If some tests failed, please install missing dependencies or fix configuration.")
print("\nTo start the ML server, run:")
print("  python main_server.py")
