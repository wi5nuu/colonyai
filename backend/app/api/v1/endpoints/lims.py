from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
import json
import httpx

from app.core.security import get_current_user, require_role
from app.core.database import get_db
from app.core.config import settings
from app.models import Analysis, LimsLog, User
from app.utils.audit import write_audit_log
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

router = APIRouter()


class LIMSSyncResponse(BaseModel):
    """Response from LIMS sync"""
    success: bool
    lims_record_id: Optional[str] = None
    message: str
    timestamp: datetime
    next_action: Optional[str] = None


@router.post("/sync/{analysis_id}", response_model=LIMSSyncResponse)
async def sync_to_lims(
    analysis_id: str,
    request: Request,
    current_user: dict = Depends(require_role("analyst", "manager", "admin", "super_admin")),
    db: AsyncSession = Depends(get_db)
):
    """
    Sync analysis results to external LIMS system.
    Demonstrates production-ready integration architecture.
    """
    # 1. Fetch Analysis
    result = await db.execute(
        select(Analysis).where(Analysis.id == uuid.UUID(analysis_id))
    )
    analysis = result.scalars().first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    # 2. Check Permissions
    if current_user["role"] != "super_admin" and str(analysis.organization_id) != current_user["organization_id"]:
        raise HTTPException(status_code=403, detail="Not authorized to sync this analysis")

    # 3. Construct LIMS Payload (SampleManager 12.4 Compatible)
    payload = {
        "lims_version": "SampleManager 12.4",
        "timestamp": datetime.utcnow().isoformat(),
        "sample_id": analysis.sample_id,
        "test_method": analysis.method_standard or "ISO 4833-1:2013 Total Plate Count",
        "result": {
            "colony_count": analysis.colony_count,
            "cfu_per_ml": analysis.cfu_per_ml,
            "uncertainty_k2": analysis.uncertainty_u,
            "unit": "CFU/mL",
            "classification": analysis.cfu_status or "VALID",
            "analyst_id": str(analysis.user_id),
            "approval_status": "VERIFIED" if analysis.status == "completed" else "PENDING"
        },
        "ai_metadata": {
            "model_version": "ColonyAI v1.0",
            "confidence_score": analysis.confidence_score,
            "artifact_rejected": sum(analysis.class_breakdown.values()) - (analysis.colony_count or 0) if analysis.class_breakdown else 0,
            "merged_colonies_estimated": analysis.class_breakdown.get("colony_merged", 0) if analysis.class_breakdown else 0
        },
        "audit_hash": "SHA256:" + str(uuid.uuid4())[:16] # Simulated for demo
    }

    # 4. Handle Simulation or Real Webhook
    lims_record_id = f"LIMS-{str(uuid.uuid4())[:8].upper()}"
    message = "Sample result accepted by SampleManager. Record created."
    next_action = "Awaiting supervisor approval in LIMS queue."
    status_val = "success"
    response_payload = {
        "status": "received",
        "lims_record_id": lims_record_id,
        "message": message,
        "timestamp": datetime.utcnow().isoformat(),
        "next_action": next_action
    }

    if settings.LIMS_MODE == "live" and settings.LIMS_WEBHOOK_URL:
        try:
            async with httpx.AsyncClient() as client:
                res = await client.post(settings.LIMS_WEBHOOK_URL, json=payload, timeout=10.0)
                res.raise_for_status()
                response_payload = res.json()
                lims_record_id = response_payload.get("lims_record_id", lims_record_id)
                message = response_payload.get("message", message)
        except Exception as e:
            status_val = "failed"
            message = f"LIMS Communication Error: {str(e)}"
            response_payload = {"error": str(e)}

    # 5. Log to LimsLog
    log_entry = LimsLog(
        id=uuid.uuid4(),
        organization_id=analysis.organization_id,
        user_id=uuid.UUID(current_user["user_id"]),
        analysis_id=analysis.id,
        lims_record_id=lims_record_id if status_val == "success" else None,
        status=status_val,
        response_payload=response_payload
    )
    db.add(log_entry)

    # 6. Log to Audit Trail
    await write_audit_log(
        db=db,
        user_id=current_user["user_id"],
        action="LIMS_EXPORT",
        resource_type="analysis",
        organization_id=str(analysis.organization_id),
        resource_id=analysis_id,
        details={
            "lims_record_id": lims_record_id,
            "status": status_val,
            "mode": settings.LIMS_MODE
        },
        ip_address=request.client.host
    )

    await db.commit()

    if status_val == "failed":
        raise HTTPException(status_code=502, detail=message)

    return LIMSSyncResponse(
        success=True,
        lims_record_id=lims_record_id,
        message=message,
        timestamp=datetime.utcnow(),
        next_action=next_action
    )


@router.get("/logs", response_model=List[Dict[str, Any]])
async def get_lims_logs(
    limit: int = 50,
    current_user: dict = Depends(require_role("admin", "super_admin")),
    db: AsyncSession = Depends(get_db)
):
    """Get LIMS synchronization history for audit purposes."""
    query = select(LimsLog).order_by(desc(LimsLog.timestamp)).limit(limit)
    
    if current_user["role"] != "super_admin":
        query = query.where(LimsLog.organization_id == uuid.UUID(current_user["organization_id"]))
        
    result = await db.execute(query)
    logs = result.scalars().all()
    
    # We need to join with User and Analysis to get sample_id and user_name
    # But for a simple list, we can just return what we have or do a more complex query
    # Let's do a join to make the admin page useful
    from app.models import User, Analysis
    
    query = (
        select(LimsLog, User.full_name, Analysis.sample_id)
        .join(User, LimsLog.user_id == User.id)
        .join(Analysis, LimsLog.analysis_id == Analysis.id)
        .order_by(desc(LimsLog.timestamp))
        .limit(limit)
    )
    
    if current_user["role"] != "super_admin":
        query = query.where(LimsLog.organization_id == uuid.UUID(current_user["organization_id"]))
        
    result = await db.execute(query)
    rows = result.all()
    
    return [
        {
            "id": str(row[0].id),
            "timestamp": row[0].timestamp,
            "sample_id": row[2],
            "lims_record_id": row[0].lims_record_id,
            "status": row[0].status,
            "user_name": row[1]
        }
        for row in rows
    ]
