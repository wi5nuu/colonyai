"""
THRESHOLD OPTIMIZATION PER-CLASS DAN PER-MEDIA TYPE
Untuk akurasi maksimal — dikalibrasi berdasarkan confidence aktual 14 sampel (20260802)

Metodologi kalibrasi:
  - Scan semua sampel dengan conf=0.01 (threshold minimum YOLO)
  - Ambil max-confidence per class per gambar
  - threshold = percentile-60 * 0.55, dengan floor minimum per class
  - Hasil: threshold menyesuaikan kemampuan nyata model, bukan asumsi

Confidence aktual model (max per class dari 14 sampel):
  colony_single: max=0.338, p60=0.195  → threshold=0.05 (floor)
  colony_merged: max=0.924, p60=0.112  → threshold=0.05 (floor)
  bubble:        max=0.389, p60=0.141  → threshold=0.08
  dust_debris:   max=0.464, p60=0.238  → threshold=0.13
  media_crack:   max=0.146, p60=0.077  → threshold=0.05 (floor)
"""

# CALIB-3: Dikalibrasi berdasarkan confidence aktual 14 sampel (20260802)
CLASS_THRESHOLDS = {
    'colony_single': 0.05,   # CALIB-3: turun dari 0.35 — max conf hanya 0.338, threshold lama memblokir semua
    'colony_merged': 0.05,   # CALIB-3: turun dari 0.12 — gambar gelap max conf 0.025-0.059
    'bubble':        0.08,   # CALIB-3: turun dari 0.15 — bubble_artifact max conf 0.220
    'dust_debris':   0.13,   # CALIB-3: turun dari 0.25 — dust synthetic max conf 0.464, p25=0.178
    'media_crack':   0.05,   # CALIB-3: turun dari 0.12 — max conf hanya 0.146
}

# THRESHOLD PER-MEDIA TYPE — CALIB-3: semua diselaraskan dengan CLASS_THRESHOLDS baru
MEDIA_TYPE_THRESHOLDS = {
    'PCA': {
        # Background putih terang — kontras tinggi
        'colony_single': 0.05,
        'colony_merged': 0.05,
        'bubble':        0.08,
        'dust_debris':   0.13,
        'media_crack':   0.05,
    },
    'MacConkey': {
        # Background merah muda — koloni berwarna
        'colony_single': 0.05,
        'colony_merged': 0.05,
        'bubble':        0.08,
        'dust_debris':   0.13,
        'media_crack':   0.05,
    },
    'TSA': {
        # Background putih/kuning — mirip PCA
        'colony_single': 0.05,
        'colony_merged': 0.05,
        'bubble':        0.08,
        'dust_debris':   0.13,
        'media_crack':   0.05,
    },
    'Blood': {
        # Background gelap merah — kontras rendah untuk koloni
        'colony_single': 0.05,
        'colony_merged': 0.05,
        'bubble':        0.06,
        'dust_debris':   0.13,
        'media_crack':   0.05,
    },
    'VRBA': {
        # Background biru-merah gelap — kontras sangat rendah
        'colony_single': 0.05,
        'colony_merged': 0.05,
        'bubble':        0.06,
        'dust_debris':   0.13,
        'media_crack':   0.05,
    },
    'SDA': {
        # Fungi/yeast — koloni besar, overlap sering
        'colony_single': 0.05,
        'colony_merged': 0.05,
        'bubble':        0.06,
        'dust_debris':   0.13,
        'media_crack':   0.05,
    },
    'EMB': {
        # Background gelap — threshold minimum
        'colony_single': 0.05,
        'colony_merged': 0.05,
        'bubble':        0.06,
        'dust_debris':   0.13,
        'media_crack':   0.05,
    },
    'BGBB': {
        # Background biru gelap
        'colony_single': 0.05,
        'colony_merged': 0.05,
        'bubble':        0.06,
        'dust_debris':   0.13,
        'media_crack':   0.05,
    },
    'R2A': {
        # Koloni sangat kecil — threshold minimum semua class
        'colony_single': 0.05,
        'colony_merged': 0.05,
        'bubble':        0.06,
        'dust_debris':   0.10,
        'media_crack':   0.05,
    },
    'default': CLASS_THRESHOLDS
}

# AGGRESSIVE MODE — untuk gambar sulit (gelap, buram, low-res)
# CALIB-3: Semua di bawah CLASS_THRESHOLDS, tapi di atas 0.01 (floor YOLO)
AGGRESSIVE_THRESHOLDS = {
    'colony_single': 0.03,
    'colony_merged': 0.03,
    'bubble':        0.05,
    'dust_debris':   0.08,
    'media_crack':   0.03,
}

# CALIB-3: Threshold adaptif berdasarkan brightness gambar
# Skala proporsional dari CLASS_THRESHOLDS — gambar gelap lebih sensitif, terang lebih selektif
# Semua nilai diselaraskan dengan confidence aktual model
BRIGHTNESS_THRESHOLDS = {
    # mean brightness < 60 → gambar sangat gelap — pakai AGGRESSIVE
    'very_dark': {
        'colony_single': 0.03,
        'colony_merged': 0.03,
        'bubble':        0.05,
        'dust_debris':   0.08,
        'media_crack':   0.03,
    },
    # mean brightness 60–100 → gambar agak gelap — sedikit di bawah CLASS_THRESHOLDS
    'dark': {
        'colony_single': 0.04,
        'colony_merged': 0.04,
        'bubble':        0.06,
        'dust_debris':   0.10,
        'media_crack':   0.04,
    },
    # mean brightness 100–160 → normal
    'normal': CLASS_THRESHOLDS,
    # mean brightness 160–200 → agak terang — sedikit di atas CLASS_THRESHOLDS
    'bright': {
        'colony_single': 0.08,
        'colony_merged': 0.07,
        'bubble':        0.10,
        'dust_debris':   0.16,
        'media_crack':   0.07,
    },
    # mean brightness > 200 → sangat terang / overexposed — lebih selektif
    'very_bright': {
        'colony_single': 0.12,
        'colony_merged': 0.10,
        'bubble':        0.13,
        'dust_debris':   0.20,
        'media_crack':   0.10,
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

