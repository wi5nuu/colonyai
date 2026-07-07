"""
THRESHOLD OPTIMIZATION PER-CLASS DAN PER-MEDIA TYPE
Untuk akurasi maksimal pada kompetisi
"""

# THRESHOLD PER-CLASS (Prioritas Tertinggi)
# Diturunkan untuk menangkap lebih banyak koloni valid.
# Model sudah melakukan filtering lanjutan (size, aspect ratio, NMS).
CLASS_THRESHOLDS = {
    'colony_single': 0.25,  # Turun agar tangkap lebih banyak
    'colony_merged': 0.15,  # Diturunkan drastis — merged colony confidence rendah
    'bubble': 0.25,         # Turun sedikit
    'dust_debris': 0.15,    # Diturunkan — class minoritas
    'media_crack': 0.15,    # Diturunkan — class minoritas
}

# THRESHOLD PER-MEDIA TYPE (Untuk adaptasi berbagai jenis agar)
MEDIA_TYPE_THRESHOLDS = {
    'PCA': {
        'colony_single': 0.35,
        'colony_merged': 0.30,
        'bubble': 0.35,
        'dust_debris': 0.30,
        'media_crack': 0.35,
    },
    'MacConkey': {
        'colony_single': 0.30,
        'colony_merged': 0.25,
        'bubble': 0.30,
        'dust_debris': 0.25,
        'media_crack': 0.30,
    },
    'TSA': {
        'colony_single': 0.30,
        'colony_merged': 0.25,
        'bubble': 0.30,
        'dust_debris': 0.25,
        'media_crack': 0.30,
    },
    'Blood': {
        'colony_single': 0.25,
        'colony_merged': 0.20,
        'bubble': 0.25,
        'dust_debris': 0.20,
        'media_crack': 0.25,
    },
    'default': CLASS_THRESHOLDS  # Fallback
}

# AGGRESSIVE MODE - Untuk gambar sulit seperti kompetisi
# Threshold sangat rendah untuk menangkap semua kemungkinan
AGGRESSIVE_THRESHOLDS = {
    'colony_single': 0.25,
    'colony_merged': 0.20,
    'bubble': 0.15,
    'dust_debris': 0.10,
    'media_crack': 0.15,
}

# SIZE FILTERS (dalam pixels)
# Buang deteksi yang terlalu kecil atau terlalu besar
SIZE_FILTERS = {
    'colony_single': {'min': 8, 'max': 400},
    'colony_merged': {'min': 15, 'max': 600},
    'bubble': {'min': 5, 'max': 200},
    'dust_debris': {'min': 3, 'max': 100},
    'media_crack': {'min': 10, 'max': 800},
}

# ASPECT RATIO FILTERS
# Buang deteksi dengan aspect ratio tidak wajar
ASPECT_RATIO_FILTERS = {
    'colony_single': {'min': 0.3, 'max': 3.0},   # Hampir bulat
    'colony_merged': {'min': 0.2, 'max': 5.0},   # Bisa memanjang
    'bubble': {'min': 0.5, 'max': 2.0},          # Cenderung bulat
    'dust_debris': {'min': 0.2, 'max': 5.0},     # Bisa berbagai bentuk
    'media_crack': {'min': 0.05, 'max': 20.0},   # Sangat memanjang
}

# CONFIDENCE BOOSTING
# Naikkan confidence untuk deteksi di area tertentu
CONFIDENCE_BOOST = {
    'center_plate': 1.15,      # +15% untuk deteksi di tengah plate
    'edge_penalty': 0.85,      # -15% untuk deteksi di tepi (mungkin artifact)
    'high_density_area': 1.10, # +10% untuk area dengan banyak koloni
}

# IOU THRESHOLDS untuk NMS per-class
IOU_THRESHOLDS = {
    'colony_single': 0.40,
    'colony_merged': 0.30,  # Lower karena overlap
    'bubble': 0.45,
    'dust_debris': 0.45,
    'media_crack': 0.35,
}


# ── Alias mapping: nama frontend → key internal ──────────────────────────────
MEDIA_TYPE_ALIASES = {
    "plate count agar":  "PCA",
    "pca":               "PCA",
    "macconkey":         "MacConkey",
    "macconkey agar":    "MacConkey",
    "tsa":               "TSA",
    "tryptic soy agar":  "TSA",
}

def get_threshold(class_name: str, media_type: str = None, aggressive: bool = False) -> float:
    """
    Get optimal threshold untuk class dan media type tertentu
    """
    if aggressive:
        return AGGRESSIVE_THRESHOLDS.get(class_name, 0.15)

    if media_type:
        # Resolve alias
        key = media_type.strip().lower()
        internal_key = MEDIA_TYPE_ALIASES.get(key, media_type)
        
        if internal_key in MEDIA_TYPE_THRESHOLDS:
            return MEDIA_TYPE_THRESHOLDS[internal_key].get(class_name, 0.40)

    return CLASS_THRESHOLDS.get(class_name, 0.40)


def filter_by_size(bbox: dict, class_name: str) -> bool:
    """
    Filter deteksi berdasarkan ukuran

    Args:
        bbox: Bounding box dengan keys 'width' dan 'height'
        class_name: Nama class

    Returns:
        True jika ukuran valid, False jika harus dibuang
    """
    size_filter = SIZE_FILTERS.get(class_name, {'min': 5, 'max': 1000})

    width = bbox['width']
    height = bbox['height']
    area = width * height

    min_area = size_filter['min'] ** 2
    max_area = size_filter['max'] ** 2

    return min_area <= area <= max_area


def filter_by_aspect_ratio(bbox: dict, class_name: str) -> bool:
    """
    Filter deteksi berdasarkan aspect ratio

    Args:
        bbox: Bounding box dengan keys 'width' dan 'height'
        class_name: Nama class

    Returns:
        True jika aspect ratio valid, False jika harus dibuang
    """
    ratio_filter = ASPECT_RATIO_FILTERS.get(class_name, {'min': 0.1, 'max': 10.0})

    width = bbox['width']
    height = bbox['height']

    if height == 0:
        return False

    aspect_ratio = width / height

    return ratio_filter['min'] <= aspect_ratio <= ratio_filter['max']


def boost_confidence(confidence: float, bbox: dict, image_shape: tuple, class_name: str) -> float:
    """
    Boost confidence berdasarkan posisi deteksi

    Args:
        confidence: Confidence score asli
        bbox: Bounding box dengan keys 'x', 'y', 'width', 'height'
        image_shape: (height, width) dari gambar
        class_name: Nama class

    Returns:
        Confidence score yang sudah di-boost
    """
    img_h, img_w = image_shape[:2]

    # Hitung center dari bbox
    center_x = bbox['x'] + bbox['width'] / 2
    center_y = bbox['y'] + bbox['height'] / 2

    # Hitung jarak dari center image (normalized 0-1)
    dist_from_center = ((center_x - img_w/2)**2 + (center_y - img_h/2)**2)**0.5
    max_dist = ((img_w/2)**2 + (img_h/2)**2)**0.5
    normalized_dist = dist_from_center / max_dist

    # Boost jika dekat center, penalty jika dekat edge
    if normalized_dist < 0.3:  # Center 30%
        confidence *= CONFIDENCE_BOOST['center_plate']
    elif normalized_dist > 0.8:  # Edge 20%
        confidence *= CONFIDENCE_BOOST['edge_penalty']

    # Cap at 1.0
    return min(confidence, 1.0)


def get_iou_threshold(class_name: str) -> float:
    """
    Get IOU threshold untuk NMS per-class

    Args:
        class_name: Nama class

    Returns:
        IOU threshold
    """
    return IOU_THRESHOLDS.get(class_name, 0.40)
