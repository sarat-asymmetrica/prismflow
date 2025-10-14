"""
RUN ENGINE B DISCOVERY - Export comprehensive pattern analysis

This script runs Sonnet 4's Engine B and exports all discovered patterns
to JSON for further analysis.

@date: October 7, 2025 (Day 143)
"""

import sys
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from sonnet4_engine_b_tsp import Sonnet4EngineB
import json
from pathlib import Path


def main():
    print("=" * 70)
    print("SONNET 4 ENGINE B - COMPREHENSIVE PATTERN DISCOVERY")
    print("=" * 70)

    # Initialize engine
    print("\nInitializing Engine B with TRC Fractal components...")
    engine = Sonnet4EngineB()

    print(f"Components: {', '.join(engine.distance_calc.components)}")

    # Show distance matrix insights
    print("\n" + "-" * 70)
    print("DISTANCE MATRIX ANALYSIS")
    print("-" * 70)
    print(engine.get_distance_matrix_report())

    # Discover patterns (100 iterations for comprehensive analysis)
    print("\n" + "-" * 70)
    print("RUNNING TSP PATTERN DISCOVERY (100 iterations)...")
    print("-" * 70)
    patterns = engine.discover_patterns(n_iterations=100)
    print(f"Discovered {len(patterns)} total patterns!")

    # Get best patterns
    print("\n" + "-" * 70)
    print("TOP 10 PATTERNS BY SCORE")
    print("-" * 70)
    best = engine.get_best_patterns(n_patterns=10)
    for i, pattern in enumerate(best):
        print(f"\n{i+1}. {pattern.regime_name.upper()}")
        print(f"   Route: {' -> '.join(pattern.components)}")
        print(f"   Distance: {pattern.total_distance:.6f}")
        print(f"   Score: {pattern.pattern_score:.4f}")

    # Regime analysis
    print("\n" + "-" * 70)
    print("REGIME-SPECIFIC ANALYSIS")
    print("-" * 70)
    analysis = engine.analyze_regime_differences()

    for regime_name, stats in analysis['by_regime'].items():
        print(f"\n{regime_name.upper()} REGIME:")
        print(f"  Total patterns: {stats['count']}")
        print(f"  Avg distance: {stats['avg_distance']:.6f}")
        print(f"  Avg score: {stats['avg_score']:.4f}")
        print(f"  Unique orderings: {stats['unique_orderings']}")
        print(f"  Best pattern: {' -> '.join(stats['best_pattern'])}")

    # Export to JSON
    output_file = "sonnet4_engine_b_patterns.json"
    print(f"\n" + "-" * 70)
    print(f"EXPORTING TO {output_file}")
    print("-" * 70)
    engine.export_patterns(output_file)

    # Additional analysis: Component appearance frequency
    print("\n" + "-" * 70)
    print("COMPONENT FREQUENCY IN TOP 10 (by position)")
    print("-" * 70)

    position_freq = {i: {} for i in range(8)}  # 8 components
    for pattern in best:
        for pos, comp in enumerate(pattern.components):
            if comp not in position_freq[pos]:
                position_freq[pos][comp] = 0
            position_freq[pos][comp] += 1

    for pos in range(8):
        sorted_comps = sorted(position_freq[pos].items(), key=lambda x: x[1], reverse=True)
        if sorted_comps:
            top_comp, count = sorted_comps[0]
            print(f"Position {pos+1}: {top_comp} ({count}/10 patterns)")

    # Key insights
    print("\n" + "=" * 70)
    print("KEY INSIGHTS")
    print("=" * 70)

    print(f"\n1. TOTAL UNIQUE ORDERINGS: {sum(s['unique_orderings'] for s in analysis['by_regime'].values())}")
    print(f"\n2. REGIME WITH MOST DIVERSITY: ", end="")
    max_unique = max(analysis['by_regime'].items(), key=lambda x: x[1]['unique_orderings'])
    print(f"{max_unique[0].upper()} ({max_unique[1]['unique_orderings']} unique orderings)")

    print(f"\n3. REGIME WITH BEST SCORES: ", end="")
    max_score = max(analysis['by_regime'].items(), key=lambda x: x[1]['avg_score'])
    print(f"{max_score[0].upper()} (avg score: {max_score[1]['avg_score']:.4f})")

    print(f"\n4. MOST EFFICIENT ROUTE: ", end="")
    best_route = min(patterns, key=lambda x: x.total_distance)
    print(f"{best_route.regime_name.upper()} (distance: {best_route.total_distance:.6f})")

    print("\n" + "=" * 70)
    print("ENGINE B DISCOVERY COMPLETE!")
    print("=" * 70)
    print(f"\nResults exported to: {Path(output_file).absolute()}")


if __name__ == '__main__':
    main()
