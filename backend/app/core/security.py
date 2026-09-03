from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from argon2 import PasswordHasher
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uuid
from app.core.config import settings

# Use Argon2 for modern, secure password hashing
pwd_context = PasswordHasher()
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password"""
    if not hashed_password:
        return False
    try:
        pwd_context.verify(hashed_password, plain_password)
        return True
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Hash a password using Argon2"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Add JTI for blacklisting
    jti = str(uuid.uuid4())
    to_encode.update({"exp": expire, "type": "access", "jti": jti})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """Create a JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    # Add JTI for blacklisting
    jti = str(uuid.uuid4())
    to_encode.update({"exp": expire, "type": "refresh", "jti": jti})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> dict:
    """Decode and verify a JWT token"""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Get current authenticated user from JWT token and check blacklist"""
    # Note: real db session is injected via dependency in endpoints
    from app.core.database import AsyncSessionLocal
    from app.models import TokenBlacklist, User
    from sqlalchemy import select
    
    token = credentials.credentials
    
    payload = decode_token(token)
    
    jti = payload.get("jti")
    user_id: str = payload.get("sub")
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    # ── BLACKLIST CHECK (TOCTOU-safe) ──
    # Take a pessimistic row lock on the User FIRST, then re-check the
    # blacklist inside the same transaction. logout() acquires the same
    # lock on the user row before inserting into TokenBlacklist, so the
    # two operations serialize: if logout commits first, this second
    # blacklist query sees the revoked jti and rejects the request.
    async with AsyncSessionLocal() as db:
        try:
            user_uuid = uuid.UUID(user_id)
        except (ValueError, AttributeError):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user ID format"
            )
        result = await db.execute(
            select(User)
            .where(User.id == user_uuid)
            .with_for_update()
        )
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User no longer exists"
            )

        result = await db.execute(
            select(TokenBlacklist)
            .where(TokenBlacklist.jti == jti)
            .with_for_update()
        )
        blacklisted = result.scalar_one_or_none()

        if blacklisted:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been revoked (logged out)"
            )

        # ── Enforce Organization Membership ──
        if user.role.value != "super_admin" and not user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Akun tidak terdaftar pada perusahaan mana pun. Hubungi Super Admin."
            )

    return {
        "user_id": user_id,
        "email": payload.get("email"),
        "role": payload.get("role"),
        "organization_id": str(user.organization_id) if user.organization_id else None,
        "jti": jti,
        "exp": payload.get("exp")
    }


def require_role(*required_roles: str):
    """
    Dependency factory to check if user has one of the required roles.
    Usage: `current_user: dict = Depends(require_role("manager", "analyst"))`

    Always chains through get_current_user first.
    'super_admin' has god-mode access to all endpoints.
    'admin' has full access to their organization's endpoints.
    """
    async def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role")
        
        # 1. Super Admin bypasses all checks
        if user_role == "super_admin":
            return current_user
            
        # 2. Specific role check
        if user_role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    return role_checker
