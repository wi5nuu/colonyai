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
        data={"sub": str(user.id), "email": user.email, "role": user.role.value}
    )
    refresh_token = create_refresh_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role.value}
    )

    # Audit log: login
    ip = http_request.client.host if http_request else None
    ua = http_request.headers.get("user-agent") if http_request else None
    await write_audit_log(
        db, str(user.id), "login", "auth", None,
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
    current_user: dict = Depends(require_role("admin")), # Professional Lab: Admin only
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

    # Create new user
    new_user = User(
        id=uuid.uuid4(),
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
        db, str(new_user.id), "register", "auth", str(new_user.id),
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
async def forgot_password(request: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """
    Initiate password reset flow.
    Generates a token and (mock) sends an email.
    """
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    # Always return success even if user not found (security best practice)
    if user:
        # Generate token
        import secrets
        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        await db.commit()
        
        # TODO: Send actual email in production
        print(f"DEBUG: Password reset link: {settings.BACKEND_URL}/reset-password?token={token}")

    return {"message": "If that email is registered, a reset link has been sent."}


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
