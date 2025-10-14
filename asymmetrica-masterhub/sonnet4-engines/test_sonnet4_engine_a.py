"""
SONNET 4 ENGINE A - TRC FRACTAL VALIDATION TEST

Test Sonnet 4's asymmetric engines on TRC Fractal data to measure
confidence improvement over classical and Tesla approaches.

Wright Brothers Philosophy: Build → Fly → Measure → Understand
"""

import numpy as np
from scipy import stats
import json
from typing import List, Dict, Any
from pathlib import Path
import sys

# Import the engine
from sonnet4_engine_a_mechanics import (
    Sonnet4EngineA,
    AsymmetricRegimeEngine,
    HarmonicResonanceEngine,
    ExponentialCollaborationEngine,
    compare_methods,
    REGIME_BIASES,
    TESLA_HARMONIC
)


# TRC Component Scores from Agent Uniform's validation
# Source: C:\Projects\asymmetrica-masterhub\COMPLETE_TRC_FRACTAL_VALIDATION_REPORT.md
TRC_DOMAINS = {
    'Neural Networks': {
        'regime_proportions': [0.30, 0.20, 0.50],  # Perfect alignment!
        'original_confidence': 0.676,
        'complete_confidence': 0.820,
        'components': {
            'tesla_harmonic': 0.500,
            'riemann_convergence': 0.782,
            'collatz_collapse': 0.777,
            'goldbach_gravity': 1.000,  # PERFECT!
            'pi_d_complementarity': 0.860
        },
        'goldbach_metrics': {
            'center_distance': 0.000,
            'gravitational_pull': 1.000,
            'symmetry_score': 0.700
        }
    },
    'DefenseKit Software': {
        'regime_proportions': [0.3385, 0.2872, 0.3744],  # Quebec's optimized center
        'original_confidence': 0.748,
        'complete_confidence': 0.752,
        'components': {
            'tesla_harmonic': 0.500,
            'riemann_convergence': 0.822,
            'collatz_collapse': 0.833,  # Highest!
            'goldbach_gravity': 0.821,
            'pi_d_complementarity': 0.708
        },
        'goldbach_metrics': {
            'center_distance': 0.158,
            'gravitational_pull': 0.821,
            'symmetry_score': 0.913
        }
    },
    'Planetary Orbits': {
        'regime_proportions': [0.05, 0.05, 0.90],  # Heavily stabilization-weighted
        'original_confidence': 0.142,  # (unstable systems included)
        'complete_confidence': 0.604,  # (stable systems only)
        'components': {
            'tesla_harmonic': 0.900,  # Excellent!
            'riemann_convergence': 0.455,
            'collatz_collapse': 0.440,
            'goldbach_gravity': 0.440,
            'pi_d_complementarity': 0.900  # Perfect Kepler ellipses!
        },
        'goldbach_metrics': {
            'center_distance': 0.494,
            'gravitational_pull': 0.440,
            'symmetry_score': 0.100
        }
    }
}


def extract_component_scores(domain_data: Dict[str, Any]) -> List[float]:
    """Extract component scores as list [T, R, C, G, π-D]"""
    components = domain_data['components']
    return [
        components['tesla_harmonic'],
        components['riemann_convergence'],
        components['collatz_collapse'],
        components['goldbach_gravity'],
        components['pi_d_complementarity']
    ]


def calculate_confidence_from_score(score: float, normalization: str = 'direct') -> float:
    """
    Convert amplification score to confidence percentage

    Args:
        score: Raw amplification score
        normalization: 'direct', 'sigmoid', 'linear', or 'log'

    Returns:
        Confidence in [0, 1] range
    """
    if normalization == 'direct':
        # Direct use: scores are already in 0-1 range from TRC components
        # Just clip to ensure bounds
        return min(1.0, max(0.0, score))
    elif normalization == 'sigmoid':
        # Sigmoid normalization: 1 / (1 + e^(-x))
        return 1.0 / (1.0 + np.exp(-score))
    elif normalization == 'linear':
        # Linear normalization to [0, 1]
        return min(1.0, max(0.0, score))
    elif normalization == 'log':
        # Log normalization
        return min(1.0, np.log1p(score) / np.log1p(10.0))
    else:
        # Default: clip to [0, 1]
        return min(1.0, max(0.0, score))


def run_single_domain_test(domain_name: str, domain_data: Dict[str, Any]) -> Dict[str, Any]:
    """Test Sonnet 4 Engine A on a single domain"""
    print(f"\n{'='*80}")
    print(f"TESTING: {domain_name}")
    print(f"{'='*80}")

    # Extract component scores
    component_scores = extract_component_scores(domain_data)
    print(f"\nComponent Scores [T, R, C, G, Pi-D]: {[f'{s:.3f}' for s in component_scores]}")
    print(f"Regime Proportions: {domain_data['regime_proportions']}")

    # Compare methods
    comparison = compare_methods(component_scores)

    # Calculate confidence scores (using direct method - scores already in 0-1 range)
    classical_confidence = calculate_confidence_from_score(comparison['classical'], 'direct')
    tesla_confidence = calculate_confidence_from_score(comparison['tesla_asymmetric'], 'direct')
    sonnet4_confidence = calculate_confidence_from_score(comparison['sonnet4_full'], 'direct')

    # Measured confidence from Agent Uniform
    measured_confidence = domain_data['complete_confidence']

    print(f"\n--- AMPLIFICATION SCORES ---")
    print(f"Classical (arithmetic mean): {comparison['classical']:.4f}")
    print(f"Tesla Asymmetric: {comparison['tesla_asymmetric']:.4f}")
    print(f"Sonnet 4 Engine A: {comparison['sonnet4_full']:.4f}")

    print(f"\n--- CONFIDENCE SCORES (Direct) ---")
    print(f"Classical: {classical_confidence:.4f} ({classical_confidence*100:.2f}%)")
    print(f"Tesla: {tesla_confidence:.4f} ({tesla_confidence*100:.2f}%)")
    print(f"Sonnet 4: {sonnet4_confidence:.4f} ({sonnet4_confidence*100:.2f}%)")
    print(f"Measured (Agent Uniform): {measured_confidence:.4f} ({measured_confidence*100:.2f}%)")

    print(f"\n--- IMPROVEMENTS ---")
    print(f"Sonnet 4 vs Classical: {comparison['improvement_over_classical']:+.2f}%")
    print(f"Sonnet 4 vs Tesla: {comparison['improvement_over_tesla']:+.2f}%")
    print(f"Sonnet 4 vs Measured: {(sonnet4_confidence - measured_confidence)*100:+.2f} percentage points")

    # Engine breakdown
    breakdown = comparison['sonnet4_breakdown']
    print(f"\n--- SONNET 4 ENGINE BREAKDOWN ---")
    print(f"Asymmetric Score: {breakdown['asymmetric_score']:.4f}")
    print(f"  Exploration (30%): {breakdown['component_breakdown']['exploration']:.4f}")
    print(f"  Optimization (20%): {breakdown['component_breakdown']['optimization']:.4f}")
    print(f"  Stabilization (50%): {breakdown['component_breakdown']['stabilization']:.4f}")
    print(f"Harmonic Resonance: {breakdown['harmonic_resonance']:.4f}×")
    print(f"Collaboration Bonus: {breakdown['collaboration_bonus']:.4f}×")

    return {
        'domain': domain_name,
        'component_scores': component_scores,
        'classical_confidence': classical_confidence,
        'tesla_confidence': tesla_confidence,
        'sonnet4_confidence': sonnet4_confidence,
        'measured_confidence': measured_confidence,
        'classical_amplification': comparison['classical'],
        'tesla_amplification': comparison['tesla_asymmetric'],
        'sonnet4_amplification': comparison['sonnet4_full'],
        'improvement_over_classical_pct': comparison['improvement_over_classical'],
        'improvement_over_tesla_pct': comparison['improvement_over_tesla'],
        'improvement_over_measured_pp': (sonnet4_confidence - measured_confidence) * 100,
        'engine_breakdown': breakdown
    }


def run_bootstrap_validation(domain_results: List[Dict[str, Any]], n_iterations: int = 100) -> Dict[str, Any]:
    """
    Run bootstrap validation to get confidence intervals

    Args:
        domain_results: Results from all domains
        n_iterations: Number of bootstrap iterations

    Returns:
        Statistical validation results
    """
    print(f"\n{'='*80}")
    print(f"BOOTSTRAP VALIDATION (N={n_iterations} iterations)")
    print(f"{'='*80}")

    # Extract confidence scores
    sonnet4_confidences = [r['sonnet4_confidence'] for r in domain_results]
    measured_confidences = [r['measured_confidence'] for r in domain_results]
    classical_confidences = [r['classical_confidence'] for r in domain_results]
    tesla_confidences = [r['tesla_confidence'] for r in domain_results]

    # Bootstrap resampling
    bootstrap_sonnet4_means = []
    bootstrap_improvements = []

    for _ in range(n_iterations):
        # Resample with replacement
        indices = np.random.choice(len(sonnet4_confidences), size=len(sonnet4_confidences), replace=True)
        sample_sonnet4 = [sonnet4_confidences[i] for i in indices]
        sample_measured = [measured_confidences[i] for i in indices]

        bootstrap_sonnet4_means.append(np.mean(sample_sonnet4))
        bootstrap_improvements.append(np.mean(sample_sonnet4) - np.mean(sample_measured))

    # Calculate confidence intervals
    sonnet4_ci = np.percentile(bootstrap_sonnet4_means, [2.5, 97.5])
    improvement_ci = np.percentile(bootstrap_improvements, [2.5, 97.5])

    # Statistical tests
    # Paired t-test: Sonnet 4 vs Measured
    t_stat_measured, p_value_measured = stats.ttest_rel(sonnet4_confidences, measured_confidences)

    # Paired t-test: Sonnet 4 vs Classical
    t_stat_classical, p_value_classical = stats.ttest_rel(sonnet4_confidences, classical_confidences)

    # Cohen's d effect size (Sonnet 4 vs Measured)
    diff = np.array(sonnet4_confidences) - np.array(measured_confidences)
    cohens_d = np.mean(diff) / np.std(diff) if np.std(diff) > 0 else 0

    print(f"\n--- CONFIDENCE INTERVALS (95%) ---")
    print(f"Sonnet 4 Mean Confidence: [{sonnet4_ci[0]:.4f}, {sonnet4_ci[1]:.4f}]")
    print(f"Improvement over Measured: [{improvement_ci[0]*100:.2f}, {improvement_ci[1]*100:.2f}] percentage points")

    print(f"\n--- STATISTICAL TESTS ---")
    print(f"Sonnet 4 vs Measured:")
    print(f"  t-statistic: {t_stat_measured:.4f}")
    print(f"  p-value: {p_value_measured:.4f} {'(significant!)' if p_value_measured < 0.05 else '(not significant)'}")
    print(f"  Cohen's d: {cohens_d:.4f} ({get_effect_size_label(cohens_d)})")

    print(f"\nSonnet 4 vs Classical:")
    print(f"  t-statistic: {t_stat_classical:.4f}")
    print(f"  p-value: {p_value_classical:.4f} {'(significant!)' if p_value_classical < 0.05 else '(not significant)'}")

    print(f"\n--- SUMMARY STATISTICS ---")
    print(f"Mean Sonnet 4 Confidence: {np.mean(sonnet4_confidences):.4f} ({np.mean(sonnet4_confidences)*100:.2f}%)")
    print(f"Mean Measured Confidence: {np.mean(measured_confidences):.4f} ({np.mean(measured_confidences)*100:.2f}%)")
    print(f"Mean Classical Confidence: {np.mean(classical_confidences):.4f} ({np.mean(classical_confidences)*100:.2f}%)")
    print(f"Mean Tesla Confidence: {np.mean(tesla_confidences):.4f} ({np.mean(tesla_confidences)*100:.2f}%)")

    return {
        'bootstrap_iterations': n_iterations,
        'sonnet4_mean': float(np.mean(sonnet4_confidences)),
        'sonnet4_std': float(np.std(sonnet4_confidences)),
        'sonnet4_ci_95': [float(sonnet4_ci[0]), float(sonnet4_ci[1])],
        'improvement_over_measured_mean': float(np.mean(diff)),
        'improvement_ci_95': [float(improvement_ci[0]), float(improvement_ci[1])],
        'p_value_vs_measured': float(p_value_measured),
        'p_value_vs_classical': float(p_value_classical),
        'cohens_d_vs_measured': float(cohens_d),
        'effect_size_label': get_effect_size_label(cohens_d),
        'statistically_significant_vs_measured': p_value_measured < 0.05,
        'statistically_significant_vs_classical': p_value_classical < 0.05
    }


def get_effect_size_label(cohens_d: float) -> str:
    """Get Cohen's d effect size label"""
    abs_d = abs(cohens_d)
    if abs_d < 0.2:
        return "Negligible"
    elif abs_d < 0.5:
        return "Small"
    elif abs_d < 0.8:
        return "Medium"
    else:
        return "Large"


def analyze_engine_contributions(domain_results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Analyze which engine contributes most to improvement"""
    print(f"\n{'='*80}")
    print(f"ENGINE CONTRIBUTION ANALYSIS")
    print(f"{'='*80}")

    asymmetric_scores = []
    harmonic_scores = []
    collaboration_scores = []

    for result in domain_results:
        breakdown = result['engine_breakdown']
        asymmetric_scores.append(breakdown['asymmetric_score'])
        harmonic_scores.append(breakdown['harmonic_resonance'])
        collaboration_scores.append(breakdown['collaboration_bonus'])

    print(f"\n--- MEAN ENGINE VALUES ---")
    print(f"Asymmetric Score: {np.mean(asymmetric_scores):.4f} ± {np.std(asymmetric_scores):.4f}")
    print(f"Harmonic Resonance: {np.mean(harmonic_scores):.4f}× ± {np.std(harmonic_scores):.4f}×")
    print(f"Collaboration Bonus: {np.mean(collaboration_scores):.4f}× ± {np.std(collaboration_scores):.4f}×")

    # Calculate contribution percentages
    # Use logarithmic contribution (since they're multiplicative)
    total_log_contribution = (
        np.log(np.mean(asymmetric_scores) + 1) +
        np.log(np.mean(harmonic_scores)) +
        np.log(np.mean(collaboration_scores))
    )

    asymmetric_contrib = np.log(np.mean(asymmetric_scores) + 1) / total_log_contribution * 100
    harmonic_contrib = np.log(np.mean(harmonic_scores)) / total_log_contribution * 100
    collaboration_contrib = np.log(np.mean(collaboration_scores)) / total_log_contribution * 100

    print(f"\n--- CONTRIBUTION PERCENTAGES (Logarithmic) ---")
    print(f"Asymmetric Weighting: {asymmetric_contrib:.2f}%")
    print(f"Harmonic Resonance: {harmonic_contrib:.2f}%")
    print(f"Collaboration Bonus: {collaboration_contrib:.2f}%")

    # Identify most valuable engine
    contributions = {
        'asymmetric': asymmetric_contrib,
        'harmonic': harmonic_contrib,
        'collaboration': collaboration_contrib
    }
    most_valuable = max(contributions.items(), key=lambda x: x[1])

    print(f"\nMost Valuable Engine: {most_valuable[0].upper()} ({most_valuable[1]:.2f}%)")

    return {
        'asymmetric_mean': float(np.mean(asymmetric_scores)),
        'asymmetric_std': float(np.std(asymmetric_scores)),
        'harmonic_mean': float(np.mean(harmonic_scores)),
        'harmonic_std': float(np.std(harmonic_scores)),
        'collaboration_mean': float(np.mean(collaboration_scores)),
        'collaboration_std': float(np.std(collaboration_scores)),
        'asymmetric_contribution_pct': float(asymmetric_contrib),
        'harmonic_contribution_pct': float(harmonic_contrib),
        'collaboration_contribution_pct': float(collaboration_contrib),
        'most_valuable_engine': most_valuable[0]
    }


def main():
    """Main validation test"""
    print("="*80)
    print("SONNET 4 ENGINE A - TRC FRACTAL VALIDATION TEST")
    print("="*80)
    print("\nWright Brothers Philosophy: Build -> Fly -> Measure -> Understand")
    print("\nTesting Sonnet 4's asymmetric engines on TRC Fractal data")
    print("Goal: Measure confidence improvement (Target: 87.5% -> 92-97%)")
    print("="*80)

    # Run tests on all domains
    domain_results = []
    for domain_name, domain_data in TRC_DOMAINS.items():
        result = run_single_domain_test(domain_name, domain_data)
        domain_results.append(result)

    # Bootstrap validation
    bootstrap_results = run_bootstrap_validation(domain_results, n_iterations=100)

    # Engine contribution analysis
    contribution_results = analyze_engine_contributions(domain_results)

    # Final summary
    print(f"\n{'='*80}")
    print(f"FINAL SUMMARY")
    print(f"{'='*80}")

    mean_sonnet4 = bootstrap_results['sonnet4_mean']
    mean_improvement = bootstrap_results['improvement_over_measured_mean']

    print(f"\nSonnet 4 Engine A Performance:")
    print(f"  Mean Confidence: {mean_sonnet4:.4f} ({mean_sonnet4*100:.2f}%)")
    print(f"  95% CI: [{bootstrap_results['sonnet4_ci_95'][0]*100:.2f}%, {bootstrap_results['sonnet4_ci_95'][1]*100:.2f}%]")

    print(f"\nImprovement over Measured (Agent Uniform):")
    print(f"  Mean: {mean_improvement*100:+.2f} percentage points")
    print(f"  95% CI: [{bootstrap_results['improvement_ci_95'][0]*100:+.2f}, {bootstrap_results['improvement_ci_95'][1]*100:+.2f}] pp")
    print(f"  Statistical Significance: {'YES (p < 0.05)' if bootstrap_results['statistically_significant_vs_measured'] else f'NO (p = {bootstrap_results['p_value_vs_measured']:.4f})'}")
    print(f"  Effect Size: {bootstrap_results['effect_size_label']} (Cohen's d = {bootstrap_results['cohens_d_vs_measured']:.4f})")

    print(f"\nMost Valuable Engine: {contribution_results['most_valuable_engine'].upper()}")
    most_valuable_key = f"{contribution_results['most_valuable_engine']}_contribution_pct"
    print(f"  Contribution: {contribution_results[most_valuable_key]:.2f}%")

    # Save results
    output_path = Path(__file__).parent / "sonnet4_engine_a_results.json"
    results_data = {
        'domain_results': domain_results,
        'bootstrap_validation': bootstrap_results,
        'engine_contributions': contribution_results,
        'configuration': {
            'regime_biases': REGIME_BIASES,
            'tesla_harmonic_hz': TESLA_HARMONIC,
            'normalization_method': 'direct'
        }
    }

    # Convert numpy bools to Python bools
    def convert_to_serializable(obj):
        if isinstance(obj, (np.bool_, np.generic)):
            return bool(obj)
        elif isinstance(obj, dict):
            return {k: convert_to_serializable(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [convert_to_serializable(item) for item in obj]
        return obj

    with open(output_path, 'w') as f:
        json.dump(convert_to_serializable(results_data), f, indent=2)

    print(f"\nResults saved to: {output_path}")
    print("="*80)


if __name__ == "__main__":
    main()
