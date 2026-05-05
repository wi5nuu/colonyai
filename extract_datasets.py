import zipfile
import os
from pathlib import Path

downloads = Path('C:/Users/Legion/Downloads')
target_base = Path('D:/lombapuai/ml-training/datasets/roboflow')

datasets = {
    'AGAR_demo.zip': 'agar_demo',
}

for zip_name, folder_name in datasets.items():
    zip_path = downloads / zip_name
    target_dir = target_base / folder_name

    if not zip_path.exists():
        print(f'SKIP (not found): {zip_name}')
        continue

    target_dir.mkdir(parents=True, exist_ok=True)

    print(f'Extracting: {zip_name}')
    print(f'       To : {target_dir}')

    with zipfile.ZipFile(zip_path, 'r') as zf:
        zf.extractall(target_dir)

    print(f'  Done!\n')

print('=== ALL DONE ===')
print(f'Datasets extracted to: {target_base}')
