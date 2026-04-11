from pydantic_settings import BaseSettings
from typing import List
from pathlib import Path
import os


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "ColonyAI Backend"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    SECRET_KEY: str = "your-secret-key-change-in-production"
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/colonyai"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    # AWS S3
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "ap-southeast-1"
    AWS_S3_BUCKET: str = "colonyai-images"
    AWS_S3_ORIGINAL_PREFIX: str = "original/"
    AWS_S3_ANNOTATED_PREFIX: str = "annotated/"
    AWS_S3_URL_EXPIRY: int = 3600

    # Local file storage (fallback when S3 not configured)
    UPLOAD_DIR: str = "./uploads"
    BACKEND_URL: str = "http://localhost:8000"

    # JWT
    JWT_SECRET_KEY: str = "your-jwt-secret-key"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # YOLO Model
    MODEL_PATH: str = "./models/colony_best.pt"
    MODEL_CONFIDENCE_THRESHOLD: float = 0.60
    MODEL_IOU_THRESHOLD: float = 0.45
    MODEL_IMG_SIZE: int = 512

    # Image Processing
    IMAGE_MAX_SIZE: int = 10485760  # 10MB
    IMAGE_ALLOWED_TYPES: str = "image/jpeg,image/png,image/webp"
    PLATE_DETECTION_ENABLED: bool = True

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/1"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "./logs/colonyai.log"

    class Config:
        env_file = ".env"
        case_sensitive = True

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Ensure upload directories exist
        if self.UPLOAD_DIR:
            Path(self.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
            Path(f"{self.UPLOAD_DIR}/original").mkdir(parents=True, exist_ok=True)
            Path(f"{self.UPLOAD_DIR}/annotated").mkdir(parents=True, exist_ok=True)
            Path(f"{self.UPLOAD_DIR}/reports").mkdir(parents=True, exist_ok=True)


settings = Settings()
