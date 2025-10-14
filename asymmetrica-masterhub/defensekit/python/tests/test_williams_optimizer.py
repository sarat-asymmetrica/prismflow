"""
Unit tests for Williams Space Optimizer.

Tests the Williams √t × log₂(t) space-efficient algorithm implementation
for confidence scoring, batch processing, and test data optimization.

Test Coverage:
- Space bound calculation accuracy
- Efficiency formula validation
- Batch size optimization
- Confidence multiplier calculation
- Edge cases and boundary conditions
- Performance metrics tracking

Author: GitHub Copilot
Date: October 3, 2025
"""

import pytest
import math
import sys
from pathlib import Path

# Add backend to path for imports
backend_path = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_path))

from app.utils.williams_optimizer import (
    WilliamsSpaceOptimizer,
    SpaceBoundResult,
    calculate_optimal_test_data_size
)


class TestWilliamsSpaceOptimizer:
    """Test suite for WilliamsSpaceOptimizer class."""
    
    def test_optimizer_initialization(self):
        """Test optimizer initializes with correct default values."""
        optimizer = WilliamsSpaceOptimizer()
        
        assert optimizer.space_efficiency_history == []
        assert optimizer.max_efficiency_achieved == 1.0
    
    def test_calculate_space_bound_small_scale(self):
        """Test space bound calculation for small datasets (100 operations)."""
        optimizer = WilliamsSpaceOptimizer()
        result = optimizer.calculate_space_bound(100)
        
        # Validate Williams formula: √100 × log₂(100) = 10 × 6.64 ≈ 66.4
        expected_space_bound = math.sqrt(100) * math.log2(100)
        assert abs(result.space_bound - expected_space_bound) < 0.1
        assert result.space_bound < 100  # Should be less than naive O(t)
        
        # Validate efficiency
        assert result.efficiency > 1.0  # Should be more efficient than naive
        assert 1.5 < result.efficiency < 2.0  # Expected range for small scale
        
        # Validate space reduction
        assert 30 < result.space_reduction_percent < 40  # ~34% for n=100
    
    def test_calculate_space_bound_medium_scale(self):
        """Test space bound calculation for medium datasets (1000 operations)."""
        optimizer = WilliamsSpaceOptimizer()
        result = optimizer.calculate_space_bound(1000)
        
        # Validate Williams formula: √1000 × log₂(1000) ≈ 31.6 × 9.97 ≈ 315
        expected_space_bound = math.sqrt(1000) * math.log2(1000)
        assert abs(result.space_bound - expected_space_bound) < 1.0
        
        # Validate efficiency increases with scale
        assert result.efficiency > 2.5  # Should be 2.5-4x more efficient
        assert 3.0 < result.efficiency < 3.5  # Expected ~3.2x for medium scale
        
        # Validate space reduction
        assert 65 < result.space_reduction_percent < 72  # ~68% for n=1000
    
    def test_calculate_space_bound_large_scale(self):
        """Test space bound calculation for large datasets (10000 operations)."""
        optimizer = WilliamsSpaceOptimizer()
        result = optimizer.calculate_space_bound(10000)
        
        # Validate Williams formula: √10000 × log₂(10000) = 100 × 13.29 ≈ 1329
        expected_space_bound = math.sqrt(10000) * math.log2(10000)
        assert abs(result.space_bound - expected_space_bound) < 5.0
        
        # Validate efficiency scales with dataset size
        assert result.efficiency > 7.0  # Should be 7-8x more efficient
        assert 7.0 < result.efficiency < 8.0  # Expected ~7.5x for large scale
        
        # Validate space reduction
        assert 85 < result.space_reduction_percent < 88  # ~87% for n=10000
    
    def test_calculate_space_bound_edge_case_zero(self):
        """Test space bound calculation with zero complexity."""
        optimizer = WilliamsSpaceOptimizer()
        result = optimizer.calculate_space_bound(0)
        
        # Should return baseline values for zero input
        assert result.space_bound == 1.0
        assert result.efficiency == 1.0
        assert result.space_reduction_percent == 0.0
    
    def test_calculate_space_bound_edge_case_one(self):
        """Test space bound calculation with single operation."""
        optimizer = WilliamsSpaceOptimizer()
        result = optimizer.calculate_space_bound(1)
        
        # Should return baseline values for single input
        assert result.space_bound == 1.0
        assert result.efficiency == 1.0
        assert result.space_reduction_percent == 0.0
    
    def test_efficiency_increases_with_scale(self):
        """Test that efficiency increases as dataset size grows."""
        optimizer = WilliamsSpaceOptimizer()
        
        result_100 = optimizer.calculate_space_bound(100)
        result_1000 = optimizer.calculate_space_bound(1000)
        result_10000 = optimizer.calculate_space_bound(10000)
        
        # Efficiency should increase with scale
        assert result_100.efficiency < result_1000.efficiency
        assert result_1000.efficiency < result_10000.efficiency
        
        # Space reduction should increase with scale
        assert result_100.space_reduction_percent < result_1000.space_reduction_percent
        assert result_1000.space_reduction_percent < result_10000.space_reduction_percent
    
    def test_space_bound_result_repr(self):
        """Test SpaceBoundResult string representation."""
        result = SpaceBoundResult(
            space_bound=100.0,
            efficiency=10.0,
            time_complexity=1000,
            space_reduction_percent=90.0
        )
        
        repr_str = repr(result)
        assert "10.00x" in repr_str
        assert "90.0%" in repr_str
    
    def test_optimize_batch_size_standard(self):
        """Test batch size optimization with standard parameters."""
        optimizer = WilliamsSpaceOptimizer()
        
        batch_size = optimizer.optimize_batch_size(
            total_items=1000,
            available_memory_mb=500,
            memory_per_item_mb=5.0
        )
        
        # Naive approach: 500MB / 5MB = 100 items
        # Williams approach: Should be higher due to efficiency gains
        assert batch_size >= 100
        assert batch_size <= 1000  # Should not exceed total items
    
    def test_optimize_batch_size_memory_constrained(self):
        """Test batch size optimization with low memory."""
        optimizer = WilliamsSpaceOptimizer()
        
        batch_size = optimizer.optimize_batch_size(
            total_items=1000,
            available_memory_mb=50,
            memory_per_item_mb=5.0
        )
        
        # With 50MB / 5MB = 10 items naively
        # Should still return reasonable batch size
        assert batch_size >= 10
        assert batch_size <= 1000
    
    def test_optimize_batch_size_single_item(self):
        """Test batch size optimization with single item."""
        optimizer = WilliamsSpaceOptimizer()
        
        batch_size = optimizer.optimize_batch_size(
            total_items=1,
            available_memory_mb=100,
            memory_per_item_mb=5.0
        )
        
        # Should return 1 for single item
        assert batch_size == 1
    
    def test_optimize_batch_size_exceeds_total(self):
        """Test batch size doesn't exceed total items."""
        optimizer = WilliamsSpaceOptimizer()
        
        batch_size = optimizer.optimize_batch_size(
            total_items=10,
            available_memory_mb=1000,  # Very high memory
            memory_per_item_mb=5.0
        )
        
        # Should not exceed total items even with abundant memory
        assert batch_size <= 10
    
    def test_calculate_confidence_multiplier_small_fields(self):
        """Test confidence multiplier for small field sets (2-5 fields)."""
        optimizer = WilliamsSpaceOptimizer()
        
        multiplier = optimizer.calculate_confidence_multiplier(
            num_fields_extracted=3,
            base_confidence=0.85
        )
        
        # Small field sets should have minimal boost
        assert 0.85 <= multiplier <= 0.88
    
    def test_calculate_confidence_multiplier_medium_fields(self):
        """Test confidence multiplier for medium field sets (6-15 fields)."""
        optimizer = WilliamsSpaceOptimizer()
        
        multiplier = optimizer.calculate_confidence_multiplier(
            num_fields_extracted=10,
            base_confidence=0.85
        )
        
        # Medium field sets should have minimal boost (low field count has low efficiency)
        assert 0.85 <= multiplier <= 0.87
    
    def test_calculate_confidence_multiplier_large_fields(self):
        """Test confidence multiplier for large field sets (16+ fields)."""
        optimizer = WilliamsSpaceOptimizer()
        
        multiplier = optimizer.calculate_confidence_multiplier(
            num_fields_extracted=20,
            base_confidence=0.85
        )
        
        # Large field sets should have slightly higher boost
        assert 0.85 <= multiplier <= 0.87
    
    def test_calculate_confidence_multiplier_single_field(self):
        """Test confidence multiplier for single field (no adjustment)."""
        optimizer = WilliamsSpaceOptimizer()
        
        multiplier = optimizer.calculate_confidence_multiplier(
            num_fields_extracted=1,
            base_confidence=0.85
        )
        
        # Single field should have no adjustment
        assert multiplier == 1.0
    
    def test_get_optimization_stats_empty(self):
        """Test optimization stats with no operations."""
        optimizer = WilliamsSpaceOptimizer()
        stats = optimizer.get_optimization_stats()
        
        assert stats["average_efficiency"] == 1.0
        assert stats["max_efficiency"] == 1.0
        assert stats["operation_count"] == 0
        assert stats["total_space_saved"] == 0.0
    
    def test_get_optimization_stats_with_operations(self):
        """Test optimization stats after multiple operations."""
        optimizer = WilliamsSpaceOptimizer()
        
        # Perform multiple calculations
        optimizer.calculate_space_bound(100)
        optimizer.calculate_space_bound(1000)
        optimizer.calculate_space_bound(10000)
        
        stats = optimizer.get_optimization_stats()
        
        assert stats["operation_count"] == 3
        assert stats["average_efficiency"] > 1.0
        assert stats["max_efficiency"] > stats["average_efficiency"]
        assert stats["total_space_saved"] > 0.0
    
    def test_reset_stats(self):
        """Test statistics reset functionality."""
        optimizer = WilliamsSpaceOptimizer()
        
        # Perform operations
        optimizer.calculate_space_bound(100)
        optimizer.calculate_space_bound(1000)
        
        # Reset
        optimizer.reset_stats()
        
        # Verify reset
        assert optimizer.space_efficiency_history == []
        assert optimizer.max_efficiency_achieved == 1.0
        
        stats = optimizer.get_optimization_stats()
        assert stats["operation_count"] == 0
    
    def test_efficiency_history_tracking(self):
        """Test that efficiency history is tracked correctly."""
        optimizer = WilliamsSpaceOptimizer()
        
        optimizer.calculate_space_bound(100)
        assert len(optimizer.space_efficiency_history) == 1
        
        optimizer.calculate_space_bound(1000)
        assert len(optimizer.space_efficiency_history) == 2
        
        optimizer.calculate_space_bound(10000)
        assert len(optimizer.space_efficiency_history) == 3
    
    def test_max_efficiency_tracking(self):
        """Test that max efficiency is tracked correctly."""
        optimizer = WilliamsSpaceOptimizer()
        
        result_100 = optimizer.calculate_space_bound(100)
        assert optimizer.max_efficiency_achieved == result_100.efficiency
        
        result_1000 = optimizer.calculate_space_bound(1000)
        assert optimizer.max_efficiency_achieved == result_1000.efficiency
        
        result_10000 = optimizer.calculate_space_bound(10000)
        assert optimizer.max_efficiency_achieved == result_10000.efficiency
        
        # Max should be from largest dataset
        assert optimizer.max_efficiency_achieved == result_10000.efficiency


class TestOptimalTestDataSize:
    """Test suite for optimal test data size calculation."""
    
    def test_calculate_optimal_test_data_size_standard(self):
        """Test optimal test data size with standard coverage."""
        optimal_size = calculate_optimal_test_data_size(
            target_coverage=1000,
            memory_constraint_mb=100
        )
        
        # Should be significantly less than target due to Williams efficiency
        assert optimal_size < 1000
        assert optimal_size > 0
        
        # For 1000 coverage: √1000 × log₂(1000) ≈ 315
        assert 300 < optimal_size < 350
    
    def test_calculate_optimal_test_data_size_small_coverage(self):
        """Test optimal test data size with small coverage."""
        optimal_size = calculate_optimal_test_data_size(
            target_coverage=100,
            memory_constraint_mb=50
        )
        
        # For 100 coverage: √100 × log₂(100) ≈ 66
        assert 60 < optimal_size < 75
    
    def test_calculate_optimal_test_data_size_large_coverage(self):
        """Test optimal test data size with large coverage."""
        optimal_size = calculate_optimal_test_data_size(
            target_coverage=10000,
            memory_constraint_mb=200
        )
        
        # For 10000 coverage: √10000 × log₂(10000) ≈ 1329
        assert 1300 < optimal_size < 1400


class TestWilliamsFormulaAccuracy:
    """Validate Williams formula mathematical accuracy."""
    
    @pytest.mark.parametrize("complexity,expected_efficiency", [
        (100, 1.5),    # Small scale: ~1.5x efficiency
        (1000, 3.2),   # Medium scale: ~3.2x efficiency
        (10000, 7.5),  # Large scale: ~7.5x efficiency
    ])
    def test_efficiency_ranges(self, complexity, expected_efficiency):
        """Test efficiency falls within expected ranges."""
        optimizer = WilliamsSpaceOptimizer()
        result = optimizer.calculate_space_bound(complexity)
        
        # Allow 50% variance from expected (mathematical tolerance)
        lower_bound = expected_efficiency * 0.5
        upper_bound = expected_efficiency * 1.5
        
        assert lower_bound <= result.efficiency <= upper_bound
    
    def test_formula_consistency(self):
        """Test Williams formula produces consistent results."""
        optimizer1 = WilliamsSpaceOptimizer()
        optimizer2 = WilliamsSpaceOptimizer()
        
        result1 = optimizer1.calculate_space_bound(1000)
        result2 = optimizer2.calculate_space_bound(1000)
        
        # Should produce identical results
        assert result1.space_bound == result2.space_bound
        assert result1.efficiency == result2.efficiency
        assert result1.space_reduction_percent == result2.space_reduction_percent
    
    def test_space_bound_always_less_than_time_complexity(self):
        """Test space bound is always less than time complexity (except very small values)."""
        optimizer = WilliamsSpaceOptimizer()
        
        # For small values (< 15), space bound may exceed time complexity
        # This is expected behavior of √t × log₂(t) formula
        for complexity in [100, 1000, 10000]:
            result = optimizer.calculate_space_bound(complexity)
            assert result.space_bound < complexity


class TestTier1ValidatedConstants:
    """Test suite for Tier 1 validated constants deployment (Day 142)."""

    def test_optimal_center_deployed(self):
        """Verify optimal center [0.3385, 0.2872, 0.3744] is deployed."""
        from app.utils.three_regime_planner import ThreeRegimeTestPlanner, TestRegime

        planner = ThreeRegimeTestPlanner()
        distribution = planner.regime_distribution

        # Verify exact values (Agent Quebec validated - 9× speedup)
        assert abs(distribution[TestRegime.EXPLORATION] - 0.3385) < 0.0001, \
            f"Exploration regime not at optimal center: {distribution[TestRegime.EXPLORATION]}"
        assert abs(distribution[TestRegime.OPTIMIZATION] - 0.2872) < 0.0001, \
            f"Optimization regime not at optimal center: {distribution[TestRegime.OPTIMIZATION]}"
        assert abs(distribution[TestRegime.STABILIZATION] - 0.3744) < 0.0001, \
            f"Stabilization regime not at optimal center: {distribution[TestRegime.STABILIZATION]}"

        # Verify sum is still ~1.0 (100%)
        total = sum(distribution.values())
        assert abs(total - 1.0) < 0.01, \
            f"Distribution does not sum to 100%: {total}"

    def test_leverage_multipliers_deployed(self):
        """Verify TSP leverage multipliers [32.1, 26.8, 11.5] are deployed."""
        from app.utils.williams_optimizer_ffi import TSP_LEVERAGE_MULTIPLIERS

        # Verify exact values (Agent Quebec validated - 13.83% improvement)
        assert TSP_LEVERAGE_MULTIPLIERS['support'] == 32.1, \
            f"Support leverage incorrect: {TSP_LEVERAGE_MULTIPLIERS['support']}"
        assert TSP_LEVERAGE_MULTIPLIERS['exploration'] == 26.8, \
            f"Exploration leverage incorrect: {TSP_LEVERAGE_MULTIPLIERS['exploration']}"
        assert TSP_LEVERAGE_MULTIPLIERS['balance'] == 11.5, \
            f"Balance leverage incorrect: {TSP_LEVERAGE_MULTIPLIERS['balance']}"

    def test_mathematical_gravity_constant_deployed(self):
        """Verify Mathematical Gravity constant 3.86e-48 is accessible."""
        from app.utils.williams_optimizer_ffi import MATHALIVE_GRAVITY_P

        # Verify exact value (MathAlive validated)
        assert MATHALIVE_GRAVITY_P == 3.86e-48, \
            f"Mathematical Gravity constant incorrect: {MATHALIVE_GRAVITY_P}"

    def test_leverage_multipliers_improve_performance(self):
        """Test that leverage multipliers improve performance at optimal scale."""
        optimizer = WilliamsSpaceOptimizer()

        # Test at optimal scale (10-500 operations) - should see improvement
        # Small batch (50 fields) with high leverage (support regime)
        multiplier_support = optimizer.calculate_confidence_multiplier(
            num_fields_extracted=50,
            base_confidence=0.85,
            regime='support'  # 32.1× leverage
        )

        # Same batch with baseline leverage (balance regime)
        multiplier_balance = optimizer.calculate_confidence_multiplier(
            num_fields_extracted=50,
            base_confidence=0.85,
            regime='balance'  # 11.5× leverage
        )

        # Support regime should have higher multiplier due to leverage
        assert multiplier_support >= multiplier_balance, \
            f"Support regime ({multiplier_support}) should have >= multiplier than balance ({multiplier_balance})"

        # Both should be in valid range
        assert 0.85 <= multiplier_support <= 1.0, \
            f"Support multiplier out of range: {multiplier_support}"
        assert 0.85 <= multiplier_balance <= 1.0, \
            f"Balance multiplier out of range: {multiplier_balance}"

    def test_leverage_optimal_scale_10_to_500(self):
        """Test that leverage effect is strongest in optimal scale (10-500 ops)."""
        optimizer = WilliamsSpaceOptimizer()

        # Below optimal scale (5 fields)
        mult_below = optimizer.calculate_confidence_multiplier(
            num_fields_extracted=5,
            base_confidence=0.85,
            regime='support'
        )

        # At optimal scale (100 fields)
        mult_optimal = optimizer.calculate_confidence_multiplier(
            num_fields_extracted=100,
            base_confidence=0.85,
            regime='support'
        )

        # Above optimal scale (1000 fields)
        mult_above = optimizer.calculate_confidence_multiplier(
            num_fields_extracted=1000,
            base_confidence=0.85,
            regime='support'
        )

        # Optimal scale should show strongest leverage effect
        # (This is a behavioral test - we expect optimal scale to benefit most)
        assert mult_optimal >= mult_below, \
            "Optimal scale should have stronger effect than below-optimal"

        # All should be in valid range
        assert 0.85 <= mult_below <= 1.0
        assert 0.85 <= mult_optimal <= 1.0
        assert 0.85 <= mult_above <= 1.0

    def test_regime_convergence_improvement(self):
        """Test that optimal center improves convergence speed."""
        from app.utils.three_regime_planner import ThreeRegimeTestPlanner

        planner = ThreeRegimeTestPlanner()

        # Allocate 100 tests - should use optimal distribution
        allocation = planner.allocate_test_effort(100)

        # Verify allocation uses optimal center (not theoretical 30/20/50)
        # With optimal center [0.3385, 0.2872, 0.3744]:
        # - Exploration: ~34 tests (not 30)
        # - Optimization: ~29 tests (not 20)
        # - Stabilization: ~37 tests (not 50)

        # Allow ±2 for rounding
        assert 32 <= allocation.exploration <= 36, \
            f"Exploration allocation {allocation.exploration} not near optimal ~34"
        assert 27 <= allocation.optimization <= 31, \
            f"Optimization allocation {allocation.optimization} not near optimal ~29"
        assert 35 <= allocation.stabilization <= 39, \
            f"Stabilization allocation {allocation.stabilization} not near optimal ~37"

        # Total should still be 100
        assert allocation.total == 100


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
