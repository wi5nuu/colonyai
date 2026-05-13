import os
from pathlib import Path

dataset_path = os.path.join(os.path.dirname(__file__), 'datasets', 'colony_dataset')
label_dirs = ['train/labels', 'valid/labels', 'test/labels']

removed_mock = 0
kept_real = 0
total_processed = 0

print(f"📂 Dataset Path: {dataset_path}")
print("🧹 Starting Safe Cleanup with Progress Monitor...")

for label_dir in label_dirs:
    full_path = os.path.join(dataset_path, label_dir)
    if not os.path.exists(full_path):
        print(f"⚠️ Directory not found: {label_dir}")
        continue
    
    print(f"🔍 Scanning: {label_dir}...")
    label_files = list(Path(full_path).glob('*.txt'))
    file_count = len(label_files)
    
    for i, label_file in enumerate(label_files):
        with open(label_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        new_lines = []
        file_changed = False
        
        for line in lines:
            line_stripped = line.strip()
            if not line_stripped:
                continue
            
            parts = line_stripped.split()
            if not parts: continue
            
            class_id = parts[0]
            
            # Label 'mock' = 5 kolom (cls, x, y, w, h)
            # Label asli = polygon (biasanya > 8 kolom koordinat)
            if class_id in ['1', '2', '3', '4'] and len(parts) == 5:
                removed_mock += 1
                file_changed = True
            else:
                new_lines.append(line)
                if class_id in ['1', '2', '3', '4']:
                    kept_real += 1
                
        if file_changed:
            with open(label_file, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
        
        total_processed += 1
        if (i + 1) % 500 == 0:
            print(f"   > Processed {i+1}/{file_count} files in {label_dir}...")

print("\n" + "="*40)
print("✅ Cleanup Selesai!")
print(f"📊 Total File Diperiksa: {total_processed}")
print(f"🗑️  Label Mock (Acak) Dihapus: {removed_mock}")
print(f"💎 Label Real (Asli) Dipertahankan: {kept_real}")
print("="*40)
