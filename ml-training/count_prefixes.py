import os
from pathlib import Path

base = r'd:\lombapuai\ml-training\datasets\colony_dataset'
prefixes = {'conteo': 0, 'newcolony': 0, 'other': 0}

for split in ['train', 'valid', 'test']:
    path = os.path.join(base, split, 'labels')
    if not os.path.exists(path): continue
    for f in Path(path).glob('*.txt'):
        if f.name.startswith('conteo_'):
            prefixes['conteo'] += 1
        elif f.name.startswith('newcolony_'):
            prefixes['newcolony'] += 1
        else:
            prefixes['other'] += 1

print(f"File counts by prefix: {prefixes}")
