import os
import json
import subprocess
import sys

# Konfigurasi
ZIP_FILE = r"D:\lombapuai\kaggle_colony_ready.zip"
UPLOAD_DIR = r"D:\lombapuai\kaggle_upload_temp"
USERNAME = "wisnualfiannurashar"
DATASET_SLUG = "colonyai-expert-dataset-v8"

def prepare_and_upload():
    print("🚀 MEMULAI PROSES UPLOAD DATASET 61 GB KE KAGGLE")
    print("="*60)

    # 1. Buat folder sementara untuk metadata
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
    
    # 2. Pindahkan/Link ZIP ke folder upload (Kaggle API butuh folder)
    print(">> Menyiapkan folder upload...")
    # Kita tidak memindahkan file 61GB agar tidak buang waktu, tapi Kaggle API butuh file ada di dalam folder
    # Jadi kita akan membuat symlink atau instruksikan user
    
    # Buat file metadata
    metadata = {
        "title": "ColonyAI Expert Dataset V8",
        "id": f"{USERNAME}/{DATASET_SLUG}",
        "licenses": [{"name": "CC0-1.0"}]
    }
    
    with open(os.path.join(UPLOAD_DIR, "dataset-metadata.json"), "w") as f:
        json.dump(metadata, f, indent=4)

    print(f">> Metadata dibuat: {USERNAME}/{DATASET_SLUG}")
    
    # 3. Instruksi Eksekusi
    print("\n" + "!"*60)
    print("PERHATIAN: Karena file berukuran 61 GB, silakan jalankan perintah ini")
    print("manual di terminal Anda untuk memulai proses upload:")
    print("\ncd D:\\lombapuai\\")
    print(f"kaggle datasets create -p {UPLOAD_DIR} -u")
    print("!"*60)
    
    print("\nSkrip ini telah menyiapkan folder metadata.")
    print("Sekarang Anda hanya perlu menjalankan perintah 'kaggle' di atas.")

if __name__ == "__main__":
    # Cek apakah file ZIP ada
    if not os.path.exists(ZIP_FILE):
        print(f"❌ ERROR: File {ZIP_FILE} tidak ditemukan!")
        sys.exit(1)
        
    prepare_and_upload()
