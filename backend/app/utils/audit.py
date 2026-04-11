"""Audit logging utility functions"""
import uuid
from typing import Optional
from sqlalchemy import select


async def write_audit_log(
    db,
    user_id: str,
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    details: Optional[dict] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
):
    """
    Write an entry to the audit_logs table.

    Args:
        db: AsyncSession database session
        user_id: UUID string of the acting user
        action: Action performed (e.g. "login", "create_analysis", "approve")
        resource_type: Type of resource affected (e.g. "analysis", "user", "auth")
        resource_id: UUID string of the specific resource (optional)
        details: Additional JSON-serializable context (optional)
        ip_address: Client IP address (optional)
        user_agent: Client user-agent string (optional)
    """
    from app.models import AuditLog

    resource_uuid = uuid.UUID(resource_id) if resource_id else None
    user_uuid = uuid.UUID(user_id)

    audit_entry = AuditLog(
        id=uuid.uuid4(),
        user_id=user_uuid,
        action=action,
        resource_type=resource_type,
        resource_id=resource_uuid,
        details=details,
        ip_address=ip_address,
        user_agent=user_agent,
    )

    if db is not None:
        db.add(audit_entry)
        await db.commit()
