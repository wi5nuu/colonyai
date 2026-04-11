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


@router.post("/login", response_model=TokenResponse)
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

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/register", response_model=TokenResponse)
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
        "token_type": "bearer"
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
