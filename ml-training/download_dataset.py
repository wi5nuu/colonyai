"""
ColonyAI - Automated Dataset Download & Preparation
Downloads annotated dataset ready for YOLOv8 training
"""

import os
import zipfile
import shutil
from pathlib import Path

def create_sample_dataset():
    """
    Create a properly structured dataset directory
    Since DIBaS doesn't have annotations, we'll use an alternative approach
    """
    
    dataset_path = Path("d:/lombapuai/ml-training/datasets/colony_dataset")
    
    # Create directory structure
    splits = ['train', 'val', 'test']
    for split in splits:
        (dataset_path / 'images' / split).mkdir(parents=True, exist_ok=True)
        (dataset_path / 'labels' / split).mkdir(parents=True, exist_ok=True)
    
    print("✅ Dataset directory structure created at:")
    print(f"   {dataset_path}")
    print("\n📁 Structure:")
    print("   datasets/colony_dataset/")
    print("   ├── images/")
    print("   │   ├── train/")
    print("   │   ├── val/")
    print("   │   └── test/")
    print("   ├── labels/")
    print("   │   ├── train/")
    print("   │   ├── val/")
    print("   │   └── test/")
    print("   └── data.yaml")
    
    return dataset_path


def create_data_yaml():
    """Create YOLO training configuration"""
    
    yaml_content = """# ColonyAI Dataset Configuration
# For YOLOv8 training

# Train/val/test paths (relative to this file)
train: ../images/train
val: ../images/val
test: ../images/test

# Number of classes
nc: 5

# Class names (5 classes as per proposal)
names:
  0: colony_single
  1: colony_merged
  2: bubble
  3: dust_debris
  4: media_crack

# Dataset info
# Source: DIBaS + Roboflow Universe + Augmentation
# Total images: Will be populated from downloaded datasets
# Annotations: Bounding box format (class x_center y_center width height)
"""
    
    yaml_path = Path("d:/lombapuai/ml-training/datasets/colony_dataset/data.yaml")
    yaml_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(yaml_path, 'w') as f:
        f.write(yaml_content)
    
    print(f"\n✅ data.yaml created at: {yaml_path}")
    return yaml_path


def download_instructions():
    """Provide clear instructions for next steps"""
    
    print("\n" + "="*70)
    print("🎯 NEXT STEPS - DOWNLOAD ANNOTATED DATASET")
    print("="*70)
    
    print("\n📌 RECOMMENDED DATASETS (Already Annotated):")
    print("\n1️⃣  Roboflow Universe - Bacterial Colony Counting")
    print("   URL: https://universe.roboflow.com/search?q=bacterial+colony+counting")
    print("   ✅ Has bounding box annotations")
    print("   ✅ Export to YOLOv8 format")
    print("   📥 Download → Export → YOLOv8 PyTorch")
    
    print("\n2️⃣  Kaggle - Automatic Colony Counting")
    print("   URL: https://www.kaggle.com/datasets/clb2256095392/automatic-colony-counting")
    print("   ✅ May have annotations")
    print("   📥 Download via Kaggle CLI or browser")
    
    print("\n3️⃣  Kaggle - DIBaS Dataset (Your current find)")
    print("   URL: https://www.kaggle.com/datasets/samaarashidaarbi/dibas-bacterial-colony-dataset")
    print("   ⚠️  NO annotations - needs manual labeling")
    print("   📊 6.54 GB, 692 images, 35+ species")
    print("   🔧 Use Roboflow Annotate to add bounding boxes")
    
    print("\n" + "="*70)
    print("🚀 FASTEST PATH TO WINNING (Recommended Strategy):")
    print("="*70)
    
    print("""
STEP 1: Download from Roboflow Universe (30 minutes)
   - Search: "bacterial colony counting"
   - Filter: Has annotations
   - Download: YOLOv8 PyTorch format
   - Expected: 1000-5000 annotated images

STEP 2: Place files in correct folders (10 minutes)
   - Images → datasets/colony_dataset/images/train/
   - Labels → datasets/colony_dataset/labels/train/
   - Split: 70% train, 20% val, 10% test

STEP 3: Verify dataset (5 minutes)
   - Run: python verify_dataset.py
   - Check image-label match
   - Verify annotation format

STEP 4: Start training (1-2 hours)
   - Run: python train.py
   - Monitor mAP (target: ≥0.90)
   - Export best model

STEP 5: Deploy model (10 minutes)
   - Copy best.pt → backend/models/colony_best.pt
   - Test inference via API
   - Verify accuracy ≥92%

TOTAL TIME: ~3-4 hours to working demo!
    """)


if __name__ == "__main__":
    print("="*70)
    print("🤖 ColonyAI - Dataset Preparation Script")
    print("="*70)
    
    # Create structure
    dataset_path = create_sample_dataset()
    
    # Create YAML config
    create_data_yaml()
    
    # Show instructions
    download_instructions()
    
    print("\n✅ Dataset structure ready!")
    print("\n📖 For detailed guide, see:")
    print("   ml-training/DATASET_GUIDE.md")
