"""
COLONY DETECTOR OPTIMIZED - Untuk Akurasi Maksimal
Dengan threshold per-class, post-processing, dan confidence boosting
"""
from ultralytics import YOLO
import numpy as np
import cv2
from typing import List, Dict, Any, Tuple
import os
from app.core.config import settings
from app.core.thresholds_optimized import (
    get_threshold,
    filter_by_size,
    filter_by_aspect_ratio,
    boost_confidence,
    get_iou_threshold,
    AGGRESSIVE_THRESHOLDS
)

# 5-class architecture
VALID_COLONY_CLASSES = {'colony_single', 'colony_merged'}
ARTIFACT_CLASSES = {'bubble', 'dust_debris', 'media_crack'}
ALL_CLASSES = VALID_COLONY_CLASSES | ARTIFACT_CLASSES

# Class colors (BGR for OpenCV)
CLASS_COLORS_BGR = {
    'colony_single': (50, 220, 80),      # Green
    'colony_merged': (0, 140, 255),      # Orange
    'bubble':        (255, 120, 30),     # Blue
    'dust_debris':   (50, 50, 220),      # Red
    'media_crack':   (200, 60, 160),     # Purple
}


class ColonyDetectorOptimized:
    """
    YOLOv8-based colony detector dengan optimasi akurasi maksimal

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

        if os.path.exists(self.model_path):
            self.model = YOLO(self.model_path)
            print(f"✓ Loaded optimized model from {self.model_path}")
        else:
            raise RuntimeError(
                f"Model not found at {self.model_path}. "
                "Please ensure colony_best.pt exists in models/ folder."
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
        original_shape = (h, w)

        if h > MAX_DIM or w > MAX_DIM:
            scale = MAX_DIM / max(h, w)
            new_w, new_h = int(w * scale), int(h * scale)
            image = cv2.resize(image, (new_w, new_h))
            print(f"Resized from {w}x{h} to {new_w}x{new_h}")

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

            # 1. Check threshold per-class
            threshold = get_threshold(class_name, media_type, aggressive)
            if confidence < threshold:
                continue

            # 2. Size filter
            if apply_filters and not filter_by_size(bbox, class_name):
                continue

            # 3. Aspect ratio filter
            if apply_filters and not filter_by_aspect_ratio(bbox, class_name):
                continue

            # 4. Confidence boosting
            boosted_conf = boost_confidence(confidence, bbox, original_shape, class_name)
            det['confidence'] = boosted_conf
            det['confidence_original'] = confidence

            filtered_detections.append(det)

        # 5. NMS per-class untuk remove duplicates
        final_detections = self._nms_per_class(filtered_detections)

        return final_detections

    def _detect_single(self, image: np.ndarray, conf_threshold: float) -> List[Dict[str, Any]]:
        """Single inference tanpa augmentation"""
        results = self.model(
            image,
            conf=conf_threshold,
            iou=0.35,  # Lower IOU untuk keep more boxes
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

        # Original
        dets_original = self._detect_single(image, conf_threshold)

        # Horizontal flip
        img_hflip = cv2.flip(image, 1)
        dets_hflip = self._detect_single(img_hflip, conf_threshold)
        # Flip boxes back
        for det in dets_hflip:
            det['bbox']['x'] = w - det['bbox']['x'] - det['bbox']['width']

        # Vertical flip
        img_vflip = cv2.flip(image, 0)
        dets_vflip = self._detect_single(img_vflip, conf_threshold)
        # Flip boxes back
        for det in dets_vflip:
            det['bbox']['y'] = h - det['bbox']['y'] - det['bbox']['height']

        # Merge all detections
        all_dets = dets_original + dets_hflip + dets_vflip

        # Weighted merge (original gets higher weight)
        merged = self._merge_tta_detections(all_dets, weights=[1.0, 0.8, 0.8])

        return merged

    def _merge_tta_detections(self, detections: List[Dict], weights: List[float]) -> List[Dict]:
        """Merge TTA detections dengan weighted voting via IoU clustering"""
        if not detections:
            return []

        # Assign weight per detection (setiap augmentation dapat weight berbeda)
        n_per_aug = len(detections) // len(weights) if weights else len(detections)
        weighted_dets = []
        for i, det in enumerate(detections):
            aug_idx = min(i // max(n_per_aug, 1), len(weights) - 1)
            det['_tta_weight'] = weights[aug_idx] if aug_idx < len(weights) else 1.0
            weighted_dets.append(det)

        # Group overlapping detections per class
        merged = []
        used = set()
        for i, det in enumerate(weighted_dets):
            if i in used:
                continue
            # Find all detections with IoU > 0.45 of same class
            cluster = [i]
            used.add(i)
            for j, other in enumerate(weighted_dets):
                if j in used or det['class_name'] != other['class_name']:
                    continue
                if self._iou(det['bbox'], other['bbox']) > 0.45:
                    cluster.append(j)
                    used.add(j)

            if len(cluster) == 1:
                # Single detection — tetap pakai confidence asli
                merged.append(det)
            else:
                # Weighted average of cluster
                total_w = sum(weighted_dets[k]['_tta_weight'] for k in cluster)
                if total_w == 0:
                    merged.append(det)
                    continue

                avg_conf = sum(
                    weighted_dets[k]['confidence'] * weighted_dets[k]['_tta_weight']
                    for k in cluster
                ) / total_w

                # Ambil bbox dari detection dengan confidence tertinggi
                best_k = max(cluster, key=lambda k: weighted_dets[k]['confidence'])
                best = weighted_dets[best_k].copy()

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

    def get_average_confidence(self, detections: List[Dict[str, Any]], valid_only: bool = True) -> float:
        """Get average confidence score"""
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
