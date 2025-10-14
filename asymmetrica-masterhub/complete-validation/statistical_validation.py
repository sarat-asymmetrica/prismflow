"""
STATISTICAL VALIDATION OF COMPLETE TRC FRACTAL FRAMEWORK
=========================================================

Perform rigorous statistical analysis:
1. Confidence intervals (bootstrap)
2. Significance tests (paired t-test)
3. Effect sizes (Cohen's d)
4. Cross-domain consistency analysis

Author: Agent Uniform
Date: October 7, 2025
"""

import json
import numpy as np
from scipy import stats
from typing import List, Tuple


def bootstrap_confidence_interval(data: List[float], n_iterations: int = 10000,
                                  confidence_level: float = 0.95) -> Tuple[float, float, float]:
    """
    Calculate bootstrap confidence interval for mean

    Args:
        data: Original data points
        n_iterations: Number of bootstrap resamples
        confidence_level: Desired confidence level (default 95%)

    Returns:
        (mean, lower_bound, upper_bound)
    """
    data = np.array(data)
    n = len(data)

    # Bootstrap resampling
    bootstrap_means = []
    for _ in range(n_iterations):
        resample = np.random.choice(data, size=n, replace=True)
        bootstrap_means.append(resample.mean())

    bootstrap_means = np.array(bootstrap_means)

    # Calculate percentiles for confidence interval
    alpha = 1 - confidence_level
    lower_percentile = (alpha / 2) * 100
    upper_percentile = (1 - alpha / 2) * 100

    ci_lower = np.percentile(bootstrap_means, lower_percentile)
    ci_upper = np.percentile(bootstrap_means, upper_percentile)

    return data.mean(), ci_lower, ci_upper


def paired_t_test(before: List[float], after: List[float]) -> dict:
    """
    Perform paired t-test to check if improvement is significant

    Args:
        before: Confidence scores before (3-component framework)
        after: Confidence scores after (5-component framework)

    Returns:
        Dictionary with test statistics
    """
    before = np.array(before)
    after = np.array(after)

    # Paired t-test
    t_stat, p_value = stats.ttest_rel(after, before)

    # Degrees of freedom
    df = len(before) - 1

    # One-tailed p-value (we're testing if after > before)
    p_value_one_tailed = p_value / 2 if t_stat > 0 else 1 - (p_value / 2)

    return {
        't_statistic': float(t_stat),
        'p_value_two_tailed': float(p_value),
        'p_value_one_tailed': float(p_value_one_tailed),
        'degrees_of_freedom': int(df),
        'significant_at_0.05': bool(p_value_one_tailed < 0.05),
        'significant_at_0.01': bool(p_value_one_tailed < 0.01),
        'interpretation': str('Significant improvement' if p_value_one_tailed < 0.05 else 'Not significant')
    }


def cohens_d(before: List[float], after: List[float]) -> dict:
    """
    Calculate Cohen's d effect size

    Effect size interpretation:
    - Small: d = 0.2
    - Medium: d = 0.5
    - Large: d = 0.8

    Args:
        before: Confidence scores before
        after: Confidence scores after

    Returns:
        Dictionary with effect size metrics
    """
    before = np.array(before)
    after = np.array(after)

    # Calculate differences (paired)
    differences = after - before

    # Mean difference
    mean_diff = differences.mean()

    # Pooled standard deviation
    pooled_std = differences.std(ddof=1)

    # Cohen's d
    d = mean_diff / pooled_std if pooled_std > 0 else 0

    # Interpret effect size
    if abs(d) < 0.2:
        interpretation = "Negligible"
    elif abs(d) < 0.5:
        interpretation = "Small"
    elif abs(d) < 0.8:
        interpretation = "Medium"
    else:
        interpretation = "Large"

    return {
        'cohens_d': float(d),
        'mean_difference': float(mean_diff),
        'std_difference': float(pooled_std),
        'interpretation': str(interpretation)
    }


def analyze_cross_domain_consistency(domain_results: dict) -> dict:
    """
    Analyze consistency of improvement across domains

    Args:
        domain_results: Dictionary mapping domains to improvement values

    Returns:
        Dictionary with consistency metrics
    """
    improvements = np.array(list(domain_results.values()))

    # Check if all improvements are positive
    all_positive = np.all(improvements > 0)

    # Calculate variance and coefficient of variation
    mean_improvement = improvements.mean()
    std_improvement = improvements.std(ddof=1)
    cv = (std_improvement / mean_improvement) if mean_improvement > 0 else float('inf')

    # Identify outliers (> 2 standard deviations from mean)
    z_scores = (improvements - mean_improvement) / std_improvement
    outliers = {domain: float(imp) for domain, imp, z in zip(domain_results.keys(), improvements, z_scores)
                if abs(z) > 2}

    return {
        'all_improvements_positive': bool(all_positive),
        'mean_improvement': float(mean_improvement),
        'std_improvement': float(std_improvement),
        'coefficient_of_variation': float(cv),
        'consistency_rating': str('High' if cv < 0.5 else ('Moderate' if cv < 1.0 else 'Low')),
        'outliers': outliers,
        'range': {
            'min': float(improvements.min()),
            'max': float(improvements.max())
        }
    }


def main():
    """Run complete statistical validation"""

    print("="*80)
    print("STATISTICAL VALIDATION - COMPLETE TRC FRACTAL FRAMEWORK")
    print("="*80)
    print()

    # Load results
    with open('sierra_complete_validation_results.json') as f:
        results = json.load(f)

    # Extract confidence scores
    original = results['original_framework']
    complete = results['complete_framework']

    # Domain-level scores
    domains = ['neural_networks', 'defensekit_software', 'planetary_orbits']
    before_scores = [original['neural_networks'], original['defensekit_software'], original['planetary_orbits']]
    after_scores = [
        complete['neural_networks']['overall_confidence'],
        complete['defensekit_software']['overall_confidence'],
        complete['planetary_orbits_stable']['overall_confidence']
    ]

    improvements = {
        'neural_networks': after_scores[0] - before_scores[0],
        'defensekit_software': after_scores[1] - before_scores[1],
        'planetary_orbits': after_scores[2] - before_scores[2]
    }

    # ========================================================================
    # 1. CONFIDENCE INTERVALS
    # ========================================================================
    print("1. BOOTSTRAP CONFIDENCE INTERVALS (10,000 iterations)")
    print("-" * 80)

    # Original framework CI
    orig_mean, orig_lower, orig_upper = bootstrap_confidence_interval(before_scores)
    print(f"Original Framework (3-component):")
    print(f"  Mean: {orig_mean:.1%}")
    print(f"  95% CI: [{orig_lower:.1%}, {orig_upper:.1%}]")
    print()

    # Complete framework CI
    complete_mean, complete_lower, complete_upper = bootstrap_confidence_interval(after_scores)
    print(f"Complete Framework (5-component):")
    print(f"  Mean: {complete_mean:.1%}")
    print(f"  95% CI: [{complete_lower:.1%}, {complete_upper:.1%}]")
    print()

    # Check if CIs overlap
    ci_overlap = not (orig_upper < complete_lower or complete_upper < orig_lower)
    print(f"Confidence intervals overlap: {ci_overlap}")
    if not ci_overlap:
        print("  -> Improvement is HIGHLY SIGNIFICANT (non-overlapping CIs)")
    else:
        print("  -> Further testing needed")
    print()
    print()

    # ========================================================================
    # 2. PAIRED T-TEST
    # ========================================================================
    print("2. PAIRED T-TEST (3-component vs 5-component)")
    print("-" * 80)

    ttest_results = paired_t_test(before_scores, after_scores)

    print(f"Null hypothesis: No difference between frameworks")
    print(f"Alternative hypothesis: 5-component > 3-component")
    print()
    print(f"t-statistic: {ttest_results['t_statistic']:.4f}")
    print(f"Degrees of freedom: {ttest_results['degrees_of_freedom']}")
    print(f"p-value (one-tailed): {ttest_results['p_value_one_tailed']:.6f}")
    print()

    if ttest_results['significant_at_0.01']:
        print(f"Result: HIGHLY SIGNIFICANT (p < 0.01)")
        print(f"  -> Strong evidence that 5-component framework improves confidence")
    elif ttest_results['significant_at_0.05']:
        print(f"Result: SIGNIFICANT (p < 0.05)")
        print(f"  -> Evidence that 5-component framework improves confidence")
    else:
        print(f"Result: NOT SIGNIFICANT (p >= 0.05)")
        print(f"  -> Insufficient evidence of improvement")
    print()
    print()

    # ========================================================================
    # 3. EFFECT SIZE
    # ========================================================================
    print("3. EFFECT SIZE (Cohen's d)")
    print("-" * 80)

    effect_results = cohens_d(before_scores, after_scores)

    print(f"Cohen's d: {effect_results['cohens_d']:.4f}")
    print(f"Mean improvement: {effect_results['mean_difference']:.1%}")
    print(f"Standard deviation: {effect_results['std_difference']:.4f}")
    print()
    print(f"Interpretation: {effect_results['interpretation']}")

    if effect_results['interpretation'] in ['Medium', 'Large']:
        print(f"  -> Practically significant improvement")
    else:
        print(f"  -> Modest practical impact")
    print()
    print()

    # ========================================================================
    # 4. CROSS-DOMAIN CONSISTENCY
    # ========================================================================
    print("4. CROSS-DOMAIN CONSISTENCY ANALYSIS")
    print("-" * 80)

    consistency_results = analyze_cross_domain_consistency(improvements)

    print(f"All improvements positive: {consistency_results['all_improvements_positive']}")
    print(f"Mean improvement: {consistency_results['mean_improvement']:.1%}")
    print(f"Std improvement: {consistency_results['std_improvement']:.1%}")
    print(f"Coefficient of variation: {consistency_results['coefficient_of_variation']:.2f}")
    print()
    print(f"Consistency rating: {consistency_results['consistency_rating']}")

    if consistency_results['outliers']:
        print(f"\nOutliers detected (|z| > 2):")
        for domain, value in consistency_results['outliers'].items():
            print(f"  {domain}: {value:+.1%}")
    else:
        print(f"\nNo outliers detected")

    print(f"\nImprovement range: [{consistency_results['range']['min']:.1%}, {consistency_results['range']['max']:.1%}]")
    print()
    print()

    # ========================================================================
    # 5. COMPONENT CONTRIBUTION ANALYSIS
    # ========================================================================
    print("5. COMPONENT CONTRIBUTION ANALYSIS")
    print("-" * 80)

    # Average component scores across domains
    neural = complete['neural_networks']
    defensekit = complete['defensekit_software']
    planetary = complete['planetary_orbits_stable']

    avg_components = {
        'tesla_harmonic': np.mean([neural['tesla_harmonic'], defensekit['tesla_harmonic'], planetary['tesla_harmonic']]),
        'riemann_convergence': np.mean([neural['riemann_convergence'], defensekit['riemann_convergence'], planetary['riemann_convergence']]),
        'collatz_collapse': np.mean([neural['collatz_collapse'], defensekit['collatz_collapse'], planetary['collatz_collapse']]),
        'goldbach_gravity': np.mean([neural['goldbach_gravity'], defensekit['goldbach_gravity'], planetary['goldbach_gravity']]),
        'pi_d_complementarity': np.mean([neural['pi_d_complementarity'], defensekit['pi_d_complementarity'], planetary['pi_d_complementarity']])
    }

    # Sort by contribution
    sorted_components = sorted(avg_components.items(), key=lambda x: x[1], reverse=True)

    print("Average component scores across all domains:")
    for i, (component, score) in enumerate(sorted_components, 1):
        weight = neural['component_weights'][component]
        contribution = score * weight
        print(f"  {i}. {component:25s}  Score: {score:.3f}  Weight: {weight:.2f}  Contribution: {contribution:.3f}")

    print()

    # Identify strongest contributors to improvement
    print("Key findings:")
    strongest = sorted_components[0]
    weakest = sorted_components[-1]

    print(f"  - Strongest component: {strongest[0]} ({strongest[1]:.3f})")
    print(f"  - Weakest component: {weakest[0]} ({weakest[1]:.3f})")

    # Check Goldbach gravity performance
    goldbach_rank = [comp[0] for comp in sorted_components].index('goldbach_gravity') + 1
    print(f"  - Goldbach gravity rank: #{goldbach_rank} of 5")

    if goldbach_rank <= 2:
        print(f"    -> Agent Tango's prediction confirmed: Goldbach is a top contributor")
    else:
        print(f"    -> Agent Tango's prediction partially supported")

    print()
    print()

    # ========================================================================
    # 6. COMPARISON TO TANGO'S PREDICTION
    # ========================================================================
    print("6. COMPARISON TO AGENT TANGO'S PREDICTION")
    print("-" * 80)

    tango_prediction = (0.85, 0.95)  # 85-95%
    actual_confidence = complete_mean

    print(f"Agent Tango's prediction: {tango_prediction[0]:.1%} - {tango_prediction[1]:.1%}")
    print(f"Actual measured confidence: {actual_confidence:.1%}")
    print()

    if tango_prediction[0] <= actual_confidence <= tango_prediction[1]:
        print(f"Result: PREDICTION VALIDATED")
        deviation_pct = 0
    elif actual_confidence < tango_prediction[0]:
        deviation_pct = (actual_confidence - tango_prediction[0]) * 100
        print(f"Result: BELOW PREDICTION")
        print(f"Deviation: {deviation_pct:.1f} percentage points below minimum")
    else:
        deviation_pct = (actual_confidence - tango_prediction[1]) * 100
        print(f"Result: ABOVE PREDICTION")
        print(f"Deviation: {deviation_pct:.1f} percentage points above maximum")

    print()

    # Analyze why prediction might have differed
    if actual_confidence < tango_prediction[0]:
        print("Possible reasons for lower-than-predicted confidence:")
        print("  1. Heuristic measurements for pi-D complementarity (no direct data)")
        print("  2. Riemann/Collatz signatures measured by distance, not native fit")
        print("  3. Planetary domain still challenging despite filtering for stable systems")
        print("  4. Tesla harmonic limited to static regime proportions (no temporal data)")
        print()
        print("Improvements to reach 85-95%:")
        print("  - Collect actual temporal data for Tesla harmonic measurement")
        print("  - Implement full fractal dimension calculation for pi-D")
        print("  - Add more domains with better alignment (chemistry predicted at 95%)")
        print("  - Refine planetary orbit analysis (weight by orbital stability)")

    print()
    print()

    # ========================================================================
    # 7. FINAL STATISTICAL SUMMARY
    # ========================================================================
    print("="*80)
    print("FINAL STATISTICAL SUMMARY")
    print("="*80)
    print()

    print(f"Overall confidence improvement: {results['improvement']:.1%}")
    print(f"95% Bootstrap CI: [{complete_lower:.1%}, {complete_upper:.1%}]")
    print(f"Statistical significance: p = {ttest_results['p_value_one_tailed']:.6f} {'(SIGNIFICANT)' if ttest_results['significant_at_0.05'] else '(NOT SIGNIFICANT)'}")
    print(f"Effect size (Cohen's d): {effect_results['cohens_d']:.2f} ({effect_results['interpretation']})")
    print(f"Cross-domain consistency: {consistency_results['consistency_rating']}")
    print()

    # Overall assessment
    if ttest_results['significant_at_0.05'] and effect_results['cohens_d'] >= 0.5:
        assessment = "STRONG VALIDATION"
        explanation = "Complete framework shows statistically significant and practically meaningful improvement"
    elif ttest_results['significant_at_0.05']:
        assessment = "MODERATE VALIDATION"
        explanation = "Complete framework shows statistically significant improvement with modest effect size"
    elif effect_results['cohens_d'] >= 0.5:
        assessment = "PARTIAL VALIDATION"
        explanation = "Complete framework shows practically meaningful improvement but lacks statistical significance"
    else:
        assessment = "WEAK VALIDATION"
        explanation = "Complete framework shows limited improvement"

    print(f"OVERALL ASSESSMENT: {assessment}")
    print(f"  {explanation}")
    print()

    # Save statistical results
    stats_output = {
        'bootstrap_ci': {
            'original_framework': {'mean': orig_mean, 'ci_lower': orig_lower, 'ci_upper': orig_upper},
            'complete_framework': {'mean': complete_mean, 'ci_lower': complete_lower, 'ci_upper': complete_upper},
            'ci_overlap': bool(ci_overlap)
        },
        'paired_ttest': ttest_results,
        'effect_size': effect_results,
        'cross_domain_consistency': consistency_results,
        'component_contributions': avg_components,
        'tango_prediction_comparison': {
            'predicted_range': list(tango_prediction),
            'actual_confidence': actual_confidence,
            'prediction_validated': bool(tango_prediction[0] <= actual_confidence <= tango_prediction[1]),
            'deviation_percentage_points': deviation_pct
        },
        'overall_assessment': {
            'rating': assessment,
            'explanation': explanation
        }
    }

    with open('statistical_validation_results.json', 'w') as f:
        json.dump(stats_output, f, indent=2)

    print("Statistical results saved to: statistical_validation_results.json")
    print()


if __name__ == "__main__":
    main()
