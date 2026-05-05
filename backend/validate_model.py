"""
STEP 4 — Validation
Validate new model on competition image + test images.
"""
import cv2
import numpy as np
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ultralytics import YOLO
from app.core.config import settings
from app.services.image_processor import ImageProcessor

# Test images
COMPETITION_IMAGE = os.path.join(os.path.dirname(__file__), "casseforcompetetions.png")
TEST_IMAGES = [
    os.path.join(os.path.dirname(__file__), "imagetest", "sample_pca_agar.png"),
    os.path.join(os.path.dirname(__file__), "imagetest", "sample_macconkey_agar.png"),
]

# Try new model first, fall back to existing
NEW_MODEL = os.path.join(os.path.dirname(__file__), "..", "backend", "models", "colony_best_v2.pt")
OLD_MODEL = settings.MODEL_PATH

model_path = NEW_MODEL if os.path.exists(NEW_MODEL) else OLD_MODEL
print(f"Using model: {model_path}")

model = YOLO(model_path)
processor = ImageProcessor()

def validate_image(image_path, label):
    if not os.path.exists(image_path):
        print(f"SKIP: {label} — not found")
        return

    img = cv2.imread(image_path)
    h, w = img.shape[:2]
    print(f"\n{'=' * 50}")
    print(f"IMAGE: {label} ({w}x{h})")

    # Preprocess
    if os.path.dirname(image_path) == os.path.dirname(COMPETITION_IMAGE):
        # Competition image — use file path for full pipeline
        processed = processor.preprocess(image_path)
    else:
        # Test images — use file path
        processed = processor.preprocess(image_path)

    # Inference
    start = time.time()
    results = model(processed, conf=0.15, iou=0.45, imgsz=1280, verbose=False)
    elapsed = time.time() - start

    boxes = results[0].boxes
    n = len(boxes) if boxes is not None else 0

    print(f"  Detections: {n}")
    print(f"  Inference time: {elapsed:.2f}s")

    if n > 0:
        classes = boxes.cls.cpu().numpy().astype(int)
        confs = boxes.conf.cpu().numpy()
        class_counts = {}
        for c in classes:
            name = model.names.get(c, f"class_{c}")
            class_counts[name] = class_counts.get(name, 0) + 1
        print(f"  Classes: {class_counts}")
        print(f"  Confidence range: [{confs.min():.3f}, {confs.max():.3f}]")

        # Count valid colonies
        valid = sum(1 for c in classes if model.names.get(c, '') in ['colony_single', 'colony_merged'])
        artifacts = sum(1 for c in classes if model.names.get(c, '') in ['bubble', 'dust_debris', 'media_crack'])
        print(f"  Valid colonies: {valid}")
        print(f"  Artifacts: {artifacts}")

    return n


print("=" * 60)
print("STEP 4 — Model Validation")
print("=" * 60)

# Validate on competition image
n_comp = validate_image(COMPETITION_IMAGE, "COMPETITION")

# Validate on test images
for img_path in TEST_IMAGES:
    label = os.path.basename(img_path).replace(".png", "").upper()
    validate_image(img_path, label)

print(f"\n{'=' * 60}")
print("VALIDATION COMPLETE")
print(f"Competition image detections: {n_comp}")
print(f"Target: >= 3 colonies (or correct 0 if plate is truly empty)")
print("=" * 60)
