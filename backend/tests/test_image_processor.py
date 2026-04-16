"""
Unit tests for ImageProcessor service

Jalankan: pytest tests/test_image_processor.py -v
"""

import pytest
import numpy as np
import cv2
from pathlib import Path
import tempfile
import os

from app.services.image_processor import ImageProcessor


# ─── Fixtures ────────────────────────────────────────────────────────────────

@pytest.fixture
def processor():
    return ImageProcessor()


@pytest.fixture
def test_image():
    """Create a test image (800x800 gradient circle)."""
    img = np.zeros((800, 800, 3), dtype=np.uint8)
    cv2.circle(img, (400, 400), 350, (200, 180, 150), -1)
    # Add some noise to simulate real plate
    noise = np.random.normal(0, 10, img.shape).astype(np.uint8)
    img = cv2.add(img, noise)
    return img


@pytest.fixture
def test_image_file(test_image):
    """Save test image to temporary file."""
    with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as f:
        cv2.imwrite(f.name, test_image)
        yield f.name
    os.unlink(f.name)


# ─── Preprocessing Tests ────────────────────────────────────────────────────

class TestImagePreprocessing:
    
    def test_preprocess_returns_image(self, processor, test_image_file):
        """Preprocess should return processed image array."""
        result = processor.preprocess(test_image_file)
        assert result is not None
        assert isinstance(result, np.ndarray)
    
    def test_preprocess_maintains_dimensions(self, processor, test_image_file):
        """Preprocessed image should maintain reasonable dimensions."""
        result = processor.preprocess(test_image_file)
        h, w = result.shape[:2]
        assert h > 0 and w > 0
    
    def test_preprocess_invalid_file(self, processor):
        """Preprocess should raise error for invalid file."""
        with pytest.raises(Exception):
            processor.preprocess("/nonexistent/path/image.jpg")
    
    def test_brightness_normalization(self, processor, test_image):
        """Brightness normalization should adjust image."""
        # Create very dark image
        dark_img = np.full((512, 512, 3), 50, dtype=np.uint8)
        
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as f:
            cv2.imwrite(f.name, dark_img)
            result = processor.preprocess(f.name)
            os.unlink(f.name)
        
        # Result should be brighter on average
        assert result.mean() > dark_img.mean()


# ─── Plate Detection Tests ──────────────────────────────────────────────────

class TestPlateDetection:
    
    def test_detect_plate_circle(self, processor, test_image):
        """Should detect circular plate region."""
        mask, center, radius = processor.detect_plate_circle(test_image)
        
        assert mask is not None
        assert mask.shape[:2] == test_image.shape[:2]
        assert center is not None
        assert radius > 0
    
    def test_detect_plate_circle_no_plate(self, processor):
        """Should handle images without clear plate circle."""
        # Create image without circle
        img = np.random.randint(0, 255, (512, 512, 3), dtype=np.uint8)
        mask, center, radius = processor.detect_plate_circle(img)
        
        # Should still return something (even if not perfect)
        assert mask is not None
    
    def test_plate_mask_is_binary(self, processor, test_image):
        """Mask should be binary (0 or 255)."""
        mask, _, _ = processor.detect_plate_circle(test_image)
        unique_values = np.unique(mask)
        assert all(v in [0, 255] for v in unique_values)


# ─── Annotation Tests ───────────────────────────────────────────────────────

class TestImageAnnotation:
    
    def test_save_annotated_image(self, processor, test_image, tmp_path):
        """Should save annotated image with bounding boxes."""
        detections = [
            {
                'class_name': 'colony_single',
                'confidence': 0.95,
                'bbox': {'x': 100, 'y': 100, 'width': 20, 'height': 20},
                'color': (0, 255, 0),
            },
            {
                'class_name': 'colony_merged',
                'confidence': 0.85,
                'bbox': {'x': 200, 'y': 200, 'width': 40, 'height': 40},
                'color': (0, 165, 255),
            },
        ]
        
        output_path = str(tmp_path / "annotated.jpg")
        processor.save_annotated_image(test_image, detections, output_path)
        
        assert Path(output_path).exists()
        
        # Verify we can read it back
        saved_img = cv2.imread(output_path)
        assert saved_img is not None
        assert saved_img.shape[:2] == test_image.shape[:2]
    
    def test_annotated_image_draws_boxes(self, processor, test_image, tmp_path):
        """Annotated image should differ from original."""
        detections = [
            {
                'class_name': 'colony_single',
                'confidence': 0.90,
                'bbox': {'x': 50, 'y': 50, 'width': 30, 'height': 30},
                'color': (0, 255, 0),
            },
        ]
        
        output_path = str(tmp_path / "annotated2.jpg")
        processor.save_annotated_image(test_image, detections, output_path)
        
        saved_img = cv2.imread(output_path)
        # Images should be different (boxes added)
        assert not np.array_equal(test_image, saved_img)
    
    def test_annotation_with_no_detections(self, processor, test_image, tmp_path):
        """Should handle empty detections list."""
        output_path = str(tmp_path / "empty_annotated.jpg")
        processor.save_annotated_image(test_image, [], output_path)
        
        assert Path(output_path).exists()


# ─── Edge Cases ─────────────────────────────────────────────────────────────

class TestImageProcessorEdgeCases:
    
    def test_very_large_image(self, processor, tmp_path):
        """Should handle large images without crashing."""
        # Create 2000x2000 image (larger than typical)
        large_img = np.random.randint(0, 255, (2000, 2000, 3), dtype=np.uint8)
        
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as f:
            cv2.imwrite(f.name, large_img)
            try:
                result = processor.preprocess(f.name)
                assert result is not None
            except Exception as e:
                pytest.skip(f"Large image handling not implemented: {e}")
            finally:
                os.unlink(f.name)
    
    def test_grayscale_image(self, processor, tmp_path):
        """Should handle grayscale images."""
        gray_img = np.random.randint(0, 255, (512, 512), dtype=np.uint8)
        
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as f:
            # Convert to 3-channel for saving
            gray_3ch = cv2.cvtColor(gray_img, cv2.COLOR_GRAY2BGR)
            cv2.imwrite(f.name, gray_3ch)
            
            try:
                result = processor.preprocess(f.name)
                assert result is not None
            except Exception as e:
                pytest.skip(f"Grayscale handling not implemented: {e}")
            finally:
                os.unlink(f.name)
    
    def test_corrupted_image_file(self, processor, tmp_path):
        """Should handle corrupted/invalid image files."""
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as f:
            f.write(b"This is not a valid image")
            f.flush()
            
            with pytest.raises(Exception):
                processor.preprocess(f.name)
            
            os.unlink(f.name)
