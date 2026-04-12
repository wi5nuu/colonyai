"""
Unit tests untuk file_validator.py — BUG-006 & BUG-012

Menguji:
- Rejeksi MIME spoofing (file .jpg dengan konten PDF)
- Penerimaan JPEG valid
- Rejeksi file > 15MB
- Rejeksi file kosong (0 byte)
- Rejeksi gambar terlalu kecil (< 100×100px)
- UUID rename (pastikan uuid4 dipakai, bukan nama asli)
- EXIF stripping (pastikan GPS koordinat dihapus)
"""

import io
import uuid
import struct
import pytest
from unittest.mock import patch, MagicMock
from fastapi import UploadFile

from app.services.file_validator import validate_and_sanitize_image


# ─── Helpers ─────────────────────────────────────────────────────────────────

def make_upload_file(content: bytes, filename: str = "test.jpg", content_type: str = "image/jpeg") -> UploadFile:
    """Helper: buat UploadFile dari bytes."""
    file_obj = io.BytesIO(content)
    return UploadFile(file=file_obj, filename=filename, size=len(content), headers={"content-type": content_type})


def make_minimal_jpeg(width: int = 640, height: int = 480) -> bytes:
    """Buat JPEG minimal yang valid menggunakan Pillow."""
    from PIL import Image
    buf = io.BytesIO()
    img = Image.new("RGB", (width, height), color=(128, 200, 100))
    img.save(buf, format="JPEG")
    return buf.getvalue()


# ─── Test Cases ──────────────────────────────────────────────────────────────

class TestFileSizeValidation:

    @pytest.mark.asyncio
    async def test_empty_file_rejected(self):
        """FS-001: File 0 byte harus ditolak."""
        from fastapi import HTTPException
        upload = make_upload_file(b"", "empty.jpg")
        with pytest.raises(HTTPException) as exc_info:
            await validate_and_sanitize_image(upload)
        assert exc_info.value.status_code == 400
        assert "kosong" in exc_info.value.detail.lower() or "0 byte" in exc_info.value.detail.lower()

    @pytest.mark.asyncio
    async def test_oversized_file_rejected(self):
        """FS-002: File > 15MB harus ditolak dengan status 413."""
        from fastapi import HTTPException
        # 16 MB dummy content
        oversized = b"A" * (16 * 1024 * 1024)
        upload = make_upload_file(oversized, "big.jpg")
        with pytest.raises(HTTPException) as exc_info:
            await validate_and_sanitize_image(upload)
        assert exc_info.value.status_code == 413


class TestMIMEValidation:

    @pytest.mark.asyncio
    async def test_pdf_disguised_as_jpeg_rejected(self):
        """BUG-006: PDF dengan ekstensi .jpg harus DITOLAK via magic bytes."""
        from fastapi import HTTPException
        # PDF magic bytes: %PDF
        pdf_content = b"%PDF-1.4 fake content " + b"X" * 1000
        upload = make_upload_file(pdf_content, "plate.jpg", "image/jpeg")

        with patch("app.services.file_validator.magic") as mock_magic:
            mock_magic.from_buffer.return_value = "application/pdf"
            with pytest.raises(HTTPException) as exc_info:
                await validate_and_sanitize_image(upload)
        assert exc_info.value.status_code == 400
        assert "pdf" in exc_info.value.detail.lower() or "tidak valid" in exc_info.value.detail.lower()

    @pytest.mark.asyncio
    async def test_valid_jpeg_accepted(self):
        """BUG-006: JPEG valid harus diterima dan dikembalikan dengan UUID filename."""
        jpeg_bytes = make_minimal_jpeg()
        upload = make_upload_file(jpeg_bytes, "colony_plate.jpg", "image/jpeg")

        with patch("app.services.file_validator.magic") as mock_magic:
            mock_magic.from_buffer.return_value = "image/jpeg"
            content, filename, mime = await validate_and_sanitize_image(upload)

        assert mime == "image/jpeg"
        assert filename.endswith(".jpg")
        # Pastikan nama file adalah UUID bukan nama asli
        stem = filename.replace(".jpg", "")
        uuid.UUID(stem)  # Raise ValueError jika bukan UUID valid


class TestImageDimensionValidation:

    @pytest.mark.asyncio
    async def test_image_too_small_rejected(self):
        """BUG-009: Gambar < 100×100px harus ditolak."""
        from fastapi import HTTPException
        tiny_jpeg = make_minimal_jpeg(width=50, height=50)
        upload = make_upload_file(tiny_jpeg, "tiny.jpg")

        with patch("app.services.file_validator.magic") as mock_magic:
            mock_magic.from_buffer.return_value = "image/jpeg"
            with pytest.raises(HTTPException) as exc_info:
                await validate_and_sanitize_image(upload)
        assert exc_info.value.status_code == 400
        assert "50" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_valid_image_dimension_accepted(self):
        """Gambar 640×480 harus diterima."""
        jpeg = make_minimal_jpeg(640, 480)
        upload = make_upload_file(jpeg, "valid.jpg")

        with patch("app.services.file_validator.magic") as mock_magic:
            mock_magic.from_buffer.return_value = "image/jpeg"
            content, filename, mime = await validate_and_sanitize_image(upload)

        assert content is not None
        assert len(content) > 0


class TestEXIFStripping:

    def test_exif_stripped_from_jpeg(self):
        """BUG-006: EXIF GPS coordinates harus dihapus dari JPEG."""
        from app.services.file_validator import _strip_exif

        # Buat JPEG dengan EXIF
        jpeg_bytes = make_minimal_jpeg()
        try:
            import piexif
            exif_dict = {
                "GPS": {
                    piexif.GPSIFD.GPSLatitude: ((6, 1), (12, 1), (0, 1)),
                    piexif.GPSIFD.GPSLongitude: ((106, 1), (49, 1), (0, 1)),
                }
            }
            exif_bytes = piexif.dump(exif_dict)
            from PIL import Image
            buf = io.BytesIO()
            img = Image.open(io.BytesIO(jpeg_bytes))
            img.save(buf, format="JPEG", exif=exif_bytes)
            jpeg_with_exif = buf.getvalue()

            # Strip EXIF
            stripped = _strip_exif(jpeg_with_exif, "image/jpeg")

            # Verify: tidak ada GPS data setelah stripping
            exif_after = piexif.load(stripped)
            gps_data = exif_after.get("GPS", {})
            assert len(gps_data) == 0, "GPS data tidak ter-strip!"

        except ImportError:
            pytest.skip("piexif tidak tersedia — install dengan: pip install piexif")

    def test_non_jpeg_not_modified(self):
        """PNG tidak perlu di-strip EXIF — harus dikembalikan apa adanya."""
        from app.services.file_validator import _strip_exif
        png_content = b"\x89PNG\r\n\x1a\n" + b"fake png data"
        result = _strip_exif(png_content, "image/png")
        assert result == png_content


class TestMalwareScan:

    @pytest.mark.asyncio
    async def test_malware_detected_results_in_400(self):
        """BUG-012: File yang terdeteksi malware harus ditolak dengan 400."""
        from fastapi import HTTPException
        from app.services.file_validator import _scan_for_malware

        with patch("app.services.file_validator.clamd") as mock_clamd:
            mock_cd = MagicMock()
            mock_clamd.ClamdUnixSocket.return_value = mock_cd
            mock_cd.instream.return_value = {"stream": ("FOUND", "Eicar.Test.File")}

            with pytest.raises(HTTPException) as exc_info:
                _scan_for_malware(b"fake content")
            assert exc_info.value.status_code == 400
            assert "malware" in exc_info.value.detail.lower() or "eicar" in exc_info.value.detail.lower()

    @pytest.mark.asyncio
    async def test_clamd_unavailable_allows_upload(self):
        """BUG-012: ClamAV tidak tersedia → upload tetap lanjut (fail-open)."""
        from app.services.file_validator import _scan_for_malware
        # Import error → tidak exception (fail-open)
        with patch.dict("sys.modules", {"clamd": None}):
            # Tidak boleh raise exception
            _scan_for_malware(b"test content")  # Harus tidak raise
