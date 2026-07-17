# Competition Compliance — Case 1: Microbiology Laboratory

**English / Bahasa Indonesia (Bilingual Document)**

This document provides technical evidence that ColonyAI has fulfilled all challenges (cases) specified in the AI Open 2026 competition, Case 1: Microbiology Laboratory.

Dokumen ini adalah ringkasan teknis yang membuktikan bahwa ColonyAI telah menyelesaikan seluruh tantangan (challenge) yang diberikan pada Case 1: Microbiology Laboratory.

Functional verification can be performed via:
- Web interface (Simulator page)
- Automated pytest suite in the backend directory

Verifikasi fungsionalitas dapat dilakukan melalui:
- Antarmuka web (halaman Simulator)
- Pengujian otomatis pytest di direktori backend

---

## Feature Mapping to Competition Requirements

### 1. Identifying the agar plate area from the image

**Status:** Completed | **Status:** Selesai

**Code Location / Lokasi Kode:**
- `backend/app/services/image_processor.py` (`preprocess` → `_detect_plate_boundary` → `_correct_perspective` → `_normalize_brightness`)

**How It Works / Cara Kerja:**
The preprocessing pipeline executes 4 sequential steps:
1. **Plate Boundary Detection**: OpenCV Hough Circle Transform detects the circular petri dish boundary (adaptive parameters: `param2=25`, `minRadius=35%`, `maxRadius=52%`)
2. **Perspective Correction**: If a circular plate is detected, `cv2.findHomography()` + `cv2.warpPerspective()` normalizes the plate to a top-down view, correcting any angle distortion
3. **Brightness/Contrast Normalization**: CLAHE (Contrast Limited Adaptive Histogram Equalization) with auto-exposure detection (gamma correction for dark/overexposed images, clipLimit 3.0-4.0)
4. **Resize**: Proportionally resized to 640x640 pixels for model inference

Coordinate mapping uses: `final_coord = detection_coord * (original_size / 640)`.

Pipeline preprocessing terdiri dari 4 langkah: (1) Deteksi batas cawan dengan Hough Circle Transform, (2) Koreksi perspektif dengan homography warp, (3) Normalisasi brightness dengan CLAHE adaptive exposure, (4) Resize ke 640x640 piksel.

---

### 2. Automatic detection and counting of bacterial colonies

**Status:** Completed | **Status:** Selesai

**Code Location / Lokasi Kode:**
- `backend/app/services/colony_detector_optimized.py`
- `backend/app/services/colony_detector.py`

**How It Works / Cara Kerja:**
The inference pipeline loads a custom-trained YOLOv8 model. Bounding boxes and confidence scores of detected colonies are streamed to the frontend for real-time rendering on the Dashboard page.

Pipeline inferensi memuat model YOLOv8 yang telah dilatih khusus. Bounding box dan confidence score setiap koloni dikirim ke frontend untuk ditampilkan secara real-time.

---

### 3. Differentiate valid colonies vs. artifacts

**Status:** Completed | **Status:** Selesai

**Code Location / Lokasi Kode:**
- `backend/app/services/colony_detector.py` (`VALID_COLONY_CLASSES` and `ARTIFACT_CLASSES` constants)

**How It Works / Cara Kerja:**
The YOLOv8 model is trained with a 5-class architecture to distinguish valid biological colonies from non-biological noise:

**Valid Colony Classes (counted in CFU/ml):**
| Class | Description |
|-------|-------------|
| `colony_single` | Individual, well-separated colonies |
| `colony_merged` | Overlapping or touching colonies |

**Artifact Classes (excluded from count):**
| Class | Description |
|-------|-------------|
| `bubble` | Air bubbles in agar |
| `dust_debris` | Dust particles or debris |
| `media_crack` | Cracks in agar media |

The Neural Object Registry table in the frontend separates visualization of both groups using distinct color schemes (green for valid colonies, red for artifacts).

Model YOLOv8 dilatih dengan arsitektur 5 kelas. Deteksi koloni valid (colony_single, colony_merged) dihitung dalam CFU/ml, sedangkan artefak (bubble, dust_debris, media_crack) diabaikan. Visualisasi menggunakan skema warna berbeda.

---

### 4. Produces consistent CFU/ml values

**Status:** Completed | **Status:** Selesai

**Code Location / Lokasi Kode:**
- `backend/app/services/cfu_calculator.py`

**How It Works / Cara Kerja:**
CFU/ml calculation follows the standard microbiology formula:

$$\text{CFU/ml} = \frac{\text{Total Detected Colonies}}{\text{Plated Volume (ml)} \times \text{Dilution Factor}}$$

The system implements:
- **SA-001 area estimation** for `colony_merged` bounding boxes
- **Measurement uncertainty** (k=2) per ISO/IEC Guide 98-3 (GUM)
- **TNTC flag** (>250 colonies: Too Numerous To Count)
- **TFTC flag** (<25 colonies: Too Few To Count)

Kalkulasi CFU/ml dihitung berdasarkan formula standar mikrobiologi dengan estimasi area SA-001 untuk koloni tergabung dan ketidakpastian pengukuran sesuai standar GUM.

---

### 5. Save results to the laboratory reporting system

**Status:** Completed | **Status:** Selesai

**Code Location / Lokasi Kode:**
- `backend/app/api/v1/endpoints/analyses.py`
- PostgreSQL database schema

**How It Works / Cara Kerja:**
Each signed-off analysis is permanently stored in a multi-tenant PostgreSQL database. The system provides:
- **PDF report export** (BPOM-compliant format)
- **CSV export** for LIMS integration
- **REST API synchronization** with external laboratory systems
- **Immutable audit log** with SHA-256 hash chain

Setiap hasil analisis yang disetujui disimpan permanen di database PostgreSQL dengan dukungan multi-tenancy. Sistem menyediakan ekspor laporan PDF standar BPOM serta sinkronisasi LIMS via REST API.

---

### 6. Simulator (Comparison of manual vs AI accuracy)

**Status:** Completed | **Status:** Selesai

**Code Location / Lokasi Kode:**
- `frontend/src/app/dashboard/simulator/page.tsx`

**How It Works / Cara Kerja:**
Users can access the Simulator at `/dashboard/simulator` to:
1. Upload a petri dish sample image
2. Run AI inference automatically
3. Enter their manual count alongside
4. View side-by-side comparison
5. See deviation percentage and accuracy alignment

The simulator provides clear evidence of AI vs manual performance for competition evaluation.

Pengguna dapat mengakses halaman Simulator untuk mengunggah gambar, menjalankan inferensi AI, memasukkan hitungan manual, dan melihat perbandingan akurasi secara berdampingan.

---

## Functional Verification Procedures

### Automated Testing (Backend Unit Tests)

```bash
cd backend
..\.venv\Scripts\activate
pytest tests/ -v
```

### Manual Testing via Web Interface

1. Open `http://localhost:3000` in browser
2. Login as analyst (`analyst@colonyai.com` / `ColonyAI2026!`)
3. Go to **New Analysis** to test detection pipeline
4. Go to **Simulator** to compare AI vs manual counting

---

## Code References

| Requirement | Key Files |
|-------------|-----------|
| Plate detection | `backend/app/services/image_processor.py` |
| Colony detection | `backend/app/services/colony_detector.py` |
| CFU/ml calculation | `backend/app/services/cfu_calculator.py` |
| Reports & saving | `backend/app/api/v1/endpoints/analyses.py` |
| Simulator UI | `frontend/src/app/dashboard/simulator/page.tsx` |

---

_Last Updated: July 2026_
