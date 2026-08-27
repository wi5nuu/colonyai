import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

import pytest
from app.services.file_validator import (
    ALLOWED_MIME_TYPES,
    MIN_IMAGE_DIMENSION,
    MAX_IMAGE_DIMENSION,
    MAX_FILE_SIZE_BYTES,
)


class TestFileValidator:
    """Test file validator constants and limits"""

    def test_allowed_mime_types_includes_jpeg(self):
        assert "image/jpeg" in ALLOWED_MIME_TYPES
        assert ALLOWED_MIME_TYPES["image/jpeg"] == ".jpg"

    def test_allowed_mime_types_includes_png(self):
        assert "image/png" in ALLOWED_MIME_TYPES
        assert ALLOWED_MIME_TYPES["image/png"] == ".png"

    def test_allowed_mime_types_includes_webp(self):
        assert "image/webp" in ALLOWED_MIME_TYPES
        assert ALLOWED_MIME_TYPES["image/webp"] == ".webp"

    def test_min_image_dimension_is_positive(self):
        assert MIN_IMAGE_DIMENSION > 0
        assert MIN_IMAGE_DIMENSION == 100

    def test_max_image_dimension_is_reasonable(self):
        assert MAX_IMAGE_DIMENSION > MIN_IMAGE_DIMENSION
        assert MAX_IMAGE_DIMENSION == 15_000

    def test_max_file_size_is_reasonable(self):
        assert MAX_FILE_SIZE_BYTES > 0
        assert MAX_FILE_SIZE_BYTES == 15 * 1024 * 1024  # 15 MB
