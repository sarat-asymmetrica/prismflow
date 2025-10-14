"""
Sample Benchmark Data for Testing

Collection of sample benchmark results used in research track testing:
- Williams Optimizer benchmarks
- Harmonic Timer performance data
- Statistical validation datasets

@complexity O(1) - constant lookup
@performance Target: <1ms
@validation α₀ - Production-ready
"""

from typing import Dict, List
import json


class SampleBenchmarks:
    """Collection of sample benchmark data for testing"""

    @staticmethod
    def williams_optimizer_benchmarks() -> Dict:
        """Williams Optimizer benchmark results"""
        return {
            "algorithm": "Williams Space Optimizer",
            "formula": "√t × log₂(t)",
            "benchmarks": [
                {
                    "scale": "small",
                    "input_size": 100,
                    "space_bound": 66.4,
                    "efficiency_multiplier": 1.51,
                    "space_reduction_percent": 33.6,
                    "execution_time_ms": 0.12,
                    "samples": 30,
                    "p_value": 0.0001
                },
                {
                    "scale": "medium",
                    "input_size": 1000,
                    "space_bound": 315.1,
                    "efficiency_multiplier": 3.17,
                    "space_reduction_percent": 68.5,
                    "execution_time_ms": 0.15,
                    "samples": 30,
                    "p_value": 0.0001
                },
                {
                    "scale": "large",
                    "input_size": 10000,
                    "space_bound": 1328.8,
                    "efficiency_multiplier": 7.52,
                    "space_reduction_percent": 86.7,
                    "execution_time_ms": 0.18,
                    "samples": 30,
                    "p_value": 0.0001
                }
            ],
            "statistical_summary": {
                "mean_efficiency": 4.07,
                "std_efficiency": 2.91,
                "confidence_interval_95": [1.2, 7.9],
                "effect_size_cohens_d": 1.25,
                "interpretation": "Large effect size, highly significant"
            },
            "validation_level": "α₀"
        }

    @staticmethod
    def harmonic_timer_benchmarks() -> Dict:
        """Harmonic Timer performance benchmarks"""
        return {
            "algorithm": "Harmonic Timer",
            "frequency_hz": 4.909,
            "base_period_ms": 203.7,
            "benchmarks": [
                {
                    "test": "deterministic_timing",
                    "target_ms": 203.7,
                    "actual_ms": 203.65,
                    "variance_ms": 12.3,
                    "samples": 100,
                    "within_tolerance": True
                },
                {
                    "test": "exponential_backoff",
                    "intervals": [203.7, 407.4, 814.8, 1629.6, 3259.2],
                    "measured": [203.8, 407.6, 815.1, 1630.2, 3260.1],
                    "max_error_percent": 0.5,
                    "samples": 50
                },
                {
                    "test": "rate_limiting",
                    "target_rps": 4.909,
                    "actual_rps": 4.91,
                    "duration_seconds": 60,
                    "total_requests": 294,
                    "within_tolerance": True
                }
            ],
            "performance_summary": {
                "mean_variance_ms": 12.3,
                "max_variance_ms": 35.2,
                "target_variance_ms": 50.0,
                "performance_rating": "Excellent"
            },
            "validation_level": "α₀"
        }

    @staticmethod
    def three_regime_benchmarks() -> Dict:
        """Three-Regime Test Planner benchmarks"""
        return {
            "algorithm": "Three-Regime Test Planner",
            "distribution": {"exploration": 0.30, "optimization": 0.20, "stabilization": 0.50},
            "weights": {"exploration": 0.70, "optimization": 0.85, "stabilization": 1.00},
            "benchmarks": [
                {
                    "test_suite": "backend_unit_tests",
                    "total_tests": 102,
                    "regime_counts": {"exploration": 31, "optimization": 20, "stabilization": 51},
                    "pass_rates": {"exploration": 0.97, "optimization": 0.95, "stabilization": 1.00},
                    "weighted_confidence": 0.87
                },
                {
                    "test_suite": "frontend_e2e_tests",
                    "total_tests": 45,
                    "regime_counts": {"exploration": 14, "optimization": 9, "stabilization": 22},
                    "pass_rates": {"exploration": 0.86, "optimization": 0.89, "stabilization": 1.00},
                    "weighted_confidence": 0.84
                },
                {
                    "test_suite": "integration_tests",
                    "total_tests": 68,
                    "regime_counts": {"exploration": 20, "optimization": 14, "stabilization": 34},
                    "pass_rates": {"exploration": 0.90, "optimization": 0.93, "stabilization": 1.00},
                    "weighted_confidence": 0.86
                }
            ],
            "statistical_summary": {
                "mean_confidence": 0.86,
                "std_confidence": 0.015,
                "target_confidence": 0.88,
                "meets_target": True
            },
            "validation_level": "α₀"
        }

    @staticmethod
    def statistical_validation_dataset() -> Dict:
        """Statistical validation dataset (n=30)"""
        return {
            "dataset_name": "Williams Optimizer Efficiency (n=10000)",
            "sample_size": 30,
            "hypothesis": "Efficiency = 7.5x",
            "samples": [
                7.48, 7.52, 7.51, 7.49, 7.53, 7.50, 7.51, 7.49, 7.52, 7.50,
                7.51, 7.49, 7.52, 7.50, 7.48, 7.53, 7.51, 7.49, 7.52, 7.50,
                7.51, 7.49, 7.50, 7.52, 7.48, 7.51, 7.50, 7.49, 7.52, 7.51
            ],
            "statistics": {
                "mean": 7.503,
                "std": 0.014,
                "min": 7.48,
                "max": 7.53,
                "median": 7.50,
                "t_statistic": 1.25,
                "p_value": 0.221,
                "confidence_interval_95": [7.498, 7.508],
                "effect_size_cohens_d": 0.21,
                "interpretation": "Not significantly different from 7.5x (p > 0.05)"
            },
            "validation_level": "α₀"
        }

    @staticmethod
    def get_all_benchmarks() -> Dict[str, Dict]:
        """Get all sample benchmarks"""
        return {
            "williams_optimizer": SampleBenchmarks.williams_optimizer_benchmarks(),
            "harmonic_timer": SampleBenchmarks.harmonic_timer_benchmarks(),
            "three_regime": SampleBenchmarks.three_regime_benchmarks(),
            "statistical_validation": SampleBenchmarks.statistical_validation_dataset()
        }

    @staticmethod
    def save_to_json(filepath: str):
        """Save benchmarks to JSON file"""
        benchmarks = SampleBenchmarks.get_all_benchmarks()
        with open(filepath, 'w') as f:
            json.dump(benchmarks, f, indent=2)
        print(f"✅ Benchmarks saved to: {filepath}")


# Quick test
if __name__ == "__main__":
    print("Sample Benchmarks for Research Track Testing")
    print("=" * 50)

    benchmarks = SampleBenchmarks.get_all_benchmarks()

    for name, benchmark in benchmarks.items():
        print(f"\n{name}:")
        if "algorithm" in benchmark:
            print(f"  Algorithm: {benchmark['algorithm']}")
        if "benchmarks" in benchmark:
            print(f"  Benchmark count: {len(benchmark['benchmarks'])}")
        if "validation_level" in benchmark:
            print(f"  Validation: {benchmark['validation_level']}")

    # Save to JSON
    import os
    script_dir = os.path.dirname(__file__)
    json_path = os.path.join(script_dir, "benchmarks.json")
    SampleBenchmarks.save_to_json(json_path)

    print("\n✅ All sample benchmarks loaded successfully!")
