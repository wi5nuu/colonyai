"""
===========================================================
TRAINING PIPELINE - SIMPLE CNN IMAGE CLASSIFICATION
===========================================================
File ini menggabungkan seluruh alur:
1. Setup & Import
2. Konfigurasi Hyperparameter
3. Definisi Model (SimpleCNN)
4. Benchmark Hardware (CPU vs GPU)
5. Training & Testing Loop
6. Evaluasi Akhir (Classification Report)
7. Visualisasi Hasil (Loss & Accuracy)

Jalankan dulu di terminal/cell terpisah (khusus Jupyter/Colab):
    !pip install torch torchvision matplotlib scikit-learn
    !nvidia-smi
===========================================================
"""

import time                                    # untuk mengukur durasi (dipakai di benchmark)
import matplotlib.pyplot as plt                # untuk membuat grafik/plot
import numpy as np                             # operasi array (walau di sini jarang dipakai langsung)
import torch                                   # library utama PyTorch
import torch.nn as nn                          # modul untuk membangun layer neural network
import torch.optim as optim                    # modul optimizer (Adam, SGD, dll)
from torch.utils.data import DataLoader, TensorDataset  # untuk membungkus data jadi batch
from sklearn.metrics import accuracy_score, classification_report  # metrik evaluasi


# ===========================================================
# 1. KONFIGURASI HYPERPARAMETER
# ===========================================================
NUM_CLASSES = 4          # jumlah kelas output klasifikasi (misal 4 kategori)
BATCH_SIZE = 64           # jumlah sampel yang diproses sekaligus per batch
EPOCHS = 500              # jumlah iterasi penuh terhadap seluruh dataset training

# CATATAN: 1e-6 sangat kecil untuk kebanyakan kasus.
# Jika model terasa lambat belajar / akurasi tidak naik,
# coba naikkan ke 1e-3 atau 1e-4.
LEARNING_RATE = 1e-6      # seberapa besar langkah update bobot tiap iterasi optimizer


# ===========================================================
# 2. SETUP DEVICE
# ===========================================================
# Pilih GPU (cuda) kalau tersedia, kalau tidak pakai CPU
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}\n")  # info device yang dipakai


# ===========================================================
# 3. DEFINISI MODEL - SimpleCNN
# ===========================================================
class SimpleCNN(nn.Module):                       # semua model PyTorch harus turunan dari nn.Module
    def __init__(self, num_classes):               # constructor, dipanggil saat model dibuat
        super(SimpleCNN, self).__init__()           # wajib panggil constructor parent class

        # ---- Feature extractor (bagian convolutional) ----
        self.features = nn.Sequential(              # wadah layer yang dijalankan berurutan
            nn.Conv2d(3, 16, kernel_size=3, padding=1),  # input 3 channel (RGB) -> output 16 channel, kernel 3x3, padding 1 (ukuran spasial tetap)
            nn.ReLU(),                                    # fungsi aktivasi non-linear (buang nilai negatif jadi 0)
            nn.MaxPool2d(2, 2),                           # downsampling: ukuran gambar dibagi 2 (misal 32x32 -> 16x16)
            nn.Conv2d(16, 32, kernel_size=3, padding=1),  # input 16 channel -> output 32 channel
            nn.ReLU(),                                    # aktivasi lagi
            nn.MaxPool2d(2, 2)                            # downsampling lagi (16x16 -> 8x8)
        )

        # ---- Classifier (bagian fully connected) ----
        # CATATAN: 32 * 8 * 8 hanya valid untuk input gambar 32x32.
        # Kalau ukuran input beda, angka ini harus disesuaikan,
        # atau pakai nn.AdaptiveAvgPool2d agar lebih fleksibel.
        self.classifier = nn.Sequential(
            nn.Linear(32 * 8 * 8, 128),   # flatten fitur (2048 nilai) -> proyeksikan ke 128 neuron
            nn.ReLU(),                     # aktivasi
            nn.Linear(128, num_classes)    # output akhir sejumlah kelas (logits, belum softmax)
        )

    def forward(self, x):                  # fungsi ini dipanggil otomatis saat model(x) dijalankan
        x = self.features(x)                # lewatkan input ke conv layers -> shape jadi (batch, 32, 8, 8)
        x = x.view(x.size(0), -1)           # flatten: (batch, 32, 8, 8) -> (batch, 2048), x.size(0) = batch size dipertahankan
        x = self.classifier(x)              # lewatkan ke fully connected layers -> hasil prediksi
        return x                            # kembalikan logits (belum probabilitas)


# ===========================================================
# 4. FUNGSI BENCHMARK HARDWARE (CPU vs GPU)
# ===========================================================
def benchmark_hardware(model, loader):
    devices_to_test = ['cpu']                    # selalu test CPU
    if torch.cuda.is_available():                # kalau GPU tersedia
        devices_to_test.append('cuda')            # tambahkan 'cuda' ke daftar yang akan diuji

    for dev_name in devices_to_test:              # loop untuk tiap device (cpu, lalu cuda jika ada)
        dev = torch.device(dev_name)               # buat objek device dari nama string
        bench_model = model.to(dev)                 # pindahkan model ke device tsb
        bench_model.eval()                          # mode evaluasi (matikan dropout/batchnorm training behavior)

        # ---- Warm-up (penting khususnya untuk CUDA) ----
        dummy_input = torch.randn(BATCH_SIZE, 3, 32, 32).to(dev)  # data random palsu, shape sesuai input model
        for _ in range(5):                          # jalankan 5x forward pass "buang-buang"
            _ = bench_model(dummy_input)              # supaya GPU sudah "panas" (hindari overhead inisialisasi kernel CUDA)
        if dev_name == 'cuda':
            torch.cuda.synchronize()                  # pastikan semua operasi GPU async benar-benar selesai

        start_time = time.time()                    # catat waktu mulai
        total_images = 0                             # counter jumlah gambar yang sudah diproses

        with torch.no_grad():                        # nonaktifkan tracking gradient (hemat memori, hanya inference)
            for images, _ in loader:                  # ambil batch gambar, label diabaikan (pakai _)
                images = images.to(dev)                 # pindahkan gambar ke device yang sedang diuji
                _ = bench_model(images)                 # jalankan forward pass, hasil tidak dipakai (cuma diukur kecepatannya)
                total_images += images.size(0)          # tambahkan jumlah gambar dalam batch ini ke counter

                # Batasi benchmark ke ~1000 gambar pertama agar cepat
                if total_images > 1000:
                    break                                # keluar dari loop kalau sudah lewat 1000 gambar

            if dev_name == 'cuda':
                torch.cuda.synchronize()                # sync lagi sebelum stop timer (biar akurat)

        elapsed_time = time.time() - start_time      # hitung total waktu yang berlalu
        throughput = total_images / elapsed_time      # hitung kecepatan: gambar per detik
        print(f"[{dev_name.upper()}] Processed {total_images} images in "
              f"{elapsed_time:.4f}s | Throughput: {throughput:.2f} images/sec")  # cetak hasil
    print("-" * 60)                                   # garis pemisah output


# ===========================================================
# 5. PERSIAPAN DATA
# ===========================================================
# GANTI BAGIAN INI dengan dataset asli Anda (mis. ImageFolder, CIFAR, dsb).
# Contoh di bawah hanya PLACEHOLDER agar script bisa dijalankan end-to-end.
#
# train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
# test_loader  = DataLoader(test_dataset,  batch_size=BATCH_SIZE, shuffle=False)

# --- Placeholder dummy dataset (hapus/ganti jika sudah punya data asli) ---
dummy_train_x = torch.randn(500, 3, 32, 32)         # 500 gambar dummy, 3 channel, 32x32 piksel
dummy_train_y = torch.randint(0, NUM_CLASSES, (500,))  # 500 label dummy, angka acak 0 s/d NUM_CLASSES-1
dummy_test_x = torch.randn(100, 3, 32, 32)           # 100 gambar dummy untuk testing
dummy_test_y = torch.randint(0, NUM_CLASSES, (100,))    # 100 label dummy untuk testing

train_loader = DataLoader(TensorDataset(dummy_train_x, dummy_train_y),  # gabungkan x & y jadi satu dataset
                           batch_size=BATCH_SIZE,     # jumlah sampel per batch
                           shuffle=True)              # acak urutan data tiap epoch (penting untuk training)
test_loader = DataLoader(TensorDataset(dummy_test_x, dummy_test_y),
                          batch_size=BATCH_SIZE,
                          shuffle=False)              # tidak perlu diacak untuk testing/evaluasi
# ---------------------------------------------------------------------


# ===========================================================
# 6. JALANKAN BENCHMARK HARDWARE (sebelum training penuh)
# ===========================================================
model = SimpleCNN(NUM_CLASSES)                        # buat instance model (masih di CPU, belum .to(device))
print("Running Hardware Benchmark (Subset of Data):")
benchmark_hardware(model, train_loader)                # ukur kecepatan CPU vs GPU pakai model ini


# ===========================================================
# 7. SETUP MODEL, LOSS, OPTIMIZER UNTUK TRAINING SEBENARNYA
# ===========================================================
model = SimpleCNN(NUM_CLASSES).to(device)             # buat instance BARU (fresh, bobot random lagi) + pindah ke device
criterion = nn.CrossEntropyLoss()                      # fungsi loss untuk klasifikasi multi-kelas
optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)  # optimizer Adam, mengatur update bobot model

history = {                                            # dictionary untuk menyimpan riwayat metrik tiap epoch
    'train_loss': [],
    'test_loss': [],
    'train_acc': [],
    'test_acc': []
}


# ===========================================================
# 8. TRAINING & TESTING LOOP
# ===========================================================
for epoch in range(EPOCHS):                            # ulangi proses training sebanyak EPOCHS kali

    # ---------------- Training Phase ----------------
    model.train()                                        # mode training (aktifkan dropout/batchnorm training behavior)
    running_loss, correct, total = 0.0, 0, 0             # reset counter di awal tiap epoch
    for images, labels in train_loader:                  # loop tiap batch data training
        images, labels = images.to(device), labels.to(device)  # pindahkan data ke device (GPU/CPU)

        # forward
        optimizer.zero_grad()                              # reset gradient dari batch sebelumnya (wajib, PyTorch akumulasi gradient by default)
        outputs = model(images)                             # forward pass -> hasil prediksi (logits)
        loss = criterion(outputs, labels)                   # hitung loss (perbedaan prediksi vs label asli)
        loss.backward()                                     # backpropagation -> hitung gradient tiap parameter
        optimizer.step()                                    # update bobot model berdasarkan gradient

        running_loss += loss.item() * images.size(0)        # akumulasi loss (dikali jumlah sampel batch untuk rata-rata weighted nanti)
        _, predicted = outputs.max(1)                        # ambil index kelas dengan skor tertinggi sebagai prediksi
        total += labels.size(0)                              # tambahkan jumlah sampel di batch ini ke total
        correct += predicted.eq(labels).sum().item()         # hitung berapa prediksi yang cocok dengan label asli

    train_loss = running_loss / len(train_loader.dataset)  # rata-rata loss selama 1 epoch training
    train_acc = correct / total                             # akurasi training selama 1 epoch

    # ---------------- Testing Phase ----------------
    model.eval()                                          # mode evaluasi (matikan dropout, batchnorm pakai statistik running)
    running_test_loss, test_correct, test_total = 0.0, 0, 0  # reset counter untuk testing
    with torch.no_grad():                                 # nonaktifkan gradient (tidak perlu backward saat testing)
        for images, labels in test_loader:                  # loop tiap batch data testing
            images, labels = images.to(device), labels.to(device)  # pindahkan ke device
            outputs = model(images)                           # forward pass saja (tanpa update bobot)
            loss = criterion(outputs, labels)                 # hitung loss testing

            running_test_loss += loss.item() * images.size(0)  # akumulasi loss testing
            _, predicted = outputs.max(1)                       # ambil prediksi kelas
            test_total += labels.size(0)                        # tambahkan jumlah sampel batch ini
            test_correct += predicted.eq(labels).sum().item()   # hitung prediksi yang benar

    test_loss = running_test_loss / len(test_loader.dataset)  # rata-rata loss testing
    test_acc = test_correct / test_total                       # akurasi testing

    # ---------------- Save Metrics ----------------
    history['train_loss'].append(train_loss)     # simpan loss training epoch ini ke history
    history['test_loss'].append(test_loss)        # simpan loss testing epoch ini
    history['train_acc'].append(train_acc)        # simpan akurasi training epoch ini
    history['test_acc'].append(test_acc)          # simpan akurasi testing epoch ini

    if epoch % 25 == 0:                            # hanya cetak log tiap 25 epoch (supaya output tidak kepanjangan)
        print(f"Epoch {epoch+1}/{EPOCHS} | Train Loss: {train_loss:.4f} | "
              f"Train Acc: {train_acc*100:.1f}% | "
              f"Test Loss: {test_loss:.4f} | Test Acc: {test_acc*100:.1f}%")

print("-" * 60)                                    # garis pemisah setelah training selesai


# ===========================================================
# 9. EVALUASI AKHIR - CLASSIFICATION REPORT
# ===========================================================
model.eval()                                        # pastikan mode evaluasi
all_preds = []                                       # list untuk menampung SEMUA prediksi dari seluruh test set
all_labels = []                                      # list untuk menampung SEMUA label asli dari seluruh test set
with torch.no_grad():                                # tidak perlu gradient, cuma inference
    for images, labels in test_loader:                 # loop tiap batch test data
        images = images.to(device)                       # pindahkan gambar ke device (label sengaja tidak dipindah, tetap di CPU)
        outputs = model(images)                           # forward pass -> prediksi
        _, predicted = outputs.max(1)                     # ambil kelas dengan skor tertinggi
        all_preds.extend(predicted.cpu().numpy())         # pindah ke CPU lalu ke numpy, gabungkan ke list (extend, bukan append, karena isinya banyak nilai)
        all_labels.extend(labels.numpy())                 # ubah label ke numpy, gabungkan ke list

print("Final Classification Report:")
print(classification_report(                          # cetak laporan lengkap: precision, recall, f1-score per kelas
    all_labels, all_preds,
    target_names=[f"Class {i}" for i in range(NUM_CLASSES)]  # beri nama tampilan tiap kelas: "Class 0", "Class 1", dst
))


# ===========================================================
# 10. VISUALISASI - LOSS & ACCURACY OVER EPOCHS
# ===========================================================
plt.figure(figsize=(12, 4))                          # buat kanvas gambar baru, lebar 12 inci tinggi 4 inci

# ---- Loss Plot ----
plt.subplot(1, 2, 1)                                  # bagi kanvas jadi grid 1 baris 2 kolom, gambar di posisi 1 (kiri)
plt.plot(history['train_loss'], label='Train Loss')   # garis loss training per epoch
plt.plot(history['test_loss'], label='Test Loss')     # garis loss testing per epoch
plt.title('Loss Over Epochs')                          # judul subplot
plt.xlabel('Epoch')                                     # label sumbu x
plt.ylabel('Loss')                                      # label sumbu y
plt.legend()                                            # tampilkan keterangan warna garis

# ---- Accuracy Plot ----
plt.subplot(1, 2, 2)                                  # posisi 2 (kanan) dari grid yang sama
plt.plot(history['train_acc'], label='Train Accuracy')  # garis akurasi training per epoch
plt.plot(history['test_acc'], label='Test Accuracy')    # garis akurasi testing per epoch
plt.title('Accuracy Over Epochs')                        # judul subplot
plt.xlabel('Epoch')                                       # label sumbu x
plt.ylabel('Accuracy')                                    # label sumbu y
plt.legend()                                              # tampilkan keterangan warna garis

plt.tight_layout()                                    # rapikan jarak antar subplot biar tidak tumpang tindih
plt.savefig('training_curve.png')                     # simpan grafik ke file gambar
plt.show()                                             # tampilkan grafik ke layar
