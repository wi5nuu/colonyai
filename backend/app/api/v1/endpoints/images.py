from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import uuid
import os
from pathlib import Path
import logging

from app.core.security import get_current_user, require_role
from app.core.config import settings
from app.core.database import get_db
from app.utils.s3 import s3_is_configured, upload_to_s3, get_presigned_url, delete_from_s3
from app.utils.path_sanitizer import generate_safe_filename, safe_join_path, validate_path_in_directory
from app.services.file_validator import validate_and_sanitize_image
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()
logger = logging.getLogger(__name__)


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
    current_user: dict = Depends(require_role("analyst", "manager", "admin", "super_admin"))
):
    """Upload a plate image for analysis (Auditor: no upload — read-only role)"""
    # Validate file type using magic bytes instead of content_type header
    try:
        file_content, safe_filename, detected_mime = await validate_and_sanitize_image(file)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File validation failed: {str(e)}"
        )

    # Validate file size (10MB max) using already-read content
    file_size = len(file_content)

    if file_size > settings.IMAGE_MAX_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds {settings.IMAGE_MAX_SIZE // (1024*1024)}MB limit"
        )

    # FIX BUG-CRITICAL-004: Sanitize filename to prevent path traversal
    try:
        # Generate safe filename with UUID for uniqueness
        unique_filename = generate_safe_filename(file.filename, use_uuid=True)
        # Extract UUID from generated filename (first part before underscore)
        image_id = uuid.UUID(unique_filename.split('_')[0])
    except (ValueError, IndexError) as e:
        logger.error(f"Filename sanitization failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid filename: {str(e)}"
        )

    # Use validated file content from magic bytes validation
    file_bytes = file_content

    if s3_is_configured():
        # Upload to S3
        ext = unique_filename.rsplit('.', 1)[-1] if '.' in unique_filename else 'jpg'
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

    # Determine media type from file extension
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else 'jpg'
    media_type_map = {'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'webp': 'image/webp'}
    return FileResponse(file_path, media_type=media_type_map.get(ext, 'image/jpeg'))


@router.delete("/{image_id}")
async def delete_image(
    image_id: str,
    current_user: dict = Depends(require_role("analyst", "manager", "admin", "super_admin")),
    db: AsyncSession = Depends(get_db)
):
    """Delete an image by ID (Auditor: no delete — read-only role)"""
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

    # Fallback: local filesystem with path traversal protection
    # Try to find and delete from both directories
    for subdir in ["original", "annotated"]:
        upload_dir = os.path.join(settings.UPLOAD_DIR, subdir)
        if os.path.exists(upload_dir):
            for filename in os.listdir(upload_dir):
                # FIX BUG-CRITICAL-004: Validate filename before deletion
                if filename.startswith(image_id):
                    try:
                        # Use safe_join_path and validate path is within directory
                        file_path = safe_join_path(upload_dir, filename)
                        
                        # Double-check the path is valid
                        if not validate_path_in_directory(file_path, upload_dir):
                            logger.warning(f"Path traversal attempt in delete: {file_path}")
                            continue
                        
                        os.remove(file_path)
                        return {"message": f"Image deleted from {subdir}"}
                    except (ValueError, OSError) as e:
                        logger.error(f"Error deleting file: {e}")
                        continue

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Image not found"
    )
