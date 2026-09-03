// ColonyAI TypeScript Types - aligned with 5-class proposal architecture

// ============================================================
// AUTH TYPES
// ============================================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  /**
   * 5-role RBAC for ColonyAI:
   * - super_admin: Global system management, manage organizations, licenses, and global audit.
   * - admin: Full system management, user administration, and settings.
   * - manager: Technical review, approve results, view analytics & reports.
   * - auditor: Read-only access to records, reports, and audit trails.
   * - analyst: Perform tests, upload samples, use simulator.
   */
  role: "analyst" | "manager" | "auditor" | "admin" | "super_admin";
  laboratory_id?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  device_id?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role?: "analyst" | "manager" | "auditor" | "admin" | "super_admin";
}

export interface AuthResponse {
  access_token?: string;
  refresh_token?: string;
  token_type: string;
  user?: User;
  mfa_required?: boolean;
  message?: string;
}

export interface MFAVerifyRequest {
  email: string;
  code: string;
  device_id?: string;
  trust_device?: boolean;
}

// ============================================================
// ANALYSIS TYPES
// ============================================================

export type MediaType =
  | "PCA"
  | "VRBA"
  | "BGBB"
  | "R2A"
  | "TSA"
  | "MacConkey"
  | "SDA"
  | "EMB"
  | "Blood"
  | "OTHER";

/**
 * Calculated CFU/mL status.
 * - VALID: 25 <= count <= 250 (inclusive, per ISO 4833-1:2013)
 * - TNTC : count > 250 — cfu_per_ml = null (FDA BAM: do not report absolute value)
 * - TFTC : count < 25  — cfu_per_ml = null
 */
export type CFUStatus = "VALID" | "TNTC" | "TFTC";
export type ReliabilityLevel = "high" | "medium" | "low";

// 5-class architecture per proposal
export type DetectionClass =
  | "colony_single"
  | "colony_merged"
  | "bubble"
  | "dust_debris"
  | "media_crack";

export interface Detection {
  id: string;
  analysis_id: string;
  class_name: DetectionClass;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface AnalysisCreate {
  sample_id: string;
  media_type: MediaType;
  dilution_factor: number;
  plated_volume_ml: number;
  incubation_temp?: number;
  incubation_time_hours?: number;
  method_standard?: string;
  media_batch_number?: string;
  incubator_id?: string;
  image: File;
}

export interface Analysis {
  id: string;
  user_id: string;
  sample_id: string;
  media_type: MediaType;
  dilution_factor: number;
  plated_volume_ml: number;
  original_image_url: string;
  annotated_image_url: string;
  /** Total colonies = colony_single + estimate(colony_merged) via SA-001 */
  colony_count: number;
  /**
   * BUG-003: null if TNTC or TFTC status.
   * FDA BAM Chapter 3 prohibits reporting absolute values from TNTC plates.
   */
  cfu_per_ml: number | null;
  /** VALID/TNTC/TFTC status — use this for display logic, NOT cfu_per_ml */
  cfu_status?: CFUStatus;
  /** Descriptive message for analyst from backend */
  cfu_message?: string;
  /** Follow-up recommendation (re-dilution etc.) */
  cfu_recommendation?: string;
  /** Estimated order of magnitude for TNTC, e.g. ">310,000" */
  estimated_cfu_order?: string;
  confidence_score: number;
  reliability: ReliabilityLevel;
  status: string; // DB status: PROCESSING | COMPLETED | FAILED
  class_breakdown: Record<DetectionClass, number>;
  detections: Detection[];
  warnings: string[];
  is_valid_for_reporting: boolean;
  /** colony_merged estimation method (SA-001): 'area_based' | 'fallback_*' */
  merged_estimation_method?: string;
  /** Expanded measurement uncertainty U (k=2, ~95%) in CFU/mL */
  uncertainty_u?: number | null;
  /** ISO Compliance Fields */
  incubation_temp?: number | null;
  incubation_time_hours?: number | null;
  method_standard?: string | null;
  media_batch_number?: string | null;
  incubator_id?: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    full_name: string;
    email: string;
    organization_name?: string;
  };
}

export interface AnalysisListResponse {
  analyses: Analysis[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ============================================================
// IMAGE TYPES
// ============================================================

export interface ImageUploadResponse {
  original_url: string;
  annotated_url: string;
}

// ============================================================
// REPORT TYPES
// ============================================================

export type ReportType = "daily" | "weekly" | "custom";

export interface ReportRequest {
  report_type: ReportType;
  date_from?: string;
  date_to?: string;
  format: "pdf" | "csv";
}

export interface ReportResponse {
  url: string;
  filename: string;
  expires_at: string;
}

// ============================================================
// DASHBOARD TYPES
// ============================================================

export interface DashboardStats {
  total_analyses: number;
  avg_time_saved_minutes: number;
  success_rate: number;
  pending_review: number;

  // Real Data Fields
  neural_confidence: number;
  system_latency_ms: number;
  verified_count: number;
  failed_count: number;
  matrix_breakdown: Record<string, number>;

  weekly_trend: { day: string; analyses: number }[];
  recent_analyses: Analysis[];
}

// ============================================================
// CORRECTION TYPES (Continuous Learning)
// ============================================================

export interface CorrectionBBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Correction {
  id: string;
  session_id: string;
  analysis_id: string;
  detection_id: string | null;
  original_class: string | null;
  corrected_class: string;
  bbox: CorrectionBBox | null;
  notes: string | null;
  created_at: string;
}

export interface CorrectionSession {
  id: string;
  analysis_id: string;
  status: "active" | "completed";
  total_corrections: number;
  accuracy: number | null;
  created_at: string;
  completed_at: string | null;
  corrections: Correction[];
}

export interface CorrectionReport {
  session_id: string;
  analysis_id: string;
  total_corrections: number;
  accuracy: number | null;
  per_class_breakdown: Record<string, { tp: number; fp: number; fn: number; count: number }>;
  created_at: string;
  completed_at: string | null;
}

// ============================================================
// API ERROR TYPES
// ============================================================

export interface ApiError {
  detail: string;
  status_code?: number;
  errors?: Record<string, string[]>;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public data?: ApiError,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}
