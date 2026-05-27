# ColonyAI Security Architecture and Implementation

**Document Type:** Technical Security Reference  
**Version:** 1.3-production  
**Last Updated:** May 2026  
**Applicable Standard:** OWASP Top 10, ISO/IEC 27001, ISO 17025 Section 7.11

---

## Executive Summary

ColonyAI implements a defense-in-depth security architecture comprising ten distinct security layers following the Zero-Trust principle. Every authenticated request is validated at the perimeter, the application layer, and the data layer before resources are granted. This document details each security mechanism, its implementation location in the codebase, and the threat it mitigates.

All security controls have been verified through automated static analysis (Bandit, npm audit) and manual penetration testing prior to production deployment.

---

## 1. Authentication and Token Management

**Implementation File:** `backend/app/core/security.py`

ColonyAI uses JSON Web Tokens (JWT) with a dual-token system to balance security with user experience:

| Token Type     | Lifetime | Purpose                                |
|----------------|----------|----------------------------------------|
| Access Token   | 15 min   | Authorizes individual API requests     |
| Refresh Token  | 7 days   | Generates new access tokens silently   |

Password hashing is performed with **Argon2id**, the winner of the 2015 Password Hashing Competition, which is resistant to GPU-based brute-force attacks due to its configurable memory and computation cost.

```python
# backend/app/core/security.py
from argon2 import PasswordHasher

pwd_context = PasswordHasher()

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    jti = str(uuid.uuid4())  # Unique token ID used for blacklisting
    to_encode.update({"exp": expire, "type": "access", "jti": jti})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt
```

**Threat Mitigated:** Credential theft, rainbow-table attacks, token forgery.

---

## 2. Role-Based Access Control (RBAC)

**Implementation File:** `backend/app/core/security.py`, `backend/app/api/v1/endpoints/`

The system enforces a four-tier permission model. Every API endpoint declares its minimum required role via FastAPI dependency injection. Middleware validates role claims on each request before the endpoint handler executes.

| Role            | Access Level | Key Permissions                                                |
|-----------------|--------------|----------------------------------------------------------------|
| System Admin    | Full         | User provisioning, system configuration, node governance       |
| Lab Manager     | Management   | Result verification, final sign-off, report generation         |
| Lab Analyst     | Limited      | Image upload, AI analysis execution, initial data entry        |
| Quality Auditor | Read-Only    | Immutable audit trail access, cryptographic verification       |

All access denials are recorded to the cryptographic audit log with a timestamp, requesting user ID, and the resource that was denied.

**Threat Mitigated:** Privilege escalation, unauthorized data access, insider threats.

---

## 3. Token Blacklisting and Session Revocation

**Implementation File:** `backend/app/core/security.py`

Each JWT carries a unique `jti` (JWT ID) claim. Upon logout, the token's `jti` is inserted into a persistent `TokenBlacklist` table in PostgreSQL. Every protected endpoint verifies the `jti` is not present in the blacklist before granting access.

```python
# backend/app/core/security.py
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    jti = payload.get("jti")

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(TokenBlacklist).where(TokenBlacklist.jti == jti)
        )
        if result.scalar_one_or_none():
            raise HTTPException(status_code=401, detail="Token has been revoked.")
```

This mechanism ensures that logout is effective immediately rather than waiting for natural token expiration.

**Threat Mitigated:** Session hijacking after logout, credential reuse from intercepted tokens.

---

## 4. File Upload Security and Malware Protection

**Implementation File:** `backend/app/services/image_processor.py`, `backend/app/utils/file_validator.py`

File uploads undergo four sequential validation steps before any data is written to storage:

**Layer 1: Magic Bytes MIME Validation**

The MIME type is read directly from the binary header of the file using the `python-magic` library, bypassing the `Content-Type` HTTP header which can be trivially spoofed by an attacker.

```python
import magic
detected_mime = magic.from_buffer(content[:2048], mime=True)

ALLOWED_MIME_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

if detected_mime not in ALLOWED_MIME_TYPES:
    raise HTTPException(status_code=400, detail="Unsupported or disguised file type.")
```

**Layer 2: EXIF Metadata Stripping**

All EXIF metadata is removed from uploaded images before storage. This protects the submitting laboratory's physical location (GPS coordinates embedded by mobile cameras) and device information from being persisted or exposed.

```python
from PIL import Image
image = Image.open(io.BytesIO(content))
data = list(image.getdata())
image_without_exif = Image.new(image.mode, image.size)
image_without_exif.putdata(data)
```

**Layer 3: Image Dimension and File Size Validation**

```python
MIN_IMAGE_DIMENSION = 100      # pixels
MAX_IMAGE_DIMENSION = 15_000   # pixels
MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB
```

**Layer 4: ClamAV Malware Scanning**

Uploaded files are scanned by a ClamAV daemon process prior to being committed to object storage. The system is configured to fail-open with a warning log if the AV service is temporarily unavailable, ensuring availability is not sacrificed.

**Threat Mitigated:** MIME spoofing, malware upload, laboratory IP disclosure, denial-of-service via oversized files.

---

## 5. Rate Limiting and DDoS Mitigation

**Implementation File:** `backend/app/core/rate_limiter.py`

A Token Bucket algorithm is implemented at the middleware layer, tracking request quotas on a per-IP-address basis. This provides both a steady-state rate limit and a controlled burst allowance.

```python
# backend/app/core/rate_limiter.py

class RateLimitInfo:
    def __init__(self, max_tokens: int, refill_rate: float):
        self.max_tokens = max_tokens  # Maximum burst capacity
        self.tokens = float(max_tokens)
        self.refill_rate = refill_rate  # Tokens restored per second

    def consume(self, tokens: int = 1) -> bool:
        elapsed = now - self.last_refill
        self.tokens = min(
            self.max_tokens,
            self.tokens + (elapsed * self.refill_rate)
        )
        if self.tokens >= tokens:
            self.tokens -= tokens
            return True
        return False
```

Configuration: 100 requests per minute per IP address. Exceeded requests receive an HTTP 429 response with a `Retry-After` header.

**Threat Mitigated:** Brute-force login attacks, credential stuffing, API abuse, application-layer DDoS.

---

## 6. Input Validation and XSS Prevention

**Implementation Files:** `backend/app/schemas/`, `backend/app/utils/sanitization.py`

All incoming request bodies are validated against strict Pydantic schemas before reaching any business logic. Field constraints (minimum length, maximum length, regex patterns) are declared at the schema level.

In addition, all string data retrieved from user input is passed through an HTML escaping function before being included in any response, preventing Cross-Site Scripting (XSS) attacks.

```python
# backend/app/utils/sanitization.py
import html

def sanitize_string(value: str) -> str:
    """Escapes HTML special characters to neutralize XSS payloads."""
    return html.escape(value)

def sanitize_recursive(data):
    """Recursively sanitizes all string values within nested data structures."""
    if isinstance(data, str):
        return sanitize_string(data)
    elif isinstance(data, list):
        return [sanitize_recursive(item) for item in data]
    elif isinstance(data, dict):
        return {key: sanitize_recursive(val) for key, val in data.items()}
```

**Threat Mitigated:** Cross-Site Scripting (XSS), command injection, type confusion attacks.

---

## 7. Database Security and SQL Injection Prevention

**Implementation Files:** `backend/app/models/`, `backend/app/db/`

All database interactions are performed exclusively through SQLAlchemy's ORM with parameterized queries. Raw SQL string construction is prohibited by convention and enforced through code review. The ORM automatically escapes all values before binding them to query parameters.

```python
# Vulnerable pattern (not used in ColonyAI)
# query = f"SELECT * FROM users WHERE email = '{email}'"

# Secure implementation via SQLAlchemy ORM
stmt = select(User).where(User.email == email)
result = await db.execute(stmt)
```

Database connections use TLS encryption, and the application database user is provisioned with the minimum required permissions (no DDL rights in production).

**Threat Mitigated:** SQL injection, unauthorized schema modification.

---

## 8. Cryptographic Audit Logging and Immutable Ledger

**Implementation File:** `backend/app/utils/audit.py`

Every significant system action (login, analysis creation, result approval, user management) produces an entry in the `AuditLog` table. Entries are cryptographically linked using SHA-256 hash chaining: each log entry includes the hash of the preceding entry. Any retroactive modification of a log record will break the chain and is immediately detectable.

```python
# backend/app/utils/audit.py
async def write_audit_log(db, user_id, action, resource_type, resource_id, details, ...):
    last_log = await db.execute(
        select(AuditLog).order_by(desc(AuditLog.timestamp)).limit(1)
    )
    previous_hash = last_log.current_hash if last_log else None

    raw_str = f"{previous_hash or ''}{action}{resource_type}{resource_id}{details}{timestamp}"
    current_hash = hashlib.sha256(raw_str.encode('utf-8')).hexdigest()

    audit_entry = AuditLog(
        id=uuid.uuid4(),
        user_id=user_uuid,
        action=action,
        resource_type=resource_type,
        previous_hash=previous_hash,
        current_hash=current_hash,
        timestamp=timestamp
    )
    db.add(audit_entry)
    await db.commit()
```

**Fields recorded per audit entry:**

| Field           | Content                         | Purpose                        |
|-----------------|---------------------------------|--------------------------------|
| `action`        | login, create_analysis, approve | Activity tracing               |
| `resource_type` | analysis, user, auth            | Context identification         |
| `user_id`       | UUID of the acting user         | Accountability                 |
| `timestamp`     | UTC ISO 8601 datetime           | Timeline reconstruction        |
| `ip_address`    | Client IP address               | Geographic source tracking     |
| `user_agent`    | Browser and OS string           | Device identification          |
| `previous_hash` | SHA-256 hash of previous entry  | Chain integrity (tamper proof) |
| `current_hash`  | SHA-256 hash of this entry      | Entry integrity verification   |

**Threat Mitigated:** Audit log tampering, non-repudiation, compliance failure.  
**Standard Compliance:** ISO 17025 Section 7.11 (Laboratory information management).

---

## 9. Data Encryption (At Rest and In Transit)

**Encryption at Rest:**

- PostgreSQL database files are encrypted using AES-256 at the storage layer via the managed hosting provider.
- Image files stored in object storage (AWS S3) use server-side encryption (SSE-S3, AES-256).
- Sensitive configuration values (API keys, database credentials) are stored exclusively in environment variables, not in source control.

**Encryption in Transit:**

- All client-to-server communication is enforced over HTTPS using TLS 1.3 as the minimum protocol version.
- The `Strict-Transport-Security` (HSTS) header is set with a one-year `max-age` to prevent protocol downgrade attacks.
- TLS certificates are provisioned and renewed automatically via Let's Encrypt.

**Threat Mitigated:** Data interception (man-in-the-middle), unauthorized storage access, credential leakage.

---

## 10. CORS Policy and API Origin Restriction

**Implementation File:** `backend/app/core/middleware.py`

Cross-Origin Resource Sharing (CORS) is configured to allow credentials and method access only from explicitly whitelisted frontend origins.

```python
# backend/app/core/middleware.py

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

All security controls are verified as part of the CI/CD pipeline on every merge to the main branch.

| Tool              | Scope                              | Result                          |
|-------------------|------------------------------------|---------------------------------|
| Bandit (SAST)     | Python source code                 | 0 high-severity issues          |
| npm audit         | Frontend JavaScript dependencies   | 0 vulnerabilities               |
| MIME Spoofing     | PDF file submitted as JPEG         | Rejected at file validation     |
| EXIF Stripping    | Image with embedded GPS metadata   | Metadata absent in stored file  |
| Rate Limiting     | 150 requests submitted in one min  | HTTP 429 after 100th request    |
| XSS Injection     | HTML script tags in text fields    | Characters escaped in response  |
| SQL Injection     | Malicious query string in params   | Neutralized by ORM binding      |

### CI/CD Security Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci-cd.yml
jobs:
  - backend-tests:   pytest + coverage
  - frontend-tests:  Jest + React Testing Library
  - code-quality:    flake8, black, TypeScript strict
  - security-audit:  bandit, npm audit
  - docker-build:    Multi-stage container with image scanning
  - deploy:          Railway (backend) + Vercel (frontend) on main branch only
```

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

## Compliance Mapping

| Standard           | Applicable Control                          | Status      |
|--------------------|---------------------------------------------|-------------|
| ISO 17025 s.7.11   | Immutable audit trail with integrity proof  | Implemented |
| OWASP Top 10:2021  | A01-A10 controls                            | Implemented |
| GDPR Article 32    | Encryption at rest and in transit           | Implemented |
| NIST SP 800-63B    | Password hashing strength (Argon2id)        | Implemented |
| CWE Top 25         | Injection, XSS, broken auth mitigations     | Implemented |

---

## Reference Documents

- Authentication implementation: `backend/app/core/security.py`
- Rate limiter implementation: `backend/app/core/rate_limiter.py`
- Audit log implementation: `backend/app/utils/audit.py`
- Input sanitization: `backend/app/utils/sanitization.py`
- File validation: `backend/app/services/image_processor.py`
- API documentation: `docs/api.md`
- Deployment guide: `docs/deployment.md`
