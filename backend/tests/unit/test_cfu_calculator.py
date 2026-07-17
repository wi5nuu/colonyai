import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

import pytest
from app.services.cfu_calculator import CFUCalculator, ColonyCounter, DetectionResult


class TestCFUCalculator:
    def setup_method(self):
        self.calculator = CFUCalculator()

    def test_basic_cfu_calculation(self):
        result = self.calculator.calculate(
            colony_count=100,
            dilution_factor=0.001,
            plated_volume_ml=1.0,
        )
        assert result.cfu_per_ml == 100000.0
        assert result.status == "valid"

    def test_cfu_with_merged_colonies(self):
        result = self.calculator.calculate(
            colony_count=50,
            dilution_factor=0.01,
            plated_volume_ml=0.1,
            merged_count=10,
        )
        expected = 50 / (0.1 * 0.01)
        assert result.cfu_per_ml == expected

    def test_tntc_flag(self):
        result = self.calculator.calculate(
            colony_count=300,
            dilution_factor=0.001,
            plated_volume_ml=1.0,
        )
        assert result.status == "tntc"

    def test_tftc_flag(self):
        result = self.calculator.calculate(
            colony_count=10,
            dilution_factor=0.001,
            plated_volume_ml=1.0,
        )
        assert result.status == "tftc"

    def test_boundary_valid_high(self):
        result = self.calculator.calculate(
            colony_count=250,
            dilution_factor=0.001,
            plated_volume_ml=1.0,
        )
        assert result.status == "valid"

    def test_boundary_valid_low(self):
        result = self.calculator.calculate(
            colony_count=25,
            dilution_factor=0.001,
            plated_volume_ml=1.0,
        )
        assert result.status == "valid"

    def test_zero_colonies(self):
        result = self.calculator.calculate(
            colony_count=0,
            dilution_factor=0.001,
            plated_volume_ml=1.0,
        )
        assert result.cfu_per_ml == 0.0

    def test_high_dilution(self):
        result = self.calculator.calculate(
            colony_count=150,
            dilution_factor=0.00001,
            plated_volume_ml=1.0,
        )
        assert result.cfu_per_ml == 15000000.0

    def test_low_plated_volume(self):
        result = self.calculator.calculate(
            colony_count=50,
            dilution_factor=0.001,
            plated_volume_ml=0.01,
        )
        assert result.cfu_per_ml == 5000000.0

    def test_rounding_consistency(self):
        results = []
        for _ in range(10):
            r = self.calculator.calculate(156, 0.001, 1.0)
            results.append(r.cfu_per_ml)
        assert all(r == results[0] for r in results)

    def test_measurement_uncertainty_present(self):
        result = self.calculator.calculate(
            colony_count=100,
            dilution_factor=0.001,
            plated_volume_ml=1.0,
        )
        assert hasattr(result, 'measurement_uncertainty')
        assert result.measurement_uncertainty > 0


class TestColonyCounter:
    def test_single_colony_detection(self):
        detections = [
            {"class_name": "colony_single", "confidence": 0.95},
        ]
        counter = ColonyCounter()
        result = counter.count(detections)
        assert result["valid_count"] == 1
        assert result["artifact_count"] == 0

    def test_mixed_detections(self):
        detections = [
            {"class_name": "colony_single", "confidence": 0.95},
            {"class_name": "colony_merged", "confidence": 0.88},
            {"class_name": "bubble", "confidence": 0.92},
            {"class_name": "dust_debris", "confidence": 0.85},
            {"class_name": "media_crack", "confidence": 0.90},
        ]
        counter = ColonyCounter()
        result = counter.count(detections)
        assert result["valid_count"] == 2  # single + merged
        assert result["artifact_count"] == 3  # bubble + dust + crack

    def test_all_artifacts(self):
        detections = [
            {"class_name": "bubble", "confidence": 0.90},
            {"class_name": "dust_debris", "confidence": 0.85},
        ]
        counter = ColonyCounter()
        result = counter.count(detections)
        assert result["valid_count"] == 0
        assert result["artifact_count"] == 2

    def test_empty_detections(self):
        counter = ColonyCounter()
        result = counter.count([])
        assert result["valid_count"] == 0
        assert result["artifact_count"] == 0

    def test_confidence_threshold_filtering(self):
        detections = [
            {"class_name": "colony_single", "confidence": 0.95},
            {"class_name": "colony_single", "confidence": 0.45},  # below threshold
        ]
        counter = ColonyCounter(confidence_threshold=0.6)
        result = counter.count(detections)
        assert result["valid_count"] == 1
