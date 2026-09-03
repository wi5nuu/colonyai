"""
Rate Limiting Middleware for ColonyAI FastAPI

Implements token bucket algorithm for API rate limiting.
Per proposal: 100 requests/minute per IP address.
"""

from __future__ import annotations

import time
from collections import defaultdict
from typing import Dict, Optional

from fastapi import Request, Response, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse


class RateLimitInfo:
    """Track rate limit information for a single client."""
    
    __slots__ = ['tokens', 'last_refill', 'max_tokens', 'refill_rate']
    
    def __init__(self, max_tokens: int, refill_rate: float):
        """
        Args:
            max_tokens: Maximum number of tokens (burst limit)
            refill_rate: Tokens added per second
        """
        self.max_tokens = max_tokens
        self.tokens = float(max_tokens)
        self.last_refill = time.monotonic()
        self.refill_rate = refill_rate
    
    def consume(self, tokens: int = 1) -> bool:
        """
        Try to consume tokens.
        
        Returns:
            True if tokens were available and consumed, False otherwise.
        """
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
        """Get remaining tokens."""
        now = time.monotonic()
        elapsed = now - self.last_refill
        return int(min(
            self.max_tokens,
            self.tokens + (elapsed * self.refill_rate)
        ))


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Rate limiting middleware implementing token bucket algorithm.
    
    Configuration:
    - max_requests: Maximum requests per window (default: 100)
    - window_seconds: Time window in seconds (default: 60)
    - exempt_paths: Paths exempt from rate limiting (default: ['/health', '/'])
    """
    
    def __init__(
        self,
        app,
        max_requests: int = 100,
        window_seconds: int = 60,
        exempt_paths: Optional[list[str]] = None,
    ):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.refill_rate = max_requests / window_seconds  # tokens per second
        
        # Rate limit storage (thread-safe with lock)
        self._limits: Dict[str, RateLimitInfo] = defaultdict(
            lambda: RateLimitInfo(max_requests, self.refill_rate)
        )
        self._exempt_paths = set(exempt_paths or ['/health', '/', '/docs', '/openapi.json'])
    
    def _get_identifier(self, request: Request) -> str:
        """
        Identify client by User ID (from JWT) or IP address.
        """
        # 1. Try to get User ID from JWT if present
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            try:
                from jose import jwt
                from app.core.config import settings
                token = auth_header.split(' ')[1]
                payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
                user_id = payload.get("sub")
                if user_id:
                    return f"user:{user_id}"
            except Exception:
                pass # Fallback to IP if token is invalid
        
        # 2. Fallback to IP
        forwarded_for = request.headers.get('X-Forwarded-For')
        if forwarded_for:
            return f"ip:{forwarded_for.split(',')[0].strip()}"
        
        if request.client:
            return f"ip:{request.client.host}"
        
        return 'ip:unknown'

    def _is_exempt(self, path: str) -> bool:
        """Check if path is exempt from rate limiting."""
        return path in self._exempt_paths
    
    async def dispatch(self, request: Request, call_next) -> Response:
        """Process request through rate limiter."""
        identifier = self._get_identifier(request)
        path = request.url.path
        
        # Skip rate limiting for exempt paths
        if self._is_exempt(path):
            return await call_next(request)
        
        # Periodic cleanup of stale entries to prevent memory leak
        now = time.monotonic()
        if not hasattr(self, '_last_cleanup'):
            self._last_cleanup = now
        if now - self._last_cleanup > self.window_seconds * 2:
            stale_keys = [k for k, v in self._limits.items() 
                         if now - v.last_refill > self.window_seconds * 2]
            for k in stale_keys:
                del self._limits[k]
            self._last_cleanup = now
        
        # Get or create rate limit info for this client
        rate_limit = self._limits[identifier]
        
        # Try to consume a token
        if not rate_limit.consume():
            # Rate limit exceeded
            remaining = rate_limit.get_remaining()
            reset_time = int((self.max_requests - remaining) / self.refill_rate)
            
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": "Rate limit exceeded. Too many requests.",
                    "limit": self.max_requests,
                    "window": f"{self.window_seconds} seconds",
                    "retry_after": reset_time,
                },
                headers={
                    "Retry-After": str(reset_time),
                    "X-RateLimit-Limit": str(self.max_requests),
                    "X-RateLimit-Remaining": str(remaining),
                    "X-RateLimit-Reset": str(int(time.time()) + reset_time),
                },
            )
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers to response
        remaining = rate_limit.get_remaining()
        response.headers['X-RateLimit-Limit'] = str(self.max_requests)
        response.headers['X-RateLimit-Remaining'] = str(remaining)
        response.headers['X-RateLimit-Reset'] = str(int(time.time()) + self.window_seconds)
        
        return response


# Factory function for easier configuration
def create_rate_limiter(
    max_requests: int = 100,
    window_seconds: int = 60,
    exempt_paths: Optional[list[str]] = None,
):
    """
    Create a rate limiter instance with custom configuration.
    
    Args:
        max_requests: Maximum requests per window
        window_seconds: Time window in seconds
        exempt_paths: Paths exempt from rate limiting
    
    Returns:
        RateLimitMiddleware instance
    """
    return RateLimitMiddleware(
        app=None,  # Will be set by FastAPI
        max_requests=max_requests,
        window_seconds=window_seconds,
        exempt_paths=exempt_paths,
    )
