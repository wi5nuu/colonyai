"""
Simple backend test without database dependency
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="ColonyAI Test API",
    version="1.0.0",
    description="Simple test API with colony detection model"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "ColonyAI Backend is Running!",
        "model": "colony_best.pt loaded",
        "device": "GPU (RTX 5050)"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/v1/test")
async def test_endpoint():
    return {
        "status": "OK",
        "message": "Backend API working",
        "model_ready": True
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
