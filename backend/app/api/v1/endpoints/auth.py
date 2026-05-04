from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta, timezone

from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
    require_role
)
from app.core.config import settings
from app.models import User, UserRole
from app.utils.audit import write_audit_log
import uuid
import time
from typing import Optional

router = APIRouter()

def validate_password_complexity(password: str):
    """
    Enterprise-grade password validation:
    - Min 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character
    """
    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long"
        )
    if not any(c.isupper() for c in password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one uppercase letter"
        )
    if not any(c.islower() for c in password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one lowercase letter"
        )
    if not any(c.isdigit() for c in password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one digit"
        )
    import re
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one special character"
        )

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole = UserRole.ANALYST
    organization_id: Optional[uuid.UUID] = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Optional[dict] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/login")
async def login(request: LoginRequest, http_request: Request = None, db: AsyncSession = Depends(get_db)):
    """Authenticate user with Account Lockout protection"""
    # Find user in database
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if not user:
        # Avoid user enumeration by using a generic error and consistent time
        time.sleep(0.1) # Subtle timing consistency
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # ── Check Organization Status ──
    if user.organization_id:
        from app.models import Organization
        result = await db.execute(select(Organization).where(Organization.id == user.organization_id))
        org = result.scalar_one_or_none()

        # Ultra-robust status check
        raw_status = str(org.is_active.value if hasattr(org.is_active, 'value') else org.is_active).lower()

        # If status is NOT in any of the known active formats, then deny
        if org and raw_status not in ['active', '1', 'orgstatus.active', 'true', 'none']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Organization access suspended. Status: {raw_status}. Hubungi Global Support."
            )

    # ── Check Account Lockout ──
    if user.is_locked_out == 'yes':
        if user.locked_until and user.locked_until > datetime.utcnow():
            remaining = (user.locked_until - datetime.utcnow()).seconds // 60
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Account locked. Try again in {remaining} minutes."
            )
        else:
            # Reset lockout after time expired
            user.is_locked_out = 'no'
            user.failed_login_attempts = 0
            await db.commit()

    if not verify_password(request.password, user.password_hash):
        # ── Increment Failed Attempts ──
        user.failed_login_attempts += 1
        user.last_failed_login = datetime.utcnow()

        if user.failed_login_attempts >= 5:
            user.is_locked_out = 'yes'
            user.locked_until = datetime.utcnow() + timedelta(minutes=15)
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Too many failed attempts. Account locked for 15 minutes."
            )

        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # ── Success: Reset Failed Attempts ──
    user.failed_login_attempts = 0
    user.is_locked_out = 'no'
    user.locked_until = None
    await db.commit()

    # Create tokens
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role.value,
              "organization_id": str(user.organization_id) if user.organization_id else None}
    )
    refresh_token = create_refresh_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role.value,
              "organization_id": str(user.organization_id) if user.organization_id else None}
    )

    # Audit log: login
    ip = http_request.client.host if http_request else None
    ua = http_request.headers.get("user-agent") if http_request else None
    await write_audit_log(
        db, str(user.id), "login", "auth", str(user.organization_id) if user.organization_id else None,
        details={"email": user.email},
        ip_address=ip, user_agent=ua,
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value,
        }
    }


@router.post("/register")
async def register(
    request: RegisterRequest,
    http_request: Request = None,
    current_user: dict = Depends(require_role("admin", "super_admin")),
    db: AsyncSession = Depends(get_db)
):
    """Register a new user with Password Complexity enforcement"""
    # ── Enforce Password Complexity ──
    validate_password_complexity(request.password)

    # Check if user already exists
    result = await db.execute(select(User).where(User.email == request.email))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # ── Multi-Tenant Logic ──
    # If Org Admin: Always use their own Org ID
    # If Super Admin: Use the one provided in request
    target_org_id = None
    if current_user.get("role") == "super_admin":
        target_org_id = request.organization_id
    else:
        # Get from current_user (the Admin)
        admin_org_id = current_user.get("organization_id")
        if admin_org_id:
            target_org_id = uuid.UUID(admin_org_id)
        else:
            # Admin with no org? (Shouldn't happen in professional setup)
            raise HTTPException(status_code=403, detail="Admin has no organization assigned")

    # Create new user
    new_user = User(
        id=uuid.uuid4(),
        organization_id=target_org_id,
        email=request.email,
        password_hash=get_password_hash(request.password),
        full_name=request.full_name,
        role=request.role
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Audit log: registration
    ip = http_request.client.host if http_request else None
    ua = http_request.headers.get("user-agent") if http_request else None
    await write_audit_log(
        db, str(new_user.id), "register", "auth", str(new_user.organization_id) if new_user.organization_id else None, str(new_user.id),
        details={"email": new_user.email, "full_name": new_user.full_name},
        ip_address=ip, user_agent=ua,
    )

    # Create tokens
    access_token_expires = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(new_user.id), "email": new_user.email, "role": new_user.role.value},
        expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        data={"sub": str(new_user.id), "email": new_user.email, "role": new_user.role.value}
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(new_user.id),
            "email": new_user.email,
            "full_name": new_user.full_name,
            "role": new_user.role.value,
        }
    }


class RefreshTokenRequest(BaseModel):
    refresh_token: str


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Refresh an access token using a refresh token"""
    try:
        payload = decode_token(request.refresh_token)

        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )

        user_id = payload.get("sub")
        email = payload.get("email")
        role = payload.get("role")

        # Verify user still exists
        result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )

        # Create new access token
        access_token_expires = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_id, "email": email, "role": role},
            expires_delta=access_token_expires
        )

        # Create new refresh token
        new_refresh_token = create_refresh_token(
            data={"sub": user_id, "email": email, "role": role}
        )

        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )


@router.post("/logout")
async def logout(
    http_request: Request = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Secure Logout with JWT Blacklisting"""
    from app.models import TokenBlacklist

    # ── Blacklist the JTI ──
    jti = current_user.get("jti")
    exp = current_user.get("exp") # timestamp

    if jti:
        blacklist_item = TokenBlacklist(
            jti=jti,
            expires_at=datetime.fromtimestamp(exp, tz=timezone.utc).replace(tzinfo=None)
        )
        db.add(blacklist_item)
        await db.commit()

    # Audit log: logout
    ip = http_request.client.host if http_request else None
    ua = http_request.headers.get("user-agent") if http_request else None
    await write_audit_log(
        db, user_id=current_user["user_id"], action="logout",
        resource_type="auth", resource_id=None,
        ip_address=ip, user_agent=ua,
    )

    return {"message": "Successfully logged out. Token revoked."}


@router.post("/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    http_request: Request = None,
    db: AsyncSession = Depends(get_db)
):
    """
    ZERO-TRUST Password Recovery with Anti-Phishing Engine:
    - Multi-layer IP & email frequency throttling
    - Admin accounts require Super Admin approval (extra protection)
    - Phishing IPs are auto-blocked and logged to Audit Ledger
    - Token ONLY generated after Admin approval (never self-service)
    """
    from app.models import PasswordResetRequest, Notification
    from app.core.anti_phishing import check_and_record_reset_attempt, PhishingBlockedError
    import secrets

    # Always return generic message to prevent user enumeration
    GENERIC_RESPONSE = {"message": "Jika email terdaftar, permintaan pemulihan akses sedang menunggu persetujuan Administrator Organisasi Anda. Harap hubungi Admin Anda secara langsung."}

    ip = http_request.client.host if http_request else "unknown"
    ua = http_request.headers.get("user-agent", "unknown") if http_request else "unknown"

    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if not user:
        # Still run anti-phishing check for enumeration attempts
        try:
            check_and_record_reset_attempt(ip, request.email, "unknown")
        except PhishingBlockedError:
            pass  # Log silently, return generic response
        return GENERIC_RESPONSE

    # ── ANTI-PHISHING GATE ──
    try:
        check_and_record_reset_attempt(ip, request.email, user.role.value)
    except PhishingBlockedError as e:
        # Log this attack to audit ledger
        await write_audit_log(
            db,
            user_id=str(user.id),
            action="phishing_attempt_blocked",
            resource_type="security",
            resource_id=str(user.id),
            details={
                "ip": ip,
                "ua": ua[:200],
                "threat_level": e.threat_level,
                "reason": e.reason,
                "target_role": user.role.value,
            },
            ip_address=ip,
            user_agent=ua,
        )
        # Alert Admins if an admin account is targeted
        if user.role.value in ("admin", "super_admin"):
            super_admins = await db.execute(
                select(User).where(User.role == "super_admin")
            )
            for sa in super_admins.scalars().all():
                notif = Notification(
                    id=uuid.uuid4(),
                    user_id=sa.id,
                    organization_id=None,
                    title="🚨 SERANGAN PHISHING TERDETEKSI",
                    message=f"IP {ip} mencoba reset password akun Admin '{user.email}' ({user.role.value}). IP telah diblokir secara otomatis. Periksa Audit Ledger untuk detail.",
                    notification_type="error",
                    link="/dashboard/audit",
                )
                db.add(notif)
            await db.commit()
        # Return generic response — never reveal the block to attacker
        return GENERIC_RESPONSE

    # Check if there's already a pending request (prevent duplicate spam)
    existing = await db.execute(
        select(PasswordResetRequest).where(
            PasswordResetRequest.user_id == user.id,
            PasswordResetRequest.status == "pending"
        )
    )
    if existing.scalar_one_or_none():
        return GENERIC_RESPONSE  # Silent dedup


    # Create the pending request (24h window)
    reset_request = PasswordResetRequest(
        id=uuid.uuid4(),
        user_id=user.id,
        organization_id=user.organization_id,
        requester_ip=ip,
        requester_ua=ua[:512],
        status="pending",
        expires_at=datetime.utcnow() + timedelta(hours=24),
    )
    db.add(reset_request)

    # Notify all Admins in the organization
    admin_query = select(User).where(
        User.organization_id == user.organization_id,
        User.role.in_(["admin", "super_admin"])
    )
    if user.organization_id is None:
        # Super Admin-level user - notify only Super Admins
        admin_query = select(User).where(User.role == "super_admin")

    admins_result = await db.execute(admin_query)
    admins = admins_result.scalars().all()

    for admin in admins:
        if str(admin.id) == str(user.id):
            continue  # Don't notify self
        notif = Notification(
            id=uuid.uuid4(),
            user_id=admin.id,
            organization_id=user.organization_id,
            title="⚠️ Permintaan Reset Password",
            message=f"Pengguna {user.full_name} ({user.email}) meminta reset password. IP: {ip}. Permintaan berlaku 24 jam. Verifikasi dan setujui di panel Reset Requests.",
            notification_type="warning",
            link="/dashboard/administration?tab=reset-requests",
        )
        db.add(notif)

    await db.commit()

    # Audit log
    await write_audit_log(
        db, user_id=str(user.id), action="password_reset_requested",
        resource_type="auth", resource_id=str(reset_request.id),
        details={"ip": ip, "ua": ua[:200]},
        ip_address=ip, user_agent=ua,
    )

    return GENERIC_RESPONSE


@router.get("/reset-requests")
async def list_reset_requests(
    current_user: dict = Depends(require_role("admin", "super_admin")),
    db: AsyncSession = Depends(get_db)
):
    """List pending password reset requests for admin review."""
    from app.models import PasswordResetRequest

    # Auto-expire stale requests
    await db.execute(
        select(PasswordResetRequest).where(
            PasswordResetRequest.status == "pending",
            PasswordResetRequest.expires_at < datetime.utcnow()
        )
    )

    user_role = current_user.get("role")
    org_id = current_user.get("organization_id")

    if user_role == "super_admin":
        query = select(PasswordResetRequest, User).join(
            User, PasswordResetRequest.user_id == User.id
        ).where(PasswordResetRequest.status.in_(["pending", "approved", "rejected"]))
    else:
        query = select(PasswordResetRequest, User).join(
            User, PasswordResetRequest.user_id == User.id
        ).where(
            PasswordResetRequest.organization_id == uuid.UUID(org_id),
            PasswordResetRequest.status.in_(["pending", "approved", "rejected"])
        )

    result = await db.execute(query.order_by(PasswordResetRequest.requested_at.desc()).limit(50))
    rows = result.all()

    requests_list = []
    for req, user_obj in rows:
        # Auto-mark expired
        is_expired = req.expires_at < datetime.utcnow() and req.status == "pending"
        requests_list.append({
            "id": str(req.id),
            "user_name": user_obj.full_name,
            "user_email": user_obj.email,
            "user_role": user_obj.role.value,
            "status": "expired" if is_expired else req.status,
            "requester_ip": req.requester_ip,
            "requester_ua": req.requester_ua,
            "requested_at": req.requested_at.isoformat(),
            "expires_at": req.expires_at.isoformat(),
            "reviewed_at": req.reviewed_at.isoformat() if req.reviewed_at else None,
            "reset_token": req.reset_token if req.status == "approved" else None,
            "token_expires_at": req.token_expires_at.isoformat() if req.token_expires_at else None,
        })

    return {"reset_requests": requests_list, "total": len(requests_list)}


@router.post("/reset-requests/{request_id}/approve")
async def approve_reset_request(
    request_id: str,
    http_request: Request = None,
    current_user: dict = Depends(require_role("admin", "super_admin")),
    db: AsyncSession = Depends(get_db)
):
    """Admin approves a password reset request. Generates a one-time token."""
    from app.models import PasswordResetRequest, Notification
    import secrets

    result = await db.execute(
        select(PasswordResetRequest).where(PasswordResetRequest.id == uuid.UUID(request_id))
    )
    req = result.scalar_one_or_none()

    if not req:
        raise HTTPException(status_code=404, detail="Request tidak ditemukan")
    if req.status != "pending":
        raise HTTPException(status_code=400, detail=f"Request sudah berstatus: {req.status}")
    if req.expires_at < datetime.utcnow():
        req.status = "expired"
        await db.commit()
        raise HTTPException(status_code=400, detail="Request sudah kedaluwarsa (>24 jam)")

    # Generate one-time token (1 hour validity)
    token = secrets.token_urlsafe(48)
    req.status = "approved"
    req.reset_token = token
    req.token_expires_at = datetime.utcnow() + timedelta(hours=1)
    req.reviewed_at = datetime.utcnow()
    req.reviewed_by = uuid.UUID(current_user["user_id"])
    await db.commit()

    # Notify the user
    notif = Notification(
        id=uuid.uuid4(),
        user_id=req.user_id,
        organization_id=req.organization_id,
        title="✅ Reset Password Disetujui",
        message="Administrator telah menyetujui permintaan Anda. Silakan hubungi Admin Anda untuk mendapatkan token reset. Token berlaku 1 jam.",
        notification_type="success",
        link="/reset-password",
    )
    db.add(notif)
    await db.commit()

    # Audit
    ip = http_request.client.host if http_request else None
    await write_audit_log(
        db, user_id=current_user["user_id"], action="password_reset_approved",
        resource_type="auth", resource_id=request_id,
        ip_address=ip,
    )

    return {
        "message": "Permintaan disetujui.",
        "reset_token": token,
        "token_expires_at": req.token_expires_at.isoformat(),
        "instruction": "Sampaikan token ini secara langsung kepada pengguna melalui saluran komunikasi internal yang aman. Token hanya berlaku 1 jam."
    }


@router.post("/reset-requests/{request_id}/reject")
async def reject_reset_request(
    request_id: str,
    http_request: Request = None,
    current_user: dict = Depends(require_role("admin", "super_admin")),
    db: AsyncSession = Depends(get_db)
):
    """Admin rejects a password reset request."""
    from app.models import PasswordResetRequest, Notification

    result = await db.execute(
        select(PasswordResetRequest).where(PasswordResetRequest.id == uuid.UUID(request_id))
    )
    req = result.scalar_one_or_none()

    if not req:
        raise HTTPException(status_code=404, detail="Request tidak ditemukan")
    if req.status != "pending":
        raise HTTPException(status_code=400, detail=f"Request sudah berstatus: {req.status}")

    req.status = "rejected"
    req.reviewed_at = datetime.utcnow()
    req.reviewed_by = uuid.UUID(current_user["user_id"])

    # Notify user
    notif = Notification(
        id=uuid.uuid4(),
        user_id=req.user_id,
        organization_id=req.organization_id,
        title="❌ Reset Password Ditolak",
        message="Permintaan reset password Anda ditolak oleh Administrator. Jika ini bukan Anda yang meminta, segera hubungi Admin untuk keamanan akun.",
        notification_type="error",
    )
    db.add(notif)
    await db.commit()

    ip = http_request.client.host if http_request else None
    await write_audit_log(
        db, user_id=current_user["user_id"], action="password_reset_rejected",
        resource_type="auth", resource_id=request_id,
        ip_address=ip,
    )

    return {"message": "Permintaan ditolak dan pengguna telah diberitahu."}




@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """
    Reset password using a valid token with Complexity enforcement.
    """
    result = await db.execute(
        select(User).where(
            User.reset_token == request.token,
            User.reset_token_expires > datetime.utcnow()
        )
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )

    # ── Enforce Password Complexity ──
    validate_password_complexity(request.new_password)

    # Update password
    user.password_hash = get_password_hash(request.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    user.updated_at = datetime.utcnow()

    await db.commit()

    return {"message": "Password reset successfully. You can now login."}


# ============================================================
# Password Change & Session Management
# ============================================================

import re
from app.models.preferences import UserSession
from app.core.exceptions import PasswordValidationError

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str


@router.put("/password")
async def change_password(
    request: PasswordChangeRequest,
    http_request: Request = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Change user password with strict Complexity enforcement.
    """
    user_id = uuid.UUID(current_user["user_id"])
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Verify current password
    if not verify_password(request.current_password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")

    # ── Enforce Password Complexity ──
    validate_password_complexity(request.new_password)

    # Update password
    user.password_hash = get_password_hash(request.new_password)
    from datetime import timezone
    user.updated_at = datetime.now(timezone.utc)
    await db.commit()

    # Audit log
    ip = http_request.client.host if http_request else None
    ua = http_request.headers.get("user-agent") if http_request else None
    await write_audit_log(
        db, user_id=str(user_id), action="password_changed",
        resource_type="auth", resource_id=str(user_id),
        ip_address=ip, user_agent=ua
    )

    return {"message": "Password updated successfully"}


@router.get("/sessions")
async def get_active_sessions(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all active sessions for current user"""
    user_id = uuid.UUID(current_user["user_id"])

    result = await db.execute(
        select(UserSession)
        .where(UserSession.user_id == user_id, UserSession.is_active == True)
        .order_by(UserSession.created_at.desc())
    )
    sessions = result.scalars().all()

    return {
        "sessions": [
            {
                "id": str(s.id),
                "device_info": s.device_info or "Unknown Device",
                "ip_address": s.ip_address,
                "created_at": s.created_at.isoformat(),
                "last_accessed": s.last_accessed.isoformat(),
                "expires_at": s.expires_at.isoformat(),
                "is_current": True  # TODO: Track current session
            }
            for s in sessions
        ]
    }


@router.delete("/sessions/all")
async def revoke_all_sessions(
    http_request: Request = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Logout from all devices by revoking all active sessions"""
    user_id = uuid.UUID(current_user["user_id"])

    result = await db.execute(
        select(UserSession).where(UserSession.user_id == user_id, UserSession.is_active == True)
    )
    sessions = result.scalars().all()

    for session in sessions:
        session.is_active = False

    await db.commit()

    # Audit log
    ip = http_request.client.host if http_request else None
    await write_audit_log(
        db, user_id=str(user_id), action="revoke_all_sessions",
        resource_type="auth", resource_id=str(user_id),
        ip_address=ip
    )

    return {"message": "All sessions revoked successfully. Please login again."}
