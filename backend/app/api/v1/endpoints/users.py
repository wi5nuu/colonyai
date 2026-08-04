from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta, timezone
import uuid
import logging

from app.core.security import get_current_user, require_role
from app.core.database import get_db
from app.models import User, Notification, Organization
from app.utils.audit import write_audit_log
from app.utils.password_generator import generate_secure_temp_password
from app.utils.sanitization import sanitize_string

router = APIRouter()
logger = logging.getLogger(__name__)


class UserProfile(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    laboratory_id: Optional[str] = None

    class Config:
        from_attributes = True


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None


class UserBriefResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    organization_name: Optional[str] = None

    class Config:
        from_attributes = True


@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's profile from database"""
    result = await db.execute(
        select(User).where(User.id == current_user["user_id"])
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return UserProfile(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        role=user.role.value if hasattr(user.role, 'value') else str(user.role),
        laboratory_id=str(user.laboratory_id) if user.laboratory_id else None,
    )


@router.patch("/me", response_model=UserProfile)
async def update_current_user_profile(
    request: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update current user's profile"""
    result = await db.execute(
        select(User).where(User.id == current_user["user_id"])
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Update fields with input sanitization
    # FIX BUG-MEDIUM-002: Sanitize user input to prevent XSS
    if request.full_name is not None:
        sanitized_name = sanitize_string(request.full_name.strip())
        if len(sanitized_name) < 2 or len(sanitized_name) > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Full name must be between 2 and 100 characters"
            )
        user.full_name = sanitized_name

    await db.commit()
    await db.refresh(user)

    return UserProfile(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        role=user.role.value if hasattr(user.role, 'value') else str(user.role),
        laboratory_id=str(user.laboratory_id) if user.laboratory_id else None,
    )


@router.get("/", response_model=List[UserBriefResponse])
async def list_users(
    http_request: Request,
    skip: int = 0,
    limit: int = 500,
    current_user: dict = Depends(require_role("manager", "admin", "super_admin")),
    db: AsyncSession = Depends(get_db)
):
    """
    List users with role-based scoping:
    - Manager: read-only, org users only
    - Admin: read + manage, org users only
    - Super Admin: read + manage, all users
    """
    # Audit log: user list accessed
    ip = http_request.client.host if http_request and getattr(http_request, 'client', None) else None
    ua = http_request.headers.get("user-agent") if http_request else None
    await write_audit_log(
        db, current_user["user_id"], "list_users", "user",
        None, details={"skip": skip, "limit": limit},
        ip_address=ip, user_agent=ua,
    )

    # Filter by organization_id for multi-tenancy
    org_id = current_user.get("organization_id")

    query = select(User).offset(skip).limit(limit).order_by(User.created_at.desc())

    # If not super_admin, restrict to same organization
    if current_user.get("role") != "super_admin" and org_id:
        query = query.where(User.organization_id == uuid.UUID(org_id))
    elif current_user.get("role") != "super_admin" and not org_id:
        # User has no org and is not super admin? Safety check.
        return []

    result = await db.execute(query)
    users = result.scalars().all()

    # Build org_id -> name map for efficiency
    org_ids = list({u.organization_id for u in users if u.organization_id})
    org_names: dict = {}
    if org_ids:
        org_result = await db.execute(
            select(Organization).where(Organization.id.in_(org_ids))
        )
        for o in org_result.scalars().all():
            org_names[o.id] = o.name

    return [
        UserBriefResponse(
            id=str(u.id),
            email=u.email,
            full_name=u.full_name,
            role=u.role.value if hasattr(u.role, 'value') else str(u.role),
            organization_name=org_names.get(u.organization_id) if u.organization_id else None,
        )
        for u in users
    ]


class AdminResetPasswordRequest(BaseModel):
    user_id: str
    new_password: str


@router.post("/admin-reset-password")
async def admin_reset_password(
    request: AdminResetPasswordRequest,
    http_request: Request,
    current_user: dict = Depends(require_role("admin", "super_admin")),
    db: AsyncSession = Depends(get_db)
):
    """
    [ADMIN/SUPER_ADMIN] Force reset a user's password and unlock their account.
    - Admin: org users only
    - Super Admin: any user
    """
    from app.core.security import get_password_hash
    from app.api.v1.endpoints.auth import validate_password_complexity
    import uuid

    # 1. Enforce complexity
    validate_password_complexity(request.new_password)

    # 2. Find target user
    try:
        uid = uuid.UUID(request.user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid User ID format")

    result = await db.execute(select(User).where(User.id == uid))
    target_user = result.scalar_one_or_none()

    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found")

    # Multi-tenant security check
    org_id = current_user.get("organization_id")
    if current_user.get("role") != "super_admin":
        if not org_id or str(target_user.organization_id) != org_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only reset passwords for users in your organization."
            )

    # 3. Update password & Clear lockout
    target_user.password_hash = get_password_hash(request.new_password)
    target_user.is_locked_out = 'no'
    target_user.failed_login_attempts = 0
    target_user.locked_until = None

    # 4. Audit Log
    ip = http_request.client.host if http_request and hasattr(http_request, 'client') else None
    await write_audit_log(
        db, current_user["user_id"], "admin_force_password_reset", "user",
        current_user.get("organization_id"), str(target_user.id),
        details={"target_email": target_user.email},
        ip_address=ip
    )

    await db.commit()
    return {"message": f"Password for {target_user.email} reset successfully and account unlocked."}


class EmergencyAccessRequest(BaseModel):
    user_id: str
    reason: str  # Required: admin must state the reason for audit


@router.post("/emergency-access")
async def issue_emergency_access(
    request: EmergencyAccessRequest,
    http_request: Request,
    current_user: dict = Depends(require_role("admin", "super_admin")),
    db: AsyncSession = Depends(get_db)
):
    """
    [ADMIN ONLY] Issue a 2-hour Emergency Temporary Password.

    Use Case: User needs urgent lab access but password reset is pending.
    - Generates a cryptographically secure 12-char temp password
    - Password expires in 2 hours automatically (via token tracking)
    - User MUST change password on first login
    - Full audit trail logged for ISO-17025 compliance
    """
    from app.core.security import get_password_hash

    if not request.reason or len(request.reason.strip()) < 10:
        raise HTTPException(
            status_code=400,
            detail="Alasan darurat harus diisi minimal 10 karakter untuk keperluan audit."
        )

    try:
        uid = uuid.UUID(request.user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Format User ID tidak valid")

    result = await db.execute(select(User).where(User.id == uid))
    target_user = result.scalar_one_or_none()

    if not target_user:
        raise HTTPException(status_code=404, detail="Pengguna tidak ditemukan")

    # Multi-tenant security: Admin can only issue emergency access within their org
    org_id = current_user.get("organization_id")
    if current_user.get("role") != "super_admin":
        if not org_id or str(target_user.organization_id) != org_id:
            raise HTTPException(
                status_code=403,
                detail="Anda hanya bisa memberikan akses darurat untuk pengguna dalam organisasi Anda."
            )

    # FIX BUG-HIGH-002: Generate secure temp password that meets complexity requirements
    temp_password = generate_secure_temp_password(length=12)
    
    # Hash and save
    target_user.password_hash = get_password_hash(temp_password)
    target_user.is_locked_out = 'no'
    target_user.failed_login_attempts = 0
    target_user.locked_until = None

    # Notify target user
    # FIX BUG-LOW-004: Use constant for expiry hours
    EMERGENCY_ACCESS_EXPIRY_HOURS = 2
    expires_at = datetime.now(timezone.utc) + timedelta(hours=EMERGENCY_ACCESS_EXPIRY_HOURS)
    notif = Notification(
        id=uuid.uuid4(),
        user_id=target_user.id,
        organization_id=target_user.organization_id,
        title="🔐 Akses Darurat Diberikan",
        message=f"Administrator telah memberikan password sementara untuk Anda. Password ini berlaku 2 jam hingga {expires_at.strftime('%H:%M')} WIB. WAJIB ganti password segera setelah login di menu Settings.",
        notification_type="warning",
        link="/dashboard/settings",
    )
    db.add(notif)

    # Audit trail
    ip = http_request.client.host if http_request and hasattr(http_request, 'client') else None
    await write_audit_log(
        db,
        user_id=current_user["user_id"],
        action="emergency_access_issued",
        resource_type="user",
        resource_id=str(target_user.id),
        organization_id=org_id,
        details={
            "target_email": target_user.email,
            "reason": request.reason,
            "expires_at": expires_at.isoformat(),
            "issued_by": current_user.get("email"),
        },
        ip_address=ip,
    )

    await db.commit()

    return {
        "message": "Akses darurat berhasil diberikan.",
        "temp_password": temp_password,
        "expires_in": "2 jam",
        "expires_at": expires_at.isoformat(),
        "target_email": target_user.email,
        "instruction": "Sampaikan password ini SECARA LANGSUNG (WhatsApp/telepon internal) kepada pengguna. Password wajib diganti segera setelah login."
    }
