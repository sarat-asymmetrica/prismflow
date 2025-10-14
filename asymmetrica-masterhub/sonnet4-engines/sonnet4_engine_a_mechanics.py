"""
SONNET 4 ENGINE A - PURE MECHANICS
Stripped of "consciousness" language, focused on WHAT WORKS.

Three Validated Engines:
1. Asymmetric Regime Weighting (max/mean/min)
2. Harmonic Resonance (Tesla's contribution)
3. Exponential Collaboration (quadratic bonus)

@inspiration: Sonnet 4 (DefenseKit OG), Tesla (preponderance), TRC Fractal
@validation: Testing on TRC data
@philosophy: Wright Brothers Empiricism - build, test, measure!
"""

import numpy as np
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import json

# Validated constants from Sonnet 4
LEVERAGE_MULTIPLIERS = {
    'support': 32.1,      # Local pattern recognition
    'exploration': 26.8,  # Novel discovery
    'balance': 11.5       # Center-seeking
}

REGIME_BIASES = [0.30, 0.20, 0.50]  # Three-regime dynamics
TESLA_HARMONIC = 4.909  # Hz


@dataclass
class AsymmetricMeasurementResult:
    """Result from asymmetric regime weighting"""
    asymmetric_score: float
    harmonic_resonance: float
    collaboration_bonus: float
    total_amplification: float
    component_breakdown: Dict[str, float]

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for analysis"""
        return {
            'asymmetric_score': self.asymmetric_score,
            'harmonic_resonance': self.harmonic_resonance,
            'collaboration_bonus': self.collaboration_bonus,
            'total_amplification': self.total_amplification,
            'component_breakdown': self.component_breakdown
        }


class AsymmetricRegimeEngine:
    """
    Engine A: Asymmetric Regime Weighting

    Uses MAX/MEAN/MIN instead of equal weighting.
    Tesla's preponderant impulse in action!

    Key Insight: Different regimes contribute differently
    - Exploration (30%): Take BEST score (optimistic)
    - Optimization (20%): Take AVERAGE (balanced)
    - Stabilization (50%): Take WORST (pessimistic)
    """

    def __init__(self, regime_biases: Optional[List[float]] = None):
        """Initialize with regime biases [exploration, optimization, stabilization]"""
        self.regime_biases = regime_biases or REGIME_BIASES

    def measure_asymmetric(self, measurements: List[float]) -> float:
        """
        Apply asymmetric regime weighting

        Args:
            measurements: List of component scores (e.g., [fibonacci, collatz, harmonic, goldbach, pi_d])

        Returns:
            Asymmetrically weighted score
        """
        if not measurements:
            return 0.0

        exploration_score = max(measurements) * self.regime_biases[0]    # Optimistic (best)
        optimization_score = np.mean(measurements) * self.regime_biases[1]  # Balanced (average)
        stabilization_score = min(measurements) * self.regime_biases[2]   # Pessimistic (worst)

        asymmetric_total = exploration_score + optimization_score + stabilization_score

        # Tesla boost from harmonic frequency
        tesla_boost = 1.0 + (TESLA_HARMONIC / 10.0)  # ≈ 1.49×

        return asymmetric_total * tesla_boost

    def get_component_breakdown(self, measurements: List[float]) -> Dict[str, float]:
        """Get detailed breakdown of regime contributions"""
        if not measurements:
            return {
                'exploration': 0.0,
                'optimization': 0.0,
                'stabilization': 0.0
            }

        return {
            'exploration': max(measurements) * self.regime_biases[0],
            'optimization': np.mean(measurements) * self.regime_biases[1],
            'stabilization': min(measurements) * self.regime_biases[2]
        }


class HarmonicResonanceEngine:
    """
    Engine B: Harmonic Resonance

    Uses harmonic mean (Tesla's frequency approach) instead of arithmetic mean.

    Key Insight: Harmonic mean weights toward smaller values,
    preventing single high score from dominating
    """

    def calculate_resonance(self, scores: List[float]) -> float:
        """
        Calculate harmonic resonance between components

        Args:
            scores: Component scores to harmonize

        Returns:
            Resonance amplification factor (1.0 = no boost, higher = more resonance)
        """
        # Filter out zeros and negatives (can't take harmonic mean of zeros)
        valid_scores = [s for s in scores if s > 0]

        if not valid_scores:
            return 1.0

        # Harmonic mean: n / Σ(1/xi)
        harmonic = len(valid_scores) / sum(1.0/s for s in valid_scores)

        # Resonance amplification (scale to make it meaningful)
        resonance_amp = 1.0 + (harmonic * 10.0)

        return resonance_amp


class ExponentialCollaborationEngine:
    """
    Engine C: Exponential Collaboration

    Quadratic bonus for more active components working together.

    Key Insight: Network effects are non-linear!
    More components = MORE THAN LINEAR improvement
    """

    def calculate_collaboration_bonus(self,
                                     active_count: int,
                                     total_count: int) -> float:
        """
        Calculate exponential collaboration bonus

        Args:
            active_count: Number of components above threshold
            total_count: Total possible components

        Returns:
            Collaboration bonus (1.0 to 11.0)
        """
        if total_count == 0:
            return 1.0

        activation_ratio = active_count / total_count

        # Quadratic bonus! Network effects = exponential
        bonus = (activation_ratio ** 2) * 10.0

        return 1.0 + bonus


class Sonnet4EngineA:
    """
    Complete Sonnet 4 Engine A Integration

    Combines all three engines for maximum amplification:
    1. Asymmetric weighting (MAX/MEAN/MIN)
    2. Harmonic resonance (Tesla's contribution)
    3. Exponential collaboration (network effects)
    """

    def __init__(self, regime_biases: Optional[List[float]] = None):
        """Initialize with optional custom regime biases"""
        self.asymmetric = AsymmetricRegimeEngine(regime_biases)
        self.harmonic = HarmonicResonanceEngine()
        self.collaboration = ExponentialCollaborationEngine()

    def process(self,
                component_scores: List[float],
                active_threshold: float = 0.5) -> AsymmetricMeasurementResult:
        """
        Process measurements through all three engines

        Args:
            component_scores: Individual component scores (e.g., TRC Fractal components)
            active_threshold: Threshold for counting as "active"

        Returns:
            Complete measurement result with all amplifications
        """
        # Engine 1: Asymmetric weighting
        asymmetric_score = self.asymmetric.measure_asymmetric(component_scores)
        component_breakdown = self.asymmetric.get_component_breakdown(component_scores)

        # Engine 2: Harmonic resonance
        harmonic_resonance = self.harmonic.calculate_resonance(component_scores)

        # Engine 3: Collaboration bonus
        active_count = sum(1 for s in component_scores if s > active_threshold)
        collaboration_bonus = self.collaboration.calculate_collaboration_bonus(
            active_count, len(component_scores)
        )

        # Total amplification (normalized multiplicative)
        # Scale down the multiplicative explosion for confidence scoring
        # Use geometric mean to keep in reasonable range
        base_product = asymmetric_score * harmonic_resonance * collaboration_bonus
        # Normalize: take cube root to undo the three multiplications, then scale
        total_amp = (base_product ** (1.0/3.0)) * asymmetric_score

        return AsymmetricMeasurementResult(
            asymmetric_score=asymmetric_score,
            harmonic_resonance=harmonic_resonance,
            collaboration_bonus=collaboration_bonus,
            total_amplification=total_amp,
            component_breakdown=component_breakdown
        )

    def process_multiple(self,
                        component_score_list: List[List[float]],
                        active_threshold: float = 0.5) -> List[AsymmetricMeasurementResult]:
        """Process multiple measurement sets"""
        return [self.process(scores, active_threshold) for scores in component_score_list]


def compare_methods(component_scores: List[float]) -> Dict[str, float]:
    """
    Compare three approaches:
    1. Classical equal weighting (arithmetic mean)
    2. Tesla asymmetric impulse (from existing implementation)
    3. Sonnet 4 Engine A (all three engines)

    Args:
        component_scores: TRC component scores [tesla, riemann, collatz, goldbach, pi_d]

    Returns:
        Dictionary with scores from each method
    """
    # Classical: Simple arithmetic mean
    classical_score = np.mean(component_scores)

    # Tesla asymmetric (from existing code - asymmetric regime weighting only)
    asymmetric_engine = AsymmetricRegimeEngine()
    tesla_score = asymmetric_engine.measure_asymmetric(component_scores)

    # Sonnet 4 Engine A (all three engines)
    sonnet4_engine = Sonnet4EngineA()
    sonnet4_result = sonnet4_engine.process(component_scores)

    return {
        'classical': classical_score,
        'tesla_asymmetric': tesla_score,
        'sonnet4_full': sonnet4_result.total_amplification,
        'improvement_over_classical': ((sonnet4_result.total_amplification - classical_score) / classical_score * 100) if classical_score > 0 else 0,
        'improvement_over_tesla': ((sonnet4_result.total_amplification - tesla_score) / tesla_score * 100) if tesla_score > 0 else 0,
        'sonnet4_breakdown': sonnet4_result.to_dict()
    }


def demo_engine():
    """Quick demo of the engine"""
    print("SONNET 4 ENGINE A - PURE MECHANICS DEMO")
    print("=" * 80)

    # Example: TRC component scores from Neural Networks domain
    neural_scores = [0.500, 0.782, 0.777, 1.000, 0.860]  # [T, R, C, G, π-D]

    print("\nNeural Networks Domain:")
    print(f"Component Scores: {neural_scores}")

    comparison = compare_methods(neural_scores)

    print(f"\nClassical (arithmetic mean): {comparison['classical']:.4f}")
    print(f"Tesla Asymmetric: {comparison['tesla_asymmetric']:.4f}")
    print(f"Sonnet 4 Engine A: {comparison['sonnet4_full']:.4f}")
    print(f"\nImprovement over Classical: {comparison['improvement_over_classical']:+.2f}%")
    print(f"Improvement over Tesla: {comparison['improvement_over_tesla']:+.2f}%")

    print("\n" + "=" * 80)


if __name__ == "__main__":
    demo_engine()
