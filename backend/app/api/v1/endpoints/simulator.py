"""
Simulator API Endpoints - ColonyAI

Manages manual vs AI comparison data for benchmarking and variability analysis.

Role-based access:
- Analyst: save/view own comparisons
- Manager: save/view org comparisons + org stats
- Admin: save/view org comparisons + org stats
- Auditor: NO access (use Audit Log for verification data)
- Super Admin: full access
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, Field
from typing import Optional
import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, and_, func
from sqlalchemy.orm import joinedload

from app.core.security import get_current_user, require_role
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
    notes: Optional[str] = Field(None, max_length=1000)  # HIGH FIX: Length limit to prevent abuse
    # Sandbox mode: client supplies AI breakdown when analysis is transient (not in DB)
    ai_class_breakdown: Optional[dict] = None
    ai_total_valid: Optional[int] = None
    overall_accuracy: Optional[float] = None


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
    if ai_count == 0 and manual_count == 0:
        return 100.0
    max_val = max(ai_count, manual_count)
    if max_val == 0:
        return 100.0
    diff = abs(ai_count - manual_count)
    return max(0.0, 100.0 - (diff / max_val) * 100.0)


# ============================================================
# WRITE Endpoints (Analyst, Manager, Admin, Super Admin)
# ============================================================

@router.post("/", response_model=ComparisonResponse)
async def save_comparison(
    body: ComparisonCreate,
    request: Request = None,
    current_user: dict = Depends(require_role("analyst", "manager", "admin", "super_admin")),
    db: AsyncSession = Depends(get_db),
):
    """
    Save a manual vs AI comparison for benchmarking.
    - Analyst: own comparisons only
    - Manager/Admin: comparisons within their organization
    - Super Admin: any comparison

    SANDBOX MODE: If analysis_id is a transient simulation UUID (not in DB),
    the client can supply ai_class_breakdown directly and the comparison is saved
    as a sandbox entry without requiring a persisted analysis record.
    """
    try:
        analysis_uuid = uuid.UUID(body.analysis_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid analysis ID")

    user_role = current_user.get("role")

    # Try to find persisted analysis with role-based scoping
    analysis_query = select(Analysis).where(Analysis.id == analysis_uuid)

    if user_role == "analyst":
        analysis_query = analysis_query.where(
            Analysis.user_id == uuid.UUID(current_user["user_id"])
        )
    elif user_role in ("manager", "admin"):
        org_id = current_user.get("organization_id")
        if org_id:
            analysis_query = analysis_query.where(
                Analysis.organization_id == uuid.UUID(org_id)
            )
    # Super Admin: no additional filter

    result = await db.execute(analysis_query)
    analysis = result.scalars().first()

    # ── SANDBOX MODE ──
    # If analysis not in DB (transient simulation), use client-supplied breakdown
    if analysis is None:
        if body.ai_class_breakdown is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis not found. For simulation mode, supply ai_class_breakdown in the request body."
            )
        
        # ── CRITICAL FIX: Validate client-supplied sandbox data ──
        # Prevent mass assignment attacks by validating structure and ranges
        if not isinstance(body.ai_class_breakdown, dict):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ai_class_breakdown must be a dictionary"
            )
        
        # Whitelist expected keys and validate non-negative integers
        allowed_keys = {"colony_single", "colony_merged", "bubble", "dust_debris", "media_crack"}
        for key, value in body.ai_class_breakdown.items():
            if key not in allowed_keys:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid key in ai_class_breakdown: {key}"
                )
            if not isinstance(value, int) or value < 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"ai_class_breakdown values must be non-negative integers"
                )
        
        if body.ai_total_valid is not None and (not isinstance(body.ai_total_valid, int) or body.ai_total_valid < 0):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ai_total_valid must be a non-negative integer"
            )
        
        # Use data supplied by client (from the /simulate response)
        ai_breakdown = body.ai_class_breakdown
        ai_single = ai_breakdown.get("colony_single", 0)
        ai_merged = ai_breakdown.get("colony_merged", 0)
        ai_total_valid = body.ai_total_valid if body.ai_total_valid is not None else (ai_single + ai_merged)
    else:
        # ── CRITICAL FIX: NEVER trust client-supplied values for persisted analyses ──
        # Use ONLY AI breakdown stored in DB; ignore client-supplied fields
        ai_breakdown = analysis.class_breakdown or {}
        ai_single = ai_breakdown.get("colony_single", 0)
        ai_merged = ai_breakdown.get("colony_merged", 0)
        ai_total_valid = ai_single + ai_merged
    
    # ── Validate manual counts (always user-supplied) ──
    if body.manual_colony_single < 0 or body.manual_colony_merged < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Manual colony counts must be non-negative"
        )
    if body.manual_bubble < 0 or body.manual_dust_debris < 0 or body.manual_media_crack < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Manual artifact counts must be non-negative"
        )

    # Calculate agreements per class
    agreement_single = calculate_agreement(ai_single, body.manual_colony_single)
    agreement_merged = calculate_agreement(ai_merged, body.manual_colony_merged)
    agreement_bubble = calculate_agreement(ai_breakdown.get("bubble", 0), body.manual_bubble)
    agreement_dust = calculate_agreement(ai_breakdown.get("dust_debris", 0), body.manual_dust_debris)
    agreement_crack = calculate_agreement(ai_breakdown.get("media_crack", 0), body.manual_media_crack)

    # ── CRITICAL FIX: overall_accuracy mass assignment ──
    # Only trust client-supplied overall_accuracy in SANDBOX mode (analysis is None).
    # For persisted analyses, ALWAYS compute from agreements to prevent manipulation.
    if analysis is None and body.overall_accuracy is not None:
        # Sandbox mode: client can supply spatial matching accuracy
        if not isinstance(body.overall_accuracy, (int, float)) or not (0 <= body.overall_accuracy <= 100):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="overall_accuracy must be a number between 0 and 100"
            )
        overall_accuracy = body.overall_accuracy
    else:
        # Persisted analysis OR no client value: compute from class agreements
        overall_accuracy = (agreement_single + agreement_merged + agreement_bubble + agreement_dust + agreement_crack) / 5

    comparison = SimulatorComparison(
        id=uuid.uuid4(),
        organization_id=uuid.UUID(current_user["organization_id"]) if current_user.get("organization_id") else None,
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
        details={
            "analysis_id": str(analysis_uuid),
            "overall_accuracy": comparison.overall_accuracy,
            "sandbox_mode": analysis is None
        },
        ip_address=ip, user_agent=ua,
    )

    return comparison


# ============================================================
# READ Endpoints (Analyst=own, Manager/Admin=org, Auditor=org read, Super Admin=all)
# ============================================================

@router.get("/analysis/{analysis_id}")
async def get_comparison(
    analysis_id: str,
    current_user: dict = Depends(require_role("analyst", "manager", "admin", "auditor", "super_admin")),
    db: AsyncSession = Depends(get_db),
):
    """Get comparison for a specific analysis with role-based scoping."""
    try:
        analysis_uuid = uuid.UUID(analysis_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid analysis ID")

    query = (
        select(SimulatorComparison)
        .where(
            SimulatorComparison.analysis_id == analysis_uuid,
        )
        .order_by(desc(SimulatorComparison.created_at))
        .limit(1)
    )

    # Role-based scoping
    user_role = current_user.get("role")
    if user_role == "analyst":
        query = query.where(
            SimulatorComparison.user_id == uuid.UUID(current_user["user_id"])
        )
    elif user_role in ("manager", "admin", "auditor"):
        org_id = current_user.get("organization_id")
        if org_id:
            # Join to Analysis to filter by organization
            query = query.join(
                Analysis, SimulatorComparison.analysis_id == Analysis.id
            ).where(
                Analysis.organization_id == uuid.UUID(org_id)
            )

    result = await db.execute(query)
    comparison = result.scalars().first()

    if not comparison:
        return None

    return ComparisonResponse.model_validate(comparison)


@router.get("/")
async def list_comparisons(
    page: int = 1,
    page_size: int = 20,
    current_user: dict = Depends(require_role("analyst", "manager", "admin", "auditor", "super_admin")),
    db: AsyncSession = Depends(get_db),
):
    """
    List comparisons with role-based scoping:
    - Analyst: own comparisons only
    - Manager/Admin/Auditor: all org comparisons
    - Super Admin: all comparisons
    """
    # ── CRITICAL FIX: Enforce pagination limits to prevent DoS ──
    MAX_PAGE_SIZE = 100
    page = max(1, page)
    page_size = max(1, min(page_size, MAX_PAGE_SIZE))
    
    user_role = current_user.get("role")
    offset = (page - 1) * page_size

    query = (
        select(SimulatorComparison)
        .options(joinedload(SimulatorComparison.analysis))
        .order_by(desc(SimulatorComparison.created_at))
        .offset(offset)
        .limit(page_size)
    )

    count_query = select(func.count()).select_from(SimulatorComparison)

    if user_role == "analyst":
        user_id = uuid.UUID(current_user["user_id"])
        query = query.where(SimulatorComparison.user_id == user_id)
        count_query = count_query.where(SimulatorComparison.user_id == user_id)
    elif user_role in ("manager", "admin", "auditor"):
        org_id = current_user.get("organization_id")
        if org_id:
            query = (
                query.join(Analysis, SimulatorComparison.analysis_id == Analysis.id)
                .where(Analysis.organization_id == uuid.UUID(org_id))
            )
            count_query = (
                count_query.join(Analysis, SimulatorComparison.analysis_id == Analysis.id)
                .where(Analysis.organization_id == uuid.UUID(org_id))
            )

    result = await db.execute(query)
    comparisons = result.scalars().unique().all()

    total = (await db.execute(count_query)).scalar() or 0

    return {
        "comparisons": [ComparisonResponse.model_validate(c) for c in comparisons],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if total > 0 else 0,
    }


@router.get("/stats")
async def get_comparator_stats(
    current_user: dict = Depends(require_role("analyst", "manager", "admin", "auditor", "super_admin")),
    db: AsyncSession = Depends(get_db),
):
    """
    Get aggregate statistics for variability analysis.
    - Analyst: own stats only
    - Manager/Admin/Auditor: org-wide stats
    - Super Admin: global stats
    """
    user_role = current_user.get("role")

    query = select(SimulatorComparison)

    if user_role == "analyst":
        user_id = uuid.UUID(current_user["user_id"])
        query = query.where(SimulatorComparison.user_id == user_id)
    elif user_role in ("manager", "admin", "auditor"):
        org_id = current_user.get("organization_id")
        if org_id:
            query = (
                query.join(Analysis, SimulatorComparison.analysis_id == Analysis.id)
                .where(Analysis.organization_id == uuid.UUID(org_id))
            )

    result = await db.execute(query)
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
