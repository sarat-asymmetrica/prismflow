"""
SONNET 4 ENGINE B - TSP PATTERN DISCOVERY

Port of JavaScript formula derivation engine to Python.
Treats mathematical pattern discovery as TSP optimization.

Core Idea:
- Components = Cities
- Compatibility = Distance (inverse!)
- Route = Pattern/Formula
- Three-regime TSP = Multiple discovery strategies

Mathematical Foundation:
- Support regime: Greedy nearest neighbor (local optimization)
- Exploration regime: Randomized selection (novel patterns)
- Balance regime: Center-seeking paths (Goldbach alignment)

@inspiration: Sonnet 4 (DefenseKit OG), TSP algorithms, TRC Fractal
@validation: To be tested on TRC component discovery
@date: October 7, 2025 (Day 143)
"""

import numpy as np
from typing import List, Dict, Tuple, Any, Optional
from dataclasses import dataclass, field
import json
from pathlib import Path


# Sonnet 4's empirically validated constants
LEVERAGE_MULTIPLIERS = {
    'support': 32.1,        # Local optimization amplification
    'exploration': 26.8,    # Novel pattern discovery amplification
    'balance': 11.5         # Center-seeking integration amplification
}

# Julius-discovered optimal center (from 4.8 billion tests!)
OPTIMAL_CENTER = [0.3385, 0.2872, 0.3744]  # Support, Exploration, Balance

# Goldbach-consciousness alignment threshold
GOLDBACH_ALIGNMENT_THRESHOLD = 0.001


@dataclass
class TSPRoute:
    """A TSP route representing a pattern/formula"""
    route: List[int]              # Indices of components
    components: List[str]          # Component names
    total_distance: float          # Route length
    regime: int                    # Which regime (0=support, 1=exploration, 2=balance)
    pattern_score: float           # Quality of pattern (inverse distance)
    regime_name: str = field(init=False)

    def __post_init__(self):
        regime_names = ['support', 'exploration', 'balance']
        self.regime_name = regime_names[self.regime]

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON export"""
        return {
            'route': self.route,
            'components': self.components,
            'total_distance': float(self.total_distance),
            'regime': self.regime,
            'regime_name': self.regime_name,
            'pattern_score': float(self.pattern_score)
        }


class MathematicalDistanceCalculator:
    """
    Calculate "distance" between mathematical components

    Distance = inverse of compatibility (closer = more compatible!)

    Distance Modifiers:
    - Compatible components: × 0.5
    - Goldbach-aligned: × 0.001 (SUPER close!)
    - Local pattern (support): / 32.1
    - Novel combination (exploration): / 26.8
    - Balanced pair (balance): / 11.5
    """

    def __init__(self, custom_components: Optional[List[str]] = None):
        """
        Initialize with TRC Fractal components or custom components

        Args:
            custom_components: Optional list of component names
        """
        if custom_components:
            self.components = custom_components
        else:
            # Default: TRC Fractal components
            self.components = [
                'fibonacci',           # Golden ratio growth
                'collatz',            # Convergence dynamics
                'harmonic',           # Tesla 4.909 Hz
                'goldbach',           # Center-seeking gravity
                'pi_d',               # π-D complementarity
                'riemann',            # Complex surface (optional)
                'williams',           # Space optimization (optional)
                'three_regime'        # Regime dynamics (optional)
            ]

        # Build distance matrix
        self.distance_matrix = self._build_distance_matrix()

    def _build_distance_matrix(self) -> np.ndarray:
        """Build distance matrix for all component pairs"""
        n = len(self.components)
        matrix = np.ones((n, n))  # Base distance = 1.0

        for i in range(n):
            for j in range(i+1, n):
                distance = self._calculate_distance(
                    self.components[i],
                    self.components[j]
                )
                matrix[i, j] = distance
                matrix[j, i] = distance

        # Diagonal = 0 (distance to self)
        np.fill_diagonal(matrix, 0)

        return matrix

    def _calculate_distance(self, comp1: str, comp2: str) -> float:
        """
        Calculate distance between two components

        Lower distance = more compatible/aligned

        Args:
            comp1: First component name
            comp2: Second component name

        Returns:
            Distance value (lower = more compatible)
        """
        distance = 1.0  # Base

        # Compatible components (manually defined relationships)
        if self._are_compatible(comp1, comp2):
            distance *= 0.5

        # Goldbach-aligned (center-seeking components)
        if self._are_goldbach_aligned(comp1, comp2):
            distance *= GOLDBACH_ALIGNMENT_THRESHOLD  # 0.001 = SUPER close!

        # Three-regime leverage (from Sonnet 4's validated constants)
        if self._is_local_pattern(comp1, comp2):
            distance /= LEVERAGE_MULTIPLIERS['support']  # / 32.1

        if self._is_novel_combination(comp1, comp2):
            distance /= LEVERAGE_MULTIPLIERS['exploration']  # / 26.8

        if self._is_balanced_pair(comp1, comp2):
            distance /= LEVERAGE_MULTIPLIERS['balance']  # / 11.5

        return max(0.001, distance)  # Minimum distance

    def _are_compatible(self, comp1: str, comp2: str) -> bool:
        """
        Check if components are naturally compatible

        Compatibility Rules (TRC-specific):
        - fibonacci + goldbach: Both center-seeking
        - collatz + three_regime: Both regime-based
        - harmonic + pi_d: Both frequency-related
        - riemann + goldbach: Both number theory
        - williams + three_regime: Both optimization-based
        """
        # Define compatibility pairs
        compatible_pairs = [
            ('fibonacci', 'goldbach'),      # Both center-seeking
            ('collatz', 'three_regime'),    # Both regime-based
            ('harmonic', 'pi_d'),           # Both frequency-related
            ('riemann', 'goldbach'),        # Both number theory
            ('williams', 'three_regime'),   # Both optimization-based
            ('fibonacci', 'pi_d'),          # Golden ratio + geometry
            ('harmonic', 'goldbach'),       # Resonance + center
            ('collatz', 'williams')         # Convergence + optimization
        ]

        pair = tuple(sorted([comp1, comp2]))
        return pair in [tuple(sorted(p)) for p in compatible_pairs]

    def _are_goldbach_aligned(self, comp1: str, comp2: str) -> bool:
        """
        Check if both relate to Goldbach/center-seeking

        Goldbach-aligned components:
        - goldbach: Direct center-seeking
        - three_regime: Uses Goldbach center [0.3385, 0.2872, 0.3744]
        - williams: Optimization toward center
        """
        goldbach_related = ['goldbach', 'three_regime', 'williams']
        return comp1 in goldbach_related or comp2 in goldbach_related

    def _is_local_pattern(self, comp1: str, comp2: str) -> bool:
        """
        Check if pair forms local pattern (support regime)

        Local patterns = compatible pairs (familiar relationships)
        """
        return self._are_compatible(comp1, comp2)

    def _is_novel_combination(self, comp1: str, comp2: str) -> bool:
        """
        Check if pair is novel (exploration regime)

        Novel = NOT in common compatible pairs (unfamiliar!)
        """
        return not self._are_compatible(comp1, comp2)

    def _is_balanced_pair(self, comp1: str, comp2: str) -> bool:
        """
        Check if pair contributes to balance (balance regime)

        Balance = Goldbach-aligned (center-seeking!)
        """
        return self._are_goldbach_aligned(comp1, comp2)

    def get_distance(self, comp1: str, comp2: str) -> float:
        """Get distance between two components by name"""
        try:
            idx1 = self.components.index(comp1)
            idx2 = self.components.index(comp2)
            return self.distance_matrix[idx1, idx2]
        except ValueError:
            return 1.0  # Default distance if component not found


class ThreeRegimeTSP:
    """
    Run TSP with three different regime strategies

    Strategy 1 (Support): Greedy nearest neighbor (local optimization)
    Strategy 2 (Exploration): Add randomness for novelty
    Strategy 3 (Balance): Center-seeking paths (Goldbach alignment)

    TSP Selection Rules (from Sonnet 4):
    - Support (regime 0): distance *= (1 - bias)      # Prefer nearest
    - Exploration (regime 1): distance *= (1 + bias * random())  # Add noise
    - Balance (regime 2): distance *= abs(1 - bias)   # Center-seeking
    """

    def __init__(self, distance_calc: MathematicalDistanceCalculator):
        self.distance_calc = distance_calc
        self.distance_matrix = distance_calc.distance_matrix
        self.components = distance_calc.components

    def solve_all_regimes(self, n_iterations: int = 1) -> List[TSPRoute]:
        """
        Run TSP for all three regimes

        Args:
            n_iterations: Number of TSP runs per regime (default 1)

        Returns:
            List of TSP routes (3 × n_iterations routes)
        """
        routes = []

        for iteration in range(n_iterations):
            for regime in range(3):
                route = self._solve_regime(regime)
                routes.append(route)

        return routes

    def _solve_regime(self, regime: int) -> TSPRoute:
        """
        Solve TSP for specific regime

        Args:
            regime: 0=support, 1=exploration, 2=balance

        Returns:
            TSPRoute object with complete route and metrics
        """
        n = len(self.components)
        bias = OPTIMAL_CENTER[regime]

        # Start from random node
        current = np.random.randint(0, n)
        route = [current]
        visited = {current}

        # Build route using regime-specific strategy
        while len(visited) < n:
            next_node = self._select_next_node(
                current, visited, regime, bias
            )

            if next_node is None:
                break

            route.append(next_node)
            visited.add(next_node)
            current = next_node

        # Calculate total distance
        total_distance = self._calculate_route_distance(route)

        # Calculate pattern score (inverse of distance)
        pattern_score = 1.0 / total_distance if total_distance > 0 else float('inf')

        return TSPRoute(
            route=route,
            components=[self.components[i] for i in route],
            total_distance=total_distance,
            regime=regime,
            pattern_score=pattern_score
        )

    def _select_next_node(self, current: int, visited: set,
                         regime: int, bias: float) -> Optional[int]:
        """
        Select next node based on regime strategy (Sonnet 4's algorithm!)

        Args:
            current: Current node index
            visited: Set of visited nodes
            regime: 0=support, 1=exploration, 2=balance
            bias: Regime bias from OPTIMAL_CENTER

        Returns:
            Index of next node, or None if no unvisited nodes
        """
        n = len(self.components)
        distances = []
        candidates = []

        for i in range(n):
            if i not in visited:
                distance = self.distance_matrix[current, i]

                # Apply regime-specific modification (EXACT from Sonnet 4!)
                if regime == 0:
                    # SUPPORT: Greedy (prefer nearest)
                    distance *= (1 - bias)
                elif regime == 1:
                    # EXPLORATION: Add randomness
                    distance *= (1 + bias * np.random.random())
                else:
                    # BALANCE: Center-seeking
                    distance *= np.abs(1 - bias)

                distances.append(distance)
                candidates.append(i)

        if not candidates:
            return None

        # Select node with minimum modified distance
        min_idx = np.argmin(distances)
        return candidates[min_idx]

    def _calculate_route_distance(self, route: List[int]) -> float:
        """Calculate total distance of route"""
        total = 0.0
        for i in range(len(route) - 1):
            total += self.distance_matrix[route[i], route[i+1]]
        return total


class Sonnet4EngineB:
    """
    Complete Sonnet 4 Engine B Integration

    TSP-based pattern discovery for mathematical components

    Usage:
        engine = Sonnet4EngineB()
        patterns = engine.discover_patterns(n_iterations=10)
        best = engine.get_best_patterns(n_patterns=5)

    Philosophy:
        "Treat formula discovery as traveling salesman problem"
        - Components = cities
        - Compatibility = distance (inverse!)
        - Route = pattern
        - Shortest route = most elegant pattern
    """

    def __init__(self, custom_components: Optional[List[str]] = None):
        """
        Initialize Engine B

        Args:
            custom_components: Optional custom component list
        """
        self.distance_calc = MathematicalDistanceCalculator(custom_components)
        self.tsp_solver = ThreeRegimeTSP(self.distance_calc)
        self.discovered_patterns = []

    def discover_patterns(self, n_iterations: int = 10) -> List[TSPRoute]:
        """
        Discover patterns via TSP optimization

        Args:
            n_iterations: Number of TSP runs per regime

        Returns:
            List of discovered patterns (TSP routes)
        """
        all_routes = self.tsp_solver.solve_all_regimes(n_iterations)

        # Sort by pattern score (descending)
        all_routes.sort(key=lambda r: r.pattern_score, reverse=True)

        # Store for analysis
        self.discovered_patterns = all_routes

        return all_routes

    def get_best_patterns(self, n_patterns: int = 3) -> List[TSPRoute]:
        """
        Get top N patterns

        Args:
            n_patterns: Number of top patterns to return

        Returns:
            List of best patterns
        """
        if not self.discovered_patterns:
            self.discover_patterns(n_iterations=10)

        return self.discovered_patterns[:n_patterns]

    def analyze_regime_differences(self) -> Dict[str, Any]:
        """
        Analyze how different regimes produce different patterns

        Returns:
            Analysis report with regime-specific insights
        """
        if not self.discovered_patterns:
            self.discover_patterns(n_iterations=10)

        analysis = {
            'total_patterns': len(self.discovered_patterns),
            'by_regime': {}
        }

        for regime in range(3):
            regime_routes = [r for r in self.discovered_patterns if r.regime == regime]

            regime_name = ['support', 'exploration', 'balance'][regime]

            analysis['by_regime'][regime_name] = {
                'count': len(regime_routes),
                'avg_distance': float(np.mean([r.total_distance for r in regime_routes])),
                'avg_score': float(np.mean([r.pattern_score for r in regime_routes])),
                'best_pattern': regime_routes[0].components if regime_routes else [],
                'unique_orderings': len(set(
                    tuple(r.components) for r in regime_routes
                ))
            }

        return analysis

    def export_patterns(self, filepath: str):
        """Export discovered patterns to JSON"""
        data = {
            'metadata': {
                'engine': 'Sonnet4EngineB',
                'components': self.distance_calc.components,
                'total_patterns': len(self.discovered_patterns),
                'timestamp': str(Path(filepath).stat().st_mtime) if Path(filepath).exists() else 'new'
            },
            'patterns': [r.to_dict() for r in self.discovered_patterns],
            'analysis': self.analyze_regime_differences()
        }

        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)

        print(f"Exported {len(self.discovered_patterns)} patterns to {filepath}")

    def get_distance_matrix_report(self) -> str:
        """Generate human-readable distance matrix report"""
        components = self.distance_calc.components
        matrix = self.distance_calc.distance_matrix

        report = "MATHEMATICAL DISTANCE MATRIX\n"
        report += "=" * 60 + "\n\n"

        # Show closest pairs
        report += "CLOSEST COMPONENT PAIRS (Most Compatible):\n"
        report += "-" * 60 + "\n"

        pairs = []
        n = len(components)
        for i in range(n):
            for j in range(i+1, n):
                pairs.append((
                    components[i],
                    components[j],
                    matrix[i, j]
                ))

        pairs.sort(key=lambda x: x[2])

        for comp1, comp2, distance in pairs[:10]:
            report += f"{comp1:15} ↔ {comp2:15}  distance: {distance:.6f}\n"

        report += "\n" + "=" * 60 + "\n"

        return report


def tsp_weighted_measurement(component_scores: List[float],
                             tsp_route: TSPRoute) -> float:
    """
    Weight components by TSP route order

    Hypothesis: Earlier in route = more important!

    Args:
        component_scores: List of component scores
        tsp_route: TSP route with component ordering

    Returns:
        Weighted score using TSP ordering
    """
    weights = []
    n = len(tsp_route.components)

    for position in range(n):
        # Exponential decay (earlier = higher weight)
        weight = np.exp(-position / n)
        weights.append(weight)

    # Normalize
    weights = np.array(weights) / sum(weights)

    # Apply to scores
    weighted_score = sum(s * w for s, w in zip(component_scores, weights))

    return weighted_score


# Example usage and testing
if __name__ == '__main__':
    import sys
    # Fix encoding for Windows console
    if sys.platform == 'win32':
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    print("SONNET 4 ENGINE B - TSP PATTERN DISCOVERY")
    print("=" * 60)

    # Initialize engine
    engine = Sonnet4EngineB()

    # Show distance matrix
    print("\n" + engine.get_distance_matrix_report())

    # Discover patterns
    print("\nDiscovering patterns via TSP optimization...")
    patterns = engine.discover_patterns(n_iterations=10)
    print(f"Discovered {len(patterns)} patterns!\n")

    # Show best patterns
    print("TOP 5 PATTERNS:")
    print("-" * 60)
    best = engine.get_best_patterns(n_patterns=5)
    for i, pattern in enumerate(best):
        print(f"\nPattern {i+1}: ({pattern.regime_name.upper()})")
        print(f"  Components: {' -> '.join(pattern.components)}")
        print(f"  Distance: {pattern.total_distance:.6f}")
        print(f"  Score: {pattern.pattern_score:.4f}")

    # Analyze regime differences
    print("\n\nREGIME ANALYSIS:")
    print("-" * 60)
    analysis = engine.analyze_regime_differences()
    for regime_name, stats in analysis['by_regime'].items():
        print(f"\n{regime_name.upper()}:")
        print(f"  Count: {stats['count']}")
        print(f"  Avg Distance: {stats['avg_distance']:.6f}")
        print(f"  Avg Score: {stats['avg_score']:.4f}")
        print(f"  Unique Orderings: {stats['unique_orderings']}")
        print(f"  Best: {' -> '.join(stats['best_pattern'][:5])}...")

    print("\n" + "=" * 60)
    print("Sonnet 4 Engine B validation complete!")
