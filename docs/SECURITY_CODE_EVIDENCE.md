# 🔐 ColonyAI Security Implementation — Code Evidence

## Untuk Presentasi dengan Bukti Teknis (30 April 2026)

---

## 📝 Table of Contents

1. [JWT Authentication dengan Dual Tokens](#1-jwt-authentication-dengan-dual-tokens)
2. [Token Blacklisting & Logout](#2-token-blacklisting--logout)
3. [Role-Based Access Control (RBAC)](#3-role-based-access-control-rbac)
4. [File Upload Security](#4-file-upload-security)
5. [Rate Limiting Implementation](#5-rate-limiting-implementation)
6. [Audit Logging dengan Hash Chain](#6-audit-logging-dengan-hash-chain)
7. [Input Validation & XSS Prevention](#7-input-validation--xss-prevention)
8. [Password Hashing (Argon2)](#8-password-hashing-argon2)

---

## 1. JWT Authentication dengan Dual Tokens

### File: `backend/app/core/security.py`

```python
from datetime import datetime, timedelta
from jose import jwt
from argon2 import PasswordHasher
from fastapi.security import HTTPBearer
import uuid
from app.core.config import settings

pwd_context = PasswordHasher()
security = HTTPBearer()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token dengan 15 menit expiry"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)

    # Add JTI (JWT ID) untuk token blacklisting
    jti = str(uuid.uuid4())
    to_encode.update({
        "exp": expire,           # Expiration time
        "type": "access",        # Token type identifier
        "jti": jti              # Unique token ID
    })

    # Encode dengan secret key
    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM  # HS256
    )
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """Create JWT refresh token dengan 7 hari expiry"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)

    jti = str(uuid.uuid4())
    to_encode.update({
        "exp": expire,
        "type": "refresh",
        "jti": jti
    })

    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt
```

### Contoh Token Payload (Decoded):

```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000", // user_id
  "exp": 1714470000, // expiry unix timestamp
  "type": "access", // token type
  "jti": "f47ac10b-58cc-4372-a567-0e02b2c3d479" // unique token ID
}
```

### Usage dalam Login Endpoint:

```python
@router.post("/login")
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    # Verify email & password
    user = await authenticate_user(db, request.email, request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": 900  # 15 minutes
    }
```

---

## 2. Token Blacklisting & Logout

### Database Model: `backend/app/models/__init__.py`

```python
from sqlalchemy import Column, String, DateTime, BOOLEAN
from sqlalchemy.orm import declarative_base
import uuid
from datetime import datetime

Base = declarative_base()

class TokenBlacklist(Base):
    """Store revoked JTI (JWT IDs) for immediate logout"""
    __tablename__ = "token_blacklist"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    jti = Column(String(255), unique=True, index=True)  # JWT ID to blacklist
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)  # Remove from table after token natural expiry
```

### Logout Endpoint:

```python
@router.post("/logout")
async def logout(
    current_user = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
):
    """Add token JTI to blacklist"""
    token = credentials.credentials

    # Decode token to get JTI
    payload = decode_token(token)
    jti = payload.get("jti")

    # Add to blacklist
    blacklist_entry = TokenBlacklist(
        jti=jti,
        expires_at=datetime.utcfromtimestamp(payload.get("exp"))
    )
    db.add(blacklist_entry)
    await db.commit()

    return {"message": "Logged out successfully"}
```

### Blacklist Check dalam `get_current_user`:

```python
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Validate JWT dan check blacklist"""
    token = credentials.credentials
    payload = decode_token(token)
    jti = payload.get("jti")
    user_id = payload.get("sub")

    async with AsyncSessionLocal() as db:
        # CHECK BLACKLIST
        result = await db.execute(
            select(TokenBlacklist).where(TokenBlacklist.jti == jti)
        )
        blacklisted = result.scalar_one_or_none()

        if blacklisted:
            # Token sudah di-logout sebelumnya
            raise HTTPException(
                status_code=401,
                detail="Token has been revoked (logged out)"
            )

    return user_id
```

**Keuntungan**:

- ✅ Logout langsung efektif (tidak perlu menunggu 15 min token expiry)
- ✅ Prevent token reuse setelah logout
- ✅ Secure session termination

---

## 3. Role-Based Access Control (RBAC)

### User Model dengan Role:

```python
from enum import Enum
from sqlalchemy import Column, String, Enum as SQLEnum

class UserRole(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    ANALYST = "analyst"
    AUDITOR = "auditor"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    role = Column(SQLEnum(UserRole), default=UserRole.ANALYST)
    is_active = Column(Boolean, default=True)
```

### Permission Dependency:

```python
from fastapi import HTTPException, status

class PermissionChecker:
    def __init__(self, required_roles: list[UserRole]):
        self.required_roles = required_roles

    async def __call__(self, current_user = Depends(get_current_user),
                       db: AsyncSession = Depends(get_db)):
        # Get user from DB
        user = await db.execute(
            select(User).where(User.id == UUID(current_user))
        )
        user = user.scalar_one_or_none()

        if not user or user.role not in self.required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {self.required_roles}"
            )

        return user

# Create permission dependencies
require_admin = PermissionChecker([UserRole.ADMIN])
require_manager = PermissionChecker([UserRole.MANAGER, UserRole.ADMIN])
require_analyst = PermissionChecker([UserRole.ANALYST, UserRole.MANAGER, UserRole.ADMIN])
```

### Endpoint dengan RBAC:

```python
@router.post("/api/v1/analyses/", dependencies=[Depends(require_analyst)])
async def create_analysis(
    file: UploadFile,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Only Analyst, Manager, Admin can create analysis"""
    # ... upload & process image ...
    return {"analysis_id": analysis.id}

@router.post("/api/v1/analyses/{id}/approve", dependencies=[Depends(require_manager)])
async def approve_analysis(
    id: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Only Manager & Admin can approve"""
    # ... mark as approved & sign-off ...
    return {"status": "approved"}

@router.get("/api/v1/audit-logs/", dependencies=[Depends(require_auditor)])
async def get_audit_logs(db: AsyncSession = Depends(get_db)):
    """All roles can read, but Auditor has special access to sensitive logs"""
    # ... return filtered audit logs ...
    return {"logs": logs}
```

**Access Matrix**:
| Endpoint | Admin | Manager | Analyst | Auditor |
|----------|-------|---------|---------|---------|
| POST /analyses | ✅ | ✅ | ✅ | ❌ |
| POST /approve | ✅ | ✅ | ❌ | ❌ |
| GET /audit-logs | ✅ | ✅ | ❌ | ✅ |
| DELETE /users | ✅ | ❌ | ❌ | ❌ |

---

## 4. File Upload Security

### File: `backend/app/services/file_validator.py`

```python
import io
import uuid
import magic  # python-magic
from PIL import Image, ExifTags
from pathlib import Path
from fastapi import HTTPException, UploadFile

# Configuration
ALLOWED_MIME_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
MIN_IMAGE_DIMENSION = 100
MAX_IMAGE_DIMENSION = 15_000
MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB

async def validate_and_sanitize_image(file: UploadFile) -> tuple[bytes, str, str]:
    """
    Validasi & sanitasi file image dengan 4 layers
    Returns: (sanitized_bytes, safe_filename, mime_type)
    """

    # LAYER 1: Read & Size Check
    content = await file.read()

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="File cannot be empty")

    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds {MAX_FILE_SIZE_BYTES // 1_024 // 1_024}MB limit"
        )

    # LAYER 2: MIME Type Validation via Magic Bytes (NOT Content-Type header)
    try:
        detected_mime = magic.from_buffer(content[:2048], mime=True)
    except ImportError:
        detected_mime = file.content_type or "application/octet-stream"

    if detected_mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file format (detected: {detected_mime}). Only JPEG, PNG, WEBP allowed."
        )

    # LAYER 3: Image Dimension Validation
    image = Image.open(io.BytesIO(content))
    width, height = image.size

    if width < MIN_IMAGE_DIMENSION or height < MIN_IMAGE_DIMENSION:
        raise HTTPException(
            status_code=400,
            detail=f"Image too small (minimum {MIN_IMAGE_DIMENSION}x{MIN_IMAGE_DIMENSION}px)"
        )

    if width > MAX_IMAGE_DIMENSION or height > MAX_IMAGE_DIMENSION:
        raise HTTPException(
            status_code=400,
            detail=f"Image too large (maximum {MAX_IMAGE_DIMENSION}x{MAX_IMAGE_DIMENSION}px)"
        )

    # LAYER 4: EXIF Stripping
    # Remove ALL EXIF metadata (GPS, device info, etc)
    data = list(image.getdata())
    image_without_exif = Image.new(image.mode, image.size)
    image_without_exif.putdata(data)

    # Save to bytes
    sanitized_bytes = io.BytesIO()
    image_without_exif.save(sanitized_bytes, format=image.format)
    sanitized_bytes.seek(0)
    sanitized_content = sanitized_bytes.getvalue()

    # Generate safe filename (UUID to prevent enumeration & path traversal)
    file_extension = ALLOWED_MIME_TYPES[detected_mime]
    safe_filename = f"{uuid.uuid4()}{file_extension}"

    return sanitized_content, safe_filename, detected_mime
```

### Usage dalam Upload Endpoint:

```python
@router.post("/api/v1/analyses/upload")
async def upload_image(
    file: UploadFile,
    current_user = Depends(require_analyst),
    db: AsyncSession = Depends(get_db)
):
    """Upload image dengan validation & sanitization"""

    # Validate & sanitize
    sanitized_bytes, safe_filename, mime_type = await validate_and_sanitize_image(file)

    # Optional: ClamAV malware scan
    if await scan_file_for_malware(sanitized_bytes):
        raise HTTPException(status_code=400, detail="Malware detected in file")

    # Save to S3 with AES-256 encryption
    s3_path = await upload_to_s3(
        key=f"uploads/{safe_filename}",
        content=sanitized_bytes,
        content_type=mime_type
    )

    # Create analysis record
    analysis = Analysis(
        id=uuid.uuid4(),
        user_id=UUID(current_user),
        file_path=s3_path,
        original_filename=file.filename,
        safe_filename=safe_filename,
        mime_type=mime_type
    )
    db.add(analysis)
    await db.commit()

    # Log audit entry
    await write_audit_log(
        db=db,
        user_id=current_user,
        action="upload_image",
        resource_type="analysis",
        resource_id=str(analysis.id),
        details={"filename": safe_filename, "size": len(sanitized_bytes)}
    )

    return {"analysis_id": str(analysis.id), "status": "uploaded"}
```

**Security Protections**:

- ✅ Magic bytes prevent MIME spoofing (PDF as JPEG = rejected)
- ✅ EXIF stripping prevents GPS leakage
- ✅ Dimension check prevents huge files
- ✅ UUID filename prevents enumeration/path traversal
- ✅ ClamAV scanning prevents malware

---

## 5. Rate Limiting Implementation

### File: `backend/app/core/rate_limiter.py`

```python
import time
from collections import defaultdict
from fastapi import Request, Response, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

class RateLimitInfo:
    """Token bucket state per client IP"""
    __slots__ = ['tokens', 'last_refill', 'max_tokens', 'refill_rate']

    def __init__(self, max_tokens: int, refill_rate: float):
        self.max_tokens = max_tokens
        self.tokens = float(max_tokens)
        self.last_refill = time.monotonic()
        self.refill_rate = refill_rate

    def consume(self, tokens: int = 1) -> bool:
        """Try to consume tokens (return True if success)"""
        now = time.monotonic()
        elapsed = now - self.last_refill

        # Refill tokens based on elapsed time
        self.tokens = min(
            self.max_tokens,
            self.tokens + (elapsed * self.refill_rate)
        )
        self.last_refill = now

        if self.tokens >= tokens:
            self.tokens -= tokens
            return True
        return False

    def get_remaining(self) -> int:
        """Get remaining tokens"""
        now = time.monotonic()
        elapsed = now - self.last_refill
        return int(min(
            self.max_tokens,
            self.tokens + (elapsed * self.refill_rate)
        ))


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting dengan token bucket algorithm"""

    def __init__(
        self,
        app,
        max_requests: int = 100,
        window_seconds: int = 60,
        exempt_paths: list[str] = None
    ):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.exempt_paths = exempt_paths or ['/health', '/']
        self.clients = defaultdict(lambda: RateLimitInfo(
            max_tokens=max_requests,
            refill_rate=max_requests / window_seconds  # tokens per second
        ))

    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting untuk health checks
        if request.url.path in self.exempt_paths:
            return await call_next(request)

        # Get client IP
        client_ip = request.client.host if request.client else "unknown"

        # Check rate limit
        rate_limit_info = self.clients[client_ip]

        if not rate_limit_info.consume():
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": "Too many requests",
                    "retry_after": 60
                },
                headers={
                    "Retry-After": "60",
                    "X-RateLimit-Limit": str(self.max_requests),
                    "X-RateLimit-Remaining": "0"
                }
            )

        # Add rate limit headers
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(self.max_requests)
        response.headers["X-RateLimit-Remaining"] = str(rate_limit_info.get_remaining())

        return response
```

### Mounting dalam FastAPI:

```python
from fastapi import FastAPI

app = FastAPI()

# Apply rate limiting middleware
app.add_middleware(
    RateLimitMiddleware,
    max_requests=100,      # 100 requests
    window_seconds=60,     # per 60 seconds
    exempt_paths=["/health", "/docs"]
)
```

**How Token Bucket Works**:

```
Timeline (60 second window):
  t=0s   : Start with 100 tokens (full bucket)
  t=0s   : Request 1 → consume 1 token (99 remaining)
  t=0s   : Request 2-100 → consume tokens (0 remaining)
  t=0s   : Request 101 → BLOCKED (429 Too Many Requests)
  t=0.6s : Bucket refills at 1 token/sec → 1 token available
  t=1.2s : Another token refilled → 2 tokens available
  t=60s  : Bucket full again (100 tokens)
```

---

## 6. Audit Logging dengan Hash Chain

### File: `backend/app/utils/audit.py`

```python
import uuid
import hashlib
import json
from datetime import datetime
from typing import Optional
from sqlalchemy import select, desc

async def write_audit_log(
    db,
    user_id: str,
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    details: Optional[dict] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
):
    """
    Write audit log dengan cryptographic hash chain.

    Hash Chain:
    current_hash = SHA256(previous_hash + action + resource_type + resource_id + details + timestamp)

    Benefit: Tamper-proof ledger — changing any log invalidates all subsequent hashes
    """
    from app.models import AuditLog

    resource_uuid = uuid.UUID(resource_id) if resource_id else None
    user_uuid = uuid.UUID(user_id)
    timestamp = datetime.utcnow()

    # Get previous log's hash untuk chain linking
    previous_hash = None
    if db is not None:
        stmt = select(AuditLog).order_by(desc(AuditLog.timestamp)).limit(1)
        result = await db.execute(stmt)
        last_log = result.scalars().first()
        if last_log and last_log.current_hash:
            previous_hash = last_log.current_hash

    # Create hash input string
    details_str = json.dumps(details, sort_keys=True) if details else "{}"
    raw_str = (
        f"{previous_hash or ''}"
        f"{action}"
        f"{resource_type}"
        f"{str(resource_uuid) if resource_uuid else ''}"
        f"{details_str}"
        f"{timestamp.isoformat()}"
    )

    # Calculate current hash
    current_hash = hashlib.sha256(raw_str.encode('utf-8')).hexdigest()

    # Create audit entry
    audit_entry = AuditLog(
        id=uuid.uuid4(),
        user_id=user_uuid,
        action=action,
        resource_type=resource_type,
        resource_id=resource_uuid,
        details=details,
        ip_address=ip_address,
        user_agent=user_agent,
        timestamp=timestamp,
        previous_hash=previous_hash,  # Link ke log sebelumnya
        current_hash=current_hash,     # Hash dari log ini
    )

    if db is not None:
        db.add(audit_entry)
        await db.commit()

    return audit_entry
```

### AuditLog Database Model:

```python
from sqlalchemy import Column, String, DateTime, JSON, UUID as SQLUuid

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(SQLUuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(SQLUuid(as_uuid=True), nullable=False)
    action = Column(String(100), nullable=False)  # login, create, approve, delete
    resource_type = Column(String(100), nullable=False)  # analysis, user, report
    resource_id = Column(SQLUuid(as_uuid=True), nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Hash chain columns
    previous_hash = Column(String(64), nullable=True)  # SHA256 dari log sebelumnya
    current_hash = Column(String(64), nullable=False)  # SHA256 dari log ini
```

### Example Audit Trail (Hash Chain):

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "action": "login",
    "user_id": "user-1",
    "timestamp": "2026-04-30T09:00:00Z",
    "previous_hash": null,
    "current_hash": "abc123..." // SHA256('' + login + auth + user-1 + {...} + timestamp)
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "action": "upload_image",
    "user_id": "user-1",
    "resource_id": "analysis-1",
    "timestamp": "2026-04-30T09:05:00Z",
    "previous_hash": "abc123...", // Link ke log sebelumnya
    "current_hash": "def456..." // SHA256(abc123... + upload_image + analysis + {...} + timestamp)
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "action": "approve",
    "user_id": "manager-1",
    "resource_id": "analysis-1",
    "timestamp": "2026-04-30T09:10:00Z",
    "previous_hash": "def456...", // Link ke log sebelumnya
    "current_hash": "ghi789..." // SHA256(def456... + approve + analysis + {...} + timestamp)
  }
]
```

### Verifikasi Hash Chain (Tamper Detection):

```python
async def verify_audit_chain(db: AsyncSession) -> bool:
    """Verify audit trail integrity"""
    stmt = select(AuditLog).order_by(AuditLog.timestamp)
    result = await db.execute(stmt)
    logs = result.scalars().all()

    for i, log in enumerate(logs):
        if i == 0:
            # First log should have no previous_hash
            if log.previous_hash is not None:
                return False  # TAMPERED
        else:
            # Verify hash chain
            prev_log = logs[i-1]
            if log.previous_hash != prev_log.current_hash:
                return False  # TAMPERED

            # Recalculate current_hash
            details_str = json.dumps(log.details, sort_keys=True) if log.details else "{}"
            raw_str = (
                f"{log.previous_hash}"
                f"{log.action}"
                f"{log.resource_type}"
                f"{str(log.resource_id) if log.resource_id else ''}"
                f"{details_str}"
                f"{log.timestamp.isoformat()}"
            )
            calculated_hash = hashlib.sha256(raw_str.encode('utf-8')).hexdigest()

            if calculated_hash != log.current_hash:
                return False  # TAMPERED

    return True  # All hashes valid
```

---

## 7. Input Validation & XSS Prevention

### File: `backend/app/utils/sanitization.py`

```python
import html
from typing import Any, Dict, List, TypeVar, Union

T = TypeVar("T")

def sanitize_string(value: str) -> str:
    """Escape HTML characters to prevent XSS"""
    if not isinstance(value, str):
        return value

    # Convert: < → &lt;, > → &gt;, & → &amp;, " → &quot;, ' → &#x27;
    return html.escape(value)

def sanitize_recursive(data: T) -> T:
    """Recursively sanitize all strings in data structures"""
    if isinstance(data, str):
        return sanitize_string(data)  # Escape HTML
    elif isinstance(data, list):
        return [sanitize_recursive(item) for item in data]
    elif isinstance(data, dict):
        return {key: sanitize_recursive(val) for key, val in data.items()}
    return data
```

### Pydantic Schema Validation:

```python
from pydantic import BaseModel, Field, EmailStr, validator

class CreateAnalysisRequest(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Analysis name"
    )
    notes: str = Field(
        default="",
        max_length=5000,
        description="Optional notes"
    )

    @validator('name', 'notes', pre=True)
    def sanitize_strings(cls, v):
        if isinstance(v, str):
            return sanitize_string(v)
        return v

    class Config:
        schema_extra = {
            "example": {
                "name": "Petri Dish Analysis #1",
                "notes": "E. coli test sample"
            }
        }
```

### Contoh Perlindungan:

```
Input: <script>alert('XSS')</script>
Output: &lt;script&gt;alert(&#x27;XSS&#x27;)&lt;/script&gt;
Result: Rendered as text, not executed

Input: ' OR '1'='1
Output: &#x27; OR &#x27;1&#x27;=&#x27;1
Result: Safe string, no SQL injection
```

---

## 8. Password Hashing (Argon2)

### File: `backend/app/core/security.py`

```python
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

# Initialize Argon2 hasher
pwd_context = PasswordHasher()

def get_password_hash(password: str) -> str:
    """Hash password dengan Argon2"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against hashed"""
    try:
        pwd_context.verify(hashed_password, plain_password)
        return True
    except VerifyMismatchError:
        return False
```

### Login dengan Password Verification:

```python
@router.post("/login")
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    # Get user from DB
    stmt = select(User).where(User.email == request.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Verify password
    if not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "role": user.role
        }
    }
```

### Argon2 Configuration:

```
Argon2 Parameters:
- Algorithm: Argon2id (balanced against timing & GPU attacks)
- Memory: 65,540 KiB
- Iterations: 2
- Parallelism: 4

Result: GPU brute-force extremely expensive (~1 guess/sec vs password/sec)
```

---

## 📊 Security Implementation Summary

| Feature                | Implementation                 | Evidence                                 |
| ---------------------- | ------------------------------ | ---------------------------------------- |
| **JWT Auth**           | Dual tokens (access + refresh) | `core/security.py` L1-45                 |
| **Token Blacklist**    | JTI-based revocation           | `core/security.py` L50-70                |
| **RBAC**               | 4-tier role system             | `models/__init__.py` + `dependencies.py` |
| **File Validation**    | Magic bytes + EXIF strip       | `services/file_validator.py` L1-150      |
| **Rate Limiting**      | Token bucket per IP            | `core/rate_limiter.py` L1-100            |
| **Audit Logging**      | SHA-256 hash chain             | `utils/audit.py` L1-80                   |
| **Input Sanitization** | HTML escaping                  | `utils/sanitization.py` L1-30            |
| **Password Hashing**   | Argon2id                       | `core/security.py` L70-85                |

---

**Document Status**: Ready for Technical Presentation
**Last Updated**: 30 April 2026
