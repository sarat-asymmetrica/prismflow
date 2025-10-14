"""
Asymmetrica Protocol Compliance Checker - Pre-Commit Hook Wrapper

Validates code against Asymmetrica Protocol standards:
- @complexity annotations (required for all functions/classes)
- @performance targets (required with measurable metrics)
- @validation levels (α₀/α₁/α₂ classification)
- Empirical evidence backing (references to benchmarks/tests)

@complexity O(n) where n = files to check
@performance Target: <10s for full codebase scan
@validation α₀ - Production-ready
"""

import sys
import argparse
from pathlib import Path

# Import the compliance checker from research-track-tests
sys.path.insert(0, str(Path(__file__).parent.parent / "research-track-tests" / "quality-gates"))

try:
    from asymmetrica_compliance import AsymmetricaComplianceChecker, ComplianceResult
except ImportError:
    print("ERROR: Could not import asymmetrica_compliance module")
    print("Ensure research-track-tests/quality-gates/asymmetrica_compliance.py exists")
    sys.exit(1)


def check_validation_levels(base_path: Path) -> bool:
    """
    Check that all production Python files have @validation annotations

    @complexity O(n) where n = files
    @performance <5s for 100 files
    """
    checker = AsymmetricaComplianceChecker()
    results = checker.scan_codebase(base_path)

    # Count files with validation levels
    total = len(results)
    if total == 0:
        return True  # No files to check

    with_validation = sum(1 for r in results.values() if r.has_validation)
    missing_validation = total - with_validation

    print(f"\n=== Validation Level Check ===")
    print(f"Files scanned: {total}")
    print(f"With @validation: {with_validation} ({with_validation/total*100:.1f}%)")
    print(f"Missing @validation: {missing_validation}")

    if missing_validation > 0:
        print("\n[FAIL] Some files missing @validation annotations")
        print("\nFiles missing @validation:")
        for filepath, result in results.items():
            if not result.has_validation:
                print(f"  - {filepath}")
        return False

    print("[PASS] All files have @validation annotations")
    return True


def check_performance_targets(base_path: Path) -> bool:
    """
    Check that all production Python files have @performance annotations

    @complexity O(n) where n = files
    @performance <5s for 100 files
    """
    checker = AsymmetricaComplianceChecker()
    results = checker.scan_codebase(base_path)

    total = len(results)
    if total == 0:
        return True

    with_performance = sum(1 for r in results.values() if r.has_performance)
    missing_performance = total - with_performance

    print(f"\n=== Performance Target Check ===")
    print(f"Files scanned: {total}")
    print(f"With @performance: {with_performance} ({with_performance/total*100:.1f}%)")
    print(f"Missing @performance: {missing_performance}")

    if missing_performance > 0:
        print("\n[FAIL] Some files missing @performance annotations")
        print("\nFiles missing @performance:")
        for filepath, result in results.items():
            if not result.has_performance:
                print(f"  - {filepath}")
        return False

    print("[PASS] All files have @performance targets")
    return True


def check_complexity_annotations(base_path: Path) -> bool:
    """
    Check that all production Python files have @complexity annotations

    @complexity O(n) where n = files
    @performance <5s for 100 files
    """
    checker = AsymmetricaComplianceChecker()
    results = checker.scan_codebase(base_path)

    total = len(results)
    if total == 0:
        return True

    with_complexity = sum(1 for r in results.values() if r.has_complexity)
    missing_complexity = total - with_complexity

    print(f"\n=== Complexity Annotation Check ===")
    print(f"Files scanned: {total}")
    print(f"With @complexity: {with_complexity} ({with_complexity/total*100:.1f}%)")
    print(f"Missing @complexity: {missing_complexity}")

    if missing_complexity > 0:
        print("\n[FAIL] Some files missing @complexity annotations")
        print("\nFiles missing @complexity:")
        for filepath, result in results.items():
            if not result.has_complexity:
                print(f"  - {filepath}")
        return False

    print("[PASS] All files have @complexity annotations")
    return True


def check_full_compliance(base_path: Path, min_compliance: float = 80.0) -> bool:
    """
    Run full compliance check with configurable threshold

    @complexity O(n) where n = files
    @performance <10s for full codebase
    """
    checker = AsymmetricaComplianceChecker()
    results = checker.scan_codebase(base_path)

    total = len(results)
    if total == 0:
        print("[WARNING] No Python files found to check")
        return True

    compliant = sum(
        1 for r in results.values()
        if r.has_complexity and r.has_performance and r.has_validation
    )

    compliance_rate = (compliant / total) * 100

    print(f"\n=== Full Asymmetrica Protocol Compliance ===")
    print(f"Files scanned: {total}")
    print(f"Fully compliant: {compliant} ({compliance_rate:.1f}%)")
    print(f"Threshold: {min_compliance}%")

    # Show validation level distribution
    validation_levels = {"α₀": 0, "α₁": 0, "α₂": 0, "missing": 0}
    for result in results.values():
        if result.validation_level in validation_levels:
            validation_levels[result.validation_level] += 1
        else:
            validation_levels["missing"] += 1

    print(f"\nValidation Level Distribution:")
    print(f"  alpha-0 (Production-ready): {validation_levels['α₀']}")
    print(f"  alpha-1 (Needs review): {validation_levels['α₁']}")
    print(f"  alpha-2 (Experimental): {validation_levels['α₂']}")
    print(f"  Missing: {validation_levels['missing']}")

    if compliance_rate >= min_compliance:
        print(f"\n[PASS] {compliance_rate:.1f}% compliance (>= {min_compliance}%)")
        return True
    else:
        print(f"\n[FAIL] {compliance_rate:.1f}% compliance (< {min_compliance}%)")

        # Show non-compliant files
        print("\nNon-compliant files:")
        for filepath, result in results.items():
            if not (result.has_complexity and result.has_performance and result.has_validation):
                missing = []
                if not result.has_complexity:
                    missing.append("@complexity")
                if not result.has_performance:
                    missing.append("@performance")
                if not result.has_validation:
                    missing.append("@validation")
                print(f"  - {filepath}: Missing {', '.join(missing)}")

        return False


def main():
    """Main entry point for pre-commit hook"""
    parser = argparse.ArgumentParser(
        description="Asymmetrica Protocol Compliance Checker"
    )
    parser.add_argument(
        "--check-validation",
        action="store_true",
        help="Check only @validation annotations"
    )
    parser.add_argument(
        "--check-performance",
        action="store_true",
        help="Check only @performance annotations"
    )
    parser.add_argument(
        "--check-complexity",
        action="store_true",
        help="Check only @complexity annotations"
    )
    parser.add_argument(
        "--min-compliance",
        type=float,
        default=80.0,
        help="Minimum compliance percentage (default: 80%%)"
    )
    parser.add_argument(
        "--path",
        type=str,
        default=".",
        help="Path to scan (default: current directory)"
    )

    args = parser.parse_args()

    base_path = Path(args.path).resolve()

    print(f"Scanning: {base_path}")

    # Run specific check if requested
    if args.check_validation:
        success = check_validation_levels(base_path)
    elif args.check_performance:
        success = check_performance_targets(base_path)
    elif args.check_complexity:
        success = check_complexity_annotations(base_path)
    else:
        # Full compliance check
        success = check_full_compliance(base_path, args.min_compliance)

    # Exit with appropriate code
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
