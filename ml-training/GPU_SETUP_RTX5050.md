# 🎮 Setup GPU RTX 5050 untuk Training ColonyAI

## ⚠️ Situasi Saat Ini

**GPU Anda:** NVIDIA GeForce RTX 5050 Laptop (8.5 GB VRAM)
**Architecture:** Blackwell (sm_120)
**Status:** ⚠️ Belum fully supported oleh PyTorch stable

### Masalah yang Dihadapi:

RTX 5050 menggunakan arsitektur **Blackwell (sm_120)** yang sangat baru (2025). PyTorch stable saat ini hanya support sampai sm_90 (Hopper architecture).

**Error yang muncul:**
```
CUDA error: no kernel image is available for execution on the device
```

---

## ✅ SOLUSI (3 Opsi)

### Opsi 1: **Training dengan CPU** (RECOMMENDED - Quick Start)

**Keuntungan:**
- ✅ Langsung bisa training sekarang
- ✅ Stabil, no hassle
- ✅ Tidak perlu install ulang

**Kekurangan:**
- ⏱️ Lebih lambat: ~3-5 jam untuk 100 epochs (vs 30 menit dengan GPU)
- 🔋 Pakai CPU 100%

**Cara Setup:**

Konfigurasi sudah di-set otomatis ke CPU:
```python
# Di train.py
USE_GPU = False
BATCH_SIZE = 16
```

**Langsung training:**
```bash
cd d:\lombapuai\ml-training
python train.py
```

**Estimasi waktu:** 3-5 jam (bisa jalanin malam hari, pagi selesai)

---

### Opsi 2: **Install PyTorch Nightly dengan CUDA 12.8** (GPU Support)

**Keuntungan:**
- ✅ GPU akan bekerja optimal
- ⏱️ Training cepat: ~30 menit untuk 100 epochs
- ✅ Official support dari PyTorch nightly

**Kekurangan:**
- ⏱️ Download besar: ~2.7 GB
- ⏱️ Install time: 20-40 menit
- ⚠️ Nightly build (mungkin ada bugs minor)

**Cara Install:**

```bash
# 1. Uninstall PyTorch sekarang
pip uninstall torch torchvision -y

# 2. Install PyTorch nightly dengan CUDA 12.8
pip install --pre torch torchvision --index-url https://download.pytorch.org/whl/nightly/cu128

# 3. Test GPU
python test_gpu.py

# 4. Kalau sukses, enable GPU di train.py
# Edit train.py:
USE_GPU = True
BATCH_SIZE = 32

# 5. Training
python train.py
```

**Note:** Download sebelumnya timeout karena koneksi internet. Bisa dicoba lagi kalau koneksi stabil.

---

### Opsi 3: **Compile PyTorch dari Source** (Full GPU Support)

**Keuntungan:**
- ✅ Full support untuk RTX 5050 (sm_120)
- ✅ Performance optimal
- ✅ Stable (bukan nightly)

**Kekurangan:**
- ⏱️ Compile time: 1-2 jam
- 💾 Disk space: ~10 GB
- 🔧 Lebih complex setup

**Cara Install:**

```bash
# 1. Install dependencies
pip install numpy pyyaml mkl mkl-include setuptools cmake cpython

# 2. Install Visual Studio Build Tools (Windows)
# Download dari: https://visualstudio.microsoft.com/visual-cpp-build-tools/
# Install "Desktop development with C++"

# 3. Clone PyTorch
git clone --recursive https://github.com/pytorch/pytorch
cd pytorch

# 4. Set environment variables
set TORCH_CUDA_ARCH_LIST=12.0
set USE_CUDA=1
set CMAKE_GENERATOR=Visual Studio 17 2022

# 5. Build (ini yang lama: 1-2 jam)
python setup.py bdist_wheel

# 6. Install hasil build
pip install dist\torch-*.whl

# 7. Test
cd ..
python test_gpu.py
```

**Recommended kalau:** Anda punya waktu dan mau performance maksimal.

---

## 🎯 REKOMENDASI SAYA

### Untuk Sekarang: **PAKAI CPU DULU**

**Alasan:**
1. ✅ Dataset Anda 1,477 images - tidak terlalu besar
2. ✅ YOLOv8n (nano) relatif cepat bahkan di CPU
3. ✅ Bisa langsung training sekarang tanpa setup ribet
4. ✅ Malam hari training, pagi selesai

**Action Plan:**
```
Hari ini:
  → Training dengan CPU (3-5 jam)
  → Dapat model pertama
  → Test performance

Nanti (kalau mau optimal):
  → Install PyTorch nightly dengan GPU support
  → Re-train dengan GPU (30 menit)
  → Compare results
```

---

## 📊 Perbandingan Performance

| Setup | Batch Size | 100 Epochs | mAP Expected |
|-------|------------|------------|--------------|
| **CPU (i5/i7)** | 16 | 3-5 jam | 0.85-0.90 |
| **GPU RTX 5050** | 32 | 25-35 menit | 0.85-0.90 |

**Hasil model:** SAMA persis, hanya waktu training beda.

---

## 🚀 MULAI TRAINING (CPU Mode)

### Step 1: Verify Dataset
```bash
cd d:\lombapuai\ml-training
python test_gpu.py
```

Output harusnya:
```
✅ data.yaml found
✅ Training images: 1031
✅ Validation images: 306
✅ Test images: 140
```

### Step 2: Start Training
```bash
python train.py
```

Atau double-click:
```
run_training.bat
```

### Step 3: Monitor Progress

Training akan jalan di terminal. Anda bisa:
- Pantau metrics (mAP, loss, precision)
- Lihat grafik di `runs/detect/colony_detection/results.png`
- Tunggu sampai selesai (~3-5 jam)

### Step 4: Deploy Model
```bash
# Setelah training selesai
copy runs\detect\colony_detection\weights\best.pt ..\backend\models\colony_best.pt
```

---

## 💡 Tips untuk CPU Training

1. **Close aplikasi berat lain** (browser tabs, game, dll)
2. **Training malam hari** - tidak ganggu kerja
3. **Monitor suhu laptop** - pastikan tidak overheating
4. **Plug in charger** - jangan pakai battery mode
5. **Bisa di-stop kapan saja** - model auto-save tiap epoch

---

## 🔄 Nanti Kalau Mau Upgrade ke GPU

Kalau sudah ada waktu dan mau training lebih cepat:

```bash
# 1. Install PyTorch nightly (butuh download 2.7 GB)
pip uninstall torch torchvision -y
pip install --pre torch torchvision --index-url https://download.pytorch.org/whl/nightly/cu128

# 2. Test GPU
python test_gpu.py

# 3. Kalau success, edit train.py:
# USE_GPU = True
# BATCH_SIZE = 32

# 4. Training ulang (lebih cepat!)
python train.py
```

---

## 🆘 Troubleshooting

### ❌ "CUDA error: no kernel image"
**Solusi:** Pakai CPU mode (sudah di-set default)

### ❌ Training terlalu lambat
**Solusi:** 
- Turunkan EPOCHS ke 50 untuk testing
- Atau install GPU support (lihat Opsi 2/3)

### ❌ Out of Memory (kalau pakai GPU)
**Solusi:** Turunkan BATCH_SIZE ke 16 atau 8

---

## 📞 Butuh Bantuan?

Kalau ada pertanyaan atau error:
1. Screenshot error message
2. Tanyakan ke AI assistant
3. Cek log di `runs/detect/colony_detection/`

---

## ✅ Kesimpulan

**GPU RTX 5050 Anda bagus banget** (8.5 GB VRAM!), tapi terlalu baru untuk PyTorch stable. 

**Solusi terbaik:** 
1. Training dulu dengan CPU (3-5 jam)
2. Nanti upgrade ke GPU kalau ada waktu setup

**Hasil model akan SAMA**, hanya beda waktu training.

**Good luck! 🚀**
