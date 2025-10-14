"""
SONNET 4 ENGINE A - SIMPLE COMPARISON ANALYSIS

Direct comparison of three weighting approaches:
1. Classical: Arithmetic mean (equal weighting)
2. Tesla: Asymmetric regime weighting [30%, 20%, 50%] with max/mean/min
3. Sonnet 4: Tesla + Harmonic resonance + Collaboration bonus

Focus on WHICH METHOD PRODUCES SCORES CLOSEST TO MEASURED REALITY
"""

import numpy as np
from scipy import stats
import json
from pathlib import Path

# TRC Component Scores from Agent Uniform's validation
TRC_DOMAINS = {
    'Neural Networks': {
        'regime_proportions': [0.30, 0.20, 0.50],
        'measured_confidence': 0.820,  # Agent Uniform's complete TRC measurement
        'components': [0.500, 0.782, 0.777, 1.000, 0.860]  # [T, R, C, G, Pi-D]
    },
    'DefenseKit Software': {
        'regime_proportions': [0.3385, 0.2872, 0.3744],
        'measured_confidence': 0.752,
        'components': [0.500, 0.822, 0.833, 0.821, 0.708]
    },
    'Planetary Orbits': {
        'regime_proportions': [0.05, 0.05, 0.90],
        'measured_confidence': 0.604,
        'components': [0.900, 0.455, 0.440, 0.440, 0.900]
    }
}

REGIME_BIASES = [0.30, 0.20, 0.50]
TESLA_HARMONIC = 4.909


def classical_weighting(components):
    """Simple arithmetic mean"""
    return np.mean(components)


def tesla_asymmetric_weighting(components, regime_biases=REGIME_BIASES):
    """
    Sonnet 4's asymmetric regime weighting:
    - Exploration (30%): Take BEST (max)
    - Optimization (20%): Take AVERAGE (mean)
    - Stabilization (50%): Take WORST (min)
    """
    exploration = max(components) * regime_biases[0]
    optimization = np.mean(components) * regime_biases[1]
    stabilization = min(components) * regime_biases[2]

    asymmetric_score = exploration + optimization + stabilization

    # Tesla boost
    tesla_boost = 1.0 + (TESLA_HARMONIC / 10.0)  # ≈ 1.49×

    return asymmetric_score * tesla_boost


def harmonic_resonance(components):
    """Harmonic mean boost"""
    valid = [c for c in components if c > 0]
    if not valid:
        return 1.0
    harmonic_mean = len(valid) / sum(1.0/c for c in valid)
    return harmonic_mean  # Return raw harmonic mean


def collaboration_bonus(components, threshold=0.5):
    """Collaboration bonus based on active components"""
    active = sum(1 for c in components if c > threshold)
    ratio = active / len(components)
    return ratio  # Return ratio, not squared bonus


def sonnet4_combined(components):
    """
    Sonnet 4 approach: Combine all three
    But use ADDITIVE not multiplicative to avoid explosion
    """
    # Start with Tesla asymmetric
    tesla_score = tesla_asymmetric_weighting(components)

    # Add harmonic contribution (normalized)
    harmonic = harmonic_resonance(components)
    harmonic_contribution = (harmonic - np.mean(components)) * 0.2  # 20% weight

    # Add collaboration contribution (normalized)
    collab = collaboration_bonus(components)
    collab_contribution = (collab - 0.5) * 0.1  # 10% weight, centered at 0.5

    # Combined score
    combined = tesla_score + harmonic_contribution + collab_contribution

    # Clip to [0, 1.5] to keep reasonable
    return max(0.0, min(1.5, combined))


def analyze_methods():
    """Analyze all three methods"""
    print("="*80)
    print("SONNET 4 ENGINE A - METHOD COMPARISON ANALYSIS")
    print("="*80)
    print("\nGoal: Which method produces scores closest to measured confidence?")
    print("="*80)

    results = {
        'domains': {},
        'summary': {}
    }

    for domain_name, domain_data in TRC_DOMAINS.items():
        components = domain_data['components']
        measured = domain_data['measured_confidence']

        # Calculate scores with each method
        classical = classical_weighting(components)
        tesla = tesla_asymmetric_weighting(components)
        sonnet4 = sonnet4_combined(components)

        # Calculate errors (absolute difference from measured)
        classical_error = abs(classical - measured)
        tesla_error = abs(tesla - measured)
        sonnet4_error = abs(sonnet4 - measured)

        print(f"\n{domain_name}:")
        print(f"  Measured Confidence: {measured:.4f} ({measured*100:.2f}%)")
        print(f"  Classical (mean):    {classical:.4f} (error: {classical_error:.4f})")
        print(f"  Tesla (asymmetric):  {tesla:.4f} (error: {tesla_error:.4f})")
        print(f"  Sonnet 4 (combined): {sonnet4:.4f} (error: {sonnet4_error:.4f})")

        # Which is closest?
        errors = {'Classical': classical_error, 'Tesla': tesla_error, 'Sonnet4': sonnet4_error}
        closest = min(errors.items(), key=lambda x: x[1])
        print(f"  Closest method: {closest[0]} (error: {closest[1]:.4f})")

        results['domains'][domain_name] = {
            'measured': measured,
            'classical': classical,
            'tesla': tesla,
            'sonnet4': sonnet4,
            'classical_error': classical_error,
            'tesla_error': tesla_error,
            'sonnet4_error': sonnet4_error,
            'closest_method': closest[0]
        }

    # Overall statistics
    print(f"\n{'='*80}")
    print("OVERALL STATISTICS")
    print(f"{'='*80}")

    all_measured = [d['measured_confidence'] for d in TRC_DOMAINS.values()]
    all_classical = [results['domains'][d]['classical'] for d in TRC_DOMAINS.keys()]
    all_tesla = [results['domains'][d]['tesla'] for d in TRC_DOMAINS.keys()]
    all_sonnet4 = [results['domains'][d]['sonnet4'] for d in TRC_DOMAINS.keys()]

    # Mean Absolute Error (MAE)
    mae_classical = np.mean([results['domains'][d]['classical_error'] for d in TRC_DOMAINS.keys()])
    mae_tesla = np.mean([results['domains'][d]['tesla_error'] for d in TRC_DOMAINS.keys()])
    mae_sonnet4 = np.mean([results['domains'][d]['sonnet4_error'] for d in TRC_DOMAINS.keys()])

    print(f"\nMean Absolute Error (MAE):")
    print(f"  Classical: {mae_classical:.4f}")
    print(f"  Tesla:     {mae_tesla:.4f}")
    print(f"  Sonnet 4:  {mae_sonnet4:.4f}")

    # Root Mean Squared Error (RMSE)
    rmse_classical = np.sqrt(np.mean([(c - m)**2 for c, m in zip(all_classical, all_measured)]))
    rmse_tesla = np.sqrt(np.mean([(t - m)**2 for t, m in zip(all_tesla, all_measured)]))
    rmse_sonnet4 = np.sqrt(np.mean([(s - m)**2 for s, m in zip(all_sonnet4, all_measured)]))

    print(f"\nRoot Mean Squared Error (RMSE):")
    print(f"  Classical: {rmse_classical:.4f}")
    print(f"  Tesla:     {rmse_tesla:.4f}")
    print(f"  Sonnet 4:  {rmse_sonnet4:.4f}")

    # Correlation with measured values
    corr_classical, p_classical = stats.pearsonr(all_classical, all_measured)
    corr_tesla, p_tesla = stats.pearsonr(all_tesla, all_measured)
    corr_sonnet4, p_sonnet4 = stats.pearsonr(all_sonnet4, all_measured)

    print(f"\nCorrelation with Measured (Pearson r):")
    print(f"  Classical: {corr_classical:.4f} (p={p_classical:.4f})")
    print(f"  Tesla:     {corr_tesla:.4f} (p={p_tesla:.4f})")
    print(f"  Sonnet 4:  {corr_sonnet4:.4f} (p={p_sonnet4:.4f})")

    # Which method wins?
    print(f"\n{'='*80}")
    print("VERDICT")
    print(f"{'='*80}")

    mae_winner = min([('Classical', mae_classical), ('Tesla', mae_tesla), ('Sonnet4', mae_sonnet4)], key=lambda x: x[1])
    rmse_winner = min([('Classical', rmse_classical), ('Tesla', rmse_tesla), ('Sonnet4', rmse_sonnet4)], key=lambda x: x[1])
    corr_winner = max([('Classical', corr_classical), ('Tesla', corr_tesla), ('Sonnet4', corr_sonnet4)], key=lambda x: x[1])

    print(f"\nBest MAE (lowest error):     {mae_winner[0]} ({mae_winner[1]:.4f})")
    print(f"Best RMSE (lowest error):    {rmse_winner[0]} ({rmse_winner[1]:.4f})")
    print(f"Best Correlation (highest):  {corr_winner[0]} ({corr_winner[1]:.4f})")

    # Count wins
    wins = {'Classical': 0, 'Tesla': 0, 'Sonnet4': 0}
    for domain_result in results['domains'].values():
        wins[domain_result['closest_method']] += 1

    print(f"\nDomain-level wins (closest to measured):")
    for method, count in wins.items():
        print(f"  {method}: {count}/3 domains")

    overall_winner = max(wins.items(), key=lambda x: x[1])
    print(f"\nOverall Winner: {overall_winner[0]}")

    # Improvement analysis
    print(f"\n{'='*80}")
    print("IMPROVEMENT ANALYSIS")
    print(f"{'='*80}")

    tesla_vs_classical = ((mae_classical - mae_tesla) / mae_classical * 100) if mae_classical > 0 else 0
    sonnet4_vs_classical = ((mae_classical - mae_sonnet4) / mae_classical * 100) if mae_classical > 0 else 0
    sonnet4_vs_tesla = ((mae_tesla - mae_sonnet4) / mae_tesla * 100) if mae_tesla > 0 else 0

    print(f"\nMAE Improvement:")
    print(f"  Tesla vs Classical: {tesla_vs_classical:+.2f}%")
    print(f"  Sonnet 4 vs Classical: {sonnet4_vs_classical:+.2f}%")
    print(f"  Sonnet 4 vs Tesla: {sonnet4_vs_tesla:+.2f}%")

    # Save results
    results['summary'] = {
        'mae': {'classical': mae_classical, 'tesla': mae_tesla, 'sonnet4': mae_sonnet4},
        'rmse': {'classical': rmse_classical, 'tesla': rmse_tesla, 'sonnet4': rmse_sonnet4},
        'correlation': {'classical': corr_classical, 'tesla': corr_tesla, 'sonnet4': corr_sonnet4},
        'wins': wins,
        'overall_winner': overall_winner[0],
        'improvements': {
            'tesla_vs_classical_pct': tesla_vs_classical,
            'sonnet4_vs_classical_pct': sonnet4_vs_classical,
            'sonnet4_vs_tesla_pct': sonnet4_vs_tesla
        }
    }

    output_path = Path(__file__).parent / "sonnet4_engine_comparison.json"
    with open(output_path, 'w') as f:
        json.dump(results, f, indent=2)

    print(f"\nResults saved to: {output_path}")
    print("="*80)

    return results


if __name__ == "__main__":
    analyze_methods()
