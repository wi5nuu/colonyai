from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.core.security import require_role
from app.core.database import get_db
from app.models import AuditLog, User

router = APIRouter()

class AuditLogResponse(BaseModel):
    id: str
    action: str
    resource_type: str
    resource_id: Optional[str]
    user_name: str
    timestamp: datetime
    status: str = "SUCCESS"

    class Config:
        from_attributes = True

@router.get("/", response_model=List[AuditLogResponse])
async def list_audit_logs(
    skip: int = 0,
    limit: int = 50,
    current_user: dict = Depends(require_role("system_admin")),
    db: AsyncSession = Depends(get_db)
):
    """List system audit logs (admin only)"""
    stmt = (
        select(AuditLog, User.full_name)
        .join(User, AuditLog.user_id == User.id)
        .order_by(desc(AuditLog.timestamp))
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    logs = []
    for log, full_name in result.all():
        logs.append(AuditLogResponse(
            id=str(log.id),
            action=log.action,
            resource_type=log.resource_type,
            resource_id=str(log.resource_id) if log.resource_id else None,
            user_name=full_name,
            timestamp=log.timestamp,
            status="SUCCESS" # Simplified
        ))
    
    return logs
