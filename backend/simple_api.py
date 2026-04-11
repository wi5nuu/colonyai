"""
ColonyAI - Simplified Backend API (No Database Required)
FastAPI backend with colony detection model
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from ultralytics import YOLO
from PIL import Image
import numpy as np
import time
import io
from pathlib import Path

# Create FastAPI app
app = FastAPI(
    title="ColonyAI API",
    version="1.0.0",
    description="AI-Powered Bacterial Colony Detection API"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model
MODEL_PATH = "d:/lombapuai/backend/models/colony_best.pt"
model = None

def get_model():
    global model
    if model is None:
        if not Path(MODEL_PATH).exists():
            raise HTTPException(status_code=500, detail="Model not found")
        model = YOLO(MODEL_PATH)
    return model

# Models
class AnalysisResult(BaseModel):
    success: bool
    colonies_detected: int
    confidence_avg: float
    inference_time_ms: float
    cfu_ml: float | None = None
    message: str

class CFUCalculation(BaseModel):
    colony_count: int
    dilution_factor: float
    plated_volume: float

# Endpoints
@app.get("/")
async def root():
    return {
        "name": "ColonyAI API",
        "version": "1.0.0",
        "status": "running",
        "model": "loaded" if model else "not loaded",
        "gpu": "RTX 5050 Laptop"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time()
    }

@app.get("/api/v1/model/info")
async def model_info():
    return {
        "model_path": MODEL_PATH,
        "classes": {0: "CFU"},
        "device": "cuda:0 (GPU)",
        "input_size": 512,
        "trained_epochs": 90,
        "metrics": {
            "mAP_0.5": 0.772,
            "mAP_0.5_0.95": 0.460,
            "precision": 0.874,
            "recall": 0.706
        }
    }

@app.post("/api/v1/analyze/upload")
async def analyze_image(
    file: UploadFile = File(...),
    confidence: float = 0.25,
    iou: float = 0.45
):
    """Analyze uploaded image for colony detection"""
    
    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Run inference
        model = get_model()
        start_time = time.time()
        
        results = model(
            np.array(image),
            device='cuda:0',
            conf=confidence,
            iou=iou,
            verbose=False
        )
        
        inference_time = (time.time() - start_time) * 1000
        
        # Get results
        result = results[0]
        boxes = result.boxes
        num_colonies = len(boxes)
        
        if num_colonies > 0:
            avg_conf = float(boxes.conf.mean().item())
            confidences = boxes.conf.tolist()
            min_conf = float(boxes.conf.min().item())
            max_conf = float(boxes.conf.max().item())
        else:
            avg_conf = 0.0
            confidences = []
            min_conf = 0.0
            max_conf = 0.0
        
        # Generate annotated image
        annotated_img = result.plot()
        annotated_img_pil = Image.fromarray(annotated_img)
        
        # Save annotated image
        output_path = Path("d:/lombapuai/backend/uploads/annotated.jpg")
        output_path.parent.mkdir(parents=True, exist_ok=True)
        annotated_img_pil.save(output_path)
        
        return {
            "success": True,
            "colonies_detected": num_colonies,
            "confidence_avg": round(avg_conf, 3),
            "confidence_min": round(min_conf, 3),
            "confidence_max": round(max_conf, 3),
            "inference_time_ms": round(inference_time, 1),
            "annotated_image_url": str(output_path),
            "message": f"Detected {num_colonies} CFU colonies"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/v1/analyze/calculate-cfu")
async def calculate_cfu(calc: CFUCalculation):
    """Calculate CFU/ml from colony count"""
    
    try:
        cfu_ml = calc.colony_count / (calc.plated_volume * calc.dilution_factor)
        
        status = "valid"
        if calc.colony_count > 250:
            status = "TNTC"  # Too Numerous To Count
        elif calc.colony_count < 25:
            status = "TFTC"  # Too Few To Count
        
        return {
            "success": True,
            "colony_count": calc.colony_count,
            "dilution_factor": calc.dilution_factor,
            "plated_volume": calc.plated_volume,
            "cfu_ml": cfu_ml,
            "cfu_ml_scientific": f"{cfu_ml:.2e}",
            "status": status,
            "message": f"CFU/ml calculated: {cfu_ml:.2e}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation failed: {str(e)}")

@app.get("/api/v1/test")
async def test_api():
    """Test endpoint"""
    return {
        "status": "OK",
        "message": "Backend API is working",
        "model_ready": model is not None
    }

if __name__ == "__main__":
    import uvicorn
    print("="*70)
    print("  COLONYAI BACKEND SERVER")
    print("="*70)
    print()
    print("Starting server...")
    print()
    print("API will be available at: http://localhost:8000")
    print("API Docs: http://localhost:8000/docs")
    print()
    print("Press Ctrl+C to stop the server.")
    print("="*70)
    print()
    
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
