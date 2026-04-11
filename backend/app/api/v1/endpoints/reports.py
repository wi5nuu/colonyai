from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
import os
import csv
import io
from pathlib import Path

from app.core.security import get_current_user, require_role
from app.core.config import settings
from app.core.database import get_db
from app.models import Analysis, ColonyDetection, AnalysisStatus
from app.schemas.analyses import ReportResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
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
    http_request: Request = None,
    current_user: dict = Depends(require_role("analyst", "admin")),
    db: AsyncSession = Depends(get_db),
):
    """
    Generate a BPOM-compliant PDF report using reportlab.

    Format: A4, Times New Roman 12pt.
    Contents: sample info, detection summary table, CFU/ml value,
              analyst signature field, timestamp.
    """
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm, cm
    from reportlab.lib.colors import black, HexColor
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
        PageBreak, KeepTogether,
    )
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont

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

    # --- Build PDF ---
    reports_dir = os.path.join(settings.UPLOAD_DIR, "reports")
    Path(reports_dir).mkdir(parents=True, exist_ok=True)

    report_id = str(uuid.uuid4())
    filename = f"colonyai-report-{report_id}.pdf"
    file_path = os.path.join(reports_dir, filename)

    doc = SimpleDocTemplate(
        file_path,
        pagesize=A4,
        topMargin=2.5 * cm,
        bottomMargin=2.5 * cm,
        leftMargin=2.5 * cm,
        rightMargin=2.5 * cm,
    )

    # Styles – Times New Roman 12pt base
    base_font_name = "Times-Roman"  # reportlab built-in
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Title"],
        fontName=base_font_name,
        fontSize=16,
        leading=20,
        alignment=TA_CENTER,
        spaceAfter=6,
    )
    subtitle_style = ParagraphStyle(
        "CustomSubtitle",
        parent=styles["Normal"],
        fontName=base_font_name,
        fontSize=12,
        leading=14,
        alignment=TA_CENTER,
        spaceAfter=12,
    )
    heading_style = ParagraphStyle(
        "CustomHeading",
        parent=styles["Heading2"],
        fontName=base_font_name,
        fontSize=13,
        leading=16,
        spaceBefore=12,
        spaceAfter=6,
    )
    body_style = ParagraphStyle(
        "CustomBody",
        parent=styles["Normal"],
        fontName=base_font_name,
        fontSize=12,
        leading=14,
        spaceAfter=4,
    )
    small_style = ParagraphStyle(
        "SmallText",
        parent=styles["Normal"],
        fontName=base_font_name,
        fontSize=10,
        leading=12,
    )

    elements = []

    # --- Title block ---
    elements.append(Paragraph("ColonyAI Analysis Report", title_style))
    elements.append(Paragraph("BPOM-Compliant Laboratory Report", subtitle_style))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph(
        f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}",
        small_style,
    ))
    elements.append(Paragraph(
        f"Report ID: {report_id}",
        small_style,
    ))
    elements.append(Spacer(1, 12))

    # --- Overall detection summary ---
    total_analyses = len(analyses)
    total_colonies = sum(a.colony_count or 0 for a in analyses)
    valid_analyses = sum(
        1 for a in analyses
        if (a.status == AnalysisStatus.COMPLETED if hasattr(a.status, 'value') else str(a.status) == "completed")
    )
    avg_cfu = None
    cfu_values = [a.cfu_per_ml for a in analyses if a.cfu_per_ml is not None]
    if cfu_values:
        avg_cfu = sum(cfu_values) / len(cfu_values)

    elements.append(Paragraph("Detection Summary", heading_style))

    summary_data = [
        ["Parameter", "Value"],
        ["Total Analyses", str(total_analyses)],
        ["Valid Analyses", str(valid_analyses)],
        ["Total Colonies Detected", str(total_colonies)],
        ["Average CFU/ml", f"{avg_cfu:.2e}" if avg_cfu is not None else "N/A"],
    ]

    summary_table = Table(summary_data, colWidths=[6 * cm, 8 * cm])
    summary_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), base_font_name),
        ("FONTSIZE", (0, 0), (-1, -1), 12),
        ("BACKGROUND", (0, 0), (-1, 0), HexColor("#4A5568")),
        ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#FFFFFF")),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.5, black),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#F7FAFC"), HexColor("#FFFFFF")]),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 18))

    # --- Per-sample details ---
    elements.append(Paragraph("Sample Details", heading_style))

    for analysis in analyses:
        status_str = analysis.status.value if hasattr(analysis.status, 'value') else str(analysis.status)
        elements.append(Paragraph(
            f"<b>Sample:</b> {analysis.sample_id} &nbsp; | &nbsp; "
            f"<b>Media:</b> {analysis.media_type} &nbsp; | &nbsp; "
            f"<b>Date:</b> {analysis.created_at.strftime('%Y-%m-%d %H:%M')}",
            body_style,
        ))

        detail_data = [
            ["Parameter", "Value"],
            ["Dilution Factor", f"{analysis.dilution_factor}"],
            ["Plated Volume (ml)", f"{analysis.plated_volume_ml}"],
            ["Colony Count", str(analysis.colony_count or 0)],
            ["CFU/ml", f"{analysis.cfu_per_ml:.2e}" if analysis.cfu_per_ml else "N/A"],
            ["Confidence", f"{analysis.confidence_score * 100:.1f}%" if analysis.confidence_score else "N/A"],
            ["Reliability", (analysis.reliability or "N/A").capitalize()],
            ["Status", status_str.capitalize()],
        ]

        detail_table = Table(detail_data, colWidths=[5 * cm, 9 * cm])
        detail_table.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (-1, -1), base_font_name),
            ("FONTSIZE", (0, 0), (-1, -1), 11),
            ("BACKGROUND", (0, 0), (-1, 0), HexColor("#E2E8F0")),
            ("TEXTCOLOR", (0, 0), (-1, 0), black),
            ("FONTNAME", (0, 0), (-1, 0), base_font_name),
            ("FONTSIZE", (0, 0), (-1, 0), 11),
            ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#CBD5E0")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#F7FAFC"), HexColor("#FFFFFF")]),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ]))
        elements.append(detail_table)

        # Class breakdown if available
        class_breakdown = analysis.class_breakdown or {}
        if class_breakdown:
            breakdown_rows = [["Class", "Count"]]
            for cls_name, count in class_breakdown.items():
                breakdown_rows.append([cls_name, str(count)])
            breakdown_table = Table(breakdown_rows, colWidths=[5 * cm, 9 * cm])
            breakdown_table.setStyle(TableStyle([
                ("FONTNAME", (0, 0), (-1, -1), base_font_name),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("BACKGROUND", (0, 0), (-1, 0), HexColor("#EDF2F7")),
                ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#CBD5E0")),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]))
            elements.append(Spacer(1, 4))
            elements.append(Paragraph("<i>Class Breakdown:</i>", small_style))
            elements.append(breakdown_table)

        elements.append(Spacer(1, 12))

    # --- Signature block ---
    elements.append(Spacer(1, 24))
    elements.append(Paragraph("Analyst Certification", heading_style))
    elements.append(Spacer(1, 36))
    elements.append(Paragraph("_" * 50, body_style))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph("Analyst Name &amp; Signature", small_style))
    elements.append(Spacer(1, 24))
    elements.append(Paragraph("_" * 50, body_style))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph("Date", small_style))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(
        "<i>This report was generated by ColonyAI, an AI-powered colony detection system. "
        "Results should be reviewed by a qualified analyst before regulatory submission.</i>",
        small_style,
    ))

    # Build
    doc.build(elements)

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
