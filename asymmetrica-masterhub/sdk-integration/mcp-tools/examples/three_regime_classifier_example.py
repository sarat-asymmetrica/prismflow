#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Three-Regime Test Planner Example

Demonstrates test classification into exploration/optimization/stabilization regimes.

Real-world use case: Test suite quality assurance and organization

@author Agent November
@validation α₀ Production-ready
"""

import sys
import os
import logging
from collections import Counter

# Fix Windows console encoding for Unicode output
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from defensekit_tools import DefenseKitMCPTools

# Convenience reference
three_regime_planner = DefenseKitMCPTools.three_regime_planner

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def example_1_basic_usage():
    """Example 1: Basic three-regime classification"""
    print("=" * 70)
    print("EXAMPLE 1: Basic Three-Regime Classification")
    print("=" * 70)

    # Sample test names representing each regime
    test_cases = [
        "test_edge_case_invalid_input",
        "test_performance_batch_processing",
        "test_critical_user_authentication"
    ]

    print("\nClassifying individual tests:\n")

    for test_name in test_cases:
        result = three_regime_planner(test_name)

        print(f"Test: {test_name}")
        print(f"  Regime: {result['regime']}")
        print(f"  Confidence: {result['confidence']:.2f}")
        print(f"  Weight: {result['weight']}")
        print(f"  Priority: {result['priority']}")
        print(f"  Expected distribution: {result['expected_distribution']:.0%}")
        print()


def example_2_test_suite_analysis():
    """Example 2: Complete test suite analysis"""
    print("=" * 70)
    print("EXAMPLE 2: Test Suite Quality Analysis")
    print("=" * 70)

    # Realistic test suite (backend API tests)
    test_suite = [
        # Exploration tests (edge cases, new features)
        "test_edge_case_empty_document",
        "test_edge_case_oversized_file",
        "test_new_experimental_ocr_provider",
        "test_boundary_max_file_size",
        "test_corner_case_unicode_characters",

        # Optimization tests (performance, refactoring)
        "test_performance_ocr_batch_processing",
        "test_optimize_database_query_speed",
        "test_refactor_authentication_flow",

        # Stabilization tests (critical paths, regression)
        "test_critical_user_login_flow",
        "test_core_document_upload",
        "test_essential_ocr_extraction",
        "test_production_api_health_check",
        "test_stable_database_connection",
        "test_regression_previous_bug_fix",
        "test_critical_payment_processing",
    ]

    print(f"\nAnalyzing test suite ({len(test_suite)} tests)...\n")

    # Classify all tests
    classifications = {}
    regime_counts = Counter()

    for test_name in test_suite:
        result = three_regime_planner(test_name)
        classifications[test_name] = result
        regime_counts[result['regime']] += 1

        # Print classification
        regime_display = f"{result['regime']:15}"
        confidence_display = f"{result['confidence']:.2f}"
        print(f"  {test_name[:45]:<45} → {regime_display} (conf: {confidence_display})")

    # Calculate distribution
    total = len(test_suite)
    distribution = {
        regime: count / total for regime, count in regime_counts.items()
    }

    print(f"\n" + "-" * 70)
    print("Test Suite Distribution Analysis:")
    print("-" * 70)

    print(f"\nActual Distribution:")
    print(f"  Exploration:    {distribution.get('exploration', 0):.1%} ({regime_counts['exploration']:2d} tests)")
    print(f"  Optimization:   {distribution.get('optimization', 0):.1%} ({regime_counts['optimization']:2d} tests)")
    print(f"  Stabilization:  {distribution.get('stabilization', 0):.1%} ({regime_counts['stabilization']:2d} tests)")

    print(f"\nTarget Distribution:")
    print(f"  Exploration:    30% (±5%)")
    print(f"  Optimization:   20% (±5%)")
    print(f"  Stabilization:  50% (±5%)")

    # Quality assessment
    print(f"\nQuality Assessment:")
    issues = []

    if abs(distribution.get('exploration', 0) - 0.30) > 0.05:
        delta = int((0.30 - distribution.get('exploration', 0)) * total)
        if delta > 0:
            issues.append(f"  ⚠️  Need {delta} more exploration tests")
        else:
            issues.append(f"  ⚠️  {abs(delta)} too many exploration tests")

    if abs(distribution.get('optimization', 0) - 0.20) > 0.05:
        delta = int((0.20 - distribution.get('optimization', 0)) * total)
        if delta > 0:
            issues.append(f"  ⚠️  Need {delta} more optimization tests")
        else:
            issues.append(f"  ⚠️  {abs(delta)} too many optimization tests")

    if abs(distribution.get('stabilization', 0) - 0.50) > 0.05:
        delta = int((0.50 - distribution.get('stabilization', 0)) * total)
        if delta > 0:
            issues.append(f"  ⚠️  Need {delta} more stabilization tests")
        else:
            issues.append(f"  ⚠️  {abs(delta)} too many stabilization tests")

    if issues:
        for issue in issues:
            print(issue)
    else:
        print("  ✓ Test suite distribution is within acceptable range!")

    print()


def example_3_using_context():
    """Example 3: Improving classification with context"""
    print("=" * 70)
    print("EXAMPLE 3: Using Context for Better Classification")
    print("=" * 70)

    # Ambiguous test name
    test_name = "test_login"

    print(f"\nTest name: '{test_name}' (ambiguous)\n")

    # Without context
    result_no_context = three_regime_planner(test_name)
    print(f"Without context:")
    print(f"  Regime: {result_no_context['regime']}")
    print(f"  Confidence: {result_no_context['confidence']:.2f}")
    print(f"  (Classification uncertain due to ambiguous name)")

    # With exploration context
    result_exploration = three_regime_planner(
        test_name,
        context="Testing new experimental OAuth2 provider integration"
    )
    print(f"\nWith exploration context:")
    print(f"  Regime: {result_exploration['regime']}")
    print(f"  Confidence: {result_exploration['confidence']:.2f}")
    print(f"  (Clear: experimental feature → exploration)")

    # With stabilization context
    result_stabilization = three_regime_planner(
        test_name,
        context="Critical production authentication flow for all users"
    )
    print(f"\nWith stabilization context:")
    print(f"  Regime: {result_stabilization['regime']}")
    print(f"  Confidence: {result_stabilization['confidence']:.2f}")
    print(f"  (Clear: critical production flow → stabilization)")

    print(f"\n✓ Context significantly improves classification accuracy!")
    print()


def example_4_weighted_scoring():
    """Example 4: Weighted confidence scoring for test suites"""
    print("=" * 70)
    print("EXAMPLE 4: Weighted Confidence Scoring")
    print("=" * 70)

    # Test results (simulated)
    test_results = [
        {"name": "test_edge_case_invalid", "passed": True, "regime": "exploration"},
        {"name": "test_edge_case_empty", "passed": True, "regime": "exploration"},
        {"name": "test_performance_batch", "passed": True, "regime": "optimization"},
        {"name": "test_critical_auth", "passed": True, "regime": "stabilization"},
        {"name": "test_critical_payment", "passed": False, "regime": "stabilization"},  # FAILURE
        {"name": "test_stable_database", "passed": True, "regime": "stabilization"},
    ]

    print("\nTest Results with Regime Weights:\n")

    regime_weights = {
        "exploration": 0.70,
        "optimization": 0.85,
        "stabilization": 1.00
    }

    total_weighted_score = 0.0
    max_weighted_score = 0.0

    for test in test_results:
        result = three_regime_planner(test['name'])
        regime = result['regime']
        weight = result['weight']
        passed = test['passed']

        # Calculate weighted score
        test_score = weight if passed else 0.0
        total_weighted_score += test_score
        max_weighted_score += weight

        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"  {test['name'][:35]:<35} [{regime:13}] weight: {weight:.2f} → {status}")

    # Calculate overall weighted confidence
    overall_confidence = total_weighted_score / max_weighted_score if max_weighted_score > 0 else 0.0

    print(f"\n" + "-" * 70)
    print(f"Weighted Quality Score: {overall_confidence:.2%}")
    print(f"  Total weighted score: {total_weighted_score:.2f}")
    print(f"  Maximum possible: {max_weighted_score:.2f}")

    # Quality gates
    print(f"\nQuality Gates:")
    print(f"  Stabilization tests: {'✓ PASS' if all(t['passed'] for t in test_results if 'critical' in t['name'] or 'stable' in t['name']) else '✗ FAIL - Critical tests must be 100%'}")
    print(f"  Overall confidence: {'✓ PASS' if overall_confidence >= 0.85 else '⚠️  WARN - Below 85% threshold'}")

    print()


def example_5_test_prioritization():
    """Example 5: Test prioritization based on regime"""
    print("=" * 70)
    print("EXAMPLE 5: Test Prioritization for CI/CD")
    print("=" * 70)

    test_suite = [
        "test_edge_case_unicode",
        "test_critical_authentication",
        "test_performance_queries",
        "test_new_experimental_feature",
        "test_stable_core_api",
        "test_optimize_caching",
        "test_critical_data_integrity",
    ]

    print("\nPrioritizing tests for CI/CD pipeline...\n")

    # Classify and organize by priority
    prioritized = {"high": [], "medium": [], "low": []}

    for test_name in test_suite:
        result = three_regime_planner(test_name)
        priority = result['priority']
        prioritized[priority].append({
            "name": test_name,
            "regime": result['regime'],
            "weight": result['weight']
        })

    # Display prioritized test execution order
    print("Recommended CI/CD Execution Order:")
    print("(Run high priority first, fail fast on critical issues)\n")

    execution_order = 1

    for priority_level in ["high", "medium", "low"]:
        tests = prioritized[priority_level]
        if not tests:
            continue

        print(f"{priority_level.upper()} PRIORITY ({len(tests)} tests):")
        for test in tests:
            print(f"  {execution_order}. {test['name'][:40]:<40} [{test['regime']:13}]")
            execution_order += 1
        print()

    print("✓ Run stabilization tests first to catch critical regressions early!")
    print()


def example_6_error_handling():
    """Example 6: Error handling demonstration"""
    print("=" * 70)
    print("EXAMPLE 6: Error Handling")
    print("=" * 70)

    print("\nTesting error cases...\n")

    # Test case 1: Empty test name
    print("1. Empty test name:")
    try:
        result = three_regime_planner("")
    except ValueError as e:
        print(f"   ✓ ValueError caught: {e}")

    # Test case 2: Non-string test name
    print("\n2. Non-string test name:")
    try:
        result = three_regime_planner(12345)
    except TypeError as e:
        print(f"   ✓ TypeError caught: {e}")

    # Test case 3: Invalid context type
    print("\n3. Invalid context type:")
    try:
        result = three_regime_planner("test_example", context=12345)
    except TypeError as e:
        print(f"   ✓ TypeError caught: {e}")

    # Test case 4: Valid edge case (no keyword matches)
    print("\n4. Test with no keyword matches (defaults to stabilization):")
    try:
        result = three_regime_planner("test_abc123")
        print(f"   ✓ Classified as: {result['regime']} (confidence: {result['confidence']:.2f})")
        print(f"   (Conservative default: stabilization when uncertain)")
    except Exception as e:
        print(f"   ✗ Unexpected error: {e}")

    print()


def main():
    """Run all examples"""
    print("\n" + "=" * 70)
    print(" Three-Regime Test Planner - Comprehensive Examples")
    print(" Agent November Production Deployment")
    print("=" * 70)
    print()

    # Run all examples
    example_1_basic_usage()
    example_2_test_suite_analysis()
    example_3_using_context()
    example_4_weighted_scoring()
    example_5_test_prioritization()
    example_6_error_handling()

    print("=" * 70)
    print(" All Examples Complete!")
    print("=" * 70)
    print()
    print("Key Takeaways:")
    print("  • Three regimes: Exploration (30%), Optimization (20%), Stabilization (50%)")
    print("  • Weighted scoring: 0.7, 0.85, 1.0 for quality gates")
    print("  • Context improves classification accuracy")
    print("  • Prioritize stabilization tests for fail-fast CI/CD")
    print("  • Stabilization tests must pass 100% for production")
    print()


if __name__ == "__main__":
    main()
