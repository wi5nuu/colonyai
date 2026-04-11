# 🚀 Local Training Guide - ColonyAI

Complete guide untuk training model YOLOv8 langsung di laptop Anda (tanpa Google Colab)

---

## 📋 Prerequisites

### 1. **Install Python 3.10+**

Pastikan Python sudah terinstall:
```bash
python --version
```

Jika belum, download dari: https://www.python.org/downloads/

### 2. **Install Dependencies**

```bash
# Navigate ke folder ml-training
cd d:\lombapuai\ml-training

# Install Python dependencies
pip install -r requirements.txt
```

### 3. **GPU Support (Optional tapi Recommended)**

**Untuk NVIDIA GPU:**
```bash
# Check GPU availability
python -c "import torch; print(f'CUDA Available: {torch.cuda.is_available()}'); print(f'GPU Name: {torch.cuda.get_device_name(0)}' if torch.cuda.is_available() else 'No GPU')"
```

**Install CUDA-enabled PyTorch (jika punya NVIDIA GPU):**
```bash
# Uninstall CPU-only version
pip uninstall torch torchvision -y

# Install GPU version (sesuaikan CUDA version)
# Untuk CUDA 11.8:
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118

# Untuk CUDA 12.1:
# pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
```

---

## 📦 Dataset Setup

### Option A: Download Dataset Otomatis (Recommended)

```bash
# Jalankan script untuk setup struktur dataset
python download_dataset.py
```

Script ini akan:
- ✅ Membuat folder structure yang benar
- ✅ Membuat `data.yaml` untuk YOLO
- ✅ Memberikan instruksi download dataset

### Option B: Manual Download

**1. Download dari Roboflow Universe (Tercepat - YOLO Ready)**

Kunjungi: https://universe.roboflow.com/search?q=bacterial+colony

- Pilih dataset bacterial colony
- Klik "Download"
- Pilih format: **YOLOv8 PyTorch**
- Extract ke `d:\lombapuai\ml-training\datasets\colony_dataset\`

**2. Download dari Kaggle**

```bash
# Install Kaggle CLI
pip install kaggle

# Setup credentials (download dari Kaggle → Account → API)
# Buat folder .kaggle di user home
mkdir %USERPROFILE%\.kaggle

# Download dataset (contoh: DIBaS)
kaggle datasets download -d samaarashidaarbi/dibas-bacterial-colony-dataset

# Extract ke folder dataset
# Manual extract atau gunakan:
python -m zipfile -extract dibas-bacterial-colony-dataset.zip datasets\colony_dataset\
```

### Option C: Gunakan Dataset Lokal (Jika Sudah Ada)

Jika Anda sudah punya dataset bacterial colony sendiri:

```
d:\lombapuai\ml-training\datasets\colony_dataset\
├── images\
│   ├── train\     (70% dari total images)
│   ├── val\       (20% dari total images)
│   └── test\      (10% dari total images)
├── labels\
│   ├── train\     (YOLO format .txt files)
│   ├── val\
│   └── test\
└── data.yaml      (Konfigurasi dataset)
```

**Format YOLO Annotation** (`<image_name>.txt`):
```
<class_id> <x_center> <y_center> <width> <height>
```

Semua nilai dinormalisasi (0-1) relatif terhadap ukuran gambar.

---

## 🏋️ Training Model

### 1. **Verify Dataset**

Sebelum training, pastikan dataset benar:

```bash
# Buat script verify (lihat di bawah)
python verify_dataset.py
```

### 2. **Start Training**

```bash
# Navigate ke ml-training
cd d:\lombapuai\ml-training

# Jalankan training
python train.py
```

**Training akan:**
- ✅ Load YOLOv8n pretrained model
- ✅ Train selama 100 epochs
- ✅ Save best model ke `runs/detect/colony_detection/weights/best.pt`
- ✅ Export ke berbagai format (PT, ONNX, TensorRT)
- ✅ Validate model performance
- ✅ Test inference pada sample image

### 3. **Monitor Training**

Training logs akan muncul di console. Metrics penting:
- **mAP@0.5**: Target > 0.90
- **Precision**: Target > 0.85
- **Recall**: Target > 0.85
- **Loss**: Harus menurun setiap epoch

Training results juga tersimpan di:
```
runs/detect/colony_detection/
├── weights/
│   ├── best.pt      ← Model terbaik
│   └── last.pt      ← Model epoch terakhir
├── results.png      ← Training curves
├── confusion_matrix.png
└── ...
```

---

## ⚙️ Custom Training Parameters

Edit `train.py` untuk menyesuaikan:

```python
# Di bagian konfigurasi train.py
MODEL_SIZE = "n"      # 'n'=nano, 's'=small, 'm'=medium, 'l'=large
EPOCHS = 100          # Jumlah epoch (recommended: 100-300)
BATCH_SIZE = 16       # Sesuaikan dengan VRAM GPU Anda
IMG_SIZE = 512        # Resolusi input (512 atau 640)
```

**Rekomendasi berdasarkan GPU:**

| GPU VRAM | Batch Size | Model Size | Est. Time/Epoch |
|----------|------------|------------|-----------------|
| 2-4 GB   | 8          | nano (n)   | 2-3 menit       |
| 4-6 GB   | 16         | nano (n)   | 1-2 menit       |
| 6-8 GB   | 16         | small (s)  | 2-3 menit       |
| 8+ GB    | 32         | small (s)  | 1-2 menit       |

---

## 🧪 Testing Model Setelah Training

### 1. **Validate Model**

```python
# Edit bagian validate_model() di train.py dengan path model Anda
python -c "
from train import validate_model
validate_model('runs/detect/colony_detection/weights/best.pt')
"
```

### 2. **Test Inference**

```python
# Test pada gambar baru
python -c "
from train import test_inference
test_inference(
    'runs/detect/colony_detection/weights/best.pt',
    'path/to/your/test_image.jpg'
)
"
```

### 3. **Deploy ke Backend**

```bash
# Copy model ke folder backend
copy runs\detect\colony_detection\weights\best.pt ..\backend\models\colony_best.pt
```

---

## 🔧 Troubleshooting

### Issue: "CUDA out of memory"

**Solusi:**
1. Turunkan `BATCH_SIZE` di `train.py` (misal: 16 → 8 → 4)
2. Turunkan `IMG_SIZE` (640 → 512 → 416)
3. Gunakan model lebih kecil (`MODEL_SIZE = "n"`)
4. Close aplikasi lain yang pakai GPU

### Issue: "No module named 'ultralytics'"

**Solusi:**
```bash
pip install -r requirements.txt
```

### Issue: Training terlalu lambat

**Solusi:**
1. Pastikan pakai GPU (check: `torch.cuda.is_available()`)
2. Install PyTorch dengan CUDA support (lihat di atas)
3. Turunkan `EPOCHS` untuk testing awal (misal: 50)
4. Gunakan `MODEL_SIZE = "n"` (nano) untuk kecepatan

### Issue: Dataset tidak ditemukan

**Solusi:**
```bash
# Jalankan script setup
python download_dataset.py

# Verify struktur folder
python verify_dataset.py
```

### Issue: mAP rendah (< 0.70)

**Solusi:**
1. Tambah jumlah training images (minimal 1000)
2. Balance classes (pastikan semua class punya cukup contoh)
3. Naikkan `EPOCHS` ke 200-300
4. Coba model lebih besar (`MODEL_SIZE = "s"`)
5. Cek kualitas anotasi (pastikan bounding boxes akurat)

---

## 📊 Expected Performance

**Untuk laptop dengan GPU NVIDIA (GTX 1650+):**

| Dataset Size | Epochs | Training Time | Expected mAP |
|--------------|--------|---------------|--------------|
| 500 images   | 100    | ~30 menit     | 0.75-0.80    |
| 1000 images  | 100    | ~45 menit     | 0.80-0.85    |
| 2000 images  | 150    | ~1.5 jam      | 0.85-0.90    |
| 5000+ images | 200    | ~3 jam        | 0.90-0.95    |

**Tanpa GPU (CPU only):**
- Training akan 5-10x lebih lambat
- Tetap feasible untuk dataset < 2000 images
- Gunakan `MODEL_SIZE = "n"` dan `BATCH_SIZE = 4`

---

## 🎯 Quick Start Commands

```bash
# 1. Install dependencies
cd d:\lombapuai\ml-training
pip install -r requirements.txt

# 2. Setup dataset structure
python download_dataset.py

# 3. Download dataset (pilih salah satu dari DATASET_GUIDE.md)
# ... download manual atau via Kaggle CLI ...

# 4. Verify dataset
python verify_dataset.py

# 5. Train model
python train.py

# 6. Deploy ke backend
copy runs\detect\colony_detection\weights\best.pt ..\backend\models\colony_best.pt

# 7. Test backend inference
cd ..\backend
python -c "from app.models.colony_detector import detect_colonies; print('Model loaded!')"
```

---

## 📚 Additional Resources

- **DATASET_GUIDE.md**: Panduan lengkap download dataset
- **train.py**: Script training dengan comments
- **Ultralytics Docs**: https://docs.ultralytics.com/
- **YOLOv8 GitHub**: https://github.com/ultralytics/ultralytics

---

## 💡 Tips untuk Hasil Terbaik

1. **Start Small**: Train dengan 50-100 images dulu untuk testing pipeline
2. **Monitor Loss**: Pastikan training loss terus menurun
3. **Validate Often**: Check mAP setiap 10 epochs
4. **Augmentation**: Script sudah include augmentasi otomatis
5. **Early Stopping**: YOLOv8 sudah punya built-in early stopping
6. **Use Pretrained**: Jangan train from scratch, pakai transfer learning
7. **Test Real Images**: Validasi dengan foto dari lab Anda

---

## 🆘 Butuh Bantuan?

Jika ada error atau pertanyaan:
1. Cek error message di console
2. Lihat bagian Troubleshooting di atas
3. Cek Ultralytics documentation
4. Lihat training logs di `runs/detect/colony_detection/`

**Good luck dengan training! 🚀🧫**
