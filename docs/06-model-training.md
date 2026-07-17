# ColonyAI Model Training Guide

> Training the YOLOv8 colony detection model for automated microbiology analysis.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Dataset Preparation](#dataset-preparation)
4. [Training on Google Colab](#training-on-google-colab)
5. [Training on Local Machine](#training-on-local-machine)
6. [Model Evaluation](#model-evaluation)
7. [Hyperparameter Tuning](#hyperparameter-tuning)
8. [Model Export & Deployment](#model-export--deployment)
9. [Performance Benchmarks](#performance-benchmarks)
10. [Common Issues](#common-issues)
11. [Best Practices](#best-practices)

---

## Overview

ColonyAI uses Ultralytics YOLOv8 (You Only Look Once) for real-time object detection of bacterial colonies. The model is trained to detect 5 distinct classes with a target mAP@0.5 of >=92%.

### CNN Foundation: From Workshop Theory to Production

ColonyAI's detection engine is built on the same **Convolutional Neural Network (CNN)** principles covered in the AI Open 2026 workshop. Here's how theoretical concepts map to our YOLOv8 implementation:

| Workshop Concept | Theory | ColonyAI Implementation |
|-----------------|--------|------------------------|
| **Kernel (3×3)** | Detects edges/textures | YOLOv8 CSPDarknet backbone: 3×3 conv filters extract colony features (circular edges, color gradients) |
| **Stride 1** | Preserves spatial resolution | Stride-1 convolutions in backbone preserve fine-grained colony boundaries for accurate counting |
| **Stride 2** | Downsamples feature map | Stride-2 convolutions in transition layers reduce spatial dims (like MaxPool, but learnable) |
| **Padding Same** | Output size = input size | `padding=1` for 3×3 kernels ensures feature maps don't shrink, critical for small colony detection |
| **Padding Valid** | No padding → output shrinks | Used at certain transition points where downsampling is intentional |
| **MaxPool2d(2,2)** | Reduces dims by 2×, takes max | YOLOv8 replaces this with Stride-2 Conv (learnable downsampling), achieving higher accuracy |
| **ReLU Activation** | Non-linearity, zeros out negatives | SiLU (Swish) activation in modern YOLOv8 — smoother gradient flow than ReLU |
| **Flatten → Linear** | 2D → 1D → classification | YOLOv8 uses 1×1 Conv + Global Average Pooling instead, preserving spatial info for detection |
| **CrossEntropyLoss** | Multi-class classification | YOLOv8 uses **combined loss**: `cls_loss (BCE) + box_loss (CIoU) + dfl_loss` for both classification AND localization |
| **Adam Optimizer** | Adaptive learning rate | YOLOv8 default: **SGD with momentum** (0.937) + cosine LR scheduler — more stable for detection tasks |

**Why YOLOv8 beats a simple CNN for colony counting:**
- Simple CNN (like the workshop's `SimpleCNN`) classifies the *whole image* into one label → can't count individual colonies
- YOLOv8 detects *multiple objects per image* with bounding boxes → enables per-colony CFU counting
- YOLOv8's **multi-scale detection** (FPN/PANet neck) detects colonies from tiny (1mm) to large (merged clusters)
- The workshop CNN uses 32×32 input; YOLOv8 uses **640×640** — essential for resolving small colonies

### Hardware Benchmarking (CPU vs GPU)

As demonstrated in the workshop's `benchmark_hardware()` function, GPU acceleration is critical for real-time inference:

| Device | Throughput | Latency per Image | Workshop `SimpleCNN` | ColonyAI `YOLOv8n` |
|--------|-----------|-------------------|---------------------|-------------------|
| CPU (Intel i7) | ~50 img/s | ~20ms | ✅ Fast (small model) | ⚠️ ~500ms-2s (larger) |
| GPU (RTX 3050) | ~500 img/s | ~2ms | ✅ Very Fast | ✅ ~30ms |
| GPU (RTX 5050) | ~1000 img/s | ~1ms | ✅ Instant | ✅ ~15ms |
| Deka Notebook GPU | TBD | TBD | ✅ Fast | ✅ Expected ~20-40ms |

> **Note:** For the Grand Final, panitia will provide **Deka Notebook GPU** access. ColonyAI's model is optimized for this — the `ml-training/train.py` pipeline auto-detects device and uses mixed precision (AMP) for maximum throughput.

### Data Freshness: Preventing Model Expiry

A key workshop concern was ensuring AI models remain accurate as new data arrives. ColonyAI's **Continuous Learning Pipeline** prevents model "expiry":

1. **Multi-Format Training** — `ml-training/train.py` auto-detects YOLO, COCO JSON, and Pascal VOC formats
2. **Model Swap API** — Upload and activate new models without restarting the server (`POST /admin/models/activate`)
3. **Auto-Threshold Calibration** — `ml-training/calibrate.py` finds optimal per-class confidence thresholds for new datasets
4. **Singleton Architecture** — Model loaded once globally; activation instantly resets the singleton

### Model Architecture

| Parameter | YOLOv8n (Nano) | YOLOv8s (Small) |
|-----------|----------------|-----------------|
| Parameters | 3.2M | 11.2M |
| FLOPs | 8.7G | 28.6G |
| Inference (CPU) | ~25ms | ~42ms |
| Inference (GPU) | ~5ms | ~8ms |
| mAP@0.5 | 0.923 | 0.941 |

---

## Prerequisites

### Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| GPU VRAM | 6GB (RTX 2060) | 8GB+ (RTX 2070+) |
| RAM | 16GB | 32GB |
| Storage | 50GB | 100GB (SSD) |
| Network | Broadband | Broadband |

### Software Requirements

- Python 3.10+
- CUDA 11.8+ (for GPU training)
- Google Colab Pro (recommended for free GPU access)

---

## Dataset Preparation

### 1. Data Sources

ColonyAI uses a combination of data sources:

| Source | Images | Annotations | Purpose |
|--------|--------|-------------|---------|
| Custom labeled | 800+ | Manual | Lab-specific conditions |
| AGAR Dataset | 500+ | Public | Generalization |
| Roboflow augmentation | 6,000+ | Generated | Robustness |

### 2. Dataset Structure

```
datasets/colony_dataset/
├── data.yaml              # Dataset configuration
├── images/
│   ├── train/             # Training images (1,034)
│   ├── val/               # Validation images (295)
│   └── test/              # Test images (148)
└── labels/
    ├── train/             # YOLO format labels
    ├── val/
    └── test/
```

### 3. data.yaml Configuration

```yaml
train: datasets/colony_dataset/images/train
val: datasets/colony_dataset/images/val
test: datasets/colony_dataset/images/test

nc: 5
names:
  0: colony_single
  1: colony_merged
  2: bubble
  3: dust_debris
  4: media_crack
```

### 4. Label Format (YOLO)

Each `.txt` file contains one object per line:
```
<class_id> <x_center> <y_center> <width> <height>
```

All values are normalized to [0, 1].

**Example:**
```
0 0.512 0.483 0.045 0.038    # colony_single
0 0.623 0.512 0.041 0.035    # colony_single
2 0.334 0.289 0.028 0.025    # bubble
```

### 5. Class Reference

| ID | Class | Valid Colony? | Description |
|----|-------|---------------|-------------|
| 0 | colony_single | Yes | Individual, well-separated colony |
| 1 | colony_merged | Yes | Overlapping/touching colonies |
| 2 | bubble | No | Air bubble in media |
| 3 | dust_debris | No | Dust/debris particle |
| 4 | media_crack | No | Crack in agar surface |

### 6. Data Augmentation

Applied via Roboflow and Ultralytics built-in augmentation:

| Technique | Parameters | Purpose |
|-----------|------------|---------|
| Mosaic | 100% probability | Context mixing |
| Horizontal Flip | 50% probability | Mirror invariance |
| HSV Color Jitter | H: 0.015, S: 0.7, V: 0.4 | Lighting variation |
| Rotation | ±15° | Angle invariance |
| Scaling | ±50% | Size invariance |
| Translation | ±10% | Position invariance |
| Blur (Gaussian) | 2.5px | Focus variation |

**Effective dataset size after augmentation:** ~5,000+ unique samples per epoch

---

## Training on Google Colab

### 1. Setup Environment

```python
# Mount Google Drive
from google.colab import drive
drive.mount('/content/drive')

# Install dependencies
!pip install ultralytics roboflow opencv-python

# Navigate to project
%cd /content/drive/MyDrive/ColonyAI
```

### 2. Training Script

```python
from ultralytics import YOLO
import torch

# Verify GPU
print(f"GPU Available: {torch.cuda.is_available()}")
print(f"GPU Name: {torch.cuda.get_device_name(0)}")

# Set seed for reproducibility
import random
import numpy as np
SEED = 42
random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)
torch.cuda.manual_seed_all(SEED)

# Load pretrained model
model = YOLO('yolov8n.pt')  # or yolov8s.pt for better accuracy

# Train
results = model.train(
    data='datasets/colony_dataset/data.yaml',
    epochs=100,
    imgsz=640,  # Increased from 512 for better small colony detection
    batch=16,
    name='colony_detection_v1',
    device=0,
    patience=20,  # Early stopping
    save=True,
    save_period=10,
    cache=True,
    workers=4,

    # Optimizer
    optimizer='AdamW',
    lr0=0.001,
    lrf=0.01,
    momentum=0.937,
    weight_decay=0.0005,
    warmup_epochs=3,

    # Loss weights
    box=7.5,
    cls=0.5,
    dfl=1.5,

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
    copy_paste=0.1,
)
```

### 3. Training Logs

```
Epoch   GPU_mem  box_loss  cls_loss  dfl_loss  Instances  Size
  1/100   2.58G     0.892     1.234    0.987        156   640
 50/100   2.61G     0.445     0.678    0.523        189   640
100/100   2.59G     0.321     0.456    0.389        172   640
```

### Key Metrics to Monitor

| Metric | Target | Description |
|--------|--------|-------------|
| box_loss | Decreasing | Localization accuracy |
| cls_loss | Decreasing | Classification accuracy |
| mAP@0.5 | >0.90 | Detection accuracy at 50% IoU |
| mAP@0.5:0.95 | >0.75 | Strict detection accuracy |

### 4. Validation

```python
metrics = model.val()
print(f"mAP@0.5: {metrics.box.map50:.4f}")
print(f"mAP@0.5:0.95: {metrics.box.map:.4f}")
print(f"Precision: {metrics.box.mp:.4f}")
print(f"Recall: {metrics.box.mr:.4f}")
```

### 5. Save Results

```python
# Export training plots
model.val()  # Generates confusion matrix, PR curve, etc.
```

---

## Training on Local Machine

### 1. Install Dependencies

```bash
cd ml-training
pip install -r requirements.txt
```

### 2. Run Training

```bash
python train.py --mode full --epochs 100 --batch 16
```

### 3. Monitor with TensorBoard

```bash
tensorboard --logdir runs/detect
```

Open `http://localhost:6006` in your browser.

---

## Model Evaluation

### Confusion Matrix

```python
import matplotlib.pyplot as plt
from ultralytics.utils.plotting import plot_confusion_matrix

plot_confusion_matrix(model.val().confusion_matrix)
plt.savefig('confusion_matrix.png')
```

### Precision-Recall Curve

```python
from ultralytics.utils.plotting import plot_pr_curve
plot_pr_curve(model.val())
plt.savefig('pr_curve.png')
```

### Test on Sample Images

```python
results = model('test/sample_plate.jpg')
results[0].show()                         # Display
results[0].save(filename='result.jpg')    # Save
print(results[0].boxes.cls)               # Class IDs
print(results[0].boxes.conf)              # Confidence scores
print(results[0].boxes.xyxy)              # Bounding boxes
```

---

## Hyperparameter Tuning

### Using Ultralytics Tuner

```python
model.tune(
    data='datasets/colony_dataset/data.yaml',
    epochs=50,
    iterations=300,
    optimizer='AdamW',
    space={
        "lr0": (1e-4, 1e-2),
        "lrf": (0.01, 0.1),
        "momentum": (0.7, 0.98),
        "weight_decay": (1e-5, 1e-3),
        "box": (5.0, 10.0),
        "cls": (0.2, 1.0),
        "hsv_h": (0.0, 0.1),
        "hsv_s": (0.0, 0.9),
        "hsv_v": (0.0, 0.9),
        "degrees": (0.0, 45.0),
        "translate": (0.0, 0.5),
        "scale": (0.0, 0.9),
    }
)
```

---

## Model Export & Deployment

### 1. Export Formats

```python
model.export(format='pt')                 # PyTorch (default for validation)
model.export(format='onnx', opset=12)     # ONNX (cross-platform deployment)
model.export(format='engine')             # TensorRT (GPU inference optimization)
model.export(format='openvino')           # OpenVINO (Intel CPU optimization)
```

### 2. Deploy to Backend

```bash
# Copy best model to backend
cp runs/detect/colony_detection_v1/weights/best.pt backend/models/colony_best.pt
```

### 3. Update Backend Configuration

Edit `backend/.env`:
```env
MODEL_PATH=./models/colony_best.pt
MODEL_CONFIDENCE_THRESHOLD=0.60
MODEL_IOU_THRESHOLD=0.45
```

### 4. Test Inference via API

```bash
curl -X POST http://localhost:8000/api/v1/analyses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "image_id": "test-image-id",
    "sample_id": "TEST-001",
    "media_type": "PCA",
    "dilution_factor": 0.001,
    "plated_volume_ml": 1.0
  }'
```

---

## Performance Benchmarks

### Training Time

| GPU | VRAM | Epochs | Training Time | mAP@0.5 |
|-----|------|--------|---------------|---------|
| RTX 3090 | 24GB | 100 | ~2 hours | 0.92-0.94 |
| RTX 2070 | 8GB | 100 | ~4 hours | 0.91-0.93 |
| Colab T4 | 16GB | 100 | ~6 hours | 0.90-0.92 |
| Colab A100 | 40GB | 100 | ~1.5 hours | 0.93-0.95 |

### Inference Speed

| Hardware | Batch=1 (ms) | Batch=4 (ms) | FPS (batch=1) |
|----------|-------------|-------------|---------------|
| RTX 3090 | ~5 | ~18 | 200 |
| RTX 2070 | ~8 | ~28 | 125 |
| CPU (i7-12700K) | ~42 | ~156 | 24 |
| Colab T4 | ~12 | ~45 | 83 |
| Apple M2 | ~45 | ~160 | 22 |

---

## Common Issues

### Overfitting

**Symptoms:**
- Training mAP increasing but validation mAP decreasing
- Large gap between training and validation loss

**Solutions:**
- Increase augmentation intensity (mosaic, mixup)
- Add more training data (AGAR dataset)
- Use smaller model (yolov8n instead of yolov8s)
- Increase weight decay (0.0005 → 0.001)
- Enable early stopping with lower patience

### Underfitting

**Symptoms:**
- Both training and validation mAP low
- Loss values plateauing above expected levels

**Solutions:**
- Increase model size (yolov8n → yolov8s/m)
- Lower learning rate (1e-3 → 5e-4)
- Train for more epochs (100 → 200)
- Verify label format correctness
- Check dataset for corrupted images

### Poor Detection of Small Colonies

**Solutions:**
- Increase input resolution (640 → 800)
- Add more small colony examples to dataset
- Enable mosaic augmentation
- Use higher resolution training images
- Fine-tune anchor box sizes

### Too Many False Positives

**Solutions:**
- Increase confidence threshold during inference (0.60 → 0.70)
- Add more negative examples (clean plates, artifacts)
- Improve training data quality
- Tune NMS IoU threshold (0.45 → 0.50)
- Increase cls_loss weight in training

---

## Best Practices

1. **Start with pretrained weights** (yolov8n.pt) — never train from scratch
2. **Use early stopping** (patience=20) to prevent overfitting
3. **Save checkpoints** every 10 epochs for recovery
4. **Monitor validation metrics**, not training metrics
5. **Test on real laboratory images** before deployment (different lighting, cameras)
6. **Keep training logs** for reproducibility (MLflow recommended)
7. **Version your models** (v1.0, v1.1, etc.) with changelogs
8. **A/B test new models** against the current production model
9. **Freeze batch normalization** when fine-tuning on small datasets
10. **Use mixed precision training** (amp=True) for 2x speedup

---

## References

- Ultralytics YOLOv8 Documentation: https://docs.ultralytics.com
- AGAR Dataset: https://doi.org/10.1038/s41598-021-99300-z
- Roboflow: https://roboflow.com
- MLflow: https://mlflow.org

---

_Last Updated: July 2026 | Version: 2.0.0_
