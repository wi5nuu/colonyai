import logging
import sys
from pathlib import Path

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.rate_limiter import RateLimitMiddleware
from app.core.middleware import SecureHeadersMiddleware
from app.api.v1 import auth_router, image_router, analysis_router, report_router, user_router, lims_router, maintenance_router, simulator_router, settings_router, audit_router, super_router
from app.api.v1.endpoints.models import router as models_router
from app.core.database import engine, Base

# ── Logging Configuration ──
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(settings.LOG_FILE, mode="a") if settings.LOG_FILE else logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger("colonyai")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing ColonyAI Backend...")
    from app.core.database import init_db
    logger.info("Connecting to PostgreSQL Database...")
    await init_db()
    logger.info("Database initialization complete.")

    # Ensure upload directories exist
    for subdir in ["original", "annotated", "reports"]:
        Path(f"{settings.UPLOAD_DIR}/{subdir}").mkdir(parents=True, exist_ok=True)

    yield
    # Shutdown
    logger.info("ColonyAI Backend shutting down.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Powered Bacterial Colony Detection & CFU/ml Reporting System",
    lifespan=lifespan
)

# CORS Middleware — restrict to known origins (production safety)
cors_origins = settings.BACKEND_CORS_ORIGINS
logger.info(f"CORS allowed origins: {cors_origins}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
)

# ── Cyber Security Middleware (Secure Headers) ──
app.add_middleware(SecureHeadersMiddleware)

# Rate Limiting Middleware (100 requests/minute per IP)
app.add_middleware(
    RateLimitMiddleware,
    max_requests=100,
    window_seconds=60,
    exempt_paths=['/health', '/', '/docs', '/openapi.json'],
)

# Serve static files from uploads directory
uploads_path = Path(settings.UPLOAD_DIR).resolve()
# Ensure the directory exists before mounting to avoid errors
uploads_path.mkdir(parents=True, exist_ok=True)
logger.info(f"Serving static files from: {uploads_path}")
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

# Include routers
app.include_router(auth_router, prefix=f"{settings.API_V1_PREFIX}/auth", tags=["Authentication"])
app.include_router(image_router, prefix=f"{settings.API_V1_PREFIX}/images", tags=["Images"])
app.include_router(analysis_router, prefix=f"{settings.API_V1_PREFIX}/analyses", tags=["Analyses"])
app.include_router(report_router, prefix=f"{settings.API_V1_PREFIX}/reports", tags=["Reports"])
app.include_router(user_router, prefix=f"{settings.API_V1_PREFIX}/users", tags=["Users"])
app.include_router(lims_router, prefix=f"{settings.API_V1_PREFIX}/lims", tags=["LIMS Integration"])
app.include_router(maintenance_router, prefix=f"{settings.API_V1_PREFIX}/maintenance", tags=["Maintenance"])
app.include_router(simulator_router, prefix=f"{settings.API_V1_PREFIX}/simulator", tags=["Simulator"])
app.include_router(settings_router, prefix=f"{settings.API_V1_PREFIX}/settings", tags=["User Settings"])
app.include_router(audit_router, prefix=f"{settings.API_V1_PREFIX}/audit", tags=["Audit Logs"])
app.include_router(super_router, prefix=f"{settings.API_V1_PREFIX}/super", tags=["Super Admin"])
app.include_router(models_router, prefix=f"{settings.API_V1_PREFIX}/admin/models", tags=["Model Management"])


@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    import os
    print(f"--- Starting {settings.APP_NAME} Server ---")
    
    # Mematikan fitur reload otomatis untuk mencegah WinError 1450 di Windows
    uvicorn.run(
        "main:app", 
        host="127.0.0.1", 
        port=8000, 
        reload=False
    )

