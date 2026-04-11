# ColonyAI Model Training Guide

## Overview

This guide covers training the YOLOv8 colony detection model for ColonyAI.

## Prerequisites

- GPU with at least 8GB VRAM (NVIDIA RTX 2070 or better)
- Python 3.10+
- 50GB+ disk space for dataset
- Google Colab Pro (recommended for free GPU access)

## Dataset Preparation

### 1. Download AGAR Dataset

```bash
# Download from Macquarie University
wget https://doi.org/10.1038/s41598-021-99300-z

# Or use Roboflow
from roboflow import Roboflow
rf = Roboflow(api_key="YOUR_API_KEY")
project = rf.workspace("your-workspace").project("colony-detection")
dataset = project.version(1).download("yolov8")
```

### 2. Dataset Structure

```
datasets/colony_dataset/
├── data.yaml
├── images/
│   ├── train/
│   │   ├── img001.jpg
│   │   ├── img002.jpg
│   │   └── ...
│   ├── val/
│   │   ├── img100.jpg
│   │   └── ...
│   └── test/
│       └── ...
└── labels/
    ├── train/
    │   ├── img001.txt
    │   ├── img002.txt
    │   └── ...
    ├── val/
    │   └── ...
    └── test/
        └── ...
```

### 3. Label Format (YOLO)

Each `.txt` file contains one object per line:
```
class_id x_center y_center width height
```

All values are normalized (0-1).

Example:
```
0 0.512 0.483 0.045 0.038
0 0.623 0.512 0.041 0.035
2 0.334 0.289 0.028 0.025
```

Class IDs:
- 0: colony_single
- 1: colony_merged
- 2: bubble
- 3: dust_debris
- 4: media_crack

### 4. Data Augmentation

Use Roboflow for augmentation:

```python
from roboflow import Roboflow

rf = Roboflow(api_key="YOUR_API_KEY")
workspace = rf.workspace("your-workspace")
project = workspace.project("colony-detection")

# Upload images
project.upload("path/to/image.jpg")

# Apply augmentations
# - Random rotation: ±15°
# - Flip: horizontal and vertical
# - Brightness: ±25%
# - Exposure: ±20%
# - Blur: Gaussian
# - Mosaic: 50% probability
```

Expected dataset size after augmentation: 54,000+ images

## Training on Google Colab

### 1. Setup Colab

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

# Load pretrained model
model = YOLO('yolov8n.pt')  # or yolov8s.pt for better accuracy

# Train
results = model.train(
    data='datasets/colony_dataset/data.yaml',
    epochs=100,
    imgsz=512,
    batch=16,
    name='colony_detection_v1',
    device=0,  # GPU 0
    patience=20,  # Early stopping
    save=True,
    save_period=10,  # Save checkpoint every 10 epochs
    cache=True,  # Cache images in RAM
    workers=4,
    
    # Hyperparameters
    optimizer='Adam',
    lr0=0.001,
    lrf=0.01,
    momentum=0.937,
    weight_decay=0.0005,
    
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
)
```

### 3. Monitor Training

Training metrics are logged every epoch:

```
Epoch  GPU_mem  box_loss  cls_loss  dfl_loss  Instances  Size
1/100    2.58G     0.892     1.234    0.987        156   512
...
```

Key metrics to watch:
- **box_loss**: Should decrease over time
- **cls_loss**: Classification loss
- **dfl_loss**: Distribution Focal Loss
- **mAP@0.5**: Should increase (target > 0.90)
- **mAP@0.5:0.95**: More strict metric (target > 0.75)

### 4. Validation

```python
# Validate trained model
metrics = model.val()

print(f"mAP@0.5: {metrics.box.map50:.4f}")
print(f"mAP@0.5:0.95: {metrics.box.map:.4f}")
print(f"Precision: {metrics.box.mp:.4f}")
print(f"Recall: {metrics.box.mr:.4f}")
```

### 5. Export Model

```python
# Export to multiple formats
model.export(format='pt')  # PyTorch
model.export(format='onnx', opset=12)  # ONNX (for deployment)
model.export(format='engine')  # TensorRT (for GPU inference)
```

## Training on Local Machine

### 1. Install Dependencies

```bash
cd ml-training
pip install -r requirements.txt
```

### 2. Run Training

```bash
python train.py
```

### 3. Monitor with TensorBoard

```bash
tensorboard --logdir runs/detect
```

Open http://localhost:6006 in browser

## Model Evaluation

### Confusion Matrix

```python
import matplotlib.pyplot as plt
from ultralytics.utils.plotting import plot_confusion_matrix

# Plot confusion matrix
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
# Test inference
results = model('test/sample_plate.jpg')

# Show results
results[0].show()

# Save annotated image
results[0].save(filename='annotated_result.jpg')
```

## Hyperparameter Tuning

### Using Ultralytics Tuner

```python
model.tune(
    data='datasets/colony_dataset/data.yaml',
    epochs=50,
    iterations=300,
    optimizer='Adam',
    space={
        "lr0": (1e-4, 1e-2),
        "lrf": (0.01, 0.1),
        "momentum": (0.6, 0.98),
        "weight_decay": (1e-5, 1e-3),
        "hsv_h": (0.0, 0.1),
        "hsv_s": (0.0, 0.9),
        "hsv_v": (0.0, 0.9),
        "degrees": (0.0, 45.0),
        "translate": (0.0, 0.9),
        "scale": (0.0, 0.9),
        "shear": (0.0, 10.0),
        "mosaic": (0.0, 1.0),
    }
)
```

## Common Issues

### Issue: Overfitting

**Symptoms**:
- Training mAP increasing but validation mAP decreasing
- High training accuracy, low validation accuracy

**Solutions**:
- Increase augmentation intensity
- Add more training data
- Use smaller model (YOLOv8n instead of YOLOv8s)
- Increase weight decay
- Enable early stopping

### Issue: Underfitting

**Symptoms**:
- Both training and validation mAP low
- Loss not decreasing

**Solutions**:
- Increase model size
- Lower learning rate
- Train for more epochs
- Check label format
- Verify dataset quality

### Issue: Poor Detection of Small Colonies

**Solutions**:
- Increase image resolution (imgsz=640 or 768)
- Add more small colony examples to dataset
- Adjust anchor box sizes
- Use mosaic augmentation

### Issue: Too Many False Positives

**Solutions**:
- Increase confidence threshold during inference
- Add more negative examples (artifacts) to dataset
- Improve data quality
- Tune NMS IoU threshold

## Model Deployment

### 1. Move to Backend

```bash
# Copy best model to backend
cp runs/detect/colony_detection_v1/weights/best.pt backend/models/colony_best.pt
```

### 2. Update Backend Config

Edit `backend/.env`:
```
MODEL_PATH=./models/colony_best.pt
MODEL_CONFIDENCE_THRESHOLD=0.60
MODEL_IOU_THRESHOLD=0.45
```

### 3. Test in Production Mode

```bash
cd backend
uvicorn main:app --reload

# Test inference via API
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

## Performance Benchmarks

### Expected Training Times

| GPU | Epochs | Time | mAP@0.5 |
|-----|--------|------|---------|
| RTX 3090 | 100 | ~2 hours | 0.92-0.94 |
| RTX 2070 | 100 | ~4 hours | 0.91-0.93 |
| Colab T4 | 100 | ~6 hours | 0.90-0.92 |
| Colab P100 | 100 | ~3 hours | 0.91-0.93 |

### Inference Speed

| Hardware | Time per Image |
|----------|----------------|
| RTX 3090 | ~50 ms |
| RTX 2070 | ~80 ms |
| CPU (i7) | ~500 ms |
| Colab T4 | ~100 ms |

## Best Practices

1. **Always start with pretrained weights**
2. **Use early stopping** (patience=20)
3. **Save checkpoints** every 10 epochs
4. **Monitor validation metrics** not training metrics
5. **Test on real laboratory images** before deployment
6. **Keep training logs** for reproducibility
7. **Version your models** (v1, v2, etc.)
8. **A/B test new models** before replacing production

## References

- Ultralytics YOLOv8 Docs: https://docs.ultralytics.com
- AGAR Dataset: https://doi.org/10.1038/s41598-021-99300-z
- Roboflow: https://roboflow.com

---

**Happy Training! 🎯**
