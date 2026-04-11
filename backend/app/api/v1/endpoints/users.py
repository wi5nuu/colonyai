from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.security import get_current_user, require_role
from app.core.database import get_db
from app.models import User
from app.utils.audit import write_audit_log

router = APIRouter()


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

    # Update fields
    if request.full_name is not None:
        user.full_name = request.full_name

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
    skip: int = 0,
    limit: int = 20,
    http_request: Request = None,
    current_user: dict = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    """List all users (admin only)"""
    # Audit log: user list accessed
    ip = http_request.client.host if http_request else None
    ua = http_request.headers.get("user-agent") if http_request else None
    await write_audit_log(
        db, current_user["user_id"], "list_users", "user",
        None, details={"skip": skip, "limit": limit},
        ip_address=ip, user_agent=ua,
    )

    result = await db.execute(
        select(User)
        .offset(skip)
        .limit(limit)
        .order_by(User.created_at.desc())
    )
    users = result.scalars().all()

    return [
        UserBriefResponse(
            id=str(u.id),
            email=u.email,
            full_name=u.full_name,
            role=u.role.value if hasattr(u.role, 'value') else str(u.role),
        )
        for u in users
    ]
