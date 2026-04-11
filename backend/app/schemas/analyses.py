"""Pydantic schemas for ColonyAI API responses"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# ============================================================
# Detection Schemas
# ============================================================

class BBoxResponse(BaseModel):
    x: int
    y: int
    width: int
    height: int

    class Config:
        from_attributes = True


class DetectionResponse(BaseModel):
    id: str
    analysis_id: str
    class_name: str
    confidence: float
    bbox: BBoxResponse

    class Config:
        from_attributes = True


# ============================================================
# Analysis Schemas
# ============================================================

class AnalysisUserBrief(BaseModel):
    full_name: str
    email: str


class AnalysisResponse(BaseModel):
    id: str
    user_id: str
    sample_id: str
    media_type: str
    dilution_factor: float
    plated_volume_ml: float
    original_image_url: Optional[str] = None
    annotated_image_url: Optional[str] = None
    colony_count: Optional[int] = None
    cfu_per_ml: Optional[float] = None
    confidence_score: Optional[float] = None
    reliability: Optional[str] = "high"
    status: str
    class_breakdown: Optional[Dict[str, int]] = None
    detections: Optional[List[DetectionResponse]] = []
    warnings: Optional[List[str]] = []
    is_valid_for_reporting: Optional[bool] = True
    created_at: datetime
    updated_at: datetime
    user: Optional[AnalysisUserBrief] = None

    class Config:
        from_attributes = True


class AnalysisBriefResponse(BaseModel):
    """Abbreviated analysis response for list views (no detections)"""
    id: str
    user_id: str
    sample_id: str
    media_type: str
    dilution_factor: float
    plated_volume_ml: float
    original_image_url: Optional[str] = None
    annotated_image_url: Optional[str] = None
    colony_count: Optional[int] = None
    cfu_per_ml: Optional[float] = None
    confidence_score: Optional[float] = None
    reliability: Optional[str] = "high"
    status: str
    class_breakdown: Optional[Dict[str, int]] = None
    warnings: Optional[List[str]] = []
    is_valid_for_reporting: Optional[bool] = True
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AnalysisListResponse(BaseModel):
    analyses: List[AnalysisBriefResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# ============================================================
# Dashboard Schemas
# ============================================================

class WeeklyTrendItem(BaseModel):
    day: str
    analyses: int


class DashboardStatsResponse(BaseModel):
    total_analyses: int
    avg_time_saved_minutes: int
    success_rate: float
    pending_review: int
    weekly_trend: List[WeeklyTrendItem]
    recent_analyses: List[AnalysisBriefResponse]


# ============================================================
# Report Schemas
# ============================================================

class ReportResponse(BaseModel):
    url: str
    filename: str
    expires_at: str
