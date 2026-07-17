import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

import pytest
from app.services.file_validator import FileValidator


class TestFileValidator:
    def setup_method(self):
        self.validator = FileValidator()

    def test_validate_jpeg_magic_bytes(self):
        jpeg_header = b'\xff\xd8\xff\xe0' + b'\x00' * 100
        result = self.validator.validate_mime_type(jpeg_header)
        assert result is True

    def test_validate_png_magic_bytes(self):
        png_header = b'\x89PNG\r\n\x1a\n' + b'\x00' * 100
        result = self.validator.validate_mime_type(png_header)
        assert result is True

    def test_reject_text_file_as_image(self):
        text_header = b'This is a text file pretending to be an image'
        result = self.validator.validate_mime_type(text_header)
        assert result is False

    def test_validate_file_size_within_limit(self):
        assert self.validator.validate_file_size(5 * 1024 * 1024) is True

    def test_validate_file_size_exceeds_limit(self):
        assert self.validator.validate_file_size(20 * 1024 * 1024) is False

    def test_validate_file_size_zero(self):
        assert self.validator.validate_file_size(0) is True

    def test_validate_dimensions_valid(self):
        assert self.validator.validate_dimensions(1920, 1080) is True

    def test_validate_dimensions_too_small(self):
        assert self.validator.validate_dimensions(50, 50) is False

    def test_validate_dimensions_too_large(self):
        assert self.validator.validate_dimensions(20000, 20000) is False

    def test_validate_extension_jpg(self):
        assert self.validator.validate_extension("test.jpg") is True

    def test_validate_extension_png(self):
        assert self.validator.validate_extension("test.png") is True

    def test_validate_extension_webp(self):
        assert self.validator.validate_extension("test.webp") is True

    def test_reject_extension_exe(self):
        assert self.validator.validate_extension("malware.exe") is False

    def test_reject_extension_pdf(self):
        assert self.validator.validate_extension("document.pdf") is False

    def test_full_validation_pipeline_valid(self):
        jpeg_header = b'\xff\xd8\xff\xe0' + b'\x00' * 200
        result = self.validator.validate(
            file_content=jpeg_header,
            file_size=5 * 1024 * 1024,
            filename="plate001.jpg",
        )
        assert result["valid"] is True

    def test_full_validation_pipeline_invalid_mime(self):
        text_header = b'fake content'
        result = self.validator.validate(
            file_content=text_header,
            file_size=5 * 1024 * 1024,
            filename="image.jpg",
        )
        assert result["valid"] is False
        assert "MIME" in result["reason"]
