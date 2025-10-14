"""
Unit tests for Three-Regime Test Planner.

Tests the 30/20/50 distribution pattern for backend contract QA organization.

Test Coverage:
- Regime allocation (30/20/50 split)
- Test classification (keyword-based)
- Confidence weighting (0.7/0.85/1.0)
- Overall confidence calculation
- Edge cases and boundary conditions
- Custom distributions

Author: GitHub Copilot
Date: October 3, 2025
"""

import pytest
from app.utils.three_regime_planner import (
    ThreeRegimeTestPlanner,
    TestRegime,
    RegimeAllocation,
    TestClassification,
    quick_allocate,
    quick_classify
)


class TestRegimeAllocation:
    """Test suite for regime allocation functionality."""
    
    def test_allocate_100_tests_default_distribution(self):
        """Test allocation of 100 tests with default 30/20/50 distribution."""
        planner = ThreeRegimeTestPlanner()
        allocation = planner.allocate_test_effort(100)
        
        assert allocation.exploration == 30
        assert allocation.optimization == 20
        assert allocation.stabilization == 50
        assert allocation.total == 100
    
    def test_allocate_75_tests_handles_rounding(self):
        """Test allocation handles rounding errors correctly."""
        planner = ThreeRegimeTestPlanner()
        allocation = planner.allocate_test_effort(75)
        
        # 30% of 75 = 22.5 → 22
        # 20% of 75 = 15.0 → 15
        # 50% of 75 = 37.5 → 37
        # Total = 74, need to add 1 to stabilization
        assert allocation.exploration == 22
        assert allocation.optimization == 15
        assert allocation.stabilization == 38  # Gets the extra 1
        assert allocation.total == 75
    
    def test_allocate_10_tests_small_scale(self):
        """Test allocation with small test count."""
        planner = ThreeRegimeTestPlanner()
        allocation = planner.allocate_test_effort(10)
        
        assert allocation.exploration == 3   # 30%
        assert allocation.optimization == 2   # 20%
        assert allocation.stabilization == 5  # 50%
        assert allocation.total == 10
    
    def test_allocate_1000_tests_large_scale(self):
        """Test allocation with large test count."""
        planner = ThreeRegimeTestPlanner()
        allocation = planner.allocate_test_effort(1000)
        
        assert allocation.exploration == 300
        assert allocation.optimization == 200
        assert allocation.stabilization == 500
        assert allocation.total == 1000
    
    def test_allocate_single_test(self):
        """Test allocation with single test (edge case)."""
        planner = ThreeRegimeTestPlanner()
        allocation = planner.allocate_test_effort(1)
        
        # All three regimes get 0 due to rounding, remainder goes to stabilization
        assert allocation.exploration == 0
        assert allocation.optimization == 0
        assert allocation.stabilization == 1
        assert allocation.total == 1
    
    def test_allocation_to_dict_conversion(self):
        """Test RegimeAllocation converts to dictionary correctly."""
        planner = ThreeRegimeTestPlanner()
        allocation = planner.allocate_test_effort(100)
        
        allocation_dict = allocation.to_dict()
        
        assert allocation_dict[TestRegime.EXPLORATION] == 30
        assert allocation_dict[TestRegime.OPTIMIZATION] == 20
        assert allocation_dict[TestRegime.STABILIZATION] == 50
    
    def test_custom_distribution(self):
        """Test planner with custom distribution."""
        custom_distribution = {
            TestRegime.EXPLORATION: 0.40,      # 40%
            TestRegime.OPTIMIZATION: 0.30,     # 30%
            TestRegime.STABILIZATION: 0.30     # 30%
        }
        
        planner = ThreeRegimeTestPlanner(regime_distribution=custom_distribution)
        allocation = planner.allocate_test_effort(100)
        
        assert allocation.exploration == 40
        assert allocation.optimization == 30
        assert allocation.stabilization == 30
        assert allocation.total == 100


class TestTestClassification:
    """Test suite for test classification functionality."""
    
    def test_classify_exploration_by_edge_case_tag(self):
        """Test classification as exploration based on edge_case tag."""
        planner = ThreeRegimeTestPlanner()
        classification = planner.classify_test(
            "test_arabic_passport_extraction",
            ["edge_case", "new"]
        )
        
        assert classification.regime == TestRegime.EXPLORATION
        assert classification.confidence_weight == 0.70
        assert "edge_case" in classification.tags
    
    def test_classify_exploration_by_name(self):
        """Test classification as exploration based on test name."""
        planner = ThreeRegimeTestPlanner()
        classification = planner.classify_test("test_corrupted_pdf_handling")
        
        assert classification.regime == TestRegime.EXPLORATION
        assert classification.confidence_weight == 0.70
    
    def test_classify_optimization_by_performance_tag(self):
        """Test classification as optimization based on performance tag."""
        planner = ThreeRegimeTestPlanner()
        classification = planner.classify_test(
            "test_batch_ocr_throughput",
            ["performance", "benchmark"]
        )
        
        assert classification.regime == TestRegime.OPTIMIZATION
        assert classification.confidence_weight == 0.85
    
    def test_classify_optimization_by_name(self):
        """Test classification as optimization based on test name."""
        planner = ThreeRegimeTestPlanner()
        classification = planner.classify_test("test_memory_optimization_batch_upload")
        
        assert classification.regime == TestRegime.OPTIMIZATION
        assert classification.confidence_weight == 0.85
    
    def test_classify_stabilization_by_regression_tag(self):
        """Test classification as stabilization based on regression tag."""
        planner = ThreeRegimeTestPlanner()
        classification = planner.classify_test(
            "test_passport_extraction_baseline",
            ["regression", "critical"]
        )
        
        assert classification.regime == TestRegime.STABILIZATION
        assert classification.confidence_weight == 1.00
    
    def test_classify_stabilization_by_name(self):
        """Test classification as stabilization based on test name."""
        planner = ThreeRegimeTestPlanner()
        classification = planner.classify_test("test_auth_endpoints_smoke")
        
        assert classification.regime == TestRegime.STABILIZATION
        assert classification.confidence_weight == 1.00
    
    def test_classify_defaults_to_stabilization(self):
        """Test classification defaults to stabilization when no keywords match."""
        planner = ThreeRegimeTestPlanner()
        # Use a name with no regime keywords
        classification = planner.classify_test("test_basic_calculation")
        
        # Should default to stabilization (safest choice)
        assert classification.regime == TestRegime.STABILIZATION
        assert classification.confidence_weight == 1.00
        assert "defaulting to stabilization" in classification.reasoning.lower()
    
    def test_classify_with_docstring(self):
        """Test classification considers docstring content."""
        planner = ThreeRegimeTestPlanner()
        classification = planner.classify_test(
            "test_document_upload",
            test_docstring="Performance benchmark for concurrent document uploads"
        )
        
        assert classification.regime == TestRegime.OPTIMIZATION
    
    def test_classification_repr(self):
        """Test TestClassification string representation."""
        planner = ThreeRegimeTestPlanner()
        classification = planner.classify_test("test_auth", ["critical"])
        
        repr_str = repr(classification)
        assert "test_auth" in repr_str
        assert classification.regime.value in repr_str
        assert str(classification.confidence_weight) in repr_str


class TestConfidenceWeighting:
    """Test suite for confidence weight calculation."""
    
    def test_exploration_confidence_weight(self):
        """Test exploration regime has 0.7 confidence weight."""
        planner = ThreeRegimeTestPlanner()
        weight = planner.calculate_confidence_weight(TestRegime.EXPLORATION)
        
        assert weight == 0.70
    
    def test_optimization_confidence_weight(self):
        """Test optimization regime has 0.85 confidence weight."""
        planner = ThreeRegimeTestPlanner()
        weight = planner.calculate_confidence_weight(TestRegime.OPTIMIZATION)
        
        assert weight == 0.85
    
    def test_stabilization_confidence_weight(self):
        """Test stabilization regime has 1.0 confidence weight."""
        planner = ThreeRegimeTestPlanner()
        weight = planner.calculate_confidence_weight(TestRegime.STABILIZATION)
        
        assert weight == 1.00
    
    def test_custom_confidence_weights(self):
        """Test planner with custom confidence weights."""
        custom_weights = {
            TestRegime.EXPLORATION: 0.60,
            TestRegime.OPTIMIZATION: 0.80,
            TestRegime.STABILIZATION: 1.00
        }
        
        planner = ThreeRegimeTestPlanner(confidence_weights=custom_weights)
        
        assert planner.calculate_confidence_weight(TestRegime.EXPLORATION) == 0.60
        assert planner.calculate_confidence_weight(TestRegime.OPTIMIZATION) == 0.80
        assert planner.calculate_confidence_weight(TestRegime.STABILIZATION) == 1.00


class TestOverallConfidence:
    """Test suite for overall confidence calculation."""
    
    def test_calculate_overall_confidence_all_passing(self):
        """Test overall confidence when all tests pass 100%."""
        planner = ThreeRegimeTestPlanner()
        
        results = {
            TestRegime.EXPLORATION: 1.0,      # 100% passing
            TestRegime.OPTIMIZATION: 1.0,     # 100% passing
            TestRegime.STABILIZATION: 1.0     # 100% passing
        }
        
        confidence = planner.calculate_overall_confidence(results)
        
        # Weighted: (1.0 × 0.7 × 0.3) + (1.0 × 0.85 × 0.2) + (1.0 × 1.0 × 0.5)
        # = 0.21 + 0.17 + 0.50 = 0.88
        assert 0.87 <= confidence <= 0.89
    
    def test_calculate_overall_confidence_realistic(self):
        """Test overall confidence with realistic pass rates."""
        planner = ThreeRegimeTestPlanner()
        
        results = {
            TestRegime.EXPLORATION: 0.70,      # 70% passing
            TestRegime.OPTIMIZATION: 0.85,     # 85% passing
            TestRegime.STABILIZATION: 0.95     # 95% passing
        }
        
        confidence = planner.calculate_overall_confidence(results)
        
        # Weighted: (0.7 × 0.7 × 0.3) + (0.85 × 0.85 × 0.2) + (0.95 × 1.0 × 0.5)
        # = 0.147 + 0.1445 + 0.475 = 0.7665
        assert 0.76 <= confidence <= 0.78
    
    def test_calculate_overall_confidence_stabilization_weighted_higher(self):
        """Test that stabilization tests have higher impact on overall confidence."""
        planner = ThreeRegimeTestPlanner()
        
        # Scenario 1: High stabilization pass rate
        results_high_stab = {
            TestRegime.EXPLORATION: 0.50,
            TestRegime.OPTIMIZATION: 0.50,
            TestRegime.STABILIZATION: 1.00
        }
        
        # Scenario 2: Low stabilization pass rate
        results_low_stab = {
            TestRegime.EXPLORATION: 1.00,
            TestRegime.OPTIMIZATION: 1.00,
            TestRegime.STABILIZATION: 0.50
        }
        
        confidence_high_stab = planner.calculate_overall_confidence(results_high_stab)
        confidence_low_stab = planner.calculate_overall_confidence(results_low_stab)
        
        # High stabilization should give higher overall confidence
        # due to 50% proportion and 1.0 weight
        assert confidence_high_stab > confidence_low_stab
    
    def test_calculate_overall_confidence_all_failing(self):
        """Test overall confidence when all tests fail."""
        planner = ThreeRegimeTestPlanner()
        
        results = {
            TestRegime.EXPLORATION: 0.0,
            TestRegime.OPTIMIZATION: 0.0,
            TestRegime.STABILIZATION: 0.0
        }
        
        confidence = planner.calculate_overall_confidence(results)
        
        assert confidence == 0.0


class TestRegimeSummary:
    """Test suite for regime summary functionality."""
    
    def test_get_regime_summary_structure(self):
        """Test regime summary contains all expected keys."""
        planner = ThreeRegimeTestPlanner()
        summary = planner.get_regime_summary()
        
        assert "distribution" in summary
        assert "confidence_weights" in summary
        assert "exploration_keywords_count" in summary
        assert "optimization_keywords_count" in summary
        assert "stabilization_keywords_count" in summary
    
    def test_get_regime_summary_values(self):
        """Test regime summary values are correct."""
        planner = ThreeRegimeTestPlanner()
        summary = planner.get_regime_summary()
        
        assert summary["distribution"]["exploration"] == 0.30
        assert summary["distribution"]["optimization"] == 0.20
        assert summary["distribution"]["stabilization"] == 0.50
        
        assert summary["confidence_weights"]["exploration"] == 0.70
        assert summary["confidence_weights"]["optimization"] == 0.85
        assert summary["confidence_weights"]["stabilization"] == 1.00
        
        assert summary["exploration_keywords_count"] > 0
        assert summary["optimization_keywords_count"] > 0
        assert summary["stabilization_keywords_count"] > 0


class TestConvenienceFunctions:
    """Test suite for convenience functions."""
    
    def test_quick_allocate(self):
        """Test quick_allocate convenience function."""
        allocation = quick_allocate(100)
        
        assert allocation["exploration"] == 30
        assert allocation["optimization"] == 20
        assert allocation["stabilization"] == 50
        assert allocation["total"] == 100
    
    def test_quick_classify_exploration(self):
        """Test quick_classify for exploration test."""
        regime = quick_classify("test_edge_case_arabic_passport")
        
        assert regime == "exploration"
    
    def test_quick_classify_optimization(self):
        """Test quick_classify for optimization test."""
        regime = quick_classify("test_performance_batch_upload")
        
        assert regime == "optimization"
    
    def test_quick_classify_stabilization(self):
        """Test quick_classify for stabilization test."""
        regime = quick_classify("test_auth_baseline", ["regression"])
        
        assert regime == "stabilization"


class TestKeywordMatching:
    """Test suite for keyword matching accuracy."""
    
    def test_exploration_keywords_comprehensive(self):
        """Test that exploration keywords cover edge cases."""
        planner = ThreeRegimeTestPlanner()
        
        exploration_tests = [
            "test_arabic_script_passport",
            "test_cjk_characters_diploma",
            "test_corrupted_pdf_upload",
            "test_malformed_json_response",
            "test_multi_page_contract",
            "test_fuzzing_api_endpoints"
        ]
        
        for test_name in exploration_tests:
            classification = planner.classify_test(test_name)
            assert classification.regime == TestRegime.EXPLORATION
    
    def test_optimization_keywords_comprehensive(self):
        """Test that optimization keywords cover performance tests."""
        planner = ThreeRegimeTestPlanner()
        
        optimization_tests = [
            "test_performance_ocr_batch",
            "test_memory_usage_under_load",
            "test_throughput_concurrent_uploads",
            "test_latency_api_response",
            "test_cache_efficiency",
            "test_parallel_processing_speed"
        ]
        
        for test_name in optimization_tests:
            classification = planner.classify_test(test_name)
            assert classification.regime == TestRegime.OPTIMIZATION
    
    def test_stabilization_keywords_comprehensive(self):
        """Test that stabilization keywords cover critical tests."""
        planner = ThreeRegimeTestPlanner()
        
        stabilization_tests = [
            "test_auth_endpoints_regression",
            "test_passport_extraction_baseline",
            "test_critical_path_permit_submission",
            "test_production_smoke_health_check",
            "test_core_validation_logic",
            "test_security_authentication_flow"
        ]
        
        for test_name in stabilization_tests:
            classification = planner.classify_test(test_name)
            assert classification.regime == TestRegime.STABILIZATION


class TestEdgeCases:
    """Test suite for edge cases and boundary conditions."""
    
    def test_empty_test_name(self):
        """Test classification with empty test name."""
        planner = ThreeRegimeTestPlanner()
        classification = planner.classify_test("")
        
        # Should default to stabilization
        assert classification.regime == TestRegime.STABILIZATION
    
    def test_test_with_multiple_regime_keywords(self):
        """Test classification when test matches multiple regimes."""
        planner = ThreeRegimeTestPlanner()
        
        # This test name has both exploration and optimization keywords
        classification = planner.classify_test(
            "test_performance_edge_case_arabic_passport"
        )
        
        # Should pick regime with most keyword matches
        # "edge_case" and "arabic" = 2 exploration keywords
        # "performance" = 1 optimization keyword
        assert classification.regime == TestRegime.EXPLORATION
    
    def test_zero_tests_allocation(self):
        """Test allocation with zero tests."""
        planner = ThreeRegimeTestPlanner()
        allocation = planner.allocate_test_effort(0)
        
        assert allocation.exploration == 0
        assert allocation.optimization == 0
        assert allocation.stabilization == 0
        assert allocation.total == 0


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
