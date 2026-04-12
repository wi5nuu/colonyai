import os
import yaml
from pathlib import Path
import colorama
from colorama import Fore, Style

colorama.init(autoreset=True)

def verify_dataset():
    print(f"{Fore.CYAN}{'='*60}")
    print(f"🔍 COLONYAI DATASET VERIFICATION")
    print(f"{'='*60}\n")

    # Load config
    script_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(script_dir, "datasets", "colony_dataset")
    data_yaml_path = os.path.join(dataset_path, "data.yaml")

    if not os.path.exists(data_yaml_path):
        print(f"{Fore.RED}❌ ERROR: data.yaml not found at {data_yaml_path}")
        return

    with open(data_yaml_path, 'r', encoding='utf-8') as f:
        config = yaml.safe_load(f)

    print(f"{Fore.GREEN}✅ Configuration Loaded: data.yaml")
    print(f"   Classes: {config['nc']}")
    print(f"   Class Names: {config['names']}\n")

    # Check splits
    splits = {'train': config.get('train'), 'val': config.get('val'), 'test': config.get('test')}
    total_images = 0
    total_annotations = 0
    class_counts = {i: 0 for i in range(config['nc'])}

    for split_name, split_path in splits.items():
        if not split_path: continue
        
        # Construct full path relative to data.yaml location
        img_dir = os.path.join(dataset_path, split_path)
        # Labels are usually in 'labels' folder parallel to 'images'
        # But in YOLO structure, if train is 'train/images', labels are 'train/labels'
        label_dir = img_dir.replace('/images', '/labels').replace('\\images', '\\labels')
        
        # Check if directories exist
        img_exists = os.path.exists(img_dir)
        label_exists = os.path.exists(label_dir)

        if not img_exists or not label_exists:
            print(f"{Fore.YELLOW}⚠️  WARNING: {split_name} split missing (Images: {img_exists}, Labels: {label_exists})")
            continue

        # Count images
        img_count = len(list(Path(img_dir).glob('*.jpg'))) + len(list(Path(img_dir).glob('*.png')))
        label_count = len(list(Path(label_dir).glob('*.txt')))
        
        total_images += img_count
        total_annotations += label_count

        print(f"{Fore.GREEN}📂 {split_name.upper()} Split:")
        print(f"   Images: {img_count}")
        print(f"   Label Files: {label_count}")

        # Check label content
        if label_count > 0:
            for label_file in Path(label_dir).glob('*.txt'):
                with open(label_file, 'r') as f:
                    for line in f:
                        parts = line.strip().split()
                        if len(parts) >= 5:
                            cls_id = int(parts[0])
                            if cls_id in class_counts:
                                class_counts[cls_id] += 1

    print(f"\n{'='*60}")
    print(f"📊 DATASET SUMMARY")
    print(f"{'='*60}")
    print(f"Total Images: {total_images}")
    print(f"Total Annotations: {total_annotations}")
    
    print(f"\n🏷️  Class Distribution:")
    all_good = True
    for cls_id, count in class_counts.items():
        cls_name = config['names'][cls_id]
        status = Fore.GREEN + "✅ OK" if count > 0 else Fore.RED + "❌ EMPTY"
        if count == 0: all_good = False
        print(f"   {status} | Class {cls_id} ({cls_name}): {count} annotations")

    print(f"\n{'='*60}")
    if all_good:
        print(f"{Fore.GREEN}🎉 VERIFICATION PASSED! Dataset is ready for training.")
    else:
        print(f"{Fore.RED}⚠️  VERIFICATION WARNING: Some classes are empty!")
        print(f"   You must annotate images for the missing classes before training for best accuracy.")
    print(f"{'='*60}")

if __name__ == "__main__":
    verify_dataset()
