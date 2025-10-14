"""
Sample Benchmark Fixtures

Provides sample benchmark data and utilities:
- Performance baselines
- Benchmark configurations
- Comparison utilities

@complexity O(1) - Static data
@performance Instant
@validation α₀ - Production-ready
"""


def williams_optimizer_benchmarks():
    """Williams optimizer performance benchmarks"""
    return {
        "small_scale": {
            "operation_count": 100,
            "efficiency_multiplier": 1.5,
            "space_reduction_pct": 34,
            "execution_time_ms": 10,
            "baseline_time_ms": 15
        },
        "medium_scale": {
            "operation_count": 1000,
            "efficiency_multiplier": 3.2,
            "space_reduction_pct": 68,
            "execution_time_ms": 50,
            "baseline_time_ms": 160
        },
        "large_scale": {
            "operation_count": 10000,
            "efficiency_multiplier": 7.5,
            "space_reduction_pct": 87,
            "execution_time_ms": 200,
            "baseline_time_ms": 1500
        }
    }


def ocr_processing_benchmarks():
    """OCR processing performance benchmarks"""
    return {
        "single_page": {
            "target_time_ms": 2000,
            "actual_time_ms": 1800,
            "confidence_avg": 0.92,
            "field_count_avg": 15
        },
        "batch_10_pages": {
            "target_time_ms": 15000,
            "actual_time_ms": 12000,
            "confidence_avg": 0.90,
            "field_count_avg": 150
        },
        "with_williams": {
            "single_page_ms": 1600,
            "confidence_boost": 0.08,
            "efficiency_gain": 1.25
        }
    }


def living_interface_pipeline_benchmarks():
    """Living Interface Pipeline benchmarks"""
    return {
        "stage_1_vision": {
            "target_time_s": 3,
            "actual_time_s": 2.5,
            "accuracy_pct": 92
        },
        "stage_2_parallel": {
            "target_time_s": 5,
            "actual_time_s": 3.8,
            "parallel_workers": 3
        },
        "stage_3_validation": {
            "target_time_s": 2,
            "actual_time_s": 1.5,
            "quality_score_avg": 94
        },
        "end_to_end": {
            "target_time_s": 45,
            "actual_time_s": 38,
            "success_rate_pct": 96
        }
    }


def asymmetrica_compliance_benchmarks():
    """Asymmetrica protocol compliance benchmarks"""
    return {
        "complexity_annotation": {
            "compliance_rate_pct": 100,
            "files_checked": 250,
            "violations": 0
        },
        "performance_annotation": {
            "compliance_rate_pct": 98,
            "files_checked": 250,
            "violations": 5
        },
        "validation_annotation": {
            "compliance_rate_pct": 95,
            "files_checked": 250,
            "violations": 12
        },
        "regime_classification": {
            "exploration_pct": 30,
            "optimization_pct": 20,
            "stabilization_pct": 50
        }
    }


def three_regime_test_distribution():
    """Three-Regime test distribution data"""
    return {
        "target_distribution": {
            "exploration": 30,
            "optimization": 20,
            "stabilization": 50
        },
        "actual_distribution": {
            "exploration": 31,
            "optimization": 19,
            "stabilization": 50
        },
        "pass_rates": {
            "exploration": 75,  # Target: 70%+
            "optimization": 88,  # Target: 85%+
            "stabilization": 100  # Target: 100%
        },
        "quality_gates": {
            "exploration_min": 70,
            "optimization_min": 85,
            "stabilization_min": 100
        }
    }


def performance_regression_thresholds():
    """Performance regression detection thresholds"""
    return {
        "williams_optimizer": {
            "min_efficiency": 7.0,
            "max_regression_pct": 10
        },
        "ocr_processing": {
            "max_latency_ms": 2000,
            "max_regression_pct": 15
        },
        "pipeline_e2e": {
            "max_time_s": 45,
            "max_regression_pct": 20
        },
        "api_response": {
            "max_p95_ms": 500,
            "max_regression_pct": 25
        }
    }


def quality_score_benchmarks():
    """Quality score benchmarks for components"""
    return {
        "minimum_scores": {
            "complexity_annotation": 100,
            "performance_target": 90,
            "validation_status": 85,
            "accessibility_wcag": 90,
            "code_quality": 85
        },
        "target_scores": {
            "complexity_annotation": 100,
            "performance_target": 95,
            "validation_status": 95,
            "accessibility_wcag": 100,
            "code_quality": 95
        },
        "weight_distribution": {
            "complexity": 0.20,
            "performance": 0.25,
            "validation": 0.20,
            "accessibility": 0.20,
            "code_quality": 0.15
        }
    }


def get_all_benchmarks():
    """Get all benchmark data"""
    return {
        "williams_optimizer": williams_optimizer_benchmarks(),
        "ocr_processing": ocr_processing_benchmarks(),
        "living_interface_pipeline": living_interface_pipeline_benchmarks(),
        "asymmetrica_compliance": asymmetrica_compliance_benchmarks(),
        "three_regime_distribution": three_regime_test_distribution(),
        "performance_regression": performance_regression_thresholds(),
        "quality_scores": quality_score_benchmarks()
    }


def calculate_weighted_quality_score(scores: dict) -> float:
    """
    Calculate weighted quality score

    @complexity O(n) where n = number of score components
    @performance <1ms
    @validation α₀
    """
    weights = quality_score_benchmarks()["weight_distribution"]
    total_score = 0.0

    for component, score in scores.items():
        weight = weights.get(component, 0.0)
        total_score += score * weight

    return round(total_score, 2)


def check_performance_regression(current: dict, baseline: dict) -> dict:
    """
    Check for performance regression

    @complexity O(n) where n = number of metrics
    @performance <10ms
    @validation α₀
    """
    thresholds = performance_regression_thresholds()
    regressions = []

    for metric, current_value in current.items():
        if metric in baseline:
            baseline_value = baseline[metric]
            regression_pct = ((current_value - baseline_value) / baseline_value) * 100

            threshold = thresholds.get(metric, {}).get("max_regression_pct", 20)

            if regression_pct > threshold:
                regressions.append({
                    "metric": metric,
                    "current": current_value,
                    "baseline": baseline_value,
                    "regression_pct": regression_pct,
                    "threshold_pct": threshold
                })

    return {
        "regression_detected": len(regressions) > 0,
        "regressions": regressions,
        "count": len(regressions)
    }
