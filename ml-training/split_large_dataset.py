import os
import json
import sys

# Konfigurasi
SOURCE_ZIP = r"D:\lombapuai\kaggle_upload_temp\kaggle_colony_ready.zip"
DEST_DIR = r"D:\lombapuai\kaggle_final_parts"
CHUNK_SIZE = 10 * 1024 * 1024 * 1024  # 10 GB per bagian
USERNAME = "wisnualfiannurashar"
DATASET_SLUG = "colonyai-expert-dataset-v8"

def split_file():
    if not os.path.exists(SOURCE_ZIP):
        print(f"❌ ERROR: File sumber {SOURCE_ZIP} tidak ditemukan!")
        return

    if not os.path.exists(DEST_DIR):
        os.makedirs(DEST_DIR)
        print(f">> Folder tujuan dibuat: {DEST_DIR}")

    file_size = os.path.getsize(SOURCE_ZIP)
    print(f"📦 Ukuran File Total: {file_size / (1024**3):.2f} GB")
    print(f"🔪 Memulai proses pemecahan menjadi bagian @10GB...")

    # Buat Metadata Kaggle
    metadata = {
        "title": "ColonyAI Expert Dataset V8",
        "id": f"{USERNAME}/{DATASET_SLUG}",
        "licenses": [{"name": "CC0-1.0"}]
    }
    with open(os.path.join(DEST_DIR, "dataset-metadata.json"), "w") as f:
        json.dump(metadata, f, indent=4)

    part_num = 1
    total_read = 0
    with open(SOURCE_ZIP, 'rb') as f:
        while total_read < file_size:
            part_name = f"colony_data_part_{part_num}.bin"
            part_path = os.path.join(DEST_DIR, part_name)
            
            print(f">> Menulis {part_name}...")
            bytes_written = 0
            with open(part_path, 'wb') as chunk_file:
                while bytes_written < CHUNK_SIZE:
                    # Read in 64MB sub-chunks to be memory efficient
                    sub_chunk_size = min(64 * 1024 * 1024, CHUNK_SIZE - bytes_written)
                    buffer = f.read(sub_chunk_size)
                    if not buffer:
                        break
                    chunk_file.write(buffer)
                    bytes_written += len(buffer)
            
            total_read += bytes_written
            print(f"✅ {part_name} selesai ({bytes_written / (1024**3):.2f} GB).")
            if bytes_written < CHUNK_SIZE: # End of source file
                break
            part_num += 1

    print("\n" + "="*60)
    print("🎉 PROSES PEMECAHAN SELESAI!")
    print(f"Total bagian: {part_num - 1}")
    print("="*60)
    print("\nLangkah selanjutnya, jalankan perintah ini di terminal:")
    print(f"cd D:\\lombapuai\\")
    print(f"kaggle datasets create -p {DEST_DIR} -u")
    print("\nCatatan: Nanti di Kaggle Notebook, Anda bisa menggabungkan kembali")
    print("file-file ini dengan perintah: !cat colony_data_part_* > full_dataset.zip")

if __name__ == "__main__":
    split_file()
