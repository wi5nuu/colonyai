# 🎯 PANDUAN ANNOTATE DATASET DARI NOL

## KENAPA MULAI DARI 0?

✅ **Kontrol penuh** atas 5 class yang dibutuhkan
✅ **Pasti akurat** karena Anda yang label sendiri
✅ **Sesuai kebutuhan** kompetisi Anda
✅ **Tidak buang waktu** cari dataset yang tidak cocok

---

## 📋 TARGET 5 CLASS YANG WAJIB

1. **colony_single** - Koloni tunggal terpisah
2. **colony_merged** - Koloni yang menempel/overlap
3. **bubble** - Gelembung udara di media agar
4. **dust_debris** - Partikel debu/kontaminan
5. **media_crack** - Retakan pada media agar

---

## 🚀 LANGKAH-LANGKAH

### **STEP 1: COLLECT GAMBAR (2-3 jam)**

#### **A. Gunakan Gambar Existing**
```
1. Gambar kompetisi: casseforcompetetions.png
2. Gambar test: sample_macconkey_agar.png, sample_pca_agar.png
3. Gambar dari lab Anda (jika ada)
```

#### **B. Download Gambar dari Internet**

**Keyword untuk Google Images:**
- "bacterial colony petri dish"
- "agar plate bacteria"
- "colony counting plate"
- "petri dish contamination"
- "agar plate bubble"
- "bacterial culture plate"

**Download:**
- **Colony**: 50-100 gambar
- **Bubble**: 20-30 gambar
- **Dust/Debris**: 20-30 gambar
- **Crack**: 15-20 gambar

**Total target: 100-200 gambar**

#### **C. Sumber Gambar Gratis**
- Google Images (filter: Creative Commons)
- Unsplash: https://unsplash.com/s/photos/petri-dish
- Pexels: https://www.pexels.com/search/bacteria/
- Wikimedia Commons
- Research papers (open access)

---

### **STEP 2: SETUP ROBOFLOW PROJECT (15 menit)**

1. **Buka Roboflow:** https://app.roboflow.com/
2. **Create New Project**
   - Name: "ColonyAI-5Class"
   - Type: **Object Detection**
   - Annotation Group: "ColonyAI"

3. **Setup Classes**
   - Klik "Classes & Tags"
   - Add 5 classes:
     ```
     0: colony_single
     1: colony_merged
     2: bubble
     3: dust_debris
     4: media_crack
     ```

---

### **STEP 3: UPLOAD GAMBAR (30 menit)**

1. **Klik "Upload"** di Roboflow
2. **Drag & drop** semua gambar (100-200 gambar)
3. **Wait for upload** to complete
4. **Klik "Finish Uploading"**

---

### **STEP 4: ANNOTATE (4-6 jam) - PALING PENTING!**

#### **Cara Annotate di Roboflow:**

1. **Klik "Annotate"** di sidebar
2. **Pilih gambar pertama**
3. **Buat bounding box:**
   - Klik dan drag untuk buat kotak
   - Pastikan kotak pas dengan objek
   - Pilih class yang sesuai

4. **Annotate setiap objek:**
   - **colony_single**: Kotak di setiap koloni terpisah
   - **colony_merged**: Kotak di koloni yang menempel
   - **bubble**: Kotak di gelembung (biasanya bulat, transparan)
   - **dust_debris**: Kotak di partikel kecil/kontaminan
   - **media_crack**: Kotak di retakan media

5. **Tips Annotate:**
   - Zoom in untuk objek kecil
   - Buat kotak sedikit lebih besar dari objek
   - Konsisten dalam labeling
   - Skip gambar yang blur/tidak jelas

6. **Keyboard Shortcuts:**
   - `1-5`: Pilih class 1-5
   - `Space`: Next image
   - `Backspace`: Previous image
   - `Delete`: Hapus box

#### **Target Annotate:**
- **Minimal:** 50 gambar (2-3 jam)
- **Ideal:** 100 gambar (4-6 jam)
- **Optimal:** 200+ gambar (8-10 jam)

---

### **STEP 5: AUGMENTATION (10 menit)**

Setelah annotate, buat augmentation untuk perbanyak data:

1. **Klik "Generate"** di Roboflow
2. **Preprocessing:**
   - Auto-Orient: ✅ Yes
   - Resize: 640x640
   - Stretch to: ✅ Yes

3. **Augmentation:**
   - Flip: Horizontal ✅, Vertical ✅
   - Rotation: ±15°
   - Brightness: ±25%
   - Exposure: ±20%
   - Blur: Up to 1.5px
   - Mosaic: ✅ Yes (50%)

4. **Generate:**
   - Augmentation multiplier: **3x**
   - Split: Train 70%, Valid 20%, Test 10%
   - Klik "Generate"

**Hasil:** 50 gambar → 150 gambar (dengan augmentation)

---

### **STEP 6: DOWNLOAD DATASET (5 menit)**

1. **Klik "Export"**
2. **Format: YOLOv8**
3. **Download ZIP**
4. **Extract ke:**
   ```
   D:\lombapuai\ml-training\datasets\colonyai_custom\
   ```

---

### **STEP 7: TRAINING (4-6 jam dengan GPU)**

```bash
cd D:\lombapuai\backend
python train_custom_dataset.py
```

Script training akan saya buatkan di bawah.

---

## ⏱️ ESTIMASI WAKTU TOTAL

| Tahap | Waktu | Keterangan |
|-------|-------|------------|
| Collect gambar | 2-3 jam | Download dari internet |
| Setup Roboflow | 15 menit | Create project, setup classes |
| Upload gambar | 30 menit | Upload 100-200 gambar |
| **Annotate** | **4-6 jam** | **PALING LAMA** |
| Augmentation | 10 menit | Generate di Roboflow |
| Download dataset | 5 menit | Download ZIP |
| Training | 4-6 jam | Dengan GPU |
| **TOTAL** | **12-16 jam** | **Spread over 2-3 hari** |

---

## 💡 TIPS EFISIENSI

### **Untuk Mempercepat Annotate:**

1. **Annotate bertahap:**
   - Hari 1: 30 gambar (2 jam)
   - Hari 2: 30 gambar (2 jam)
   - Hari 3: 40 gambar (2 jam)

2. **Fokus pada class prioritas:**
   - **Wajib:** colony_single, colony_merged (50 gambar)
   - **Penting:** bubble, dust_debris (30 gambar)
   - **Opsional:** media_crack (20 gambar)

3. **Gunakan gambar berkualitas:**
   - Resolusi tinggi
   - Fokus jelas
   - Lighting baik
   - Objek terlihat jelas

---

## 🎯 MINIMAL VIABLE DATASET

Jika waktu sangat terbatas:

**MINIMAL (6-8 jam total):**
- 30 gambar annotated
- 3x augmentation = 90 gambar
- Training 50 epochs
- Akurasi: 60-70%

**IDEAL (12-16 jam total):**
- 100 gambar annotated
- 3x augmentation = 300 gambar
- Training 150 epochs
- Akurasi: 80-90%

---

## 📸 CONTOH ANNOTATE

### **Colony Single:**
```
[Gambar petri dish]
  ┌─────┐
  │  O  │ ← Kotak di setiap koloni terpisah
  └─────┘
```

### **Colony Merged:**
```
[Gambar petri dish]
  ┌─────────┐
  │  O O O  │ ← Kotak besar untuk koloni yang menempel
  └─────────┘
```

### **Bubble:**
```
[Gambar petri dish]
  ┌───┐
  │ ○ │ ← Kotak di gelembung (bulat, transparan)
  └───┘
```

### **Dust/Debris:**
```
[Gambar petri dish]
  ┌─┐
  │·│ ← Kotak kecil di partikel debu
  └─┘
```

### **Media Crack:**
```
[Gambar petri dish]
  ┌─────────┐
  │    /    │ ← Kotak di retakan (garis)
  └─────────┘
```

---

## ✅ KEUNTUNGAN ANNOTATE SENDIRI

1. ✅ **100% sesuai kebutuhan** Anda
2. ✅ **Pasti punya 5 class** yang wajib
3. ✅ **Kualitas terjamin** karena Anda yang label
4. ✅ **Bisa tambah data** kapan saja
5. ✅ **Tidak tergantung** dataset orang lain

---

## 🚀 NEXT STEPS

1. **Mulai collect gambar** (2-3 jam)
2. **Setup Roboflow project** (15 menit)
3. **Annotate 30 gambar dulu** (2 jam) - TEST
4. **Generate & download** (15 menit)
5. **Training test** (1 jam)
6. **Jika hasil bagus, lanjut annotate lebih banyak**

---

**Mau saya buatkan script training untuk dataset custom Anda?** 🎯
