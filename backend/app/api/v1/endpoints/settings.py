"""
Settings API Endpoints

Handles user preferences, notification settings, laboratory defaults,
and appearance configuration.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
import uuid
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.preferences import UserPreference
from app.core.exceptions import ResourceNotFoundError

router = APIRouter()

class NotificationsUpdate(BaseModel):
    analysis_complete: bool
    boundary_alerts: bool
    weekly_summary: bool

class LaboratoryUpdate(BaseModel):
    lab_name: str
    default_media: str
    default_volume: float

class AppearanceUpdate(BaseModel):
    theme: str
    language: str


@router.get("/preferences")
async def get_preferences(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all user preferences and settings"""
    user_id = uuid.UUID(current_user["user_id"])
    
    result = await db.execute(select(UserPreference).where(UserPreference.user_id == user_id))
    prefs = result.scalar_one_or_none()
    
    if not prefs:
        # Create default preferences if not exists
        prefs = UserPreference(user_id=user_id)
        db.add(prefs)
        await db.commit()
        await db.refresh(prefs)
    
    return {
        "notifications": {
            "analysis_complete": prefs.notify_analysis_complete,
            "boundary_alerts": prefs.notify_boundary_alerts,
            "weekly_summary": prefs.notify_weekly_summary
        },
        "laboratory": {
            "lab_name": prefs.default_lab_name,
            "default_media": prefs.default_media_type,
            "default_volume": prefs.default_volume_ml
        },
        "appearance": {
            "theme": prefs.theme_preference,
            "language": prefs.language_preference
        },
        "updated_at": prefs.updated_at.isoformat()
    }


@router.put("/notifications")
async def update_notification_preferences(
    data: NotificationsUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update notification preferences"""
    user_id = uuid.UUID(current_user["user_id"])
    
    result = await db.execute(select(UserPreference).where(UserPreference.user_id == user_id))
    prefs = result.scalar_one_or_none()
    
    if not prefs:
        prefs = UserPreference(user_id=user_id)
        db.add(prefs)
    
    prefs.notify_analysis_complete = data.analysis_complete
    prefs.notify_boundary_alerts = data.boundary_alerts
    prefs.notify_weekly_summary = data.weekly_summary
    prefs.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(prefs)
    
    return {
        "message": "Notification preferences updated successfully",
        "preferences": {
            "analysis_complete": prefs.notify_analysis_complete,
            "boundary_alerts": prefs.notify_boundary_alerts,
            "weekly_summary": prefs.notify_weekly_summary
        }
    }


@router.put("/laboratory")
async def update_laboratory_defaults(
    data: LaboratoryUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update laboratory default configuration"""
    if data.default_volume <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Volume must be positive")
    
    user_id = uuid.UUID(current_user["user_id"])
    
    result = await db.execute(select(UserPreference).where(UserPreference.user_id == user_id))
    prefs = result.scalar_one_or_none()
    
    if not prefs:
        prefs = UserPreference(user_id=user_id)
        db.add(prefs)
    
    prefs.default_lab_name = data.lab_name
    prefs.default_media_type = data.default_media
    prefs.default_volume_ml = data.default_volume
    prefs.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(prefs)
    
    return {
        "message": "Laboratory configuration updated successfully",
        "configuration": {
            "lab_name": prefs.default_lab_name,
            "default_media": prefs.default_media_type,
            "default_volume": prefs.default_volume_ml
        }
    }


@router.put("/appearance")
async def update_appearance_preferences(
    data: AppearanceUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update appearance and language preferences"""
    valid_themes = ["light", "dark", "system"]
    if data.theme not in valid_themes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid theme. Must be one of: {valid_themes}"
        )
    
    user_id = uuid.UUID(current_user["user_id"])
    
    result = await db.execute(select(UserPreference).where(UserPreference.user_id == user_id))
    prefs = result.scalar_one_or_none()
    
    if not prefs:
        prefs = UserPreference(user_id=user_id)
        db.add(prefs)
    
    prefs.theme_preference = data.theme
    prefs.language_preference = data.language
    prefs.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(prefs)
    
    return {
        "message": "Appearance preferences updated successfully",
        "preferences": {
            "theme": prefs.theme_preference,
            "language": prefs.language_preference
        }
    }
