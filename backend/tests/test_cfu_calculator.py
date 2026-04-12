"""
Unit tests untuk CFU Calculator — ColonyAI
Zero-tolerance: SEMUA test case HARUS PASS sebelum go-live.

Test Case Matrix dari QA Report Section 4:
CA-001 sampai CA-020 (dan lebih)

Jalankan: pytest tests/test_cfu_calculator.py -v
"""

import math
import pytest

from app.services.cfu_calculator import (
    CFUCalculator,
    estimate_merged_colonies,
    calculate_uncertainty,
    MergedColonyEstimate,
)
from app.core.thresholds import TFTC_BOUNDARY, TNTC_BOUNDARY


# ─── Fixtures ────────────────────────────────────────────────────────────────

@pytest.fixture
def calculator():
    return CFUCalculator()


def make_detections(single_areas: list[int], merged_areas: list[int]) -> list[dict]:
    """Helper: buat list detections dari area list."""
    dets = []
    for i, area in enumerate(single_areas):
        side = int(math.sqrt(area))
        dets.append({
            "class_name": "colony_single",
            "confidence": 0.90,
            "bbox": {"x": i * 50, "y": 0, "width": side, "height": side},
        })
    for i, area in enumerate(merged_areas):
        side = int(math.sqrt(area))
        dets.append({
            "class_name": "colony_merged",
            "confidence": 0.85,
            "bbox": {"x": i * 100, "y": 200, "width": side, "height": side},
        })
    return dets


# ─── SA-001: colony_merged Estimation ────────────────────────────────────────

class TestMergedColonyEstimation:
    """SA-001: Area-based colony_merged estimation."""

    def test_area_based_basic(self):
        """CA-SA-001: Median area 400px², merged area 1200px² → 3 koloni."""
        # 10 single colonies, masing-masing 20×20 = 400px²
        dets = make_detections(
            single_areas=[400] * 10,
            merged_areas=[1200],  # 3× median
        )
        result = estimate_merged_colonies(dets)
        assert result.estimated_colony_count == 3
        assert result.estimation_method == "area_based"
        assert result.has_fallback is False

    def test_area_based_round(self):
        """Ratio 2.4 → round ke 2 koloni."""
        dets = make_detections(
            single_areas=[100] * 5,  # median = 100
            merged_areas=[240],      # ratio = 2.4 → round(2.4) = 2
        )
        result = estimate_merged_colonies(dets)
        assert result.estimated_colony_count == 2

    def test_fallback_no_single_reference(self):
        """Tidak ada colony_single → fallback = 2 per merged bbox."""
        dets = make_detections(single_areas=[], merged_areas=[400, 600])
        result = estimate_merged_colonies(dets)
        assert result.estimated_colony_count == 4  # 2 × 2
        assert result.estimation_method == "fallback_no_reference"
        assert result.has_fallback is True

    def test_fallback_minimum_when_ratio_less_than_one(self):
        """Merged kecil dari single → min 1 koloni."""
        dets = make_detections(
            single_areas=[10000] * 5,  # Sangat besar
            merged_areas=[100],         # Jauh lebih kecil → ratio < 1
        )
        result = estimate_merged_colonies(dets)
        assert result.per_bbox_estimates[0] == 1

    def test_cap_max_per_bbox(self):
        """Ratio sangat besar → capped at 50."""
        dets = make_detections(
            single_areas=[1] * 5,      # Sangat kecil
            merged_areas=[100_000],    # Sangat besar → ratio > 50
        )
        result = estimate_merged_colonies(dets)
        assert result.per_bbox_estimates[0] == 50

    def test_zero_merged_colonies(self):
        """Tidak ada colony_merged → estimated_colony_count = 0."""
        dets = make_detections(single_areas=[400] * 5, merged_areas=[])
        result = estimate_merged_colonies(dets)
        assert result.estimated_colony_count == 0
        assert result.raw_merged_bbox_count == 0

    def test_multiple_merged_bboxes(self):
        """Multiple merged bboxes: estimasi per-bbox dijumlahkan."""
        dets = make_detections(
            single_areas=[400] * 10,
            merged_areas=[400, 800, 1200],  # 1 + 2 + 3 = 6
        )
        result = estimate_merged_colonies(dets)
        assert result.estimated_colony_count == 6
        assert len(result.per_bbox_estimates) == 3


# ─── CA-001 sampai CA-020: CFU/mL Calculation ────────────────────────────────

class TestCFUCalculation:
    """Test cases CA-001 hingga CA-020 dari QA Report Section 4."""

    # ── CA-001: Standard case ──

    def test_ca001_standard_calculation(self, calculator):
        """CA-001: colony_single=50, colony_merged=10 (est. 20), vol=1, dil=0.001 → 70,000 CFU/mL"""
        # colony_merged=10 bbox, median single area=400px², merged area=800px² → 2 per bbox → 20 total
        dets = make_detections(single_areas=[400] * 50, merged_areas=[800] * 10)
        result = calculator.calculate(
            colony_single=50,
            colony_merged_raw=10,
            dilution_factor=0.001,
            plated_volume_ml=1.0,
            detections=dets,
        )
        assert result.status == "VALID"
        assert result.cfu_per_ml is not None
        assert result.total_colonies == 70  # 50 + 20
        expected = 70 / (1.0 * 0.001)
        assert abs(result.cfu_per_ml - round(expected, 2)) < 0.01

    def test_ca002_zero_colonies(self, calculator):
        """CA-002: 0 koloni → TFTC, cfu_per_ml=None."""
        result = calculator.calculate(
            colony_single=0,
            colony_merged_raw=0,
            dilution_factor=0.001,
            plated_volume_ml=1.0,
        )
        assert result.status == "TFTC"
        assert result.cfu_per_ml is None
        assert result.is_valid_for_reporting is False

    def test_ca003_tntc_condition(self, calculator):
        """CA-003: 350 koloni → TNTC, cfu_per_ml=None (FDA BAM)."""
        result = calculator.calculate(
            colony_single=350,
            colony_merged_raw=0,
            dilution_factor=0.001,
            plated_volume_ml=1.0,
        )
        assert result.status == "TNTC"
        assert result.cfu_per_ml is None  # BUG-003: tidak boleh ada nilai absolut
        assert result.is_valid_for_reporting is False
        assert result.estimated_cfu_order is not None  # Ada estimasi kasar

    def test_ca004_division_by_zero_volume(self, calculator):
        """CA-004: volume=0 → ValueError (bukan ZeroDivisionError crash)."""
        with pytest.raises(ValueError, match="Volume"):
            calculator.calculate(
                colony_single=50,
                colony_merged_raw=0,
                dilution_factor=0.001,
                plated_volume_ml=0.0,  # ZERO — harus raise ValueError
            )

    def test_ca005_division_by_zero_dilution(self, calculator):
        """CA-005: dilution=0 → ValueError."""
        with pytest.raises(ValueError, match="Dilution"):
            calculator.calculate(
                colony_single=50,
                colony_merged_raw=0,
                dilution_factor=0.0,  # ZERO
                plated_volume_ml=1.0,
            )

    def test_ca006_negative_volume(self, calculator):
        """CA-006: volume=-1 → ValueError."""
        with pytest.raises(ValueError):
            calculator.calculate(
                colony_single=50,
                colony_merged_raw=0,
                dilution_factor=0.001,
                plated_volume_ml=-1.0,
            )

    def test_ca007_negative_dilution(self, calculator):
        """CA-007: dilution=-0.001 → ValueError."""
        with pytest.raises(ValueError):
            calculator.calculate(
                colony_single=50,
                colony_merged_raw=0,
                dilution_factor=-0.001,
                plated_volume_ml=1.0,
            )

    def test_ca009_nan_dilution(self, calculator):
        """CA-009: dilution=NaN → ValueError."""
        with pytest.raises(ValueError, match=""):
            calculator.calculate(
                colony_single=50,
                colony_merged_raw=0,
                dilution_factor=math.nan,
                plated_volume_ml=1.0,
            )

    def test_ca009b_inf_dilution(self, calculator):
        """CA-009b: dilution=Infinity → ValueError."""
        with pytest.raises(ValueError):
            calculator.calculate(
                colony_single=50,
                colony_merged_raw=0,
                dilution_factor=math.inf,
                plated_volume_ml=1.0,
            )

    def test_ca010_integer_overflow_guard(self, calculator):
        """CA-010: colony_single=2147483648 → capped ke MAX_COLONY_SINGLE (10000)."""
        result = calculator.calculate(
            colony_single=2_147_483_648,  # Integer overflow value
            colony_merged_raw=0,
            dilution_factor=0.001,
            plated_volume_ml=1.0,
        )
        # Harus di-cap, bukan crash
        assert result.colony_single_count <= 10_000

    # ── CA-011 & CA-012: TFTC/TNTC boundary (inklusif) ──

    def test_ca011_exactly_25_is_valid(self, calculator):
        """CA-011: Tepat 25 koloni → VALID (inklusif batas bawah, ISO 4833)."""
        result = calculator.calculate(
            colony_single=25,
            colony_merged_raw=0,
            dilution_factor=0.001,
            plated_volume_ml=1.0,
        )
        assert result.status == "VALID"
        assert result.cfu_per_ml is not None

    def test_ca012_exactly_250_is_valid(self, calculator):
        """CA-012: Tepat 250 koloni → VALID (inklusif batas atas, ISO 4833)."""
        result = calculator.calculate(
            colony_single=250,
            colony_merged_raw=0,
            dilution_factor=0.001,
            plated_volume_ml=1.0,
        )
        assert result.status == "VALID"
        assert result.cfu_per_ml is not None

    def test_ca013_24_is_tftc(self, calculator):
        """CA-013: 24 koloni → TFTC (eksklusif batas bawah)."""
        result = calculator.calculate(
            colony_single=24,
            colony_merged_raw=0,
            dilution_factor=0.001,
            plated_volume_ml=1.0,
        )
        assert result.status == "TFTC"
        assert result.cfu_per_ml is None

    def test_ca014_251_is_tntc(self, calculator):
        """CA-014: 251 koloni → TNTC (eksklusif batas atas)."""
        result = calculator.calculate(
            colony_single=251,
            colony_merged_raw=0,
            dilution_factor=0.001,
            plated_volume_ml=1.0,
        )
        assert result.status == "TNTC"
        assert result.cfu_per_ml is None

    # ── Misc Edge Cases ──

    def test_tntc_has_no_absolute_cfu(self, calculator):
        """BUG-003: TNTC tidak boleh ada cfu_per_ml — FDA BAM compliance."""
        for count in [251, 300, 500, 1000]:
            result = calculator.calculate(
                colony_single=count,
                colony_merged_raw=0,
                dilution_factor=0.001,
                plated_volume_ml=1.0,
            )
            assert result.cfu_per_ml is None, (
                f"FAIL BUG-003: count={count} mengembalikan "
                f"cfu_per_ml={result.cfu_per_ml} (harus None untuk TNTC)"
            )

    def test_tftc_has_no_absolute_cfu(self, calculator):
        """BUG-003: TFTC juga tidak boleh ada cfu_per_ml."""
        for count in [0, 1, 10, 24]:
            result = calculator.calculate(
                colony_single=count,
                colony_merged_raw=0,
                dilution_factor=0.001,
                plated_volume_ml=1.0,
            )
            assert result.cfu_per_ml is None, (
                f"FAIL: count={count} mengembalikan cfu_per_ml={result.cfu_per_ml}"
            )

    def test_valid_result_has_uncertainty(self, calculator):
        """BUG-015: Hasil VALID harus memiliki measurement uncertainty."""
        result = calculator.calculate(
            colony_single=100,
            colony_merged_raw=0,
            dilution_factor=0.001,
            plated_volume_ml=1.0,
        )
        assert result.status == "VALID"
        assert result.uncertainty is not None
        assert result.uncertainty.U_expanded > 0
        assert result.uncertainty.coverage_factor == 2

    def test_tntc_has_recommendation(self, calculator):
        """TNTC harus menyertakan rekomendasi pengenceran."""
        result = calculator.calculate(
            colony_single=300,
            colony_merged_raw=0,
            dilution_factor=0.001,
            plated_volume_ml=1.0,
        )
        assert result.status == "TNTC"
        assert len(result.recommendation) > 0
        assert "pengenceran" in result.recommendation.lower()

    def test_tftc_has_recommendation(self, calculator):
        """TFTC harus menyertakan rekomendasi."""
        result = calculator.calculate(
            colony_single=5,
            colony_merged_raw=0,
            dilution_factor=0.001,
            plated_volume_ml=1.0,
        )
        assert result.status == "TFTC"
        assert len(result.recommendation) > 0


# ─── Measurement Uncertainty (GUM) ───────────────────────────────────────────

class TestMeasurementUncertainty:
    """BUG-015: Measurement uncertainty sesuai ISO/IEC Guide 98-3:2008."""

    def test_uncertainty_components_positive(self):
        """Semua komponen uncertainty harus positif."""
        unc = calculate_uncertainty(
            cfu_per_ml=60_000,
            model_map=0.92,
            colony_count=60,
            pipette_cv=0.01,
        )
        assert unc.u_model >= 0
        assert unc.u_counting >= 0
        assert unc.u_dilution >= 0
        assert unc.u_combined >= 0
        assert unc.U_expanded >= 0

    def test_expanded_uncertainty_uses_k2(self):
        """U_expanded = 2 × u_combined (k=2)."""
        unc = calculate_uncertainty(cfu_per_ml=10_000, model_map=0.90)
        assert abs(unc.U_expanded - 2 * unc.u_combined) < 0.01
        assert unc.coverage_factor == 2

    def test_better_model_less_uncertainty(self):
        """Model dengan mAP lebih tinggi → uncertainty lebih kecil."""
        unc_good = calculate_uncertainty(cfu_per_ml=10_000, model_map=0.95)
        unc_bad = calculate_uncertainty(cfu_per_ml=10_000, model_map=0.75)
        assert unc_good.U_expanded < unc_bad.U_expanded

    def test_format_with_uncertainty(self):
        """Format CFU/mL dengan uncertainty mengandung ± dan k=2."""
        calc = CFUCalculator()
        result = calc.calculate(
            colony_single=100,
            colony_merged_raw=0,
            dilution_factor=0.001,
            plated_volume_ml=1.0,
        )
        formatted = calc.format_with_uncertainty(result)
        assert "±" in formatted
        assert "k=2" in formatted
        assert "95%" in formatted


# ─── Threshold Constants ──────────────────────────────────────────────────────

class TestThresholdConstants:
    """Verifikasi konstantan TFTC/TNTC sesuai ISO 4833-1:2013."""

    def test_tftc_boundary(self):
        """TFTC_BOUNDARY = 25 sesuai ISO 4833-1:2013."""
        assert TFTC_BOUNDARY == 25

    def test_tntc_boundary(self):
        """TNTC_BOUNDARY = 250 sesuai ISO 4833-1:2013."""
        assert TNTC_BOUNDARY == 250

    def test_valid_range_inclusive(self):
        """Rentang valid: 25 ≤ count ≤ 250 (inklusif kedua batas)."""
        # Batas bawah: 25 = valid
        assert TFTC_BOUNDARY == 25
        # Batas atas: 250 = valid
        assert TNTC_BOUNDARY == 250
        # 24 = TFTC, 251 = TNTC
        assert 24 < TFTC_BOUNDARY
        assert 251 > TNTC_BOUNDARY
