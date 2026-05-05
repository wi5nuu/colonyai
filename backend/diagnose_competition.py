"""
STEP 1 — Diagnose Domain Gap
Run inference on competition image with verbose output at multiple thresholds.
"""
import cv2
import numpy as np
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ultralytics import YOLO
from app.core.config import settings

COMPETITION_IMAGE = os.path.join(os.path.dirname(__file__), "casseforcompetetions.png")
TEST_IMAGES = [
    os.path.join(os.path.dirname(__file__), "imagetest", "sample_pca_agar.png"),
    os.path.join(os.path.dirname(__file__), "imagetest", "sample_macconkey_agar.png"),
]

model = YOLO(settings.MODEL_PATH)
print(f"Model: {settings.MODEL_PATH}")
print(f"Classes: {model.names}")
print(f"Settings conf: {settings.MODEL_CONFIDENCE_THRESHOLD}")
print(f"Settings iou: {settings.MODEL_IOU_THRESHOLD}")
print(f"Settings img_size: {settings.MODEL_IMG_SIZE}")
print("=" * 60)


def diagnose_image(image_path, label):
    """Run full diagnosis on a single image."""
    if not os.path.exists(image_path):
        print(f"SKIP: {label} — file not found: {image_path}")
        return

    img = cv2.imread(image_path)
    if img is None:
        print(f"SKIP: {label} — could not read image")
        return

    h, w = img.shape[:2]
    print(f"\n{'=' * 60}")
    print(f"IMAGE: {label}")
    print(f"Path: {image_path}")
    print(f"Resolution: {w}x{h}")
    print(f"Mean BGR: {img.mean(axis=(0,1)).astype(int)}")
    print(f"Std BGR: {img.std(axis=(0,1)).astype(int)}")

    # Run at multiple confidence thresholds
    for conf in [0.01, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.40, 0.50, 0.60]:
        results = model(img, conf=conf, iou=0.45, imgsz=settings.MODEL_IMG_SIZE, verbose=False)
        boxes = results[0].boxes
        if boxes is not None and len(boxes) > 0:
            classes = boxes.cls.cpu().numpy().astype(int)
            confs = boxes.conf.cpu().numpy()
            class_counts = {}
            for c in classes:
                name = model.names.get(c, f"class_{c}")
                class_counts[name] = class_counts.get(name, 0) + 1
            print(f"  conf={conf:.2f}: {len(boxes)} detections | classes={class_counts} | conf_range=[{confs.min():.3f}, {confs.max():.3f}]")
        else:
            print(f"  conf={conf:.2f}: 0 detections")

    # Also test with CLAHE preprocessing
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    cl = clahe.apply(l)
    limg = cv2.merge((cl, a, b))
    img_clahe = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)

    for conf in [0.01, 0.10, 0.20, 0.30]:
        results = model(img_clahe, conf=conf, iou=0.45, imgsz=settings.MODEL_IMG_SIZE, verbose=False)
        boxes = results[0].boxes
        n = len(boxes) if boxes is not None else 0
        if n > 0:
            classes = boxes.cls.cpu().numpy().astype(int)
            class_counts = {}
            for c in classes:
                name = model.names.get(c, f"class_{c}")
                class_counts[name] = class_counts.get(name, 0) + 1
            print(f"  CLAHE conf={conf:.2f}: {n} detections | classes={class_counts}")
        else:
            print(f"  CLAHE conf={conf:.2f}: 0 detections")


# Diagnose competition image
diagnose_image(COMPETITION_IMAGE, "COMPETITION")

# Diagnose known-good test images
for img_path in TEST_IMAGES:
    label = os.path.basename(img_path).replace(".png", "").upper()
    diagnose_image(img_path, label)

print(f"\n{'=' * 60}")
print("DIAGNOSIS COMPLETE")
