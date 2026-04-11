from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import uuid
import os
from pathlib import Path

from app.core.security import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.utils.s3 import s3_is_configured, upload_to_s3, get_presigned_url, delete_from_s3
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

    # Generate unique ID and filename from the same UUID
    image_id = uuid.uuid4()
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_filename = f"{image_id}.{ext}"

    # Read file bytes
    file_bytes = file.file.read()

    if s3_is_configured():
        # Upload to S3
        s3_key = f"{settings.AWS_S3_ORIGINAL_PREFIX}{image_id}.{ext}"
        upload_to_s3(file_bytes, s3_key, content_type=file.content_type)
        original_url = get_presigned_url(s3_key) or s3_key
    else:
        # Fallback: save to local storage
        upload_dir = os.path.join(settings.UPLOAD_DIR, "original")
        Path(upload_dir).mkdir(parents=True, exist_ok=True)
        file_path = os.path.join(upload_dir, unique_filename)
        with open(file_path, "wb") as buffer:
            buffer.write(file_bytes)
        original_url = f"{settings.BACKEND_URL}/uploads/original/{unique_filename}"

    return {
        "image_id": str(image_id),
        "original_url": original_url,
        "filename": unique_filename,
    }


@router.get("/{filename}")
async def get_image(
    filename: str,
    current_user: dict = Depends(get_current_user)
):
    """Retrieve uploaded image by filename"""
    if s3_is_configured():
        # Try to resolve the S3 key from the filename
        # Filename may be just the UUID or UUID.ext
        image_id = filename.rsplit(".", 1)[0] if "." in filename else filename
        for prefix in [settings.AWS_S3_ORIGINAL_PREFIX, settings.AWS_S3_ANNOTATED_PREFIX]:
            # Try common extensions
            for ext in ["jpg", "jpeg", "png", "webp"]:
                s3_key = f"{prefix}{image_id}.{ext}"
                url = get_presigned_url(s3_key)
                if url:
                    from fastapi.responses import RedirectResponse
                    return RedirectResponse(url=url)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found in S3",
        )

    # Fallback: local filesystem
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
    if s3_is_configured():
        # Delete from S3 (try both original and annotated prefixes)
        deleted = False
        for prefix in [settings.AWS_S3_ORIGINAL_PREFIX, settings.AWS_S3_ANNOTATED_PREFIX]:
            for ext in ["jpg", "jpeg", "png", "webp"]:
                s3_key = f"{prefix}{image_id}.{ext}"
                if delete_from_s3(s3_key):
                    deleted = True
        if deleted:
            return {"message": "Image deleted from S3"}
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found in S3",
        )

    # Fallback: local filesystem
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
