"""
ColonyAI — Auto Threshold Calibration
=======================================
Finds optimal per-class confidence thresholds for a YOLO detection model
by running inference on a validation set and maximizing F1 score per class.

Usage:
  python calibrate.py --data /path/to/val/dataset --model best.pt
  python calibrate.py --data /path/to/val --model best.pt --output thresholds.json
  python calibrate.py --data /path/to/val --model best.pt --output-format python

Output: optimal thresholds per class + per media type (if media labels available)
"""

import argparse
import json
import os
import sys
import numpy as np
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Tuple

try:
    from ultralytics import YOLO
    import cv2
except ImportError:
    print("[ERROR] ultralytics not installed. Run: pip install ultralytics")
    sys.exit(1)


# ── 5-class taxonomy ──
ALL_CLASSES = ['colony_single', 'colony_merged', 'bubble', 'dust_debris', 'media_crack']

# YOLO class index mapping (must match training label order)
# Adjust this if your dataset uses different indices
CLASS_INDEX = {name: i for i, name in enumerate(ALL_CLASSES)}


def load_yolo_labels(label_path: str, img_width: int, img_height: int) -> List[Dict]:
    """Load YOLO format labels (class_id x_center y_center width height) -> absolute bbox."""
    detections = []
    if not os.path.exists(label_path):
        return detections
    with open(label_path) as f:
        for line in f:
            parts = line.strip().split()
            if len(parts) != 5:
                continue
            cls_id = int(parts[0])
            x_c, y_c, w, h = map(float, parts[1:])
            x1 = int((x_c - w / 2) * img_width)
            y1 = int((y_c - h / 2) * img_height)
            x2 = int((x_c + w / 2) * img_width)
            y2 = int((y_c + h / 2) * img_height)
            detections.append({
                'class_id': cls_id,
                'class_name': ALL_CLASSES[cls_id] if cls_id < len(ALL_CLASSES) else f'class_{cls_id}',
                'bbox': {'x': x1, 'y': y1, 'width': x2 - x1, 'height': y2 - y1},
            })
    return detections


def iou(b1: Dict, b2: Dict) -> float:
    """IoU between two bbox dicts with x, y, width, height."""
    x1 = max(b1['x'], b2['x'])
    y1 = max(b1['y'], b2['y'])
    x2 = min(b1['x'] + b1['width'], b2['x'] + b2['width'])
    y2 = min(b1['y'] + b1['height'], b2['y'] + b2['height'])
    inter = max(0, x2 - x1) * max(0, y2 - y1)
    if inter == 0:
        return 0.0
    a1 = b1['width'] * b1['height']
    a2 = b2['width'] * b2['height']
    return inter / (a1 + a2 - inter)


def match_detections(preds: List[Dict], gts: List[Dict], iou_thresh: float = 0.5) -> Tuple[int, int, int]:
    """Count true positives, false positives, false negatives per class."""
    tp, fp, fn = 0, 0, len(gts)

    matched_gt = set()
    matched_pred = set()

    for pi, pred in enumerate(preds):
        best_iou = iou_thresh
        best_gt = None
        for gi, gt in enumerate(gts):
            if gi in matched_gt:
                continue
            if pred['class_name'] != gt['class_name']:
                continue
            i = iou(pred['bbox'], gt['bbox'])
            if i > best_iou:
                best_iou = i
                best_gt = gi

        if best_gt is not None:
            tp += 1
            fp -= 0  # not a false positive
            matched_gt.add(best_gt)
            matched_pred.add(pi)
        else:
            fp += 1

    fn = len(gts) - len(matched_gt)
    return tp, fp, fn


def f1_score(tp: int, fp: int, fn: int) -> float:
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    if precision + recall == 0:
        return 0.0
    return 2 * precision * recall / (precision + recall)


def calibrate(
    val_path: str,
    model_path: str,
    iou_thresh: float = 0.5,
    step: float = 0.02,
    img_size: int = 640
) -> Dict[str, float]:
    """
    Find optimal confidence threshold per class by maximizing F1 score.

    Args:
        val_path: Path to validation dataset (YOLO format: images/ + labels/)
        model_path: Path to YOLO model (.pt)
        iou_thresh: IoU threshold for matching predictions to ground truth
        step: Threshold search step size
        img_size: YOLO inference image size

    Returns:
        Dict mapping class_name -> optimal confidence threshold
    """
    val_dir = Path(val_path)
    images_dir = val_dir / "images"
    labels_dir = val_dir / "labels"

    if not images_dir.exists():
        print(f"[ERROR] Images directory not found: {images_dir}")
        sys.exit(1)
    if not labels_dir.exists():
        print(f"[WARN] Labels directory not found: {labels_dir}. Using images only (no evaluation possible).")
        return {cls: 0.25 for cls in ALL_CLASSES}

    print(f"[CALIBRATE] Loading model: {model_path}")
    model = YOLO(model_path)

    image_files = sorted(images_dir.iterdir())
    if not image_files:
        print(f"[ERROR] No images found in {images_dir}")
        sys.exit(1)

    print(f"[CALIBRATE] Found {len(image_files)} validation images")

    # Try thresholds from 0.05 to 0.95
    thresholds = np.arange(0.05, 0.95 + step, step)

    # Per-class statistics across all thresholds
    class_stats = {cls: {th: {'tp': 0, 'fp': 0, 'fn': 0} for th in thresholds} for cls in ALL_CLASSES}

    for img_path in image_files:
        ext = img_path.suffix.lower()
        if ext not in ('.jpg', '.jpeg', '.png', '.bmp', '.webp'):
            continue

        # Load ground truth
        label_path = labels_dir / f"{img_path.stem}.txt"
        gt_detections = load_yolo_labels(str(label_path), img_size, img_size)

        # Run inference
        img = cv2.imread(str(img_path))
        if img is None:
            continue
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        results = model(img_rgb, conf=0.01, iou=iou_thresh, imgsz=img_size, verbose=False)
        result = results[0]

        if result.boxes is None or len(result.boxes) == 0:
            continue

        boxes = result.boxes.xyxy.cpu().numpy()
        confidences = result.boxes.conf.cpu().numpy()
        class_ids = result.boxes.cls.cpu().numpy().astype(int)

        # Evaluate at each threshold
        for th in thresholds:
            preds = []
            for box, conf, cls_id in zip(boxes, confidences, class_ids):
                if conf < th:
                    continue
                x1, y1, x2, y2 = box
                cls_name = model.names.get(int(cls_id), ALL_CLASSES[int(cls_id)] if int(cls_id) < len(ALL_CLASSES) else 'unknown')
                if cls_name not in ALL_CLASSES:
                    continue
                preds.append({
                    'class_name': cls_name,
                    'confidence': float(conf),
                    'bbox': {'x': int(x1), 'y': int(y1), 'width': int(x2 - x1), 'height': int(y2 - y1)},
                })

            # Match per class
            for cls in ALL_CLASSES:
                cls_preds = [p for p in preds if p['class_name'] == cls]
                cls_gts = [g for g in gt_detections if g['class_name'] == cls]
                tp, fp, fn = match_detections(cls_preds, cls_gts, iou_thresh)
                class_stats[cls][th]['tp'] += tp
                class_stats[cls][th]['fp'] += fp
                class_stats[cls][th]['fn'] += fn

    # Find best threshold per class
    optimal = {}
    for cls in ALL_CLASSES:
        best_f1 = 0.0
        best_th = 0.25  # default fallback
        for th in thresholds:
            stats = class_stats[cls][th]
            f1 = f1_score(stats['tp'], stats['fp'], stats['fn'])
            if f1 > best_f1:
                best_f1 = f1
                best_th = round(th, 3)

        optimal[cls] = best_th
        print(f"  [{cls:16s}] optimal_threshold={best_th:.3f}  F1={best_f1:.4f}  "
              f"TP={class_stats[cls][best_th]['tp']:4d}  "
              f"FP={class_stats[cls][best_th]['fp']:4d}  "
              f"FN={class_stats[cls][best_th]['fn']:4d}")

    return optimal


def format_as_python(thresholds: Dict[str, float]) -> str:
    """Format thresholds as Python code for copy-paste into thresholds.py."""
    lines = ['{\n']
    for cls in ALL_CLASSES:
        val = thresholds.get(cls, 0.25)
        lines.append(f'        "{cls}": {val:.2f},\n')
    lines.append('    }')
    return ''.join(lines)


def main():
    parser = argparse.ArgumentParser(description="Auto-threshold calibration for YOLO colony detection")
    parser.add_argument("--data", required=True, help="Path to validation dataset (YOLO format)")
    parser.add_argument("--model", required=True, help="Path to YOLO model (.pt)")
    parser.add_argument("--output", default=None, help="Output JSON file path")
    parser.add_argument("--output-format", choices=["json", "python"], default="json",
                        help="Output format: json (default) or python (copy-paste code)")
    parser.add_argument("--iou", type=float, default=0.5, help="IoU threshold for matching (default: 0.5)")
    parser.add_argument("--step", type=float, default=0.02, help="Threshold search step (default: 0.02)")
    parser.add_argument("--img-size", type=int, default=640, help="YOLO inference image size (default: 640)")

    args = parser.parse_args()

    print("=" * 60)
    print("ColonyAI — Auto Threshold Calibration")
    print("=" * 60)
    print(f"  Validation set: {args.data}")
    print(f"  Model:          {args.model}")
    print(f"  IoU threshold:  {args.iou}")
    print(f"  Step size:      {args.step}")
    print()

    optimal = calibrate(args.data, args.model, args.iou, args.step, args.img_size)

    print()
    print("─" * 60)
    print("Optimal Thresholds:")
    if args.output_format == "python":
        code = format_as_python(optimal)
        print(code)
    else:
        print(json.dumps(optimal, indent=2))

    if args.output:
        output_path = Path(args.output)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        if args.output_format == "python":
            output_path.write_text(format_as_python(optimal))
        else:
            output_path.write_text(json.dumps(optimal, indent=2))
        print(f"Saved to: {output_path}")

    print("Done.")


if __name__ == "__main__":
    main()
