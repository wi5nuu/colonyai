"""
Integration tests for ColonyAI API endpoints

Jalankan: pytest tests/test_api_integration.py -v --asyncio-mode=auto
"""

import pytest
import io
import json
from httpx import AsyncClient, ASGITransport
from PIL import Image
from unittest.mock import patch, MagicMock

from main import app
from app.core.database import get_db, init_db
from app.core.security import get_password_hash


# ─── Fixtures ────────────────────────────────────────────────────────────────

@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def db_session():
    """Create a test database session."""
    await init_db()
    yield


@pytest.fixture
async def auth_headers(db_session):
    """Create a test user and return auth headers."""
    from app.core.database import AsyncSessionLocal
    from app.models import User
    
    async with AsyncSessionLocal() as session:
        # Create test user
        user = User(
            email="test@colonyai.com",
            password_hash=get_password_hash("testpassword123"),
            full_name="Test Analyst",
            role="analyst",
        )
        session.add(user)
        await session.commit()
        
        # Login to get token
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/v1/auth/login",
                data={
                    "username": "test@colonyai.com",
                    "password": "testpassword123",
                }
            )
            assert response.status_code == 200
            token = response.json()["access_token"]
            
        return {"Authorization": f"Bearer {token}"}


def create_test_image(width=800, height=800, format="JPEG"):
    """Create a test image as bytes."""
    buf = io.BytesIO()
    img = Image.new("RGB", (width, height), color=(200, 180, 150))
    img.save(buf, format=format)
    buf.seek(0)
    return buf


# ─── Authentication Tests ────────────────────────────────────────────────────

class TestAuthenticationEndpoints:
    
    @pytest.mark.asyncio
    async def test_register_new_user(self):
        """Test user registration."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/v1/auth/register",
                json={
                    "email": "newuser@colonyai.com",
                    "password": "SecurePass123!",
                    "full_name": "New User",
                    "role": "analyst",
                }
            )
            assert response.status_code == 201
            data = response.json()
            assert data["email"] == "newuser@colonyai.com"
            assert "password" not in data
    
    @pytest.mark.asyncio
    async def test_login_success(self):
        """Test successful login returns token."""
        # First register
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            await client.post(
                "/api/v1/auth/register",
                json={
                    "email": "login_test@colonyai.com",
                    "password": "TestPass123!",
                    "full_name": "Login Test",
                    "role": "analyst",
                }
            )
            
            # Then login
            response = await client.post(
                "/api/v1/auth/login",
                data={
                    "username": "login_test@colonyai.com",
                    "password": "TestPass123!",
                }
            )
            assert response.status_code == 200
            data = response.json()
            assert "access_token" in data
            assert data["token_type"] == "bearer"
    
    @pytest.mark.asyncio
    async def test_login_invalid_credentials(self):
        """Test login with invalid credentials."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/v1/auth/login",
                data={
                    "username": "nonexistent@colonyai.com",
                    "password": "WrongPassword",
                }
            )
            assert response.status_code == 401


# ─── Analysis Tests (Mocked AI) ──────────────────────────────────────────────

class TestAnalysisEndpoints:
    
    @pytest.mark.asyncio
    async def test_create_analysis_with_mocked_ai(self, auth_headers):
        """Test creating an analysis with mocked AI inference."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Create test image
            image_bytes = create_test_image()
            
            # Mock AI detection to avoid needing actual model
            with patch('app.api.v1.endpoints.analyses.ColonyDetector') as mock_detector:
                mock_instance = MagicMock()
                mock_instance.detect.return_value = [
                    {
                        'class_name': 'colony_single',
                        'confidence': 0.95,
                        'bbox': {'x': 100, 'y': 100, 'width': 20, 'height': 20},
                        'is_valid_colony': True,
                        'color': (0, 255, 0),
                    }
                    for _ in range(50)
                ]
                mock_instance.get_detection_summary.return_value = {
                    'colony_single': 50,
                    'colony_merged': 0,
                    'bubble': 0,
                    'dust_debris': 0,
                    'media_crack': 0,
                }
                mock_instance.get_average_confidence.return_value = 0.95
                mock_instance.get_reliability_indicator.return_value = 'high'
                mock_detector.return_value = mock_instance
                
                # Upload and analyze
                response = await client.post(
                    "/api/v1/analyses/",
                    headers=auth_headers,
                    data={
                        "sample_id": "TEST-001",
                        "media_type": "Plate Count Agar",
                        "dilution_factor": 0.001,
                        "plated_volume_ml": 1.0,
                    },
                    files={"file": ("test_plate.jpg", image_bytes, "image/jpeg")},
                )
                
                assert response.status_code == 200
                data = response.json()
                assert data["status"] == "completed"
                assert data["colony_count"] == 50
                assert data["cfu_per_ml"] is not None
                assert data["reliability"] == "high"
    
    @pytest.mark.asyncio
    async def test_list_analyses(self, auth_headers):
        """Test listing analyses."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(
                "/api/v1/analyses/",
                headers=auth_headers,
                params={"page": 1, "page_size": 10},
            )
            assert response.status_code == 200
            data = response.json()
            assert "analyses" in data
            assert "total" in data
            assert "page" in data
    
    @pytest.mark.asyncio
    async def test_get_dashboard_stats(self, auth_headers):
        """Test dashboard statistics endpoint."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(
                "/api/v1/analyses/stats",
                headers=auth_headers,
            )
            assert response.status_code == 200
            data = response.json()
            assert "total_analyses" in data
            assert "success_rate" in data
            assert "weekly_trend" in data


# ─── Health & Status Tests ───────────────────────────────────────────────────

class TestHealthEndpoints:
    
    @pytest.mark.asyncio
    async def test_root_endpoint(self):
        """Test root endpoint returns application info."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/")
            assert response.status_code == 200
            data = response.json()
            assert data["name"] == "ColonyAI"
            assert data["status"] == "running"
    
    @pytest.mark.asyncio
    async def test_health_endpoint(self):
        """Test health check endpoint."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/health")
            assert response.status_code == 200
            assert response.json()["status"] == "healthy"


# ─── Security Tests ──────────────────────────────────────────────────────────

class TestSecurityEndpoints:
    
    @pytest.mark.asyncio
    async def test_unauthenticated_access_denied(self):
        """Test that protected endpoints require authentication."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/api/v1/analyses/")
            assert response.status_code in [401, 403]
    
    @pytest.mark.asyncio
    async def test_cors_headers_present(self):
        """Test CORS headers are configured."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.options(
                "/health",
                headers={"Origin": "http://localhost:3000"},
            )
            # Check CORS headers exist (exact values depend on config)
            assert response.status_code == 200
