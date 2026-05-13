"""
ColonyAI Re-Training Script - v8 (Balanced 5-Class)
====================================================
Re-trains from scratch (or from v7 checkpoint) after oversampling minority classes.
Target: All 5 classes detected with confident predictions.
- colony_single  (~72%)  -> no change
- colony_merged  (~11%)  -> no change
- bubble         (~14%)  -> no change
- dust_debris    (1.9% -> ~5% after aug)
- media_crack    (0.7% -> ~3% after aug)
"""

import os
import sys
import gc
import shutil
import yaml
from pathlib import Path
from datetime import datetime

os.environ["CUDA_MODULE_LOADING"] = "LAZY"
os.environ["CUDA_VISIBLE_DEVICES"] = "0"
os.environ["OMP_NUM_THREADS"] = "1"

import torch
from ultralytics import YOLO

# ============================================================
# CONFIG
# ============================================================
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(SCRIPT_DIR, "datasets", "colonyai_merged")
DATA_YAML = os.path.join(DATASET_PATH, "data.yaml")

# v7 best.pt as starting point (fine-tune, not from scratch)
# Fixed path to point to the actual runs directory
V7_BEST = os.path.join(SCRIPT_DIR, "runs", "detect", 
                        "colony_detection_full_v7", "weights", "best.pt")

# Training output directory
RUN_NAME = "colony_v8_enterprise_ready"
PROJECT_DIR = os.path.join(SCRIPT_DIR, "runs", "detect")

EPOCHS = 3           # Focus on quality over quantity for this demonstration
BATCH_SIZE = 8       # Optimized for RTX 5050
IMG_SIZE = 640
DEVICE = 0           # GPU
PATIENCE = 5         # Early stopping

# ============================================================
# VERIFY OVERSAMPLING DONE
# ============================================================
def check_distribution():
    train_lbl = os.path.join(DATASET_PATH, "train", "labels")
    counts = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0}
    for f in Path(train_lbl).glob("*.txt"):
        with open(f) as fp:
            for line in fp:
                parts = line.strip().split()
                if parts:
                    cls = int(parts[0])
                    if cls in counts:
                        counts[cls] += 1
    
    total = sum(counts.values())
    names = ['colony_single', 'colony_merged', 'bubble', 'dust_debris', 'media_crack']
    print("\n=== DISTRIBUSI DATASET SETELAH OVERSAMPLING ===")
    for cls_id, name in enumerate(names):
        pct = (counts[cls_id] / total * 100) if total > 0 else 0
        bar = "█" * int(pct / 2)
        status = "✅" if pct >= 2.0 else "⚠️ "
        print(f"  {status} {name:<20}: {counts[cls_id]:>8,} ({pct:.1f}%) {bar}")
    print(f"  {'TOTAL':<22}: {total:>8,}")
    print("================================================\n")
    
    return counts[3] > 50000 and counts[4] > 100000  # sanity check

# ============================================================
# MAIN TRAINING
# ============================================================
def main():
    print("=" * 65)
    print("  ColonyAI - Re-Training v8 (Balanced 5-Class)")
    print("=" * 65)
    
    # Check distribution
    balanced = check_distribution()
    if not balanced:
        print("⚠️  WARNING: Oversampling mungkin belum selesai atau kurang, namun proses tetap dilanjutkan.")

    # RESUME LOGIC: Check if we have a previous session to resume from
    last_pt = os.path.join(PROJECT_DIR, RUN_NAME, "weights", "last.pt")
    resume_mode = False
    
    if os.path.exists(last_pt):
        print(f"🔄 Interrupted session detected at: {last_pt}")
        print("   RESUMING training from last checkpoint...")
        start_weights = last_pt
        resume_mode = True
    elif os.path.exists(V7_BEST):
        start_weights = V7_BEST
        print(f"✅ Starting from v7 checkpoint: {V7_BEST}")
    else:
        start_weights = "yolov8s.pt"
        print(f"⚠️  v7 checkpoint tidak ditemukan. Starting from {start_weights}")

    # Memory cleanup
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        print(f"✅ GPU: {torch.cuda.get_device_name(0)}")
    
    model = YOLO(start_weights)

    results = model.train(
        data=DATA_YAML,
        epochs=EPOCHS,
        imgsz=IMG_SIZE,
        batch=BATCH_SIZE,
        name=RUN_NAME,
        project=PROJECT_DIR,
        exist_ok=True,
        pretrained=True,
        device=DEVICE,
        resume=resume_mode,
        amp=True,
        cache=False,
        mosaic=0.0,
        mixup=0.0,
        optimizer="AdamW",
        lr0=0.0005,
        lrf=0.01,
        momentum=0.937,
        weight_decay=0.0005,
        warmup_epochs=3,
        iou=0.45,
        hsv_h=0.02,
        hsv_s=0.7,
        hsv_v=0.4,
        degrees=10.0,
        translate=0.1,
        scale=0.5,
        shear=5.0,
        flipud=0.5,
        fliplr=0.5,
        copy_paste=0.0,
        workers=0,
        patience=PATIENCE,
        save=True,
        save_period=1,
    )

    # ============================================================
    # POST-TRAINING: Deploy to production
    # ============================================================
    best_pt = os.path.join(PROJECT_DIR, RUN_NAME, "weights", "best.pt")
    production_pt = r"D:\lombapuai\backend\models\colony_best_new.pt"
    
    if os.path.exists(best_pt):
        shutil.copy2(best_pt, production_pt)
        print(f"\n✅ DEPLOY SUKSES!")
        print(f"   {best_pt}")
        print(f"   → {production_pt}")
        print(f"\n🚀 Restart backend untuk memuat model baru!")
        print(f"   > cd D:\\lombapuai\\backend && python main.py")
    else:
        print(f"❌ best.pt tidak ditemukan di: {best_pt}")
        print(f"   Mohon copy secara manual dari folder output YOLO.")

if __name__ == "__main__":
    main()
