import json
from pathlib import Path

agar_path = Path('D:/lombapuai/ml-training/datasets/roboflow/agar_demo')

# Baca salah satu JSON
json_file = list(agar_path.rglob('*.json'))[1]  # Skip yang kosong
print(f"Membaca: {json_file}")
print()

with open(json_file) as f:
    data = json.load(f)

print("Keys:", list(data.keys()))
print()
print(json.dumps(data, indent=2)[:2000])
