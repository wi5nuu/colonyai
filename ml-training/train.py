"""
ColonyAI — Universal Training Pipeline for Colony Detection
============================================================
Supports:
  - YOLOv8 fine-tuning from existing colony model
  - Dataset format auto-detection (YOLO, COCO JSON, Pascal VOC XML)
  - Multi-GPU training
  - MLflow experiment tracking
  - Automatic hyperparameter tuning

Usage:
  python train.py --data /path/to/dataset --epochs 50
  python train.py --data /path/to/dataset --mode tune
  python train.py --data /path/to/dataset --mode evaluate --model best.pt
"""

import argparse
import os
import sys
import json
import yaml
import random
import numpy as np
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, List

import torch

SEED = 42
random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)
if torch.cuda.is_available():
    torch.cuda.manual_seed_all(SEED)


def setup_mlflow(experiment_name: str = "colonyai-training"):
    """Initialize MLflow tracking if available."""
    try:
        import mlflow
        mlflow.set_experiment(experiment_name)
        return mlflow
    except ImportError:
        print("[WARN] MLflow not installed. Skipping experiment tracking.")
        return None


def detect_dataset_format(data_path: str) -> str:
    """Auto-detect dataset format (YOLO, COCO, Pascal VOC)."""
    path = Path(data_path)

    # Check for YOLO format (images/ + labels/ directories)
    if (path / "images" / "train").exists() and (path / "labels" / "train").exists():
        return "yolo"

    # Check for COCO JSON format
    ann_files = list(path.rglob("*.json"))
    for f in ann_files:
        try:
            with open(f) as fh:
                content = json.load(fh)
                if "images" in content and "annotations" in content:
                    return "coco"
        except (json.JSONDecodeError, UnicodeDecodeError):
            continue

    # Check for Pascal VOC format
    xml_files = list(path.rglob("*.xml"))
    if xml_files:
        with open(xml_files[0]) as f:
            if "<annotation>" in f.read():
                return "voc"

    return "unknown"


def convert_coco_to_yolo(coco_path: str, output_path: str):
    """Convert COCO JSON annotations to YOLO format."""
    import json
    from PIL import Image

    output = Path(output_path)
    output.mkdir(parents=True, exist_ok=True)

    with open(coco_path) as f:
        coco = json.load(f)

    # Build category ID mapping
    cat_map = {cat["id"]: idx for idx, cat in enumerate(coco["categories"])}

    # Process each image
    for img in coco["images"]:
        img_id = img["id"]
        filename = img["file_name"]
        width, height = img["width"], img["height"]

        # Find annotations for this image
        anns = [a for a in coco["annotations"] if a["image_id"] == img_id]

        # Create YOLO label file
        label_path = output / Path(filename).with_suffix(".txt")
        with open(label_path, "w") as f:
            for ann in anns:
                cat_id = cat_map[ann["category_id"]]
                bbox = ann["bbox"]  # COCO format: [x, y, width, height]
                x_center = (bbox[0] + bbox[2] / 2) / width
                y_center = (bbox[1] + bbox[3] / 2) / height
                w = bbox[2] / width
                h = bbox[3] / height
                f.write(f"{cat_id} {x_center:.6f} {y_center:.6f} {w:.6f} {h:.6f}\n")

    print(f"[CONVERT] COCO -> YOLO: {len(coco['images'])} images converted to {output}")


def convert_voc_to_yolo(voc_dir: str, output_path: str):
    """Convert Pascal VOC XML annotations to YOLO format."""
    import xml.etree.ElementTree as ET
    from PIL import Image

    output = Path(output_path)
    output.mkdir(parents=True, exist_ok=True)

    xml_files = list(Path(voc_dir).rglob("*.xml"))

    class_names = []
    for xml_file in xml_files:
        tree = ET.parse(xml_file)
        root = tree.getroot()

        # Get image dimensions
        size = root.find("size")
        width = int(size.find("width").text)
        height = int(size.find("height").text)

        # Get filename
        filename = root.find("filename").text or xml_file.stem + ".jpg"

        # Parse objects
        with open(output / Path(filename).with_suffix(".txt"), "w") as f:
            for obj in root.findall("object"):
                name = obj.find("name").text
                if name not in class_names:
                    class_names.append(name)
                class_id = class_names.index(name)

                bbox = obj.find("bndbox")
                xmin = int(bbox.find("xmin").text)
                ymin = int(bbox.find("ymin").text)
                xmax = int(bbox.find("xmax").text)
                ymax = int(bbox.find("ymax").text)

                x_center = ((xmin + xmax) / 2) / width
                y_center = ((ymin + ymax) / 2) / height
                w = (xmax - xmin) / width
                h = (ymax - ymin) / height

                f.write(f"{class_id} {x_center:.6f} {y_center:.6f} {w:.6f} {h:.6f}\n")

    print(f"[CONVERT] VOC -> YOLO: {len(xml_files)} images converted. Classes: {class_names}")


def create_data_yaml(data_path: str, output_path: str, class_names: Optional[List[str]] = None):
    """Create data.yaml for YOLO training."""
    path = Path(data_path)

    # Auto-detect class names
    if class_names is None:
        label_files = list((path / "labels" / "train").glob("*.txt"))
        class_ids = set()
        for lf in label_files:
            with open(lf) as f:
                for line in f:
                    if line.strip():
                        class_ids.add(int(line.strip().split()[0]))
        class_names = [f"class_{i}" for i in sorted(class_ids)]

    data_yaml = {
        "path": str(path.absolute()),
        "train": "train/images",
        "val": "valid/images",
        "test": "test/images" if (path / "test" / "images").exists() else "",
        "nc": len(class_names),
        "names": class_names,
    }

    with open(output_path, "w") as f:
        yaml.dump(data_yaml, f, default_flow_style=False)

    print(f"[CONFIG] Created {output_path} with {len(class_names)} classes: {class_names}")
    return data_yaml


def train(args):
    """Main training function."""
    print("=" * 60)
    print("ColonyAI — Universal Training Pipeline")
    print(f"  Data: {args.data}")
    print(f"  Model: {args.model}")
    print(f"  Epochs: {args.epochs}")
    print(f"  Image Size: {args.imgsz}")
    print(f"  Batch: {args.batch}")
    print(f"  Device: {args.device}")
    print("=" * 60)

    # Detect dataset format
    fmt = detect_dataset_format(args.data)
    print(f"[INFO] Detected dataset format: {fmt}")

    # Convert if needed
    data_path = args.data
    if fmt == "coco" or fmt == "coco_json":
        coco_files = list(Path(args.data).rglob("*.json"))
        if coco_files:
            yolo_path = Path(args.data) / "_yolo_converted"
            convert_coco_to_yolo(str(coco_files[0]), str(yolo_path))
            data_path = str(yolo_path)
    elif fmt == "voc":
        yolo_path = Path(args.data) / "_yolo_converted"
        convert_voc_to_yolo(args.data, str(yolo_path))
        data_path = str(yolo_path)

    # Create data.yaml
    data_yaml_path = os.path.join(args.data, "data.yaml")
    if not os.path.exists(data_yaml_path):
        data_yaml = create_data_yaml(data_path, data_yaml_path)

    # Setup MLflow
    mlflow = setup_mlflow()

    # Train
    from ultralytics import YOLO

    model = YOLO(args.model)

    # Determine device
    device = args.device
    if device == "auto":
        device = 0 if torch.cuda.is_available() else "cpu"
    elif device == "cpu":
        device = "cpu"
    else:
        device = int(device)

    print(f"[TRAIN] Using device: {device}")

    results = model.train(
        data=data_yaml_path,
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        device=device,
        patience=args.patience,
        save=True,
        save_period=args.save_period,
        cache=True,
        workers=args.workers,

        # Optimizer
        optimizer="AdamW",
        lr0=args.lr,
        lrf=0.01,
        momentum=0.937,
        weight_decay=0.0005,
        warmup_epochs=3,

        # Augmentation
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4,
        degrees=15.0,
        translate=0.1,
        scale=0.5,
        shear=10.0,
        flipud=0.5,
        fliplr=0.5,
        mosaic=1.0,
        mixup=0.1,

        # Logging
        project=args.project,
        name=args.name,
        exist_ok=True,
        verbose=args.verbose,
    )

    print(f"[TRAIN] Training complete! Results saved to runs/detect/{args.name}")

    # Export models
    best_path = f"runs/detect/{args.name}/weights/best.pt"
    if os.path.exists(best_path):
        model = YOLO(best_path)
        model.export(format="onnx", opset=12)
        print(f"[EXPORT] ONNX model saved: {best_path.replace('.pt', '.onnx')}")

        # Validate
        metrics = model.val()
        print(f"[EVAL] mAP@0.5: {metrics.box.map50:.4f}")
        print(f"[EVAL] mAP@0.5:0.95: {metrics.box.map:.4f}")

    return results


def evaluate(args):
    """Evaluate a trained model on test data."""
    from ultralytics import YOLO

    print(f"[EVAL] Loading model: {args.model}")
    model = YOLO(args.model)

    data_yaml = os.path.join(args.data, "data.yaml")
    if not os.path.exists(data_yaml):
        create_data_yaml(args.data, data_yaml)

    metrics = model.val(data=data_yaml, imgsz=args.imgsz, batch=args.batch)

    print("=" * 60)
    print("EVALUATION RESULTS")
    print(f"  mAP@0.5:      {metrics.box.map50:.4f}")
    print(f"  mAP@0.5:0.95:  {metrics.box.map:.4f}")
    print(f"  Precision:    {metrics.box.mp:.4f}")
    print(f"  Recall:       {metrics.box.mr:.4f}")
    print("=" * 60)

    return metrics


def tune(args):
    """Hyperparameter tuning."""
    from ultralytics import YOLO

    print(f"[TUNE] Starting hyperparameter tuning with {args.iterations} iterations")

    data_yaml = os.path.join(args.data, "data.yaml")
    if not os.path.exists(data_yaml):
        create_data_yaml(args.data, data_yaml)

    model = YOLO(args.model)

    model.tune(
        data=data_yaml,
        epochs=args.epochs,
        iterations=args.iterations,
        optimizer="AdamW",
        space={
            "lr0": (1e-5, 1e-2),
            "lrf": (0.01, 0.1),
            "momentum": (0.7, 0.98),
            "weight_decay": (1e-5, 1e-3),
            "hsv_h": (0.0, 0.1),
            "hsv_s": (0.0, 0.9),
            "hsv_v": (0.0, 0.9),
            "degrees": (0.0, 45.0),
            "translate": (0.0, 0.5),
            "scale": (0.0, 0.9),
        },
    )


def verify(args):
    """Verify dataset integrity."""
    from collections import Counter

    path = Path(args.data)
    print(f"[VERIFY] Checking dataset at: {path}")

    splits = ["train", "valid", "test"]
    stats = {}

    for split in splits:
        img_dir = path / split / "images"
        label_dir = path / split / "labels"

        if not img_dir.exists():
            print(f"  [SKIP] {split}: no images directory")
            continue

        images = sorted(img_dir.glob("*"))
        labels = sorted(label_dir.glob("*.txt")) if label_dir.exists() else []

        # Parse labels
        class_counts = Counter()
        total_boxes = 0
        corrupt_labels = 0

        for lf in labels:
            with open(lf) as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    parts = line.split()
                    if len(parts) != 5:
                        corrupt_labels += 1
                        continue
                    try:
                        cls_id = int(parts[0])
                        coords = [float(x) for x in parts[1:]]
                        if not all(0 <= x <= 1 for x in coords):
                            corrupt_labels += 1
                        class_counts[cls_id] += 1
                        total_boxes += 1
                    except ValueError:
                        corrupt_labels += 1

        stats[split] = {
            "images": len(images),
            "labels": len(labels),
            "boxes": total_boxes,
            "classes": dict(class_counts),
            "corrupt": corrupt_labels,
        }

        status = "OK" if corrupt_labels == 0 else f"{corrupt_labels} CORRUPT"
        print(f"  [{status}] {split}: {len(images)} images, {total_boxes} boxes, {len(class_counts)} classes")

    return stats


def main():
    parser = argparse.ArgumentParser(description="ColonyAI Universal Training Pipeline")
    parser.add_argument("--mode", type=str, default="full",
                        choices=["full", "evaluate", "tune", "verify", "convert"],
                        help="Training mode")
    parser.add_argument("--data", type=str, required=True,
                        help="Path to dataset directory")
    parser.add_argument("--model", type=str, default="yolov8n.pt",
                        help="Base model weights (pretrained or colony checkpoint)")
    parser.add_argument("--epochs", type=int, default=50,
                        help="Number of training epochs (default: 50 for fine-tuning)")
    parser.add_argument("--imgsz", type=int, default=640,
                        help="Input image size")
    parser.add_argument("--batch", type=int, default=16,
                        help="Batch size (increase for GPU with more VRAM)")
    parser.add_argument("--lr", type=float, default=0.001,
                        help="Initial learning rate")
    parser.add_argument("--device", type=str, default="auto",
                        help="Device: 'auto', 'cpu', or GPU index (0, 1, ...)")
    parser.add_argument("--patience", type=int, default=20,
                        help="Early stopping patience")
    parser.add_argument("--save-period", type=int, default=10,
                        help="Save checkpoint every N epochs")
    parser.add_argument("--workers", type=int, default=4,
                        help="Data loading workers")
    parser.add_argument("--project", type=str, default="colonyai-training",
                        help="MLflow project name")
    parser.add_argument("--name", type=str, default=None,
                        help="Experiment name (auto-generated if not set)")
    parser.add_argument("--iterations", type=int, default=100,
                        help="Tuning iterations (for tune mode)")
    parser.add_argument("--verbose", action="store_true",
                        help="Enable verbose output")

    args = parser.parse_args()

    # Auto-generate experiment name
    if args.name is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        args.name = f"colony_{timestamp}"

    # Execute mode
    if args.mode == "full":
        train(args)
    elif args.mode == "evaluate":
        evaluate(args)
    elif args.mode == "tune":
        tune(args)
    elif args.mode == "verify":
        verify(args)
    elif args.mode == "convert":
        fmt = detect_dataset_format(args.data)
        output_dir = os.path.join(args.data, "_yolo_converted")
        if fmt == "coco":
            coco_files = list(Path(args.data).rglob("*.json"))
            if coco_files:
                convert_coco_to_yolo(str(coco_files[0]), output_dir)
        elif fmt == "voc":
            convert_voc_to_yolo(args.data, output_dir)
        else:
            print(f"[ERROR] Unknown format: {fmt}")


if __name__ == "__main__":
    main()
