import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

import pytest
import hashlib
from app.utils.audit import AuditLogger


class TestAuditLogger:
    def setup_method(self):
        self.logger = AuditLogger()

    def test_generate_hash_consistency(self):
        data = "login|user-123|2026-07-16T10:00:00Z"
        h1 = self.logger._generate_hash(data)
        h2 = self.logger._generate_hash(data)
        assert h1 == h2

    def test_generate_hash_different_content(self):
        h1 = self.logger._generate_hash("action1")
        h2 = self.logger._generate_hash("action2")
        assert h1 != h2

    def test_hash_length(self):
        data = "test data"
        h = self.logger._generate_hash(data)
        assert len(h) == 64  # SHA-256 produces 64 hex chars

    def test_create_entry_with_previous_hash(self):
        entry = self.logger.create_entry(
            user_id="user-1",
            action="create_analysis",
            resource_type="analysis",
            resource_id="analysis-1",
            previous_hash="abc123",
        )
        assert entry["user_id"] == "user-1"
        assert entry["action"] == "create_analysis"
        assert entry["previous_hash"] == "abc123"
        assert "current_hash" in entry
        assert "timestamp" in entry

    def test_create_first_entry(self):
        entry = self.logger.create_entry(
            user_id="user-1",
            action="system_init",
            resource_type="system",
            resource_id=None,
            previous_hash=None,
        )
        assert entry["previous_hash"] is None
        assert entry["current_hash"] is not None

    def test_chain_verification(self):
        entries = [
            self.logger.create_entry("user-1", "login", "auth", None, None),
        ]
        prev_hash = entries[0]["current_hash"]
        entries.append(
            self.logger.create_entry("user-1", "create", "analysis", "a-1", prev_hash)
        )
        prev_hash = entries[1]["current_hash"]
        entries.append(
            self.logger.create_entry("user-2", "approve", "analysis", "a-1", prev_hash)
        )
        assert self.logger.verify_chain(entries) is True

    def test_chain_verification_tampered(self):
        entries = [
            self.logger.create_entry("user-1", "login", "auth", None, None),
        ]
        prev_hash = entries[0]["current_hash"]
        entries.append(
            self.logger.create_entry("user-1", "create", "analysis", "a-1", prev_hash)
        )
        entries[1]["action"] = "tampered"  # modify after creation
        assert self.logger.verify_chain(entries) is False

    def test_entry_includes_ip(self):
        entry = self.logger.create_entry(
            user_id="user-1",
            action="login",
            resource_type="auth",
            resource_id=None,
            previous_hash=None,
            ip_address="192.168.1.1",
        )
        assert entry["ip_address"] == "192.168.1.1"

    def test_entry_includes_user_agent(self):
        entry = self.logger.create_entry(
            user_id="user-1",
            action="login",
            resource_type="auth",
            resource_id=None,
            previous_hash=None,
            user_agent="Mozilla/5.0",
        )
        assert entry["user_agent"] == "Mozilla/5.0"
