"""
Secure Password Generation Utilities for ColonyAI

FIX BUG-HIGH-002: Generate strong temporary passwords that meet complexity requirements.

Security Features:
- Meets all password complexity requirements
- Cryptographically secure random generation
- Configurable length and character sets
- Validation against policy rules
"""

import string
import secrets
import re
from typing import Optional

# Reuse a single SystemRandom instance for shuffling
_rng = secrets.SystemRandom()


# Password complexity requirements (must match validate_password_complexity in auth.py)
MIN_PASSWORD_LENGTH = 8
SPECIAL_CHARS = "!@#$%^&*(),.?\":{}|<>[]\\/_-+=~`"


def generate_secure_temp_password(length: int = 12) -> str:
    """
    Generate a cryptographically secure temporary password that meets complexity requirements.
    
    Requirements:
    - Minimum 8 characters (default 12 for extra security)
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character
    
    Args:
        length: Password length (minimum 8, default 12)
    
    Returns:
        A secure password meeting all complexity requirements
    
    Examples:
        >>> pwd = generate_secure_temp_password()
        >>> len(pwd) >= 12
        True
        >>> any(c.isupper() for c in pwd)
        True
        >>> any(c.islower() for c in pwd)
        True
        >>> any(c.isdigit() for c in pwd)
        True
    """
    if length < MIN_PASSWORD_LENGTH:
        raise ValueError(f"Password length must be at least {MIN_PASSWORD_LENGTH} characters")
    
    # Character sets
    uppercase = string.ascii_uppercase
    lowercase = string.ascii_lowercase
    digits = string.digits
    special = SPECIAL_CHARS
    
    # Ensure we have at least one of each required character type
    # This guarantees password will pass complexity validation
    password_chars = [
        secrets.choice(uppercase),  # At least one uppercase
        secrets.choice(lowercase),  # At least one lowercase
        secrets.choice(digits),      # At least one digit
        secrets.choice(special),     # At least one special char
    ]
    
    # Fill remaining length with random characters from all sets
    all_chars = uppercase + lowercase + digits + special
    remaining_length = length - len(password_chars)
    password_chars.extend(secrets.choice(all_chars) for _ in range(remaining_length))
    
    # Shuffle to avoid predictable pattern (special char always at position 3, etc)
    _rng.shuffle(password_chars)
    
    password = ''.join(password_chars)
    
    # Double-check password meets requirements (should always pass, but be defensive)
    if not validate_password_strength(password):
        # Recursively regenerate if somehow validation fails (extremely unlikely)
        return generate_secure_temp_password(length)
    
    return password


def validate_password_strength(password: str) -> bool:
    """
    Validate that a password meets complexity requirements.
    
    Args:
        password: The password to validate
    
    Returns:
        True if password meets all requirements, False otherwise
    """
    if len(password) < MIN_PASSWORD_LENGTH:
        return False
    
    if not any(c.isupper() for c in password):
        return False
    
    if not any(c.islower() for c in password):
        return False
    
    if not any(c.isdigit() for c in password):
        return False
    
    # Check for special characters
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>\[\]\\/_\-+=~`]", password):
        return False
    
    return True


def generate_reset_token(length: int = 32) -> str:
    """
    Generate a cryptographically secure URL-safe token for password resets.
    
    Args:
        length: Token length in bytes (default 32 = 256 bits of entropy)
    
    Returns:
        URL-safe token string
    """
    return secrets.token_urlsafe(length)


def generate_mfa_code(length: int = 6) -> str:
    """
    Generate a numeric MFA code.
    
    Args:
        length: Code length (default 6 digits)
    
    Returns:
        Numeric MFA code as string
    """
    # Generate cryptographically secure random digits
    return ''.join(secrets.choice(string.digits) for _ in range(length))
