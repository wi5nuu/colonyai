import os
import subprocess
import sys

# STEP 0: Auto-Install Ultralytics
try:
    from ultralytics import YOLO
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "ultralytics"])
    from ultralytics import YOLO

import glob
import yaml
from pathlib import Path

INPUT_DIR = "/kaggle/input/colonyai-expert-dataset-v8"
CHECKPOINT = "/kaggle/working/runs/colony_v8/weights/last.pt"
yaml_path = "/kaggle/working/data.yaml"

# ============================================================
# STEP 1: Auto-detect dataset structure (Kaggle sudah extract)
# ============================================================
print("=== Exploring Dataset Structure ===")
top_contents = sorted(os.listdir(INPUT_DIR))
print(f"Top-level items ({len(top_contents)}): {top_contents[:10]}")

# Cari semua image files
all_images = glob.glob(f"{INPUT_DIR}/**/*.jpg", recursive=True) + \
             glob.glob(f"{INPUT_DIR}/**/*.jpeg", recursive=True) + \
             glob.glob(f"{INPUT_DIR}/**/*.png", recursive=True)
print(f"Total images found: {len(all_images)}")
if all_images:
    print(f"Sample: {all_images[0]}")

# Auto-detect train/valid/test directories
train_dirs, valid_dirs, test_dirs = set(), set(), set()
for img_path in all_images:
    parts = Path(img_path).parts
    for i, part in enumerate(parts):
        if part == "images" and i > 0:
            parent = parts[i-1]
            dir_path = str(Path(*parts[:i+1]))
            if parent == "train":
                train_dirs.add(dir_path)
            elif parent in ("valid", "val"):
                valid_dirs.add(dir_path)
            elif parent == "test":
                test_dirs.add(dir_path)

print(f"\nTrain dirs: {len(train_dirs)}")
print(f"Valid dirs: {len(valid_dirs)}")
print(f"Test dirs : {len(test_dirs)}")

if not train_dirs or not valid_dirs:
    print("\nERROR: Tidak menemukan folder train/valid!")
    print("Struktur yang ada:")
    for root, dirs, files in os.walk(INPUT_DIR):
        level = root.replace(INPUT_DIR, "").count(os.sep)
        if level < 3:
            print(f"{'  '*level}{os.path.basename(root)}/ ({len(files)} files)")
    raise FileNotFoundError("Dataset structure not found!")

# ============================================================
# STEP 2: Buat data.yaml dengan path yang benar
# ============================================================
data_config = {
    "train": sorted(list(train_dirs)),
    "val": sorted(list(valid_dirs)),
    "test": sorted(list(test_dirs)),
    "nc": 5,
    "names": ["colony_single", "colony_merged", "bubble", "dust_debris", "media_crack"]
}
with open(yaml_path, "w") as f:
    yaml.dump(data_config, f, default_flow_style=False)
print(f"\ndata.yaml:\n{open(yaml_path).read()}")

# ============================================================
# STEP 3: Train (dengan resume otomatis)
# ============================================================
if os.path.exists(CHECKPOINT):
    print(f"Checkpoint ditemukan! Resume dari: {CHECKPOINT}")
    model = YOLO(CHECKPOINT)
    results = model.train(resume=True)
else:
    print("Mulai training dari awal...")
    model = YOLO("yolov8s.pt")
    results = model.train(
        data=yaml_path,
        epochs=100,
        imgsz=640,
        batch=16,
        workers=4,
        device=0,
        project="/kaggle/working/runs",
        name="colony_v8",
        patience=15,
        save=True,
        save_period=5,
        val=True,
        plots=True,
        exist_ok=True,
    )

print("\n=== TRAINING SELESAI ===")

# ============================================================
# STEP 4: Validasi model terbaik
# ============================================================
best_path = "/kaggle/working/runs/colony_v8/weights/best.pt"
if os.path.exists(best_path):
    best_model = YOLO(best_path)
    val = best_model.val(data=yaml_path)
    print(f"mAP50    : {val.box.map50:.4f}")
    print(f"mAP50-95 : {val.box.map:.4f}")
    print(f"Precision: {val.box.mp:.4f}")
    print(f"Recall   : {val.box.mr:.4f}")
    print(f"\nModel tersimpan: {best_path}")
