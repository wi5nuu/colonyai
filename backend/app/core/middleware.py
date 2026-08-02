from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, Response
from typing import Callable
import logging

logger = logging.getLogger(__name__)

class SecureHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add enterprise-grade security headers to all responses.
    Implements best practices for web security.
    """
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)

        # ── 1. HTTP Strict Transport Security (HSTS) ──
        # Forces browser to use HTTPS. 1 year (31536000s)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"

        # ── 2. X-Content-Type-Options ──
        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # ── 3. X-Frame-Options ──
        # Prevent Clickjacking (disallow embedding in frames)
        response.headers["X-Frame-Options"] = "DENY"

        # ── 4. X-XSS-Protection ──
        # Enable browser's reflected XSS filter (Legacy but still useful)
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # ── 5. Content-Security-Policy (CSP) ──
        # Control where resources can be loaded from.
        # Development: allow all localhost ports for cross-origin image loading
        # Production: restrict to specific domains only
        import os
        _is_debug = os.getenv("DEBUG", "False").lower() in ("true", "1", "yes")
        if _is_debug:
            # Development: permissive CSP for local testing across ports
            csp = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline'; "
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
                "font-src 'self' https://fonts.gstatic.com; "
                "img-src 'self' data: blob: http://localhost:* http://127.0.0.1:*; "
                "connect-src 'self' http://localhost:* http://127.0.0.1:*;"
            )
        else:
            # Production: strict CSP
            csp = (
                "default-src 'self'; "
                "script-src 'self'; "
                "style-src 'self' 'unsafe-inline'; "
                "font-src 'self'; "
                "img-src 'self' data: blob:; "
                "connect-src 'self';"
            )
        response.headers["Content-Security-Policy"] = csp

        # ── 6. Referrer-Policy ──
        # Control how much referrer information is passed
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # ── 7. Permissions-Policy ──
        # Disable unused browser features for security
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"

        return response
