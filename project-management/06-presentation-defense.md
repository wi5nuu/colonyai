# 🛡️ Technical Defense & Presentation Cheat Sheet
*(Panduan "Contekan" Pitching & Tanya-Jawab Dosen/Juri)*

Dokumen ini disusun sebagai ringkasan peluru (bullet points) yang bisa Anda baca dengan cepat saat ditanya oleh juri atau dosen mengenai data spesifik, fitur, dan arsitektur spesifik sistem **ColonyAI**.

---

## 🔢 1. Data Spesifik Machine Learning (Harus Dihafal)

Jika juri bertanya: *"Berapa banyak data kalian? Mengapa ada angka 1.477 dan 500?"*

**Jawaban Anda:**
- **Data Latih Murni (Raw Dataset):** `1.477 gambar cawan petri`. Data ini didapatkan secara spesifik dan dianotasi di platform Roboflow.
- **Jumlah Objek (Bounding Boxes):** Di dalam 1.477 gambar tersebut, kami telah menandai secara manual sebanyak `56.124 bounding boxes` (kotak target). Ini membuktikan bahwa dataset kami sangat kaya.
- **Total Data Setelah Augmentasi:** `> 5.000 gambar`. Untuk mencegah AI sekadar "menghafal" gambar awal, kami memutar, mewarnai ulang (HSV jitter), dan memotong gambar aslinya *(Mosaic/Flip)* sehingga secara virtual AI belajar dari 5.000 skenario cahaya yang berbeda.
- **Angka 500 Samples:** Angka `500` adalah **Data Uji Validasi (A/B Testing Batch)**. Kami menggunakan 500 gambar yang *sama sekali asing* (belum pernah dilihat AI) untuk mengetes akurasi akhirnya. Sistem operasional kami juga dikunci pada limit `500 unggahan per bulan` untuk SaaS tipe pemula.

## 🧫 2. Strategi 5-Class (Mengapa Lebih Baik dari AI Lain?)

Jika juri bertanya: *"Bagaimana AI kalian membedakan bakteri asli dan kotoran debu?"*

**Jawaban Anda:**
Sistem kami tidak menebak buta, melainkan dilatih ketat pada **5 Taksonomi Kelas** spesifik:
1. `colony_single` (Bakteri tunggal, dihitung sebagai 1 CFU)
2. `colony_merged` (Bakteri bertumpuk, dihitung menggunakan bobot algoritma pemisahan SA-001)
3. `bubble` (Gelembung udara agar, **DIABAIKAN**)
4. `dust_debris` (Partikel debu debu, **DIABAIKAN**)
5. `media_crack` (Retakan media, **DIABAIKAN**)

*Semua 5 list ini sudah tertanam permanen di source code kami, utamanya di `ml-training/train.py` dan divisualisasikan oleh Frontend Next.js kami dengan 5 warna bounding box yang berbeda sehingga analis tahu persis objek apa yang sedang dilihat AI.*

## ⚙️ 3. Tiga Fitur Utama Penyelesaian "Case" Ini

Jika juri bertanya: *"Apa nilai jual (selling point) yang menyelesaikan problem industri mikrobiologi saat ini?"*

**Jawaban Anda:**
Kami merancang fitur yang *bukan cuma canggih*, tetapi **ISO 17025-Compliant** (Sesuai Syarat Akreditasi Laboratorium BPOM/SNI):
- **Fitur Auto-CFU/ml (SA-001 Standard):** Kami tidak menyuruh analis menghitung sendiri hasil AI. Sistem kami secara asinkron mengambil jumlah `colony_single` dan `colony_merged`, lalu mengalikannya dengan *Dilution Factor* (Faktor Pengencer) untuk langsung mendikte angka *CFU/ml* ke layar. Cepat tanpa kalkulator.
- **Fitur Digital Audit Trail ber-Hash:** Setiap kali analis mengklik tombol "Approve", API otomatis menyegel laporannya ke *PostgreSQL* tanpa bisa diedit lagi, menyimpan *User ID*, jam klik, dan hasil AI. Ini mutlak diperlukan jika pabrik di-audit oleh BPOM.
- **Fitur Built-in Manual Simulator:** Untuk membangun kepercayaan awal terhadap AI, kami membuat halaman "Simulator" khusus di *Dashboard*. Analis senior bisa membandingkan hitungan manualnya dengan si YOLOv8 secara *side-by-side* untuk meratifikasi bahwa AI kami 94%+ akurat.

## 🚀 4. Kalimat Penutup Presentasi (Hook)
>"ColonyAI bukan sekadar demo deteksi computer vision. Kami adalah **Operating System (OS) komprehensif** untuk laboratorium mikrobiologi. AI kami menggantikan 20-30 menit waktu hitung manual menjadi di bawah 2 menit, membasmi variabel galat manusia hingga 80%, dan langsung menyelaraskannya dengan standar laporan PDF BPOM. Cepat, Terlacak, Regulatf."
