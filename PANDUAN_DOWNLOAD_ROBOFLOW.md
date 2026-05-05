# 📥 PANDUAN DOWNLOAD DATASET ROBOFLOW UNTUK ARTIFACT

## 🎯 DATASET YANG WAJIB DIDOWNLOAD

Berdasarkan hasil pencarian Roboflow Anda, ini dataset prioritas:

### **1. PRIORITAS TERTINGGI (WAJIB!) ⭐⭐⭐⭐⭐**

#### **"petri" by menlo college**
- **9,960 images** (SANGAT BANYAK!)
- **Classes**: B-subtilis, C-albicans, **Contamination**, **Defect**, E-coli, P-aeruginosa, S-aureus
- ✅ Ada **Contamination** (untuk dust_debris)
- ✅ Ada **Defect** (untuk media_crack)
- ✅ Sudah ada trained model
- 📥 **DOWNLOAD INI DULU!**

**Cara Download:**
```
1. Buka: https://universe.roboflow.com/
2. Search: "petri menlo college"
3. Klik dataset "petri by menlo college"
4. Klik tombol "Download Dataset"
5. Pilih format: YOLOv8
6. Download ke: D:\lombapuai\ml-training\datasets\roboflow\menlo_petri\
```

---

### **2. DATASET TAMBAHAN (Sangat Disarankan)**

#### **"Petri Dish Contamination (WS)" by USM**
- **92 images**
- **Classes**: contaminated, uncontaminated
- ✅ Fokus contamination

**Download ke:** `ml-training/datasets/roboflow/petri_contamination/`

#### **"Artifacts detection" by artifact detection**
- **41 images**
- **Classes**: defect
- ✅ Fokus defect/crack

**Download ke:** `ml-training/datasets/roboflow/artifacts_detection/`

#### **"Artifacts" by SmileScan**
- **70 images**
- **Classes**: green, purple
- ✅ Kemungkinan bubble (warna hijau/ungu)

**Download ke:** `ml-training/datasets/roboflow/artifacts_smilescan/`

#### **"Bacterial growth" by Laboratorio C+**
- **214 images**
- **Classes**: Petri-Dish
- ✅ Variasi background petri dish

**Download ke:** `ml-training/datasets/roboflow/bacterial_growth/`

---

## 📋 LANGKAH-LANGKAH DETAIL

### **Step 1: Buat Folder Structure**

```bash
mkdir -p ml-training/datasets/roboflow/menlo_petri
mkdir -p ml-training/datasets/roboflow/petri_contamination
mkdir -p ml-training/datasets/roboflow/artifacts_detection
mkdir -p ml-training/datasets/roboflow/artifacts_smilescan
mkdir -p ml-training/datasets/roboflow/bacterial_growth
```

### **Step 2: Download dari Roboflow**

Untuk setiap dataset:

1. **Login ke Roboflow**
   - Buka https://universe.roboflow.com/
   - Login dengan akun Anda

2. **Cari Dataset**
   - Search: "petri menlo college"
   - Klik dataset yang sesuai

3. **Download**
   - Klik "Download Dataset"
   - Format: **YOLOv8** (PENTING!)
   - Show download code: **No** (download langsung)
   - Klik "Download ZIP"

4. **Extract**
   - Extract ZIP ke folder yang sudah dibuat
   - Struktur harus seperti ini:
     ```
     menlo_petri/
     ├── data.yaml
     ├── train/
     │   ├── images/
     │   └── labels/
     ├── valid/
     │   ├── images/
     │   └── labels/
     └── test/
         ├── images/
         └── labels/
     ```

### **Step 3: Merge Datasets**

Setelah semua dataset didownload, jalankan script merge:

```bash
cd backend
python merge_roboflow_datasets.py
```

Script ini akan:
- ✅ Gabungkan semua dataset Roboflow
- ✅ Remap class names ke 5 class ColonyAI
- ✅ Buat dataset baru: `colonyai_with_artifacts`

**Mapping Class:**
```
Roboflow Class       →  ColonyAI Class
─────────────────────────────────────────
Contamination        →  dust_debris
Defect               →  media_crack
contaminated         →  dust_debris
defect               →  media_crack
green                →  bubble
purple               →  bubble
B-subtilis           →  colony_single
E-coli               →  colony_single
S-aureus             →  colony_single
C-albicans           →  colony_merged
P-aeruginosa         →  colony_single
```

### **Step 4: Training**

```bash
cd backend
python train_with_artifacts.py
```

Training akan:
- ✅ Gunakan YOLOv8s (balance speed & accuracy)
- ✅ Train 150 epochs
- ✅ Image size 640px
- ✅ Class weights untuk balance artifact
- ✅ Augmentation agresif

**Estimasi waktu:**
- GPU (RTX 2070+): 4-6 jam
- GPU (GTX 1660): 6-8 jam
- CPU: 20-30 jam (TIDAK DISARANKAN)

### **Step 5: Validasi**

```bash
cd backend
python check_artifact_accuracy.py
```

Cek apakah artifact sudah terdeteksi dengan baik.

---

## 🔍 CARA CARI DATASET LAIN DI ROBOFLOW

Jika dataset di atas tidak cukup, cari dengan keyword:

### **Untuk Bubble:**
- "bacterial colony bubble"
- "agar plate bubble"
- "petri dish air bubble"
- "colony counting bubble"

### **Untuk Dust/Debris:**
- "petri dish contamination"
- "agar plate contamination"
- "bacterial contamination"
- "colony counting artifacts"

### **Untuk Media Crack:**
- "agar plate crack"
- "petri dish defect"
- "media crack detection"
- "agar defect"

### **Filter yang Harus Digunakan:**
- ✅ Project Type: **Object Detection**
- ✅ Model Type: **YOLOv8** atau **YOLOv11**
- ✅ Images: **100+** (minimal)
- ✅ License: **Public Domain** atau **CC BY**

---

## 📊 TARGET DATASET SETELAH MERGE

Setelah merge, target minimal:

| Class | Target Images | Target Detections |
|-------|--------------|-------------------|
| colony_single | 2000+ | 10,000+ |
| colony_merged | 1500+ | 5,000+ |
| **bubble** | **300+** | **1,000+** |
| **dust_debris** | **300+** | **1,000+** |
| **media_crack** | **200+** | **500+** |

Dengan dataset **"petri by menlo college" (9,960 images)**, Anda sudah punya cukup data!

---

## ⚠️ TROUBLESHOOTING

### **Problem: Dataset tidak ada class artifact**
**Solusi:** Cari dataset lain atau annotate manual

### **Problem: Class names berbeda**
**Solusi:** Edit `CLASS_MAPPING` di `merge_roboflow_datasets.py`

### **Problem: Download gagal**
**Solusi:**
1. Cek koneksi internet
2. Login ulang ke Roboflow
3. Coba download dengan API key

### **Problem: Format bukan YOLOv8**
**Solusi:**
1. Re-download dengan format YOLOv8
2. Atau convert manual dengan Roboflow

---

## ✅ CHECKLIST

Sebelum training, pastikan:

- [ ] Download minimal 1 dataset (menlo college - WAJIB)
- [ ] Extract semua dataset ke folder roboflow/
- [ ] Jalankan merge_roboflow_datasets.py
- [ ] Cek output: `colonyai_with_artifacts/data.yaml` ada
- [ ] Cek jumlah images: minimal 1000+ total
- [ ] Cek class distribution: semua 5 class ada
- [ ] GPU ready (jika ada)
- [ ] Jalankan train_with_artifacts.py

---

## 🚀 ESTIMASI TOTAL WAKTU

| Tahap | Waktu |
|-------|-------|
| Download datasets | 30-60 menit |
| Merge datasets | 10-15 menit |
| Training | 4-6 jam (GPU) |
| Validation | 30 menit |
| **TOTAL** | **6-8 jam** |

---

## 📞 BANTUAN

Jika ada masalah:

1. Cek log error
2. Pastikan format YOLOv8
3. Cek struktur folder
4. Validasi data.yaml

---

**Dengan dataset "petri by menlo college" (9,960 images), Anda sudah punya cukup data untuk artifact detection yang akurat! 🎯**
