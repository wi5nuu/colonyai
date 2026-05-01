import os
import shutil
from pathlib import Path

# Base directory (project root)
BASE_DIR = Path(__file__).parent.resolve()

# 1. Specific files to delete
FILES_TO_DELETE = [
    # Duplicates in root
    BASE_DIR / 'yolo26n.pt',
    BASE_DIR / 'yolov8n.pt',
    # Temporary script
    BASE_DIR / 'livecoding.js',
    BASE_DIR / 'test_api.py',
    # ML Training logs and test outputs
    BASE_DIR / 'ml-training' / 'gpu_log.txt',
    BASE_DIR / 'ml-training' / 'predict_log.txt',
    BASE_DIR / 'ml-training' / 'training_log.txt',
    BASE_DIR / 'ml-training' / 'test_out.txt',
    # Extra test/debug scripts in ml-training
    BASE_DIR / 'ml-training' / 'test_gpu.py',
    BASE_DIR / 'ml-training' / 'check_gpu_debug.py',
    BASE_DIR / 'ml-training' / 'debug_counts.py',
]

# 2. Specific directories to delete (Runs / logs)
DIRS_TO_DELETE = [
    BASE_DIR / 'runs',
    BASE_DIR / 'ml-training' / 'runs',
]

def delete_files():
    print("--- Menghapus File Tidak Penting ---")
    for file_path in FILES_TO_DELETE:
        try:
            if file_path.exists() and file_path.is_file():
                file_path.unlink()
                print(f"[BERHASIL] Dihapus: {file_path.relative_to(BASE_DIR)}")
            else:
                pass # Tidak ada file, skip
        except Exception as e:
            print(f"[GAGAL] Gagal menghapus {file_path.relative_to(BASE_DIR)}: {e}")

def delete_specific_directories():
    print("\n--- Menghapus Folder Output/Runs ---")
    for dir_path in DIRS_TO_DELETE:
        try:
            if dir_path.exists() and dir_path.is_dir():
                shutil.rmtree(dir_path)
                print(f"[BERHASIL] Dihapus folder: {dir_path.relative_to(BASE_DIR)}")
        except Exception as e:
            print(f"[GAGAL] Gagal menghapus {dir_path.relative_to(BASE_DIR)}: {e}")

def remove_pycache():
    print("\n--- Menghapus folder __pycache__ secara global ---")
    count = 0
    # Walk through the directory tree
    for root, dirs, files in os.walk(BASE_DIR):
        # Skip certain directories to speed up traversal
        if any(ignored in root for ignored in ['.git', 'node_modules', '.venv', 'datasets']):
            continue
            
        for d in dirs:
            if d == '__pycache__':
                pycache_path = Path(root) / d
                try:
                    shutil.rmtree(pycache_path)
                    print(f"[BERHASIL] Dihapus cache: {pycache_path.relative_to(BASE_DIR)}")
                    count += 1
                except Exception as e:
                    print(f"[GAGAL] Gagal menghapus cache {pycache_path.relative_to(BASE_DIR)}: {e}")
                    
    if count == 0:
        print("Tidak ada folder __pycache__ yang ditemukan.")

if __name__ == "__main__":
    print("Memulai proses pembersihan proyek...\n")
    delete_files()
    delete_specific_directories()
    remove_pycache()
    print("\nPembersihan selesai!")
