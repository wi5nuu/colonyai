import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

import pytest

from app.services.cfu_calculator import (
    CFUCalculator,
    calculate_uncertainty,
    estimate_merged_colonies,
)


def single(w=10, h=10):
    return {"class_name": "colony_single", "bbox": {"width": w, "height": h}}


def merged(w, h):
    return {"class_name": "colony_merged", "bbox": {"width": w, "height": h}}


class TestCFUCalculator:
    """CFU/mL = total colonies / (plated volume mL x dilution factor), ISO 4833-1 counting range 25-250."""

    def setup_method(self):
        self.calculator = CFUCalculator()

    def calc(self, single_count, dilution=0.001, volume=1.0, merged_raw=0, **kw):
        return self.calculator.calculate(
            colony_single=single_count,
            colony_merged_raw=merged_raw,
            dilution_factor=dilution,
            plated_volume_ml=volume,
            **kw,
        )

    def test_basic_cfu_calculation(self):
        result = self.calc(100)
        assert result.status == "VALID"
        assert result.cfu_per_ml == pytest.approx(100_000.0)
        assert result.is_valid_for_reporting is True

    def test_merged_fallback_counts_two_colonies_per_bbox(self):
        # Without raw detections each merged bbox is assumed to hold 2 colonies.
        result = self.calc(50, dilution=0.01, volume=0.1, merged_raw=10)
        assert result.total_colonies == 70
        assert result.cfu_per_ml == pytest.approx(70 / (0.1 * 0.01))
        assert any("fallback" in w for w in result.warnings)

    def test_merged_area_based_estimation(self):
        detections = [single(), single(), merged(20, 15)]  # 300 / 100 = 3 colonies
        result = self.calc(30, merged_raw=1, detections=detections)
        assert result.merged_estimate.estimation_method == "area_based"
        assert result.total_colonies == 33

    def test_tntc_hides_absolute_value(self):
        result = self.calc(300)
        assert result.status == "TNTC"
        assert result.cfu_per_ml is None  # FDA BAM: never report TNTC as a number
        assert result.estimated_cfu_order
        assert result.is_valid_for_reporting is False

    def test_tftc_hides_absolute_value(self):
        result = self.calc(10)
        assert result.status == "TFTC"
        assert result.cfu_per_ml is None

    @pytest.mark.parametrize("count", [25, 250])
    def test_counting_range_is_inclusive(self, count):
        assert self.calc(count).status == "VALID"

    @pytest.mark.parametrize("count,status", [(24, "TFTC"), (251, "TNTC")])
    def test_just_outside_counting_range(self, count, status):
        assert self.calc(count).status == status

    def test_zero_colonies_is_tftc(self):
        result = self.calc(0)
        assert result.status == "TFTC"
        assert result.total_colonies == 0

    def test_high_dilution(self):
        assert self.calc(150, dilution=0.00001).cfu_per_ml == pytest.approx(15_000_000.0)

    def test_low_plated_volume(self):
        assert self.calc(50, volume=0.01).cfu_per_ml == pytest.approx(5_000_000.0)

    def test_result_is_deterministic(self):
        values = {self.calc(156).cfu_per_ml for _ in range(10)}
        assert len(values) == 1

    def test_measurement_uncertainty_present_for_valid_result(self):
        result = self.calc(100)
        assert result.uncertainty is not None
        assert result.uncertainty.U_expanded > 0
        assert result.uncertainty.U_expanded == pytest.approx(2 * result.uncertainty.u_combined)

    def test_low_reliability_is_not_reportable(self):
        assert self.calc(100, reliability="low").is_valid_for_reporting is False

    @pytest.mark.parametrize(
        "dilution,volume",
        [(0, 1.0), (-1, 1.0), (0.001, 0), (float("nan"), 1.0), (0.001, float("inf"))],
    )
    def test_invalid_inputs_raise(self, dilution, volume):
        with pytest.raises(ValueError):
            self.calc(100, dilution=dilution, volume=volume)

    def test_negative_counts_are_clamped(self):
        result = self.calc(-5, merged_raw=-3)
        assert result.total_colonies == 0


class TestMergedColonyEstimation:
    def test_no_merged_detections(self):
        estimate = estimate_merged_colonies([single(), single()])
        assert estimate.estimated_colony_count == 0
        assert estimate.has_fallback is False

    def test_area_ratio_against_median_single(self):
        estimate = estimate_merged_colonies([single(10, 10), single(10, 10), merged(20, 20)])
        assert estimate.per_bbox_estimates == [4]
        assert estimate.estimation_method == "area_based"

    def test_fallback_without_single_reference(self):
        estimate = estimate_merged_colonies([merged(20, 20), merged(30, 30)])
        assert estimate.estimated_colony_count == 4
        assert estimate.estimation_method == "fallback_no_reference"
        assert estimate.has_fallback is True

    def test_merged_smaller_than_single_counts_one(self):
        estimate = estimate_merged_colonies([single(10, 10), merged(5, 5)])
        assert estimate.per_bbox_estimates == [1]
        assert estimate.has_fallback is True

    def test_zero_area_merged_bbox_falls_back_to_two(self):
        estimate = estimate_merged_colonies([single(), merged(0, 10)])
        assert estimate.per_bbox_estimates == [2]


class TestUncertainty:
    def test_components_scale_with_cfu(self):
        u = calculate_uncertainty(
            cfu_per_ml=100_000.0, model_map=0.941, colony_count=100, pipette_cv=0.01
        )
        assert u.u_model == pytest.approx((1 - 0.941) * 100_000.0)
        assert u.u_counting == pytest.approx((0.5 / 100) * 100_000.0)
        assert u.u_dilution == pytest.approx(0.01 * 100_000.0)
        assert u.U_expanded == pytest.approx(2 * u.u_combined)
