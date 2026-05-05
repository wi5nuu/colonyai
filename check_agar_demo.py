import os
import json
from pathlib import Path

downloads = Path('C:/Users/Legion/Downloads')

# Cari file AGAR yang baru didownload
print("Mencari file AGAR di Downloads...")
print()

# Cari ZIP terbaru
zips = sorted(downloads.glob('*.zip'), key=lambda x: x.stat().st_mtime, reverse=True)
print("5 ZIP terbaru:")
for z in zips[:5]:
    print(f"  {z.name} ({z.stat().st_size/1024/1024:.1f} MB)")

print()

# Cari folder yang baru
folders = sorted([f for f in downloads.iterdir() if f.is_dir()],
                 key=lambda x: x.stat().st_mtime, reverse=True)
print("5 Folder terbaru:")
for f in folders[:5]:
    print(f"  {f.name}/")
