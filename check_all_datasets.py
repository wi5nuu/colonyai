import yaml
from pathlib import Path
from collections import Counter

base = Path('D:/lombapuai/ml-training/datasets/roboflow')

datasets = ['crack_raimundo', 'crack_tuandung']

print("=" * 70)
print(" CEK SEMUA DATASET")
print("=" * 70)

for ds_name in datasets:
    ds_path = base / ds_name
    print(f"\n{'='*50}")
    print(f"DATASET: {ds_name}")
    print(f"{'='*50}")

    if not ds_path.exists():
        print(f"  ❌ Folder tidak ditemukan")
        continue

    # Cari data.yaml
    yaml_files = list(ds_path.rglob('data.yaml'))
    if not yaml_files:
        print(f"  ❌ data.yaml tidak ditemukan")
        continue

    yaml_path = yaml_files[0]
    with open(yaml_path) as f:
        data = yaml.safe_load(f)

    classes = data.get('names', [])
    nc = data.get('nc', len(classes))

    print(f"  Classes ({nc}): {classes}")

    # Count images
    total_imgs = 0
    total_lbls = 0
    for split in ['train', 'valid', 'val', 'test']:
        img_dir = yaml_path.parent / split / 'images'
        lbl_dir = yaml_path.parent / split / 'labels'
        if img_dir.exists():
            n_img = len(list(img_dir.glob('*.*')))
            n_lbl = len(list(lbl_dir.glob('*.txt'))) if lbl_dir.exists() else 0
            total_imgs += n_img
            total_lbls += n_lbl
            print(f"  {split:6s}: {n_img} images, {n_lbl} labels")

    print(f"  TOTAL: {total_imgs} images, {total_lbls} labels")

    # Count detections per class
    class_counts = Counter()
    for split in ['train', 'valid', 'val', 'test']:
        lbl_dir = yaml_path.parent / split / 'labels'
        if lbl_dir.exists():
            for lbl_file in lbl_dir.glob('*.txt'):
                with open(lbl_file) as f:
                    for line in f:
                        parts = line.strip().split()
                        if parts:
                            cid = int(parts[0])
                            if cid < len(classes):
                                class_counts[classes[cid]] += 1

    print(f"  Detections:")
    for cls, cnt in class_counts.most_common():
        print(f"    {cls:30s}: {cnt}")

print()
print("=" * 70)
print(" MAPPING KE COLONYAI CLASSES")
print("=" * 70)
print()
print("Berdasarkan class names di atas, mapping yang akan digunakan:")
print()
print("  ARTIFACT (class 1):")
print("    bubble, Bubble, big_bubble, small_bubbles, impurity → bubble")
print("    contamination, stain, defect → dust_debris / media_crack")
print()
print("  VALID COLONY (class 0):")
print("    colony, Colony, bacteria, CFU → valid_colony")
