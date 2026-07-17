"""
Model Management API — upload, list, activate, and delete YOLO models.
Super Admin only. Models stored in backend/models/ with versioning.

Endpoints:
  GET    /admin/models              — list all available models
  POST   /admin/models/upload       — upload new .pt model file
  POST   /admin/models/activate     — activate a model by filename
  DELETE /admin/models/{filename}   — delete a model
"""

import os
import json
import shutil
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_role
from app.core.config import settings
from app.services.colony_detector_optimized import reset_detector

logger = logging.getLogger(__name__)

router = APIRouter()

MODELS_DIR = Path(__file__).parent.parent.parent.parent / "models"
INDEX_FILE = MODELS_DIR / "index.json"
ACTIVE_FILE = MODELS_DIR / ".active"
ALLOWED_EXTENSIONS = {".pt", ".onnx", ".engine"}


class ModelInfo(BaseModel):
    filename: str
    size_bytes: int
    uploaded_at: str
    is_active: bool
    format: str


class ModelListResponse(BaseModel):
    models: List[ModelInfo]
    active_model: Optional[str]


def _ensure_models_dir():
    MODELS_DIR.mkdir(parents=True, exist_ok=True)


def _read_index() -> dict:
    _ensure_models_dir()
    if INDEX_FILE.exists():
        return json.loads(INDEX_FILE.read_text())
    return {}


def _write_index(index: dict):
    INDEX_FILE.write_text(json.dumps(index, indent=2))


def _get_active_model() -> Optional[str]:
    if ACTIVE_FILE.exists():
        return ACTIVE_FILE.read_text().strip()
    return None


def _set_active_model(filename: str):
    ACTIVE_FILE.write_text(filename)


def _get_model_format(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    if ext == ".pt":
        return "PyTorch"
    elif ext == ".onnx":
        return "ONNX"
    elif ext == ".engine":
        return "TensorRT"
    return "unknown"


@router.get("", response_model=ModelListResponse)
async def list_models(
    current_user: dict = Depends(require_role("super_admin")),
):
    """List all available models in the models directory."""
    _ensure_models_dir()
    index = _read_index()
    active = _get_active_model()

    models = []
    for filename, meta in index.items():
        filepath = MODELS_DIR / filename
        models.append(ModelInfo(
            filename=filename,
            size_bytes=meta.get("size_bytes", 0),
            uploaded_at=meta.get("uploaded_at", ""),
            is_active=(filename == active),
            format=meta.get("format", _get_model_format(filename)),
        ))

    # Also list any .pt/.onnx/.engine files not in index
    existing_files = set(index.keys())
    for f in MODELS_DIR.iterdir():
        if f.suffix.lower() in ALLOWED_EXTENSIONS and f.name not in existing_files:
            if f.name in (".active", "index.json"):
                continue
            models.append(ModelInfo(
                filename=f.name,
                size_bytes=f.stat().st_size,
                uploaded_at=datetime.fromtimestamp(f.stat().st_mtime, tz=timezone.utc).isoformat(),
                is_active=(f.name == active),
                format=_get_model_format(f.name),
            ))

    models.sort(key=lambda m: m.uploaded_at, reverse=True)

    return ModelListResponse(models=models, active_model=active)


@router.post("/upload")
async def upload_model(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_role("super_admin")),
):
    """Upload a new model file (.pt, .onnx, .engine)."""
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid model format: {ext}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    _ensure_models_dir()
    dest_path = MODELS_DIR / file.filename

    if dest_path.exists():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Model '{file.filename}' already exists. Delete it first or rename the file.",
        )

    contents = await file.read()
    dest_path.write_bytes(contents)

    index = _read_index()
    index[file.filename] = {
        "size_bytes": len(contents),
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "format": _get_model_format(file.filename),
    }
    _write_index(index)

    logger.info("Model uploaded: %s (%d bytes) by %s", file.filename, len(contents), current_user.get("email"))
    return {"message": f"Model '{file.filename}' uploaded successfully.", "filename": file.filename}


@router.post("/activate")
async def activate_model(
    filename: str = Form(...),
    current_user: dict = Depends(require_role("super_admin")),
):
    """Activate a model by filename. Singleton detector is reset on next request."""
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid model format: {ext}",
        )

    model_path = MODELS_DIR / filename
    if not model_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model '{filename}' not found in models directory.",
        )

    _set_active_model(filename)
    reset_detector()

    logger.info("Model activated: %s by %s", filename, current_user.get("email"))
    return {"message": f"Model '{filename}' is now active.", "active_model": filename}


@router.delete("/{filename}")
async def delete_model(
    filename: str,
    current_user: dict = Depends(require_role("super_admin")),
):
    """Delete a model file. Cannot delete the currently active model."""
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Invalid model format: {ext}")

    model_path = MODELS_DIR / filename
    if not model_path.exists():
        raise HTTPException(status_code=404, detail=f"Model '{filename}' not found.")

    active = _get_active_model()
    if filename == active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete the active model. Activate a different model first.",
        )

    model_path.unlink()

    index = _read_index()
    index.pop(filename, None)
    _write_index(index)

    logger.info("Model deleted: %s by %s", filename, current_user.get("email"))
    return {"message": f"Model '{filename}' deleted."}
