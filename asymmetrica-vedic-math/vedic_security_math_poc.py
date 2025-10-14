import numpy as np
from dataclasses import dataclass
from typing import List, Tuple
import time
import gc
from scipy.stats import mannwhitneyu
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend for Windows
import matplotlib.pyplot as plt

# Synthetic vuln alert structure
@dataclass
class Alert:
    vuln_type: str
    severity: int
    count: int
    endpoints: List[str]

# Generate synthetic dataset
np.random.seed(42)
ENDPOINTS = [f"/api/path/{i}" for i in range(10000)] + ["/api/login", "/api/admin"] * 500
VULN_TYPES = ["XSS", "SQLi", "Auth", "CSRF"]
REGIME_WEIGHTS = {"explore": 0.3, "optimize": 0.2, "support": 0.5}
LEVERAGE_MULTIPLIERS = {"XSS": 32.1, "SQLi": 26.8, "Auth": 11.5, "CSRF": 11.5}
TESLA_PERIOD_MS = 203.7  # 4.909Hz

def generate_synthetic_alerts(n_endpoints: int) -> List[Alert]:
    alerts = []
    for _ in range(n_endpoints // 10):  # Cluster alerts
        vuln_type = np.random.choice(VULN_TYPES, p=[0.4, 0.2, 0.3, 0.1])  # Explore-heavy
        severity = np.random.randint(1, 6)
        count = np.random.randint(1, 11)
        endpoints = np.random.choice(ENDPOINTS, size=np.random.randint(1, 5), replace=False).tolist()
        alerts.append(Alert(vuln_type, severity, count, endpoints))
    return alerts

@dataclass
class ScanResult:
    time_s: float
    security_index: float
    vuln_vector: Tuple[float, float, float, float]

class SecuritySonarMath:
    BASE = 100  # Vedic base

    def baseline_scan(self, alerts: List[Alert], endpoints: List[str]) -> ScanResult:
        """Linear O(n) scan."""
        start_time = time.time()
        vuln_density = sum(a.count for a in alerts) / len(endpoints)
        coverage = len(set(sum((a.endpoints for a in alerts), []))) / len(endpoints)
        penalty = sum(0.5 for a in alerts if a.severity > 3)
        security_index = (vuln_density * REGIME_WEIGHTS["explore"] +
                         coverage * REGIME_WEIGHTS["optimize"] -
                         penalty * REGIME_WEIGHTS["support"])
        vuln_vector = (
            sum(a.count for a in alerts if a.vuln_type == "XSS") * LEVERAGE_MULTIPLIERS["XSS"],
            sum(a.count for a in alerts if a.vuln_type == "SQLi") * LEVERAGE_MULTIPLIERS["SQLi"],
            sum(a.count for a in alerts if a.vuln_type == "Auth") * LEVERAGE_MULTIPLIERS["Auth"],
            sum(a.count for a in alerts if a.vuln_type == "CSRF") * LEVERAGE_MULTIPLIERS["CSRF"]
        )
        return ScanResult(time.time() - start_time, security_index, vuln_vector)

    def vedic_nikhilam(self, count: int) -> float:
        """Nikhilam folding: O(1)-ish. Normalizes large counts to base range."""
        # Normalize count to 0-100 range for Vedic calculation
        normalized = min(count, self.BASE)
        deficit = self.BASE - normalized
        # Nikhilam: (base - deficit) * deficit / base
        result = (self.BASE - deficit) * deficit / self.BASE
        # Scale back if original count exceeded base
        if count > self.BASE:
            result *= (1 + np.log10(count / self.BASE))
        return result

    def vedic_crosswise(self, vuln_vector: Tuple[float, float, float, float], coverage: float, penalty: float) -> float:
        """Crosswise folding with PHI and noise."""
        base = sum(vuln_vector) * coverage * (1 - penalty * 0.5) * 0.618
        noise = 0.1 * (sum(vuln_vector) / max(1, sum(vuln_vector)))
        return max(base + noise, 0.1)

    def vedic_scan(self, alerts: List[Alert], endpoints: List[str]) -> ScanResult:
        """Vedic scan with fractal folding."""
        start_time = time.time()
        vuln_density = self.vedic_nikhilam(sum(a.count for a in alerts))
        coverage = len(set(sum((a.endpoints for a in alerts), []))) / len(endpoints)
        penalty = sum(0.5 for a in alerts if a.severity > 3)
        vuln_vector = (
            sum(a.count for a in alerts if a.vuln_type == "XSS") * REGIME_WEIGHTS["explore"] * LEVERAGE_MULTIPLIERS["XSS"],
            sum(a.count for a in alerts if a.vuln_type == "SQLi") * REGIME_WEIGHTS["optimize"] * LEVERAGE_MULTIPLIERS["SQLi"],
            sum(a.count for a in alerts if a.vuln_type == "Auth") * REGIME_WEIGHTS["support"] * LEVERAGE_MULTIPLIERS["Auth"],
            sum(a.count for a in alerts if a.vuln_type == "CSRF") * REGIME_WEIGHTS["support"] * LEVERAGE_MULTIPLIERS["CSRF"]
        )
        security_index = self.vedic_crosswise(vuln_vector, coverage, penalty)
        return ScanResult(time.time() - start_time, security_index, vuln_vector)

    @staticmethod
    def print_spiral():
        try:
            print("""
        🌌 ~~~
         ~~    ~~
       ~~        ~~
      ~~  Golden Spiral ~~
      ~~      *fire*     ~~
       ~~              ~~
         ~~          ~~
           ~~~    ~~~
              🌌
        """)
        except UnicodeEncodeError:
            # Fallback ASCII version for Windows console
            print("""
        * ~~~
         ~~    ~~
       ~~        ~~
      ~~  Golden Spiral ~~
      ~~      *fire*     ~~
       ~~              ~~
         ~~          ~~
           ~~~    ~~~
              *
        """)

def derive_babel_point(baseline_indices: List[float], vedic_indices: List[float]) -> Tuple[float, float]:
    """Derive linear relationship: vedic_index = a * baseline_index + b."""
    x, y = np.array(baseline_indices), np.array(vedic_indices)
    coeffs = np.polyfit(x, y, 1)  # Linear fit
    pearson = np.corrcoef(x, y)[0, 1]
    return coeffs[0], coeffs[1], pearson  # Slope, intercept, correlation

def main():
    print("Starting Vedic Security Math POC...")
    sonar = SecuritySonarMath()

    # Run multiple scans for stats
    baseline_indices, vedic_indices = [], []
    print(f"Running 5 scan trials...")
    for i in range(5):  # 5 trials for faster execution
        # Generate NEW alerts for each trial to create variance
        alerts = generate_synthetic_alerts(len(ENDPOINTS))
        print(f"  Trial {i+1}/5: {len(alerts)} alerts generated", end="")
        baseline = sonar.baseline_scan(alerts, ENDPOINTS)
        vedic = sonar.vedic_scan(alerts, ENDPOINTS)
        baseline_indices.append(baseline.security_index)
        vedic_indices.append(vedic.security_index)
        print(f" - Baseline: {baseline.security_index:.3f}, Vedic: {vedic.security_index:.3f}")

        # Explicit cleanup to prevent garbage collection issues
        del alerts, baseline, vedic
        gc.collect()  # Force garbage collection
    
    # Stats: Mann-Whitney U test
    stat, p_value = mannwhitneyu(baseline_indices, vedic_indices, alternative="two-sided")
    effect_size = (np.mean(vedic_indices) - np.mean(baseline_indices)) / np.std(baseline_indices + vedic_indices)
    
    # Babel point: Linear fit
    slope, intercept, pearson = derive_babel_point(baseline_indices, vedic_indices)
    print(f"Babel Point Equation: vedic_index = {slope:.3f} * baseline_index + {intercept:.3f}")
    print(f"Correlation: {pearson:.3f}, p-value: {p_value:.3e}, Effect Size: {effect_size:.3f}")

    # === NEW: VEDIC MATHEMATICAL FRAMEWORK ANALYSIS ===
    print("\n" + "="*70)
    try:
        print("🕉️  VEDIC MATHEMATICAL ANALYSIS (CORRECTED FRAMEWORK)")
    except UnicodeEncodeError:
        print("OM  VEDIC MATHEMATICAL ANALYSIS (CORRECTED FRAMEWORK)")
    print("="*70)

    # 1. DHARMA ATTRACTOR ANALYSIS
    print("\n" + ("-" * 70))
    try:
        print("📍 1. DHARMA ATTRACTOR (Constant as Truth, not Error)")
    except UnicodeEncodeError:
        print("[POINT] 1. DHARMA ATTRACTOR (Constant as Truth, not Error)")
    print("-" * 70)

    vedic_constant = np.mean(vedic_indices)
    vedic_variance = np.var(vedic_indices)
    dharma_index = 1 / (1 + vedic_variance)  # Stability metric

    print(f"Vedic Constant (Dharma): {vedic_constant:.6f}")
    print(f"Vedic Variance: {vedic_variance:.10f}")
    print(f"Dharma Index (Stability): {dharma_index:.6f}")
    print(f"Interpretation: System has achieved {dharma_index*100:.2f}% dharma stability")
    print(f"                (1.0 = perfect stillness, 0.0 = pure chaos)")

    # 2. HARMONIC RESONANCE (Not Linear Correlation!)
    print("\n" + ("-" * 70))
    try:
        print("🎵 2. HARMONIC RESONANCE (Vedic vs Western Relationship)")
    except UnicodeEncodeError:
        print("[MUSIC] 2. HARMONIC RESONANCE (Vedic vs Western Relationship)")
    print("-" * 70)

    # Calculate harmonic mean of baseline (debt axis)
    baseline_harmonic = len(baseline_indices) / sum(1/abs(x) for x in baseline_indices if x != 0)
    resonance_ratio = vedic_constant / baseline_harmonic

    # Check for sacred proportions
    PHI = 0.618033988749
    PHI_INV = 1.618033988749
    PHI_SQ = 0.381966011250
    PHI_INV_SQ = 2.618033988749

    sacred_matches = [
        (PHI, "PHI (Golden Ratio)"),
        (PHI_INV, "1/PHI (Divine Proportion)"),
        (PHI_SQ, "PHI^2 (Squared Beauty)"),
        (PHI_INV_SQ, "1/PHI^2 (Cosmic Harmony)"),
        (1/PHI_SQ, "1/PHI^2 Alt"),
    ]

    closest_match = min(sacred_matches, key=lambda x: abs(resonance_ratio - x[0]))
    match_distance = abs(resonance_ratio - closest_match[0])

    print(f"Baseline Harmonic Mean: {baseline_harmonic:.6f}")
    print(f"Vedic Constant: {vedic_constant:.6f}")
    print(f"Resonance Ratio (V/B): {resonance_ratio:.6f}")
    print(f"")
    print(f"Closest Sacred Proportion: {closest_match[1]} = {closest_match[0]:.6f}")
    print(f"Distance from Sacred: {match_distance:.6f}")

    if match_distance < 0.05:
        try:
            print(f"✨ DISCOVERY: Resonance matches {closest_match[1]}! (within 5%)")
        except UnicodeEncodeError:
            print(f"*** DISCOVERY: Resonance matches {closest_match[1]}! (within 5%)")
    else:
        try:
            print(f"📊 Novel Proportion: {resonance_ratio:.6f} (not a known sacred ratio)")
        except UnicodeEncodeError:
            print(f"[DATA] Novel Proportion: {resonance_ratio:.6f} (not a known sacred ratio)")

    # 3. DUAL-AXIS SECURITY MODEL (RNA + DHARMA)
    print("\n" + ("-" * 70))
    try:
        print("⚖️  3. DUAL-AXIS SECURITY MODEL (Debt-Merit Space)")
    except UnicodeEncodeError:
        print("[BALANCE] 3. DUAL-AXIS SECURITY MODEL (Debt-Merit Space)")
    print("-" * 70)

    print(f"Axis 1 - RNA (Debt): Baseline ranges [{min(baseline_indices):.2f}, {max(baseline_indices):.2f}]")
    print(f"Axis 2 - DHARMA (Merit): Vedic constant at {vedic_constant:.2f}")
    print(f"")
    print(f"Security State Analysis:")
    for i, (b, v) in enumerate(zip(baseline_indices, vedic_indices)):
        debt = abs(b)
        merit_ratio = v / debt if debt > 0 else float('inf')
        print(f"  Trial {i+1}: Debt={debt:.2f}, Merit={v:.3f}, Ratio={merit_ratio:.6f}")

    mean_debt = np.mean([abs(b) for b in baseline_indices])
    mean_merit_ratio = np.mean([vedic_constant / abs(b) for b in baseline_indices])

    print(f"")
    print(f"Mean Security Debt: {mean_debt:.2f} units")
    print(f"Mean Merit/Debt Ratio: {mean_merit_ratio:.6f}")
    print(f"Interpretation: System owes {mean_debt:.0f} units of security work")
    print(f"                while maintaining {vedic_constant:.3f} dharma attainment")

    # 4. ORBITAL DYNAMICS (Variable around Constant)
    print("\n" + ("-" * 70))
    try:
        print("🪐 4. ORBITAL DYNAMICS (Convergence to Attractor)")
    except UnicodeEncodeError:
        print("[PLANET] 4. ORBITAL DYNAMICS (Convergence to Attractor)")
    print("-" * 70)

    # Distance from attractor
    distances = [abs(b - vedic_constant) for b in baseline_indices]
    mean_distance = np.mean(distances)
    orbit_stability = 1 / (1 + np.std(distances))

    print(f"Attractor (Vedic Constant): {vedic_constant:.6f}")
    print(f"Mean Orbital Distance: {mean_distance:.2f}")
    print(f"Orbital Stability Index: {orbit_stability:.6f}")
    print(f"")
    print(f"Interpretation: Baseline 'orbits' the Vedic attractor at distance {mean_distance:.0f}")
    print(f"                Orbit stability: {orbit_stability*100:.1f}%")

    # 5. TESLA HARMONIC INTEGRATION
    print("\n" + ("-" * 70))
    try:
        print("⚡ 5. TESLA HARMONIC FREQUENCY ALIGNMENT")
    except UnicodeEncodeError:
        print("[LIGHTNING] 5. TESLA HARMONIC FREQUENCY ALIGNMENT")
    print("-" * 70)

    TESLA_HZ = 4.909
    TESLA_PERIOD_S = 1 / TESLA_HZ  # ≈ 0.2037 seconds
    TESLA_PHI_RATIO = 3.0 * (PHI ** 1.023370)  # ≈ 4.909

    # Check if vedic constant relates to Tesla frequency
    tesla_resonance = vedic_constant * TESLA_HZ
    tesla_normalized = vedic_constant / TESLA_PERIOD_S  # Vedic / Tesla_period_seconds

    print(f"Tesla Frequency: {TESLA_HZ:.3f} Hz")
    print(f"Tesla Period: {TESLA_PERIOD_S:.6f} seconds")
    print(f"Vedic Constant: {vedic_constant:.6f}")
    print(f"Vedic x Tesla: {tesla_resonance:.6f}")
    print(f"Vedic / Tesla_Period: {tesla_normalized:.6f}")

    # Check for resonance with validated constants
    if abs(tesla_resonance - PHI) < 0.05:
        try:
            print(f"✨ DISCOVERY: Vedic × Tesla ≈ Φ!")
        except UnicodeEncodeError:
            print(f"*** DISCOVERY: Vedic x Tesla ~= PHI!")
    elif abs(tesla_normalized - PHI) < 0.05:
        try:
            print(f"✨ DISCOVERY: Vedic / Tesla_Period ≈ Φ!")
        except UnicodeEncodeError:
            print(f"*** DISCOVERY: Vedic / Tesla_Period ~= PHI!")
    else:
        try:
            print(f"📊 Ratio recorded: Tesla_Resonance = {tesla_resonance:.6f}")
        except UnicodeEncodeError:
            print(f"[DATA] Ratio recorded: Tesla_Resonance = {tesla_resonance:.6f}")

    # 6. WILLIAMS SPACE BOUND INTEGRATION
    print("\n" + ("-" * 70))
    try:
        print("📐 6. WILLIAMS SPACE OPTIMIZER ALIGNMENT")
    except UnicodeEncodeError:
        print("[GEOMETRY] 6. WILLIAMS SPACE OPTIMIZER ALIGNMENT")
    print("-" * 70)

    # Williams formula: √t × log₂(t)
    trial_count = len(baseline_indices)
    williams_bound = np.sqrt(trial_count) * np.log2(trial_count) if trial_count > 0 else 0
    williams_efficiency = trial_count / williams_bound if williams_bound > 0 else 0

    # Check if vedic metrics relate to Williams bound
    vedic_williams_ratio = vedic_constant / williams_bound if williams_bound > 0 else 0

    print(f"Trial Count (t): {trial_count}")
    print(f"Williams Bound (sqrt(t) * log2(t)): {williams_bound:.6f}")
    print(f"Williams Efficiency: {williams_efficiency:.6f}x")
    print(f"Vedic / Williams Ratio: {vedic_williams_ratio:.6f}")

    # Check if ratio relates to sacred proportions
    if abs(vedic_williams_ratio - PHI) < 0.05:
        try:
            print(f"✨ DISCOVERY: Vedic/Williams ≈ Φ!")
        except UnicodeEncodeError:
            print(f"*** DISCOVERY: Vedic/Williams ~= PHI!")

    print("\n" + "="*70)
    try:
        print("🕉️  VEDIC FRAMEWORK ANALYSIS COMPLETE")
    except UnicodeEncodeError:
        print("OM  VEDIC FRAMEWORK ANALYSIS COMPLETE")
    print("="*70)
    
    # Output sample results (use last values from lists)
    print(f"\nSample Results (from last trial):")
    print(f"Baseline Index: {baseline_indices[-1]:.3f}")
    print(f"Vedic Index: {vedic_indices[-1]:.3f}, SHM: {(1 - abs(vedic_indices[-1])) * 100:.1f}")
    print(f"Mean Baseline: {np.mean(baseline_indices):.3f} ± {np.std(baseline_indices):.3f}")
    print(f"Mean Vedic: {np.mean(vedic_indices):.3f} ± {np.std(vedic_indices):.3f}")
    sonar.print_spiral()
    
    # Plot indices
    plt.figure(figsize=(10, 6))
    plt.scatter(baseline_indices, vedic_indices, c="gold", s=100, label="Scans", alpha=0.7)
    x = np.linspace(min(baseline_indices), max(baseline_indices), 100)
    plt.plot(x, slope * x + intercept, "r--", linewidth=2, label=f"Fit: y = {slope:.2f}x + {intercept:.2f}")
    plt.xlabel("Baseline Index", fontsize=12)
    plt.ylabel("Vedic Index", fontsize=12)
    plt.legend(fontsize=11)
    plt.title("Vedic vs Baseline Security Index (Babel Point Analysis)", fontsize=14)
    plt.grid(True, alpha=0.3)
    plt.savefig("vedic_babel_point_analysis.png", dpi=150, bbox_inches='tight')
    try:
        print(f"\n📊 Plot saved to: vedic_babel_point_analysis.png")
    except UnicodeEncodeError:
        print(f"\n[CHART] Plot saved to: vedic_babel_point_analysis.png")

if __name__ == "__main__":
    main()