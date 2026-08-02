"""
COLONY DETECTOR OPTIMIZED - Untuk Akurasi Maksimal
Dengan threshold per-class, post-processing, dan confidence boosting
"""
import numpy as np
from pathlib import Path

try:
    from ultralytics import YOLO
    import cv2
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False
    cv2 = None
    YOLO = None
from typing import List, Dict, Any, Tuple, Optional
import os
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache
import threading
from app.core.config import settings
from app.core.thresholds_optimized import (
    get_threshold,
    filter_by_size,
    filter_by_aspect_ratio,
    boost_confidence,
    get_iou_threshold,
    AGGRESSIVE_THRESHOLDS,
    MAX_DETECTIONS_PER_CLASS,
    MAX_TOTAL_DETECTIONS,
)

# 5-class architecture
VALID_COLONY_CLASSES = {'colony_single', 'colony_merged'}
ARTIFACT_CLASSES = {'bubble', 'dust_debris', 'media_crack'}
ALL_CLASSES = VALID_COLONY_CLASSES | ARTIFACT_CLASSES
logger = logging.getLogger(__name__)

# Class colors — stored as BGR for OpenCV drawing.
# cv2.imwrite saves BGR, browser reads as RGB → R and B are swapped when displayed.
# To show the intended color in browser: swap R↔B here.
# Intended display colors (RGB): single=green, merged=orange, bubble=blue, debris=red, crack=purple
CLASS_COLORS_BGR = {
    'colony_single': (80, 220, 50),    # BGR → displayed as RGB (50,220,80) = green
    'colony_merged': (0, 140, 255),    # BGR → displayed as RGB (255,140,0) = orange
    'bubble':        (255, 120, 30),   # BGR → displayed as RGB (30,120,255) = blue
    'dust_debris':   (50, 50, 220),    # BGR → displayed as RGB (220,50,50) = red
    'media_crack':   (180, 60, 200),   # BGR → displayed as RGB (200,60,180) = purple
}


# Global thread pool for blocking operations (YOLO inference, cv2, etc.)
_inference_executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="yolo")

# Global singleton cache (model loaded once at first use)
_global_detector: Optional['ColonyDetectorOptimized'] = None
# FIX-6: Lock to prevent race condition when multiple requests hit get_detector() simultaneously
_detector_lock = threading.Lock()


def get_detector(model_path: str = None) -> 'ColonyDetectorOptimized':
    global _global_detector
    path = model_path or _get_active_model_path() or settings.MODEL_PATH
    # Double-checked locking — fast path skips lock once initialized
    if _global_detector is not None and _global_detector.model_path == path:
        return _global_detector
    with _detector_lock:
        if _global_detector is None or _global_detector.model_path != path:
            _global_detector = ColonyDetectorOptimized(path)
    return _global_detector


def _get_active_model_path() -> str:
    """Check if an active model is set via the model management API."""
    active_file = Path(settings.MODEL_PATH).parent / ".active"
    if active_file.exists():
        active_name = active_file.read_text().strip()
        active_path = str(active_file.parent / active_name)
        if os.path.exists(active_path):
            return active_path
    return ""


def reset_detector():
    """Force reload on next get_detector() call. Used after model activation."""
    global _global_detector
    _global_detector = None
    logger.info("Detector singleton reset — will reload model on next request.")


class ColonyDetectorOptimized:
    """
    YOLOv8-based colony detector dengan optimasi akurasi maksimal

    Model loading is cached globally — hanya load 1x untuk semua request.
    Gunakan get_detector() untuk mendapatkan instance singleton.

    Features:
    - Threshold per-class
    - Size dan aspect ratio filtering
    - Confidence boosting berdasarkan posisi
    - Aggressive mode untuk gambar sulit
    - Test-Time Augmentation (TTA)
    """

    def __init__(self, model_path: str = None):
        self.model_path = model_path or settings.MODEL_PATH
        self.img_size = settings.MODEL_IMG_SIZE

        if not YOLO_AVAILABLE:
            raise RuntimeError(
                "YOLO/ultralytics not installed. Run: pip install ultralytics"
            )

        if os.path.exists(self.model_path):
            self.model = YOLO(self.model_path)
            logger.info("Loaded optimized model from %s", self.model_path)
            # FIX-1: Verify model.names matches expected 5-class architecture
            expected = {'colony_single', 'colony_merged', 'bubble', 'dust_debris', 'media_crack'}
            actual = set(self.model.names.values()) if self.model.names else set()
            missing = expected - actual
            extra = actual - expected
            if missing:
                logger.warning(
                    "Model at %s is missing expected classes: %s. "
                    "Detection accuracy will be reduced for these classes.",
                    self.model_path, missing
                )
            if extra:
                logger.warning(
                    "Model at %s has unexpected classes: %s. "
                    "These will be filtered out during post-processing.",
                    self.model_path, extra
                )
            logger.info("Model classes: %s", actual)
        else:
            # FIX-5: Use self.model_path instead of hardcoded filename
            raise RuntimeError(
                f"Model not found at {self.model_path}. "
                "Please ensure the model file exists in the models/ folder."
            )

    async def detect_async(
        self,
        image: np.ndarray,
        media_type: str = None,
        aggressive: bool = False,
        use_tta: bool = False,
        apply_filters: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Async version of detect() — runs blocking YOLO inference in thread pool.
        Tidak blocking event loop, cocok untuk real-time.
        """
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            _inference_executor,
            self.detect,
            image, media_type, aggressive, use_tta, apply_filters
        )

    def detect(
        self,
        image: np.ndarray,
        media_type: str = None,
        aggressive: bool = False,
        use_tta: bool = False,
        apply_filters: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Detect colonies dengan optimasi akurasi maksimal

        Args:
            image: RGB image array
            media_type: Jenis media (PCA, MacConkey, dll) untuk threshold adaptif
            aggressive: Gunakan threshold sangat rendah untuk gambar sulit
            use_tta: Gunakan Test-Time Augmentation (flip + multi-scale)
            apply_filters: Terapkan size dan aspect ratio filtering

        Returns:
            List of detections dengan class, confidence, bbox, dll
        """
        # Image size validation
        MAX_DIM = self.img_size * 2
        h, w = image.shape[:2]

        if h > MAX_DIM or w > MAX_DIM:
            scale = MAX_DIM / max(h, w)
            new_w, new_h = int(w * scale), int(h * scale)
            if cv2 is not None:
                image = cv2.resize(image, (new_w, new_h))
                logger.info("Resized from %dx%d to %dx%d", w, h, new_w, new_h)

        # original_shape diambil SETELAH resize agar boost_confidence pakai koordinat yang benar
        original_shape = image.shape[:2]

        # UPGRADE-3: Hitung brightness gambar untuk adaptive threshold
        mean_brightness = float(np.mean(image)) if image is not None else None

        # Gunakan threshold SANGAT RENDAH untuk inference awal
        # Filtering per-class dilakukan setelahnya
        initial_conf = 0.01 if aggressive else 0.05

        if use_tta:
            detections = self._detect_with_tta(image, initial_conf)
        else:
            detections = self._detect_single(image, initial_conf)

        # Post-processing: filter per-class
        filtered_detections = []

        for det in detections:
            class_name = det['class_name']
            confidence = det['confidence']
            bbox = det['bbox']

            # 1. Check threshold per-class (dengan adaptive brightness)
            threshold = get_threshold(class_name, media_type, aggressive, mean_brightness)
            if confidence < threshold:
                continue

            # 2. Size filter
            if apply_filters and not filter_by_size(bbox, class_name):
                continue

            # 3. Aspect ratio filter
            if apply_filters and not filter_by_aspect_ratio(bbox, class_name):
                continue

            # FIX-ACC-1: Simpan confidence original, tapi JANGAN boost dulu.
            # Boosting dilakukan SETELAH NMS agar urutan sort NMS tidak terdistorsi.
            det['confidence_original'] = confidence
            filtered_detections.append(det)

        # 4. NMS per-class untuk remove duplicates (menggunakan confidence asli)
        nms_detections = self._nms_per_class(filtered_detections)

        # 5. Confidence boosting SETELAH NMS — boost tidak mempengaruhi seleksi NMS
        for det in nms_detections:
            det['confidence'] = boost_confidence(
                det['confidence'], det['bbox'], original_shape, det['class_name']
            )

        # UPGRADE-4: Over-detection guard — cap per-class dan total
        # Sort by confidence descending agar yang dibuang adalah yang paling tidak yakin
        nms_detections.sort(key=lambda d: d['confidence'], reverse=True)
        class_counts: Dict[str, int] = {}
        final_detections = []
        for det in nms_detections:
            cls = det['class_name']
            class_counts[cls] = class_counts.get(cls, 0) + 1
            if class_counts[cls] > MAX_DETECTIONS_PER_CLASS.get(cls, 500):
                logger.debug("Over-detection guard: dropping %s (count=%d)", cls, class_counts[cls])
                continue
            if len(final_detections) >= MAX_TOTAL_DETECTIONS:
                logger.warning("Over-detection guard: total cap %d reached", MAX_TOTAL_DETECTIONS)
                break
            final_detections.append(det)

        logger.info(
            "Detection complete: brightness=%.1f, total=%d (after guard=%d), classes=%s",
            mean_brightness or 0, len(nms_detections), len(final_detections),
            {c: n for c, n in class_counts.items()}
        )

        return final_detections

    def _detect_single(self, image: np.ndarray, conf_threshold: float) -> List[Dict[str, Any]]:
        """Single inference tanpa augmentation"""
        results = self.model(
            image,
            conf=conf_threshold,
            # FIX-ACC-2: Naikkan IoU internal YOLO ke 0.7 agar tidak double-suppress.
            # NMS per-class custom kita (iou threshold ~0.40) yang menentukan final filtering,
            # bukan YOLO internal. Dengan 0.35 sebelumnya, YOLO sudah membuang banyak
            # deteksi valid sebelum pipeline kita sempat memprosesnya.
            iou=0.7,
            imgsz=self.img_size,
            verbose=False
        )

        detections = []
        result = results[0]

        if result.boxes is not None and len(result.boxes) > 0:
            boxes = result.boxes.xyxy.cpu().numpy()
            confidences = result.boxes.conf.cpu().numpy()
            class_ids = result.boxes.cls.cpu().numpy().astype(int)

            for box, conf_score, cls_id in zip(boxes, confidences, class_ids):
                x1, y1, x2, y2 = box
                class_name = self.model.names.get(cls_id, f'class_{cls_id}')

                detection = {
                    'class_name': class_name,
                    'confidence': float(conf_score),
                    'bbox': {
                        'x': int(x1),
                        'y': int(y1),
                        'width': int(x2 - x1),
                        'height': int(y2 - y1)
                    },
                    'is_valid_colony': class_name in VALID_COLONY_CLASSES,
                    'color': CLASS_COLORS_BGR.get(class_name, (200, 200, 200))
                }
                detections.append(detection)

        return detections

    def _detect_with_tta(self, image: np.ndarray, conf_threshold: float) -> List[Dict[str, Any]]:
        """
        Test-Time Augmentation: flip horizontal + vertical + original
        Merge results dengan voting
        """
        h, w = image.shape[:2]

        # Original — weight 1.0
        dets_original = self._detect_single(image, conf_threshold)
        for det in dets_original:
            det['_tta_weight'] = 1.0

        # Horizontal flip — weight 0.8
        img_hflip = cv2.flip(image, 1) if cv2 is not None else image
        dets_hflip = self._detect_single(img_hflip, conf_threshold)
        for det in dets_hflip:
            det['bbox']['x'] = w - det['bbox']['x'] - det['bbox']['width']
            det['_tta_weight'] = 0.8

        # Vertical flip — weight 0.8
        img_vflip = cv2.flip(image, 0) if cv2 is not None else image
        dets_vflip = self._detect_single(img_vflip, conf_threshold)
        for det in dets_vflip:
            det['bbox']['y'] = h - det['bbox']['y'] - det['bbox']['height']
            det['_tta_weight'] = 0.8

        # Merge all detections (weights already tagged per detection)
        all_dets = dets_original + dets_hflip + dets_vflip
        return self._merge_tta_detections(all_dets)

    def _merge_tta_detections(self, detections: List[Dict]) -> List[Dict]:
        """Merge TTA detections dengan weighted voting via IoU clustering.
        Weights must be pre-tagged as '_tta_weight' on each detection."""
        if not detections:
            return []

        # Group overlapping detections per class
        merged = []
        used = set()
        for i, det in enumerate(detections):
            if i in used:
                continue
            # Find all detections with IoU > 0.45 of same class
            cluster = [i]
            used.add(i)
            for j, other in enumerate(detections):
                if j in used or det['class_name'] != other['class_name']:
                    continue
                if self._iou(det['bbox'], other['bbox']) > 0.45:
                    cluster.append(j)
                    used.add(j)

            if len(cluster) == 1:
                # Single detection — tetap pakai confidence asli
                best = det.copy()
                best.pop('_tta_weight', None)
                merged.append(best)
            else:
                # Weighted average of cluster
                total_w = sum(detections[k]['_tta_weight'] for k in cluster)
                if total_w == 0:
                    best = det.copy()
                    best.pop('_tta_weight', None)
                    merged.append(best)
                    continue

                avg_conf = sum(
                    detections[k]['confidence'] * detections[k]['_tta_weight']
                    for k in cluster
                ) / total_w

                # Ambil bbox dari detection dengan confidence tertinggi
                best_k = max(cluster, key=lambda k: detections[k]['confidence'])
                best = detections[best_k].copy()

                # Boost confidence jika muncul di >1 augmentation
                boost = min(1.0 + (len(cluster) - 1) * 0.05, 1.15)
                best['confidence'] = min(avg_conf * boost, 1.0)
                best.pop('_tta_weight', None)
                merged.append(best)

        return merged

    def _nms_per_class(self, detections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Non-Maximum Suppression per-class"""
        if not detections:
            return []

        # Group by class
        by_class = {}
        for det in detections:
            cls = det['class_name']
            if cls not in by_class:
                by_class[cls] = []
            by_class[cls].append(det)

        # NMS per class
        final = []
        for cls_name, cls_dets in by_class.items():
            iou_thresh = get_iou_threshold(cls_name)
            nms_dets = self._nms(cls_dets, iou_thresh)
            final.extend(nms_dets)

        return final

    def _nms(self, detections: List[Dict], iou_threshold: float) -> List[Dict]:
        """Standard NMS algorithm"""
        if not detections:
            return []

        # Sort by confidence
        detections = sorted(detections, key=lambda x: x['confidence'], reverse=True)

        keep = []
        while detections:
            best = detections.pop(0)
            keep.append(best)

            # Remove overlapping boxes
            detections = [
                det for det in detections
                if self._iou(best['bbox'], det['bbox']) < iou_threshold
            ]

        return keep

    def _iou(self, box1: dict, box2: dict) -> float:
        """Calculate IoU between two boxes"""
        x1_1, y1_1 = box1['x'], box1['y']
        x2_1, y2_1 = x1_1 + box1['width'], y1_1 + box1['height']

        x1_2, y1_2 = box2['x'], box2['y']
        x2_2, y2_2 = x1_2 + box2['width'], y1_2 + box2['height']

        # Intersection
        x1_i = max(x1_1, x1_2)
        y1_i = max(y1_1, y1_2)
        x2_i = min(x2_1, x2_2)
        y2_i = min(y2_1, y2_2)

        if x2_i < x1_i or y2_i < y1_i:
            return 0.0

        inter_area = (x2_i - x1_i) * (y2_i - y1_i)

        # Union
        box1_area = box1['width'] * box1['height']
        box2_area = box2['width'] * box2['height']
        union_area = box1_area + box2_area - inter_area

        return inter_area / union_area if union_area > 0 else 0.0

    def get_detection_summary(self, detections: List[Dict[str, Any]]) -> Dict[str, int]:
        """Get summary count by class"""
        summary = {cls: 0 for cls in ALL_CLASSES}
        for detection in detections:
            class_name = detection['class_name']
            if class_name in summary:
                summary[class_name] += 1
        return summary

    def filter_valid_colonies(self, detections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Filter to only valid colonies"""
        return [d for d in detections if d['is_valid_colony']]

    def get_valid_colony_count(self, detections: List[Dict[str, Any]]) -> int:
        """Get count of valid colonies only"""
        return sum(1 for d in detections if d['is_valid_colony'])

    def get_average_confidence(self, detections: List[Dict[str, Any]], valid_only: bool = False) -> float:
        """Get average confidence score across all detections (including artifacts)"""
        filtered = self.filter_valid_colonies(detections) if valid_only else detections
        if not filtered:
            return 0.0
        return sum(d['confidence'] for d in filtered) / len(filtered)

    def get_reliability_indicator(self, detections: List[Dict[str, Any]]) -> str:
        """Get plate-level reliability indicator"""
        avg_conf = self.get_average_confidence(detections, valid_only=True)
        if avg_conf >= 0.8:
            return 'high'
        elif avg_conf >= 0.6:
            return 'medium'
        else:
            return 'low'
