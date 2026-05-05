"""
STEP 3 — Fine-tune colony_best.pt for competition-style images.

Strategy:
- Start from colony_best.pt (preserve existing knowledge)
- Lower learning rate to avoid catastrophic forgetting
- Heavy augmentation for domain robustness
- Train on existing dataset which includes diverse images

Usage:
    python finetune_competition.py

Output:
    runs/detect/finetune_competition/weights/best.pt
"""

from ultralytics import YOLO
import os
import sys
import shutil

# ── Configuration ──────────────────────────────────────────────────────────
BASE_MODEL = os.path.join(os.path.dirname(__file__), "..", "backend", "models", "colony_best.pt")
DATASET_YAML = os.path.join(os.path.dirname(__file__), "datasets", "colonyai_merged", "data.yaml")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "runs", "detect", "finetune_competition")

# Training hyperparameters
EPOCHS = 80              # Enough to converge without overfitting
IMG_SIZE = 1280          # Higher resolution for small colony detection
BATCH = 8                # Adjust based on GPU memory
LR0 = 0.0005             # Low LR to preserve existing knowledge
LRF = 0.01               # Final learning rate factor
PATIENCE = 20            # Early stopping patience
WARMUP_EPOCHS = 5        # Warmup period
SAVE_PERIOD = 10         # Save checkpoint every 10 epochs

# Augmentation (heavy for domain robustness)
MOSAIC = 0.5             # Reduced from 1.0 to avoid over-augmenting
HSV_H = 0.05             # Hue variation
HSV_S = 0.7              # Saturation variation
HSV_V = 0.4              # Brightness variation (critical for domain gap)
DEGREES = 15.0           # Rotation
TRANSLATE = 0.15         # Translation
SCALE = 0.5              # Scale variation
SHEAR = 3.0              # Shear
FLIPUD = 0.5             # Vertical flip
FLIPLR = 0.5             # Horizontal flip
MIXUP = 0.1             # Mixup
COPY_PASTE = 0.1         # Copy-paste

WORKERS = 4

print("=" * 60)
print("STEP 3 — Fine-tuning ColonyAI Model")
print("=" * 60)
print(f"Base model: {BASE_MODEL}")
print(f"Dataset: {DATASET_YAML}")
print(f"Output: {OUTPUT_DIR}")
print(f"Epochs: {EPOCHS}, IMG_SIZE: {IMG_SIZE}, BATCH: {BATCH}")
print(f"LR0: {LR0}, PATIENCE: {PATIENCE}")
print("=" * 60)

# Verify base model exists
if not os.path.exists(BASE_MODEL):
    print(f"ERROR: Base model not found at {BASE_MODEL}")
    sys.exit(1)

# Verify dataset exists
if not os.path.exists(DATASET_YAML):
    print(f"ERROR: Dataset YAML not found at {DATASET_YAML}")
    sys.exit(1)

# Verify dataset has images
import yaml
with open(DATASET_YAML, 'r') as f:
    data_cfg = yaml.safe_load(f)

print(f"Dataset config: {data_cfg}")

# Count images
for split in ['train', 'valid']:
    img_dir = data_cfg.get(split, '')
    if img_dir and os.path.exists(img_dir):
        n = len([f for f in os.listdir(img_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp'))])
        print(f"  {split}: {n} images")
    else:
        # Try relative path
        rel_dir = os.path.join(os.path.dirname(DATASET_YAML), split, 'images')
        if os.path.exists(rel_dir):
            n = len([f for f in os.listdir(rel_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp'))])
            print(f"  {split}: {n} images (relative path)")
        else:
            print(f"  {split}: directory not found!")

print("\nStarting training...")
print("=" * 60)

# Load existing model (transfer learning)
model = YOLO(BASE_MODEL)

# Train with fine-tuning parameters
results = model.train(
    data=DATASET_YAML,
    epochs=EPOCHS,
    imgsz=IMG_SIZE,
    batch=BATCH,
    lr0=LR0,
    lrf=LRF,
    patience=PATIENCE,
    warmup_epochs=WARMUP_EPOCHS,
    save_period=SAVE_PERIOD,
    
    # Augmentation
    mosaic=MOSAIC,
    hsv_h=HSV_H,
    hsv_s=HSV_S,
    hsv_v=HSV_V,
    degrees=DEGREES,
    translate=TRANSLATE,
    scale=SCALE,
    shear=SHEAR,
    flipud=FLIPUD,
    fliplr=FLIPLR,
    mixup=MIXUP,
    copy_paste=COPY_PASTE,
    
    # Optimizer
    optimizer='AdamW',
    
    # Output
    project=os.path.dirname(OUTPUT_DIR),
    name=os.path.basename(OUTPUT_DIR),
    exist_ok=True,
    
    # Workers
    workers=WORKERS,
    
    # Verbose
    verbose=True,
)

print("\n" + "=" * 60)
print("TRAINING COMPLETE")
print("=" * 60)

# Get best model path
best_model = os.path.join(OUTPUT_DIR, "weights", "best.pt")
if os.path.exists(best_model):
    print(f"Best model saved at: {best_model}")
    
    # Validate
    print("\n--- Validation ---")
    metrics = model.val(data=DATASET_YAML, imgsz=IMG_SIZE, batch=BATCH)
    print(f"mAP50: {metrics.box.map50:.4f}")
    print(f"mAP50-95: {metrics.box.map:.4f}")
    
    # Export to ONNX for deployment
    print("\n--- Exporting to ONNX ---")
    model.export(format='onnx', imgsz=IMG_SIZE, simplify=True)
    print("ONNX export complete")
    
    # Copy to backend models
    backend_model_path = os.path.join(os.path.dirname(__file__), "..", "backend", "models", "colony_best_v2.pt")
    shutil.copy2(best_model, backend_model_path)
    print(f"\n✅ Model copied to: {backend_model_path}")
    
    print("\n" + "=" * 60)
    print("STEP 3 COMPLETE — Model ready for validation")
    print("=" * 60)
else:
    print(f"ERROR: Best model not found at {best_model}")
    sys.exit(1)
