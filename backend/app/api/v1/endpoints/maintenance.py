from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func, and_
from datetime import datetime, timedelta
import os
from pathlib import Path

from app.core.security import require_role
from app.core.database import get_db
from app.core.config import settings
from app.models import Analysis
from app.utils.audit import write_audit_log

router = APIRouter()

@router.delete("/retention")
async def apply_data_retention_policy(
    # BUG-017: UU PDP Administrator only
    current_user: dict = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    """
    Menghapus data analisis dan gambar lokal/S3 yang melewati periode retensi.
    Diperuntukkan untuk UU PDP Indonesia compliance.
    """
    cutoff_date = datetime.utcnow() - timedelta(days=settings.DATA_RETENTION_DAYS)
    
    # 1. Cari analisis yang obsolete
    stmt = select(Analysis).where(Analysis.created_at < cutoff_date)
    result = await db.execute(stmt)
    stale_analyses = result.scalars().all()
    
    deleted_count = 0
    errors = []
    
    for analysis in stale_analyses:
        try:
            # Delete local files if they exist
            if analysis.original_image_url and "uploads" in analysis.original_image_url:
                filename = analysis.original_image_url.split("/")[-1]
                path = Path(settings.UPLOAD_DIR) / "original" / filename
                if path.exists():
                    os.remove(path)
                    
            if analysis.annotated_image_url and "uploads" in analysis.annotated_image_url:
                filename = analysis.annotated_image_url.split("/")[-1]
                path = Path(settings.UPLOAD_DIR) / "annotated" / filename
                if path.exists():
                    os.remove(path)
                    
            # Delete analysis (cascade will delete detections)
            await db.delete(analysis)
            deleted_count += 1
        except Exception as e:
            errors.append(f"Gagal menghapus resources untuk analysis_id {analysis.id}: {str(e)}")
            
    await db.commit()
    
    # Audit log
    await write_audit_log(
        db, current_user["user_id"], "apply_data_retention",
        "system",
        details={
            "retention_days": settings.DATA_RETENTION_DAYS,
            "deleted_count": deleted_count,
            "errors": len(errors)
        }
    )
    
    return {
        "status": "success",
        "retention_period_days": settings.DATA_RETENTION_DAYS,
        "cutoff_date": cutoff_date.isoformat(),
        "analyses_deleted": deleted_count,
        "errors": errors if errors else None
    }
