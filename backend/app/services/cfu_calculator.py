"""
CFU/ml Calculation Engine — ColonyAI

Mengimplementasikan:
- SA-001: Area-based colony_merged estimation (fallback = 2 jika tidak ada referensi)
- BUG-002: Division-by-zero guard + Pydantic strict validation
- BUG-003: TNTC tidak melaporkan nilai CFU absolut (sesuai FDA BAM Chapter 3)
- BUG-010: Integer overflow guard
- BUG-011: TFTC/TNTC boundary inklusif sesuai ISO 4833-1:2013
- BUG-015: Measurement uncertainty (GUM — ISO/IEC Guide 98-3:2008)

Referensi:
- ISO 4833-1:2013 Clause 10.4.1
- FDA BAM Chapter 3, Table 1
- ISO/IEC Guide 98-3:2008 (GUM)
- SNI 2897:2008 Bagian 6
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from statistics import median
from typing import Any

from app.core.thresholds import (
    MAX_COLONY_MERGED,
    MAX_COLONY_SINGLE,
    MAX_MERGED_PER_BBOX,
    TFTC_BOUNDARY,
    TNTC_BOUNDARY,
)


# ============================================================
# Data Classes
# ============================================================


@dataclass
class MergedColonyEstimate:
    """Hasil estimasi colony_merged berdasarkan SA-001."""

    raw_merged_bbox_count: int
    """Jumlah bounding box colony_merged dari model."""

    estimated_colony_count: int
    """Estimasi total koloni dalam semua bounding box merged."""

    estimation_method: str
    """
    Metode estimasi yang digunakan:
    - 'area_based'             : SA-001 area ratio (paling akurat)
    - 'fallback_no_reference'  : Tidak ada colony_single untuk referensi → pakai 2
    - 'fallback_area_error'    : Error saat hitung area → pakai 2
    - 'fallback_minimum'       : Ratio < 1 → pakai 1
    """

    per_bbox_estimates: list[int] = field(default_factory=list)
    """Estimasi per bounding box (untuk debugging & transparansi laporan)."""

    has_fallback: bool = False
    """True jika setidaknya satu bbox menggunakan fallback."""


@dataclass
class UncertaintyBudget:
    """Measurement uncertainty berdasarkan GUM (ISO/IEC Guide 98-3:2008)."""

    u_model: float
    """Kontribusi ketidakpastian model AI (dari 1 - mAP)."""

    u_counting: float
    """Ketidakpastian resolusi penghitungan diskret (±0.5 koloni)."""

    u_dilution: float
    """Ketidakpastian pipet (dari CV pipet lab)."""

    u_combined: float
    """Combined standard uncertainty: √(u_model² + u_counting² + u_dilution²)."""

    U_expanded: float
    """Expanded uncertainty k=2 (~95% confidence): U = 2 × u_combined."""

    coverage_factor: int = 2
    """Coverage factor k (default 2 untuk ~95% confidence)."""


@dataclass
class CFUResult:
    """Hasil kalkulasi CFU/ml lengkap."""

    # Hitungan koloni
    colony_single_count: int
    colony_merged_raw: int
    merged_estimate: MergedColonyEstimate
    total_colonies: int

    # Parameter input
    dilution_factor: float
    plated_volume_ml: float
    media_type: str

    # Hasil kalkulasi
    cfu_per_ml: float | None
    """None jika status TNTC atau TFTC — sesuai FDA BAM."""

    status: str
    """'VALID' | 'TNTC' | 'TFTC'"""

    message: str
    """Pesan deskriptif untuk analis (dalam Bahasa Indonesia)."""

    recommendation: str
    """Rekomendasi tindak lanjut untuk analis."""

    # Metadata kualitas
    confidence_score: float
    reliability: str  # 'high' | 'medium' | 'low'
    warnings: list[str] = field(default_factory=list)

    # Ketidakpastian pengukuran
    uncertainty: UncertaintyBudget | None = None

    # Informasi pelaporan
    is_valid_for_reporting: bool = True
    estimated_cfu_order: str | None = None
    """Estimasi orde besaran untuk TNTC (misal '>310,000 CFU/mL')."""

    # Breakdown per kelas
    class_breakdown: dict[str, int] = field(default_factory=dict)


# ============================================================
# SA-001: Area-Based Colony Merged Estimator
# ============================================================


def estimate_merged_colonies(detections: list[dict[str, Any]]) -> MergedColonyEstimate:
    """
    Estimasi jumlah koloni dari semua bounding box colony_merged.

    Formula SA-001:
        colony_merged_count = round(area_bbox_merged ÷ median_area_bbox_single)

    Fallback jika tidak bisa hitung:
        colony_merged_count = 2 (minimum assumption)

    Args:
        detections: Daftar deteksi dari YOLOv8 (belum difilter threshold)

    Returns:
        MergedColonyEstimate dengan breakdown per bbox
    """
    # Kumpulkan area semua bounding box colony_single
    single_areas: list[float] = []
    for det in detections:
        if det.get("class_name") == "colony_single":
            w = det.get("bbox", {}).get("width", 0)
            h = det.get("bbox", {}).get("height", 0)
            area = w * h
            if area > 0:
                single_areas.append(float(area))

    # Kumpulkan semua bounding box colony_merged
    merged_detections = [
        d for d in detections if d.get("class_name") == "colony_merged"
    ]

    raw_merged_count = len(merged_detections)

    if raw_merged_count == 0:
        return MergedColonyEstimate(
            raw_merged_bbox_count=0,
            estimated_colony_count=0,
            estimation_method="no_merged_detected",
            per_bbox_estimates=[],
            has_fallback=False,
        )

    # Hitung median area colony_single sebagai referensi
    if not single_areas:
        # Fallback: tidak ada colony_single sebagai referensi
        per_bbox = [2] * raw_merged_count
        return MergedColonyEstimate(
            raw_merged_bbox_count=raw_merged_count,
            estimated_colony_count=sum(per_bbox),
            estimation_method="fallback_no_reference",
            per_bbox_estimates=per_bbox,
            has_fallback=True,
        )

    median_single_area = median(single_areas)

    # Guard: median = 0 (data corrupt)
    if median_single_area <= 0:
        per_bbox = [2] * raw_merged_count
        return MergedColonyEstimate(
            raw_merged_bbox_count=raw_merged_count,
            estimated_colony_count=sum(per_bbox),
            estimation_method="fallback_area_error",
            per_bbox_estimates=per_bbox,
            has_fallback=True,
        )

    # Estimasi per bounding box
    per_bbox_estimates: list[int] = []
    any_fallback = False

    for det in merged_detections:
        w = det.get("bbox", {}).get("width", 0)
        h = det.get("bbox", {}).get("height", 0)
        merged_area = float(w * h)

        if merged_area <= 0:
            # Area tidak bisa dihitung
            per_bbox_estimates.append(2)
            any_fallback = True
            continue

        ratio = merged_area / median_single_area

        if ratio < 1.0:
            # Merged lebih kecil dari single — edge case
            count = 1
            any_fallback = True
        else:
            count = round(ratio)
            # Sanity cap: max 50 koloni per bbox
            count = min(count, MAX_MERGED_PER_BBOX)

        per_bbox_estimates.append(count)

    method = "fallback_mixed" if any_fallback else "area_based"

    return MergedColonyEstimate(
        raw_merged_bbox_count=raw_merged_count,
        estimated_colony_count=sum(per_bbox_estimates),
        estimation_method=method,
        per_bbox_estimates=per_bbox_estimates,
        has_fallback=any_fallback,
    )


# ============================================================
# Measurement Uncertainty (GUM — ISO/IEC Guide 98-3:2008)
# ============================================================


def calculate_uncertainty(
    cfu_per_ml: float,
    model_map: float = 0.90,
    colony_count: int = 1,
    pipette_cv: float = 0.01,
) -> UncertaintyBudget:
    """
    Hitung measurement uncertainty menggunakan law of propagation (GUM).

    Komponen:
    1. u_model    = (1 - mAP) × cfu_per_ml   (ketidakpastian model AI)
    2. u_counting = (0.5 / n) × cfu_per_ml   (resolusi hitungan diskret)
    3. u_dilution = cv_pipet × cfu_per_ml    (ketidakpastian pipet)

    u_combined = √(u1² + u2² + u3²)
    U_expanded = 2 × u_combined              (k=2, ~95% confidence)

    Args:
        cfu_per_ml  : Nilai CFU/mL yang dihitung
        model_map   : mAP model pada validation set (default 0.90 = 90%)
        colony_count: Total koloni yang dihitung
        pipette_cv  : Coefficient of Variation pipet (default 0.01 = 1%)

    Returns:
        UncertaintyBudget dengan semua komponen
    """
    # u_model: variabilitas model AI
    model_error_fraction = max(0.0, 1.0 - model_map)
    u_model = model_error_fraction * cfu_per_ml

    # u_counting: ketidakpastian diskret ±0.5
    u_counting = (0.5 / max(colony_count, 1)) * cfu_per_ml

    # u_dilution: ketidakpastian pipet
    u_dilution = pipette_cv * cfu_per_ml

    # Combined standard uncertainty (quadrature sum)
    u_combined = math.sqrt(u_model**2 + u_counting**2 + u_dilution**2)

    # Expanded uncertainty k=2
    U_expanded = 2.0 * u_combined

    return UncertaintyBudget(
        u_model=round(u_model, 2),
        u_counting=round(u_counting, 2),
        u_dilution=round(u_dilution, 2),
        u_combined=round(u_combined, 2),
        U_expanded=round(U_expanded, 2),
        coverage_factor=2,
    )


# ============================================================
# CFU Calculator (Main)
# ============================================================


class CFUCalculator:
    """
    Kalkulasi CFU/mL dari hasil deteksi YOLOv8.

    Formula: CFU/mL = Total_Colonies / (Volume_mL × Dilution_Factor)

    Di mana Total_Colonies = colony_single + estimasi(colony_merged)
    sesuai SA-001 area-based estimation.
    """

    # Confidence thresholds untuk reliability label
    HIGH_CONFIDENCE_THRESHOLD = 0.80
    MEDIUM_CONFIDENCE_THRESHOLD = 0.60

    def calculate(
        self,
        colony_single: int,
        colony_merged_raw: int,
        dilution_factor: float,
        plated_volume_ml: float,
        media_type: str = "DEFAULT",
        confidence_score: float = 1.0,
        reliability: str = "high",
        class_breakdown: dict[str, int] | None = None,
        detections: list[dict[str, Any]] | None = None,
        model_map: float = 0.90,
        pipette_cv: float = 0.01,
    ) -> CFUResult:
        """
        Hitung CFU/mL dengan estimasi SA-001 dan uncertainty GUM.

        Args:
            colony_single       : Jumlah bounding box colony_single
            colony_merged_raw   : Jumlah bounding box colony_merged
            dilution_factor     : Faktor pengenceran (harus > 0)
            plated_volume_ml    : Volume inokulasi dalam mL (harus > 0)
            media_type          : Jenis media agar (untuk threshold lookup)
            confidence_score    : Average confidence score model
            reliability         : 'high' | 'medium' | 'low'
            class_breakdown     : Breakdown per kelas dari detector
            detections          : Raw detections untuk SA-001 area estimation
            model_map           : mAP model untuk uncertainty calculation
            pipette_cv          : CV pipet lab untuk uncertainty calculation

        Returns:
            CFUResult lengkap
        """
        warnings: list[str] = []

        # --- Input sanity check (Pydantic sudah memvalidasi, ini defense-in-depth) ---
        if dilution_factor <= 0 or math.isnan(dilution_factor) or math.isinf(dilution_factor):
            raise ValueError(f"Dilution factor tidak valid: {dilution_factor}")
        if plated_volume_ml <= 0 or math.isnan(plated_volume_ml) or math.isinf(plated_volume_ml):
            raise ValueError(f"Volume tidak valid: {plated_volume_ml}")

        # Sanity cap integer overflow
        colony_single = min(max(colony_single, 0), MAX_COLONY_SINGLE)
        colony_merged_raw = min(max(colony_merged_raw, 0), MAX_COLONY_MERGED)

        # --- SA-001: Estimasi colony_merged ---
        merged_estimate: MergedColonyEstimate
        if detections is not None:
            merged_estimate = estimate_merged_colonies(detections)
        else:
            # Fallback jika detections tidak diberikan: gunakan raw count × 2
            merged_estimate = MergedColonyEstimate(
                raw_merged_bbox_count=colony_merged_raw,
                estimated_colony_count=colony_merged_raw * 2,
                estimation_method="fallback_no_detections",
                per_bbox_estimates=[2] * colony_merged_raw,
                has_fallback=True,
            )

        if merged_estimate.has_fallback:
            warnings.append(
                f"colony_merged: estimasi dengan fallback (metode: {merged_estimate.estimation_method}). "
                "Nilai CFU mungkin kurang akurat. Periksa gambar secara manual."
            )

        # Total koloni final
        total_colonies = colony_single + merged_estimate.estimated_colony_count

        # --- CFU/mL kalkulasi ---
        # FIX QA-006: Division by Zero Protection
        denominator = plated_volume_ml * dilution_factor

        if denominator == 0:
            raise ValueError(
                "Calculation error: plated_volume_ml and dilution_factor cannot result in zero denominator. "
                f"Got volume={plated_volume_ml}, dilution={dilution_factor}."
            )

        raw_cfu = total_colonies / denominator

        # --- TFTC/TNTC logic (ISO 4833-1:2013 — inklusif kedua batas) ---
        #   count < 25      → TFTC
        #   25 ≤ count ≤ 250 → VALID
        #   count > 250     → TNTC

        if total_colonies < TFTC_BOUNDARY:
            # TFTC: terlalu sedikit
            return CFUResult(
                colony_single_count=colony_single,
                colony_merged_raw=colony_merged_raw,
                merged_estimate=merged_estimate,
                total_colonies=total_colonies,
                dilution_factor=dilution_factor,
                plated_volume_ml=plated_volume_ml,
                media_type=media_type,
                cfu_per_ml=None,  # Tidak dilaporkan
                status="TFTC",
                message=(
                    f"Terlalu Sedikit untuk Dihitung (TFTC): {total_colonies} koloni "
                    f"(minimum valid: {TFTC_BOUNDARY})."
                ),
                recommendation=(
                    "Kurangi faktor pengenceran atau perpanjang waktu inkubasi. "
                    f"Coba pengenceran: {dilution_factor / 10:.2e}"
                ),
                confidence_score=confidence_score,
                reliability=reliability,
                warnings=warnings,
                uncertainty=None,
                is_valid_for_reporting=False,
                class_breakdown=class_breakdown or {},
            )

        elif total_colonies > TNTC_BOUNDARY:
            # TNTC: FDA BAM — jangan laporkan nilai absolut CFU/mL
            estimated_order = f">{int(raw_cfu / 1000) * 1000:,}"

            # Hitung pengenceran yang direkomendasikan
            recommended_dilution = dilution_factor * 10

            return CFUResult(
                colony_single_count=colony_single,
                colony_merged_raw=colony_merged_raw,
                merged_estimate=merged_estimate,
                total_colonies=total_colonies,
                dilution_factor=dilution_factor,
                plated_volume_ml=plated_volume_ml,
                media_type=media_type,
                cfu_per_ml=None,  # FDA BAM: JANGAN tampilkan nilai absolut dari TNTC
                status="TNTC",
                message=(
                    f"Terlalu Banyak untuk Dihitung (TNTC): {total_colonies} koloni "
                    f"(maksimum valid: {TNTC_BOUNDARY})."
                ),
                recommendation=(
                    f"Lakukan pengenceran lebih lanjut. "
                    f"Pengenceran berikutnya: {recommended_dilution:.2e}. "
                    f"Estimasi kasar: >{estimated_order} CFU/mL."
                ),
                confidence_score=confidence_score,
                reliability=reliability,
                warnings=warnings,
                uncertainty=None,
                is_valid_for_reporting=False,
                estimated_cfu_order=estimated_order,
                class_breakdown=class_breakdown or {},
            )

        else:
            # VALID: 25 ≤ total_colonies ≤ 250
            cfu_per_ml = round(raw_cfu, 2)

            # Hitung measurement uncertainty (GUM)
            uncertainty = calculate_uncertainty(
                cfu_per_ml=cfu_per_ml,
                model_map=model_map,
                colony_count=total_colonies,
                pipette_cv=pipette_cv,
            )

            return CFUResult(
                colony_single_count=colony_single,
                colony_merged_raw=colony_merged_raw,
                merged_estimate=merged_estimate,
                total_colonies=total_colonies,
                dilution_factor=dilution_factor,
                plated_volume_ml=plated_volume_ml,
                media_type=media_type,
                cfu_per_ml=cfu_per_ml,
                status="VALID",
                message=f"Hasil valid: {cfu_per_ml:,.2f} CFU/mL",
                recommendation="",
                confidence_score=confidence_score,
                reliability=reliability,
                warnings=warnings,
                uncertainty=uncertainty,
                is_valid_for_reporting=reliability != "low",
                class_breakdown=class_breakdown or {},
            )

    def format_result(self, result: CFUResult) -> str:
        """Format CFU result untuk display singkat."""
        if result.status == "TNTC":
            return f"TNTC (>{result.estimated_cfu_order or TNTC_BOUNDARY} koloni)"
        elif result.status == "TFTC":
            return f"TFTC (<{TFTC_BOUNDARY} koloni)"
        else:
            if result.cfu_per_ml and result.cfu_per_ml >= 10_000:
                return f"{result.cfu_per_ml:.2e} CFU/mL"
            return f"{result.cfu_per_ml:,.2f} CFU/mL"

    def format_with_uncertainty(self, result: CFUResult) -> str:
        """Format CFU/mL dengan uncertainty untuk laporan ISO 17025."""
        if result.status != "VALID" or result.cfu_per_ml is None:
            return self.format_result(result)
        if result.uncertainty is None:
            return self.format_result(result)
        return (
            f"{result.cfu_per_ml:,.2f} ± {result.uncertainty.U_expanded:,.2f} CFU/mL "
            f"(k={result.uncertainty.coverage_factor}, ~95%)"
        )

    def format_for_report(self, result: CFUResult) -> dict[str, Any]:
        """Serialize CFUResult ke dict siap untuk laporan PDF/JSON."""
        merged = result.merged_estimate
        unc = result.uncertainty

        return {
            "colony_single_count": result.colony_single_count,
            "colony_merged_raw": result.colony_merged_raw,
            "colony_merged_estimated": merged.estimated_colony_count,
            "colony_merged_method": merged.estimation_method,
            "colony_merged_has_fallback": merged.has_fallback,
            "total_colonies": result.total_colonies,
            "cfu_per_ml": result.cfu_per_ml,  # None jika TNTC/TFTC
            "cfu_formatted": self.format_result(result),
            "cfu_with_uncertainty": self.format_with_uncertainty(result),
            "status": result.status,
            "message": result.message,
            "recommendation": result.recommendation,
            "confidence_score": round(result.confidence_score * 100, 1),
            "reliability": result.reliability,
            "is_valid_for_reporting": result.is_valid_for_reporting,
            "estimated_cfu_order": result.estimated_cfu_order,
            "uncertainty": {
                "u_model": unc.u_model,
                "u_counting": unc.u_counting,
                "u_dilution": unc.u_dilution,
                "u_combined": unc.u_combined,
                "U_expanded": unc.U_expanded,
                "coverage_factor": unc.coverage_factor,
            } if unc else None,
            "class_breakdown": result.class_breakdown,
            "warnings": result.warnings,
        }
