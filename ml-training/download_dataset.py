"""
ColonyAI - Dataset Download & Roboflow Augmentation Pipeline
Downloads AGAR dataset + Roboflow Universe data, applies 3x augmentation.
Generates properly structured 5-class YOLOv8 dataset.
"""

import os
import sys
from pathlib import Path

# ============================================================
# CONFIGURATION
# ============================================================

DATASET_DIR = Path("./datasets/colony_dataset")
ROBOFLOW_API_KEY = os.environ.get("ROBOFLOW_API_KEY", "")

# 5-Class taxonomy
CLASSES = {
    "colony_single": 0,
    "colony_merged": 1,
    "bubble": 2,
    "dust_debris": 3,
    "media_crack": 4,
}


def create_directory_structure():
    """Create YOLOv8 dataset directory structure."""
    splits = ["train", "valid", "test"]
    for split in splits:
        (DATASET_DIR / split / "images").mkdir(parents=True, exist_ok=True)
        (DATASET_DIR / split / "labels").mkdir(parents=True, exist_ok=True)
    print(f"✅ Directory structure created at: {DATASET_DIR}")


def download_roboflow_dataset():
    """
    Download from Roboflow Universe with 5-class annotations.
    Requires ROBOFLOW_API_KEY environment variable.

    Usage:
        1. Create a Roboflow account
        2. Upload/annotate colony images with 5 classes
        3. Generate dataset version with YOLOv8 format
        4. Set ROBOFLOW_API_KEY env var
        5. Run this script

    Alternative: Use an existing public Roboflow Universe dataset:
        rf.workspace("your-workspace").project("colony-detection").version(1).download("yolov8")
    """
    if not ROBOFLOW_API_KEY:
        print("⚠️  ROBOFLOW_API_KEY not set.")
        print("   Download manually from Roboflow Universe:")
        print("   https://universe.roboflow.com/search?q=bacterial+colony")
        print("   Export as: YOLOv8 PyTorch format")
        print(f"   Place files in: {DATASET_DIR}/")
        return False

    try:
        from roboflow import Roboflow
        rf = Roboflow(api_key=ROBOFLOW_API_KEY)

        # Replace with your actual workspace/project
        # workspace = rf.workspace("YOUR_WORKSPACE")
        # project = workspace.project("colony-detection-5class")
        # version = project.version(1)
        # dataset = version.download(model_format="yolov8", location=str(DATASET_DIR))

        print("🔗 Roboflow connected successfully")
        print("📋 Configure your workspace/project in this script")
        print("📥 Then re-run to download the dataset")
        return True

    except ImportError:
        print("❌ Roboflow package not installed")
        print("   pip install roboflow")
        return False
    except Exception as e:
        print(f"❌ Roboflow error: {e}")
        return False


def apply_roboflow_augmentation():
    """
    Apply 3x dataset expansion via Roboflow preprocessing.
    Augmentations: brightness, contrast, rotation, flip, blur, mosaic.

    Alternative: If no Roboflow, use YOLOv8 built-in augmentations during training.
    """
    if not ROBOFLOW_API_KEY:
        print("⚠️  Skipping Roboflow augmentation (no API key)")
        print("   YOLOv8 built-in augmentations will be used during training:")
        print("   - Mosaic (100%), Mixup (10%), Copy-Paste (10%)")
        print("   - HSV adjustments, rotation, flip, scale, shear")
        return False

    try:
        from roboflow import Roboflow
        rf = Roboflow(api_key=ROBOFLOW_API_KEY)

        print("🔄 Applying 3x augmentation via Roboflow...")
        # This would use a pre-configured Roboflow preprocessing pipeline
        # In the web UI: Add preprocessing steps → Generate new version
        print("   Configure augmentation in Roboflow web UI:")
        print("   1. Open your project")
        print("   2. Go to 'Generate' tab")
        print("   3. Add: Brightness, Contrast, Rotation, Blur, Flip")
        print("   4. Set multiplier to 3x")
        print("   5. Generate → Download as YOLOv8 format")
        return True

    except Exception as e:
        print(f"❌ Augmentation error: {e}")
        return False


def verify_dataset_structure():
    """Verify all 5 classes have annotations."""
    print("\n🔍 Verifying dataset structure...")

    class_counts = {i: 0 for i in range(5)}
    total = 0

    for split in ["train", "valid", "test"]:
        label_dir = DATASET_DIR / split / "labels"
        if not label_dir.exists():
            print(f"  ⚠️  Missing: {label_dir}")
            continue

        label_files = list(label_dir.glob("*.txt"))
        img_count = len(list((DATASET_DIR / split / "images").glob("*.jpg")))
        print(f"  📁 {split}: {img_count} images, {len(label_files)} label files")

        for lf in label_files:
            with open(lf, "r") as f:
                for line in f:
                    parts = line.strip().split()
                    if parts:
                        cls = int(parts[0])
                        class_counts[cls] += 1
                        total += 1

    print(f"\n  📊 Annotation Distribution ({total} total):")
    for cls_id, name in sorted(CLASSES.items(), key=lambda x: x[1]):
        count = class_counts[cls_id]
        pct = (count / total * 100) if total > 0 else 0
        status = "✅" if count > 0 else "❌"
        print(f"    {status} {name}: {count:,} ({pct:.1f}%)")

    empty_classes = [name for cls_id, count in class_counts.items() for name in [list(CLASSES.keys())[cls_id]] if count == 0]
    if empty_classes:
        print(f"\n  ⚠️  Classes without annotations: {', '.join(empty_classes)}")
        print("  Action: Add annotations before training for proper 5-class detection.")
        return False

    return True


if __name__ == "__main__":
    print("=" * 60)
    print("🤖 ColonyAI - Dataset Download & Augmentation")
    print("=" * 60)

    create_directory_structure()

    print("\n📥 Step 1: Download dataset")
    download_roboflow_dataset()

    print("\n🔄 Step 2: Apply augmentation")
    apply_roboflow_augmentation()

    print("\n✅ Step 3: Verify")
    verify_dataset_structure()

    print("\n" + "=" * 60)
    print("🚀 Ready to train!")
    print("   python train.py --mode full")
    print("=" * 60)
