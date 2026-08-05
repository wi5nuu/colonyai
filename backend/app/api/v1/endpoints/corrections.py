from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional, Dict
from datetime import datetime, timezone
import uuid
import logging

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload

from app.core.security import require_role
from app.core.database import get_db
from app.models import (
    Analysis, CorrectionSession, Correction, ColonyDetection, User
)
from app.schemas.analyses import (
    CorrectionCreateRequest, CorrectionResponse,
    CorrectionSessionResponse, CorrectionReportResponse,
    BBoxResponse,
)

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/{analysis_id}/correction/start",
    response_model=CorrectionSessionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def start_correction_session(
    analysis_id: str,
    current_user: dict = Depends(require_role("analyst", "manager", "admin", "super_admin")),
    db: AsyncSession = Depends(get_db),
):
    """
    Start a new correction session for an analysis.
    Returns the session with all existing detections loaded for review.
    """
    analysis_uuid = uuid.UUID(analysis_id)
    
    # ── CRITICAL FIX: Multi-tenant security check ──
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
    
    # Analyst can only access own analyses
    if user_role == "analyst":
        query_conditions.append(Analysis.user_id == uuid.UUID(current_user["user_id"]))
    
    result = await db.execute(
        select(Analysis).where(and_(*query_conditions))
    )
    analysis = result.scalars().first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    session = CorrectionSession(
        id=uuid.uuid4(),
        analysis_id=analysis_uuid,
        user_id=uuid.UUID(current_user["user_id"]),
        status="active",
        total_corrections=0,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    return await _get_full_session(session.id, db)


@router.post(
    "/{analysis_id}/correction/save",
    response_model=CorrectionSessionResponse,
)
async def save_correction(
    analysis_id: str,
    body: CorrectionCreateRequest,
    current_user: dict = Depends(require_role("analyst", "manager", "admin", "super_admin")),
    db: AsyncSession = Depends(get_db),
):
    """
    Save one correction. If session_id is not provided, auto-creates a session.
    Returns updated session with all corrections.
    """

    analysis_uuid = uuid.UUID(analysis_id)
    user_uuid = uuid.UUID(current_user["user_id"])

    # ── CRITICAL FIX: Multi-tenant security check ──
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
    
    # Analyst can only access own analyses
    if user_role == "analyst":
        query_conditions.append(Analysis.user_id == user_uuid)

    result = await db.execute(
        select(Analysis).where(and_(*query_conditions))
    )
    analysis = result.scalars().first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    # Find or create active session
    result = await db.execute(
        select(CorrectionSession).where(
            and_(
                CorrectionSession.analysis_id == analysis_uuid,
                CorrectionSession.user_id == user_uuid,
                CorrectionSession.status == "active",
            )
        )
    )
    session = result.scalars().first()

    if not session:
        session = CorrectionSession(
            id=uuid.uuid4(),
            analysis_id=analysis_uuid,
            user_id=user_uuid,
            status="active",
        )
        db.add(session)
        await db.flush()

    detection_id = uuid.UUID(body.detection_id) if body.detection_id else None
    bbox = body.bbox

    # For existing detection, copy its bbox if not provided
    if detection_id and not bbox:
        det_result = await db.execute(
            select(ColonyDetection).where(ColonyDetection.id == detection_id)
        )
        det = det_result.scalars().first()
        if det:
            bbox = type('obj', (object,), {'x': det.bbox_x, 'y': det.bbox_y, 'width': det.bbox_width, 'height': det.bbox_height})()

    correction = Correction(
        id=uuid.uuid4(),
        session_id=session.id,
        analysis_id=analysis_uuid,
        detection_id=detection_id,
        user_id=user_uuid,
        original_class=body.original_class,
        corrected_class=body.corrected_class,
        bbox_x=bbox.x if bbox else None,
        bbox_y=bbox.y if bbox else None,
        bbox_width=bbox.width if bbox else None,
        bbox_height=bbox.height if bbox else None,
        notes=body.notes,
    )
    db.add(correction)

    session.total_corrections += 1
    await db.commit()

    return await _get_full_session(session.id, db)


@router.post(
    "/{analysis_id}/correction/finish",
    response_model=CorrectionSessionResponse,
)
async def finish_correction_session(
    analysis_id: str,
    current_user: dict = Depends(require_role("analyst", "manager", "admin", "super_admin")),
    db: AsyncSession = Depends(get_db),
):
    """
    Finish an active correction session and calculate accuracy.
    """
    user_uuid = uuid.UUID(current_user["user_id"])
    analysis_uuid = uuid.UUID(analysis_id)

    result = await db.execute(
        select(CorrectionSession).where(
            and_(
                CorrectionSession.analysis_id == analysis_uuid,
                CorrectionSession.user_id == user_uuid,
                CorrectionSession.status == "active",
            )
        ).options(selectinload(CorrectionSession.corrections))
    )
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="No active session found")

    session.status = "completed"
    session.completed_at = datetime.now(timezone.utc)

    # Calculate accuracy: corrections that keep original class = accurate
    if session.corrections:
        accurate = sum(
            1 for c in session.corrections
            if c.original_class == c.corrected_class
        )
        session.accuracy = accurate / len(session.corrections) if session.corrections else 1.0
    else:
        session.accuracy = 1.0

    await db.commit()
    return await _get_full_session(session.id, db)


@router.get(
    "/{analysis_id}/correction/report",
    response_model=CorrectionReportResponse,
)
async def get_correction_report(
    analysis_id: str,
    current_user: dict = Depends(require_role("analyst", "manager", "auditor", "admin", "super_admin")),
    db: AsyncSession = Depends(get_db),
):
    """
    Get correction summary report for an analysis.
    Includes per-class TP/FP/FN breakdown.
    """
    analysis_uuid = uuid.UUID(analysis_id)

    # ── CRITICAL FIX: Multi-tenant security check ──
    # First verify user has access to the analysis
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
    
    # Analyst can only access own analyses
    if user_role == "analyst":
        query_conditions.append(Analysis.user_id == uuid.UUID(current_user["user_id"]))
    
    analysis_result = await db.execute(
        select(Analysis).where(and_(*query_conditions))
    )
    analysis = analysis_result.scalars().first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    result = await db.execute(
        select(CorrectionSession).where(
            CorrectionSession.analysis_id == analysis_uuid
        ).options(selectinload(CorrectionSession.corrections)).order_by(CorrectionSession.created_at.desc())
    )
    sessions = result.scalars().unique().all()

    if not sessions:
        raise HTTPException(status_code=404, detail="No correction sessions found")

    latest = sessions[0]
    total = len(latest.corrections)

    # Per-class breakdown
    breakdown: Dict[str, dict] = {}
    for c in latest.corrections:
        cls = c.original_class or c.corrected_class
        if cls not in breakdown:
            breakdown[cls] = {"tp": 0, "fp": 0, "fn": 0, "count": 0}
        breakdown[cls]["count"] += 1
        if c.original_class == c.corrected_class:
            breakdown[cls]["tp"] += 1
        elif c.original_class is not None and c.corrected_class != c.original_class:
            breakdown[cls]["fp"] += 1
        if c.corrected_class != c.original_class and c.original_class is not None:
            pass

    return CorrectionReportResponse(
        session_id=str(latest.id),
        analysis_id=str(latest.analysis_id),
        total_corrections=total,
        accuracy=latest.accuracy,
        per_class_breakdown=breakdown,
        created_at=latest.created_at,
        completed_at=latest.completed_at,
    )


@router.get(
    "/{analysis_id}/correction/session",
    response_model=Optional[CorrectionSessionResponse],
)
async def get_active_session(
    analysis_id: str,
    current_user: dict = Depends(require_role("analyst", "manager", "auditor", "admin", "super_admin")),
    db: AsyncSession = Depends(get_db),
):
    """Get the active correction session for an analysis, if any."""
    analysis_uuid = uuid.UUID(analysis_id)
    user_uuid = uuid.UUID(current_user["user_id"])

    result = await db.execute(
        select(CorrectionSession).where(
            and_(
                CorrectionSession.analysis_id == analysis_uuid,
                CorrectionSession.user_id == user_uuid,
                CorrectionSession.status == "active",
            )
        ).options(selectinload(CorrectionSession.corrections))
    )
    session = result.scalars().first()
    if not session:
        return None

    return await _get_full_session(session.id, db)


async def _get_full_session(session_id: uuid.UUID, db: AsyncSession) -> CorrectionSessionResponse:
    result = await db.execute(
        select(CorrectionSession)
        .where(CorrectionSession.id == session_id)
        .options(selectinload(CorrectionSession.corrections))
    )
    session = result.scalars().first()
    return _build_session_response(session)


def _build_session_response(session: CorrectionSession) -> CorrectionSessionResponse:
    return CorrectionSessionResponse(
        id=str(session.id),
        analysis_id=str(session.analysis_id),
        status=session.status,
        total_corrections=session.total_corrections,
        accuracy=session.accuracy,
        created_at=session.created_at,
        completed_at=session.completed_at,
        corrections=[
            CorrectionResponse(
                id=str(c.id),
                session_id=str(c.session_id),
                analysis_id=str(c.analysis_id),
                detection_id=str(c.detection_id) if c.detection_id else None,
                original_class=c.original_class,
                corrected_class=c.corrected_class,
                bbox=BBoxResponse(
                    x=c.bbox_x, y=c.bbox_y,
                    width=c.bbox_width, height=c.bbox_height,
                ) if c.bbox_x is not None else None,
                notes=c.notes,
                created_at=c.created_at,
            )
            for c in (session.corrections or [])
        ],
    )
