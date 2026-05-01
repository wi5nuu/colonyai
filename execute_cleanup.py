import os
import shutil
from pathlib import Path

BASE_DIR = Path(r'd:\lombapuai')

FILES_TO_DELETE = [
    BASE_DIR / 'yolo26n.pt',
    BASE_DIR / 'yolov8n.pt',
    BASE_DIR / 'livecoding.js',
    BASE_DIR / 'test_api.py',
    BASE_DIR / 'burnoutacademic.csv',
    BASE_DIR / 'wajibcase.png',
    BASE_DIR / 'backend' / 'scan_cracks.py',
    BASE_DIR / 'backend' / 'scan_imgs.py',
    BASE_DIR / 'backend' / 'test_all_classes.py',
    BASE_DIR / 'backend' / 'test_inference_v7.py',
    BASE_DIR / 'backend' / 'composite_test.jpg',
    BASE_DIR / 'ml-training' / 'gpu_log.txt',
    BASE_DIR / 'ml-training' / 'predict_log.txt',
    BASE_DIR / 'ml-training' / 'training_log.txt',
    BASE_DIR / 'ml-training' / 'test_out.txt',
    BASE_DIR / 'ml-training' / 'test_gpu.py',
    BASE_DIR / 'ml-training' / 'check_gpu_debug.py',
    BASE_DIR / 'ml-training' / 'debug_counts.py',
    BASE_DIR / 'ml-training' / 'case1.png',
    BASE_DIR / 'cleanup.py',
]

DIRS_TO_DELETE = [
    BASE_DIR / 'runs',
    BASE_DIR / 'ml-training' / 'runs',
    BASE_DIR / 'scratch',
]

def main():
    print("--- Deleting files ---")
    for f in FILES_TO_DELETE:
        if f.exists() and f.is_file():
            try:
                f.unlink()
                print(f"Deleted: {f}")
            except Exception as e:
                print(f"Failed to delete {f}: {e}")

    print("\n--- Deleting directories ---")
    for d in DIRS_TO_DELETE:
        if d.exists() and d.is_dir():
            try:
                shutil.rmtree(d)
                print(f"Deleted dir: {d}")
            except Exception as e:
                print(f"Failed to delete {d}: {e}")

    print("\n--- Deleting __pycache__ ---")
    for root, dirs, files in os.walk(BASE_DIR):
        if any(ignored in root for ignored in ['.git', 'node_modules', '.venv']):
            continue
        for d in dirs:
            if d == '__pycache__':
                pyc = Path(root) / d
                try:
                    shutil.rmtree(pyc)
                    print(f"Deleted pycache: {pyc}")
                except Exception as e:
                    pass
    print("\nCleanup Complete!")

if __name__ == '__main__':
    main()
