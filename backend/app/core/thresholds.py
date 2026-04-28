"""
Per-media-type confidence thresholds untuk ColonyAI YOLOv8 inference.

⚠️  CATATAN PENTING:
Nilai di bawah adalah estimasi sementara berdasarkan pengetahuan domain.
WAJIB diperbarui setelah empirical calibration study selesai
(target: setelah 3,000 gambar lokal terkumpul & divalidasi).

Keputusan: SA-001 & BUG-007 — ColonyAI Technical Decisions v1.0.0 (12 Apr 2026)
"""

from typing import Literal

# Nama kelas yang valid
ColonyClassName = Literal[
    "colony_single", "colony_merged", "bubble", "dust_debris", "media_crack"
]


# Per-media-type threshold configuration
# Setiap media type memiliki threshold per kelas karena karakteristik visual berbeda.
MEDIA_CONFIDENCE_THRESHOLDS: dict[str, dict[str, float]] = {
    "PCA": {
        # Plate Count Agar: putih/transparan, koloni kuning/putih,
        # kontras tinggi → threshold lebih ketat (model lebih percaya diri)
        "colony_single": 0.65,
        "colony_merged": 0.60,
        "bubble":        0.55,
        "dust_debris":   0.55,
        "media_crack":   0.50,
    },
    "VRBA": {
        # Violet Red Bile Agar: merah-violet, koloni merah gelap,
        # kontras rendah → threshold lebih longgar
        "colony_single": 0.45,
        "colony_merged": 0.40,
        "bubble":        0.45,
        "dust_debris":   0.45,
        "media_crack":   0.40,
    },
    "BGBB": {
        # Brilliant Green Bile Broth
        "colony_single": 0.55,
        "colony_merged": 0.50,
        "bubble":        0.50,
        "dust_debris":   0.50,
        "media_crack":   0.45,
    },
    "TGEA": {
        # Tryptone Glucose Extract Agar: mirip PCA
        "colony_single": 0.62,
        "colony_merged": 0.58,
        "bubble":        0.55,
        "dust_debris":   0.55,
        "media_crack":   0.50,
    },
    "TSA": {
        # Tryptic Soy Agar: general purpose, mirip PCA tapi lebih kaya nutrisi
        # Koloni lebih bervariasi ukuran → threshold sedikit lebih longgar
        "colony_single": 0.60,
        "colony_merged": 0.55,
        "bubble":        0.55,
        "dust_debris":   0.55,
        "media_crack":   0.50,
    },
    "MACCONKEY": {
        # MacConkey Agar: pink-merah, koloni lactose-fermenting pink/merah
        # Koloni lactose-nonfermenting colorless → threshold lebih longgar
        "colony_single": 0.50,
        "colony_merged": 0.45,
        "bubble":        0.50,
        "dust_debris":   0.50,
        "media_crack":   0.45,
    },
    "R2A": {
        # Reasoner's 2A: media oligotroph, koloni kecil dan transparan
        # Kontras sangat rendah → threshold paling longgar
        "colony_single": 0.42,
        "colony_merged": 0.38,
        "bubble":        0.45,
        "dust_debris":   0.45,
        "media_crack":   0.40,
    },
    "DEFAULT": {
        # Fallback untuk media type yang belum dikalibrasi
        "colony_single": 0.60,
        "colony_merged": 0.55,
        "bubble":        0.55,
        "dust_debris":   0.55,
        "media_crack":   0.50,
    },
}

# ── Alias mapping: nama frontend → key internal ──────────────────────────────
# Frontend mengirim nama lengkap, config pakai singkatan. Map semua alias agar
# threshold per-media SELALU aktif, tidak pernah fallback ke DEFAULT.
MEDIA_TYPE_ALIASES: dict[str, str] = {
    # Plate Count Agar (berbagai ejaan)
    "plate count agar":  "PCA",
    "plate count":       "PCA",
    "pca":               "PCA",
    # Violet Red Bile Agar
    "violet red bile agar": "VRBA",
    "vrba":              "VRBA",
    # Brilliant Green Bile Broth
    "brilliant green bile broth": "BGBB",
    "bgbb":              "BGBB",
    # Tryptic / Tryptone Soy Agar
    "tryptic soy agar":  "TSA",
    "tryptone soy agar": "TSA",
    "tsa":               "TSA",
    # MacConkey
    "macconkey":         "MACCONKEY",
    "macconkey agar":    "MACCONKEY",
    "mac conkey":        "MACCONKEY",
    # R2A
    "r2a":               "R2A",
    "reasoner's 2a":     "R2A",
    "reasoners 2a":      "R2A",
    # TGEA
    "tgea":              "TGEA",
    "tryptone glucose extract agar": "TGEA",
    # BGBB
    "bgbb":              "BGBB",
    # Other → DEFAULT
    "other":             "DEFAULT",
}


# Global IoU threshold untuk NMS (Non-Maximum Suppression)
# Sesuai proposal asli — belum ada alasan empiris untuk mengubah ini
DEFAULT_IOU_THRESHOLD: float = 0.45

# Batas TNTC / TFTC sesuai ISO 4833-1:2013 dan FDA BAM Chapter 3
# INKLUSIF kedua batas: 25 ≤ valid ≤ 250
TFTC_BOUNDARY: int = 25   # count < 25 → TFTC (eksklusif batas bawah)
TNTC_BOUNDARY: int = 250  # count > 250 → TNTC (eksklusif batas atas)

# Batas validasi input koloni (Pydantic / sanity check)
MAX_COLONY_SINGLE: int = 10_000
MAX_COLONY_MERGED: int = 5_000
MAX_MERGED_PER_BBOX: int = 50   # Cap estimasi SA-001 per bounding box


def _resolve_media_key(media_type: str) -> str:
    """
    Resolve nama media type (dari frontend atau raw input) ke kunci internal.
    
    Prioritas:
    1. Exact match (uppercase, strip)
    2. Alias lookup (lowercase)
    3. Fallback ke DEFAULT
    """
    stripped = media_type.strip()
    upper = stripped.upper()

    # 1. Direct key match (sudah singkatan: PCA, VRBA, dll)
    if upper in MEDIA_CONFIDENCE_THRESHOLDS:
        return upper

    # 2. Alias lookup (nama panjang dari frontend)
    alias_key = stripped.lower()
    if alias_key in MEDIA_TYPE_ALIASES:
        return MEDIA_TYPE_ALIASES[alias_key]

    # 3. Fallback
    return "DEFAULT"


def get_threshold(media_type: str, class_name: str) -> float:
    """
    Dapatkan confidence threshold untuk kombinasi media_type + class_name.
    Mendukung nama lengkap (dari frontend) maupun singkatan (internal).

    Args:
        media_type: Jenis media agar (e.g. "Plate Count Agar", "pca", "VRBA")
        class_name: Nama kelas deteksi (e.g. "colony_single")

    Returns:
        Confidence threshold (float antara 0–1)
    """
    key = _resolve_media_key(media_type)
    thresholds = MEDIA_CONFIDENCE_THRESHOLDS.get(key, MEDIA_CONFIDENCE_THRESHOLDS["DEFAULT"])
    return thresholds.get(class_name, 0.60)


def get_all_thresholds(media_type: str) -> dict[str, float]:
    """
    Return semua threshold untuk satu media type.
    Mendukung nama lengkap dari frontend (e.g. "Plate Count Agar").

    Args:
        media_type: Jenis media agar

    Returns:
        Dict {class_name: threshold_value}
    """
    key = _resolve_media_key(media_type)
    return MEDIA_CONFIDENCE_THRESHOLDS.get(key, MEDIA_CONFIDENCE_THRESHOLDS["DEFAULT"]).copy()


def is_detection_above_threshold(
    class_name: str,
    confidence: float,
    media_type: str,
) -> bool:
    """
    Cek apakah satu deteksi memenuhi threshold untuk media type-nya.

    Args:
        class_name: Nama kelas deteksi
        confidence: Confidence score dari model (0–1)
        media_type: Jenis media agar

    Returns:
        True jika confidence >= threshold, False jika tidak
    """
    threshold = get_threshold(media_type, class_name)
    return confidence >= threshold

    threshold = get_threshold(media_type, class_name)
    return confidence >= threshold
