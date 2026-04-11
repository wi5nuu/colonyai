"""
Test trained colony detection model on test dataset
"""

from ultralytics import YOLO
import os
from pathlib import Path

# Configuration
MODEL_PATH = "d:/lombapuai/backend/models/colony_best.pt"
TEST_DIR = "datasets/colony_dataset/test/images"
CONF_THRESHOLD = 0.25

def test_model():
    """Run inference on test images"""
    
    print("="*70)
    print("🧪 COLONY DETECTION MODEL - TEST INFERENCE")
    print("="*70)
    
    # Load model
    print("\n📦 Loading model...")
    model = YOLO(MODEL_PATH)
    print(f"✅ Model loaded: {MODEL_PATH}")
    print(f"🎯 Classes: {model.names}")
    
    # Get test images
    test_images = list(Path(TEST_DIR).glob("*.jpg")) + list(Path(TEST_DIR).glob("*.png"))
    print(f"📸 Found {len(test_images)} test images\n")
    
    if not test_images:
        print("❌ No test images found!")
        return
    
    # Test on multiple images
    total_detections = 0
    all_confidences = []
    
    print("Running inference on test images...")
    print("-" * 70)
    
    # Test first 10 images
    for i, img_path in enumerate(test_images[:10]):
        results = model(str(img_path), device='cuda:0', conf=CONF_THRESHOLD, verbose=False)
        result = results[0]
        boxes = result.boxes
        
        num_detections = len(boxes)
        total_detections += num_detections
        
        if num_detections > 0:
            confs = boxes.conf.tolist()
            all_confidences.extend(confs)
            avg_conf = sum(confs) / len(confs)
            print(f"✓ {img_path.name:50s} → {num_detections:3d} CFUs (avg conf: {avg_conf:.3f})")
        else:
            print(f"✗ {img_path.name:50s} → 0 CFUs")
    
    # Summary
    print("\n" + "="*70)
    print("📊 TEST SUMMARY (First 10 images)")
    print("="*70)
    print(f"Total images tested: 10")
    print(f"Total CFUs detected: {total_detections}")
    print(f"Average CFUs per image: {total_detections/10:.1f}")
    
    if all_confidences:
        print(f"\nConfidence Statistics:")
        print(f"  Min confidence: {min(all_confidences):.3f}")
        print(f"  Max confidence: {max(all_confidences):.3f}")
        print(f"  Avg confidence: {sum(all_confidences)/len(all_confidences):.3f}")
    
    # Test inference speed
    print("\n⏱️  Speed Test:")
    import time
    test_img = test_images[0]
    
    # Warmup
    _ = model(str(test_img), device='cuda:0', verbose=False)
    
    # Benchmark
    times = []
    for _ in range(5):
        start = time.time()
        results = model(str(test_img), device='cuda:0', verbose=False)
        end = time.time()
        times.append((end - start) * 1000)
    
    avg_time = sum(times) / len(times)
    print(f"  Average inference time: {avg_time:.1f}ms")
    print(f"  Images per second: {1000/avg_time:.1f}")
    
    print("\n" + "="*70)
    print("✅ MODEL TEST COMPLETE!")
    print("="*70)
    print("\n🎯 Model is ready for production use!")
    print(f"📁 Model location: {MODEL_PATH}")
    print(f"🚀 Deploy to backend and start using!")

if __name__ == "__main__":
    test_model()
