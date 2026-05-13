"""
Audit Log API Endpoints

Role-based access:
- Analyst: view own audit logs only
- Manager: view all org audit logs
- Auditor: view all org audit logs (read-only)
- Admin: view all org audit logs
- Super Admin: view all audit logs globally
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, and_
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid

from app.core.security import require_role
from app.core.database import get_db
from app.models import AuditLog, User, Organization

router = APIRouter()

class AuditLogResponse(BaseModel):
    id: str
    action: str
    resource_type: str
    resource_id: Optional[str]
    user_name: str
    organization_name: Optional[str] = None
    timestamp: datetime
    status: str = "SUCCESS"
    previous_hash: Optional[str] = None
    current_hash: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

    class Config:
        from_attributes = True

@router.get("/", response_model=List[AuditLogResponse])
async def list_audit_logs(
    skip: int = 0,
    limit: int = 50,
    current_user: dict = Depends(require_role("analyst", "manager", "auditor", "admin", "super_admin")),
    db: AsyncSession = Depends(get_db)
):
    """
    List audit logs with role-based scoping:
    - Analyst: own logs only
    - Manager/Admin/Auditor: all org logs
    - Super Admin: all logs globally
    """
    user_role = current_user.get("role")

    # Build base query with user join for name and organization join
    stmt = (
        select(AuditLog, User.full_name, Organization.name)
        .join(User, AuditLog.user_id == User.id)
        .outerjoin(Organization, User.organization_id == Organization.id)
        .order_by(desc(AuditLog.timestamp))
        .offset(skip)
        .limit(limit)
    )

    # Role-based scoping
    if user_role == "analyst":
        stmt = stmt.where(AuditLog.user_id == uuid.UUID(current_user["user_id"]))
    elif user_role in ("manager", "admin", "auditor"):
        org_id = current_user.get("organization_id")
        if org_id:
            stmt = stmt.where(AuditLog.organization_id == uuid.UUID(org_id))
    # Super Admin: no filter — sees everything

    result = await db.execute(stmt)
    logs = []
    for log, full_name, org_name in result.all():
        logs.append(AuditLogResponse(
            id=str(log.id),
            action=log.action,
            resource_type=log.resource_type,
            resource_id=str(log.resource_id) if log.resource_id else None,
            user_name=full_name,
            organization_name=org_name or "ColonyAI Global",
            timestamp=log.timestamp,
            status="SUCCESS",
            previous_hash=log.previous_hash,
            current_hash=log.current_hash,
            ip_address=log.ip_address,
            user_agent=log.user_agent
        ))

    return logs
