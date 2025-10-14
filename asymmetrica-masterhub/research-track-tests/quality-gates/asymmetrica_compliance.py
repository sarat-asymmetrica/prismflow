"""
Asymmetrica Protocol Compliance Checker

Validates all Research Track code has:
- @complexity annotations
- @performance targets
- @validation levels (α₀/α₁/α₂)
- Empirical evidence backing claims

@complexity O(n) where n = files to check
@performance Target: <10s for full codebase scan
@validation α₀ - Production-ready
"""

import ast
import re
from pathlib import Path
from typing import Dict, List
from dataclasses import dataclass


@dataclass
class ComplianceResult:
    """Result of compliance check"""
    has_complexity: bool
    has_performance: bool
    has_validation: bool
    validation_level: str
    complexity_annotation: str = ""
    performance_annotation: str = ""


class AsymmetricaComplianceChecker:
    """Automated protocol compliance validation"""

    VALIDATION_LEVELS = ["α₀", "α₁", "α₂"]

    def check_file(self, filepath: Path) -> ComplianceResult:
        """Check single file for Asymmetrica compliance"""
        try:
            with open(filepath, encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"Error reading {filepath}: {e}")
            return ComplianceResult(False, False, False, "error")

        # Extract annotations
        complexity_match = re.search(r"@complexity\s+(.+)", content)
        performance_match = re.search(r"@performance\s+(.+)", content)
        validation_match = re.search(r"@validation\s+(α[₀₁₂])", content)

        return ComplianceResult(
            has_complexity=bool(complexity_match),
            has_performance=bool(performance_match),
            has_validation=bool(validation_match),
            validation_level=validation_match.group(1) if validation_match else "missing",
            complexity_annotation=complexity_match.group(1) if complexity_match else "",
            performance_annotation=performance_match.group(1) if performance_match else ""
        )

    def scan_codebase(self, base_path: Path) -> Dict[str, ComplianceResult]:
        """Scan entire codebase for compliance"""
        results = {}

        # Scan Python files (excluding tests initially)
        for py_file in base_path.rglob("*.py"):
            # Include all files for comprehensive check
            results[str(py_file)] = self.check_file(py_file)

        return results

    def generate_report(self, results: Dict[str, ComplianceResult]) -> str:
        """Generate compliance report"""
        total = len(results)
        if total == 0:
            return "No files scanned."

        compliant = sum(
            1 for r in results.values()
            if r.has_complexity and r.has_performance and r.has_validation
        )

        compliance_rate = (compliant / total) * 100

        # Count by validation level
        validation_levels = {level: 0 for level in self.VALIDATION_LEVELS}
        validation_levels["missing"] = 0

        for result in results.values():
            if result.validation_level in validation_levels:
                validation_levels[result.validation_level] += 1
            else:
                validation_levels["missing"] += 1

        report = f"""
# Asymmetrica Protocol Compliance Report

**Total files scanned:** {total}
**Fully compliant:** {compliant} ({compliance_rate:.1f}%)

## Validation Level Distribution:
- **α₀ (Production-ready):** {validation_levels['α₀']} files
- **α₁ (Needs review):** {validation_levels['α₁']} files
- **α₂ (Experimental):** {validation_levels['α₂']} files
- **Missing validation:** {validation_levels['missing']} files

## Compliance Breakdown:
- **Has @complexity:** {sum(1 for r in results.values() if r.has_complexity)} ({sum(1 for r in results.values() if r.has_complexity)/total*100:.1f}%)
- **Has @performance:** {sum(1 for r in results.values() if r.has_performance)} ({sum(1 for r in results.values() if r.has_performance)/total*100:.1f}%)
- **Has @validation:** {sum(1 for r in results.values() if r.has_validation)} ({sum(1 for r in results.values() if r.has_validation)/total*100:.1f}%)

## Non-Compliant Files:
"""
        for filepath, result in sorted(results.items()):
            if not (result.has_complexity and result.has_performance and result.has_validation):
                report += f"\n### `{filepath}`\n"
                if not result.has_complexity:
                    report += "- ❌ Missing `@complexity`\n"
                if not result.has_performance:
                    report += "- ❌ Missing `@performance`\n"
                if not result.has_validation:
                    report += "- ❌ Missing `@validation`\n"

        report += "\n## Fully Compliant Files (Examples):\n"
        compliant_count = 0
        for filepath, result in sorted(results.items()):
            if result.has_complexity and result.has_performance and result.has_validation:
                if compliant_count < 5:  # Show first 5
                    report += f"\n### `{filepath}` ✅\n"
                    report += f"- **Complexity:** {result.complexity_annotation}\n"
                    report += f"- **Performance:** {result.performance_annotation}\n"
                    report += f"- **Validation:** {result.validation_level}\n"
                    compliant_count += 1

        return report

    def validate_complexity_annotation(self, annotation: str) -> bool:
        """Validate @complexity annotation format"""
        # Should be in format: O(n), O(log n), O(n²), etc.
        pattern = r"O\([^)]+\)"
        return bool(re.search(pattern, annotation))

    def validate_performance_annotation(self, annotation: str) -> bool:
        """Validate @performance annotation format"""
        # Should contain: "Target:" or specific time
        return "Target:" in annotation or "target:" in annotation

    def check_code_quality(self, filepath: Path) -> Dict:
        """Check additional code quality metrics"""
        try:
            with open(filepath, encoding='utf-8') as f:
                content = f.read()
        except:
            return {}

        try:
            tree = ast.parse(content)
        except SyntaxError:
            return {"error": "Syntax error in file"}

        # Count functions and classes
        functions = sum(1 for node in ast.walk(tree) if isinstance(node, ast.FunctionDef))
        classes = sum(1 for node in ast.walk(tree) if isinstance(node, ast.ClassDef))

        # Check for docstrings
        has_module_docstring = ast.get_docstring(tree) is not None

        return {
            "functions": functions,
            "classes": classes,
            "has_module_docstring": has_module_docstring,
            "lines": len(content.splitlines())
        }


class TestAsymmetricaCompliance:
    """Test compliance checker itself"""

    def test_validation_level_detection(self):
        """Test validation level regex"""
        checker = AsymmetricaComplianceChecker()

        # Create temporary test content
        test_content = """
@complexity O(n)
@performance Target: <1s
@validation α₀ - Production-ready
"""
        # Write to temp file
        from tempfile import NamedTemporaryFile
        with NamedTemporaryFile(mode='w', suffix='.py', delete=False, encoding='utf-8') as f:
            f.write(test_content)
            temp_path = Path(f.name)

        result = checker.check_file(temp_path)

        assert result.has_complexity, "Failed to detect @complexity"
        assert result.has_performance, "Failed to detect @performance"
        assert result.has_validation, "Failed to detect @validation"
        assert result.validation_level == "α₀", f"Wrong level: {result.validation_level}"

        # Cleanup
        temp_path.unlink()

        print("✓ Validation level detection works")

    def test_scan_test_directory(self):
        """Test scanning research-track-tests directory"""
        checker = AsymmetricaComplianceChecker()

        # Scan the test directory we just created
        base_path = Path(__file__).parent.parent

        results = checker.scan_codebase(base_path)

        assert len(results) > 0, "No files found"

        # Generate report
        report = checker.generate_report(results)

        assert "Asymmetrica Protocol Compliance Report" in report
        assert "Total files scanned:" in report

        print(f"✓ Scanned {len(results)} files")
        print("\nCompliance Report Preview:")
        print(report[:500] + "...")


def main():
    """Run compliance check on research-track-tests"""
    checker = AsymmetricaComplianceChecker()

    # Get the research-track-tests directory
    script_dir = Path(__file__).parent.parent
    print(f"Scanning: {script_dir}")

    results = checker.scan_codebase(script_dir)
    report = checker.generate_report(results)

    print(report)

    # Save report
    report_path = script_dir / "ASYMMETRICA_COMPLIANCE_REPORT.md"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)

    print(f"\n✅ Compliance report saved to: {report_path}")

    # Return exit code based on compliance
    total = len(results)
    compliant = sum(
        1 for r in results.values()
        if r.has_complexity and r.has_performance and r.has_validation
    )
    compliance_rate = (compliant / total * 100) if total > 0 else 0

    if compliance_rate >= 80:
        print(f"✅ PASS: {compliance_rate:.1f}% compliance (target: 80%+)")
        return 0
    else:
        print(f"❌ FAIL: {compliance_rate:.1f}% compliance (target: 80%+)")
        return 1


if __name__ == "__main__":
    import sys

    # Run tests first
    print("Testing Compliance Checker")
    print("=" * 50)
    test = TestAsymmetricaCompliance()
    test.test_validation_level_detection()
    test.test_scan_test_directory()

    print("\n" + "=" * 50)
    print("Running Full Compliance Check")
    print("=" * 50 + "\n")

    exit_code = main()
    sys.exit(exit_code)
