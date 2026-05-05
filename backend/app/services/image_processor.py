import cv2
import numpy as np
from PIL import Image
import io
from typing import Tuple

from app.services.colony_detector import VALID_COLONY_CLASSES


class ImageProcessor:
    """Image preprocessing pipeline for agar plate images"""

    def __init__(self, target_size: Tuple[int, int] = (512, 512)):
        self.target_size = target_size

    def preprocess(self, image_path: str) -> np.ndarray:
        """
        Complete preprocessing pipeline:
        1. Load and convert to RGB
        2. Normalize brightness/contrast (CLAHE)
        3. Detect plate boundary (Hough Circle)
        4. Perspective correction (homography transform)
        5. Extract ROI
        6. Resize to target
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
        plate_mask, plate_circle = self._detect_plate_boundary(normalized)
        corrected = self._correct_perspective(normalized, plate_circle)

        # Re-detect boundary on corrected image and extract ROI
        corrected_mask = self._detect_plate_boundary(corrected)[0]
        roi = self._extract_roi(corrected, corrected_mask)

        # Resize to target size
        resized = cv2.resize(roi, self.target_size, interpolation=cv2.INTER_AREA)

        return resized

    def preprocess_from_bytes(self, image_bytes: bytes) -> np.ndarray:
        """Preprocess image from bytes (for uploaded files)"""
        image = Image.open(io.BytesIO(image_bytes))

        # ── Normalize mode: convert semua ke RGB ──
        if image.mode == 'RGBA':
            image = image.convert('RGB')
        elif image.mode == 'L':          # Grayscale
            image = image.convert('RGB')
        elif image.mode == 'P':          # Palette
            image = image.convert('RGB')
        elif image.mode != 'RGB':
            image = image.convert('RGB')

        image_rgb = np.array(image)

        # Normalize brightness and contrast
        normalized = self._normalize_brightness(image_rgb)

        # Detect plate boundary and extract ROI
        plate_mask, plate_circle = self._detect_plate_boundary(normalized)
        corrected = self._correct_perspective(normalized, plate_circle)

        # Re-detect boundary on corrected image
        corrected_mask = self._detect_plate_boundary(corrected)[0]
        roi = self._extract_roi(corrected, corrected_mask)

        # Resize to target size
        resized = cv2.resize(roi, self.target_size, interpolation=cv2.INTER_AREA)

        return resized


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
        # Use higher clipLimit for overexposed images
        clip_limit = 3.0 if mean_luminance > 200 or mean_luminance < 80 else 2.0
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
        circle_info = None

        if circles is not None:
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

    def _correct_perspective(self, image: np.ndarray, circle_info: dict | None) -> np.ndarray:
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
            Perspective-corrected image (same size as input)
        """
        if circle_info is None:
            return image  # No plate detected, skip correction

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
                return image

            # Apply perspective warp
            corrected = cv2.warpPerspective(image, H, (w, h), flags=cv2.INTER_LINEAR)
            return corrected
        except cv2.error:
            # If homography fails, return original image
            return image

    def _extract_roi(self, image: np.ndarray, mask: np.ndarray) -> np.ndarray:
        """Extract region of interest using the plate mask.
        Jika ROI yang diekstrak terlalu kecil (< 10% dari image asli),
        fallback ke full image untuk mencegah distorsi parah."""
        # Find contours of the mask
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        if not contours:
            return image

        # Get bounding rectangle of largest contour
        largest_contour = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(largest_contour)

        # ── Minimum ROI size guard (BUG-C fix) ──
        # Jika ROI lebih kecil dari 10% dimensi image, kembalikan full image
        # untuk mencegah resize distortion parah
        min_width  = max(50, int(image.shape[1] * 0.10))
        min_height = max(50, int(image.shape[0] * 0.10))
        if w < min_width or h < min_height:
            return image  # Fallback: full image lebih aman

        # Extract ROI with some padding
        padding = 10
        x_start = max(0, x - padding)
        y_start = max(0, y - padding)
        x_end   = min(image.shape[1], x + w + padding)
        y_end   = min(image.shape[0], y + h + padding)

        roi = image[y_start:y_end, x_start:x_end]

        # Safety check: jika roi kosong, fallback
        if roi.size == 0:
            return image

        return roi


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
