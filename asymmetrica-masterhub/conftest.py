"""
Asymmetrica Protocol - Pytest Configuration & Regime Reporting Plugin

Implements Three-Regime Test Distribution with weighted confidence scoring.

@complexity O(n) where n = number of tests
@performance <1s overhead for 1000 tests
@validation alpha-0 - Production-ready
"""

import pytest
from typing import Dict, List
from pathlib import Path


# Regime configuration
REGIME_CONFIG = {
    "exploration": {
        "target_ratio": 0.30,      # 30% of tests
        "pass_threshold": 0.70,    # 70% must pass
        "weight": 0.70,            # Confidence weight
        "description": "Edge cases, new features, experimental code"
    },
    "optimization": {
        "target_ratio": 0.20,      # 20% of tests
        "pass_threshold": 0.85,    # 85% must pass
        "weight": 0.85,            # Confidence weight
        "description": "Performance, refactoring, efficiency improvements"
    },
    "stabilization": {
        "target_ratio": 0.50,      # 50% of tests
        "pass_threshold": 1.00,    # 100% must pass
        "weight": 1.00,            # Confidence weight
        "description": "Critical paths, regression tests, production code"
    }
}


class RegimeReportPlugin:
    """
    Pytest plugin for Three-Regime test reporting

    Tracks test results by regime and calculates weighted confidence scores.
    """

    def __init__(self):
        self.regime_results = {
            "exploration": {"passed": 0, "failed": 0, "total": 0},
            "optimization": {"passed": 0, "failed": 0, "total": 0},
            "stabilization": {"passed": 0, "failed": 0, "total": 0},
            "unmarked": {"passed": 0, "failed": 0, "total": 0}
        }
        self.total_tests = 0

    def pytest_runtest_logreport(self, report):
        """Hook called for each test phase (setup, call, teardown)"""
        if report.when == "call":  # Only count the actual test call, not setup/teardown
            # Determine which regime this test belongs to
            regime = self._get_test_regime(report)

            # Update counts
            self.regime_results[regime]["total"] += 1
            self.total_tests += 1

            if report.passed:
                self.regime_results[regime]["passed"] += 1
            elif report.failed:
                self.regime_results[regime]["failed"] += 1

    def _get_test_regime(self, report) -> str:
        """Determine which regime a test belongs to based on markers"""
        if hasattr(report, 'keywords'):
            if 'exploration' in report.keywords:
                return "exploration"
            elif 'optimization' in report.keywords:
                return "optimization"
            elif 'stabilization' in report.keywords:
                return "stabilization"
        return "unmarked"

    def pytest_terminal_summary(self, terminalreporter, exitstatus):
        """Generate regime-based test summary report"""
        terminalreporter.write_sep("=", "Asymmetrica Three-Regime Test Report")

        if self.total_tests == 0:
            terminalreporter.write_line("No tests were run.")
            return

        # Calculate metrics for each regime
        regime_metrics = {}
        for regime, results in self.regime_results.items():
            if results["total"] > 0:
                pass_rate = results["passed"] / results["total"]
                actual_ratio = results["total"] / self.total_tests
                regime_metrics[regime] = {
                    "pass_rate": pass_rate,
                    "actual_ratio": actual_ratio,
                    "passed": results["passed"],
                    "failed": results["failed"],
                    "total": results["total"]
                }

        # Display results by regime
        for regime in ["exploration", "optimization", "stabilization", "unmarked"]:
            if regime not in regime_metrics:
                continue

            metrics = regime_metrics[regime]
            config = REGIME_CONFIG.get(regime, {})

            terminalreporter.write_line("")
            terminalreporter.write_line(f"--- {regime.upper()} Regime ---")

            if regime != "unmarked" and config:
                terminalreporter.write_line(f"Description: {config['description']}")
                terminalreporter.write_line(
                    f"Distribution: {metrics['actual_ratio']*100:.1f}% "
                    f"(target: {config['target_ratio']*100:.1f}%)"
                )

            terminalreporter.write_line(
                f"Tests: {metrics['total']} "
                f"(Passed: {metrics['passed']}, Failed: {metrics['failed']})"
            )
            terminalreporter.write_line(
                f"Pass Rate: {metrics['pass_rate']*100:.1f}%"
            )

            # Show pass/fail status against threshold
            if regime != "unmarked" and config:
                threshold = config["pass_threshold"]
                if metrics["pass_rate"] >= threshold:
                    status = "[PASS]"
                else:
                    status = "[FAIL]"
                terminalreporter.write_line(
                    f"Status: {status} "
                    f"(threshold: {threshold*100:.1f}%)"
                )

        # Calculate weighted confidence score
        terminalreporter.write_line("")
        terminalreporter.write_sep("-", "Weighted Confidence Score")

        confidence_components = []
        for regime in ["exploration", "optimization", "stabilization"]:
            if regime in regime_metrics:
                metrics = regime_metrics[regime]
                config = REGIME_CONFIG[regime]

                # Confidence contribution = pass_rate × weight × actual_ratio
                contribution = (
                    metrics["pass_rate"] *
                    config["weight"] *
                    metrics["actual_ratio"]
                )
                confidence_components.append(contribution)

                terminalreporter.write_line(
                    f"{regime.capitalize()}: "
                    f"{metrics['pass_rate']*100:.1f}% × "
                    f"{config['weight']:.2f} × "
                    f"{metrics['actual_ratio']*100:.1f}% = "
                    f"{contribution*100:.2f}%"
                )

        total_confidence = sum(confidence_components) * 100
        terminalreporter.write_line("")
        terminalreporter.write_line(
            f"Total Weighted Confidence: {total_confidence:.2f}%"
        )

        # Overall quality gate status
        terminalreporter.write_line("")
        terminalreporter.write_sep("-", "Quality Gate Status")

        all_passed = True
        for regime in ["exploration", "optimization", "stabilization"]:
            if regime in regime_metrics:
                metrics = regime_metrics[regime]
                config = REGIME_CONFIG[regime]

                if metrics["pass_rate"] < config["pass_threshold"]:
                    all_passed = False
                    terminalreporter.write_line(
                        f"[FAIL] {regime.capitalize()}: "
                        f"{metrics['pass_rate']*100:.1f}% < "
                        f"{config['pass_threshold']*100:.1f}% threshold"
                    )

        if all_passed:
            terminalreporter.write_line("[PASS] All regime thresholds met")
        else:
            terminalreporter.write_line("[FAIL] Some regimes below threshold")

        # Save report to JSON
        self._save_json_report(regime_metrics, total_confidence)

    def _save_json_report(self, regime_metrics: Dict, confidence: float):
        """Save regime report to JSON file"""
        import json
        from datetime import datetime

        report_data = {
            "timestamp": datetime.now().isoformat(),
            "total_tests": self.total_tests,
            "weighted_confidence": confidence,
            "regimes": {}
        }

        for regime, metrics in regime_metrics.items():
            config = REGIME_CONFIG.get(regime, {})
            report_data["regimes"][regime] = {
                "total": metrics["total"],
                "passed": metrics["passed"],
                "failed": metrics["failed"],
                "pass_rate": metrics["pass_rate"],
                "actual_ratio": metrics["actual_ratio"],
                "target_ratio": config.get("target_ratio"),
                "pass_threshold": config.get("pass_threshold"),
                "weight": config.get("weight")
            }

        # Save to test_logs directory
        report_path = Path("test_logs") / "regime_report.json"
        report_path.parent.mkdir(parents=True, exist_ok=True)

        with open(report_path, "w") as f:
            json.dump(report_data, f, indent=2)


def pytest_configure(config):
    """
    Register the regime report plugin

    This hook is called after command line options have been parsed
    and all plugins and initial conftest files have been loaded.
    """
    # Register custom markers
    config.addinivalue_line(
        "markers",
        "exploration: Exploration regime tests (30% target, 70% pass threshold)"
    )
    config.addinivalue_line(
        "markers",
        "optimization: Optimization regime tests (20% target, 85% pass threshold)"
    )
    config.addinivalue_line(
        "markers",
        "stabilization: Stabilization regime tests (50% target, 100% pass threshold)"
    )

    # Register regime report plugin if --regime-report flag is used
    if config.getoption("--regime-report", default=False):
        config.pluginmanager.register(RegimeReportPlugin(), "regime_report")


def pytest_addoption(parser):
    """Add custom command line options"""
    parser.addoption(
        "--regime-report",
        action="store_true",
        default=False,
        help="Generate Three-Regime test distribution report"
    )


# Fixture examples for common test scenarios
@pytest.fixture
def temp_memory_system():
    """
    Fixture providing a temporary AsymmetricaMemory instance for testing

    @complexity O(1) - simple object creation
    @performance <10ms setup time
    """
    import tempfile
    from pathlib import Path

    # Create temporary file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.yaml', delete=False) as f:
        temp_path = Path(f.name)

    yield temp_path

    # Cleanup
    if temp_path.exists():
        temp_path.unlink()


@pytest.fixture(scope="session")
def test_data_dir():
    """
    Fixture providing path to test data directory

    @complexity O(1)
    @performance <1ms
    """
    return Path(__file__).parent / "test_data"
