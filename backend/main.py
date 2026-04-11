from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from pathlib import Path

from app.core.config import settings
from app.api.v1 import auth_router, image_router, analysis_router, report_router, user_router, lims_router
from app.core.database import engine, Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    from app.core.database import init_db
    await init_db()

    # Ensure upload directories exist
    for subdir in ["original", "annotated", "reports"]:
        Path(f"{settings.UPLOAD_DIR}/{subdir}").mkdir(parents=True, exist_ok=True)

    yield
    # Shutdown


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Powered Bacterial Colony Detection & CFU/ml Reporting System",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files from uploads directory
uploads_path = Path(settings.UPLOAD_DIR)
if uploads_path.exists():
    app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

# Include routers
app.include_router(auth_router, prefix=f"{settings.API_V1_PREFIX}/auth", tags=["Authentication"])
app.include_router(image_router, prefix=f"{settings.API_V1_PREFIX}/images", tags=["Images"])
app.include_router(analysis_router, prefix=f"{settings.API_V1_PREFIX}/analyses", tags=["Analyses"])
app.include_router(report_router, prefix=f"{settings.API_V1_PREFIX}/reports", tags=["Reports"])
app.include_router(user_router, prefix=f"{settings.API_V1_PREFIX}/users", tags=["Users"])
app.include_router(lims_router, prefix=f"{settings.API_V1_PREFIX}/lims", tags=["LIMS Integration"])


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
