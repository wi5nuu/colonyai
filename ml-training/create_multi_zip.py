import os
import zipfile
import shutil
import yaml

# --- KONFIGURASI ---
SOURCE_DIR = r"D:\lombapuai\ml-training\datasets\colony_dataset"
DEST_DIR = r"D:\lombapuai\kaggle_multi_zip"
MAX_ZIP_SIZE = 5 * 1024 * 1024 * 1024  # 5 GB per ZIP (Agar Kaggle auto-extract lancar)

def create_multi_zip():
    print("🚀 MEMULAI PROSES PARTISI DATASET (MULTI-ZIP STRATEGY)")
    print("="*60)

    if not os.path.exists(SOURCE_DIR):
        print(f"❌ ERROR: Folder sumber {SOURCE_DIR} tidak ditemukan!")
        return

    # Bersihkan folder tujuan agar tidak tercampur data lama
    if os.path.exists(DEST_DIR):
        print(f">> Membersihkan folder tujuan: {DEST_DIR}")
        shutil.rmtree(DEST_DIR)
    os.makedirs(DEST_DIR)

    # List semua file (gambar + label) secara rekursif
    all_files = []
    for root, dirs, files in os.walk(SOURCE_DIR):
        for file in files:
            all_files.append(os.path.join(root, file))

    total_files = len(all_files)
    if total_files == 0:
        print("❌ ERROR: Tidak ada file ditemukan di folder sumber!")
        return

    total_size_gb = sum(os.path.getsize(f) for f in all_files) / (1024**3)
    print(f"📦 Total file ditemukan: {total_files}")
    print(f"📦 Ukuran total dataset: {total_size_gb:.2f} GB")

    zip_count = 1
    current_zip_size = 0
    current_zip_files = []

    for i, file_path in enumerate(all_files):
        file_size = os.path.getsize(file_path)
        current_zip_files.append(file_path)
        current_zip_size += file_size

        # Jika ukuran mencapai batas atau file terakhir
        if current_zip_size >= MAX_ZIP_SIZE or i == total_files - 1:
            zip_name = os.path.join(DEST_DIR, f"colony_part_{zip_count}.zip")
            print(f"🗜️ [{i+1}/{total_files}] Membuat {os.path.basename(zip_name)}...")
            
            # Gunakan ZIP_STORED (tanpa kompresi) agar cepat
            with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_STORED) as z:
                for f in current_zip_files:
                    arcname = os.path.relpath(f, SOURCE_DIR)
                    z.write(f, arcname)
            
            zip_count += 1
            current_zip_size = 0
            current_zip_files = []

    # --- PERBAIKI DAN COPY DATA.YAML ---
    source_yaml = os.path.join(SOURCE_DIR, "data.yaml")
    dest_yaml = os.path.join(DEST_DIR, "data.yaml")
    if os.path.exists(source_yaml):
        try:
            with open(source_yaml, 'r', encoding='utf-8') as f:
                data = yaml.safe_load(f)
            
            # Ubah path absolut menjadi '.' untuk Kaggle
            data['path'] = '.' 
            
            with open(dest_yaml, 'w', encoding='utf-8') as f:
                yaml.dump(data, f, default_flow_style=False)
            print(f"✅ data.yaml diperbarui dengan path relatif untuk Kaggle.")
        except Exception as e:
            print(f"⚠️ Gagal memperbarui data.yaml secara otomatis: {e}")
            shutil.copy(source_yaml, dest_yaml)

    # --- BUAT METADATA KAGGLE ---
    import json
    metadata = {
        "title": "ColonyAI Expert Dataset V8",
        "id": "wisnualfiannurashar/colonyai-expert-dataset-v8",
        "licenses": [{"name": "CC0-1.0"}]
    }
    with open(os.path.join(DEST_DIR, "dataset-metadata.json"), "w") as f:
        json.dump(metadata, f, indent=4)

    print("\n" + "="*60)
    print(f"🎉 SELESAI! {zip_count-1} file ZIP (Total {total_size_gb:.2f} GB) telah dibuat di {DEST_DIR}")
    print("\n🚀 LANGKAH SELANJUTNYA:")
    print(f"1. Buka terminal (CMD/PowerShell)")
    print(f"2. Jalankan perintah ini untuk upload sebagai VERSI BARU:")
    print(f"   kaggle datasets version -p {DEST_DIR} -m \"Upload full 63GB dataset in multi-zip format\"")
    print("="*60)

if __name__ == "__main__":
    create_multi_zip()
