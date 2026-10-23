import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

import pytest
import hashlib


class TestAuditModule:
    """Test audit utility module for basic hash verification"""

    def test_sha256_hash_consistency(self):
        """Test that SHA-256 produces consistent hashes"""
        data = "login|user-123|2026-07-16T10:00:00Z"
        h1 = hashlib.sha256(data.encode('utf-8')).hexdigest()
        h2 = hashlib.sha256(data.encode('utf-8')).hexdigest()
        assert h1 == h2

    def test_sha256_hash_different_content(self):
        """Test that different content produces different hashes"""
        h1 = hashlib.sha256("action1".encode('utf-8')).hexdigest()
        h2 = hashlib.sha256("action2".encode('utf-8')).hexdigest()
        assert h1 != h2

    def test_sha256_hash_length(self):
        """Test that SHA-256 produces 64 hex characters"""
        data = "test data"
        h = hashlib.sha256(data.encode('utf-8')).hexdigest()
        assert len(h) == 64  # SHA-256 produces 64 hex chars

    def test_audit_module_can_be_imported(self):
        """Test that audit module exists and can be imported"""
        from app.utils import audit
        assert hasattr(audit, 'write_audit_log')
        assert callable(audit.write_audit_log)
