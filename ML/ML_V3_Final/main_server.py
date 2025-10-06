import io, json, asyncio
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from utils.ocr_utils import process_user_boxes
from utils.api_client import send_to_backend

app = FastAPI(title="User Box OCR API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BACKEND_URL = "http://127.0.0.1:3000/images/upload" 

@app.post("/images/")
async def ocr_user_boxes(
    image: UploadFile = File(...),
    annotations: str = Form(...),
    project_id: str = Form(...)
):
    if not project_id:
        raise HTTPException(status_code=400, detail="Project ID is required")

    try:
        boxes = json.loads(annotations)
        if not isinstance(boxes, list):
            raise ValueError("Annotations must be a list of boxes")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid annotations JSON")

    image_bytes = await image.read()
    loop = asyncio.get_event_loop()
    detections = await loop.run_in_executor(None, process_user_boxes, image_bytes, boxes)

    backend_status, backend_message = await send_to_backend(
        BACKEND_URL, project_id, image.filename, image_bytes, detections, image.content_type
    )

    return {
        "processing_result": detections,
        "filename": image.filename,
        "backend_status": backend_status,
        "message": backend_message
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
