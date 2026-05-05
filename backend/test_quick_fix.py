"""
STEP 2 — Quick Fix Test
Test adjusted thresholds + improved preprocessing on competition image.
"""
import cv2
import numpy as np
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ultralytics import YOLO
from app.core.config import settings
from app.services.image_processor import ImageProcessor
from app.core.thresholds import get_all_thresholds

COMPETITION_IMAGE = os.path.join(os.path.dirname(__file__), "casseforcompetetions.png")

model = YOLO(settings.MODEL_PATH)
processor = ImageProcessor()

print("=" * 60)
print("STEP 2 — Quick Fix Test")
print("=" * 60)

# Load original image
img = cv2.imread(COMPETITION_IMAGE)
h, w = img.shape[:2]
print(f"Image: {w}x{h}, Mean BGR: {img.mean(axis=(0,1)).astype(int)}")

# Preprocess with improved pipeline
print("\n--- Preprocessing with improved CLAHE + gamma correction ---")
processed = processor.preprocess(COMPETITION_IMAGE)
print(f"Processed shape: {processed.shape}")
print(f"Processed mean RGB: {processed.mean(axis=(0,1)).astype(int)}")

# Test with lower thresholds
print("\n--- Detection with adjusted thresholds ---")
media_type = "DEFAULT"
thresholds = get_all_thresholds(media_type)
print(f"Thresholds for {media_type}: {thresholds}")

# Run inference at multiple conf levels
for conf_override in [0.10, 0.15, 0.20, 0.25, 0.30]:
    results = model(processed, conf=conf_override, iou=0.45, verbose=False)
    boxes = results[0].boxes
    if boxes is not None and len(boxes) > 0:
        classes = boxes.cls.cpu().numpy().astype(int)
        confs = boxes.conf.cpu().numpy()
        class_counts = {}
        for c in classes:
            name = model.names.get(c, f"class_{c}")
            class_counts[name] = class_counts.get(name, 0) + 1
        print(f"  conf={conf_override:.2f}: {len(boxes)} detections | {class_counts} | conf=[{confs.min():.3f}, {confs.max():.3f}]")
    else:
        print(f"  conf={conf_override:.2f}: 0 detections")

# Also test on original (non-preprocessed) with very low threshold
print("\n--- Original image, conf=0.10 ---")
results = model(img, conf=0.10, iou=0.45, verbose=False)
boxes = results[0].boxes
n = len(boxes) if boxes is not None else 0
print(f"  Detections: {n}")
if n > 0:
    classes = boxes.cls.cpu().numpy().astype(int)
    class_counts = {}
    for c in classes:
        name = model.names.get(c, f"class_{c}")
        class_counts[name] = class_counts.get(name, 0) + 1
    print(f"  Classes: {class_counts}")

print("\n" + "=" * 60)
print("STEP 2 COMPLETE")
