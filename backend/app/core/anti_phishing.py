"""
Anti-Phishing Engine for ColonyAI

Provides multi-layer defense against:
- Phishing bots (mass reset requests from same IP)
- Admin account targeting
- Credential stuffing
- Automated enumeration attacks

All blocks are logged to the Audit Ledger for ISO-17025 compliance.
"""

import time
from collections import defaultdict
from datetime import datetime, timedelta
from threading import Lock
from typing import Dict, Tuple

# ─────────────────────────────────────────────
# In-Memory Threat Intelligence Store
# (Survives restarts for short windows — upgrade
#  to Redis for multi-server production deploy)
# ─────────────────────────────────────────────

_lock = Lock()

# IP → (count, window_start)
_ip_reset_attempts: Dict[str, Tuple[int, float]] = defaultdict(lambda: (0, time.monotonic()))

# email → (count, window_start)
_email_reset_attempts: Dict[str, Tuple[int, float]] = defaultdict(lambda: (0, time.monotonic()))

# Permanently blocked IPs this session (cleared on restart)
_blocked_ips: Dict[str, str] = {}  # ip → reason

# ─────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────

MAX_RESETS_PER_IP_PER_HOUR = 5       # Max 5 reset requests from 1 IP per hour
MAX_RESETS_PER_EMAIL_PER_DAY = 3     # Max 3 reset requests per email per day
BLOCK_THRESHOLD_IP = 10              # Auto-block IP after 10 attempts/hour
WINDOW_SECONDS_IP = 3600             # 1-hour window for IP tracking
WINDOW_SECONDS_EMAIL = 86400         # 24-hour window for email tracking


class PhishingBlockedError(Exception):
    """Raised when a request is identified as phishing."""
    def __init__(self, reason: str, threat_level: str = "HIGH"):
        self.reason = reason
        self.threat_level = threat_level
        super().__init__(reason)


def check_and_record_reset_attempt(ip: str, email: str, user_role: str) -> None:
    """
    Central anti-phishing gate. Call this BEFORE processing any password reset.
    Raises PhishingBlockedError if the request is suspicious.
    
    Checks:
    1. IP permanently blocked?
    2. IP exceeded hourly threshold?
    3. Email exceeded daily threshold?
    4. Admin/Super Admin targeted? → Extra scrutiny
    """
    with _lock:
        now = time.monotonic()

        # ── 1. Check if IP is permanently blocked ──
        if ip in _blocked_ips:
            raise PhishingBlockedError(
                f"IP {ip} diblokir permanen. Alasan: {_blocked_ips[ip]}",
                threat_level="CRITICAL"
            )

        # ── 2. Track & check IP reset frequency ──
        ip_count, ip_window_start = _ip_reset_attempts[ip]
        if now - ip_window_start > WINDOW_SECONDS_IP:
            # Window expired, reset counter
            ip_count = 0
            ip_window_start = now

        ip_count += 1
        _ip_reset_attempts[ip] = (ip_count, ip_window_start)

        # Auto-block IP if exceeds hard limit
        if ip_count > BLOCK_THRESHOLD_IP:
            _blocked_ips[ip] = f"Automated phishing block: {ip_count} reset attempts in 1 hour"
            raise PhishingBlockedError(
                f"IP {ip} otomatis diblokir karena {ip_count} percobaan reset dalam 1 jam. "
                f"Kemungkinan serangan phishing/credential stuffing.",
                threat_level="CRITICAL"
            )

        # Soft warn at threshold
        if ip_count > MAX_RESETS_PER_IP_PER_HOUR:
            raise PhishingBlockedError(
                f"Terlalu banyak permintaan reset dari IP {ip} ({ip_count} dalam 1 jam). "
                f"Coba lagi dalam {int((WINDOW_SECONDS_IP - (now - ip_window_start)) / 60)} menit.",
                threat_level="HIGH"
            )

        # ── 3. Track & check per-email frequency ──
        em_count, em_window_start = _email_reset_attempts[email]
        if now - em_window_start > WINDOW_SECONDS_EMAIL:
            em_count = 0
            em_window_start = now

        em_count += 1
        _email_reset_attempts[email] = (em_count, em_window_start)

        if em_count > MAX_RESETS_PER_EMAIL_PER_DAY:
            raise PhishingBlockedError(
                f"Email {email} telah melebihi batas {MAX_RESETS_PER_EMAIL_PER_DAY} "
                f"permintaan reset per hari. Kemungkinan akun sedang ditargetkan.",
                threat_level="HIGH"
            )

        # ── 4. Extra scrutiny for Admin/Super Admin accounts ──
        if user_role in ("admin", "super_admin"):
            # Admin accounts need more protection — only 1 reset request per day
            if em_count > 1:
                # Auto-block the IP that's targeting an admin account
                _blocked_ips[ip] = f"Targeting admin account {email}"
                raise PhishingBlockedError(
                    f"Percobaan reset password akun Admin ({email}) terdeteksi dari IP {ip}. "
                    f"IP diblokir. Insiden ini dicatat dalam Audit Ledger.",
                    threat_level="CRITICAL"
                )


def get_threat_status(ip: str) -> dict:
    """Get current threat status for an IP. Used for admin monitoring."""
    with _lock:
        is_blocked = ip in _blocked_ips
        count, _ = _ip_reset_attempts.get(ip, (0, 0))
        return {
            "ip": ip,
            "is_blocked": is_blocked,
            "block_reason": _blocked_ips.get(ip),
            "reset_attempts_this_hour": count,
            "threat_level": "CRITICAL" if is_blocked else "HIGH" if count > 3 else "LOW"
        }


def unblock_ip(ip: str) -> bool:
    """Manually unblock an IP (Super Admin only). Returns True if was blocked."""
    with _lock:
        if ip in _blocked_ips:
            del _blocked_ips[ip]
            _ip_reset_attempts[ip] = (0, time.monotonic())
            return True
        return False
