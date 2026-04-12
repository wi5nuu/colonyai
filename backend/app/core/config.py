from pydantic_settings import BaseSettings
from typing import List
from pathlib import Path
import os
import secrets


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "ColonyAI Backend"
    APP_VERSION: str = "1.0.0"
    # FIX QA-004: DEBUG default False for production safety
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "yes")
    SECRET_KEY: str = os.getenv("SECRET_KEY") or secrets.token_urlsafe(32)
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./colonyai.db"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    DATA_RETENTION_DAYS: int = 1825  # Retention policy per UU PDP compliance (5 years)

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

    # Initial Admin Seed
    INITIAL_ADMIN_EMAIL: str = "admin@colonyai.local"
    INITIAL_ADMIN_PASSWORD: str = "admin_secure_placeholder"

    # FIX QA-001: JWT secrets generated dynamically if not set
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY") or secrets.token_urlsafe(32)
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
