import cv2
import numpy as np
from PIL import Image
import io
from typing import Tuple

from app.core.config import settings
from app.services.colony_detector_optimized import VALID_COLONY_CLASSES


class ImageProcessor:
    """Image preprocessing pipeline for agar plate images"""

    def __init__(self, target_size: Tuple[int, int] = None):
        self.target_size = target_size or (settings.MODEL_IMG_SIZE, settings.MODEL_IMG_SIZE)

    def preprocess(self, image_path: str) -> Tuple[np.ndarray, dict]:
        """
        Full preprocessing pipeline:
        1. Detect circular agar plate boundary (Hough Circle Transform)
        2. Correct perspective distortion (homography warp)
        3. Normalize brightness/contrast (CLAHE with auto-exposure)
        4. Resize to target dimensions (640x640)

        Returns: (processed_image, roi_info)
        """
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image from {image_path}")

        orig_h, orig_w = image.shape[:2]
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Step 1: Detect plate boundary
        mask, circle_info = self._detect_plate_boundary(image_rgb)

        # Step 2: Correct perspective — also capture H for inverse mapping later
        corrected, H = self._correct_perspective(image_rgb, circle_info)

        # Step 3: Normalize brightness
        normalized = self._normalize_brightness(corrected)

        # Step 4: Resize
        resized = cv2.resize(normalized, self.target_size, interpolation=cv2.INTER_AREA)

        # ROI info for coordinate mapping
        # H is the homography matrix used in perspective correction (src→dst).
        # Store it so callers can apply H_inverse to map bbox coords back to original.
        roi_info = {
            'x_offset': 0,
            'y_offset': 0,
            'roi_w': orig_w,
            'roi_h': orig_h,
            'orig_w': orig_w,
            'orig_h': orig_h,
            'plate_detected': circle_info is not None,
            'plate_center_x': circle_info['x'] if circle_info else None,
            'plate_center_y': circle_info['y'] if circle_info else None,
            'plate_radius': circle_info['radius'] if circle_info else None,
            'homography_matrix': H,  # None if no perspective correction was applied
        }
        return resized, roi_info

    def preprocess_from_bytes(self, image_bytes: bytes) -> Tuple[np.ndarray, dict]:
        """
        Full preprocessing pipeline from raw bytes.
        Same as preprocess() but accepts image bytes instead of file path.
        """
        image = Image.open(io.BytesIO(image_bytes))
        if image.mode != 'RGB':
            image = image.convert('RGB')

        image_rgb = np.array(image)
        orig_h, orig_w = image_rgb.shape[:2]

        # Step 1: Detect plate boundary
        mask, circle_info = self._detect_plate_boundary(image_rgb)

        # Step 2: Correct perspective — also capture H for inverse mapping later
        corrected, H = self._correct_perspective(image_rgb, circle_info)

        # Step 3: Normalize brightness
        normalized = self._normalize_brightness(corrected)

        # Step 4: Resize
        resized = cv2.resize(normalized, self.target_size, interpolation=cv2.INTER_AREA)

        roi_info = {
            'x_offset': 0,
            'y_offset': 0,
            'roi_w': orig_w,
            'roi_h': orig_h,
            'orig_w': orig_w,
            'orig_h': orig_h,
            'plate_detected': circle_info is not None,
            'plate_center_x': circle_info['x'] if circle_info else None,
            'plate_center_y': circle_info['y'] if circle_info else None,
            'plate_radius': circle_info['radius'] if circle_info else None,
            'homography_matrix': H,  # None if no perspective correction was applied
        }
        return resized, roi_info


    def _normalize_brightness(self, image: np.ndarray) -> np.ndarray:
        """Normalize brightness and contrast using CLAHE with auto-exposure correction.

        Handles:
        - Underexposed (dark) images: standard CLAHE
        - Overexposed (bright) images: gamma correction + CLAHE
        - Normal images: standard CLAHE
        """
        # Convert to LAB color space
        lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)

        # Auto-detect exposure level from luminance channel
        mean_luminance = l.mean()

        if mean_luminance > 200:
            # OVEREXPOSED: Apply gamma correction to darken first
            # Gamma < 1 darkens the image
            gamma = 0.5 + (255 - mean_luminance) / 510  # Adaptive gamma: 0.5-0.8
            l_float = l.astype(np.float32) / 255.0
            l_corrected = np.power(l_float, gamma) * 255.0
            l = l_corrected.astype(np.uint8)
        elif mean_luminance < 80:
            # UNDEREXPOSED: Apply gamma correction to brighten
            gamma = 1.5 + (80 - mean_luminance) / 160  # Adaptive gamma: 1.5-2.0
            l_float = l.astype(np.float32) / 255.0
            l_corrected = np.power(l_float, gamma) * 255.0
            l = np.clip(l_corrected, 0, 255).astype(np.uint8)

        # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
        # Use higher clipLimit for better contrast on small dots
        clip_limit = 4.0 if mean_luminance > 200 or mean_luminance < 80 else 3.0
        clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=(8, 8))
        cl = clahe.apply(l)

        # Merge back
        limg = cv2.merge((cl, a, b))
        final = cv2.cvtColor(limg, cv2.COLOR_LAB2RGB)

        return final

    def _detect_plate_boundary(self, image: np.ndarray) -> Tuple[np.ndarray, dict | None]:
        """
        Detect circular agar plate boundary using Hough Circle Transform
        Returns a binary mask of the plate region and circle info dict
        """
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)

        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (9, 9), 2)

        # Detect circles using Hough Circle Transform
        # FIX: Lower param2 (30 -> 25) to be more lenient with petri dish edges
        circles = cv2.HoughCircles(
            blurred,
            cv2.HOUGH_GRADIENT,
            dp=1.2,
            minDist=image.shape[0] // 4,
            param1=50,
            param2=25,
            minRadius=int(min(image.shape[:2]) * 0.35),
            maxRadius=int(min(image.shape[:2]) * 0.52)
        )

        # Create mask
        mask = np.zeros(image.shape[:2], dtype=np.uint8)
        circle_info = None

        if circles is not None and len(circles[0]) > 0:
            # Get the largest circle
            circles = np.round(circles[0, :]).astype("int")
            largest_circle = max(circles, key=lambda c: c[2])

            x, y, radius = largest_circle
            circle_info = {'x': x, 'y': y, 'radius': radius}
            cv2.circle(mask, (x, y), radius, 255, -1)
        else:
            # If no circle detected, use full image
            mask[:] = 255

        return mask, circle_info

    def _correct_perspective(self, image: np.ndarray, circle_info: dict | None) -> tuple:
        """
        Correct perspective distortion of the agar plate using homography transform.

        If a circular plate is detected, this method:
        1. Finds 4 edge points around the circle perimeter
        2. Computes homography to transform the ellipse/oval back to a perfect circle
        3. Applies perspective warp to normalize the plate view

        Args:
            image: RGB numpy array
            circle_info: Dict with x, y, radius from Hough Circle detection

        Returns:
            Tuple of (perspective-corrected image, H matrix or None).
            H is the homography matrix used for the warp (src→dst).
            H is None when no correction was applied (identity transform).
        """
        if circle_info is None:
            return image, None  # No plate detected, skip correction

        h, w = image.shape[:2]
        cx, cy, r = circle_info['x'], circle_info['y'], circle_info['radius']

        # Define 4 points around the circle perimeter (top, right, bottom, left)
        # These points are slightly inside the circle to avoid edge artifacts
        margin = int(r * 0.1)
        r_inner = r - margin

        src_points = np.float32([
            [cx, cy - r_inner],           # Top
            [cx + r_inner, cy],           # Right
            [cx, cy + r_inner],           # Bottom
            [cx - r_inner, cy],           # Left
        ])

        # Define destination points as a square centered in the image
        # This creates a "top-down" normalized view
        square_size = int(r_inner * 2)
        offset_x = max(0, (w - square_size) // 2)
        offset_y = max(0, (h - square_size) // 2)

        dst_points = np.float32([
            [offset_x + square_size // 2, offset_y],                    # Top
            [offset_x + square_size, offset_y + square_size // 2],      # Right
            [offset_x + square_size // 2, offset_y + square_size],      # Bottom
            [offset_x, offset_y + square_size // 2],                    # Left
        ])

        # Compute homography matrix
        try:
            H, _ = cv2.findHomography(src_points, dst_points)
            if H is None:
                return image, None

            # Apply perspective warp
            corrected = cv2.warpPerspective(image, H, (w, h), flags=cv2.INTER_LINEAR)
            return corrected, H
        except cv2.error as e:
            # If homography fails, return original image
            # Log warning so upstream callers know correction was skipped
            import logging as _logging
            _logging.getLogger(__name__).warning(
                "_correct_perspective: homography failed (cx=%s cy=%s r=%s), "
                "returning uncorrected image. cv2 error: %s",
                circle_info.get('x'), circle_info.get('y'), circle_info.get('radius'), e
            )
            return image, None

    def _extract_roi_with_coords(self, image: np.ndarray, mask: np.ndarray) -> Tuple[np.ndarray, Tuple[int, int, int, int]]:
        """Extract ROI and return (roi_image, (x, y, w, h))"""
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        if not contours:
            return image, (0, 0, image.shape[1], image.shape[0])

        largest_contour = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(largest_contour)

        min_width  = int(image.shape[1] * 0.50)
        min_height = int(image.shape[0] * 0.50)
        
        if w < min_width or h < min_height:
            return image, (0, 0, image.shape[1], image.shape[0])

        padding = int(w * 0.15)
        x_start = max(0, x - padding)
        y_start = max(0, y - padding)
        x_end   = min(image.shape[1], x + w + padding)
        y_end   = min(image.shape[0], y + h + padding)

        roi = image[y_start:y_end, x_start:x_end]
        
        if roi.size == 0:
            return image, (0, 0, image.shape[1], image.shape[0])

        return roi, (x_start, y_start, x_end - x_start, y_end - y_start)


    def save_annotated_image(
        self,
        image: np.ndarray,
        detections: list,
        output_path: str,
        show_labels: bool = True,
        show_confidence: bool = True,
    ):
        """Save image with bounding boxes drawn - 5-class color system.

        PENTING: image input dalam format RGB (hasil preprocess).
        OpenCV menggunakan BGR untuk drawing. Konversi dilakukan dulu
        agar warna bounding box benar (hijau = koloni, merah = debris, dll).
        """
        # ── Konversi ke BGR untuk OpenCV drawing ──
        annotated_bgr = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        # Hitung colony count untuk label
        colony_count = sum(
            1 for d in detections
            if d.get('class_name') in VALID_COLONY_CLASSES
        )

        for detection in detections:
            bbox = detection['bbox']
            class_name = detection['class_name']
            confidence = detection['confidence']
            # Color sudah dalam format BGR (dari CLASS_COLORS_BGR)
            color = detection.get('color', (200, 200, 200))
            is_valid = detection.get('is_valid_colony', False)

            x, y, w, h = bbox['x'], bbox['y'], bbox['width'], bbox['height']

            # Line thickness: tebal untuk koloni valid, tipis untuk artifact
            thickness = 3 if (is_valid and confidence > 0.75) else 2
            cv2.rectangle(annotated_bgr, (x, y), (x + w, y + h), color, thickness)

            if show_labels:
                label_parts = [class_name.replace('_', ' ').title()]
                if show_confidence:
                    label_parts.append(f"{confidence:.0%}")
                label = ' | '.join(label_parts)

                font       = cv2.FONT_HERSHEY_SIMPLEX
                font_scale = 0.42
                font_thick = 1

                (label_w, label_h), baseline = cv2.getTextSize(
                    label, font, font_scale, font_thick
                )

                # Label background
                lx1, ly1 = x, max(0, y - label_h - 6)
                lx2, ly2 = x + label_w + 4, y
                cv2.rectangle(annotated_bgr, (lx1, ly1), (lx2, ly2), color, -1)

                # Label text (white)
                cv2.putText(
                    annotated_bgr, label,
                    (x + 2, max(label_h, y - 4)),
                    font, font_scale,
                    (255, 255, 255),
                    font_thick,
                    cv2.LINE_AA,
                )

        # ── Watermark: ColonyAI branding + colony count ──
        h_img, w_img = annotated_bgr.shape[:2]

        # Background strip gelap di bagian bawah
        strip_h = 32
        overlay = annotated_bgr.copy()
        cv2.rectangle(overlay, (0, h_img - strip_h), (w_img, h_img), (20, 20, 20), -1)
        cv2.addWeighted(overlay, 0.75, annotated_bgr, 0.25, 0, annotated_bgr)

        # ColonyAI label kiri
        cv2.putText(
            annotated_bgr,
            "ColonyAI v2.0 | AI-Powered Plate Reader",
            (10, h_img - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.45,
            (80, 220, 120),   # Hijau terang (BGR)
            1,
            cv2.LINE_AA,
        )

        # Colony count kanan
        count_label = f"Colonies: {colony_count}"
        (cw, _), _ = cv2.getTextSize(count_label, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)
        cv2.putText(
            annotated_bgr,
            count_label,
            (w_img - cw - 10, h_img - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.45,
            (255, 220, 80),   # Kuning (BGR)
            1,
            cv2.LINE_AA,
        )

        # ── Simpan dalam format BGR (OpenCV default) ──
        cv2.imwrite(output_path, annotated_bgr)
