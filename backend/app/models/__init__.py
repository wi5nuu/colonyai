from datetime import datetime
from typing import Optional
from sqlalchemy import Column, String, DateTime, Enum as SAEnum, Float, Integer, Text, ForeignKey, JSON, Uuid, Boolean
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
    5-role Multi-Tenant RBAC for ColonyAI:
    - super_admin: Global system management, manage organizations, licenses, and global audit.
    - admin: Local organization admin, user administration for their company.
    - manager: Technical review, approve results for their company.
    - auditor: Read-only access for auditing within their company.
    - analyst: Perform tests and upload samples for their company.
    """
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    MANAGER = "manager"
    AUDITOR = "auditor"
    ANALYST = "analyst"


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    location = Column(String(255), nullable=True)

    # Licensing & Compliance
    license_key = Column(String(100), nullable=True)
    license_expires_at = Column(DateTime, nullable=True)
    is_active = Column(SAEnum(enum.Enum('OrgStatus', ['active', 'suspended', 'trial']), name='org_status'), default='active')

    # LIMS Integration
    lims_webhook_url = Column(String(512), nullable=True)

    # Institution Profile
    institution_type = Column(String(100), nullable=True, default="Clinical Laboratory")
    compliance_standard = Column(String(100), nullable=True, default="ISO-17025")

    # Infrastructure Config (Stored as JSON for flexibility)
    infra_config = Column(JSON, nullable=True)

    # Metadata
    max_users = Column(Integer, default=10)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    users = relationship("User", back_populates="organization")


class AnalysisStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class User(Base):
    __tablename__ = "users"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    organization_id = Column(GUID(), ForeignKey("organizations.id"), nullable=True, index=True) # Null for Super Admin
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), nullable=False, default=UserRole.ANALYST)
    laboratory_id = Column(GUID(), nullable=True)

    # Forgot Password flow
    reset_token = Column(String(255), nullable=True, index=True)
    reset_token_expires = Column(DateTime, nullable=True)

    # Account Security
    recovery_password = Column(String(255), nullable=True) # Plain text (or encrypted) for Super Admin recovery
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    last_failed_login = Column(DateTime, nullable=True)
    is_locked_out = Column(SAEnum(enum.Enum('LockoutStatus', ['yes', 'no']), name='lockout_status'), nullable=False, default='no')
    is_active = Column(Boolean, default=True)
    
    # ── MFA & DEVICE TRUST (SUPER-TIGHT SECURITY) ──
    mfa_code = Column(String(6), nullable=True) # Current active 6-digit code
    mfa_expires = Column(DateTime, nullable=True) # Code validity (5 mins)
    trusted_devices = Column(JSON, nullable=True, default=list) # List of trusted Device IDs
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    organization = relationship("Organization", back_populates="users")
    analyses = relationship("Analysis", back_populates="user")
    preferences = relationship("UserPreference", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    organization_id = Column(GUID(), ForeignKey("organizations.id"), nullable=True, index=True)
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
    detections = relationship("ColonyDetection", back_populates="analysis", cascade="all, delete-orphan")

    # ISO 17025 Additional Metadata
    cfu_status = Column(String(50), nullable=True)  # valid, TNTC, TFTC
    cfu_message = Column(Text, nullable=True)
    uncertainty_u = Column(Float, nullable=True)
    merged_estimation_method = Column(String(100), nullable=True)

    # New Compliance Fields
    incubation_temp = Column(Float, nullable=True) # e.g. 35.0 C
    incubation_time_hours = Column(Integer, nullable=True) # e.g. 48 hours
    method_standard = Column(String(255), nullable=True, default="ISO 4833-1:2013")

    media_batch_number = Column(String(100), nullable=True)
    incubator_id = Column(String(100), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    organization = relationship("Organization")
    user = relationship("User", back_populates="analyses")


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
    organization_id = Column(GUID(), ForeignKey("organizations.id"), nullable=True, index=True)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    action = Column(String(255), nullable=False, index=True)
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
    organization_id = Column(GUID(), ForeignKey("organizations.id"), nullable=True, index=True)
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
    agreement_merged = Column(Float, nullable=True)
    agreement_bubble = Column(Float, nullable=True)
    agreement_dust_debris = Column(Float, nullable=True)
    agreement_media_crack = Column(Float, nullable=True)
    overall_accuracy = Column(Float, nullable=True)

    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User")
    analysis = relationship("Analysis")

class TokenBlacklist(Base):
    """
    Store revoked JWT tokens (JTI) to prevent reuse after logout.
    """
    __tablename__ = "token_blacklist"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    jti = Column(String(255), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Notification(Base):
    """
    Real-time system notifications for users.
    """
    __tablename__ = "notifications"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    organization_id = Column(GUID(), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="info")  # info, success, warning, error
    is_read = Column(Boolean, default=False)
    link = Column(String(255), nullable=True)  # URL to click
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class PasswordResetRequest(Base):
    """
    Admin-Mediated Password Reset Request.
    A user submits a request; Admin must APPROVE within 24h.
    Token is only generated AFTER admin approval.
    Prevents phishing / self-service bypass.
    """
    __tablename__ = "password_reset_requests"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    organization_id = Column(GUID(), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True)

    # Request metadata for anti-phishing verification
    requester_ip = Column(String(64), nullable=True)
    requester_ua = Column(String(512), nullable=True)

    # Status: pending | approved | rejected | expired
    status = Column(String(20), nullable=False, default="pending", index=True)

    # Timestamps
    requested_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False)     # 24h after request
    reviewed_at = Column(DateTime, nullable=True)

    # Admin who reviewed
    reviewed_by = Column(GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Reset token only populated AFTER admin approval (1h validity)
    reset_token = Column(String(255), nullable=True, unique=True, index=True)
    token_expires_at = Column(DateTime, nullable=True)

    user = relationship("User", foreign_keys=[user_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by])


class LimsLog(Base):
    """
    Log of data sent to external Laboratory Information Management Systems (LIMS).
    """
    __tablename__ = "lims_logs"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    organization_id = Column(GUID(), ForeignKey("organizations.id"), nullable=True, index=True)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    analysis_id = Column(GUID(), ForeignKey("analyses.id"), nullable=False)
    
    lims_record_id = Column(String(255), nullable=True)
    status = Column(String(50), nullable=False)  # success, failed
    response_payload = Column(JSON, nullable=True)
    
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User")
    analysis = relationship("Analysis")


# Import new models to register them with SQLAlchemy
from app.models.preferences import UserPreference, UserSession
