from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
import os
import csv
import io
from pathlib import Path

from app.core.security import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models import Analysis, ColonyDetection
from app.schemas.analyses import ReportResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import joinedload

router = APIRouter()


class ReportRequest(BaseModel):
    report_type: str = "custom"  # daily, weekly, custom
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    format: str = "pdf"  # pdf, csv


@router.post("/pdf", response_model=ReportResponse)
async def generate_pdf_report(
    request: ReportRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Generate PDF report for analyses.
    
    For now, generates a CSV file with .pdf extension as a placeholder.
    Full PDF generation with reportlab can be added later.
    """
    # Query analyses for the date range
    conditions = [Analysis.user_id == current_user["user_id"]]

    if request.date_from:
        conditions.append(Analysis.created_at >= datetime.fromisoformat(request.date_from))
    if request.date_to:
        conditions.append(Analysis.created_at <= datetime.fromisoformat(request.date_to))

    result = await db.execute(
        select(Analysis)
        .where(and_(*conditions))
        .options(joinedload(Analysis.detections))
        .order_by(Analysis.created_at.desc())
    )
    analyses = result.scalars().unique().all()

    if not analyses:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No analyses found for the specified date range",
        )

    # Generate CSV content (as PDF placeholder)
    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        "Analysis ID",
        "Sample ID",
        "Media Type",
        "Dilution Factor",
        "Plated Volume (ml)",
        "Colony Count",
        "CFU/ml",
        "Confidence",
        "Reliability",
        "Status",
        "Date",
    ])

    # Data rows
    for analysis in analyses:
        status_str = analysis.status.value if hasattr(analysis.status, 'value') else str(analysis.status)
        writer.writerow([
            str(analysis.id),
            analysis.sample_id,
            analysis.media_type,
            analysis.dilution_factor,
            analysis.plated_volume_ml,
            analysis.colony_count or 0,
            f"{analysis.cfu_per_ml:.2e}" if analysis.cfu_per_ml else "N/A",
            f"{analysis.confidence_score * 100:.1f}%" if analysis.confidence_score else "N/A",
            analysis.reliability or "N/A",
            status_str,
            analysis.created_at.isoformat(),
        ])

    # Save to file
    reports_dir = os.path.join(settings.UPLOAD_DIR, "reports")
    Path(reports_dir).mkdir(parents=True, exist_ok=True)

    report_id = str(uuid.uuid4())
    filename = f"colonyai-report-{report_id}.csv"
    file_path = os.path.join(reports_dir, filename)

    with open(file_path, "w", newline="", encoding="utf-8") as f:
        f.write(output.getvalue())

    # Generate URL
    url = f"{settings.BACKEND_URL}/uploads/reports/{filename}"
    expires_at = datetime.utcnow().replace(hour=23, minute=59, second=59).isoformat()

    return ReportResponse(
        url=url,
        filename=filename,
        expires_at=expires_at,
    )


@router.post("/csv", response_model=ReportResponse)
async def generate_csv_report(
    request: ReportRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Generate CSV report with detailed detection data.
    
    Includes one row per detection across all analyses in the date range.
    """
    # Query analyses for the date range
    conditions = [Analysis.user_id == current_user["user_id"]]

    if request.date_from:
        conditions.append(Analysis.created_at >= datetime.fromisoformat(request.date_from))
    if request.date_to:
        conditions.append(Analysis.created_at <= datetime.fromisoformat(request.date_to))

    result = await db.execute(
        select(Analysis)
        .where(and_(*conditions))
        .options(joinedload(Analysis.detections))
        .order_by(Analysis.created_at.desc())
    )
    analyses = result.scalars().unique().all()

    if not analyses:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No analyses found for the specified date range",
        )

    # Generate CSV with detailed detections
    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        "Analysis ID",
        "Sample ID",
        "Media Type",
        "Dilution Factor",
        "Plated Volume (ml)",
        "Total Colonies",
        "CFU/ml",
        "Status",
        "Detection Class",
        "Detection Confidence",
        "BBox X",
        "BBox Y",
        "BBox Width",
        "BBox Height",
    ])

    # Data rows (one per detection)
    for analysis in analyses:
        status_str = analysis.status.value if hasattr(analysis.status, 'value') else str(analysis.status)

        if analysis.detections:
            for detection in analysis.detections:
                writer.writerow([
                    str(analysis.id),
                    analysis.sample_id,
                    analysis.media_type,
                    analysis.dilution_factor,
                    analysis.plated_volume_ml,
                    analysis.colony_count or 0,
                    f"{analysis.cfu_per_ml:.2e}" if analysis.cfu_per_ml else "N/A",
                    status_str,
                    detection.class_name,
                    f"{detection.confidence * 100:.1f}%",
                    detection.bbox_x,
                    detection.bbox_y,
                    detection.bbox_width,
                    detection.bbox_height,
                ])
        else:
            # Summary row only if no detections
            writer.writerow([
                str(analysis.id),
                analysis.sample_id,
                analysis.media_type,
                analysis.dilution_factor,
                analysis.plated_volume_ml,
                analysis.colony_count or 0,
                f"{analysis.cfu_per_ml:.2e}" if analysis.cfu_per_ml else "N/A",
                status_str,
                "", "", "", "", "", "",
            ])

    # Save to file
    reports_dir = os.path.join(settings.UPLOAD_DIR, "reports")
    Path(reports_dir).mkdir(parents=True, exist_ok=True)

    report_id = str(uuid.uuid4())
    filename = f"colonyai-report-{report_id}.csv"
    file_path = os.path.join(reports_dir, filename)

    with open(file_path, "w", newline="", encoding="utf-8") as f:
        f.write(output.getvalue())

    # Generate URL
    url = f"{settings.BACKEND_URL}/uploads/reports/{filename}"
    expires_at = datetime.utcnow().replace(hour=23, minute=59, second=59).isoformat()

    return ReportResponse(
        url=url,
        filename=filename,
        expires_at=expires_at,
    )


@router.get("/{report_id}/download")
async def download_report(
    report_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Download a generated report file"""
    reports_dir = os.path.join(settings.UPLOAD_DIR, "reports")

    # Find the report file
    if not os.path.exists(reports_dir):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )

    for filename in os.listdir(reports_dir):
        if report_id in filename:
            file_path = os.path.join(reports_dir, filename)
            media_type = "text/csv" if filename.endswith(".csv") else "application/pdf"
            return FileResponse(
                file_path,
                media_type=media_type,
                filename=filename,
            )

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Report not found",
    )
