import cv2
import numpy as np
import os
from pathlib import Path
import glob

class DomainShiftAugmenter:
    """
    Offline data augmentation pipeline to mitigate Domain Shift between
    AGAR dataset (Macquarie University, Australia) and typical Lab Indonesia conditions.
    
    Issues addressed (BUG-013):
    - Fluorescent vs LED vs Natural lighting
    - Entry-level smartphone camera artifacts
    - Media brand color variations
    """
    def __init__(self, output_dir: str):
        self.output_dir = output_dir
        Path(self.output_dir).mkdir(parents=True, exist_ok=True)
        
    def _apply_clahe(self, image: np.ndarray, clip_limit: float = 2.0) -> np.ndarray:
        """Apply Contrast Limited Adaptive Histogram Equalization to simulate varying lab lighting"""
        lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        limg = cv2.merge((cl, a, b))
        return cv2.cvtColor(limg, cv2.COLOR_LAB2RGB)

    def _simulate_smartphone_noise(self, image: np.ndarray) -> np.ndarray:
        """Simulate entry-level smartphone camera ISO noise common in field labs"""
        row, col, ch = image.shape
        mean = 0
        var = 0.01 * 255
        sigma = var ** 0.5
        gauss = np.random.normal(mean, sigma, (row, col, ch))
        noisy = image + gauss
        noisy = np.clip(noisy, 0, 255).astype(np.uint8)
        return noisy

    def _adjust_color_temperature(self, image: np.ndarray, temperature_offset: int) -> np.ndarray:
        """Simulate different fluorescent/LED room lighting colors"""
        # Simple color temperature shift by adjusting Red/Blue channels
        adjusted = image.astype(np.int32)
        adjusted[:, :, 0] += temperature_offset  # R
        adjusted[:, :, 2] -= temperature_offset  # B
        return np.clip(adjusted, 0, 255).astype(np.uint8)

    def augment_dataset(self, input_dir: str):
        """Process all images in input directory and apply domain-shift augmentations"""
        extensions = ('*.jpg', '*.jpeg', '*.png')
        image_paths = []
        for ext in extensions:
            image_paths.extend(glob.glob(os.path.join(input_dir, ext)))
            
        print(f"Found {len(image_paths)} images to augment.")
        
        for p in image_paths:
            filename = os.path.basename(p)
            name, ext = os.path.splitext(filename)
            
            img = cv2.imread(p)
            if img is None:
                continue
                
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # 1. Base CLAHE (normalization)
            norm_img = self._apply_clahe(img_rgb)
            cv2.imwrite(os.path.join(self.output_dir, f"{name}_norm{ext}"), cv2.cvtColor(norm_img, cv2.COLOR_RGB2BGR))
            
            # 2. Add noise
            noisy_img = self._simulate_smartphone_noise(img_rgb)
            cv2.imwrite(os.path.join(self.output_dir, f"{name}_noisy{ext}"), cv2.cvtColor(noisy_img, cv2.COLOR_RGB2BGR))
            
            # 3. Alter color temperature (Warm - Fluorescent)
            warm_img = self._adjust_color_temperature(img_rgb, 15)
            cv2.imwrite(os.path.join(self.output_dir, f"{name}_warm{ext}"), cv2.cvtColor(warm_img, cv2.COLOR_RGB2BGR))
            
            # 4. Alter color temperature (Cool - LED)
            cool_img = self._adjust_color_temperature(img_rgb, -15)
            cv2.imwrite(os.path.join(self.output_dir, f"{name}_cool{ext}"), cv2.cvtColor(cool_img, cv2.COLOR_RGB2BGR))

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Domain Shift Augmentation Pipeline")
    parser.add_argument("--input", type=str, required=True, help="Input directory containing AGAR validation images")
    parser.add_argument("--output", type=str, required=True, help="Output directory for augmented images")
    args = parser.parse_args()
    
    augmenter = DomainShiftAugmenter(args.output)
    augmenter.augment_dataset(args.input)
    print("Augmentation completed successfully.")
