import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

import pytest
from datetime import timedelta
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    create_confirmation_code,
    validate_email_domain,
    sanitize_filename,
)

class TestPasswordHashing:
    def test_hash_and_verify(self):
        password = "SecurePass123!"
        hashed = get_password_hash(password)
        assert hashed != password
        assert verify_password(password, hashed) is True

    def test_wrong_password_fails(self):
        hashed = get_password_hash("RealPass123!")
        assert verify_password("WrongPass123!", hashed) is False

    def test_same_password_different_hash(self):
        pwd = "TestPass123!"
        h1 = get_password_hash(pwd)
        h2 = get_password_hash(pwd)
        assert h1 != h2  # Argon2 uses unique salt each time


class TestJWTToken:
    def test_create_access_token(self):
        data = {"sub": "user-uuid", "role": "analyst"}
        token = create_access_token(data)
        assert isinstance(token, str)
        assert len(token) > 50

    def test_create_refresh_token(self):
        data = {"sub": "user-uuid"}
        token = create_refresh_token(data)
        assert isinstance(token, str)
        assert len(token) > 50

    def test_decode_valid_token(self):
        data = {"sub": "user-uuid", "role": "analyst"}
        token = create_access_token(data)
        payload = decode_token(token)
        assert payload["sub"] == "user-uuid"
        assert payload["role"] == "analyst"

    def test_decode_expired_token_raises(self):
        data = {"sub": "user-uuid"}
        token = create_access_token(data, expires_delta=timedelta(seconds=-1))
        with pytest.raises(Exception):
            decode_token(token)

    def test_token_contains_jti(self):
        data = {"sub": "user-uuid"}
        token = create_access_token(data)
        payload = decode_token(token)
        assert "jti" in payload

    def test_token_contains_type_claim(self):
        data = {"sub": "user-uuid"}
        token = create_access_token(data)
        payload = decode_token(token)
        assert payload["type"] == "access"

    def test_refresh_token_type(self):
        data = {"sub": "user-uuid"}
        token = create_refresh_token(data)
        payload = decode_token(token)
        assert payload["type"] == "refresh"


class TestSecurityUtilities:
    def test_confirmation_code_length(self):
        code = create_confirmation_code()
        assert len(code) == 6
        assert code.isdigit()

    def test_validate_email_domain_valid(self):
        assert validate_email_domain("user@gmail.com") is True
        assert validate_email_domain("user@yahoo.co.id") is True

    def test_validate_email_domain_invalid(self):
        assert validate_email_domain("user@invalid-tld.xyz") is False

    def test_sanitize_filename_removes_path(self):
        assert sanitize_filename("../../etc/passwd") == "etc_passwd"

    def test_sanitize_filename_allow_safe(self):
        assert sanitize_filename("colony_plate_001.jpg") == "colony_plate_001.jpg"
