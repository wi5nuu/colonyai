"""
Simulator API Endpoints - ColonyAI

Manages manual vs AI comparison data for benchmarking and variability analysis.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel
from typing import Optional
import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import joinedload

from app.core.security import get_current_user
from app.core.database import get_db
from app.models import SimulatorComparison, User, Analysis
from app.utils.audit import write_audit_log

router = APIRouter()


# ============================================================
# Request/Response Models
# ============================================================

class ComparisonCreate(BaseModel):
    analysis_id: str
    manual_colony_single: int = 0
    manual_colony_merged: int = 0
    manual_bubble: int = 0
    manual_dust_debris: int = 0
    manual_media_crack: int = 0
    notes: Optional[str] = None


class ComparisonResponse(BaseModel):
    id: str
    analysis_id: str
    ai_class_breakdown: dict
    ai_total_valid: int
    manual_colony_single: int
    manual_colony_merged: int
    manual_bubble: int
    manual_dust_debris: int
    manual_media_crack: int
    manual_total_valid: int
    agreement_single: Optional[float]
    agreement_merged: Optional[float]
    agreement_bubble: Optional[float]
    agreement_dust_debris: Optional[float]
    agreement_media_crack: Optional[float]
    overall_accuracy: Optional[float]
    notes: Optional[str]
    created_at: str

    class Config:
        from_attributes = True


# ============================================================
# Helper Functions
# ============================================================

def calculate_agreement(ai_count: int, manual_count: int) -> float:
    """Calculate agreement percentage between AI and manual count."""
    max_val = max(ai_count, manual_count)
    if max_val == 0:
        return 100.0
    diff = abs(ai_count - manual_count)
    return max(0.0, 100.0 - (diff / max_val) * 100.0)


# ============================================================
# Endpoints
# ============================================================

@router.post("/", response_model=ComparisonResponse)
async def save_comparison(
    body: ComparisonCreate,
    request: Request = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Save a manual vs AI comparison for benchmarking.
    Replaces localStorage-only storage with database persistence.
    """
    try:
        analysis_uuid = uuid.UUID(body.analysis_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid analysis ID")

    # Verify analysis exists and belongs to user
    result = await db.execute(
        select(Analysis).where(
            Analysis.id == analysis_uuid,
            Analysis.user_id == uuid.UUID(current_user["user_id"])
        )
    )
    analysis = result.scalars().first()
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")

    # Get AI class breakdown from analysis
    ai_breakdown = analysis.class_breakdown or {}
    ai_single = ai_breakdown.get("colony_single", 0)
    ai_merged = ai_breakdown.get("colony_merged", 0)
    ai_total_valid = ai_single + ai_merged

    # Calculate agreements
    agreement_single = calculate_agreement(ai_single, body.manual_colony_single)
    agreement_merged = calculate_agreement(ai_merged, body.manual_colony_merged)
    agreement_bubble = calculate_agreement(ai_breakdown.get("bubble", 0), body.manual_bubble)
    agreement_dust = calculate_agreement(ai_breakdown.get("dust_debris", 0), body.manual_dust_debris)
    agreement_crack = calculate_agreement(ai_breakdown.get("media_crack", 0), body.manual_media_crack)

    # Overall accuracy = average of all 5 class agreements
    overall_accuracy = (agreement_single + agreement_merged + agreement_bubble + agreement_dust + agreement_crack) / 5

    # Calculate error margins (absolute difference per class)
    error_single = abs(ai_single - body.manual_colony_single)
    error_merged = abs(ai_merged - body.manual_colony_merged)
    error_bubble = abs(ai_breakdown.get("bubble", 0) - body.manual_bubble)
    error_dust = abs(ai_breakdown.get("dust_debris", 0) - body.manual_dust_debris)
    error_crack = abs(ai_breakdown.get("media_crack", 0) - body.manual_media_crack)
    total_error = error_single + error_merged + error_bubble + error_dust + error_crack

    comparison = SimulatorComparison(
        id=uuid.uuid4(),
        user_id=uuid.UUID(current_user["user_id"]),
        analysis_id=analysis_uuid,
        ai_class_breakdown=ai_breakdown,
        ai_total_valid=ai_total_valid,
        manual_colony_single=body.manual_colony_single,
        manual_colony_merged=body.manual_colony_merged,
        manual_bubble=body.manual_bubble,
        manual_dust_debris=body.manual_dust_debris,
        manual_media_crack=body.manual_media_crack,
        manual_total_valid=body.manual_colony_single + body.manual_colony_merged,
        agreement_single=round(agreement_single, 2),
        agreement_merged=round(agreement_merged, 2),
        agreement_bubble=round(agreement_bubble, 2),
        agreement_dust_debris=round(agreement_dust, 2),
        agreement_media_crack=round(agreement_crack, 2),
        overall_accuracy=round(overall_accuracy, 2),
        notes=body.notes,
    )
    db.add(comparison)
    await db.commit()
    await db.refresh(comparison)

    # Audit log
    ip = request.client.host if request else None
    ua = request.headers.get("user-agent") if request else None
    await write_audit_log(
        db, current_user["user_id"], "save_comparison",
        "simulator_comparison", str(comparison.id),
        details={"analysis_id": str(analysis_uuid), "overall_accuracy": comparison.overall_accuracy},
        ip_address=ip, user_agent=ua,
    )

    return comparison


@router.get("/analysis/{analysis_id}")
async def get_comparison(
    analysis_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get comparison for a specific analysis."""
    try:
        analysis_uuid = uuid.UUID(analysis_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid analysis ID")

    result = await db.execute(
        select(SimulatorComparison).where(
            SimulatorComparison.analysis_id == analysis_uuid,
            SimulatorComparison.user_id == uuid.UUID(current_user["user_id"])
        ).order_by(desc(SimulatorComparison.created_at)).limit(1)
    )
    comparison = result.scalars().first()

    if not comparison:
        return None

    return ComparisonResponse.model_validate(comparison)


@router.get("/")
async def list_comparisons(
    page: int = 1,
    page_size: int = 20,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all comparisons for the current user."""
    user_id = uuid.UUID(current_user["user_id"])
    offset = (page - 1) * page_size

    result = await db.execute(
        select(SimulatorComparison)
        .where(SimulatorComparison.user_id == user_id)
        .options(joinedload(SimulatorComparison.analysis))
        .order_by(desc(SimulatorComparison.created_at))
        .offset(offset)
        .limit(page_size)
    )
    comparisons = result.scalars().unique().all()

    # Get total count
    count_result = await db.execute(
        select(__import__('sqlalchemy').func.count()).select_from(SimulatorComparison).where(
            SimulatorComparison.user_id == user_id
        )
    )
    total = count_result.scalar() or 0

    return {
        "comparisons": [ComparisonResponse.model_validate(c) for c in comparisons],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if total > 0 else 0,
    }


@router.get("/stats")
async def get_comparator_stats(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get aggregate statistics for variability analysis.
    Used for executive summary PDF reports.
    """
    user_id = uuid.UUID(current_user["user_id"])

    result = await db.execute(
        select(SimulatorComparison).where(SimulatorComparison.user_id == user_id)
    )
    comparisons = result.scalars().all()

    if not comparisons:
        return {
            "total_comparisons": 0,
            "avg_overall_accuracy": 0,
            "min_accuracy": 0,
            "max_accuracy": 0,
            "avg_agreement_per_class": {},
        }

    accuracies = [c.overall_accuracy for c in comparisons if c.overall_accuracy is not None]
    if not accuracies:
        return {"total_comparisons": len(comparisons), "avg_overall_accuracy": 0}

    # Average agreement per class
    single_agreements = [c.agreement_single for c in comparisons if c.agreement_single is not None]
    merged_agreements = [c.agreement_merged for c in comparisons if c.agreement_merged is not None]
    bubble_agreements = [c.agreement_bubble for c in comparisons if c.agreement_bubble is not None]
    dust_agreements = [c.agreement_dust_debris for c in comparisons if c.agreement_dust_debris is not None]
    crack_agreements = [c.agreement_media_crack for c in comparisons if c.agreement_media_crack is not None]

    return {
        "total_comparisons": len(comparisons),
        "avg_overall_accuracy": round(sum(accuracies) / len(accuracies), 2),
        "min_accuracy": round(min(accuracies), 2),
        "max_accuracy": round(max(accuracies), 2),
        "avg_agreement_per_class": {
            "colony_single": round(sum(single_agreements) / len(single_agreements), 2) if single_agreements else 0,
            "colony_merged": round(sum(merged_agreements) / len(merged_agreements), 2) if merged_agreements else 0,
            "bubble": round(sum(bubble_agreements) / len(bubble_agreements), 2) if bubble_agreements else 0,
            "dust_debris": round(sum(dust_agreements) / len(dust_agreements), 2) if dust_agreements else 0,
            "media_crack": round(sum(crack_agreements) / len(crack_agreements), 2) if crack_agreements else 0,
        },
    }
