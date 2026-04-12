"""
File upload validation service — ColonyAI

Mengimplementasikan:
- BUG-006: MIME type validation via magic bytes (bukan Content-Type header)
- BUG-006: UUID rename — cegah path traversal & enumeration
- BUG-006: EXIF stripping via piexif
- BUG-012: Malware scanning via ClamAV (fail-open dengan warning jika AV down)
- BUG-009: Validasi dimensi gambar minimum 100×100px
"""

from __future__ import annotations

import io
import logging
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile

logger = logging.getLogger(__name__)

# ── Allowed MIME types (validated via magic bytes, NOT Content-Type header) ──
ALLOWED_MIME_TYPES: dict[str, str] = {
    "image/jpeg": ".jpg",
    "image/png":  ".png",
    "image/webp": ".webp",
}

# ── Limits ──
MIN_IMAGE_DIMENSION = 100     # pixels (width AND height)
MAX_IMAGE_DIMENSION = 15_000  # pixels
MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB


async def validate_and_sanitize_image(
    file: UploadFile,
) -> tuple[bytes, str, str]:
    """
    Validasi dan sanitasi file gambar yang diupload.

    Langkah:
    1. Baca konten file
    2. Cek ukuran (0-byte & >15MB ditolak)
    3. Validasi MIME type via magic bytes (bukan Content-Type/extension)
    4. Validasi dimensi gambar (min 100×100px)
    5. Strip EXIF metadata
    6. Generate nama file aman (UUID random)
    7. (Opsional) Malware scan via ClamAV

    Returns:
        (sanitized_bytes, safe_filename, mime_type)

    Raises:
        HTTPException 400/413 jika validasi gagal
    """
    # ── 1. Baca isi file ──
    content = await file.read()

    # ── 2. Cek ukuran ──
    if len(content) == 0:
        raise HTTPException(
            status_code=400,
            detail="File tidak boleh kosong (0 byte).",
        )

    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=(
                f"Ukuran file melebihi batas maksimum "
                f"({MAX_FILE_SIZE_BYTES // 1_024 // 1_024} MB). "
                "Kompres gambar atau gunakan resolusi lebih rendah."
            ),
        )

    # ── 3. Validasi MIME type via magic bytes ──
    try:
        import magic  # python-magic

        detected_mime = magic.from_buffer(content[:2048], mime=True)
    except ImportError:
        # python-magic belum diinstall — fallback ke Content-Type (kurang aman)
        logger.warning(
            "python-magic tidak tersedia — fallback ke Content-Type header. "
            "Install: pip install python-magic. "
            "SECURITY WARNING: rentan MIME spoofing."
        )
        detected_mime = file.content_type or "application/octet-stream"

    if detected_mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Format file tidak valid (terdeteksi: {detected_mime}). "
                "Hanya JPEG, PNG, dan WEBP yang diterima."
            ),
        )

    # ── 4. Validasi dimensi gambar ──
    try:
        from PIL import Image

        with Image.open(io.BytesIO(content)) as img:
            img.verify()  # Deteksi corrupt / truncated

        # Re-open karena verify() menutup file
        with Image.open(io.BytesIO(content)) as img:
            width, height = img.size

        if width < MIN_IMAGE_DIMENSION or height < MIN_IMAGE_DIMENSION:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Gambar terlalu kecil ({width}×{height}px). "
                    f"Minimum {MIN_IMAGE_DIMENSION}×{MIN_IMAGE_DIMENSION}px."
                ),
            )

        if width > MAX_IMAGE_DIMENSION or height > MAX_IMAGE_DIMENSION:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Gambar terlalu besar ({width}×{height}px). "
                    f"Maksimum {MAX_IMAGE_DIMENSION}×{MAX_IMAGE_DIMENSION}px."
                ),
            )

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=400,
            detail=(
                "File tidak dapat dibaca sebagai gambar. "
                "Pastikan file tidak rusak atau corrupt."
            ),
        )

    # ── 5. Strip EXIF metadata ──
    sanitized = _strip_exif(content, detected_mime)

    # ── 6. Malware scan (ClamAV) ──
    _scan_for_malware(sanitized)

    # ── 7. Generate nama file aman (UUID random) ──
    extension = ALLOWED_MIME_TYPES[detected_mime]
    safe_filename = f"{uuid.uuid4()}{extension}"

    logger.info(
        "File upload valid: mime=%s size=%d bytes → saved as %s",
        detected_mime,
        len(sanitized),
        safe_filename,
    )

    return sanitized, safe_filename, detected_mime


def _strip_exif(content: bytes, mime_type: str) -> bytes:
    """
    Hapus semua EXIF metadata dari gambar.

    Mencegah:
    - Data pribadi koordinat GPS bocor ke S3
    - EXIF injection exploit (command injection via EXIF fields)

    Hanya berlaku untuk JPEG — PNG & WEBP tidak memiliki EXIF.
    """
    if mime_type != "image/jpeg":
        return content

    try:
        import piexif

        cleaned = piexif.remove(content)
        logger.debug("EXIF metadata berhasil di-strip.")
        return cleaned
    except ImportError:
        logger.warning(
            "piexif tidak tersedia — EXIF tidak di-strip. "
            "Install: pip install piexif. "
            "SECURITY WARNING: metadata privasi (GPS) bisa bocor."
        )
        return content
    except Exception as exc:
        # Jangan gagalkan upload hanya karena EXIF strip error
        logger.warning("Gagal strip EXIF (non-critical): %s", exc)
        return content


def _scan_for_malware(content: bytes) -> None:
    """
    Scan file untuk malware menggunakan ClamAV.

    Strategi: fail-open (jika ClamAV tidak tersedia, log warning & lanjutkan).
    Di environment produksi, pertimbangkan fail-closed (block jika AV down).

    Raises:
        HTTPException 400 jika malware terdeteksi.
    """
    try:
        import clamd

        cd = clamd.ClamdUnixSocket()
        result = cd.instream(io.BytesIO(content))
        status, virus_name = result["stream"]

        if status == "FOUND":
            logger.warning("MALWARE DETECTED: %s — upload ditolak.", virus_name)
            raise HTTPException(
                status_code=400,
                detail=(
                    f"File ditolak: mengandung malware ({virus_name}). "
                    "Hubungi administrator laboratorium."
                ),
            )

        logger.debug("ClamAV scan OK: bersih.")

    except HTTPException:
        raise
    except ImportError:
        logger.warning(
            "clamd tidak tersedia — malware scan dilewati. "
            "Install: pip install clamd. SECURITY WARNING."
        )
    except Exception as exc:
        # ClamAV connection error atau error lainnya — fail-open
        logger.warning(
            "ClamAV tidak dapat dihubungi (%s) — scan dilewati. "
            "SECURITY WARNING: pertimbangkan fail-closed di produksi.",
            exc,
        )
