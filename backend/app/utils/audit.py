"""Audit logging utility functions"""
import uuid
import hashlib
import json
from datetime import datetime
from typing import Optional
from sqlalchemy import select, desc


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
    timestamp = datetime.utcnow()

    previous_hash = None
    if db is not None:
        # Get the last log's hash strictly ordered
        stmt = select(AuditLog).order_by(desc(AuditLog.timestamp)).limit(1)
        result = await db.execute(stmt)
        last_log = result.scalars().first()
        if last_log and last_log.current_hash:
            previous_hash = last_log.current_hash

    details_str = json.dumps(details, sort_keys=True) if details else "{}"
    raw_str = f"{previous_hash or ''}{action}{resource_type}{str(resource_uuid) if resource_uuid else ''}{details_str}{timestamp.isoformat()}"
    current_hash = hashlib.sha256(raw_str.encode('utf-8')).hexdigest()

    audit_entry = AuditLog(
        id=uuid.uuid4(),
        user_id=user_uuid,
        action=action,
        resource_type=resource_type,
        resource_id=resource_uuid,
        details=details,
        ip_address=ip_address,
        user_agent=user_agent,
        timestamp=timestamp,
        previous_hash=previous_hash,
        current_hash=current_hash,
    )

    if db is not None:
        db.add(audit_entry)
        await db.commit()
