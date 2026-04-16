"""
User Preferences & Session Models

Stores user-specific settings, notification preferences,
laboratory defaults, and active session tracking.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Boolean, Float, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class UserPreference(Base):
    """Stores user preferences, notification settings, and lab defaults"""
    __tablename__ = "user_preferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)

    # Notification Preferences
    notify_analysis_complete = Column(Boolean, default=True, nullable=False)
    notify_boundary_alerts = Column(Boolean, default=True, nullable=False)  # TNTC/TFTC
    notify_weekly_summary = Column(Boolean, default=False, nullable=False)

    # Laboratory Defaults
    default_lab_name = Column(String(200), default="ColonyAI Laboratory", nullable=False)
    default_media_type = Column(String(50), default="Plate Count Agar", nullable=False)
    default_volume_ml = Column(Float, default=1.0, nullable=False)

    # Appearance & Localization
    theme_preference = Column(String(20), default="system", nullable=False)
    language_preference = Column(String(10), default="en", nullable=False)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="preferences")


class UserSession(Base):
    """Tracks active user sessions for security & device management"""
    __tablename__ = "user_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    
    token_hash = Column(String(128), unique=True, index=True, nullable=False)
    device_info = Column(String(200))
    ip_address = Column(String(45))
    user_agent = Column(Text)
    
    is_active = Column(Boolean, default=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    last_accessed = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="sessions")
