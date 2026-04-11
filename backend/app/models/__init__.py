from datetime import datetime
from typing import Optional
from sqlalchemy import Column, String, DateTime, Enum as SAEnum, Float, Integer, Text, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.orm import relationship
import enum
import uuid

from app.core.database import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    ANALYST = "analyst"
    VIEWER = "viewer"


class AnalysisStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), nullable=False, default=UserRole.ANALYST)
    laboratory_id = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    analyses = relationship("Analysis", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    sample_id = Column(String(255), nullable=False)
    media_type = Column(String(100), nullable=False)
    dilution_factor = Column(Float, nullable=False, default=1.0)
    plated_volume_ml = Column(Float, nullable=False, default=1.0)

    original_image_url = Column(Text, nullable=True)
    annotated_image_url = Column(Text, nullable=True)

    colony_count = Column(Integer, nullable=True)
    cfu_per_ml = Column(Float, nullable=True)
    confidence_score = Column(Float, nullable=True)
    reliability = Column(String(20), nullable=True, default="high")  # high, medium, low

    status = Column(SAEnum(AnalysisStatus), nullable=False, default=AnalysisStatus.PENDING)
    error_message = Column(Text, nullable=True)
    warnings = Column(JSON, nullable=True)  # List of warning messages
    class_breakdown = Column(JSON, nullable=True)  # {class_name: count}

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="analyses")
    detections = relationship("ColonyDetection", back_populates="analysis", cascade="all, delete-orphan")


class ColonyDetection(Base):
    __tablename__ = "colony_detections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analysis_id = Column(UUID(as_uuid=True), ForeignKey("analyses.id"), nullable=False)

    class_name = Column(String(50), nullable=False)  # colony_single, colony_merged, bubble, dust_debris, media_crack
    confidence = Column(Float, nullable=False)

    bbox_x = Column(Integer, nullable=False)
    bbox_y = Column(Integer, nullable=False)
    bbox_width = Column(Integer, nullable=False)
    bbox_height = Column(Integer, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    analysis = relationship("Analysis", back_populates="detections")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    action = Column(String(255), nullable=False)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(UUID(as_uuid=True), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)

    user = relationship("User", back_populates="audit_logs")
