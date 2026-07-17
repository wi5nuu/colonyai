# ColonyAI Security Architecture and Implementation

> Defense-in-depth security architecture with Zero-Trust principles.  
> **Version:** 2.0-production | **Last Updated:** July 2026  
> **Applicable Standards:** OWASP Top 10, ISO/IEC 27001, ISO 17025 Section 7.11

---

## Executive Summary

ColonyAI implements a defense-in-depth security architecture comprising ten distinct security layers following the Zero-Trust principle. Every authenticated request is validated at the perimeter, the application layer, and the data layer before resources are granted. All security controls have been verified through automated static analysis (Bandit, npm audit) and manual penetration testing.

---

## Security Architecture Overview

```
 CLIENT BROWSER
 (Vercel Edge Network)
        |
        | HTTPS / TLS 1.3
        v
 FASTAPI BACKEND
 +-------------------------------------------------+
 |  CORS Middleware        (origin whitelist)       |
 |  Rate Limiter           (100 req/min per IP)     |
 |  JWT Auth Middleware    (signature + blacklist)   |
 |  RBAC Middleware        (role-based access)       |
 +-------------------------------------------------+
 |  API ENDPOINTS v1                                |
 |  - File upload    -> MIME + EXIF + size + AV     |
 |  - Analysis       -> Pydantic input validation   |
 |  - Report export  -> Audit log (hash chain)      |
 |  - User mgmt      -> Argon2 hashing              |
 +-------------------------------------------------+
 |  DATA LAYER (SQLAlchemy ORM)                     |
 |  - Parameterized queries (SQL injection safe)    |
 |  - Encrypted TLS connections                     |
 |  - Cryptographic audit log (SHA-256 chain)       |
 +-------------------------------------------------+
        |
   +---------+---------+---------+
   |         |         |         |
 PostgreSQL  AWS S3  ClamAV   Argon2
(Encrypted) (AES-256) (Malware) (Hashing)
```

---

## 1. Authentication and Token Management

**Implementation:** `backend/app/core/security.py`

ColonyAI uses JSON Web Tokens (JWT) with a dual-token system:

| Token Type | Lifetime | Purpose | Storage |
|------------|----------|---------|---------|
| Access Token | 15 minutes | Authorizes individual API requests | Memory (client) |
| Refresh Token | 7 days | Generates new access tokens silently | HTTP-only cookie |

**Password Hashing:** Argon2id (winner of 2015 Password Hashing Competition). Resistant to GPU-based brute-force attacks due to configurable memory and computation cost.

```python
from argon2 import PasswordHasher
pwd_context = PasswordHasher()

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    jti = str(uuid.uuid4())  # Unique token ID for blacklisting
    to_encode.update({"exp": expire, "type": "access", "jti": jti})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt
```

**Threat Mitigated:** Credential theft, rainbow-table attacks, token forgery.

---

## 2. Role-Based Access Control (RBAC)

**Implementation:** `backend/app/core/security.py`, `backend/app/api/v1/endpoints/`

Four-tier permission model enforced via FastAPI dependency injection:

| Role | Access Level | Key Permissions |
|------|--------------|-----------------|
| System Admin | Full | User provisioning, system configuration, node governance |
| Lab Manager | Management | Result verification, final sign-off, report generation |
| Lab Analyst | Limited | Image upload, AI analysis execution, data entry |
| Quality Auditor | Read-Only | Immutable audit trail access, cryptographic verification |

Every API endpoint declares its minimum required role. Access denials are recorded in the cryptographic audit log.

**Threat Mitigated:** Privilege escalation, unauthorized data access, insider threats.

---

## 3. Token Blacklisting and Session Revocation

**Implementation:** `backend/app/core/security.py`

Each JWT carries a unique `jti` (JWT ID) claim. Upon logout, the `jti` is inserted into a persistent `TokenBlacklist` table in PostgreSQL. Every protected endpoint verifies the `jti` is not blacklisted.

```python
async def get_current_user(credentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    jti = payload.get("jti")
    result = await db.execute(
        select(TokenBlacklist).where(TokenBlacklist.jti == jti)
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=401, detail="Token has been revoked.")
```

**Threat Mitigated:** Session hijacking after logout, credential reuse from intercepted tokens.

---

## 4. File Upload Security and Malware Protection

**Implementation:** `backend/app/services/image_processor.py`, `backend/app/utils/file_validator.py`

File uploads undergo four sequential validation steps:

### Layer 1: Magic Bytes MIME Validation
MIME type is read from binary header using `python-magic`, bypassing the spoofable HTTP `Content-Type` header.

```python
import magic
detected_mime = magic.from_buffer(content[:2048], mime=True)
ALLOWED_MIME_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
if detected_mime not in ALLOWED_MIME_TYPES:
    raise HTTPException(status_code=400, detail="Unsupported or disguised file type.")
```

### Layer 2: EXIF Metadata Stripping
All EXIF metadata (GPS location, device info) is removed before storage.

```python
from PIL import Image
image = Image.open(io.BytesIO(content))
data = list(image.getdata())
image_without_exif = Image.new(image.mode, image.size)
image_without_exif.putdata(data)
```

### Layer 3: Dimension and Size Validation
```
MIN_IMAGE_DIMENSION = 100 pixels
MAX_IMAGE_DIMENSION = 15,000 pixels
MAX_FILE_SIZE = 15 MB
```

### Layer 4: ClamAV Malware Scanning
Files scanned by ClamAV daemon before committing to object storage. Fail-open with warning log if AV unavailable.

**Threat Mitigated:** MIME spoofing, malware upload, laboratory IP disclosure, denial-of-service.

---

## 5. Rate Limiting and DDoS Mitigation

**Implementation:** `backend/app/core/rate_limiter.py`

Token Bucket algorithm at middleware layer:

| Scope | Limit | Burst |
|-------|-------|-------|
| Per IP Address | 100 req/min | 20 burst |
| Per Authenticated User | 1000 req/hr | 100 burst |

```python
class RateLimitInfo:
    def __init__(self, max_tokens: int, refill_rate: float):
        self.max_tokens = max_tokens
        self.tokens = float(max_tokens)
        self.refill_rate = refill_rate

    def consume(self, tokens: int = 1) -> bool:
        elapsed = now - self.last_refill
        self.tokens = min(self.max_tokens, self.tokens + (elapsed * self.refill_rate))
        if self.tokens >= tokens:
            self.tokens -= tokens
            return True
        return False
```

Exceeded requests receive HTTP 429 with `Retry-After` header.

**Threat Mitigated:** Brute-force login, credential stuffing, API abuse, DDoS.

---

## 6. Input Validation and XSS Prevention

**Implementation:** `backend/app/schemas/`, `backend/app/utils/sanitization.py`

All request bodies validated against strict Pydantic schemas before reaching business logic. String data is HTML-escaped in responses.

```python
import html

def sanitize_string(value: str) -> str:
    return html.escape(value)

def sanitize_recursive(data):
    if isinstance(data, str):
        return sanitize_string(data)
    elif isinstance(data, list):
        return [sanitize_recursive(item) for item in data]
    elif isinstance(data, dict):
        return {key: sanitize_recursive(val) for key, val in data.items()}
```

**Threat Mitigated:** Cross-Site Scripting (XSS), command injection, type confusion.

---

## 7. Database Security and SQL Injection Prevention

**Implementation:** `backend/app/models/`, `backend/app/db/`

All database interactions use SQLAlchemy ORM with parameterized queries. Raw SQL construction is prohibited.

```python
# Secure: SQLAlchemy ORM with parameterized queries
stmt = select(User).where(User.email == email)
result = await db.execute(stmt)

# Vulnerable (NOT used in ColonyAI):
# query = f"SELECT * FROM users WHERE email = '{email}'"
```

- TLS-encrypted database connections
- Minimum-privilege database user (no DDL rights in production)
- Connection pooling with PgBouncer

**Threat Mitigated:** SQL injection, unauthorized schema modification.

---

## 8. Cryptographic Audit Logging (Immutable Ledger)

**Implementation:** `backend/app/utils/audit.py`

Every significant system action produces an entry in the `AuditLog` table. Entries are cryptographically linked using SHA-256 hash chaining.

```python
async def write_audit_log(db, user_id, action, resource_type, resource_id, details):
    last_log = await db.execute(
        select(AuditLog).order_by(desc(AuditLog.timestamp)).limit(1)
    )
    previous_hash = last_log.current_hash if last_log else None

    raw_str = f"{previous_hash or ''}{action}{resource_type}{resource_id}{details}{timestamp}"
    current_hash = hashlib.sha256(raw_str.encode('utf-8')).hexdigest()

    audit_entry = AuditLog(
        id=uuid.uuid4(), user_id=user_uuid, action=action,
        resource_type=resource_type, previous_hash=previous_hash,
        current_hash=current_hash, timestamp=timestamp
    )
    db.add(audit_entry)
    await db.commit()
```

### Audit Entry Fields

| Field | Content | Purpose |
|-------|---------|---------|
| `action` | login, create_analysis, approve | Activity tracing |
| `resource_type` | analysis, user, auth | Context identification |
| `user_id` | UUID of acting user | Accountability |
| `timestamp` | UTC ISO 8601 | Timeline reconstruction |
| `ip_address` | Client IP | Source tracking |
| `user_agent` | Browser/OS string | Device identification |
| `previous_hash` | SHA-256 of previous entry | Chain integrity |
| `current_hash` | SHA-256 of this entry | Entry integrity |

**Threat Mitigated:** Audit log tampering, non-repudiation.  
**Standard Compliance:** ISO 17025 Section 7.11 (Laboratory information management).

---

## 9. Data Encryption (At Rest and In Transit)

### Encryption at Rest

| Storage | Method | Key Management |
|---------|--------|----------------|
| PostgreSQL | AES-256 (storage layer) | Managed hosting provider |
| AWS S3 | SSE-S3 (AES-256) | AWS managed |
| Environment variables | Not stored in source code | Secret management |

### Encryption in Transit

- All client-server communication: HTTPS with TLS 1.3 minimum
- HSTS header: `max-age=31536000` (1 year)
- TLS certificates: Auto-renewed via Let's Encrypt
- Database connections: TLS required

**Threat Mitigated:** Man-in-the-middle attacks, unauthorized storage access, credential leakage.

---

## 10. CORS Policy and API Origin Restriction

**Implementation:** `backend/app/core/middleware.py`

```python
ALLOWED_ORIGINS = [
    "https://colonyai-eta.vercel.app",
    "https://colonyai.com",
    "https://www.colonyai.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

**Threat Mitigated:** Cross-Site Request Forgery (CSRF), unauthorized cross-origin API calls.

---

## Automated Security Testing Results

| Tool | Scope | Result |
|------|-------|--------|
| Bandit (SAST) | Python source code | 0 high-severity issues |
| npm audit | Frontend dependencies | 0 vulnerabilities |
| MIME Spoofing | PDF submitted as JPEG | Rejected at file validation |
| EXIF Stripping | Image with GPS metadata | Metadata absent in stored file |
| Rate Limiting | 150 requests in 1 min | HTTP 429 after 100th request |
| XSS Injection | HTML script in text fields | Characters escaped in response |
| SQL Injection | Malicious query params | Neutralized by ORM binding |

### CI/CD Security Pipeline

```yaml
# .github/workflows/ci-cd.yml
jobs:
  backend-tests:    pytest + coverage
  frontend-tests:   Jest + React Testing Library
  code-quality:     flake8, black, TypeScript strict
  security-audit:   bandit, npm audit
  docker-build:     Multi-stage container with image scanning
  deploy:           Railway (backend) + Vercel (frontend) on main
```

---

## Compliance Mapping

| Standard | Applicable Control | Status |
|----------|-------------------|--------|
| ISO 17025 s.7.11 | Immutable audit trail with integrity proof | Implemented |
| ISO/IEC 27001 | Information security management | Implemented |
| OWASP Top 10:2021 | A01-A10 controls coverage | Implemented |
| GDPR Article 32 | Encryption at rest and in transit | Implemented |
| NIST SP 800-63B | Password hashing strength (Argon2id) | Implemented |
| UU PDP (Indonesia) | Data retention auto-purge (5 years) | Implemented |
| CWE Top 25 | Injection, XSS, broken auth mitigations | Implemented |

---

## Reference Documents

- Authentication: `backend/app/core/security.py`
- Rate limiter: `backend/app/core/rate_limiter.py`
- Audit log: `backend/app/utils/audit.py`
- Input sanitization: `backend/app/utils/sanitization.py`
- File validation: `backend/app/services/image_processor.py`
- API docs: `docs/03-api-reference.md`
- Deployment guide: `docs/05-deployment.md`

---

_Last Updated: July 2026 | Version: 2.0.0_
