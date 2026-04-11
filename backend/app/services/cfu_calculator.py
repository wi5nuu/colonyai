from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field


@dataclass
class CFUResult:
    colony_count: int
    dilution_factor: float
    plated_volume_ml: float
    cfu_per_ml: float
    status: str  # "valid", "TNTC", "TFTC"
    confidence: float
    reliability: str  # "high", "medium", "low"
    class_breakdown: Dict[str, int] = field(default_factory=dict)
    is_valid_for_reporting: bool = True
    warning_messages: List[str] = field(default_factory=list)


class CFUCalculator:
    """Calculate CFU/ml from colony count and metadata
    
    Formula: CFU/ml = Colony Count / (Plated Volume × Dilution Factor)
    
    Counts only valid colonies (colony_single + colony_merged), excluding
    artifacts (bubbles, dust_debris, media_crack) per proposal specification.
    """

    # Standard countable range per ISO 17025
    MIN_COUNTABLE = 25
    MAX_COUNTABLE = 250

    # Confidence thresholds for reliability
    HIGH_CONFIDENCE_THRESHOLD = 0.8
    MEDIUM_CONFIDENCE_THRESHOLD = 0.6

    def calculate(
        self,
        colony_count: int,
        dilution_factor: float,
        plated_volume_ml: float,
        confidence: float = 1.0,
        reliability: str = "high",
        class_breakdown: Optional[Dict[str, int]] = None,
        detections: Optional[List[Dict[str, Any]]] = None,
    ) -> CFUResult:
        """
        Calculate CFU/ml with confidence-weighted results

        Args:
            colony_count: Number of valid colonies detected (excludes artifacts)
            dilution_factor: Dilution factor (e.g., 0.001 for 1:1000 dilution)
            plated_volume_ml: Volume plated in ml (typically 0.1 or 1.0)
            confidence: Average confidence score from model
            reliability: Plate-level reliability indicator
            class_breakdown: Count breakdown by class
            detections: Raw detection list for merged colony adjustment

        Returns:
            CFUResult with calculated values, status, and metadata
        """
        warnings = []

        # Validate inputs
        if dilution_factor <= 0:
            raise ValueError("Dilution factor must be positive")
        if plated_volume_ml <= 0:
            raise ValueError("Plated volume must be positive")

        # Apply merged colony adjustment if detections available
        adjusted_count = colony_count
        if detections:
            adjusted_count = self._adjust_merged_colonies(detections)
            if adjusted_count != colony_count:
                warnings.append(
                    f"Merged colony adjustment: {colony_count} → {adjusted_count}"
                )

        # Calculate CFU/ml
        cfu_per_ml = adjusted_count / (plated_volume_ml * dilution_factor)

        # Determine status based on countable range
        if adjusted_count > self.MAX_COUNTABLE:
            status = "TNTC"  # Too Numerous To Count
            warnings.append(
                f"Count exceeds maximum ({self.MAX_COUNTABLE}). Result may be inaccurate."
            )
        elif adjusted_count < self.MIN_COUNTABLE:
            status = "TFTC"  # Too Few To Count
            warnings.append(
                f"Count below minimum ({self.MIN_COUNTABLE}). Statistical reliability reduced."
            )
        else:
            status = "valid"

        # Determine validity for reporting
        is_valid = status == "valid" and reliability != "low"

        return CFUResult(
            colony_count=adjusted_count,
            dilution_factor=dilution_factor,
            plated_volume_ml=plated_volume_ml,
            cfu_per_ml=cfu_per_ml,
            status=status,
            confidence=confidence,
            reliability=reliability,
            class_breakdown=class_breakdown or {},
            is_valid_for_reporting=is_valid,
            warning_messages=warnings,
        )

    def _adjust_merged_colonies(
        self, detections: List[Dict[str, Any]]
    ) -> int:
        """Apply heuristic adjustment for merged colonies
        
        Merged colonies typically contain 2-3 individual colonies.
        This applies a conservative adjustment factor.
        """
        single_count = sum(
            1 for d in detections if d.get('class_name') == 'colony_single'
        )
        merged_count = sum(
            1 for d in detections if d.get('class_name') == 'colony_merged'
        )

        # Adjustment: each merged colony ≈ 2 individual colonies
        MERGED_FACTOR = 2.0
        return int(single_count + (merged_count * MERGED_FACTOR))

    def format_result(self, result: CFUResult) -> str:
        """Format CFU result for display"""
        if result.status == "TNTC":
            return f"TNTC (>250 colonies)"
        elif result.status == "TFTC":
            return f"TFTC (<25 colonies)"
        else:
            # Use scientific notation for large numbers
            if result.cfu_per_ml >= 10000:
                return f"{result.cfu_per_ml:.2e} CFU/ml"
            else:
                return f"{result.cfu_per_ml:.2f} CFU/ml"

    def format_for_report(self, result: CFUResult) -> Dict[str, Any]:
        """Format CFU result as a report-ready dictionary"""
        return {
            "colony_count": result.colony_count,
            "cfu_per_ml": result.cfu_per_ml,
            "cfu_formatted": self.format_result(result),
            "status": result.status,
            "confidence": round(result.confidence * 100, 1),
            "reliability": result.reliability,
            "is_valid_for_reporting": result.is_valid_for_reporting,
            "class_breakdown": result.class_breakdown,
            "warnings": result.warning_messages,
        }

    def is_valid_for_reporting(self, result: CFUResult) -> bool:
        """Check if result is valid for official reporting"""
        return result.is_valid_for_reporting
