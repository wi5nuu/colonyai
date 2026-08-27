import sys
import os
import time
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

import pytest
from app.core.rate_limiter import RateLimitMiddleware, RateLimitInfo


class TestRateLimitInfo:
    def setup_method(self):
        self.bucket = RateLimitInfo(max_tokens=10, refill_rate=1.0)

    def test_initial_tokens(self):
        assert self.bucket.tokens == 10

    def test_consume_one_token(self):
        assert self.bucket.consume() is True
        assert self.bucket.tokens == 9

    def test_consume_all_tokens(self):
        for _ in range(10):
            assert self.bucket.consume() is True
        assert self.bucket.tokens == 0

    def test_consume_when_empty(self):
        self.bucket.tokens = 0
        assert self.bucket.consume() is False

    def test_refill_over_time(self):
        self.bucket.tokens = 0
        self.bucket.last_refill = time.time() - 5
        assert self.bucket.consume() is True
        assert self.bucket.tokens > 0

    def test_refill_capped_at_max(self):
        self.bucket.tokens = 0
        self.bucket.last_refill = time.time() - 100
        self.bucket.consume()
        assert self.bucket.tokens <= self.bucket.max_tokens

    def test_multiple_consumes(self):
        assert self.bucket.consume(5) is True
        assert self.bucket.tokens == 5

    def test_multiple_consumes_exceeds(self):
        assert self.bucket.consume(20) is False


class TestRateLimitMiddleware:
    def test_exempt_paths(self):
        middleware = RateLimitMiddleware(None, max_requests=100, window_seconds=60)
        assert middleware._is_exempt("/health") is True
        assert middleware._is_exempt("/docs") is True
        assert middleware._is_exempt("/api/v1/analyses") is False
        assert middleware._is_exempt("/") is True
        assert middleware._is_exempt("/openapi.json") is True
