# ColonyAI — ML Training Pipeline

## Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Verify dataset
python train.py --mode verify --data /path/to/dataset

# 3. Fine-tune colony model on new dataset
python train.py --mode full \
  --data /path/to/dataset \
  --model ../backend/models/colony_best.pt \
  --epochs 50 \
  --batch 32 \
  --imgsz 640

# 4. Evaluate
python train.py --mode evaluate \
  --data /path/to/dataset \
  --model runs/detect/colony_*/weights/best.pt

# 5. Export ONNX
# (auto-exported after training)
```

## Dataset Format Support

- YOLO `.txt` (native)
- COCO JSON (auto-converted)
- Pascal VOC XML (auto-converted)

## Fine-tuning Strategy

Always start from `colony_best.pt` (not `yolov8n.pt`) for faster convergence and better accuracy on new colony data.
