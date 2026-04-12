from datetime import datetime
from typing import Optional
from sqlalchemy import Column, String, DateTime, Enum as SAEnum, Float, Integer, Text, ForeignKey, JSON, Uuid
from sqlalchemy.orm import relationship
import enum
import uuid

from app.core.database import Base
import sqlalchemy.types as types

class GUID(types.TypeDecorator):
    """Platform-independent GUID type.
    Uses PostgreSQL's UUID type, otherwise uses CHAR(36), storing as string.
    """
    impl = types.CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            from sqlalchemy.dialects.postgresql import UUID
            return dialect.type_descriptor(UUID())
        else:
            return dialect.type_descriptor(types.CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return str(value)
        else:
            if not isinstance(value, uuid.UUID):
                return str(uuid.UUID(value))
            else:
                return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                return uuid.UUID(value)
            else:
                return value

class UserRole(str, enum.Enum):
    """
    6-role RBAC sesuai ISO 17025 Cl. 5.2 (pemisahan tanggungjawab):
    - analyst: upload + submit
    - senior_analyst: approve + override AI
    - lab_manager: manage lab + set threshold
    - quality_officer: audit trail + export
    - system_admin: model management + cross-lab
    - auditor: read-only cross-lab
    """
    ANALYST = "analyst"
    SENIOR_ANALYST = "senior_analyst"
    LAB_MANAGER = "lab_manager"
    QUALITY_OFFICER = "quality_officer"
    SYSTEM_ADMIN = "system_admin"
    AUDITOR = "auditor"


class AnalysisStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class User(Base):
    __tablename__ = "users"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), nullable=False, default=UserRole.ANALYST)
    laboratory_id = Column(GUID(), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    analyses = relationship("Analysis", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    version_id = Column(Integer, nullable=False, default=1)

    __mapper_args__ = {
        "version_id_col": version_id
    }
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
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

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    analysis_id = Column(GUID(), ForeignKey("analyses.id"), nullable=False)

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

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    action = Column(String(255), nullable=False)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(GUID(), nullable=True)
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)

    previous_hash = Column(String(64), nullable=True)  # SHA-256 is 64 chars
    current_hash = Column(String(64), nullable=False)

    user = relationship("User", back_populates="audit_logs")


class SimulatorComparison(Base):
    """
    BUG-014: Manual vs AI comparison for benchmarking.
    Stored in database (not localStorage) for audit trail and variability analysis.
    """
    __tablename__ = "simulator_comparisons"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    analysis_id = Column(GUID(), ForeignKey("analyses.id"), nullable=False)

    # AI counts per class
    ai_class_breakdown = Column(JSON, nullable=False)  # {class_name: count}
    ai_total_valid = Column(Integer, nullable=False)

    # Manual counts per class (entered by analyst)
    manual_colony_single = Column(Integer, nullable=False, default=0)
    manual_colony_merged = Column(Integer, nullable=False, default=0)
    manual_bubble = Column(Integer, nullable=False, default=0)
    manual_dust_debris = Column(Integer, nullable=False, default=0)
    manual_media_crack = Column(Integer, nullable=False, default=0)
    manual_total_valid = Column(Integer, nullable=False)

    # Calculated agreement percentages
    agreement_single = Column(Float, nullable=True)
    agreement_merged = Column(Integer, nullable=True)
    agreement_bubble = Column(Float, nullable=True)
    agreement_dust_debris = Column(Float, nullable=True)
    agreement_media_crack = Column(Float, nullable=True)
    overall_accuracy = Column(Float, nullable=True)

    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User")
    analysis = relationship("Analysis")
