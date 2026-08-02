"""
THRESHOLD OPTIMIZATION PER-CLASS DAN PER-MEDIA TYPE
Untuk akurasi maksimal — dikalibrasi berdasarkan hasil test colony_best_new.pt
"""

# UPGRADE-2: Kalibrasi threshold berdasarkan hasil test Model B
# colony_single: Model B sangat agresif (1387 deteksi) → naikkan ke 0.35
# colony_merged: Model B under-detect (81) → turunkan ke 0.12
# bubble: sudah baik, pertahankan
# dust_debris: Model B sangat lemah (7) → turunkan ke 0.12
# media_crack: kedua model lemah → turunkan ke 0.12
CLASS_THRESHOLDS = {
    'colony_single': 0.35,  # UPGRADE-2: naik dari 0.15 — Model B over-detects single
    'colony_merged': 0.12,  # UPGRADE-2: turun dari 0.15 — Model B under-detects merged
    'bubble':        0.15,  # sudah baik
    'dust_debris':   0.25,  # DUST-FINETUNE: naik dari 0.08 — model fine-tuned mAP50=0.986 (20260802)
    'media_crack':   0.12,  # UPGRADE-2: turun dari 0.15 — kedua model lemah di crack
}

# THRESHOLD PER-MEDIA TYPE
MEDIA_TYPE_THRESHOLDS = {
    'PCA': {
        'colony_single': 0.35,
        'colony_merged': 0.12,
        'bubble':        0.15,
        'dust_debris':   0.25,
        'media_crack':   0.15,
    },
    'MacConkey': {
        'colony_single': 0.35,
        'colony_merged': 0.12,
        'bubble':        0.15,
        'dust_debris':   0.25,
        'media_crack':   0.15,
    },
    'TSA': {
        'colony_single': 0.35,
        'colony_merged': 0.12,
        'bubble':        0.15,
        'dust_debris':   0.25,
        'media_crack':   0.15,
    },
    'Blood': {
        # Background gelap merah — colony threshold lebih rendah
        'colony_single': 0.30,
        'colony_merged': 0.12,
        'bubble':        0.12,
        'dust_debris':   0.25,
        'media_crack':   0.15,
    },
    'VRBA': {
        # Background biru-merah gelap — kontras rendah
        'colony_single': 0.28,
        'colony_merged': 0.12,
        'bubble':        0.12,
        'dust_debris':   0.25,
        'media_crack':   0.15,
    },
    'SDA': {
        # Fungi/yeast — koloni besar, overlap sering
        'colony_single': 0.30,
        'colony_merged': 0.10,
        'bubble':        0.12,
        'dust_debris':   0.25,
        'media_crack':   0.15,
    },
    'EMB': {
        # Background gelap — threshold lebih rendah
        'colony_single': 0.28,
        'colony_merged': 0.12,
        'bubble':        0.12,
        'dust_debris':   0.25,
        'media_crack':   0.15,
    },
    'BGBB': {
        # Background biru gelap
        'colony_single': 0.28,
        'colony_merged': 0.12,
        'bubble':        0.12,
        'dust_debris':   0.25,
        'media_crack':   0.15,
    },
    'R2A': {
        # Koloni sangat kecil — threshold rendah untuk semua
        'colony_single': 0.25,
        'colony_merged': 0.10,
        'bubble':        0.10,
        'dust_debris':   0.25,
        'media_crack':   0.12,
    },
    'default': CLASS_THRESHOLDS
}

# AGGRESSIVE MODE — untuk gambar sulit (gelap, buram, low-res)
AGGRESSIVE_THRESHOLDS = {
    'colony_single': 0.20,  # Lebih rendah tapi tidak terlalu agresif
    'colony_merged': 0.08,
    'bubble':        0.08,
    'dust_debris':   0.15,  # DUST-FINETUNE: naik dari 0.08 — model fine-tuned, aggressive masih lebih rendah dari normal
    'media_crack':   0.08,
}

# UPGRADE-3: Threshold adaptif berdasarkan brightness gambar
# Gambar terang (overexposed) → naikkan threshold agar tidak over-detect
# Gambar gelap (underexposed) → turunkan threshold agar tidak under-detect
BRIGHTNESS_THRESHOLDS = {
    # mean brightness < 60 → gambar sangat gelap
    'very_dark': {
        'colony_single': 0.20,
        'colony_merged': 0.10,
        'bubble':        0.25,  # Naikkan bubble threshold di gambar gelap — cegah false positive
        'dust_debris':   0.18,  # DUST-FINETUNE: lebih rendah di gambar gelap, tapi masih di atas min
        'media_crack':   0.10,
    },
    # mean brightness 60–100 → gambar agak gelap
    'dark': {
        'colony_single': 0.28,
        'colony_merged': 0.12,
        'bubble':        0.20,  # Naikkan bubble threshold di gambar agak gelap
        'dust_debris':   0.25,
        'media_crack':   0.12,
    },
    # mean brightness 100–160 → normal
    'normal': CLASS_THRESHOLDS,
    # mean brightness 160–200 → agak terang
    'bright': {
        'colony_single': 0.42,
        'colony_merged': 0.15,
        'bubble':        0.20,
        'dust_debris':   0.25,
        'media_crack':   0.15,
    },
    # mean brightness > 200 → sangat terang / overexposed
    'very_bright': {
        'colony_single': 0.50,
        'colony_merged': 0.20,
        'bubble':        0.25,
        'dust_debris':   0.25,  # DUST-FINETUNE: align with fine-tuned model threshold
        'media_crack':   0.20,
    },
}

def get_brightness_category(mean_brightness: float) -> str:
    """Kategorikan brightness gambar."""
    if mean_brightness < 60:
        return 'very_dark'
    elif mean_brightness < 100:
        return 'dark'
    elif mean_brightness < 160:
        return 'normal'
    elif mean_brightness < 200:
        return 'bright'
    else:
        return 'very_bright'

# UPGRADE-4: Batas maksimum deteksi per gambar untuk cegah over-detection
# Berdasarkan ISO 4833 — plate dengan >250 koloni dinyatakan TNTC
# Buffer 2x untuk include artifacts
MAX_DETECTIONS_PER_CLASS = {
    'colony_single': 300,
    'colony_merged': 150,
    'bubble':        200,
    'dust_debris':   100,
    'media_crack':    50,
}
MAX_TOTAL_DETECTIONS = 600

# SIZE FILTERS (dalam pixels pada gambar 640x640)
SIZE_FILTERS = {
    'colony_single': {'min': 6,  'max': 350},
    'colony_merged': {'min': 5,  'max': 600},
    'bubble':        {'min': 5,  'max': 200},
    'dust_debris':   {'min': 3,  'max': 100},
    'media_crack':   {'min': 10, 'max': 800},
}

# ASPECT RATIO FILTERS
ASPECT_RATIO_FILTERS = {
    'colony_single': {'min': 0.3,  'max': 3.0},
    'colony_merged': {'min': 0.2,  'max': 5.0},
    'bubble':        {'min': 0.5,  'max': 2.0},
    'dust_debris':   {'min': 0.2,  'max': 5.0},
    'media_crack':   {'min': 0.05, 'max': 20.0},
}

# CONFIDENCE BOOSTING
CONFIDENCE_BOOST = {
    'center_plate':     1.15,
    'edge_penalty':     0.85,
    'high_density_area': 1.10,
}

# IOU THRESHOLDS untuk NMS per-class
IOU_THRESHOLDS = {
    'colony_single': 0.40,
    'colony_merged': 0.30,
    'bubble':        0.45,
    'dust_debris':   0.45,
    'media_crack':   0.35,
}


# ── Alias mapping: nama frontend → key internal ──────────────────────────────
MEDIA_TYPE_ALIASES = {
    "plate count agar":          "PCA",
    "pca":                       "PCA",
    "macconkey":                 "MacConkey",
    "macconkey agar":            "MacConkey",
    "mac":                       "MacConkey",
    "tsa":                       "TSA",
    "tryptic soy agar":          "TSA",
    "trypticase soy agar":       "TSA",
    "blood":                     "Blood",
    "blood agar":                "Blood",
    "bap":                       "Blood",
    "ba":                        "Blood",
    "vrba":                      "VRBA",
    "violet red bile agar":      "VRBA",
    "sda":                       "SDA",
    "sabouraud":                 "SDA",
    "sabouraud dextrose agar":   "SDA",
    "emb":                       "EMB",
    "eosin methylene blue":      "EMB",
    "bgbb":                      "BGBB",
    "bile green brilliant blue":  "BGBB",
    "r2a":                       "R2A",
    "reasoner's 2a":             "R2A",
    "reasoners 2a":              "R2A",
}


def get_threshold(
    class_name: str,
    media_type: str = None,
    aggressive: bool = False,
    brightness: float = None,
) -> float:
    """
    Get optimal threshold untuk class, media type, dan brightness gambar.

    Priority: aggressive > brightness-adaptive > media-type > class default
    """
    if aggressive:
        return AGGRESSIVE_THRESHOLDS.get(class_name, 0.10)

    # UPGRADE-3: Adaptive threshold berdasarkan brightness
    if brightness is not None:
        cat = get_brightness_category(brightness)
        if cat != 'normal':
            bright_thresh = BRIGHTNESS_THRESHOLDS[cat].get(class_name)
            if bright_thresh is not None:
                # Blend dengan media-type threshold jika ada
                if media_type:
                    key = media_type.strip().lower()
                    internal_key = MEDIA_TYPE_ALIASES.get(key, media_type)
                    if internal_key in MEDIA_TYPE_THRESHOLDS:
                        media_thresh = MEDIA_TYPE_THRESHOLDS[internal_key].get(class_name)
                        if media_thresh is not None:
                            # Ambil yang lebih ketat (max) untuk cegah false positive
                            return max(bright_thresh, media_thresh)
                return bright_thresh

    if media_type:
        key = media_type.strip().lower()
        internal_key = MEDIA_TYPE_ALIASES.get(key, media_type)
        if internal_key in MEDIA_TYPE_THRESHOLDS:
            return MEDIA_TYPE_THRESHOLDS[internal_key].get(
                class_name, CLASS_THRESHOLDS.get(class_name, 0.20)
            )

    return CLASS_THRESHOLDS.get(class_name, 0.20)


def filter_by_size(bbox: dict, class_name: str) -> bool:
    size_filter = SIZE_FILTERS.get(class_name, {'min': 5, 'max': 1000})
    width  = bbox['width']
    height = bbox['height']
    area   = width * height
    return size_filter['min'] ** 2 <= area <= size_filter['max'] ** 2


def filter_by_aspect_ratio(bbox: dict, class_name: str) -> bool:
    ratio_filter = ASPECT_RATIO_FILTERS.get(class_name, {'min': 0.1, 'max': 10.0})
    width  = bbox['width']
    height = bbox['height']
    if height == 0:
        return False
    aspect_ratio = width / height
    return ratio_filter['min'] <= aspect_ratio <= ratio_filter['max']


def boost_confidence(confidence: float, bbox: dict, image_shape: tuple, class_name: str) -> float:
    img_h, img_w = image_shape[:2]
    center_x = bbox['x'] + bbox['width'] / 2
    center_y = bbox['y'] + bbox['height'] / 2
    dist_from_center = ((center_x - img_w/2)**2 + (center_y - img_h/2)**2)**0.5
    max_dist = ((img_w/2)**2 + (img_h/2)**2)**0.5
    normalized_dist = dist_from_center / max_dist if max_dist > 0 else 0

    if normalized_dist < 0.3:
        confidence *= CONFIDENCE_BOOST['center_plate']
    elif normalized_dist > 0.8:
        confidence *= CONFIDENCE_BOOST['edge_penalty']

    return min(confidence, 1.0)


def get_iou_threshold(class_name: str) -> float:
    return IOU_THRESHOLDS.get(class_name, 0.40)

