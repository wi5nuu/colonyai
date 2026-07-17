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
    organization_name: Optional[str] = None


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
    cfu_status: Optional[str] = None
    cfu_message: Optional[str] = None
    uncertainty_u: Optional[float] = None
    merged_estimation_method: Optional[str] = None
    incubation_temp: Optional[float] = None
    incubation_time_hours: Optional[int] = None
    method_standard: Optional[str] = "ISO 4833-1:2013"
    media_batch_number: Optional[str] = None
    incubator_id: Optional[str] = None
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
    cfu_status: Optional[str] = None
    cfu_message: Optional[str] = None
    uncertainty_u: Optional[float] = None
    merged_estimation_method: Optional[str] = None
    incubation_temp: Optional[float] = None
    incubation_time_hours: Optional[int] = None
    method_standard: Optional[str] = "ISO 4833-1:2013"
    media_batch_number: Optional[str] = None
    incubator_id: Optional[str] = None
    class_breakdown: Optional[Dict[str, int]] = None
    warnings: Optional[List[str]] = []
    is_valid_for_reporting: Optional[bool] = True
    created_at: datetime
    updated_at: datetime
    user: Optional[AnalysisUserBrief] = None

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
    
    # New Real Data Fields
    neural_confidence: float
    system_latency_ms: float
    verified_count: int
    failed_count: int
    
    # Matrix stats (Counts per media type)
    matrix_breakdown: Dict[str, int]
    
    weekly_trend: List[WeeklyTrendItem]
    recent_analyses: List[AnalysisBriefResponse]


# ============================================================
# Correction Schemas (Continuous Learning)
# ============================================================

class CorrectionBBoxRequest(BaseModel):
    x: int
    y: int
    width: int
    height: int


class CorrectionCreateRequest(BaseModel):
    detection_id: Optional[str] = None
    original_class: Optional[str] = None
    corrected_class: str = Field(..., description="Target class or 'removed' for FP")
    bbox: Optional[CorrectionBBoxRequest] = None
    notes: Optional[str] = None


class CorrectionResponse(BaseModel):
    id: str
    session_id: str
    analysis_id: str
    detection_id: Optional[str] = None
    original_class: Optional[str] = None
    corrected_class: str
    bbox: Optional[BBoxResponse] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CorrectionSessionResponse(BaseModel):
    id: str
    analysis_id: str
    status: str
    total_corrections: int
    accuracy: Optional[float] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    corrections: List[CorrectionResponse] = []

    class Config:
        from_attributes = True


class CorrectionReportResponse(BaseModel):
    session_id: str
    analysis_id: str
    total_corrections: int
    accuracy: Optional[float] = None
    per_class_breakdown: Dict[str, dict]  # {class: {tp, fp, fn}}
    created_at: datetime
    completed_at: Optional[datetime] = None


# ============================================================
# Report Schemas
# ============================================================

class ReportResponse(BaseModel):
    url: str
    filename: str
    expires_at: str
