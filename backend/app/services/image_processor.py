import cv2
import numpy as np
from PIL import Image
import io
from typing import Tuple


class ImageProcessor:
    """Image preprocessing pipeline for agar plate images"""
    
    def __init__(self, target_size: Tuple[int, int] = (512, 512)):
        self.target_size = target_size
    
    def preprocess(self, image_path: str) -> np.ndarray:
        """
        Complete preprocessing pipeline:
        1. Load and convert to RGB
        2. Normalize brightness/contrast
        3. Detect plate boundary
        4. Extract ROI
        5. Resize to target
        """
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image from {image_path}")
        
        # Convert BGR to RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Normalize brightness and contrast
        normalized = self._normalize_brightness(image_rgb)
        
        # Detect plate boundary and extract ROI
        plate_mask = self._detect_plate_boundary(normalized)
        roi = self._extract_roi(normalized, plate_mask)
        
        # Resize to target size
        resized = cv2.resize(roi, self.target_size, interpolation=cv2.INTER_AREA)
        
        return resized
    
    def preprocess_from_bytes(self, image_bytes: bytes) -> np.ndarray:
        """Preprocess image from bytes (for uploaded files)"""
        image = Image.open(io.BytesIO(image_bytes))
        image_rgb = np.array(image)
        
        # Convert RGBA to RGB if needed
        if image_rgb.shape[2] == 4:
            image_rgb = cv2.cvtColor(image_rgb, cv2.COLOR_RGBA2RGB)
        
        # Normalize brightness and contrast
        normalized = self._normalize_brightness(image_rgb)
        
        # Detect plate boundary and extract ROI
        plate_mask = self._detect_plate_boundary(normalized)
        roi = self._extract_roi(normalized, plate_mask)
        
        # Resize to target size
        resized = cv2.resize(roi, self.target_size, interpolation=cv2.INTER_AREA)
        
        return resized
    
    def _normalize_brightness(self, image: np.ndarray) -> np.ndarray:
        """Normalize brightness and contrast using CLAHE"""
        # Convert to LAB color space
        lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)
        
        # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        
        # Merge back
        limg = cv2.merge((cl, a, b))
        final = cv2.cvtColor(limg, cv2.COLOR_LAB2RGB)
        
        return final
    
    def _detect_plate_boundary(self, image: np.ndarray) -> np.ndarray:
        """
        Detect circular agar plate boundary using Hough Circle Transform
        Returns a binary mask of the plate region
        """
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (9, 9), 2)
        
        # Detect circles using Hough Circle Transform
        circles = cv2.HoughCircles(
            blurred,
            cv2.HOUGH_GRADIENT,
            dp=1.2,
            minDist=image.shape[0] // 4,  # Minimum distance between circles
            param1=50,  # Canny edge detector high threshold
            param2=30,  # Accumulator threshold for circle detection
            minRadius=int(min(image.shape[:2]) * 0.3),  # Minimum circle radius
            maxRadius=int(min(image.shape[:2]) * 0.5)   # Maximum circle radius
        )
        
        # Create mask
        mask = np.zeros(image.shape[:2], dtype=np.uint8)
        
        if circles is not None:
            # Get the largest circle
            circles = np.round(circles[0, :]).astype("int")
            largest_circle = max(circles, key=lambda c: c[2])
            
            x, y, radius = largest_circle
            cv2.circle(mask, (x, y), radius, 255, -1)
        else:
            # If no circle detected, use full image
            mask[:] = 255
        
        return mask
    
    def _extract_roi(self, image: np.ndarray, mask: np.ndarray) -> np.ndarray:
        """Extract region of interest using the plate mask"""
        # Find contours of the mask
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return image
        
        # Get bounding rectangle of largest contour
        largest_contour = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(largest_contour)
        
        # Extract ROI with some padding
        padding = 10
        x_start = max(0, x - padding)
        y_start = max(0, y - padding)
        x_end = min(image.shape[1], x + w + padding)
        y_end = min(image.shape[0], y + h + padding)
        
        roi = image[y_start:y_end, x_start:x_end]
        
        return roi
    
    def save_annotated_image(
        self,
        image: np.ndarray,
        detections: list,
        output_path: str,
        show_labels: bool = True,
        show_confidence: bool = True,
    ):
        """Save image with bounding boxes drawn - 5-class color system
        
        Args:
            image: RGB numpy array
            detections: List of detection dicts with class_name, confidence, bbox, color
            output_path: Path to save annotated image
            show_labels: Whether to draw class labels
            show_confidence: Whether to draw confidence scores
        """
        annotated = image.copy()

        # Color mapping per proposal specification
        # Valid colonies: green/orange, Artifacts: blue/red/purple
        for detection in detections:
            bbox = detection['bbox']
            class_name = detection['class_name']
            confidence = detection['confidence']
            # Use class-specific color from detector (BGR)
            color = detection.get('color', (255, 255, 255))
            is_valid = detection.get('is_valid_colony', False)

            # Draw bounding box
            x, y, w, h = bbox['x'], bbox['y'], bbox['width'], bbox['height']

            # Line thickness based on confidence
            thickness = 3 if confidence > 0.8 else 2
            cv2.rectangle(annotated, (x, y), (x + w, y + h), color, thickness)

            if show_labels:
                # Build label text
                label_parts = [class_name.replace('_', ' ')]
                if show_confidence:
                    label_parts.append(f"{confidence:.0%}")
                label = ' | '.join(label_parts)

                # Calculate label background size
                (label_w, label_h), baseline = cv2.getTextSize(
                    label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2
                )

                # Draw label background
                cv2.rectangle(
                    annotated,
                    (x, y - label_h - 8),
                    (x + label_w, y + baseline - 8),
                    color,
                    -1,
                )

                # Draw label text (white on colored background)
                cv2.putText(
                    annotated,
                    label,
                    (x, y - 8),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (255, 255, 255),
                    2,
                )

        # Add summary legend in top-left corner
        legend_y = 30
        cv2.putText(
            annotated,
            "ColonyAI - AI-Powered Plate Reader",
            (10, legend_y),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (255, 255, 255),
            2,
        )

        # Convert RGB to BGR for saving
        annotated_bgr = cv2.cvtColor(annotated, cv2.COLOR_RGB2BGR)
        cv2.imwrite(output_path, annotated_bgr)
