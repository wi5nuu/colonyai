from fastapi import APIRouter, Depends, Query
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
import uuid
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Organization, Analysis, AnalysisStatus
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

def escape_like_pattern(s: str) -> str:
    """Escape SQL wildcards to prevent SQL injection via ILIKE"""
    return s.replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_')

class SearchResultItem(BaseModel):
    id: str
    type: str
    titleEN: str
    titleID: str
    detailsEN: str
    detailsID: str
    statusEN: str
    statusID: str
    date: str

class SearchResponse(BaseModel):
    items: List[SearchResultItem]
    total: int

@router.get("", response_model=SearchResponse)
async def global_search(
    q: str = Query("", min_length=0, max_length=100),
    limit: int = Query(10, ge=1, le=50),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Global search with authentication and organization scoping.
    - Super Admin: searches all organizations
    - Other roles: searches only within their organization
    """
    results = []
    user_role = current_user.get("role")
    org_id = current_user.get("organization_id")
    
    # Calculate per-query limits to respect total limit
    org_limit = limit // 2
    analysis_limit = limit - org_limit

    if q:
        # Escape SQL wildcards to prevent injection
        pattern = f"%{escape_like_pattern(q)}%"

        # Organization search with role-based scoping
        org_query = select(Organization).where(
            Organization.is_active.in_(["active", "trial"]),
            or_(
                Organization.name.ilike(pattern),
                Organization.slug.ilike(pattern),
                Organization.location.ilike(pattern),
            )
        )
        
        # Apply organization filter for non-super_admin users
        if user_role != "super_admin" and org_id:
            org_query = org_query.where(Organization.id == uuid.UUID(org_id))
        
        org_query = org_query.limit(org_limit)
        org_result = await db.execute(org_query)
        organizations = org_result.scalars().all()

        for org in organizations:
            results.append(SearchResultItem(
                id=str(org.id)[:8],
                type="laboratory",
                titleEN=org.name,
                titleID=org.name,
                detailsEN=f"{org.location or 'No location'} | {org.institution_type or 'Laboratory'} | {org.compliance_standard or 'ISO-17025'}",
                detailsID=f"{org.location or 'No location'} | {org.institution_type or 'Laboratory'} | {org.compliance_standard or 'ISO-17025'}",
                statusEN="Operational" if org.is_active == "active" else "Trial",
                statusID="Operational" if org.is_active == "active" else "Trial",
                date="Active",
            ))

        # Calculate remaining limit for analyses
        remaining_limit = limit - len(results)
        
        # Analysis search with role-based scoping
        analysis_query = select(Analysis).where(
            Analysis.status == AnalysisStatus.COMPLETED,
            or_(
                Analysis.sample_id.ilike(pattern),
                Analysis.media_type.ilike(pattern),
            )
        )
        
        # Apply organization filter for non-super_admin users
        if user_role != "super_admin" and org_id:
            analysis_query = analysis_query.where(Analysis.organization_id == uuid.UUID(org_id))
        
        analysis_query = analysis_query.limit(remaining_limit)
        analysis_result = await db.execute(analysis_query)
        analyses = analysis_result.scalars().all()

        for a in analyses:
            results.append(SearchResultItem(
                id=a.sample_id or str(a.id)[:8],
                type="specimen",
                titleEN=f"{a.sample_id or 'Sample'} - {a.media_type or 'Agar Plate'}",
                titleID=f"{a.sample_id or 'Sample'} - {a.media_type or 'Agar Plate'}",
                detailsEN=f"Status: {a.status.value} | Media: {a.media_type or 'N/A'} | Dilution: {a.dilution_factor or 'N/A'}",
                detailsID=f"Status: {a.status.value} | Media: {a.media_type or 'N/A'} | Dilution: {a.dilution_factor or 'N/A'}",
                statusEN=a.status.value.capitalize(),
                statusID=a.status.value.capitalize(),
                date=a.created_at.strftime("%Y-%m-%d") if a.created_at else "N/A",
            ))
    else:
        # Empty query - return recent items with organization scoping
        org_query = select(Organization).where(
            Organization.is_active.in_(["active", "trial"])
        )
        
        # Apply organization filter for non-super_admin users
        if user_role != "super_admin" and org_id:
            org_query = org_query.where(Organization.id == uuid.UUID(org_id))
        
        org_query = org_query.limit(org_limit)
        org_result = await db.execute(org_query)
        organizations = org_result.scalars().all()

        for org in organizations:
            results.append(SearchResultItem(
                id=str(org.id)[:8],
                type="laboratory",
                titleEN=org.name,
                titleID=org.name,
                detailsEN=f"{org.location or 'No location'} | {org.institution_type or 'Laboratory'} | {org.compliance_standard or 'ISO-17025'}",
                detailsID=f"{org.location or 'No location'} | {org.institution_type or 'Laboratory'} | {org.compliance_standard or 'ISO-17025'}",
                statusEN="Operational" if org.is_active == "active" else "Trial",
                statusID="Operational" if org.is_active == "active" else "Trial",
                date="Active",
            ))

        # Calculate remaining limit for analyses
        remaining_limit = limit - len(results)
        
        analysis_query = select(Analysis).where(
            Analysis.status == AnalysisStatus.COMPLETED
        )
        
        # Apply organization filter for non-super_admin users
        if user_role != "super_admin" and org_id:
            analysis_query = analysis_query.where(Analysis.organization_id == uuid.UUID(org_id))
        
        analysis_query = analysis_query.limit(remaining_limit)
        analysis_result = await db.execute(analysis_query)
        analyses = analysis_result.scalars().all()

        for a in analyses:
            results.append(SearchResultItem(
                id=a.sample_id or str(a.id)[:8],
                type="specimen",
                titleEN=f"{a.sample_id or 'Sample'} - {a.media_type or 'Agar Plate'}",
                titleID=f"{a.sample_id or 'Sample'} - {a.media_type or 'Agar Plate'}",
                detailsEN=f"Status: {a.status.value} | Media: {a.media_type or 'N/A'} | Dilution: {a.dilution_factor or 'N/A'}",
                detailsID=f"Status: {a.status.value} | Media: {a.media_type or 'N/A'} | Dilution: {a.dilution_factor or 'N/A'}",
                statusEN=a.status.value.capitalize(),
                statusID=a.status.value.capitalize(),
                date=a.created_at.strftime("%Y-%m-%d") if a.created_at else "N/A",
            ))

    return SearchResponse(items=results, total=len(results))
