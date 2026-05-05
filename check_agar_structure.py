import os
import json
from pathlib import Path

agar_path = Path('D:/lombapuai/ml-training/datasets/roboflow/agar_demo')

print("=" * 60)
print(" STRUKTUR AGAR DEMO DATASET")
print("=" * 60)
print()

# List semua file dan folder
for item in sorted(agar_path.rglob('*')):
    rel = item.relative_to(agar_path)
    depth = len(rel.parts) - 1
    indent = '  ' * depth
    if item.is_dir():
        print(f"{indent}📁 {item.name}/")
    else:
        size = item.stat().st_size
        if size > 1024*1024:
            size_str = f"{size/1024/1024:.1f} MB"
        elif size > 1024:
            size_str = f"{size/1024:.1f} KB"
        else:
            size_str = f"{size} B"
        print(f"{indent}📄 {item.name} ({size_str})")

    # Limit depth
    if depth > 3:
        break
