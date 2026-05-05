import json
from pathlib import Path
from collections import Counter

agar_path = Path('D:/lombapuai/ml-training/datasets/roboflow/agar_demo')

print("=" * 60)
print(" SEMUA CLASS DI AGAR DEMO DATASET")
print("=" * 60)
print()

all_classes = Counter()
total_images = 0
total_labels = 0

for json_file in agar_path.rglob('*.json'):
    with open(json_file) as f:
        data = json.load(f)

    total_images += 1
    labels = data.get('labels', [])
    total_labels += len(labels)

    for label in labels:
        cls = label.get('class', 'unknown')
        all_classes[cls] += 1

print(f"Total images: {total_images}")
print(f"Total labels: {total_labels}")
print()
print("Classes found:")
for cls, count in all_classes.most_common():
    print(f"  {cls:30s}: {count}")

print()
print("=" * 60)
print(" ANALISIS UNTUK COLONYAI")
print("=" * 60)
print()

# Check if ada artifact classes
artifact_keywords = ['dust', 'debris', 'bubble', 'crack', 'artifact',
                     'contamination', 'impurity', 'foreign', 'defect']

print("Artifact classes yang ditemukan:")
found_artifact = False
for cls in all_classes.keys():
    if any(kw in cls.lower() for kw in artifact_keywords):
        print(f"  ✅ {cls}: {all_classes[cls]}")
        found_artifact = True

if not found_artifact:
    print("  ❌ Tidak ada artifact class!")
    print()
    print("Classes yang ada (colony only):")
    for cls in all_classes.keys():
        print(f"  - {cls}")
