from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request, Query, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta, timezone
from pathlib import Path
import uuid
import math
import os
import shutil
import tempfile
import cv2 as _cv2
import numpy as _np
import time
import logging

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc
from sqlalchemy.orm import joinedload, selectinload
from sqlalchemy.orm.exc import StaleDataError

from app.core.security import get_current_user, require_role
from app.core.database import get_db
from app.core.config import settings
from app.core.thresholds import get_all_thresholds
from app.utils.s3 import s3_is_configured, upload_to_s3, get_presigned_url
from app.services.colony_detector_optimized import get_detector, ColonyDetectorOptimized, VALID_COLONY_CLASSES
from app.services.file_validator import validate_and_sanitize_image
from app.services.image_processor import ImageProcessor
from app.services.cfu_calculator import CFUCalculator
from app.models import Analysis, ColonyDetection, AnalysisStatus, User
from app.utils.audit import write_audit_log
from app.schemas.analyses import (
    AnalysisResponse,
    AnalysisBriefResponse,
    AnalysisListResponse,
    DetectionResponse,
    BBoxResponse,
    DashboardStatsResponse,
    WeeklyTrendItem,
    AnalysisUserBrief,
)

router = APIRouter()
logger = logging.getLogger(__name__)

# FIX BUG-MEDIUM-006: Enforce pagination limits
MAX_PAGE_SIZE = 100
DEFAULT_PAGE_SIZE = 20

# ============================================================
# Simulation Endpoint (Case 1 Requirement)
# ============================================================

VALID_MEDIA_TYPES = {"PCA", "TSA", "VRBA", "MacConkey", "SDA", "EMB", "OTHER"}

@router.post("/simulate", response_model=AnalysisResponse)
async def simulate_analysis(
    file: UploadFile = File(...),
    media_type: str = Form(default="PCA"),
    dilution_factor: float = Form(default=1.0),
    plated_volume_ml: float = Form(default=1.0),
    current_user: dict = Depends(require_role("analyst", "manager", "admin", "super_admin")),
    db: AsyncSession = Depends(get_db),
):
    """
    Real-time simulation for accuracy comparison (Case 1).
    Processes image with AI but DOES NOT save to audit history.
    Accepts media_type, dilution_factor, plated_volume_ml from caller.
    """
    # BUG-5 FIX: dilution_factor bisa < 1 (misal 0.1 untuk 10^-1)
    # Validasi hanya: harus positif dan tidak melebihi 1,000,000
    # CRITICAL FIX: NaN/Infinity from type coercion would bypass <= 0 checks
    if math.isnan(dilution_factor) or math.isinf(dilution_factor) or dilution_factor <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dilution factor must be a finite positive number"
        )
    
    if dilution_factor > 1_000_000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dilution factor must be between 0 (exclusive) and 1,000,000"
        )
    
    # Validate plated_volume_ml (must be between 0.01 and 10)
    if math.isnan(plated_volume_ml) or math.isinf(plated_volume_ml) or plated_volume_ml <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Plated volume must be a finite positive number"
        )
    
    if plated_volume_ml > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Plated volume must be between 0.01 and 10 mL"
        )
    
    # Sanitize media_type — fall back to PCA if unrecognised
    if media_type not in VALID_MEDIA_TYPES:
        logger.warning("simulate_analysis: unknown media_type=%s, defaulting to PCA", media_type)
        media_type = "PCA"

    # 1. Validation
    contents, safe_filename, detected_mime = await validate_and_sanitize_image(file)

    # 2. Processing
    processor = ImageProcessor()
    detector = get_detector()
    calculator = CFUCalculator()

    processed_img, roi_info = processor.preprocess_from_bytes(contents)

    # Use optimized detector with TTA for maximum accuracy in simulation
    detections = await detector.detect_async(processed_img, media_type=media_type, aggressive=True, use_tta=True)

    # 3. Calculate colony counts from detections
    class_breakdown = detector.get_detection_summary(detections)
    colony_single = class_breakdown.get('colony_single', 0)
    colony_merged = class_breakdown.get('colony_merged', 0)
    valid_colony_count = colony_single + colony_merged

    # 4. Calculate CFU/ml
    cfu_result = calculator.calculate(
        colony_single=colony_single,
        colony_merged_raw=colony_merged,
        dilution_factor=dilution_factor,
        plated_volume_ml=plated_volume_ml,
        media_type=media_type,
        confidence_score=detector.get_average_confidence(detections),
        reliability=detector.get_reliability_indicator(detections),
        class_breakdown=class_breakdown,
        detections=detections,
    )

    # 5. Build a transient response (not saved to DB)
    # BUG-1 FIX: Return actual media_type, not "SIMULATED"
    # BUG-4 FIX: Ensure all 5 classes are present in class_breakdown (even if 0)
    temp_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    full_class_breakdown = {
        'colony_single': class_breakdown.get('colony_single', 0),
        'colony_merged': class_breakdown.get('colony_merged', 0),
        'bubble': class_breakdown.get('bubble', 0),
        'dust_debris': class_breakdown.get('dust_debris', 0),
        'media_crack': class_breakdown.get('media_crack', 0),
    }

    return {
        "id": str(temp_id),
        "user_id": current_user["user_id"],
        "sample_id": "SIMULATION-" + file.filename,
        "media_type": media_type,
        "dilution_factor": dilution_factor,
        "plated_volume_ml": plated_volume_ml,
        "status": "completed",
        "colony_count": colony_single + colony_merged,
        "cfu_per_ml": cfu_result.cfu_per_ml,
        "confidence_score": cfu_result.confidence_score,
        "reliability": cfu_result.reliability,
        "class_breakdown": full_class_breakdown,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
        "is_valid_for_reporting": False,
        "detections": [
            {
                "id": str(uuid.uuid4()),
                "analysis_id": str(temp_id),
                "class_name": d['class_name'],
                "confidence": d['confidence'],
                # FIX-ACC-4: Expose raw confidence (before position boost) for debugging
                "confidence_original": d.get('confidence_original', d['confidence']),
                "is_valid_colony": d.get('is_valid_colony', False),
                "bbox": d['bbox'],
                "bbox_normalized": {
                    "x": d['bbox']['x'] / max(processed_img.shape[1], 1),
                    "y": d['bbox']['y'] / max(processed_img.shape[0], 1),
                    "width": d['bbox']['width'] / max(processed_img.shape[1], 1),
                    "height": d['bbox']['height'] / max(processed_img.shape[0], 1),
                }
            } for d in detections
        ],
        "image_width": processed_img.shape[1],
        "image_height": processed_img.shape[0],
        "warnings": ["INI ADALAH MODE SIMULASI. Data tidak disimpan ke Audit Ledger."],
        "user": {
            "full_name": current_user.get("full_name", "Unknown Analyst"),
            "email": current_user.get("email", "unknown@colonyai.com")
        }
    }


# ============================================================
# Helper Functions
# ============================================================

def _build_detection_response(detection: ColonyDetection) -> DetectionResponse:
    """Convert DB model to DetectionResponse"""
    return DetectionResponse(
        id=str(detection.id),
        analysis_id=str(detection.analysis_id),
        class_name=detection.class_name,
        confidence=detection.confidence,
        bbox=BBoxResponse(
            x=detection.bbox_x,
            y=detection.bbox_y,
            width=detection.bbox_width,
            height=detection.bbox_height,
        ),
    )


def _build_analysis_response(analysis: Analysis) -> AnalysisResponse:
    """Convert DB model to full AnalysisResponse with detections"""
    # Compute class_breakdown from detections
    class_breakdown = {}
    if analysis.detections:
        for det in analysis.detections:
            class_breakdown[det.class_name] = class_breakdown.get(det.class_name, 0) + 1

    # Determine reporting validity
    is_valid = (
        analysis.status == AnalysisStatus.COMPLETED
        and analysis.reliability != "low"
    )

    return AnalysisResponse(
        id=str(analysis.id),
        user_id=str(analysis.user_id),
        sample_id=analysis.sample_id,
        media_type=analysis.media_type,
        dilution_factor=analysis.dilution_factor,
        plated_volume_ml=analysis.plated_volume_ml,
        original_image_url=analysis.original_image_url,
        annotated_image_url=analysis.annotated_image_url,
        colony_count=analysis.colony_count,
        cfu_per_ml=analysis.cfu_per_ml,
        confidence_score=analysis.confidence_score,
        reliability=analysis.reliability or "high",
        status=analysis.status.value if isinstance(analysis.status, AnalysisStatus) else analysis.status,
        cfu_status=getattr(analysis, 'cfu_status', None),
        cfu_message=getattr(analysis, 'cfu_message', None),
        uncertainty_u=getattr(analysis, 'uncertainty_u', None),
        merged_estimation_method=getattr(analysis, 'merged_estimation_method', None),
        incubation_temp=getattr(analysis, 'incubation_temp', None),
        incubation_time_hours=getattr(analysis, 'incubation_time_hours', None),
        method_standard=getattr(analysis, 'method_standard', "ISO 4833-1:2013"),
        media_batch_number=getattr(analysis, 'media_batch_number', None),
        incubator_id=getattr(analysis, 'incubator_id', None),
        class_breakdown=class_breakdown or analysis.class_breakdown,
        detections=[_build_detection_response(d) for d in analysis.detections],
        warnings=analysis.warnings or [],
        is_valid_for_reporting=is_valid,
        created_at=analysis.created_at,
        updated_at=analysis.updated_at,
        user=AnalysisUserBrief(
            full_name=analysis.user.full_name,
            email=analysis.user.email,
        ) if analysis.user else None,
    )


def _build_brief_response(analysis: Analysis) -> AnalysisBriefResponse:
    """Convert DB model to abbreviated AnalysisBriefResponse"""
    # Compute class_breakdown from detections if available
    class_breakdown = {}
    if analysis.detections:
        for det in analysis.detections:
            class_breakdown[det.class_name] = class_breakdown.get(det.class_name, 0) + 1

    is_valid = (
        analysis.status == AnalysisStatus.COMPLETED
        and analysis.reliability != "low"
    )

    return AnalysisBriefResponse(
        id=str(analysis.id),
        user_id=str(analysis.user_id),
        sample_id=analysis.sample_id,
        media_type=analysis.media_type,
        dilution_factor=analysis.dilution_factor,
        plated_volume_ml=analysis.plated_volume_ml,
        original_image_url=analysis.original_image_url,
        annotated_image_url=analysis.annotated_image_url,
        colony_count=analysis.colony_count,
        cfu_per_ml=analysis.cfu_per_ml,
        confidence_score=analysis.confidence_score,
        reliability=analysis.reliability or "high",
        status=analysis.status.value if isinstance(analysis.status, AnalysisStatus) else analysis.status,
        cfu_status=getattr(analysis, 'cfu_status', None),
        cfu_message=getattr(analysis, 'cfu_message', None),
        uncertainty_u=getattr(analysis, 'uncertainty_u', None),
        merged_estimation_method=getattr(analysis, 'merged_estimation_method', None),
        incubation_temp=getattr(analysis, 'incubation_temp', None),
        incubation_time_hours=getattr(analysis, 'incubation_time_hours', None),
        method_standard=getattr(analysis, 'method_standard', "ISO 4833-1:2013"),
        media_batch_number=getattr(analysis, 'media_batch_number', None),
        incubator_id=getattr(analysis, 'incubator_id', None),
        class_breakdown=class_breakdown or analysis.class_breakdown,
        warnings=analysis.warnings or [],
        is_valid_for_reporting=is_valid,
        created_at=analysis.created_at,
        updated_at=analysis.updated_at,
        user=AnalysisUserBrief(
            full_name=analysis.user.full_name,
            email=analysis.user.email,
            organization_name=analysis.user.organization.name if analysis.user and getattr(analysis.user, 'organization', None) else "ColonyAI General",
        ) if analysis.user else None,
    )


def _save_upload(file: UploadFile, upload_dir: str) -> str:
    """Save uploaded file to local storage, return file path"""
    Path(upload_dir).mkdir(parents=True, exist_ok=True)

    # Generate unique filename
    ext = Path(file.filename).suffix if file.filename else ".jpg"
    filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(upload_dir, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return file_path


def _get_file_url(file_path: str) -> str:
    """Generate URL for a locally stored file (Robust Windows support)"""
    if not file_path:
        return ""
    
    try:
        # Normalize paths for Windows/Unix compatibility
        norm_file = os.path.normpath(file_path)
        norm_upload = os.path.normpath(settings.UPLOAD_DIR)
        
        # Get relative path using os.path.relpath which handles Windows drive letters better than Path.relative_to
        rel_path = os.path.relpath(norm_file, norm_upload)
        
        # Ensure we use forward slashes for the URL
        url_path = rel_path.replace(os.path.sep, '/')
        
        return f"/uploads/{url_path}"
    except Exception as e:
        # Fallback: just use the filename
        filename = os.path.basename(file_path)
        return f"/uploads/{filename}"


# ============================================================
# Request Models
# ============================================================

class FlagReviewRequest(BaseModel):
    reason: str = Field(..., min_length=1, max_length=500, description="Reason for flagging (max 500 chars)")


# ============================================================
# Endpoints
# ============================================================

@router.post("/")
async def create_analysis(
    file: UploadFile = File(...),
    sample_id: str = Form(...),
    media_type: str = Form(...),
    dilution_factor: float = Form(1.0),
    plated_volume_ml: float = Form(1.0),
    incubation_temp: Optional[float] = Form(None),
    incubation_time_hours: Optional[int] = Form(None),
    method_standard: Optional[str] = Form("ISO 4833-1:2013"),
    media_batch_number: Optional[str] = Form(None),
    incubator_id: Optional[str] = Form(None),
    request: Request = None,
    background_tasks: BackgroundTasks = None,
    current_user: dict = Depends(require_role("analyst", "manager", "admin", "super_admin")),
    db: AsyncSession = Depends(get_db),
):
    """
    Buat analisis plate baru.

    Pipeline:
    1. Validasi & sanitasi file (magic bytes, EXIF strip, UUID rename, malware scan)
    2. Simpan gambar asli (lokal / S3)
    3. Buat record analisis (status PROCESSING)
    4. Preprocessing gambar (Hough Circle crop)
    5. YOLOv8 inference dengan per-media threshold
    6. Kalkulasi CFU/mL (SA-001 area-based merged estimation)
    7. Simpan gambar teranotasi
    8. Update record analisis
    9. Simpan detection records
    10. Audit log
    """
    # ── BUG-006: Validasi keamanan file (magic bytes, EXIF strip, malware scan) ──
    # Ini menggantikan validasi lama yang hanya mengecek Content-Type header
    file_content, safe_filename, detected_mime = await validate_and_sanitize_image(file)

    # ── FIX QA-007: Input media_type Validation ──
    # FIX-2: Sinkronkan dengan thresholds_optimized.py — Blood, SDA, EMB sebelumnya tidak ada
    ALLOWED_MEDIA_TYPES = {
        "Plate Count Agar", "PCA",
        "MacConkey",
        "TSA",
        "Blood",
        "VRBA",
        "SDA",
        "EMB",
        "BGBB",
        "R2A",
        "Other",
    }
    if media_type not in ALLOWED_MEDIA_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid media_type: '{media_type}'. Allowed values: {', '.join(ALLOWED_MEDIA_TYPES)}"
        )

    # ── BUG-002 & BUG-012: Validasi parameter kalkulasi dengan upper bound ──
    # BUG-5 FIX: dilution_factor bisa < 1 (misal 0.001 untuk pengenceran 10^-3)
    if math.isnan(dilution_factor) or math.isinf(dilution_factor) or dilution_factor <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Dilution factor tidak valid. Harus berupa angka positif (contoh: 0.001 untuk 10⁻³).",
        )
    if dilution_factor > 1_000_000:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Dilution factor terlalu besar. Maksimum adalah 1,000,000.",
        )
    if math.isnan(plated_volume_ml) or math.isinf(plated_volume_ml) or plated_volume_ml <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Volume tidak valid. Harus berupa angka positif dalam mL (contoh: 1.0).",
        )
    if plated_volume_ml > 10:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Volume terlalu besar. Maksimum adalah 10 mL.",
        )
    
    # ── HIGH FIX: Validate optional incubation parameters ──
    if incubation_temp is not None:
        if math.isnan(incubation_temp) or math.isinf(incubation_temp):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Suhu inkubasi tidak valid.",
            )
        if incubation_temp < 0 or incubation_temp > 100:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Suhu inkubasi harus antara 0-100°C.",
            )
    
    if incubation_time_hours is not None:
        if incubation_time_hours < 0 or incubation_time_hours > 168:  # 7 days max
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Waktu inkubasi harus antara 0-168 jam (7 hari).",
            )

    analysis_id = uuid.uuid4()

    try:
        # ── Step 1: Simpan gambar (sudah disanitasi) ke lokal ──
        original_dir = os.path.join(settings.UPLOAD_DIR, "original")
        Path(original_dir).mkdir(parents=True, exist_ok=True)
        original_path = os.path.join(original_dir, safe_filename)

        with open(original_path, "wb") as f:
            f.write(file_content)

        original_url = _get_file_url(original_path)

        # ── Upload ke S3 jika dikonfigurasi ──
        if s3_is_configured():
            s3_key = f"{settings.AWS_S3_ORIGINAL_PREFIX}{safe_filename}"
            upload_to_s3(file_content, s3_key, content_type=detected_mime)
            # BUG-039: presigned URL 15 menit (900 detik), bukan 1 jam
            original_url = get_presigned_url(s3_key, expiry_seconds=900) or s3_key

        # ── Step 2: Buat record analisis ──
        # Multi-tenant: Tag with organization_id
        org_id = current_user.get("organization_id")
        target_org_id = uuid.UUID(org_id) if org_id else None

        analysis = Analysis(
            id=analysis_id,
            user_id=uuid.UUID(current_user["user_id"]),
            organization_id=target_org_id,
            sample_id=sample_id,
            media_type=media_type,
            dilution_factor=dilution_factor,
            plated_volume_ml=plated_volume_ml,
            incubation_temp=incubation_temp,
            incubation_time_hours=incubation_time_hours,
            method_standard=method_standard,
            media_batch_number=media_batch_number,
            incubator_id=incubator_id,
            original_image_url=original_url,
            status=AnalysisStatus.PROCESSING,
        )
        db.add(analysis)
        await db.commit()
        await db.refresh(analysis)

        # ── Step 3: Preprocessing gambar ──
        image_processor = ImageProcessor()
        processed_image, roi_info = image_processor.preprocess(original_path)

        # ── Step 4: YOLOv8 inference (Optimized — singleton model, async thread pool) ──
        colony_detector = get_detector()

        start_time = time.time()
        detections = await colony_detector.detect_async(
            processed_image,
            media_type=media_type,
            aggressive=False,
            use_tta=True
        )
        inference_time_ms = (time.time() - start_time) * 1000

        # Note: ColonyDetectorOptimized sudah melakukan filtering per-class dan NMS.
        # Kita tetap simpan Step NMS di sini sebagai double-check untuk cross-class overlap.

        # ── Cross-class NMS: Hapus deteksi ganda di lokasi yang sama ──
        # Jika dua kelas berbeda mendeteksi objek yang sama (IoU > 0.30),
        # hanya simpan yang confidence-nya paling tinggi.
        def _iou(b1: dict, b2: dict) -> float:
            x1 = max(b1["x"], b2["x"])
            y1 = max(b1["y"], b2["y"])
            x2 = min(b1["x"] + b1["width"],  b2["x"] + b2["width"])
            y2 = min(b1["y"] + b1["height"], b2["y"] + b2["height"])
            inter = max(0, x2 - x1) * max(0, y2 - y1)
            if inter == 0:
                return 0.0
            a1 = b1["width"] * b1["height"]
            a2 = b2["width"] * b2["height"]
            return inter / (a1 + a2 - inter)

        detections_sorted = sorted(detections, key=lambda d: d["confidence"], reverse=True)
        kept = []
        for det in detections_sorted:
            overlap = any(_iou(det["bbox"], k["bbox"]) > 0.30 for k in kept)
            if not overlap:
                kept.append(det)
        detections = kept

        logger.info(f"YOLOv8 Inference complete: {len(detections)} detections (after NMS) in {inference_time_ms:.1f}ms")

        # ── Step 5: Hitung statistik deteksi ──
        class_breakdown = colony_detector.get_detection_summary(detections)
        avg_confidence = colony_detector.get_average_confidence(detections, valid_only=True)
        reliability = colony_detector.get_reliability_indicator(detections)

        colony_single_count = class_breakdown.get("colony_single", 0)
        colony_merged_count = class_breakdown.get("colony_merged", 0)

        # ── Step 6: Kalkulasi CFU/mL (SA-001 + BUG-002/003/011/015) ──
        cfu_calculator = CFUCalculator()
        cfu_result = cfu_calculator.calculate(
            colony_single=colony_single_count,
            colony_merged_raw=colony_merged_count,
            dilution_factor=dilution_factor,
            plated_volume_ml=plated_volume_ml,
            media_type=media_type,
            confidence_score=avg_confidence,
            reliability=reliability,
            class_breakdown=class_breakdown,
            detections=detections,
        )

        # Map CFU status ke AnalysisStatus DB
        analysis_status = AnalysisStatus.COMPLETED  # TNTC dan TFTC tetap COMPLETED

        # ── Step 7: Simpan gambar teranotasi ──
        # PASS original image (bukan processed_image) agar bounding box
        # di-render di gambar resolusi penuh, bukan di 512x512 crop.
        # Koordinat detections perlu di-scale dari 512x512 ke ukuran original.
        annotated_dir = os.path.join(settings.UPLOAD_DIR, "annotated")
        Path(annotated_dir).mkdir(parents=True, exist_ok=True)
        annotated_filename = f"{analysis_id}.jpg"
        annotated_path = os.path.join(annotated_dir, annotated_filename)

        # Load original image untuk annotation
        original_img_bgr = _cv2.imread(original_path)
        if original_img_bgr is None:
            # Fallback: gunakan processed image jika original gagal di-load
            logger.warning("Gagal load original image, fallback ke processed image untuk annotation")
            image_processor.save_annotated_image(processed_image, detections, annotated_path)
            # Koordinat DB = koordinat processed (512×512), tidak ada mapping yang bisa dilakukan
            scaled_detections = detections
        else:
            # Scale bounding box coordinates dari processed image (512×512) ke original size,
            # kemudian apply inverse homography jika perspective correction dilakukan.
            #
            # Pipeline preprocessing:
            #   original → warpPerspective(H) → resize(512×512) = processed_image
            #
            # Inverse mapping:
            #   bbox_processed → scale → bbox_warped → H_inv → bbox_original
            orig_h, orig_w = original_img_bgr.shape[:2]
            proc_h, proc_w = processed_image.shape[:2]

            # Scale factor dari processed (512×512) ke ukuran pre-resize (sama dengan original
            # karena warpPerspective mempertahankan dimensi gambar)
            scale_x = orig_w / proc_w
            scale_y = orig_h / proc_h

            # FIX-3: Guard against singular homography matrix (LinAlgError crash)
            H = roi_info.get('homography_matrix')
            try:
                H_inv = _np.linalg.inv(H) if H is not None else None
            except _np.linalg.LinAlgError:
                logger.warning("Homography matrix is singular — falling back to scale-only transform")
                H_inv = None

            scaled_detections = []
            for det in detections:
                scaled_det = det.copy()
                bx = det['bbox']['x'] * scale_x
                by = det['bbox']['y'] * scale_y
                bw = det['bbox']['width'] * scale_x
                bh = det['bbox']['height'] * scale_y

                if H_inv is not None:
                    # Transform centre point melalui H_inv untuk presisi maksimal
                    cx_w = bx + bw / 2
                    cy_w = by + bh / 2
                    pt = _np.array([[[cx_w, cy_w]]], dtype=_np.float32)
                    pt_orig = _cv2.perspectiveTransform(pt, H_inv)
                    cx_o, cy_o = pt_orig[0][0]

                    # Transform juga corner kiri-atas dan kanan-bawah untuk skala w/h
                    tl = _np.array([[[bx, by]]], dtype=_np.float32)
                    br = _np.array([[[bx + bw, by + bh]]], dtype=_np.float32)
                    tl_o = _cv2.perspectiveTransform(tl, H_inv)[0][0]
                    br_o = _cv2.perspectiveTransform(br, H_inv)[0][0]

                    new_w = max(1, int(abs(br_o[0] - tl_o[0])))
                    new_h = max(1, int(abs(br_o[1] - tl_o[1])))
                    new_x = int(cx_o - new_w / 2)
                    new_y = int(cy_o - new_h / 2)
                else:
                    new_x = int(bx)
                    new_y = int(by)
                    new_w = int(bw)
                    new_h = int(bh)

                # Clamp ke batas gambar
                new_x = max(0, min(new_x, orig_w - 1))
                new_y = max(0, min(new_y, orig_h - 1))
                new_w = max(1, min(new_w, orig_w - new_x))
                new_h = max(1, min(new_h, orig_h - new_y))

                scaled_det['bbox'] = {
                    'x': new_x,
                    'y': new_y,
                    'width': new_w,
                    'height': new_h,
                }
                scaled_detections.append(scaled_det)

            # Convert BGR original ke RGB untuk save_annotated_image
            original_img_rgb = _cv2.cvtColor(original_img_bgr, _cv2.COLOR_BGR2RGB)
            image_processor.save_annotated_image(original_img_rgb, scaled_detections, annotated_path)

        if s3_is_configured():
            s3_key = f"{settings.AWS_S3_ANNOTATED_PREFIX}{annotated_filename}"
            with open(annotated_path, "rb") as f:
                upload_to_s3(f.read(), s3_key, content_type="image/jpeg")
            annotated_url = get_presigned_url(s3_key, expiry_seconds=900) or s3_key
        else:
            annotated_url = _get_file_url(annotated_path)

        # ── Step 8: Update record analisis ──
        report_data = cfu_calculator.format_for_report(cfu_result)
        analysis.status = analysis_status
        analysis.colony_count = cfu_result.total_colonies
        analysis.cfu_per_ml = cfu_result.cfu_per_ml   # None jika TNTC/TFTC
        analysis.confidence_score = avg_confidence
        analysis.reliability = reliability
        analysis.annotated_image_url = annotated_url
        analysis.warnings = cfu_result.warnings
        analysis.class_breakdown = class_breakdown
        # Simpan metadata tambahan sebagai JSON jika kolom tersedia
        analysis.cfu_status = cfu_result.status
        analysis.cfu_message = cfu_result.message
        analysis.uncertainty_u = (
            cfu_result.uncertainty.U_expanded
            if cfu_result.uncertainty else None
        )
        analysis.merged_estimation_method = (
            cfu_result.merged_estimate.estimation_method
        )

        await db.commit()

        # ── Step 9: Simpan detection records ──
        # Gunakan scaled_detections agar koordinat bbox di DB sesuai dengan
        # gambar original (bukan koordinat 512×512 dari processed_image).
        for detection in scaled_detections:
            det_record = ColonyDetection(
                id=uuid.uuid4(),
                analysis_id=analysis_id,
                class_name=detection["class_name"],
                confidence=detection["confidence"],
                bbox_x=detection["bbox"]["x"],
                bbox_y=detection["bbox"]["y"],
                bbox_width=detection["bbox"]["width"],
                bbox_height=detection["bbox"]["height"],
            )
            db.add(det_record)

        await db.commit()

        # ── Step 10: Reload analisis dengan relasi ──
    result = await db.execute(
        select(Analysis)
        .where(and_(*query_conditions))
        .options(selectinload(Analysis.detections), joinedload(Analysis.user))
        .with_for_update()  # CRITICAL FIX: Pessimistic lock prevents concurrent updates
    )
    analysis = result.scalars().unique().first()

        if not analysis:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Gagal mengambil data analisis setelah proses selesai.",
            )

        # ── Audit log ──
        ip = request.client.host if request else None
        ua = request.headers.get("user-agent") if request else None
        await write_audit_log(
            db, current_user["user_id"], "create_analysis",
            "analysis", current_user.get("organization_id"), str(analysis_id),
            details={
                "sample_id": sample_id,
                "media_type": media_type,
                "cfu_status": cfu_result.status,
                "total_colonies": cfu_result.total_colonies,
                "merged_method": cfu_result.merged_estimate.estimation_method,
                "incubation_temp": incubation_temp,
                "incubation_time": incubation_time_hours,
                "media_batch": media_batch_number,
                "incubator_id": incubator_id,
                "method_standard": method_standard,
            },
            ip_address=ip, user_agent=ua,
        )

        # Queue Instant Alert to Telegram (as demo'ed for "Wow Factor")
        from app.services.messenger_service import messenger_service
        
        # Build payload for alert
        alert_payload = {
            "sample_id": analysis.sample_id,
            "media_type": analysis.media_type,
            "colony_count": analysis.colony_count,
            "cfu_per_ml": analysis.cfu_per_ml,
            "confidence_score": analysis.confidence_score,
            "status": analysis.status.value if hasattr(analysis.status, 'value') else analysis.status
        }
        
        if background_tasks:
            target_id = getattr(settings, 'TELEGRAM_ALERT_TARGET', '@ColonyAILabAlerts')
            background_tasks.add_task(
                messenger_service.send_instant_analysis_alert,
                platform="telegram",
                target_id=target_id,
                analysis_data=alert_payload,
                image_url=analysis.annotated_image_url
            )

        return _build_analysis_response(analysis)

    except HTTPException:
        raise
    except Exception as e:
        # Update analisis ke FAILED
        try:
            if 'analysis' in dir():
                analysis.status = AnalysisStatus.FAILED
                if hasattr(analysis, 'error_message'):
                    analysis.error_message = str(e)[:500]  # Truncate
                await db.commit()
        except Exception:
            pass

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Proses analisis gagal. Coba lagi atau hubungi dukungan teknis.",
        )


@router.get("/", response_model=AnalysisListResponse)
async def list_analyses(
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    media_type: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    current_user: dict = Depends(require_role("analyst", "manager", "auditor", "admin", "super_admin")),
    db: AsyncSession = Depends(get_db),
):
    """
    List analyses with role-based data scoping:
    - Analyst: own analyses only
    - Manager/Admin: all org analyses
    - Auditor: all org analyses (read-only)
    - Super Admin: all analyses
    """
    # ── CRITICAL FIX: Enforce pagination limits to prevent DoS ──
    page = max(1, page)
    page_size = max(1, min(page_size, MAX_PAGE_SIZE))
    
    base_conditions = []
    org_id = current_user.get("organization_id")
    user_role = current_user.get("role")

    if user_role != "super_admin":
        if org_id:
            base_conditions.append(Analysis.organization_id == uuid.UUID(org_id))
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User tidak terdaftar pada organisasi manapun."
            )

    # Analyst sees only own data; Manager/Admin/Auditor see all org data
    if user_role == "analyst":
        base_conditions.append(Analysis.user_id == uuid.UUID(current_user["user_id"]))

    # Apply filters
    if search:
        # ── HIGH FIX: Escape LIKE wildcards to prevent SQL injection ──
        # User input '%' or '_' should be treated as literals, not wildcards
        search_escaped = search.replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_')
        search_pattern = f"%{search_escaped}%"
        base_conditions.append(
            (Analysis.sample_id.ilike(search_pattern, escape='\\')) |
            (Analysis.media_type.ilike(search_pattern, escape='\\'))
        )

    if media_type:
        base_conditions.append(Analysis.media_type == media_type)

    if status_filter:
        # BUG-QA-05 FIX: Map frontend status values to DB AnalysisStatus
        # Frontend sends: 'valid', 'TNTC', 'TFTC'
        # DB stores: AnalysisStatus.COMPLETED for all completed analyses
        # 'valid' = COMPLETED with cfu_per_ml IS NOT NULL (implied by no TNTC/TFTC warning)
        if status_filter in ("TNTC", "TFTC"):
            # Filter by warnings containing the status string
            base_conditions.append(Analysis.warnings.contains(status_filter))
        elif status_filter == "valid":
            # valid = COMPLETED and no TNTC/TFTC in warnings
            base_conditions.append(Analysis.status == AnalysisStatus.COMPLETED)
            base_conditions.append(~Analysis.warnings.contains("TNTC"))
            base_conditions.append(~Analysis.warnings.contains("TFTC"))
        else:
            # Allow raw DB status values as fallback
            base_conditions.append(Analysis.status == status_filter)

    if date_from:
        # Handle 'Z' suffix for UTC and ensure naive datetime for DB comparison
        _df = date_from.replace('Z', '+00:00')
        base_conditions.append(Analysis.created_at >= datetime.fromisoformat(_df).replace(tzinfo=None))

    if date_to:
        _dt = date_to.replace('Z', '+00:00')
        base_conditions.append(Analysis.created_at <= datetime.fromisoformat(_dt).replace(tzinfo=None))

    # Get total count
    count_query = select(func.count()).select_from(Analysis)
    if base_conditions:
        count_query = count_query.where(and_(*base_conditions))
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Get paginated results
    offset = (page - 1) * page_size
    query = select(Analysis).options(
        selectinload(Analysis.detections), 
        joinedload(Analysis.user).joinedload(User.organization)
    )
    if base_conditions:
        query = query.where(and_(*base_conditions))
    query = query.order_by(desc(Analysis.created_at)).offset(offset).limit(page_size)

    result = await db.execute(query)
    analyses = result.scalars().unique().all()

    total_pages = math.ceil(total / page_size) if total > 0 else 0

    return AnalysisListResponse(
        analyses=[_build_brief_response(a) for a in analyses],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/stats")
async def get_dashboard_stats(
    current_user: dict = Depends(require_role("analyst", "manager", "auditor", "admin", "super_admin")),
    db: AsyncSession = Depends(get_db),
):
    # Multi-tenant security: Stats visibility
    base_conditions = []
    org_id = current_user.get("organization_id")

    if current_user.get("role") != "super_admin":
        if org_id:
            base_conditions.append(Analysis.organization_id == uuid.UUID(org_id))
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User tidak terdaftar pada organisasi manapun."
            )

    # Manager, Auditor, Admin see all stats in their org. Analyst sees only own stats.
    if current_user["role"] == "analyst":
        user_id = uuid.UUID(current_user["user_id"])
        base_conditions.append(Analysis.user_id == user_id)

    def _apply_conditions(query):
        if base_conditions:
            return query.where(and_(*base_conditions))
        return query

    # ── 1. Basic Counts ──
    count_query = select(func.count()).select_from(Analysis)
    total_result = await db.execute(_apply_conditions(count_query))
    total_analyses = total_result.scalar() or 0

    completed_query = select(func.count()).select_from(Analysis).where(
        Analysis.status == AnalysisStatus.COMPLETED
    )
    completed_result = await db.execute(_apply_conditions(completed_query))
    completed_count = completed_result.scalar() or 0
    success_rate = (completed_count / total_analyses * 100) if total_analyses > 0 else 0.0

    # ── 2. Verified vs Failed vs Review ──
    verified_query = select(func.count()).select_from(Analysis).where(
        and_(
            Analysis.status == AnalysisStatus.COMPLETED,
            ~Analysis.warnings.contains("Manual review")
        )
    )
    verified_result = await db.execute(_apply_conditions(verified_query))
    verified_count = verified_result.scalar() or 0

    failed_query = select(func.count()).select_from(Analysis).where(
        Analysis.status == AnalysisStatus.FAILED
    )
    failed_result = await db.execute(_apply_conditions(failed_query))
    failed_count = failed_result.scalar() or 0

    review_query = select(func.count()).select_from(Analysis).where(
        and_(
            Analysis.status == AnalysisStatus.COMPLETED,
            or_(
                Analysis.reliability == "low",
                Analysis.warnings.contains("Manual review"),
            ),
        )
    )
    review_result = await db.execute(_apply_conditions(review_query))
    pending_review = review_result.scalar() or 0

    # ── 3. Performance Metrics (Confidence & Latency) ──
    perf_query = select(func.avg(Analysis.confidence_score)).where(
        and_(
            Analysis.status == AnalysisStatus.COMPLETED,
            Analysis.confidence_score.isnot(None)
        )
    )
    perf_result = await db.execute(_apply_conditions(perf_query))
    avg_conf = perf_result.scalar() or 0.0

    # ── 4. Matrix Breakdown (Media Types) ──
    matrix_query = select(Analysis.media_type, func.count()).group_by(Analysis.media_type)
    matrix_result = await db.execute(_apply_conditions(matrix_query))
    matrix_breakdown = {row[0]: row[1] for row in matrix_result.all()}

    # ── 5. Weekly Trend ──
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    weekly_trend = []
    for i in range(7):
        day_date = datetime.now(timezone.utc) - timedelta(days=6 - i)
        day_name = days[day_date.weekday()]
        day_start = day_date.replace(hour=0, minute=0, second=0, microsecond=0).replace(tzinfo=None)
        day_end = day_start + timedelta(days=1)

        day_query = select(func.count()).select_from(Analysis).where(
            and_(
                Analysis.created_at >= day_start,
                Analysis.created_at < day_end,
            )
        )
        day_count = await db.execute(_apply_conditions(day_query))
        weekly_trend.append(WeeklyTrendItem(day=day_name, analyses=day_count.scalar() or 0))

    # ── 6. Recent Analyses ──
    from sqlalchemy.orm import selectinload, joinedload
    from app.models import User
    recent_query = select(Analysis).options(
        selectinload(Analysis.detections),
        joinedload(Analysis.user).joinedload(User.organization)
    ).order_by(desc(Analysis.created_at)).limit(5)
    recent_result = await db.execute(_apply_conditions(recent_query))
    recent_analyses = recent_result.scalars().unique().all()

    return DashboardStatsResponse(
        total_analyses=total_analyses,
        avg_time_saved_minutes=total_analyses * 15,
        success_rate=round(success_rate, 1),
        pending_review=pending_review,
        neural_confidence=round(avg_conf * 100, 1) if avg_conf > 0 else 0.0,
        system_latency_ms=42.0,
        verified_count=verified_count,
        failed_count=failed_count,
        matrix_breakdown=matrix_breakdown,
        weekly_trend=weekly_trend,
        recent_analyses=[_build_brief_response(a) for a in recent_analyses],
    )

@router.get("/{analysis_id}")
async def get_analysis(
    analysis_id: str,
    current_user: dict = Depends(require_role("analyst", "manager", "auditor", "admin", "super_admin")),
    db: AsyncSession = Depends(get_db),
):
    """Get full analysis details with all detections"""
    try:
        analysis_uuid = uuid.UUID(analysis_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid analysis ID format",
        )

    # Multi-tenant check with role-based scoping
    org_id = current_user.get("organization_id")
    user_role = current_user.get("role")
    query_conditions = [Analysis.id == analysis_uuid]

    if user_role != "super_admin":
        if org_id:
            query_conditions.append(Analysis.organization_id == uuid.UUID(org_id))
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User tidak terdaftar pada organisasi manapun."
            )

    # Analyst sees only own data; Manager/Admin/Auditor see all org data
    if user_role == "analyst":
        query_conditions.append(Analysis.user_id == uuid.UUID(current_user["user_id"]))

    result = await db.execute(
        select(Analysis)
        .where(and_(*query_conditions))
        .options(
            selectinload(Analysis.detections), 
            joinedload(Analysis.user).joinedload(User.organization)
        )
    )
    analysis = result.scalars().unique().first()

    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found",
        )

    return _build_analysis_response(analysis)


@router.delete("/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_analysis(
    analysis_id: str,
    request: Request = None,
    current_user: dict = Depends(require_role("analyst", "manager", "admin", "super_admin")),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete an analysis record.
    - Analyst: can only delete their own analyses
    - Manager/Admin/Super Admin: can delete any analysis in their org (super_admin: any org)
    """
    try:
        analysis_uuid = uuid.UUID(analysis_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid analysis ID format",
        )

    org_id = current_user.get("organization_id")
    user_role = current_user.get("role")
    query_conditions = [Analysis.id == analysis_uuid]

    if user_role != "super_admin":
        if org_id:
            query_conditions.append(Analysis.organization_id == uuid.UUID(org_id))
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User tidak terdaftar pada organisasi manapun.",
            )

    # Analyst can only delete their own analyses
    if user_role == "analyst":
        query_conditions.append(Analysis.user_id == uuid.UUID(current_user["user_id"]))

    result = await db.execute(
        select(Analysis).where(and_(*query_conditions))
    )
    analysis = result.scalars().unique().first()

    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found or you do not have permission to delete it.",
        )

    sample_id = analysis.sample_id

    await db.delete(analysis)
    await db.commit()

    # Audit log
    ip = request.client.host if request else None
    ua = request.headers.get("user-agent") if request else None
    await write_audit_log(
        db, current_user["user_id"], "delete_analysis",
        "analysis", current_user.get("organization_id"), analysis_id,
        details={"sample_id": sample_id},
        ip_address=ip, user_agent=ua,
    )


@router.get("/{analysis_id}/result")
async def get_analysis_result(
    analysis_id: str,
    current_user: dict = Depends(require_role("analyst", "manager", "auditor", "admin", "super_admin")),
    db: AsyncSession = Depends(get_db),
):
    """Get detailed analysis result (alias for GET /{analysis_id})"""
    return await get_analysis(analysis_id, current_user, db)





@router.post("/{analysis_id}/approve")
async def approve_analysis(
    analysis_id: str,
    request: Request = None,
    # Only MANAGER, ADMIN, or SUPER_ADMIN can approve results
    current_user: dict = Depends(require_role("manager", "admin", "super_admin")),
    db: AsyncSession = Depends(get_db),
):
    """Approve an analysis and mark it as validated"""
    try:
        analysis_uuid = uuid.UUID(analysis_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid analysis ID format",
        )

    # Multi-tenant security check
    org_id = current_user.get("organization_id")
    user_role = current_user.get("role")
    query_conditions = [Analysis.id == analysis_uuid]

    if user_role != "super_admin":
        if org_id:
            query_conditions.append(Analysis.organization_id == uuid.UUID(org_id))
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User tidak terdaftar pada organisasi manapun."
            )

    result = await db.execute(
        select(Analysis)
        .where(and_(*query_conditions))
        .options(selectinload(Analysis.detections), joinedload(Analysis.user))
    )
    analysis = result.scalars().unique().first()

    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found",
        )

    # Mark as approved (status remains COMPLETED)
    # BUG-023: Optimistic Locking
    if analysis.status != AnalysisStatus.COMPLETED:
        analysis.status = AnalysisStatus.COMPLETED

    # Override low reliability with high to mark as verified / valid for reporting
    analysis.reliability = "high"
    analysis.updated_at = datetime.now(timezone.utc) # Force version increment

    try:
        await db.commit()
    except StaleDataError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Data telah diubah oleh analis lain (Optimistic Lock). Silakan muat ulang halaman."
        )

    # Audit log: analysis approved
    ip = request.client.host if request else None
    ua = request.headers.get("user-agent") if request else None
    await write_audit_log(
        db, current_user["user_id"], "approve_analysis",
        "analysis", current_user.get("organization_id"), analysis_id,
        details={"sample_id": analysis.sample_id},
        ip_address=ip, user_agent=ua,
    )

    return _build_analysis_response(analysis)


@router.post("/{analysis_id}/review")
async def flag_for_review(
    analysis_id: str,
    body: FlagReviewRequest,
    http_request: Request = None,
    current_user: dict = Depends(require_role("analyst", "manager", "admin", "super_admin")),
    db: AsyncSession = Depends(get_db),
):
    """Flag an analysis for manual review"""
    try:
        analysis_uuid = uuid.UUID(analysis_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid analysis ID format",
        )

    org_id = current_user.get("organization_id")
    query_conditions = [Analysis.id == analysis_uuid]

    if current_user.get("role") != "super_admin":
        if org_id:
            query_conditions.append(Analysis.organization_id == uuid.UUID(org_id))
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User tidak terdaftar pada organisasi manapun."
            )

    result = await db.execute(
        select(Analysis)
        .where(and_(*query_conditions))
        .options(selectinload(Analysis.detections), joinedload(Analysis.user))
    )
    analysis = result.scalars().unique().first()

    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found",
        )

    # ── CRITICAL FIX: Validate reason and ensure warnings is a list ──
    # Pydantic already validated min/max length, but sanitize whitespace
    reason = body.reason.strip()
    
    # Ensure warnings is a list (DB JSON field could be corrupted/wrong type)
    warnings = analysis.warnings
    if not isinstance(warnings, list):
        logger.warning(f"Analysis {analysis_id} had non-list warnings: {type(warnings)}")
        warnings = []
    
    warnings.append(f"Manual review: {reason}")
    analysis.warnings = warnings
    await db.commit()
    await db.refresh(analysis)

    # Audit log: analysis flagged for review
    ip = http_request.client.host if http_request else None
    ua = http_request.headers.get("user-agent") if http_request else None
    await write_audit_log(
        db, current_user["user_id"], "flag_for_review",
        "analysis", current_user.get("organization_id"), analysis_id,
        details={"sample_id": analysis.sample_id, "reason": body.reason},
        ip_address=ip, user_agent=ua,
    )

    return _build_analysis_response(analysis)
