import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestAPIHealth:
    def test_root_endpoint(self):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "running"
        assert "name" in data
        assert "version" in data

    def test_health_endpoint(self):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}

    def test_cors_headers(self):
        response = client.options(
            "/",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
            },
        )
        assert "access-control-allow-origin" in response.headers

    def test_cors_blocks_unknown_origin(self):
        response = client.options(
            "/",
            headers={
                "Origin": "https://evil-site.com",
                "Access-Control-Request-Method": "GET",
            },
        )
        origin = response.headers.get("access-control-allow-origin", "")
        assert "evil-site.com" not in origin

    def test_security_headers_present(self):
        response = client.get("/health")
        headers = response.headers
        header_names = [k.lower() for k in headers.keys()]
        assert "x-content-type-options" in header_names
        assert "x-frame-options" in header_names

    def test_404_response_format(self):
        response = client.get("/nonexistent-route")
        assert response.status_code == 404
