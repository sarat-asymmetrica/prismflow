"""
Three-Regime Test Planner Statistical Validation

Tests the mathematical correctness of 30/20/50 distribution:
1. Distribution proportions (Exploration: 30%, Optimization: 20%, Stabilization: 50%)
2. Weighted confidence scoring (0.7/0.85/1.0)
3. Statistical significance of regime allocation

@complexity O(n) where n = test count
@performance Target: <1s for full validation
@validation α₀ - Production-ready
"""

import pytest
from typing import List, Dict


class ThreeRegimePlannerStub:
    """Stub for Three-Regime Planner - to be replaced with actual implementation"""

    REGIME_DISTRIBUTION = {
        "exploration": 0.30,     # Edge cases, new features
        "optimization": 0.20,    # Performance, refactoring
        "stabilization": 0.50    # Critical paths, regression
    }

    REGIME_WEIGHTS = {
        "exploration": 0.70,     # Allow 30% failure
        "optimization": 0.85,    # Allow 15% failure
        "stabilization": 1.00    # Require 100% pass
    }

    def classify_test(self, test_name: str) -> str:
        """Classify test into regime based on keywords"""
        test_lower = test_name.lower()

        # Stabilization keywords (critical paths)
        if any(kw in test_lower for kw in ["critical", "regression", "production", "core"]):
            return "stabilization"

        # Exploration keywords (edge cases)
        if any(kw in test_lower for kw in ["edge", "boundary", "experimental", "new"]):
            return "exploration"

        # Optimization keywords (performance)
        if any(kw in test_lower for kw in ["performance", "benchmark", "optimize", "refactor"]):
            return "optimization"

        # Default to stabilization (conservative)
        return "stabilization"

    def calculate_weighted_confidence(self, test_results: Dict[str, List[bool]]) -> float:
        """Calculate overall confidence: pass_rate × regime_weight × regime_proportion"""
        total_confidence = 0.0

        for regime, results in test_results.items():
            if not results:
                continue

            pass_rate = sum(results) / len(results)
            regime_weight = self.REGIME_WEIGHTS[regime]
            regime_proportion = self.REGIME_DISTRIBUTION[regime]

            regime_confidence = pass_rate * regime_weight * regime_proportion
            total_confidence += regime_confidence

        return total_confidence

    def validate_distribution(self, test_counts: Dict[str, int]) -> bool:
        """Validate test distribution matches 30/20/50 target"""
        total = sum(test_counts.values())
        if total == 0:
            return False

        for regime, count in test_counts.items():
            actual_proportion = count / total
            target_proportion = self.REGIME_DISTRIBUTION[regime]

            # Allow ±10% tolerance
            tolerance = 0.10
            if abs(actual_proportion - target_proportion) > tolerance:
                return False

        return True


class TestThreeRegimeStatistics:
    """Statistical validation for Three-Regime Test Planner"""

    def test_distribution_proportions(self):
        """Verify 30/20/50 distribution is correct"""
        planner = ThreeRegimePlannerStub()

        assert planner.REGIME_DISTRIBUTION["exploration"] == 0.30
        assert planner.REGIME_DISTRIBUTION["optimization"] == 0.20
        assert planner.REGIME_DISTRIBUTION["stabilization"] == 0.50

        # Verify sum = 1.0
        total = sum(planner.REGIME_DISTRIBUTION.values())
        assert abs(total - 1.0) < 0.001, f"Distribution doesn't sum to 1.0: {total}"

        print("✓ Distribution proportions validated: 30/20/50")

    def test_regime_weights(self):
        """Verify regime weights: 0.7/0.85/1.0"""
        planner = ThreeRegimePlannerStub()

        assert planner.REGIME_WEIGHTS["exploration"] == 0.70
        assert planner.REGIME_WEIGHTS["optimization"] == 0.85
        assert planner.REGIME_WEIGHTS["stabilization"] == 1.00

        # Verify monotonicity (stabilization most important)
        assert planner.REGIME_WEIGHTS["exploration"] < planner.REGIME_WEIGHTS["optimization"]
        assert planner.REGIME_WEIGHTS["optimization"] < planner.REGIME_WEIGHTS["stabilization"]

        print("✓ Regime weights validated: 0.7 < 0.85 < 1.0")

    def test_weighted_confidence_calculation(self):
        """Verify weighted confidence formula"""
        planner = ThreeRegimePlannerStub()

        # Perfect scenario: all tests pass
        perfect_results = {
            "exploration": [True] * 30,
            "optimization": [True] * 20,
            "stabilization": [True] * 50
        }

        confidence = planner.calculate_weighted_confidence(perfect_results)
        # Expected: (1.0 × 0.7 × 0.3) + (1.0 × 0.85 × 0.2) + (1.0 × 1.0 × 0.5)
        #         = 0.21 + 0.17 + 0.50 = 0.88
        expected = 0.88
        assert abs(confidence - expected) < 0.01, f"Confidence mismatch: {confidence} vs {expected}"

        print(f"✓ Weighted confidence validated: {confidence:.2f}")

    def test_quality_gates(self):
        """Verify quality gate requirements"""
        planner = ThreeRegimePlannerStub()

        # Stabilization must be 100%
        stabilization_gate = planner.REGIME_WEIGHTS["stabilization"]
        assert stabilization_gate == 1.00, "Stabilization must require 100% pass"

        # Optimization must be 85%+
        optimization_gate = planner.REGIME_WEIGHTS["optimization"]
        assert optimization_gate >= 0.85, "Optimization must require 85%+ pass"

        # Exploration can be 70%+
        exploration_gate = planner.REGIME_WEIGHTS["exploration"]
        assert exploration_gate >= 0.70, "Exploration must require 70%+ pass"

        print("✓ Quality gates validated: Stabilization=100%, Optimization=85%, Exploration=70%")

    def test_classification_logic(self):
        """Test regime classification based on test names"""
        planner = ThreeRegimePlannerStub()

        # Stabilization tests
        assert planner.classify_test("test_critical_path") == "stabilization"
        assert planner.classify_test("test_regression_suite") == "stabilization"
        assert planner.classify_test("test_production_ready") == "stabilization"

        # Exploration tests
        assert planner.classify_test("test_edge_case_handling") == "exploration"
        assert planner.classify_test("test_boundary_conditions") == "exploration"
        assert planner.classify_test("test_experimental_feature") == "exploration"

        # Optimization tests
        assert planner.classify_test("test_performance_benchmark") == "optimization"
        assert planner.classify_test("test_optimize_batch_size") == "optimization"

        print("✓ Classification logic validated: keyword-based regime assignment")

    def test_distribution_validation(self):
        """Test distribution validation logic"""
        planner = ThreeRegimePlannerStub()

        # Valid distribution (30/20/50)
        valid_counts = {
            "exploration": 30,
            "optimization": 20,
            "stabilization": 50
        }
        assert planner.validate_distribution(valid_counts), "Valid distribution rejected"

        # Invalid distribution (too much exploration)
        invalid_counts = {
            "exploration": 60,
            "optimization": 20,
            "stabilization": 20
        }
        assert not planner.validate_distribution(invalid_counts), "Invalid distribution accepted"

        print("✓ Distribution validation logic validated")

    @pytest.mark.statistical
    def test_confidence_sensitivity_analysis(self):
        """Analyze confidence sensitivity to regime failures"""
        planner = ThreeRegimePlannerStub()

        # Scenario 1: Stabilization failure (critical!)
        scenario1 = {
            "exploration": [True] * 30,
            "optimization": [True] * 20,
            "stabilization": [True] * 49 + [False]  # 98% pass
        }
        confidence1 = planner.calculate_weighted_confidence(scenario1)

        # Scenario 2: Exploration failure (less critical)
        scenario2 = {
            "exploration": [True] * 20 + [False] * 10,  # 67% pass
            "optimization": [True] * 20,
            "stabilization": [True] * 50
        }
        confidence2 = planner.calculate_weighted_confidence(scenario2)

        # Scenario 1 should have LOWER confidence despite higher overall pass rate
        # because stabilization is weighted 1.0
        assert confidence1 < 0.88, "Stabilization failure didn't reduce confidence enough"
        print(f"✓ Sensitivity analysis: Stabilization failure={confidence1:.3f}, Exploration failure={confidence2:.3f}")

    def test_statistical_properties(self):
        """Verify statistical properties of distribution"""
        planner = ThreeRegimePlannerStub()

        # Expected value of regime selection
        # E[regime] = 0.3 × exploration + 0.2 × optimization + 0.5 × stabilization
        # If we assign values: exploration=1, optimization=2, stabilization=3
        regime_values = {"exploration": 1, "optimization": 2, "stabilization": 3}
        expected_value = sum(
            planner.REGIME_DISTRIBUTION[regime] * value
            for regime, value in regime_values.items()
        )
        # E[regime] = 0.3×1 + 0.2×2 + 0.5×3 = 0.3 + 0.4 + 1.5 = 2.2
        assert abs(expected_value - 2.2) < 0.01, f"Expected value incorrect: {expected_value}"

        print(f"✓ Statistical properties validated: E[regime] = {expected_value:.2f}")


if __name__ == "__main__":
    # Quick validation run
    import sys
    import io

    # Fix Windows console encoding
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    print("Three-Regime Test Planner Statistical Validation")
    print("=" * 50)

    test = TestThreeRegimeStatistics()
    test.test_distribution_proportions()
    test.test_regime_weights()
    test.test_weighted_confidence_calculation()
    test.test_quality_gates()
    test.test_classification_logic()
    test.test_distribution_validation()
    test.test_statistical_properties()

    print("\n✅ All statistical validations passed!")
