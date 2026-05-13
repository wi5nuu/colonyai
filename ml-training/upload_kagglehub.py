import kagglehub
import os

HANDLE = "wisnualfiannurashar/colonyai-expert-dataset-v8"
LOCAL_DIR = r"D:\lombapuai\kaggle_multi_zip"

print("=" * 60)
print("ColonyAI Dataset Upload via kagglehub")
print("=" * 60)

if not os.path.isdir(LOCAL_DIR):
    print("ERROR: Folder tidak ditemukan:", LOCAL_DIR)
    exit(1)

files = os.listdir(LOCAL_DIR)
zip_files = [f for f in files if f.endswith(".zip")]
total_size = sum(os.path.getsize(os.path.join(LOCAL_DIR, f)) for f in files)

print("Folder :", LOCAL_DIR)
print("Files  :", len(files), "files")
print("ZIPs   :", len(zip_files), "file(s)")
print("Total  :", round(total_size / (1024**3), 2), "GB")
print("")
print("Memulai upload... (estimasi 8-9 jam)")
print("-" * 60)

kagglehub.dataset_upload(
    handle=HANDLE,
    local_dataset_dir=LOCAL_DIR,
    version_notes="Full 63GB dataset: 5-class colony detection, 97k+ instances"
)

print("")
print("=" * 60)
print("SUKSES! Dataset berhasil diupload ke Kaggle.")
print("URL: https://www.kaggle.com/datasets/" + HANDLE)
print("=" * 60)
