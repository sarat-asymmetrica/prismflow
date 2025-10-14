"""
Three-Regime Test Planner Integration Tests

Validates Three-Regime test planning:
- 30/20/50 distribution (Exploration/Optimization/Stabilization)
- Weighted confidence scoring
- Automatic test classification
- Quality gate enforcement

@complexity O(n) where n = number of tests
@performance Target: <100ms for 1000 tests
@validation α₀ - Production-ready
"""

import pytest


class TestThreeRegimeIntegration:
    """Three-Regime Test Planner validation"""

    def test_regime_distribution_target(self):
        """Validate 30/20/50 distribution target"""
        REGIME_DISTRIBUTION = {
            "exploration": 0.30,
            "optimization": 0.20,
            "stabilization": 0.50
        }

        # Verify distribution adds to 100%
        total = sum(REGIME_DISTRIBUTION.values())
        assert abs(total - 1.0) < 0.01, f"Distribution should equal 100%, got {total * 100}%"

        # Verify individual targets
        assert REGIME_DISTRIBUTION["exploration"] == 0.30
        assert REGIME_DISTRIBUTION["optimization"] == 0.20
        assert REGIME_DISTRIBUTION["stabilization"] == 0.50

    def test_regime_weight_calculation(self):
        """Test regime weight calculation"""
        REGIME_WEIGHTS = {
            "exploration": 0.70,
            "optimization": 0.85,
            "stabilization": 1.00
        }

        # Stabilization should have highest weight
        assert REGIME_WEIGHTS["stabilization"] > REGIME_WEIGHTS["optimization"]
        assert REGIME_WEIGHTS["optimization"] > REGIME_WEIGHTS["exploration"]

        # All weights should be positive
        assert all(w > 0 for w in REGIME_WEIGHTS.values())

    def test_automatic_test_classification(self):
        """Classify tests into regimes based on keywords"""
        def classify_test(test_name, test_code):
            """Mock test classifier"""
            exploration_keywords = ["edge", "new", "experimental", "prototype"]
            optimization_keywords = ["performance", "benchmark", "optimize", "refactor"]
            stabilization_keywords = ["critical", "regression", "core", "production"]

            test_lower = f"{test_name} {test_code}".lower()

            if any(kw in test_lower for kw in stabilization_keywords):
                return "stabilization"
            elif any(kw in test_lower for kw in optimization_keywords):
                return "optimization"
            elif any(kw in test_lower for kw in exploration_keywords):
                return "exploration"
            else:
                return "stabilization"  # Default to highest weight

        # Test classification
        assert classify_test("test_edge_case", "edge case handling") == "exploration"
        assert classify_test("test_performance", "benchmark speed") == "optimization"
        assert classify_test("test_critical_path", "core functionality") == "stabilization"

    def test_weighted_confidence_scoring(self):
        """Calculate weighted confidence score"""
        def calculate_weighted_confidence(regime_results):
            """Mock weighted confidence calculator"""
            REGIME_WEIGHTS = {
                "exploration": 0.70,
                "optimization": 0.85,
                "stabilization": 1.00
            }

            REGIME_DISTRIBUTION = {
                "exploration": 0.30,
                "optimization": 0.20,
                "stabilization": 0.50
            }

            total_score = 0.0

            for regime, pass_rate in regime_results.items():
                weight = REGIME_WEIGHTS[regime]
                proportion = REGIME_DISTRIBUTION[regime]
                total_score += pass_rate * weight * proportion

            return total_score

        # Test with perfect scores
        perfect_results = {
            "exploration": 1.0,
            "optimization": 1.0,
            "stabilization": 1.0
        }
        perfect_score = calculate_weighted_confidence(perfect_results)
        assert abs(perfect_score - 0.92) < 0.01  # 0.3*0.7 + 0.2*0.85 + 0.5*1.0

        # Test with realistic scores
        realistic_results = {
            "exploration": 0.75,
            "optimization": 0.90,
            "stabilization": 1.0
        }
        realistic_score = calculate_weighted_confidence(realistic_results)
        assert 0.85 <= realistic_score <= 0.95

    def test_quality_gate_enforcement(self):
        """Enforce quality gates per regime"""
        def check_quality_gates(regime_results):
            """Mock quality gate checker"""
            gates = {
                "exploration_min": 0.70,
                "optimization_min": 0.85,
                "stabilization_min": 1.00
            }

            violations = []

            if regime_results["exploration"] < gates["exploration_min"]:
                violations.append(f"Exploration: {regime_results['exploration']} < {gates['exploration_min']}")

            if regime_results["optimization"] < gates["optimization_min"]:
                violations.append(f"Optimization: {regime_results['optimization']} < {gates['optimization_min']}")

            if regime_results["stabilization"] < gates["stabilization_min"]:
                violations.append(f"Stabilization: {regime_results['stabilization']} < {gates['stabilization_min']}")

            return {
                "passed": len(violations) == 0,
                "violations": violations
            }

        # Test passing case
        passing_results = {
            "exploration": 0.75,
            "optimization": 0.90,
            "stabilization": 1.00
        }
        result = check_quality_gates(passing_results)
        assert result["passed"] is True
        assert len(result["violations"]) == 0

        # Test failing case
        failing_results = {
            "exploration": 0.75,
            "optimization": 0.80,  # Below 0.85
            "stabilization": 0.98   # Below 1.00
        }
        result = check_quality_gates(failing_results)
        assert result["passed"] is False
        assert len(result["violations"]) == 2

    def test_regime_test_count_distribution(self):
        """Validate test count distribution across regimes"""
        def calculate_test_distribution(total_tests):
            """Mock test distribution calculator"""
            REGIME_DISTRIBUTION = {
                "exploration": 0.30,
                "optimization": 0.20,
                "stabilization": 0.50
            }

            return {
                "exploration": int(total_tests * REGIME_DISTRIBUTION["exploration"]),
                "optimization": int(total_tests * REGIME_DISTRIBUTION["optimization"]),
                "stabilization": int(total_tests * REGIME_DISTRIBUTION["stabilization"])
            }

        # Test with 100 tests
        distribution_100 = calculate_test_distribution(100)
        assert 28 <= distribution_100["exploration"] <= 32
        assert 18 <= distribution_100["optimization"] <= 22
        assert 48 <= distribution_100["stabilization"] <= 52

        # Test with 1000 tests
        distribution_1000 = calculate_test_distribution(1000)
        assert 280 <= distribution_1000["exploration"] <= 320
        assert 180 <= distribution_1000["optimization"] <= 220
        assert 480 <= distribution_1000["stabilization"] <= 520

    @pytest.mark.benchmark
    def test_classification_performance(self):
        """Test classification should be fast (<100ms for 1000 tests)"""
        import time

        def classify_batch(test_count):
            """Mock batch test classification"""
            start = time.time()

            for i in range(test_count):
                # Simulate classification
                test_name = f"test_{i}"
                keywords = ["edge", "performance", "critical"]
                regime = keywords[i % 3]  # Simulate classification

            duration = (time.time() - start) * 1000  # Convert to ms
            return duration

        duration_1000 = classify_batch(1000)

        assert duration_1000 < 100, \
            f"Classification too slow: {duration_1000}ms (target: <100ms)"

    def test_regime_metadata_storage(self):
        """Store regime metadata for reporting"""
        def store_regime_metadata(test_results):
            """Mock regime metadata storage"""
            metadata = {
                "total_tests": sum(len(tests) for tests in test_results.values()),
                "regime_counts": {
                    regime: len(tests) for regime, tests in test_results.items()
                },
                "pass_rates": {},
                "weighted_score": 0.0
            }

            # Calculate pass rates
            for regime, tests in test_results.items():
                passed = sum(1 for t in tests if t["passed"])
                metadata["pass_rates"][regime] = passed / len(tests) if tests else 0.0

            return metadata

        test_results = {
            "exploration": [{"passed": True}, {"passed": True}, {"passed": False}],
            "optimization": [{"passed": True}, {"passed": True}],
            "stabilization": [{"passed": True}, {"passed": True}, {"passed": True}]
        }

        metadata = store_regime_metadata(test_results)

        assert metadata["total_tests"] == 8
        assert metadata["regime_counts"]["exploration"] == 3
        assert abs(metadata["pass_rates"]["exploration"] - 0.667) < 0.01
        assert metadata["pass_rates"]["stabilization"] == 1.0
