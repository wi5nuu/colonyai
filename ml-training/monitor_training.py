"""
ColonyAI - Training Progress Monitor
Monitors training in real-time and displays progress
"""

import time
from pathlib import Path
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
from IPython.display import display, clear_output
import os

def monitor_training(run_dir="runs/detect/colony_detection"):
    """
    Monitor training progress by checking results.png and logs
    Run this in a separate terminal while training is running
    """
    
    run_path = Path(run_dir)
    results_img = run_path / "results.png"
    log_file = run_path / "log.txt"
    
    print("="*70)
    print("📊 COLONYAI TRAINING MONITOR")
    print("="*70)
    print(f"\nMonitoring: {run_path}")
    print("Press Ctrl+C to stop monitoring\n")
    
    last_size = 0
    
    while True:
        try:
            # Check if results image exists
            if results_img.exists():
                current_size = results_img.stat().st_size
                
                # Only update if file changed
                if current_size != last_size:
                    clear_output(wait=True)
                    
                    print("="*70)
                    print("📊 TRAINING PROGRESS")
                    print("="*70)
                    
                    # Display results image
                    img = mpimg.imread(str(results_img))
                    plt.figure(figsize=(15, 10))
                    plt.imshow(img)
                    plt.axis('off')
                    plt.tight_layout()
                    plt.show()
                    
                    # Show latest log entries
                    if log_file.exists():
                        print("\n📝 Latest Training Log:")
                        print("-" * 70)
                        with open(log_file, 'r') as f:
                            lines = f.readlines()
                            # Show last 20 lines
                            for line in lines[-20:]:
                                print(line.strip())
                    
                    last_size = current_size
                    print("\n" + "="*70)
                    print("⏳ Waiting for updates... (Ctrl+C to stop)")
                    print("="*70)
            
            # Check every 10 seconds
            time.sleep(10)
            
        except KeyboardInterrupt:
            print("\n\n✅ Monitoring stopped")
            break
        except Exception as e:
            print(f"\n⚠️  Error: {e}")
            time.sleep(5)


def show_final_results(run_dir="runs/detect/colony_detection"):
    """Show final training results"""
    
    run_path = Path(run_dir)
    
    print("="*70)
    print("🏆 FINAL TRAINING RESULTS")
    print("="*70)
    
    # Check for results image
    results_img = run_path / "results.png"
    if results_img.exists():
        img = mpimg.imread(str(results_img))
        plt.figure(figsize=(20, 15))
        plt.imshow(img)
        plt.axis('off')
        plt.tight_layout()
        plt.show()
    else:
        print("❌ results.png not found")
    
    # Check for model files
    weights_dir = run_path / "weights"
    if weights_dir.exists():
        print("\n📦 Trained Models:")
        for model_file in weights_dir.glob("*.pt"):
            size_mb = model_file.stat().st_size / (1024 * 1024)
            print(f"   ✅ {model_file.name} ({size_mb:.1f} MB)")
    
    # Check for confusion matrix
    conf_matrix = run_path / "confusion_matrix.png"
    if conf_matrix.exists():
        print("\n🎯 Confusion Matrix:")
        img = mpimg.imread(str(conf_matrix))
        plt.figure(figsize=(10, 8))
        plt.imshow(img)
        plt.axis('off')
        plt.tight_layout()
        plt.show()
    
    # Check for F1 curve
    f1_curve = run_path / "F1_curve.png"
    if f1_curve.exists():
        print("\n📈 F1 Score Curve:")
        img = mpimg.imread(str(f1_curve))
        plt.figure(figsize=(10, 8))
        plt.imshow(img)
        plt.axis('off')
        plt.tight_layout()
        plt.show()
    
    print("\n" + "="*70)
    print("✅ Results displayed successfully!")
    print("="*70)


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "results":
        show_final_results()
    else:
        monitor_training()
