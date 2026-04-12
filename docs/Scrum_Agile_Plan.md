# ColonyAI - Scrum & Agile Framework

Dokumen ini disusun untuk memenuhi *requirement* penugasan (Product Backlogs, Roles, Sprints) sekaligus memetakan tahapan pengembangan aplikasi ColonyAI.

---

## 1. Scrum Team Roles

Berdasarkan struktur tim yang ada di proyek ColonyAI, berikut adalah pembagian peran secara definitif:

*   **Product Owner:** Wisnu Alfian Nur Ashar
    *   *Tanggung Jawab:* Mendefinisikan visi produk, mengelola struktur *Product Backlog*, dan memastikan bahwa fitur yang di-_deliver_ (termasuk kepatuhan ISO 17025 dan UU PDP) memberikan nilai bisnis maksimal bagi industri laboratorium klinik.
*   **Scrum Master:** Muhammad Faras
    *   *Tanggung Jawab:* Memfasilitasi komunikasi tim, menghilangkan hambatan (*blockers/bugs*), memastikan tim mematuhi praktik Scrum (Daily Sprint, Weekly Sprint), dan menangani integrasi AI/CV YOLOv8 ke dalam _pipeline_ teknis.
*   **Developer:** Suci
    *   *Tanggung Jawab:* Mendesain antarmuka interaktif, mengimplementasikan metrik _Dashboard Next.js_, memastikan responsivitas layar, dan menghubungkan API ke _state management_ frontend.
*   **Developer:** Steven
    *   *Tanggung Jawab:* Menyiapkan skenario _End-to-End Testing_, mengkalkulasi ketepatan akurasi (_Pass Rate_), me-review hasil hitungan CFU, dan menjaga kebersihan data.

---

## 2. Product Backlogs (Detailed Stories) & 3. Prioritization

Berikut adalah daftar **8 Product Backlogs utama** yang diangkat dari inti permasalahan ColonyAI.

### [PB-01] AI-Powered 5-Class Detection System
*   **Type:** Feature / AI
*   **Priority:** 🔥 **HIGH** (Core Value)
*   **User Story:** As a Lab Analyst, I want the system to automatically distinguish between valid colonies (`colony_single`, `colony_merged`) and artifacts (`bubble`, `dust_debris`, `media_crack`), so that I don't accidentally count dust as bacteria.
*   **Goal:** mencapai akurasi deteksi ≥ 90% pada 8 jenis media *agar* menggunakan model YOLOv8.

### [PB-02] Automated CFU/ml Standardized Calculator
*   **Type:** Feature / Backend
*   **Priority:** 🔥 **HIGH** (Core Value)
*   **User Story:** As a Lab Analyst, I want the system to automatically apply FDA BAM rules (calculating CFU based on volume and dilution), so that I don't have to calculate them manually.
*   **Goal:** Sistem otomatis melakukan kalkulasi akurat dan memberikan status *Normal*, *TNTC* (>250), atau *TFTC* (<25).

### [PB-03] Role-Based Access Control (RBAC) & Authentication
*   **Type:** Feature / Security
*   **Priority:** 🔥 **HIGH** (Security)
*   **User Story:** As a Product Owner, I want distinct access roles (Admin/Owner vs Analyst), so that only authorized personnel can approve analyses or access the maintenance dashboard.
*   **Goal:** Endpoint backend terlindungi sistem token JWT dengan *authorization* spesifik per peran.

### [PB-04] Immutable Audit Logs for ISO 17025 Compliance
*   **Type:** Feature / Bug-Fix (BUG-005)
*   **Priority:** ⚡ **MEDIUM** (Compliance)
*   **User Story:** As an Auditor, I need a mathematically secure tracking system (Hash Chaining), so that any manipulation of sample data in the database can be detected.
*   **Goal:** Mengimplementasikan SHA-256 _Hash chaining_ (`previous_hash` & `current_hash`) pada tabel Logging di PostgreSQL.

### [PB-05] Optimistic Locking on Sample Approvals
*   **Type:** Bug-Fix (BUG-023)
*   **Priority:** ⚡ **MEDIUM** (System Stability)
*   **User Story:** As an Admin, I want the system to block simultaneous approvals on the same sample, so that our data remains consistent even if two admins click "Approve" at the same time.
*   **Goal:** Menerapkan SQLAlchemy `version_id` (StaleDataError) untuk menangani *race condition* di REST API.

### [PB-06] Domain Shift Mitigation (Data Augmentation)
*   **Type:** Feature (BUG-013)
*   **Priority:** ⚡ **MEDIUM** (AI Robustness)
*   **User Story:** As an Analyst, I want the AI model to perform well regardless of my lab's lighting conditions, so that I don't have to perfectly adjust the camera brightness every time.
*   **Goal:** Pembuatan injeksi CLAHE dan _Color Temperature Simulation_ di _pipeline preprocessing_.

### [PB-07] Data Retention Policy for UU PDP Compliance
*   **Type:** Feature (BUG-017)
*   **Priority:** ❄️ **LOW** (Legal / Maintenance)
*   **User Story:** As an Admin, I want the database to automatically purge outdated or raw images older than 5 years (1825 days), so that we comply with Indonesian Data Privacy Laws (UU PDP).
*   **Goal:** Membuat endpoint *maintenance/retention* yang secara batch menghapus data basi dari storage dan database.

### [PB-08] Interactive Real-Time Analytics Dashboard
*   **Type:** Feature / UI
*   **Priority:** ❄️ **LOW** (Experience)
*   **User Story:** As an Admin, I want a visual dashboard showing passing rates, average CFU, and TNTC trends per month, so that I can monitor the lab's overall testing efficiency.
*   **Goal:** Pembuatan visualisasi grafik batang dan garis (Recharts) di frontend Next.js yang menghiraukan (filter) status data yang bersifat *Null*.

---

## 4. Apply Daily Sprint (Repository Protocol)

Karena kode berada di GitHub repository (`https://github.com/wi5nuu/colonyai`), pelaksanaan *Daily Sprint* diwujudkan dalam bentuk praktik rekayasa perangkat lunak berikut:
1.  **Daily Standup via Asynchronous Communication:** Anggota tim melaporkan: apa jatah *commit* hari ini, *blockers* yang sedang dihadapi, dan apa yang diselesaikan kemarin.
2.  **Commitment & Branching:** Setiap pengerjaan PB (Product Backlog) dari *Sprint Backlog* wajib dikerjakan pada fitur branch yang berbeda (misal: `feature/audit-log` atau `bug/optimistic-lock`).
3.  **Daily Commit:** Minimal ada *push* berkala ke *remote repository* untuk menghindari konflik (Merge Conflicts) yang membesar.
4.  **Code Review:** Setiap akhir hari, Developer meminta persetujuan Scrum Master atau PO (melalui Pull Request / pengecekan manual) sebelum disatukan ke cabang `main`.

## 5. Weekly Sprint (Our Session Routine)

Sesi mingguan menjadi tolok ukur kecepatan pengembangan (Velocity) dan evaluasi:
1.  **Sprint Planning (Awal Minggu):** 
    *   Kapasitas tim dievaluasi.
    *   PO dan Tim memilih Backlog dari prioritas teratas (misalnya PB-01 dan PB-02) untuk dimasukkan ke *Sprint Backlog* minggu tersebut.
2.  **Sprint Review (Akhir Minggu):** 
    *   Tim mendemonstrasikan versi aplikasi yang bisa berfungsi (*Increment*). Contoh: Mendemonstrasikan bahwa sistem YOLO sudah bisa membedakan bakteri *"Merged"* dan kotak *box* UI berwarna sinkron di browser.
3.  **Sprint Retrospective (Setelah Review):**
    *   Tim berdiskusi: Apa yang berjalan lancar (contoh: setup docker lancar), kendala apa yang terhambat (contoh: TypeError TypeScript), dan solusi yang disepakati untuk minggu depan (contoh: penerapan strict type check di proses ETL).
