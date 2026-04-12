from ultralytics import YOLO
import numpy as np
import cv2
from typing import List, Dict, Any, Tuple
import os
from app.core.config import settings


# 5-class architecture per proposal
VALID_COLONY_CLASSES = {'colony_single', 'colony_merged'}
ARTIFACT_CLASSES = {'bubble', 'dust_debris', 'media_crack'}
ALL_CLASSES = VALID_COLONY_CLASSES | ARTIFACT_CLASSES

# Class-specific colors for annotation (BGR format for OpenCV)
CLASS_COLORS = {
    'colony_single': (0, 255, 0),      # Green
    'colony_merged': (0, 165, 255),    # Orange
    'bubble': (255, 0, 0),             # Blue
    'dust_debris': (0, 0, 255),        # Red
    'media_crack': (128, 0, 128),      # Purple
}


class ColonyDetector:
    """YOLOv8-based colony detection and classification system
    
    5-class architecture:
    - colony_single: Individual, well-separated colonies
    - colony_merged: Overlapping/touching colonies
    - bubble: Air bubbles in agar media
    - dust_debris: Contaminant particles
    - media_crack: Cracks in agar media
    """

    def __init__(self, model_path: str = None):
        self.model_path = model_path or settings.MODEL_PATH
        self.confidence_threshold = settings.MODEL_CONFIDENCE_THRESHOLD
        self.iou_threshold = settings.MODEL_IOU_THRESHOLD
        self.img_size = settings.MODEL_IMG_SIZE

        # FIX QA-002: DO NOT fallback to COCO model - raise error instead
        # COCO model detects 'person/dog/cup' which would ruin CFU calculations
        if os.path.exists(self.model_path):
            self.model = YOLO(self.model_path)
            print(f"Loaded model from {self.model_path}")
        else:
            raise RuntimeError(
                f"Critical: ColonyAI model not found at {self.model_path}. "
                "Please train the model using 'python train.py --mode train' before running inference. "
                "Falling back to COCO pretrained model is disabled for safety."
            )

    def detect(self, image: np.ndarray, confidence_override: float | None = None) -> list[dict]:
        """
        Detect colonies and artifacts in an image.

        Args:
            image: Numpy array gambar yang sudah dipreprocess
            confidence_override: Override confidence threshold (untuk per-media-type
                                 threshold dari BUG-007). Jika None, gunakan
                                 settings.MODEL_CONFIDENCE_THRESHOLD global.

        Returns:
            List deteksi dengan class, confidence, bbox, dan color
        """
        # FIX QA-010: Image Size Validation to prevent OOM crashes
        # YOLOv8 default imgsz is 640, so we cap input at 2x that size
        MAX_DIM = self.img_size * 2  # 1024px
        h, w = image.shape[:2]
        if h > MAX_DIM or w > MAX_DIM:
            scale = MAX_DIM / max(h, w)
            new_w, new_h = int(w * scale), int(h * scale)
            image = cv2.resize(image, (new_w, new_h))
            print(f"Resized image from {w}x{h} to {new_w}x{new_h} to prevent OOM")

        conf = confidence_override if confidence_override is not None else self.confidence_threshold

        # Run inference dengan threshold yang sesuai
        results = self.model(
            image,
            conf=conf,           # Threshold awal — endpoint melakukan filter per-kelas setelahnya
            iou=self.iou_threshold,
            imgsz=self.img_size,
            verbose=False
        )

        # Parse results
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
                    'color': CLASS_COLORS.get(class_name, (255, 255, 255))
                }
                detections.append(detection)

        return detections
    
    def detect_from_file(self, image_path: str) -> List[Dict[str, Any]]:
        """Detect colonies from an image file"""
        results = self.model(
            image_path,
            conf=self.confidence_threshold,
            iou=self.iou_threshold,
            imgsz=self.img_size,
            verbose=False
        )

        detections = []
        result = results[0]

        if result.boxes is not None and len(result.boxes) > 0:
            boxes = result.boxes.xyxy.cpu().numpy()
            confidences = result.boxes.conf.cpu().numpy()
            class_ids = result.boxes.cls.cpu().numpy().astype(int)

            for box, conf, cls_id in zip(boxes, confidences, class_ids):
                x1, y1, x2, y2 = box
                class_name = self.model.names.get(cls_id, f'class_{cls_id}')

                detection = {
                    'class_name': class_name,
                    'confidence': float(conf),
                    'bbox': {
                        'x': int(x1),
                        'y': int(y1),
                        'width': int(x2 - x1),
                        'height': int(y2 - y1)
                    },
                    'is_valid_colony': class_name in VALID_COLONY_CLASSES,
                    'color': CLASS_COLORS.get(class_name, (255, 255, 255))
                }
                detections.append(detection)

        return detections

    def get_detection_summary(self, detections: List[Dict[str, Any]]) -> Dict[str, int]:
        """Get summary count by class for all 5 classes"""
        summary = {cls: 0 for cls in ALL_CLASSES}
        for detection in detections:
            class_name = detection['class_name']
            if class_name in summary:
                summary[class_name] += 1
            else:
                summary[class_name] = 1
        return summary

    def filter_valid_colonies(self, detections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Filter to only include valid colony detections (excludes artifacts)"""
        return [d for d in detections if d['is_valid_colony']]

    def get_valid_colony_count(self, detections: List[Dict[str, Any]]) -> int:
        """Get count of valid colonies only (excludes artifacts)"""
        return sum(1 for d in detections if d['is_valid_colony'])

    def get_average_confidence(self, detections: List[Dict[str, Any]], valid_only: bool = True) -> float:
        """Get average confidence score
        
        Args:
            detections: List of detections
            valid_only: If True, only average valid colony confidences
        """
        filtered = self.filter_valid_colonies(detections) if valid_only else detections
        if not filtered:
            return 0.0
        return sum(d['confidence'] for d in filtered) / len(filtered)

    def get_reliability_indicator(self, detections: List[Dict[str, Any]]) -> str:
        """Get plate-level reliability indicator based on confidence scores
        
        Returns:
            'high' - Average confidence >= 0.8
            'medium' - Average confidence 0.6-0.8
            'low' - Average confidence < 0.6
        """
        avg_conf = self.get_average_confidence(detections, valid_only=True)
        if avg_conf >= 0.8:
            return 'high'
        elif avg_conf >= 0.6:
            return 'medium'
        else:
            return 'low'
