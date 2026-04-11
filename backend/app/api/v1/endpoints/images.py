from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import uuid
import os
import shutil
from pathlib import Path

from app.core.security import get_current_user
from app.core.config import settings
from app.core.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


class ImageUploadResponse(BaseModel):
    image_id: str
    original_url: str
    filename: str


class ImageResponse(BaseModel):
    image_id: str
    original_url: str
    filename: str
    file_size: int


@router.post("/upload", response_model=ImageUploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload a plate image for analysis"""
    # Validate file type
    allowed_types = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed: {', '.join(allowed_types)}"
        )

    # Validate file size (10MB max)
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > settings.IMAGE_MAX_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds {settings.IMAGE_MAX_SIZE // (1024*1024)}MB limit"
        )

    # Generate unique filename
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_filename = f"{uuid.uuid4()}.{ext}"

    # Save to local storage
    upload_dir = os.path.join(settings.UPLOAD_DIR, "original")
    Path(upload_dir).mkdir(parents=True, exist_ok=True)
    file_path = os.path.join(upload_dir, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Generate URL
    original_url = f"{settings.BACKEND_URL}/uploads/original/{unique_filename}"

    return {
        "image_id": str(uuid.uuid4()),
        "original_url": original_url,
        "filename": unique_filename,
    }


@router.get("/{filename}")
async def get_image(
    filename: str,
    current_user: dict = Depends(get_current_user)
):
    """Retrieve uploaded image by filename"""
    file_path = os.path.join(settings.UPLOAD_DIR, "original", filename)

    if not os.path.exists(file_path):
        # Try annotated directory
        file_path = os.path.join(settings.UPLOAD_DIR, "annotated", filename)

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )

    return FileResponse(file_path, media_type="image/jpeg")


@router.delete("/{image_id}")
async def delete_image(
    image_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete an image by ID"""
    # Try to find and delete from both directories
    for subdir in ["original", "annotated"]:
        upload_dir = os.path.join(settings.UPLOAD_DIR, subdir)
        if os.path.exists(upload_dir):
            for filename in os.listdir(upload_dir):
                if filename.startswith(image_id):
                    file_path = os.path.join(upload_dir, filename)
                    os.remove(file_path)
                    return {"message": f"Image deleted from {subdir}"}

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Image not found"
    )
