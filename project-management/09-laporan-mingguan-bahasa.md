# Laporan Progres Mingguan — ColonyAI

**Mata Kuliah / Program**: Proyek Inovasi Teknologi AI
**Nama Tim**: ColonyAI Development Team
**Anggota Tim**:
- Wisnu Alfian Nur Ashar — Product Owner / Frontend Lead
- Muhammad Faras — Scrum Master / AI-ML Lead
- Suci — UI/UX Developer
- Steven — Backend Lead

---

# LAPORAN MINGGU KE-1

**Periode**: 2 April 2026 — 9 April 2026
**Pertemuan**: Pertemuan 1 (2 April) & Pertemuan 2 (9 April)

---

## Sprint Goal

Membangun fondasi sistem ColonyAI yang memenuhi standar ISO 17025, mencakup arsitektur backend, kurasi dataset, serta pelatihan model deteksi awal dengan tingkat akurasi yang memadai untuk standar kompetisi.

---

## Progress Completed

| No | Kode Backlog | Keterangan | Status |
|:---|:---|:---|:---:|
| 1 | BACKLOG-001 | Struktur backend FastAPI berhasil dibangun lengkap dengan routing dan middleware | Selesai |
| 2 | BACKLOG-002 | Perancangan skema database untuk entitas Pengguna, Analisis, dan Deteksi | Selesai |
| 3 | BACKLOG-003 | Kurasi dataset sebanyak 1.477 gambar dengan pelabelan 5 kelas deteksi menggunakan Roboflow | Selesai |
| 4 | BACKLOG-004 | Implementasi algoritma perhitungan CFU/ml berdasarkan standar SA-001 | Selesai |
| 5 | BACKLOG-005 | Pelatihan model YOLOv8 awal berhasil dilakukan | Selesai |

**Total Backlog Terselesaikan**: 5 dari 5 item (100%)

---

## Task Distribution

| Anggota | Tugas yang Dikerjakan |
|:---|:---|
| Wisnu (Product Owner) | Menyusun product backlog, mendefinisikan persyaratan standar ISO 17025, serta mengkoordinasikan arah pengembangan produk |
| Faras (AI/ML Lead) | Mengkurasi dan melabeli dataset di Roboflow, melatih model YOLOv8 awal, dan menganalisis hasil akurasi |
| Steven (Backend Lead) | Membangun struktur proyek FastAPI, merancang skema database, dan mengimplementasikan algoritma perhitungan CFU/ml |
| Suci (UI/UX) | Merancang wireframe awal dashboard dan menyiapkan panduan gaya visual berbasis estetika laboratorium |

---

## Challenges

### Tantangan 1 — Kesenjangan antara Regulasi dan Logika Sistem
- **Uraian**: Memetakan persyaratan jejak audit dari standar ISO 17025 Bagian 7.11 ke dalam arsitektur API berbasis JWT yang bersifat tanpa sesi merupakan tantangan teknis yang kompleks.
- **Dampak**: Terdapat risiko ketidakpatuhan terhadap standar akreditasi laboratorium nasional.

### Tantangan 2 — Akurasi Model Awal Belum Memadai
- **Uraian**: Akurasi model deteksi awal hanya mencapai 85%, masih di bawah ambang batas minimum 90% yang disyaratkan untuk standar kompetisi dan penggunaan klinis.
- **Dampak**: Model belum dapat digunakan secara andal untuk menghitung koloni bakteri pada cawan petri nyata.

### Tantangan 3 — Kemiripan Visual antara Gelembung dan Koloni Bakteri
- **Uraian**: Model AI kesulitan membedakan gelembung udara dalam media agar dengan koloni bakteri karena keduanya memiliki bentuk lingkaran yang identik secara visual.
- **Dampak**: Tingkat kesalahan deteksi positif palsu yang tinggi mengakibatkan perhitungan CFU menjadi tidak akurat.

---

## Solutions

### Solusi Tantangan 1 — Sistem Pencatatan Bayangan dengan Enkripsi
- **Pendekatan**: Merancang sistem pencatatan bayangan menggunakan algoritma hashing SHA-256 untuk setiap transaksi data, sehingga setiap perubahan data dapat dilacak secara kriptografis meskipun API bersifat tanpa sesi.
- **Bukti Teknis**: Berkas `backend/app/utils/audit.py` dan tabel `audit_logs` di database.

### Solusi Tantangan 2 & 3 — Pelatihan dengan Taksonomi 5 Kelas
- **Pendekatan**: Mengubah strategi pelatihan menjadi Taksonomi 5 Kelas yang secara eksplisit membedakan:
  1. `colony_single` — Koloni bakteri tunggal yang terisolasi
  2. `colony_merged` — Koloni bakteri yang saling bertumpuk
  3. `bubble` — Gelembung udara (kelas negatif, diabaikan)
  4. `dust_debris` — Debu dan kontaminan (kelas negatif, diabaikan)
  5. `media_crack` — Retakan pada media agar (kelas negatif, diabaikan)
- **Hasil**: Penambahan 500 lebih sampel negatif berkualitas tinggi meningkatkan akurasi model dari 85% menjadi 88% mAP.
- **Bukti Teknis**: Definisi kelas pada berkas `backend/app/services/colony_detector.py`.

---

## Plan for Week 2

**Periode Target**: 9 April — 16 April 2026 | **Pertemuan Berikutnya**: Pertemuan 3 (16 April 2026)

| Prioritas | Aktivitas | Penanggung Jawab | Target |
|:---:|:---|:---|:---|
| Tinggi | BACKLOG-006: Pengembangan antarmuka dashboard Next.js 14 | Wisnu + Suci | Tampilan dashboard fungsional |
| Tinggi | BACKLOG-007: Integrasi API inferensi AI dengan OpenCV | Faras + Steven | Alur deteksi berjalan menyeluruh |
| Sedang | BACKLOG-008: Modul simulator perbandingan hitungan manual vs AI | Faras | Fitur perbandingan aktif |
| Sedang | BACKLOG-009: Sistem laporan otomatis format PDF dan CSV sesuai BPOM/ISO | Steven | Laporan dapat digenerate |
| Rendah | BACKLOG-010: Implementasi jejak audit dengan SHA-256 | Steven | Sistem pencatatan berjalan |

**Target Minggu Ke-2**: Prototipe fungsional yang memungkinkan pengguna mengunggah gambar cawan petri dan menerima hasil deteksi koloni secara langsung melalui dashboard.

---
---

# LAPORAN MINGGU KE-2

**Periode**: 9 April 2026 — 16 April 2026
**Pertemuan**: Pertemuan 3 (16 April 2026)

---

## Sprint Goal

Mengintegrasikan mesin deteksi koloni berbasis AI dengan antarmuka dashboard web Next.js 14, sehingga menghasilkan prototipe fungsional yang dapat dioperasikan oleh analis laboratorium secara mandiri.

---

## Progress Completed

| No | Kode Backlog | Keterangan | Status |
|:---|:---|:---|:---:|
| 1 | BACKLOG-006 | Antarmuka dashboard Next.js 14 berhasil dikembangkan dengan tampilan estetika laboratorium profesional | Selesai |
| 2 | BACKLOG-007 | API inferensi AI berhasil diintegrasikan dengan pra-pemrosesan gambar menggunakan OpenCV | Selesai |
| 3 | BACKLOG-008 | Modul simulator perbandingan hitungan manual versus AI berhasil diimplementasikan | Selesai |
| 4 | BACKLOG-009 | Sistem pelaporan otomatis PDF dan CSV dengan format BPOM/ISO berhasil dibangun | Selesai |
| 5 | BACKLOG-010 | Sistem jejak audit dengan hashing SHA-256 berhasil diimplementasikan | Selesai |

**Total Backlog Terselesaikan**: 5 dari 5 item (100%)

---

## Task Distribution

| Anggota | Tugas yang Dikerjakan |
|:---|:---|
| Wisnu (Frontend Lead) | Memimpin pengembangan dashboard Next.js 14, mengimplementasikan tampilan hasil deteksi, dan memastikan kesesuaian antarmuka dengan kebutuhan laboratorium |
| Faras (AI/ML Lead) | Mengoptimalkan alur inferensi YOLOv8, mengintegrasikan pra-pemrosesan OpenCV, dan mengembangkan modul perbandingan manual versus AI |
| Steven (Backend Lead) | Membangun sistem pembuatan laporan PDF dan CSV, mengimplementasikan jejak audit SHA-256, dan menyelesaikan isu CORS antara frontend dan backend |
| Suci (UI/UX) | Merancang komponen antarmuka untuk tampilan anotasi deteksi berwarna, memastikan tampilan responsif di berbagai perangkat, dan membuat aset visual pemasaran |

---

## Challenges

### Tantangan 1 — Kelebihan Kapasitas Memori saat Pemrosesan Gambar Resolusi Tinggi
- **Uraian**: Proses backend mengalami kegagalan karena lonjakan penggunaan memori saat memproses gambar beresolusi 12 megapiksel secara langsung menggunakan OpenCV.
- **Dampak**: Sistem menjadi tidak stabil saat menerima gambar dari kamera laboratorium beresolusi tinggi dan menyebabkan server tidak merespons.

### Tantangan 2 — Analis Mengunggah Berkas Gambar yang Rusak
- **Uraian**: Analis secara tidak sengaja mengunggah berkas gambar yang rusak, berformat salah, atau berukuran terlalu kecil sehingga tidak mengandung cukup data visual untuk dianalisis.
- **Dampak**: Model AI menghasilkan pesan kesalahan yang tidak informatif bagi pengguna dan menurunkan kualitas pengalaman pengguna.

### Tantangan 3 — Waktu Respons Deteksi yang Terlalu Lambat
- **Uraian**: Waktu respons rata-rata untuk satu proses deteksi mencapai 3 hingga 4 detik, yang dianggap terlalu lambat untuk lingkungan laboratorium yang dinamis.
- **Dampak**: Produktivitas analis terganggu, terutama saat menganalisis banyak sampel secara berurutan.

---

## Solutions

### Solusi Tantangan 1 — Alur Pemrosesan Gambar Berbasis Aliran Data
- **Pendekatan**: Mengganti pemrosesan gambar langsung di memori dengan alur berbasis aliran data yang memproses gambar secara bertahap. Setiap gambar diubah ukurannya terlebih dahulu ke resolusi optimal sebelum masuk ke proses peningkatan kontras adaptif (CLAHE).
- **Hasil**: Penggunaan memori berkurang sekitar 60% dan server tidak lagi mengalami kegagalan.
- **Bukti Teknis**: Logika pengubahan ukuran dan CLAHE pada berkas `backend/app/services/image_processor.py`.

### Solusi Tantangan 2 — Validasi Berkas Berlapis Dua Tahap
- **Pendekatan**: Mengimplementasikan sistem validasi berlapis dua tahap:
  1. **Pemeriksaan Magic Byte**: Memverifikasi header berkas secara biner untuk memastikan berkas benar-benar berformat gambar yang valid.
  2. **Pemeriksaan Integritas OpenCV**: Mencoba membuka dan mendekode gambar menggunakan OpenCV; jika gagal, berkas ditolak dengan pesan kesalahan yang informatif.
- **Bukti Teknis**: Berkas `backend/app/services/file_validator.py`.

### Solusi Tantangan 3 — Optimasi Pra-Pemrosesan Gambar
- **Pendekatan**: Menerapkan teknik pengubahan ukuran adaptif sebelum inferensi — gambar dikecilkan ke dimensi optimal yang didukung YOLOv8 (640x640 piksel) tanpa menghilangkan detail penting.
- **Hasil**: Waktu inferensi rata-rata turun dari 3–4 detik menjadi 1,2 detik per gambar.

---

## Plan for Week 3

**Periode Target**: 16 April — 23 April 2026 | **Pertemuan Berikutnya**: Pertemuan 4 (23 April 2026)

| Prioritas | Aktivitas | Penanggung Jawab | Target |
|:---:|:---|:---|:---|
| Tinggi | BACKLOG-011: Audit QA menyeluruh dan penyelesaian bug kritis | Seluruh Tim | Lulus 10 dari 10 skenario audit |
| Tinggi | BACKLOG-012: Penguatan keamanan — penghapusan metadata EXIF dan validasi magic byte | Steven | Keamanan unggahan terjamin |
| Tinggi | BACKLOG-013: Integrasi pemindaian malware menggunakan ClamAV | Steven | Unggahan aman dari ancaman malware |
| Sedang | BACKLOG-014: Implementasi ketidakpastian pengukuran sesuai ISO/IEC Guide 98-3 | Faras + Steven | Kalkulasi ketidakpastian aktif |
| Sedang | BACKLOG-015: Finalisasi dokumentasi teknis dan materi presentasi kompetisi | Wisnu | Dokumen kompetisi siap |

**Target Minggu Ke-3**: Sistem ColonyAI telah melewati seluruh skenario pengujian dan siap untuk tahap penerapan di lingkungan cloud sebagai produk minimum yang layak.

---
---

# LAPORAN MINGGU KE-3

**Periode**: 16 April 2026 — 23 April 2026
**Pertemuan**: Pertemuan 4 (23 April 2026)

---

## Sprint Goal

Mencapai kesiapan produksi penuh dengan melakukan audit pengujian kualitas secara menyeluruh, memperkuat lapisan keamanan sistem, serta mengimplementasikan kalkulasi ketidakpastian pengukuran sesuai standar ISO/IEC Guide 98-3, sehingga sistem ColonyAI dapat dipertanggungjawabkan secara ilmiah dan teknis di hadapan juri kompetisi.

---

## Progress Completed

| No | Kode Backlog | Keterangan | Status |
|:---|:---|:---|:---:|
| 1 | BACKLOG-011 | Audit pengujian kualitas dilakukan terhadap 10 skenario kritis dan seluruhnya lulus | Selesai |
| 2 | BACKLOG-012 | Penguatan keamanan: penghapusan metadata EXIF dari setiap gambar yang diunggah dan validasi format berkas | Selesai |
| 3 | BACKLOG-013 | Integrasi pemindaian malware menggunakan ClamAV pada setiap berkas yang masuk ke sistem | Selesai |
| 4 | BACKLOG-014 | Implementasi kalkulator ketidakpastian pengukuran berdasarkan ISO/IEC Guide 98-3 dengan faktor cakupan k=2 | Selesai |
| 5 | BACKLOG-015 | Finalisasi dokumentasi teknis dan materi presentasi kompetisi | Selesai |

**Total Backlog Terselesaikan**: 5 dari 5 item (100%)
**Akumulasi Keseluruhan**: 15 dari 15 item Sprint 1 hingga 3 (100%)

---

## Task Distribution

| Anggota | Tugas yang Dikerjakan |
|:---|:---|
| Wisnu (Product Owner) | Memimpin sesi pengujian menyeluruh dari sisi pengguna, memperbaiki tampilan halaman hasil analisis, dan memfinalisasi materi presentasi kompetisi |
| Faras (AI/ML Lead) | Mengimplementasikan kalkulator ketidakpastian pengukuran, memvalidasi akurasi model pada 50 sampel gambar baru, dan memastikan nilai mAP stabil di atas 94% |
| Steven (Backend Lead) | Mengimplementasikan penghapusan metadata EXIF, integrasi ClamAV, serta memperbaiki ketidaksesuaian antara skema basis data dan skema validasi data |
| Suci (UI/UX) | Menyempurnakan tampilan halaman laporan PDF, menambahkan indikator visual status kesiapan sistem, dan menyiapkan aset visual untuk presentasi |

---

## Challenges

### Tantangan 1 — Kegagalan Penyimpanan Metadata ISO ke Basis Data
- **Uraian**: Perhitungan CFU berjalan dengan benar, namun kolom metadata penting seperti status CFU dan nilai ketidakpastian gagal tersimpan ke basis data secara konsisten. Data hanya muncul pada respons API namun tidak tercatat di SQLite.
- **Dampak**: Laporan yang dihasilkan menampilkan nilai kosong pada kolom ketidakpastian, yang merupakan pelanggaran langsung terhadap standar ISO 17025 Bagian 7.6.

### Tantangan 2 — Konfigurasi Jalur Basis Data Terikat pada Sistem Operasi Tertentu
- **Uraian**: Alamat basis data dikodekan secara permanen sebagai jalur absolut Windows, sehingga sistem tidak dapat dijalankan di lingkungan Linux yang digunakan oleh server cloud.
- **Dampak**: Proses penerapan ke cloud untuk tahap berikutnya terblokir sepenuhnya.

### Tantangan 3 — Celah Keamanan pada Sistem Autentikasi
- **Uraian**: Ditemukan dua celah keamanan kritis secara bersamaan. Pertama, modul waktu tidak diimpor dengan benar pada berkas autentikasi sehingga fitur pemulihan kata sandi gagal total. Kedua, berkas pengelola status autentikasi di sisi antarmuka mengandung logika yang memperbolehkan siapa pun masuk tanpa melalui proses verifikasi yang sesungguhnya.
- **Dampak**: Seluruh lapisan keamanan sistem dapat dilewati, yang merupakan risiko dengan tingkat keparahan kritis.

---

## Solutions

### Solusi Tantangan 1 — Sinkronisasi Skema dan Pembaruan Basis Data
- **Pendekatan**: Menyinkronkan definisi kolom di lapisan model basis data, menyelaraskan skema respons agar memuat kolom-kolom ISO yang sebelumnya hilang, kemudian menjalankan ulang inisialisasi basis data untuk menerapkan struktur terbaru.
- **Hasil**: Seluruh metadata ISO kini tersimpan dan terbaca dengan konsisten.
- **Bukti Teknis**: Berkas `backend/app/models/__init__.py` dan `backend/app/schemas/analyses.py`.

### Solusi Tantangan 2 — Perubahan ke Jalur Relatif
- **Pendekatan**: Mengganti seluruh referensi jalur absolut Windows dengan jalur relatif di berkas konfigurasi utama, sehingga sistem dapat berjalan di sistem operasi manapun tanpa perubahan konfigurasi.
- **Hasil**: Sistem berhasil dijalankan di lingkungan Linux lokal sebagai bukti portabilitas.
- **Bukti Teknis**: Berkas `backend/app/core/config.py`.

### Solusi Tantangan 3 — Penghapusan Celah Akses dan Perbaikan Impor
- **Pendekatan**: Menambahkan impor modul waktu yang hilang pada berkas autentikasi backend untuk memulihkan fitur pemulihan kata sandi, serta menghapus seluruh logika akses tanpa autentikasi dari sisi antarmuka dan menggantinya dengan alur autentikasi JWT yang sesungguhnya.
- **Hasil**: Sistem kini memiliki autentikasi penuh tanpa celah. Seluruh skenario pengujian keamanan dinyatakan lulus.
- **Bukti Teknis**: Berkas `backend/app/api/v1/endpoints/auth.py` dan `frontend/src/lib/auth-store.ts`.

---

## Plan for Week 4

**Periode Target**: 23 April — 30 April 2026 | **Pertemuan Berikutnya**: Pertemuan 5 (30 April 2026)

| Prioritas | Aktivitas | Penanggung Jawab | Target |
|:---:|:---|:---|:---|
| Tinggi | Penerapan sistem ke cloud: backend ke Railway dan antarmuka ke Vercel | Steven + Wisnu | Sistem berjalan pada URL publik |
| Tinggi | Konfigurasi variabel lingkungan produksi dan pengujian menyeluruh di cloud | Steven | Tidak ada gangguan saat tahap uji coba |
| Sedang | Persiapan skenario demonstrasi langsung untuk presentasi kompetisi | Seluruh Tim | Skenario demo 5 menit siap |
| Sedang | Pengujian beban pada titik akhir analisis untuk 10 pengguna bersamaan | Faras + Steven | Waktu respons di bawah 2 detik |
| Rendah | Penyempurnaan antarmuka akhir: animasi pemuatan dan pesan kesalahan yang ramah pengguna | Suci | Antarmuka siap ditampilkan kepada juri |

**Target Minggu Ke-4**: Sistem ColonyAI berjalan secara langsung di cloud dengan URL publik yang dapat diakses dan siap didemonstrasikan kepada juri kompetisi.

---
---

# LAPORAN MINGGU KE-4

**Periode**: 23 April 2026 — 30 April 2026
**Pertemuan**: Pertemuan 5 (30 April 2026 — Hari Presentasi)
**Status**: Selesai

---

## Sprint Goal

Menerapkan sistem ColonyAI ke platform cloud publik, menyempurnakan fitur akses kontrol berbasis peran (4-Role RBAC), mengimplementasikan rantai integritas audit kriptografis, serta memastikan seluruh alur kerja siap didemonstrasikan di hadapan juri kompetisi dengan standar profesional laboratorium.

---

## Progress Completed

| No | Aktivitas | Keterangan | Status |
|:---|:---|:---|:---:|
| 1 | Penerapan Cloud (Railway & Vercel) | Sistem berhasil berjalan di URL publik dengan stabilitas tinggi | Selesai |
| 2 | Implementasi 4-Role RBAC | Penyederhanaan akses menjadi 4 peran: Analyst, Manager, Auditor, dan Admin | Selesai |
| 3 | Cryptographic Audit Chain | Penambahan hash SHA-256 berantai (Current/Prev Hash) pada log audit | Selesai |
| 4 | ISO Uncertainty Budget | Detail perhitungan ketidakpastian (Sr & SR) sesuai ISO 17025 pada hasil | Selesai |
| 5 | Monitoring Vitals | Penambahan dashboard kesehatan kernel (CPU/GPU/RAM) untuk Administrator | Selesai |

**Total Backlog Terselesaikan**: 5 dari 5 item (100%)
**Akumulasi Keseluruhan**: 20 dari 20 item Sprint 1 hingga 4 (100%)

---

## Task Distribution

| Anggota | Tugas yang Dikerjakan |
|:---|:---|
| Wisnu (Frontend Lead) | Finalisasi antarmuka 4-role, integrasi tampilan rantai integritas audit, dan persiapan materi presentasi |
| Faras (AI/ML Lead) | Optimasi model YOLOv8 untuk cloud, validasi kalkulasi ketidakpastian, dan simulasi demo deteksi |
| Steven (Backend Lead) | Implementasi logika hash berantai pada audit log, pengamanan endpoint RBAC, dan monitoring vitals sistem |
| Suci (UI/UX) | Penyempurnaan dashboard analytics, desain visual untuk indikator kepatuhan ISO, dan dokumentasi aset |

---

## Challenges & Solutions

### Tantangan: Kompleksitas Regulasi vs Pengalaman Pengguna
- **Masalah**: Menampilkan data teknis seperti hash kriptografis dan anggaran ketidakpastian tanpa membingungkan pengguna non-teknis.
- **Solusi**: Menggunakan elemen UI "Information Overlay" dan visualisasi status (lampu indikator hijau/merah) untuk memberikan kesimpulan cepat sebelum detail teknis.

---

## LAPORAN MINGGU KE-5 (Sedang Berjalan)

**Periode**: 30 April 2026 — 7 Mei 2026
**Fokus**: **GRAND FINAL PRESENTATION & PILOT ONBOARDING**

| Prioritas | Aktivitas | Penanggung Jawab | Target |
|:---:|:---|:---|:---|
| Tinggi | Presentasi Final di hadapan Juri | Seluruh Tim | Skor pertahanan teknis maksimal |
| Tinggi | Orientasi Laboratorium Mitra 1 | Wisnu | Aktivasi akun laboratorium pertama |
| Sedang | Pengumpulan Feedback Pengguna | Suci | Laporan UX dari analis lapangan |

---

*Dokumen ini disiapkan oleh Tim ColonyAI sebagai laporan progres resmi kepada dosen pembimbing.*
*Terakhir diperbarui: 28 April 2026*
*Status Keseluruhan: Sesuai Target — Champion-Grade Readiness Dicapai*
