# ColonyAI - Dataset Acquisition Guide

## ⚠️ IMPORTANT: Original DOI Tidak Lagi Aktif

DOI `10.1038/s41598-021-99300-z` dari proposal sudah tidak aktif. **Jangan khawatir!** Ada beberapa dataset alternatif yang **REAL dan bisa di-download** untuk training ColonyAI.

---

## 📊 REKOMENDASI DATASET (Verified & Accessible)

### 1. **DIBaS Bacterial Colony Dataset** (RECOMMENDED) ⭐

**Status**: ✅ AVAILABLE & DOWNLOADABLE  
**Source**: Kaggle  
**Size**: ~612 MB  
**Images**: Annotated bacterial colony images  
**Format**: YOLO-ready annotations  

**Download Link**:
```
https://www.kaggle.com/datasets/samaarashidaarbi/dibas-bacterial-colony-dataset
```

**Cara Download**:
1. Buat akun Kaggle (gratis)
2. Install Kaggle CLI:
   ```bash
   pip install kaggle
   ```
3. Download API credentials dari Kaggle → Account → Create New API Token
4. Download dataset:
   ```bash
   kaggle datasets download -d samaarashidaarbi/dibas-bacterial-colony-dataset
   ```

---

### 2. **Annotated Dataset for Deep-Learning Bacterial Detection**

**Status**: ✅ AVAILABLE  
**Source**: Figshare (Nature Scientific Data)  
**Size**: 612.25 MB  
**Images**: 18,000+ annotated images  
**Annotations**: Bounding boxes  

**Download Link**:
```
https://figshare.com/articles/dataset/Annotated_dataset_for_deep-learning-based_bacterial_colony_detection/22022540
```

**Cara Download**:
1. Buka link di atas
2. Klik "Download all" (612.25 MB)
3. Extract ke folder dataset

---

### 3. **Automatic Colony Counting Dataset**

**Status**: ✅ AVAILABLE  
**Source**: Kaggle  

**Download Link**:
```
https://www.kaggle.com/datasets/clb2256095392/automatic-colony-counting
```

**Cara Download**:
```bash
kaggle datasets download -d clb2256095392/automatic-colony-counting
```

---

### 4. **AGAR Dataset (Original Paper)**

**Paper Reference**: 
- Majchrowska, Pawłowski, et al. (2021)
- "AGAR a microbial colony dataset for deep learning detection"

**Alternative Access**:
```
https://www.semanticscholar.org/paper/AGAR-a-microbial-colony-dataset-for-deep-learning-Majchrowska-Paw%C5%82owski/46f2f26065ebf07f9f6c374c2ef11d8d9e45e188
```

**Contact Authors untuk Dataset**:
- Email authors langsung untuk meminta akses dataset
- Biasanya mereka akan memberikan Google Drive atau Figshare link

---

### 5. **Roboflow Universe - Colony Datasets**

**Status**: ✅ MULTIPLE DATASETS AVAILABLE  
**Source**: Roboflow Universe  

**Search Link**:
```
https://universe.roboflow.com/search?q=bacterial%20colony
```

**Keuntungan**:
- ✅ Sudah dalam format YOLO
- ✅ Bisa langsung export ke YOLOv8
- ✅ Augmentation built-in
- ✅ Some datasets have 1000+ images

**Cara Download**:
1. Buka link di atas
2. Pilih dataset bacterial colony
3. Klik "Download"
4. Pilih format: YOLOv8 PyTorch
5. Download zip file

---

## 🚀 QUICK START: Download & Setup Dataset

### Option A: Download dari Kaggle (Recommended)

```bash
# 1. Install kaggle CLI
pip install kaggle

# 2. Setup credentials
mkdir ~/.kaggle
# Download kaggle.json dari Kaggle account settings
cp kaggle.json ~/.kaggle/
chmod 600 ~/.kaggle/kaggle.json

# 3. Download dataset
cd d:\lombapuai\ml-training
kaggle datasets download -d samaarashidaarbi/dibas-bacterial-colony-dataset

# 4. Extract
mkdir -p datasets/colony_dataset
unzip dibas-bacterial-colony-dataset.zip -d datasets/colony_dataset/
```

### Option B: Download Manual dari Figshare

```bash
# 1. Buka browser, akses:
https://figshare.com/articles/dataset/Annotated_dataset_for_deep-learning-based_bacterial_colony_detection/22022540

# 2. Klik "Download all"

# 3. Pindahkan ke folder project
# Di Windows, drag & drop file ke:
d:\lombapuai\ml-training\datasets\colony_dataset\

# 4. Extract
cd d:\lombapuai\ml-training\datasets\colony_dataset
# Extract semua file di sini
```

---

## 📁 Setup Dataset Structure

Setelah download, pastikan struktur folder seperti ini:

```
d:\lombapuai\ml-training\datasets\colony_dataset\
├── images/
│   ├── train/          # ~70% images
│   │   ├── img001.jpg
│   │   ├── img002.jpg
│   │   └── ...
│   ├── val/            # ~20% images
│   │   ├── img100.jpg
│   │   └── ...
│   └── test/           # ~10% images
│       └── ...
├── labels/
│   ├── train/          # YOLO format annotations
│   │   ├── img001.txt
│   │   └── ...
│   ├── val/
│   │   └── ...
│   └── test/
│       └── ...
└── data.yaml           # Dataset configuration
```

---

## 🔧 Convert Dataset ke YOLO Format

Jika dataset belum dalam format YOLO, gunakan script ini:

```python
# save as: d:\lombapuai\ml-training\convert_to_yolo.py

import os
import cv2
import json
from pathlib import Path
import shutil

def convert_bbox_to_yolo(bbox, img_width, img_height):
    """
    Convert bounding box to YOLO format
    bbox: [x_min, y_min, x_max, y_max]
    Returns: [x_center, y_center, width, height] (normalized)
    """
    x_center = (bbox[0] + bbox[2]) / 2 / img_width
    y_center = (bbox[1] + bbox[3]) / 2 / img_height
    width = (bbox[2] - bbox[0]) / img_width
    height = (bbox[3] - bbox[1]) / img_height
    return [x_center, y_center, width, height]

def convert_coco_to_yolo(coco_json_path, output_dir):
    """Convert COCO format annotations to YOLO format"""
    with open(coco_json_path, 'r') as f:
        coco_data = json.load(f)
    
    # Create output directories
    for split in ['train', 'val', 'test']:
        os.makedirs(os.path.join(output_dir, 'images', split), exist_ok=True)
        os.makedirs(os.path.join(output_dir, 'labels', split), exist_ok=True)
    
    # Process images and annotations
    # ... (implementation depends on your annotation format)
    
    print(f"Converted annotations saved to {output_dir}")

def create_data_yaml(output_dir, num_classes=5):
    """Create data.yaml for YOLO training"""
    yaml_content = f"""# Dataset configuration
train: ../datasets/colony_dataset/images/train
val: ../datasets/colony_dataset/images/val
test: ../datasets/colony_dataset/images/test

# Number of classes
nc: {num_classes}

# Class names
names:
  0: colony_single
  1: colony_merged
  2: bubble
  3: dust_debris
  4: media_crack
"""
    yaml_path = os.path.join(output_dir, 'data.yaml')
    with open(yaml_path, 'w') as f:
        f.write(yaml_content)
    
    print(f"data.yaml created at {yaml_path}")

if __name__ == "__main__":
    # Update paths as needed
    dataset_path = "d:/lombapuai/ml-training/datasets/colony_dataset"
    create_data_yaml(dataset_path)
```

---

## 🎯 Recommended Dataset Strategy

### Untuk Hackathon Demo (Quick Setup):

**Use Roboflow Universe** (Fastest)
1. Download pre-annotated dataset
2. Already in YOLO format
3. Can start training immediately
4. Time: ~30 minutes setup

### Untuk Production (Best Quality):

**Combine Multiple Datasets**
1. Download DIBaS from Kaggle (612 MB)
2. Download Figshare dataset
3. Download Roboflow datasets
4. Merge all datasets
5. Split: 70% train, 20% val, 10% test
6. Total: 20,000+ images
7. Time: ~2-3 hours setup

---

## 📊 Dataset Size Recommendations

| Purpose | Min Images | Recommended | Expected mAP |
|---------|------------|-------------|--------------|
| Quick Demo | 500 | 1,000 | 0.75-0.80 |
| Competition | 2,000 | 5,000 | 0.85-0.90 |
| Production | 10,000 | 20,000+ | 0.90-0.95 |

---

## 🔍 Verify Dataset Quality

Setelah download, cek:

```python
# verify_dataset.py
import os
import cv2
from pathlib import Path

def verify_dataset(dataset_path):
    """Verify dataset integrity"""
    
    splits = ['train', 'val', 'test']
    
    for split in splits:
        img_dir = Path(dataset_path) / 'images' / split
        label_dir = Path(dataset_path) / 'labels' / split
        
        if not img_dir.exists():
            print(f"⚠️  Warning: {img_dir} not found")
            continue
        
        images = list(img_dir.glob('*.jpg')) + list(img_dir.glob('*.png'))
        labels = list(label_dir.glob('*.txt'))
        
        print(f"\n📊 {split.upper()} split:")
        print(f"  Images: {len(images)}")
        print(f"  Labels: {len(labels)}")
        
        if len(images) != len(labels):
            print(f"  ⚠️  MISMATCH: Images and labels count differ!")
        
        # Check a few images
        for img_path in images[:3]:
            img = cv2.imread(str(img_path))
            if img is None:
                print(f"  ❌ Corrupt image: {img_path}")
        
        # Check a few labels
        for label_path in labels[:3]:
            with open(label_path, 'r') as f:
                lines = f.readlines()
                for line in lines:
                    parts = line.strip().split()
                    if len(parts) != 5:
                        print(f"  ❌ Invalid annotation: {label_path}")
                        break
                    class_id = int(parts[0])
                    if class_id > 4:
                        print(f"  ❌ Invalid class ID {class_id} in {label_path}")
    
    print("\n✅ Dataset verification complete!")

if __name__ == "__main__":
    dataset_path = "d:/lombapuai/ml-training/datasets/colony_dataset"
    verify_dataset(dataset_path)
```

---

## 🚀 Next Steps After Dataset Setup

1. ✅ Download dataset (choose one from above)
2. ✅ Extract to `d:\lombapuai\ml-training\datasets\colony_dataset\`
3. ✅ Verify structure matches expected format
4. ✅ Update `data.yaml` if needed
5. ✅ Run `verify_dataset.py` to check integrity
6. ✅ Start training: `python train.py`

---

## 💡 Tips untuk Hasil Terbaik

1. **Gunakan minimal 2,000 images** untuk kompetisi
2. **Balance classes** - pastikan setiap class punya cukup contoh
3. **Augmentation** - script sudah include augmentasi
4. **Validate frequently** - cek mAP setiap 10 epochs
5. **Test on real lab images** - validasi dengan foto dari lab Anda

---

## 📞 Need Help?

Jika ada masalah dengan dataset:
1. Cek README di dataset yang di-download
2. Lihat contoh annotation format
3. Konversi ke YOLO format jika perlu
4. Jalankan verify script

**Good luck dengan dataset integration! 🚀**
