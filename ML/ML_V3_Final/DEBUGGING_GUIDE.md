# OCR Text Extraction Debugging Guide

## System Status ✓

All components have been verified and are working correctly:

### 1. ✓ Tesseract OCR Installation

- **Location**: `D:\Pytesseract\tesseract.exe`
- **Version**: 5.5.0.20241111
- **Khmer Language Pack**: Installed (`khm.traineddata`)
- **English Language Pack**: Installed (`eng.traineddata`)

### 2. ✓ Python Dependencies

All required packages are installed:

- pytesseract
- opencv-python
- Pillow (PIL)
- numpy
- fastapi
- uvicorn
- httpx

### 3. ✓ Server Status

- **ML Server (Port 8000)**: Running ✓
- **Backend Server (Port 3000)**: Running ✓
- **Frontend (Port 5173)**: Running ✓

## Common Issues & Solutions

### Issue 1: "No text extracted" or Empty Results

**Possible Causes:**

1. ML Server not running
2. Incorrect bounding box coordinates
3. Poor image quality
4. Wrong language selected

**Solutions:**

#### A. Verify ML Server is Running

```powershell
# Check if port 8000 is listening
netstat -ano | Select-String ":8000"

# If not running, start it:
cd "d:\year 3\Capstone\Jomnam text Annotation\Khmer-Data-Annotation-Project\ML\ML_V3_Final"
python main_server.py
```

#### B. Check Bounding Box Coordinates

The bounding boxes must be:

- Within image bounds
- Have valid dimensions (x2 > x1, y2 > y1)
- Properly drawn around text regions

**Frontend Check**: Open browser console (F12) and look for:

```javascript
console.log("data annotation go to", annotations);
```

This should show an array like:

```json
[
  [x1, y1, x2, y2],  // Each box as [left, top, right, bottom]
  [x1, y1, x2, y2]
]
```

#### C. Image Quality Issues

The OCR preprocessing pipeline includes:

1. Grayscale conversion
2. Denoising (fastNlMeansDenoising)
3. Otsu's thresholding

**If text is still not detected:**

- Ensure image has sufficient resolution (minimum 300 DPI recommended)
- Check if text has good contrast with background
- Avoid images with heavy compression artifacts

#### D. Language Configuration

Make sure you're using the correct language:

- Khmer text: `lang="khm"`
- English text: `lang="eng"`
- Mixed: `lang="khm+eng"`

Current configuration in `ocr_utils.py`:

```python
text = pytesseract.image_to_string(preprocessed, lang="khm")
```

### Issue 2: Server Connection Errors

**Symptoms:**

- Frontend shows "Failed to upload images"
- Console error: "Failed to fetch" or "Network error"

**Solutions:**

#### A. Check All Servers are Running

```powershell
# Check all ports
netstat -ano | Select-String ":8000|:3000|:5173"
```

You should see:

- Port 8000 - ML Server
- Port 3000 - Backend Server
- Port 5173 - Frontend

#### B. Verify API Endpoints

ML Server endpoint should be: `http://127.0.0.1:8000/images/`

Check `frontend/src/server/sendImageAPI.js`:

```javascript
const BACKEND_UPLOAD_URL = "http://127.0.0.1:8000/images/";
```

#### C. CORS Configuration

Verify CORS is properly configured in `main_server.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue 3: Tesseract Not Found Error

**Error Message:**

```
TesseractNotFoundError: tesseract is not installed or it's not in your PATH
```

**Solution:**

1. Verify Tesseract installation:

```powershell
Test-Path "D:\Pytesseract\tesseract.exe"
```

2. Update path in `utils/ocr_utils.py`:

```python
pytesseract.pytesseract.tesseract_cmd = r"D:\Pytesseract\tesseract.exe"
os.environ["TESSDATA_PREFIX"] = r"D:\Pytesseract\tessdata"
```

3. If Tesseract is in a different location, update the path accordingly.

### Issue 4: Backend Communication Failure

**Symptoms:**

- OCR completes but results not saved
- Console shows "Backend call skipped or failed"

**Solutions:**

#### A. Check Backend URL

Verify in `main_server.py`:

```python
BACKEND_URL = "http://127.0.0.1:3000/images/upload"
```

#### B. Check Backend Endpoint

The backend should have a route at `/images/upload` that accepts:

- `project_id` (form data)
- `annotations` (JSON string)
- `images` (file upload)

#### C. Check Backend Logs

Look for errors in the backend terminal/console.

## Testing the Complete Pipeline

### Step-by-Step Test:

1. **Test Tesseract directly:**

```powershell
cd "d:\year 3\Capstone\Jomnam text Annotation\Khmer-Data-Annotation-Project\ML\ML_V3_Final"
python test_ocr.py
```

2. **Test ML Server endpoint:**

```powershell
# In a new terminal
curl http://127.0.0.1:8000/docs
```

This should open FastAPI's interactive documentation.

3. **Test from Frontend:**
   - Open browser: http://localhost:5173
   - Create or open a project
   - Upload an image
   - Draw bounding boxes around text
   - Click "Extract Text" button
   - Open browser console (F12) and check for:
     - "OCR result:" log
     - Network tab shows successful POST to http://127.0.0.1:8000/images/

## Debugging Checklist

When text extraction fails, check in this order:

- [ ] ML Server running on port 8000
- [ ] Backend Server running on port 3000
- [ ] Frontend running on port 5173
- [ ] Tesseract installed at correct path
- [ ] Khmer language pack (`khm.traineddata`) present
- [ ] Image uploaded successfully
- [ ] Bounding boxes drawn correctly
- [ ] Browser console shows no errors
- [ ] Network tab shows successful API calls

## Enhanced Logging

To get more detailed logs, update `ocr_utils.py`:

```python
def process_user_boxes(image_bytes, boxes):
    print(f"[DEBUG] Received {len(boxes)} boxes to process")
    pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    print(f"[DEBUG] Image size: {pil_image.size}")
    detections = []

    for idx, box in enumerate(boxes):
        print(f"[DEBUG] Processing box {idx + 1}: {box}")

        # ... existing code ...

        print(f"[DEBUG] Extracted text: '{text}'")

        detections.append({
            "box_coordinates": [x1, y1, x2, y2],
            "extracted_text": text,
            "cropped_image_base64": img_base64
        })

    print(f"[DEBUG] Total detections: {len(detections)}")
    return detections
```

## Performance Optimization

If OCR is too slow:

1. **Reduce preprocessing complexity:**

```python
# In preprocess_for_ocr function
denoised = cv2.fastNlMeansDenoising(gray, h=5, templateWindowSize=5, searchWindowSize=15)
```

2. **Use faster Tesseract PSM mode:**

```python
text = pytesseract.image_to_string(preprocessed, lang="khm", config='--psm 6')
```

PSM modes:

- 3 = Fully automatic page segmentation (default)
- 6 = Assume a single uniform block of text
- 7 = Treat the image as a single text line
- 11 = Sparse text. Find as much text as possible

3. **Process boxes in parallel** (advanced):

```python
from concurrent.futures import ThreadPoolExecutor

def process_single_box(args):
    # ... processing logic ...
    pass

with ThreadPoolExecutor(max_workers=4) as executor:
    detections = list(executor.map(process_single_box, box_args))
```

## Getting Help

If issues persist:

1. **Check ML Server logs** - Look for Python errors
2. **Check Backend logs** - Look for Go server errors
3. **Check Browser console** - Look for JavaScript errors
4. **Check Network tab** - Look for failed API calls

**Common Log Locations:**

- ML Server: Terminal where `python main_server.py` was run
- Backend: Terminal where `go run server.go` was run
- Frontend: Browser Developer Tools (F12) → Console

## Useful Commands

```powershell
# Restart ML Server
taskkill /F /IM python.exe /T
cd "d:\year 3\Capstone\Jomnam text Annotation\Khmer-Data-Annotation-Project\ML\ML_V3_Final"
python main_server.py

# Check all running servers
netstat -ano | Select-String ":8000|:3000|:5173"

# Test Tesseract directly
tesseract --version
tesseract --list-langs

# View ML Server API docs
start http://127.0.0.1:8000/docs
```

## Summary

Your OCR system is **fully functional** and all components are working correctly. The most common reason for "no text extraction" is:

1. **ML Server not running** ← Most common!
2. Incorrect bounding box coordinates
3. Poor image quality

Always ensure the ML Server is running before attempting text extraction!
