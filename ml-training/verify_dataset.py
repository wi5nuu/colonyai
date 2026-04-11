"""
ColonyAI - Dataset Verification Script
Verifies dataset structure, image-label matching, and annotation format
"""

import os
import cv2
from pathlib import Path
import yaml
from collections import defaultdict

def verify_dataset_structure(dataset_path):
    """Verify dataset directory structure"""
    print("\n" + "="*70)
    print("📁 VERIFYING DATASET STRUCTURE")
    print("="*70)
    
    required_files = ['data.yaml']
    required_dirs = [
        'images/train', 'images/val', 'images/test',
        'labels/train', 'labels/val', 'labels/test'
    ]
    
    dataset_path = Path(dataset_path)
    issues = []
    
    # Check required files
    for file in required_files:
        if not (dataset_path / file).exists():
            issues.append(f"❌ Missing: {file}")
        else:
            print(f"✅ Found: {file}")
    
    # Check required directories
    for dir_path in required_dirs:
        dir_full = dataset_path / dir_path
        if not dir_full.exists():
            issues.append(f"❌ Missing directory: {dir_path}")
        else:
            count = len(list(dir_full.glob('*.jpg'))) + len(list(dir_full.glob('*.png')))
            print(f"✅ Found: {dir_path}/ ({count} images)")
    
    return len(issues) == 0, issues


def verify_data_yaml(dataset_path):
    """Verify data.yaml configuration"""
    print("\n" + "="*70)
    print("📋 VERIFYING data.yaml")
    print("="*70)
    
    yaml_path = Path(dataset_path) / 'data.yaml'
    if not yaml_path.exists():
        print("❌ data.yaml not found!")
        return False, None
    
    with open(yaml_path, 'r') as f:
        config = yaml.safe_load(f)
    
    # Check required fields
    required_fields = ['train', 'val', 'nc', 'names']
    missing = [field for field in required_fields if field not in config]
    
    if missing:
        print(f"❌ Missing fields in data.yaml: {missing}")
        return False, None
    
    print(f"✅ Train path: {config['train']}")
    print(f"✅ Val path: {config['val']}")
    print(f"✅ Number of classes: {config['nc']}")
    print(f"✅ Class names: {config['names']}")
    
    return True, config


def verify_annotations(dataset_path):
    """Verify annotation format and image-label matching"""
    print("\n" + "="*70)
    print("🏷️  VERIFYING ANNOTATIONS")
    print("="*70)
    
    splits = ['train', 'val', 'test']
    total_images = 0
    total_labels = 0
    total_annotations = 0
    class_counts = defaultdict(int)
    issues = []
    
    for split in splits:
        img_dir = Path(dataset_path) / 'images' / split
        label_dir = Path(dataset_path) / 'labels' / split
        
        if not img_dir.exists():
            print(f"\n⚠️  Skipping {split}/ - directory not found")
            continue
        
        # Count images
        images = list(img_dir.glob('*.jpg')) + list(img_dir.glob('*.png'))
        num_images = len(images)
        total_images += num_images
        
        # Count labels
        if label_dir.exists():
            labels = list(label_dir.glob('*.txt'))
            num_labels = len(labels)
            total_labels += num_labels
        else:
            num_labels = 0
            labels = []
        
        print(f"\n📊 {split.upper()} split:")
        print(f"   Images: {num_images}")
        print(f"   Labels: {num_labels}")
        
        if num_images != num_labels:
            msg = f"⚠️  MISMATCH in {split}: {num_images} images vs {num_labels} labels"
            issues.append(msg)
            print(f"   {msg}")
        
        # Verify label format
        valid_labels = 0
        invalid_labels = 0
        
        for label_path in labels:
            try:
                with open(label_path, 'r') as f:
                    lines = f.readlines()
                
                for line in lines:
                    line = line.strip()
                    if not line:
                        continue
                    
                    parts = line.split()
                    if len(parts) != 5:
                        invalid_labels += 1
                        issues.append(f"❌ Invalid format in {label_path}: expected 5 values, got {len(parts)}")
                        continue
                    
                    class_id = int(parts[0])
                    x_center = float(parts[1])
                    y_center = float(parts[2])
                    width = float(parts[3])
                    height = float(parts[4])
                    
                    # Validate values
                    if class_id < 0:
                        invalid_labels += 1
                        issues.append(f"❌ Negative class_id in {label_path}")
                        continue
                    
                    if not (0 <= x_center <= 1 and 0 <= y_center <= 1 and 
                           0 <= width <= 1 and 0 <= height <= 1):
                        invalid_labels += 1
                        issues.append(f"❌ Normalized values out of range [0,1] in {label_path}")
                        continue
                    
                    class_counts[class_id] += 1
                    valid_labels += 1
                    total_annotations += 1
            
            except Exception as e:
                invalid_labels += 1
                issues.append(f"❌ Error reading {label_path}: {str(e)}")
        
        print(f"   ✅ Valid annotations: {valid_labels}")
        if invalid_labels > 0:
            print(f"   ❌ Invalid annotations: {invalid_labels}")
    
    # Summary
    print("\n" + "="*70)
    print("📊 DATASET SUMMARY")
    print("="*70)
    print(f"Total Images: {total_images}")
    print(f"Total Labels: {total_labels}")
    print(f"Total Annotations: {total_annotations}")
    
    if class_counts:
        print(f"\nClass Distribution:")
        for class_id, count in sorted(class_counts.items()):
            print(f"  Class {class_id}: {count} annotations")
    
    return len(issues) == 0, issues


def verify_images(dataset_path):
    """Verify images can be loaded"""
    print("\n" + "="*70)
    print("🖼️  VERIFYING IMAGES")
    print("="*70)
    
    splits = ['train', 'val', 'test']
    corrupt_images = []
    
    for split in splits:
        img_dir = Path(dataset_path) / 'images' / split
        if not img_dir.exists():
            continue
        
        images = list(img_dir.glob('*.jpg')) + list(img_dir.glob('*.png'))
        valid = 0
        invalid = 0
        
        for img_path in images:
            try:
                img = cv2.imread(str(img_path))
                if img is None:
                    corrupt_images.append(str(img_path))
                    invalid += 1
                else:
                    h, w = img.shape[:2]
                    valid += 1
            except Exception as e:
                corrupt_images.append(str(img_path))
                invalid += 1
        
        print(f"\n📊 {split.upper()}:")
        print(f"   ✅ Valid: {valid}")
        if invalid > 0:
            print(f"   ❌ Corrupt: {invalid}")
    
    if corrupt_images:
        print(f"\n⚠️  Found {len(corrupt_images)} corrupt images:")
        for img_path in corrupt_images[:5]:
            print(f"   - {img_path}")
        if len(corrupt_images) > 5:
            print(f"   ... and {len(corrupt_images) - 5} more")
    
    return len(corrupt_images) == 0, corrupt_images


def print_recommendations(issues, config):
    """Print recommendations based on verification"""
    print("\n" + "="*70)
    print("💡 RECOMMENDATIONS")
    print("="*70)
    
    if not issues:
        print("✅ Dataset looks good! Ready for training.")
    else:
        print(f"⚠️  Found {len(issues)} issue(s):")
        for issue in issues[:10]:
            print(f"   {issue}")
        if len(issues) > 10:
            print(f"   ... and {len(issues) - 10} more")
    
    if config:
        nc = config.get('nc', 0)
        names = config.get('names', {})
        if nc != len(names):
            print(f"\n⚠️  MISMATCH: nc={nc} but {len(names)} class names defined")
        
        print(f"\n📝 Configured Classes:")
        for class_id, class_name in names.items():
            print(f"   {class_id}: {class_name}")


def main():
    """Main verification function"""
    dataset_path = "d:/lombapuai/ml-training/datasets/colony_dataset"
    
    print("\n" + "="*70)
    print("🔍 COLONYAI DATASET VERIFICATION")
    print("="*70)
    print(f"\nDataset path: {dataset_path}")
    
    all_issues = []
    
    # 1. Verify structure
    structure_ok, structure_issues = verify_dataset_structure(dataset_path)
    all_issues.extend(structure_issues)
    
    # 2. Verify data.yaml
    yaml_ok, config = verify_data_yaml(dataset_path)
    if not yaml_ok:
        print("\n❌ Cannot proceed without valid data.yaml")
        print("   Run: python download_dataset.py")
        return
    
    # 3. Verify images
    images_ok, image_issues = verify_images(dataset_path)
    all_issues.extend(image_issues)
    
    # 4. Verify annotations
    annotations_ok, annotation_issues = verify_annotations(dataset_path)
    all_issues.extend(annotation_issues)
    
    # 5. Print recommendations
    print_recommendations(all_issues, config)
    
    # Final verdict
    print("\n" + "="*70)
    if all_issues:
        print(f"⚠️  VERIFICATION COMPLETE with {len(all_issues)} issue(s)")
        print("="*70)
        print("\n🔧 Fix issues before training:")
        print("   - Ensure all images have corresponding label files")
        print("   - Check annotation format: class x_center y_center width height")
        print("   - All values should be normalized (0-1)")
        print("   - Remove corrupt images")
    else:
        print("✅ VERIFICATION COMPLETE - Dataset is ready!")
        print("="*70)
        print("\n🚀 You can now start training:")
        print("   python train.py")
    
    print()


if __name__ == "__main__":
    main()
