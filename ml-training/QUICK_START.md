# 🚀 Quick Start Training - RTX 5050 Laptop

## ⚡ Status GPU Anda

```
GPU: NVIDIA GeForce RTX 5050 Laptop (8.5 GB VRAM)
Architecture: Blackwell (sm_120) - Very New!
Status: ⚠️ Needs PyTorch nightly for full support
```

---

## 🎯 PILIHAN ANDA

### ✅ **OPTION A: Training dengan CPU** (START NOW)

**Waktu Setup:** 0 menit - LANGSUNG BISA!  
**Training Time:** 3-5 jam untuk 100 epochs  
**Quality:** SAMA PERSIS dengan GPU

**Cara:**
```bash
cd d:\lombapuai\ml-training
python train.py
```

Atau **double-click**: `run_training.bat`

---

### 🚀 **OPTION B: Training dengan GPU** (SETUP DULU)

**Waktu Setup:** 30-60 menit (download + install)  
**Training Time:** 25-35 menit untuk 100 epochs  
**Quality:** SAMA PERSIS dengan CPU

**Cara:**
```bash
# 1. Install PyTorch nightly (download 2.7 GB)
pip uninstall torch torchvision -y
pip install --pre torch torchvision --index-url https://download.pytorch.org/whl/nightly/cu128

# 2. Edit train.py
USE_GPU = True
BATCH_SIZE = 32

# 3. Training
python train.py
```

---

## 💡 REKOMENDASI

**Option A dulu** (CPU tonight), **Option B nanti** (kalau ada waktu setup)

**Kenapa?**
- ✅ Hasil model SAMA
- ✅ Bisa mulai sekarang
- ✅ Tidak ada setup ribet
- ✅ Malam training, pagi selesai

---

## 📊 Dataset Anda (SIAP TRAINING!)

```
✅ Training images: 1,031
✅ Validation images: 306
✅ Test images: 140
✅ Total: 1,477 images
✅ Classes: 1 (CFU)
✅ Annotations: YOLO format ready
```

---

## 🏁 LANGKAH SELANJUTNYA

### 1. Verify Dataset (30 detik)
```bash
cd d:\lombapuai\ml-training
python test_gpu.py
```

### 2. Start Training (SEKARANG!)
```bash
python train.py
```

### 3. Tunggu Selesai
- **CPU:** 3-5 jam
- **GPU:** 25-35 menit (setelah setup)

### 4. Deploy Model
```bash
copy runs\detect\colony_detection\weights\best.pt ..\backend\models\colony_best.pt
```

---

## 📚 Dokumentasi Lengkap

| File | Isi |
|------|-----|
| `GPU_SETUP_RTX5050.md` | Penjelasan lengkap masalah GPU |
| `LOCAL_TRAINING_GUIDE.md` | Panduan training lengkap |
| `DATASET_GUIDE.md` | Info dataset |
| `train.py` | Script training (sudah dioptimasi) |

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| CUDA error | Pakai CPU mode (default sekarang) |
| Training lambat | Pakai GPU (Option B) atau turunkan epochs |
| Out of memory | Turunkan BATCH_SIZE ke 8 |
| Dataset error | Jalankan `python test_gpu.py` |

---

**Ready to train? Just run:**
```bash
python train.py
```

**Good luck! 🧫🤖**
