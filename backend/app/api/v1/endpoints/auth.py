from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import timedelta

from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user
)
from app.core.config import settings
from app.models import User, UserRole
from app.utils.audit import write_audit_log
import uuid
from typing import Optional

router = APIRouter()


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


@router.post("/login")
async def login(request: LoginRequest, http_request: Request = None, db: AsyncSession = Depends(get_db)):
    """Authenticate user and return JWT tokens"""
    # Find user in database
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # Create tokens
    access_token_expires = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role.value},
        expires_delta=access_token_expires
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

    # Return user profile along with tokens
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value if hasattr(user.role, 'value') else str(user.role),
        }
    }


@router.post("/register")
async def register(request: RegisterRequest, http_request: Request = None, db: AsyncSession = Depends(get_db)):
    """Register a new user"""
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
            "role": new_user.role.value if hasattr(new_user.role, 'value') else str(new_user.role),
        }
    }


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str, db: AsyncSession = Depends(get_db)):
    """Refresh an access token using a refresh token"""
    try:
        payload = decode_token(refresh_token)

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
async def logout(http_request: Request = None, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Logout user (client should delete tokens)"""
    # Audit log: logout
    ip = http_request.client.host if http_request else None
    ua = http_request.headers.get("user-agent") if http_request else None
    await write_audit_log(
        db, user_id=current_user["user_id"], action="logout",
        resource_type="auth", resource_id=None,
        ip_address=ip, user_agent=ua,
    )
    # In a production system, you might add the token to a blacklist
    # For now, the client is responsible for deleting the tokens
    return {"message": "Successfully logged out"}


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
    Change user password with validation.

    Requirements:
    - Current password must be correct
    - New password must be >= 8 characters
    - New password must contain uppercase, lowercase, and number
    """
    user_id = uuid.UUID(current_user["user_id"])
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Verify current password
    if not verify_password(request.current_password, user.password_hash):
        raise PasswordValidationError("Current password is incorrect")

    # Validate new password strength
    if len(request.new_password) < 8:
        raise PasswordValidationError("Password must be at least 8 characters")

    if not re.search(r'[A-Z]', request.new_password):
        raise PasswordValidationError("Password must contain at least one uppercase letter")

    if not re.search(r'[a-z]', request.new_password):
        raise PasswordValidationError("Password must contain at least one lowercase letter")

    if not re.search(r'\d', request.new_password):
        raise PasswordValidationError("Password must contain at least one number")

    # Update password
    user.password_hash = get_password_hash(request.new_password)
    user.updated_at = datetime.utcnow()
    await db.commit()

    # TODO: Invalidate all other sessions for this user in production

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
