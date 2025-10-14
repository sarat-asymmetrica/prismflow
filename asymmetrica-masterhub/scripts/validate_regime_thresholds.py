"""
Three-Regime Threshold Validator

Validates that test results meet Asymmetrica Protocol regime thresholds:
- Exploration: 70% pass rate (30% distribution target)
- Optimization: 85% pass rate (20% distribution target)
- Stabilization: 100% pass rate (50% distribution target)

@complexity O(1) - reads single JSON file
@performance <100ms
@validation alpha-0 - Production-ready
"""

import json
import sys
from pathlib import Path


def validate_regime_thresholds(report_path: Path) -> bool:
    """
    Validate regime test results against thresholds

    Returns:
        True if all thresholds met, False otherwise
    """
    if not report_path.exists():
        print(f"ERROR: Regime report not found at {report_path}")
        return False

    with open(report_path) as f:
        report = json.load(f)

    print("\n=== Three-Regime Threshold Validation ===\n")

    regimes = report.get("regimes", {})
    all_passed = True

    # Define thresholds
    thresholds = {
        "exploration": 0.70,
        "optimization": 0.85,
        "stabilization": 1.00
    }

    for regime, threshold in thresholds.items():
        if regime not in regimes:
            print(f"[SKIP] {regime.capitalize()}: No tests found")
            continue

        regime_data = regimes[regime]
        pass_rate = regime_data.get("pass_rate", 0)
        total = regime_data.get("total", 0)
        passed = regime_data.get("passed", 0)
        failed = regime_data.get("failed", 0)

        status = "[PASS]" if pass_rate >= threshold else "[FAIL]"

        print(f"{status} {regime.capitalize()} Regime:")
        print(f"  Pass Rate: {pass_rate*100:.1f}% (threshold: {threshold*100:.1f}%)")
        print(f"  Tests: {total} (Passed: {passed}, Failed: {failed})")

        if pass_rate < threshold:
            all_passed = False
            print(f"  ERROR: Below threshold by {(threshold - pass_rate)*100:.1f}%")

        print()

    # Check weighted confidence
    confidence = report.get("weighted_confidence", 0)
    print(f"Weighted Confidence: {confidence:.2f}%")
    print()

    if all_passed:
        print("[PASS] All regime thresholds met")
        return True
    else:
        print("[FAIL] Some regimes below threshold")
        return False


def main():
    """Main entry point"""
    report_path = Path("test_logs/regime_report.json")

    success = validate_regime_thresholds(report_path)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
