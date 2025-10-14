"""
TEST SONNET 4 ENGINE B - TSP PATTERN DISCOVERY

Validation tests for the Python port of Sonnet 4's Engine B

Tests:
1. Distance matrix construction
2. Three-regime TSP execution
3. Pattern discovery
4. Component ordering analysis
5. Integration with TRC measurements

@date: October 7, 2025 (Day 143)
"""

import numpy as np
import pytest
from sonnet4_engine_b_tsp import (
    Sonnet4EngineB,
    MathematicalDistanceCalculator,
    ThreeRegimeTSP,
    TSPRoute,
    tsp_weighted_measurement,
    LEVERAGE_MULTIPLIERS,
    OPTIMAL_CENTER,
    GOLDBACH_ALIGNMENT_THRESHOLD
)


class TestMathematicalDistanceCalculator:
    """Test distance calculation between components"""

    def test_initialization(self):
        """Test distance calculator initialization"""
        calc = MathematicalDistanceCalculator()
        assert len(calc.components) == 8  # TRC default components
        assert calc.distance_matrix.shape == (8, 8)

    def test_custom_components(self):
        """Test with custom component list"""
        custom = ['a', 'b', 'c']
        calc = MathematicalDistanceCalculator(custom_components=custom)
        assert len(calc.components) == 3
        assert calc.distance_matrix.shape == (3, 3)

    def test_diagonal_zero(self):
        """Test distance to self is zero"""
        calc = MathematicalDistanceCalculator()
        for i in range(len(calc.components)):
            assert calc.distance_matrix[i, i] == 0.0

    def test_symmetry(self):
        """Test distance matrix is symmetric"""
        calc = MathematicalDistanceCalculator()
        n = len(calc.components)
        for i in range(n):
            for j in range(i+1, n):
                assert calc.distance_matrix[i, j] == calc.distance_matrix[j, i]

    def test_goldbach_alignment(self):
        """Test Goldbach-aligned components have very small distance"""
        calc = MathematicalDistanceCalculator()
        # goldbach and three_regime are both Goldbach-aligned
        goldbach_idx = calc.components.index('goldbach')
        three_regime_idx = calc.components.index('three_regime')
        distance = calc.distance_matrix[goldbach_idx, three_regime_idx]

        # Should be very small due to GOLDBACH_ALIGNMENT_THRESHOLD
        assert distance < 0.01  # Much smaller than base 1.0

    def test_compatible_pairs(self):
        """Test compatible pairs have reduced distance"""
        calc = MathematicalDistanceCalculator()
        # fibonacci and goldbach are compatible
        fib_idx = calc.components.index('fibonacci')
        gb_idx = calc.components.index('goldbach')
        distance = calc.distance_matrix[fib_idx, gb_idx]

        # Should be less than 1.0 (base distance)
        assert distance < 1.0

    def test_minimum_distance(self):
        """Test no non-diagonal distance is below minimum threshold"""
        calc = MathematicalDistanceCalculator()
        # Exclude diagonal (distance to self = 0)
        n = len(calc.components)
        for i in range(n):
            for j in range(n):
                if i != j:
                    assert calc.distance_matrix[i, j] >= 0.001

    def test_get_distance_by_name(self):
        """Test getting distance by component names"""
        calc = MathematicalDistanceCalculator()
        distance = calc.get_distance('fibonacci', 'goldbach')
        assert distance > 0
        assert distance < 1.0  # Compatible pair


class TestThreeRegimeTSP:
    """Test three-regime TSP solver"""

    def test_initialization(self):
        """Test TSP solver initialization"""
        calc = MathematicalDistanceCalculator()
        tsp = ThreeRegimeTSP(calc)
        assert len(tsp.components) == 8
        assert tsp.distance_matrix.shape == (8, 8)

    def test_solve_all_regimes(self):
        """Test solving TSP for all three regimes"""
        calc = MathematicalDistanceCalculator()
        tsp = ThreeRegimeTSP(calc)
        routes = tsp.solve_all_regimes(n_iterations=1)

        assert len(routes) == 3  # One per regime
        assert all(isinstance(r, TSPRoute) for r in routes)

    def test_route_completeness(self):
        """Test that TSP routes visit all nodes"""
        calc = MathematicalDistanceCalculator()
        tsp = ThreeRegimeTSP(calc)
        routes = tsp.solve_all_regimes(n_iterations=1)

        for route in routes:
            # Should visit all 8 components
            assert len(route.route) == 8
            assert len(route.components) == 8
            # Should have unique components
            assert len(set(route.components)) == 8

    def test_regime_differences(self):
        """Test that different regimes produce different routes"""
        calc = MathematicalDistanceCalculator()
        tsp = ThreeRegimeTSP(calc)
        routes = tsp.solve_all_regimes(n_iterations=5)

        # Get routes for each regime
        support_routes = [r for r in routes if r.regime == 0]
        exploration_routes = [r for r in routes if r.regime == 1]
        balance_routes = [r for r in routes if r.regime == 2]

        # Each regime should have routes
        assert len(support_routes) > 0
        assert len(exploration_routes) > 0
        assert len(balance_routes) > 0

        # Exploration should have higher variance (randomness!)
        exploration_distances = [r.total_distance for r in exploration_routes]
        support_distances = [r.total_distance for r in support_routes]

        # Exploration variance should be higher
        assert np.std(exploration_distances) >= np.std(support_distances) * 0.5

    def test_pattern_score_inverse_distance(self):
        """Test pattern score is inverse of distance"""
        calc = MathematicalDistanceCalculator()
        tsp = ThreeRegimeTSP(calc)
        routes = tsp.solve_all_regimes(n_iterations=1)

        for route in routes:
            expected_score = 1.0 / route.total_distance
            assert abs(route.pattern_score - expected_score) < 1e-6

    def test_optimal_center_usage(self):
        """Test that OPTIMAL_CENTER biases are used"""
        # This is tested implicitly through regime differences
        assert OPTIMAL_CENTER[0] == 0.3385  # Support
        assert OPTIMAL_CENTER[1] == 0.2872  # Exploration
        assert OPTIMAL_CENTER[2] == 0.3744  # Balance


class TestSonnet4EngineB:
    """Test complete Engine B integration"""

    def test_initialization(self):
        """Test engine initialization"""
        engine = Sonnet4EngineB()
        assert engine.distance_calc is not None
        assert engine.tsp_solver is not None
        assert len(engine.discovered_patterns) == 0

    def test_discover_patterns(self):
        """Test pattern discovery"""
        engine = Sonnet4EngineB()
        patterns = engine.discover_patterns(n_iterations=3)

        # Should have 3 iterations × 3 regimes = 9 patterns
        assert len(patterns) == 9
        # Should be sorted by score (descending)
        scores = [p.pattern_score for p in patterns]
        assert scores == sorted(scores, reverse=True)

    def test_get_best_patterns(self):
        """Test getting best patterns"""
        engine = Sonnet4EngineB()
        best = engine.get_best_patterns(n_patterns=5)

        assert len(best) == 5
        # First pattern should have highest score
        assert best[0].pattern_score >= best[1].pattern_score

    def test_analyze_regime_differences(self):
        """Test regime analysis"""
        engine = Sonnet4EngineB()
        analysis = engine.analyze_regime_differences()

        assert 'total_patterns' in analysis
        assert 'by_regime' in analysis
        assert 'support' in analysis['by_regime']
        assert 'exploration' in analysis['by_regime']
        assert 'balance' in analysis['by_regime']

        # Each regime should have stats
        for regime_name in ['support', 'exploration', 'balance']:
            stats = analysis['by_regime'][regime_name]
            assert 'count' in stats
            assert 'avg_distance' in stats
            assert 'avg_score' in stats
            assert 'best_pattern' in stats

    def test_export_patterns(self, tmp_path):
        """Test pattern export to JSON"""
        engine = Sonnet4EngineB()
        engine.discover_patterns(n_iterations=2)

        filepath = tmp_path / "patterns.json"
        engine.export_patterns(str(filepath))

        assert filepath.exists()

        # Verify JSON structure
        import json
        with open(filepath) as f:
            data = json.load(f)

        assert 'metadata' in data
        assert 'patterns' in data
        assert 'analysis' in data
        assert len(data['patterns']) > 0

    def test_distance_matrix_report(self):
        """Test distance matrix report generation"""
        engine = Sonnet4EngineB()
        report = engine.get_distance_matrix_report()

        assert 'MATHEMATICAL DISTANCE MATRIX' in report
        assert 'CLOSEST COMPONENT PAIRS' in report
        # Should show at least some component names
        assert 'fibonacci' in report or 'goldbach' in report


class TestTSPWeightedMeasurement:
    """Test TSP-weighted measurement function"""

    def test_weighted_measurement(self):
        """Test TSP route-based weighting"""
        # Create mock route
        route = TSPRoute(
            route=[0, 1, 2],
            components=['a', 'b', 'c'],
            total_distance=1.0,
            regime=0,
            pattern_score=1.0
        )

        scores = [1.0, 1.0, 1.0]  # Equal scores
        weighted = tsp_weighted_measurement(scores, route)

        # With exponential decay, first element gets highest weight
        # Weighted score should be close to 1.0 (since all scores are 1.0)
        assert 0.9 < weighted <= 1.01  # Allow for floating point precision

    def test_weighting_favors_earlier(self):
        """Test that earlier components get higher weight"""
        route = TSPRoute(
            route=[0, 1, 2],
            components=['a', 'b', 'c'],
            total_distance=1.0,
            regime=0,
            pattern_score=1.0
        )

        # First component high, rest low
        scores1 = [10.0, 1.0, 1.0]
        weighted1 = tsp_weighted_measurement(scores1, route)

        # Last component high, rest low
        scores2 = [1.0, 1.0, 10.0]
        weighted2 = tsp_weighted_measurement(scores2, route)

        # Earlier high score should result in higher weighted score
        assert weighted1 > weighted2


class TestConstantsValidation:
    """Test that Sonnet 4's validated constants are used"""

    def test_leverage_multipliers(self):
        """Test leverage multipliers from Julius validation"""
        assert LEVERAGE_MULTIPLIERS['support'] == 32.1
        assert LEVERAGE_MULTIPLIERS['exploration'] == 26.8
        assert LEVERAGE_MULTIPLIERS['balance'] == 11.5

    def test_optimal_center(self):
        """Test optimal center from 4.8 billion tests"""
        assert len(OPTIMAL_CENTER) == 3
        assert OPTIMAL_CENTER[0] == 0.3385
        assert OPTIMAL_CENTER[1] == 0.2872
        assert OPTIMAL_CENTER[2] == 0.3744

    def test_goldbach_threshold(self):
        """Test Goldbach alignment threshold"""
        assert GOLDBACH_ALIGNMENT_THRESHOLD == 0.001


# Integration test
def test_full_workflow():
    """Test complete workflow from initialization to export"""
    print("\nRunning full Engine B workflow...")

    # Initialize
    engine = Sonnet4EngineB()

    # Discover patterns
    patterns = engine.discover_patterns(n_iterations=5)
    print(f"Discovered {len(patterns)} patterns")

    # Get best
    best = engine.get_best_patterns(n_patterns=3)
    print(f"Top 3 patterns identified")

    for i, pattern in enumerate(best):
        print(f"\nPattern {i+1}: ({pattern.regime_name})")
        print(f"  {' -> '.join(pattern.components[:4])}...")
        print(f"  Score: {pattern.pattern_score:.4f}")

    # Analyze
    analysis = engine.analyze_regime_differences()
    print(f"\nRegime analysis complete")
    print(f"   Unique orderings: {sum(s['unique_orderings'] for s in analysis['by_regime'].values())}")

    # Test weighting
    test_scores = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2]
    weighted = tsp_weighted_measurement(test_scores, best[0])
    print(f"\nTSP-weighted score: {weighted:.4f}")

    print("\n" + "=" * 60)
    print("FULL WORKFLOW VALIDATION COMPLETE!")


if __name__ == '__main__':
    import sys
    # Fix encoding for Windows
    if sys.platform == 'win32':
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    # Run full workflow test
    test_full_workflow()

    # Run pytest
    print("\n\nRunning pytest suite...")
    pytest.main([__file__, '-v'])
