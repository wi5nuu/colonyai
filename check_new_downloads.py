from pathlib import Path
import yaml
from collections import Counter

downloads = Path('C:/Users/Legion/Downloads')

print("ZIP files di Downloads:")
zips = sorted([f for f in downloads.glob('*.zip')], key=lambda x: x.stat().st_mtime, reverse=True)
for z in zips[:15]:  # 15 terbaru
    print(f"  {z.name}")
