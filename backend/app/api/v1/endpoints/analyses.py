from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from pathlib import Path
import uuid
import math
import os
import shutil

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc
from sqlalchemy.orm import joinedload

from app.core.security import get_current_user, require_role
from app.core.database import get_db
from app.core.config import settings
from app.utils.s3 import s3_is_configured, upload_to_s3, get_presigned_url
from app.services.colony_detector import ColonyDetector, VALID_COLONY_CLASSES
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
        class_breakdown=class_breakdown or analysis.class_breakdown,
        warnings=analysis.warnings or [],
        is_valid_for_reporting=is_valid,
        created_at=analysis.created_at,
        updated_at=analysis.updated_at,
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
    """Generate URL for a locally stored file"""
    if not file_path:
        return ""
    # Return relative URL path from uploads directory
    rel_path = os.path.relpath(file_path, settings.UPLOAD_DIR)
    return f"{settings.BACKEND_URL}/uploads/{rel_path.replace(os.sep, '/')}"


# ============================================================
# Request Models
# ============================================================

class FlagReviewRequest(BaseModel):
    reason: str


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
    request: Request = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new plate analysis.

    1. Save uploaded image
    2. Preprocess with OpenCV
    3. Run YOLOv8 5-class detection
    4. Calculate CFU/ml
    5. Save results to database
    6. Save annotated image
    7. Return full analysis result
    """
    # Validate file type
    allowed_types = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}",
        )

    # Validate file size
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning

    if file_size > settings.IMAGE_MAX_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum: {settings.IMAGE_MAX_SIZE // (1024*1024)}MB",
        )

    try:
        # Step 1: Save original image locally for processing
        original_dir = os.path.join(settings.UPLOAD_DIR, "original")
        original_path = _save_upload(file, original_dir)
        original_url = _get_file_url(original_path)

        # If S3 is configured, also upload to S3 and use presigned URL
        if s3_is_configured():
            ext = Path(file.filename).suffix if file.filename else ".jpg"
            original_basename = os.path.splitext(os.path.basename(original_path))[0]
            s3_key = f"{settings.AWS_S3_ORIGINAL_PREFIX}{original_basename}{ext}"
            with open(original_path, "rb") as f:
                upload_to_s3(f.read(), s3_key, content_type=file.content_type)
            original_url = get_presigned_url(s3_key) or s3_key

        # Step 2: Create analysis record (PROCESSING status)
        analysis_id = uuid.uuid4()
        analysis = Analysis(
            id=analysis_id,
            user_id=current_user["user_id"],
            sample_id=sample_id,
            media_type=media_type,
            dilution_factor=dilution_factor,
            plated_volume_ml=plated_volume_ml,
            original_image_url=original_url,
            status=AnalysisStatus.PROCESSING,
        )
        db.add(analysis)
        await db.commit()
        await db.refresh(analysis)

        # Step 3: Preprocess image
        image_processor = ImageProcessor()
        processed_image = image_processor.preprocess(original_path)

        # Step 4: Run YOLOv8 detection
        colony_detector = ColonyDetector()
        detections = colony_detector.detect(processed_image)

        # Step 5: Filter valid colonies and get summary
        valid_colonies = colony_detector.filter_valid_colonies(detections)
        class_breakdown = colony_detector.get_detection_summary(detections)
        valid_count = len(valid_colonies)
        avg_confidence = colony_detector.get_average_confidence(detections, valid_only=True)
        reliability = colony_detector.get_reliability_indicator(detections)

        # Step 6: Calculate CFU/ml
        cfu_calculator = CFUCalculator()
        cfu_result = cfu_calculator.calculate(
            colony_count=valid_count,
            dilution_factor=dilution_factor,
            plated_volume_ml=plated_volume_ml,
            confidence=avg_confidence,
            reliability=reliability,
            class_breakdown=class_breakdown,
            detections=detections,
        )

        # Map CFU status to AnalysisStatus
        if cfu_result.status == "valid":
            analysis_status = AnalysisStatus.COMPLETED
        elif cfu_result.status in ("TNTC", "TFTC"):
            analysis_status = AnalysisStatus.COMPLETED
        else:
            analysis_status = AnalysisStatus.FAILED

        # Step 7: Save annotated image
        if s3_is_configured():
            # Save to temp local file, then upload to S3
            annotated_dir = os.path.join(settings.UPLOAD_DIR, "annotated")
            annotated_filename = f"{analysis_id}.jpg"
            annotated_path = os.path.join(annotated_dir, annotated_filename)
            image_processor.save_annotated_image(processed_image, detections, annotated_path)
            s3_key = f"{settings.AWS_S3_ANNOTATED_PREFIX}{analysis_id}.jpg"
            with open(annotated_path, "rb") as f:
                upload_to_s3(f.read(), s3_key, content_type="image/jpeg")
            annotated_url = get_presigned_url(s3_key) or s3_key
        else:
            # Fallback: local storage
            annotated_dir = os.path.join(settings.UPLOAD_DIR, "annotated")
            annotated_filename = f"{analysis_id}.jpg"
            annotated_path = os.path.join(annotated_dir, annotated_filename)
            image_processor.save_annotated_image(processed_image, detections, annotated_path)
            annotated_url = _get_file_url(annotated_path)

        # Step 8: Update analysis record
        analysis.status = analysis_status
        analysis.colony_count = cfu_result.colony_count
        analysis.cfu_per_ml = cfu_result.cfu_per_ml
        analysis.confidence_score = cfu_result.confidence
        analysis.reliability = cfu_result.reliability
        analysis.annotated_image_url = annotated_url
        analysis.warnings = cfu_result.warning_messages
        analysis.class_breakdown = class_breakdown

        await db.commit()

        # Step 9: Save individual detection records
        for detection in detections:
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

        # Step 10: Reload analysis with detections
        result = await db.execute(
            select(Analysis)
            .where(Analysis.id == analysis_id)
            .options(joinedload(Analysis.detections), joinedload(Analysis.user))
        )
        analysis = result.scalars().unique().first()

        if not analysis:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve analysis after creation",
            )

        # Audit log: analysis created
        ip = request.client.host if request else None
        ua = request.headers.get("user-agent") if request else None
        await write_audit_log(
            db, current_user["user_id"], "create_analysis",
            "analysis", str(analysis_id),
            details={"sample_id": sample_id, "status": analysis_status.value if hasattr(analysis_status, 'value') else analysis_status},
            ip_address=ip, user_agent=ua,
        )

        return _build_analysis_response(analysis)

    except HTTPException:
        raise
    except Exception as e:
        # Update analysis to FAILED status
        try:
            analysis.status = AnalysisStatus.FAILED
            analysis.error_message = str(e)
            await db.commit()
        except Exception:
            pass

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}",
        )


@router.get("/", response_model=AnalysisListResponse)
async def list_analyses(
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    media_type: Optional[str] = None,
    status_filter: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List all analyses for the current user with pagination and filters.
    """
    # Build base query
    base_conditions = [Analysis.user_id == current_user["user_id"]]

    # Apply filters
    if search:
        search_pattern = f"%{search}%"
        base_conditions.append(
            (Analysis.sample_id.ilike(search_pattern)) |
            (Analysis.media_type.ilike(search_pattern))
        )

    if media_type:
        base_conditions.append(Analysis.media_type == media_type)

    if status_filter:
        base_conditions.append(Analysis.status == status_filter)

    if date_from:
        base_conditions.append(Analysis.created_at >= datetime.fromisoformat(date_from))

    if date_to:
        base_conditions.append(Analysis.created_at <= datetime.fromisoformat(date_to))

    # Get total count
    count_query = select(func.count()).select_from(Analysis).where(and_(*base_conditions))
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Get paginated results
    offset = (page - 1) * page_size
    query = (
        select(Analysis)
        .where(and_(*base_conditions))
        .options(joinedload(Analysis.detections))
        .order_by(desc(Analysis.created_at))
        .offset(offset)
        .limit(page_size)
    )
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


@router.get("/{analysis_id}")
async def get_analysis(
    analysis_id: str,
    current_user: dict = Depends(get_current_user),
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

    result = await db.execute(
        select(Analysis)
        .where(
            and_(
                Analysis.id == analysis_uuid,
                Analysis.user_id == current_user["user_id"],
            )
        )
        .options(joinedload(Analysis.detections), joinedload(Analysis.user))
    )
    analysis = result.scalars().unique().first()

    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found",
        )

    return _build_analysis_response(analysis)


@router.get("/{analysis_id}/result")
async def get_analysis_result(
    analysis_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get detailed analysis result (alias for GET /{analysis_id})"""
    return await get_analysis(analysis_id, current_user, db)


@router.get("/stats")
async def get_dashboard_stats(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get dashboard statistics for the current user"""
    user_id = current_user["user_id"]

    # Total analyses
    total_result = await db.execute(
        select(func.count()).select_from(Analysis).where(Analysis.user_id == user_id)
    )
    total_analyses = total_result.scalar() or 0

    # Success rate (valid / total)
    valid_result = await db.execute(
        select(func.count()).select_from(Analysis).where(
            and_(
                Analysis.user_id == user_id,
                Analysis.status == AnalysisStatus.COMPLETED,
            )
        )
    )
    valid_count = valid_result.scalar() or 0
    success_rate = (valid_count / total_analyses * 100) if total_analyses > 0 else 0.0

    # Pending review (TNTC or TFTC)
    review_result = await db.execute(
        select(func.count()).select_from(Analysis).where(
            and_(
                Analysis.user_id == user_id,
                Analysis.status == AnalysisStatus.COMPLETED,
                Analysis.reliability.in_(["low", "medium"]),
            )
        )
    )
    pending_review = review_result.scalar() or 0

    # Weekly trend (last 7 days)
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    weekly_trend = []

    for i in range(7):
        day_date = datetime.utcnow() - timedelta(days=6 - i)
        day_name = days[day_date.weekday()]

        day_start = day_date.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)

        day_result = await db.execute(
            select(func.count()).select_from(Analysis).where(
                and_(
                    Analysis.user_id == user_id,
                    Analysis.created_at >= day_start,
                    Analysis.created_at < day_end,
                )
            )
        )
        count = day_result.scalar() or 0
        weekly_trend.append(WeeklyTrendItem(day=day_name, analyses=count))

    # Recent analyses (last 5)
    recent_result = await db.execute(
        select(Analysis)
        .where(Analysis.user_id == user_id)
        .options(joinedload(Analysis.detections))
        .order_by(desc(Analysis.created_at))
        .limit(5)
    )
    recent_analyses = recent_result.scalars().unique().all()

    return DashboardStatsResponse(
        total_analyses=total_analyses,
        avg_time_saved_minutes=15,  # Per proposal: saves ~15-30 min per analysis
        success_rate=round(success_rate, 1),
        pending_review=pending_review,
        weekly_trend=weekly_trend,
        recent_analyses=[_build_brief_response(a) for a in recent_analyses],
    )


@router.post("/{analysis_id}/approve")
async def approve_analysis(
    analysis_id: str,
    request: Request = None,
    current_user: dict = Depends(require_role("analyst", "admin")),
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

    result = await db.execute(
        select(Analysis)
        .where(
            and_(
                Analysis.id == analysis_uuid,
                Analysis.user_id == current_user["user_id"],
            )
        )
        .options(joinedload(Analysis.detections), joinedload(Analysis.user))
    )
    analysis = result.scalars().unique().first()

    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found",
        )

    # Mark as approved (status remains COMPLETED)
    # Could add an 'approved' column later; for now ensure status is COMPLETED
    if analysis.status != AnalysisStatus.COMPLETED:
        analysis.status = AnalysisStatus.COMPLETED
        await db.commit()

    # Audit log: analysis approved
    ip = request.client.host if request else None
    ua = request.headers.get("user-agent") if request else None
    await write_audit_log(
        db, current_user["user_id"], "approve_analysis",
        "analysis", analysis_id,
        details={"sample_id": analysis.sample_id},
        ip_address=ip, user_agent=ua,
    )

    return _build_analysis_response(analysis)


@router.post("/{analysis_id}/review")
async def flag_for_review(
    analysis_id: str,
    body: FlagReviewRequest,
    http_request: Request = None,
    current_user: dict = Depends(require_role("analyst", "admin")),
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

    result = await db.execute(
        select(Analysis)
        .where(
            and_(
                Analysis.id == analysis_uuid,
                Analysis.user_id == current_user["user_id"],
            )
        )
        .options(joinedload(Analysis.detections), joinedload(Analysis.user))
    )
    analysis = result.scalars().unique().first()

    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found",
        )

    # Add review warning
    warnings = analysis.warnings or []
    warnings.append(f"Manual review: {body.reason}")
    analysis.warnings = warnings
    await db.commit()
    await db.refresh(analysis)

    # Audit log: analysis flagged for review
    ip = http_request.client.host if http_request else None
    ua = http_request.headers.get("user-agent") if http_request else None
    await write_audit_log(
        db, current_user["user_id"], "flag_for_review",
        "analysis", analysis_id,
        details={"sample_id": analysis.sample_id, "reason": body.reason},
        ip_address=ip, user_agent=ua,
    )

    return _build_analysis_response(analysis)
