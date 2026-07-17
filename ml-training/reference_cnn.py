"""
==========================================================================
REFERENCE CNN — AI Open 2026 Workshop Implementation
==========================================================================
This file mirrors the workshop's SimpleCNN + benchmark_hardware() code,
adapted for ColonyAI's colony detection context.

It serves as:
1. A learning reference connecting workshop theory to ColonyAI practice
2. A standalone GPU benchmark utility
3. Proof of CNN concept for competition documentation

Workshop concepts demonstrated:
  - Conv2d: kernel_size, padding (same/valid)
  - Stride 1 vs Stride 2 (via MaxPool2d)
  - ReLU activation, MaxPool2d downsampling
  - Flatten → Fully Connected classifier
  - CrossEntropyLoss + Adam optimizer
  - CPU vs GPU throughput benchmarking
  - Training/Testing loop with loss tracking
  - Classification report (precision, recall, f1-score)

Usage:
    python ml-training/reference_cnn.py

Dependencies:
    pip install torch torchvision matplotlib scikit-learn
==========================================================================
"""

import time
import matplotlib.pyplot as plt
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
from sklearn.metrics import accuracy_score, classification_report


# ===========================================================
# 1. HYPERPARAMETERS
# ===========================================================
NUM_CLASSES = 5               # colony_single, colony_merged, bubble, dust_debris, media_crack
BATCH_SIZE = 64
EPOCHS = 500
LEARNING_RATE = 1e-6          # Workshop default; for real training, use 1e-3 to 1e-4

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}\n")


# ===========================================================
# 2. SIMPLECNN — Workshop model adapted for ColonyAI
# ===========================================================
class SimpleCNN(nn.Module):
    """
    The exact SimpleCNN from the AI Open 2026 workshop.

    Architecture:
        Conv2d(3→16, 3×3, pad=1) → ReLU → MaxPool(2,2)  [32×32 → 16×16]
        Conv2d(16→32, 3×3, pad=1) → ReLU → MaxPool(2,2) [16×16 → 8×8]
        Flatten → Linear(2048→128) → ReLU → Linear(128→5)

    Why this works for colony counting (conceptually):
        - First Conv layer detects basic colony features (circular edges, color)
        - First MaxPool reduces noise while preserving strong features
        - Second Conv layer detects higher-level patterns (merged colonies, bubbles)
        - Second MaxPool further compresses
        - FC layers map learned features to colony class predictions

    Limitation vs YOLOv8:
        - This is an IMAGE-LEVEL classifier (one prediction per image)
        - YOLOv8 is an OBJECT DETECTOR (multiple predictions per image)
        - SimpleCNN cannot count individual colonies — only classify plate type
    """
    def __init__(self, num_classes):
        super(SimpleCNN, self).__init__()

        self.features = nn.Sequential(
            nn.Conv2d(3, 16, kernel_size=3, padding=1),   # workshop: padding same
            nn.ReLU(),
            nn.MaxPool2d(2, 2),                            # workshop: stride 2 (downsample)
            nn.Conv2d(16, 32, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),
        )

        self.classifier = nn.Sequential(
            nn.Linear(32 * 8 * 8, 128),                   # workshop: flatten → FC
            nn.ReLU(),
            nn.Linear(128, num_classes),
        )

    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)                         # workshop: flatten
        x = self.classifier(x)
        return x


# ===========================================================
# 3. HARDWARE BENCHMARK — CPU vs GPU throughput
# ===========================================================
def benchmark_hardware(model, loader):
    """
    Benchmark from the AI Open 2026 workshop.
    Measures throughput (images/sec) on CPU and GPU.

    For ColonyAI's YOLOv8 model, expected throughput:
        - CPU (Intel i7):      ~5-10 img/s  (colony_best_new.pt)
        - GPU (RTX 3050):      ~30-50 img/s
        - GPU (RTX 5050):      ~50-80 img/s
        - Deka Notebook GPU:   TBD (expected 40-70 img/s)
    """
    devices_to_test = ['cpu']
    if torch.cuda.is_available():
        devices_to_test.append('cuda')

    results = {}

    for dev_name in devices_to_test:
        dev = torch.device(dev_name)
        bench_model = model.to(dev)
        bench_model.eval()

        dummy_input = torch.randn(BATCH_SIZE, 3, 32, 32).to(dev)
        for _ in range(5):
            _ = bench_model(dummy_input)
        if dev_name == 'cuda':
            torch.cuda.synchronize()

        start_time = time.time()
        total_images = 0

        with torch.no_grad():
            for images, _ in loader:
                images = images.to(dev)
                _ = bench_model(images)
                total_images += images.size(0)
                if total_images > 1000:
                    break

            if dev_name == 'cuda':
                torch.cuda.synchronize()

        elapsed = time.time() - start_time
        throughput = total_images / elapsed
        results[dev_name.upper()] = {
            'images': total_images,
            'elapsed_sec': round(elapsed, 4),
            'throughput': round(throughput, 2),
        }
        print(f"[{dev_name.upper()}] Processed {total_images} images in "
              f"{elapsed:.4f}s | Throughput: {throughput:.2f} images/sec")

    print("-" * 60)
    return results


# ===========================================================
# 4. SIMULATED COLONY DATASET
# ===========================================================
# In a real scenario, replace with actual colony images:
#   train_loader = DataLoader(ImageFolder("datasets/colony_dataset/train"), ...)
#   test_loader  = DataLoader(ImageFolder("datasets/colony_dataset/test"), ...)
#
# For workshop purposes, we use synthetic data matching the 5 colony classes.
# Each "image" is 32×32 RGB — enough to demonstrate CNN mechanics.

NUM_SAMPLES = {
    'train': 1000,
    'test': 200,
}

# Generate synthetic colony-like patterns (simplified)
np.random.seed(42)
torch.manual_seed(42)

dummy_train_x = torch.randn(NUM_SAMPLES['train'], 3, 32, 32)
dummy_train_y = torch.randint(0, NUM_CLASSES, (NUM_SAMPLES['train'],))
dummy_test_x = torch.randn(NUM_SAMPLES['test'], 3, 32, 32)
dummy_test_y = torch.randint(0, NUM_CLASSES, (NUM_SAMPLES['test'],))

train_loader = DataLoader(
    TensorDataset(dummy_train_x, dummy_train_y),
    batch_size=BATCH_SIZE,
    shuffle=True,
)
test_loader = DataLoader(
    TensorDataset(dummy_test_x, dummy_test_y),
    batch_size=BATCH_SIZE,
    shuffle=False,
)


# ===========================================================
# 5. RUN BENCHMARK
# ===========================================================
print("")
print("=" * 60)
print("  AI OPEN 2026 — HARDWARE BENCHMARK (SimpleCNN)")
print("=" * 60)
print("")

model_ref = SimpleCNN(NUM_CLASSES)
benchmark_results = benchmark_hardware(model_ref, train_loader)

# Show comparison if both CPU and GPU were tested
if 'CUDA' in benchmark_results:
    cpu_speed = benchmark_results['CPU']['throughput']
    gpu_speed = benchmark_results['CUDA']['throughput']
    speedup = gpu_speed / cpu_speed
    print(f"  🚀 GPU Speedup: {speedup:.2f}x faster than CPU")
    print("  (This gap widens for YOLOv8 since it's a much larger model)")
    print("")


# ===========================================================
# 6. FULL TRAINING
# ===========================================================
print("=" * 60)
print("  TRAINING: SimpleCNN on Simulated Colony Data")
print("=" * 60)
print("")

model = SimpleCNN(NUM_CLASSES).to(device)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)

history = {
    'train_loss': [],
    'test_loss': [],
    'train_acc': [],
    'test_acc': [],
}

for epoch in range(EPOCHS):
    # Training
    model.train()
    running_loss, correct, total = 0.0, 0, 0
    for images, labels in train_loader:
        images, labels = images.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * images.size(0)
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()

    train_loss = running_loss / len(train_loader.dataset)
    train_acc = correct / total

    # Testing
    model.eval()
    running_test_loss, test_correct, test_total = 0.0, 0, 0
    with torch.no_grad():
        for images, labels in test_loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)

            running_test_loss += loss.item() * images.size(0)
            _, predicted = outputs.max(1)
            test_total += labels.size(0)
            test_correct += predicted.eq(labels).sum().item()

    test_loss = running_test_loss / len(test_loader.dataset)
    test_acc = test_correct / test_total

    history['train_loss'].append(train_loss)
    history['test_loss'].append(test_loss)
    history['train_acc'].append(train_acc)
    history['test_acc'].append(test_acc)

    if epoch % 50 == 0:
        print(f"Epoch {epoch+1}/{EPOCHS} | Train Loss: {train_loss:.4f} | "
              f"Train Acc: {train_acc*100:.1f}% | "
              f"Test Loss: {test_loss:.4f} | Test Acc: {test_acc*100:.1f}%")

print("-" * 60)
print("")


# ===========================================================
# 7. FINAL EVALUATION
# ===========================================================
model.eval()
all_preds = []
all_labels = []
with torch.no_grad():
    for images, labels in test_loader:
        images = images.to(device)
        outputs = model(images)
        _, predicted = outputs.max(1)
        all_preds.extend(predicted.cpu().numpy())
        all_labels.extend(labels.numpy())

class_names = ["colony_single", "colony_merged", "bubble", "dust_debris", "media_crack"]
print("Final Classification Report:")
print(classification_report(all_labels, all_preds, target_names=class_names))
print("")


# ===========================================================
# 8. VISUALIZATION
# ===========================================================
plt.figure(figsize=(12, 4))

plt.subplot(1, 2, 1)
plt.plot(history['train_loss'], label='Train Loss')
plt.plot(history['test_loss'], label='Test Loss')
plt.title('Loss Over Epochs')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()

plt.subplot(1, 2, 2)
plt.plot(history['train_acc'], label='Train Accuracy')
plt.plot(history['test_acc'], label='Test Accuracy')
plt.title('Accuracy Over Epochs')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.legend()

plt.tight_layout()
plt.savefig('training_curve.png')
print("Training curve saved to training_curve.png")
print("")


# ===========================================================
# 9. SUMMARY: WORKSHOP TO COLONYAI
# ===========================================================
print("=" * 60)
print("  WORKSHOP THEORY → COLONYAI IMPLEMENTATION")
print("=" * 60)
print("""
| Workshop Concept        | This SimpleCNN              | ColonyAI YOLOv8n          |
|-------------------------|-----------------------------|---------------------------|
| Input size              | 32×32 RGB                   | 640×640 RGB               |
| Kernel                  | 3×3 (fixed)                 | 3×3 + 1×1 (CSPDarknet)    |
| Padding                 | Same (pad=1)                | Same + valid (varied)     |
| Stride 1                | Conv layers                  | Backbone conv layers       |
| Stride 2 (downsample)   | MaxPool2d(2,2)              | Stride-2 Conv (learnable)  |
| Feature extractor       | 2 Conv blocks                | CSPDarknet (~53 layers)   |
| Neck/Head               | N/A (direct FC)             | PANet + Decoupled Head     |
| Activation              | ReLU                         | SiLU (smoother gradient)   |
| Output                  | 1 class per image           | Bounding boxes + classes   |
| Loss function           | CrossEntropyLoss            | CIoU + BCE + DFL combined  |
| Use case                | Classify plate type         | Count individual colonies  |
""")
print("-" * 60)
print("When the Grand Final dataset arrives, run:")
print("  python ml-training/train.py       # Auto-detects YOLO/COCO/Pascal VOC")
print("  python ml-training/calibrate.py   # Optimal per-class thresholds")
print("  # Then upload + activate via API at /api/v1/admin/models/upload")
print("=" * 60)
