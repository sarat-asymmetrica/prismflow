import numpy as np
from dataclasses import dataclass
from typing import List, Tuple
import time
from scipy.stats import mannwhitneyu
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend for Windows
import matplotlib.pyplot as plt
from qiskit import QuantumCircuit
from qiskit_aer import Aer

# Synthetic vuln alert structure
@dataclass
class Alert:
    vuln_type: str
    severity: int
    count: int
    endpoints: List[str]

# Config
np.random.seed(42)
ENDPOINTS = [f"/api/path/{i}" for i in range(10000)] + ["/api/login", "/api/admin"] * 500
VULN_TYPES = ["XSS", "SQLi", "Auth", "CSRF"]
REGIME_WEIGHTS = {"explore": 0.3, "optimize": 0.2, "support": 0.5}
LEVERAGE_MULTIPLIERS = {"XSS": 32.1, "SQLi": 26.8, "Auth": 11.5, "CSRF": 11.5}
TESLA_PERIOD_MS = 203.7  # 4.909Hz

def generate_synthetic_alerts(n_endpoints: int) -> List[Alert]:
    alerts = []
    for _ in range(n_endpoints // 50):  # Dense, realistic alerts
        vuln_type = np.random.choice(VULN_TYPES, p=[0.4, 0.2, 0.3, 0.1])
        severity = np.random.randint(2, 5)  # Narrowed
        count = np.random.randint(1, 5)  # Capped
        endpoints = np.random.choice(ENDPOINTS, size=np.random.randint(1, 3), replace=False).tolist()
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
        penalty = min(sum(0.5 for a in alerts if a.severity > 3), 10.0)  # Cap penalty
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
        """Nikhilam folding: O(1)-ish."""
        deficit = self.BASE - count
        return (self.BASE - deficit) * deficit / self.BASE

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
        penalty = min(sum(0.5 for a in alerts if a.severity > 3), 10.0)
        vuln_vector = (
            sum(a.count for a in alerts if a.vuln_type == "XSS") * REGIME_WEIGHTS["explore"] * LEVERAGE_MULTIPLIERS["XSS"],
            sum(a.count for a in alerts if a.vuln_type == "SQLi") * REGIME_WEIGHTS["optimize"] * LEVERAGE_MULTIPLIERS["SQLi"],
            sum(a.count for a in alerts if a.vuln_type == "Auth") * REGIME_WEIGHTS["support"] * LEVERAGE_MULTIPLIERS["Auth"],
            sum(a.count for a in alerts if a.vuln_type == "CSRF") * REGIME_WEIGHTS["support"] * LEVERAGE_MULTIPLIERS["CSRF"]
        )
        security_index = self.vedic_crosswise(vuln_vector, coverage, penalty)
        return ScanResult(time.time() - start_time, security_index, vuln_vector)

    def quantum_nikhilam_circuit(self, counts: List[int]) -> QuantumCircuit:
        """Quantum Nikhilam phase folding."""
        n_qubits = 4  # For XSS, SQLi, Auth, CSRF
        qc = QuantumCircuit(n_qubits)
        for i, count in enumerate(counts[:n_qubits]):
            deficit = self.BASE - count
            phase = (self.BASE - deficit) * deficit / self.BASE * 2 * np.pi / self.BASE
            qc.rz(phase, i)  # Phase rotation per vuln
        return qc

    def quantum_linear_circuit(self, counts: List[int]) -> QuantumCircuit:
        """Linear summation as QFT-like circuit."""
        n_qubits = 4
        qc = QuantumCircuit(n_qubits)
        for i, count in enumerate(counts[:n_qubits]):
            qc.h(i)  # Hadamard for superposition
            qc.rz(count * 2 * np.pi / self.BASE, i)  # Linear phase
        return qc

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

def derive_babel_point(baseline_indices: List[float], vedic_indices: List[float]) -> Tuple[float, float, float]:
    """Derive linear relationship: vedic_index = a * baseline_index + b."""
    x, y = np.array(baseline_indices), np.array(vedic_indices)
    if np.std(x) < 1e-6 or np.std(y) < 1e-6:  # Avoid low variance
        return 0.0, 0.1, 0.0
    coeffs = np.polyfit(x, y, 1)
    pearson = np.corrcoef(x, y)[0, 1] if np.std(x) > 1e-6 and np.std(y) > 1e-6 else 0.0
    return coeffs[0], coeffs[1], pearson

def main():
    sonar = SecuritySonarMath()
    alerts = generate_synthetic_alerts(len(ENDPOINTS))
    
    # Classical scans
    baseline_indices, vedic_indices = [], []
    for _ in range(10):  # 10 trials
        baseline = sonar.baseline_scan(alerts, ENDPOINTS)
        vedic = sonar.vedic_scan(alerts, ENDPOINTS)
        baseline_indices.append(baseline.security_index)
        vedic_indices.append(vedic.security_index)
    
    # Stats
    stat, p_value = mannwhitneyu(baseline_indices, vedic_indices, alternative="two-sided")
    effect_size = (np.mean(vedic_indices) - np.mean(baseline_indices)) / np.std(baseline_indices + vedic_indices)
    
    # Babel point
    slope, intercept, pearson = derive_babel_point(baseline_indices, vedic_indices)
    print(f"Babel Point Equation: vedic_index = {slope:.3f} * baseline_index + {intercept:.3f}")
    print(f"Correlation: {pearson:.3f}, p-value: {p_value:.3e}, Effect Size: {effect_size:.3f}")
    
    # Quantum simulation
    vuln_counts = [
        sum(a.count for a in alerts if a.vuln_type == t) for t in VULN_TYPES
    ]
    nikhilam_circuit = sonar.quantum_nikhilam_circuit(vuln_counts)
    linear_circuit = sonar.quantum_linear_circuit(vuln_counts)
    
    backend = Aer.get_backend("statevector_simulator")
    nikhilam_result = backend.run(nikhilam_circuit).result().get_statevector()
    linear_result = backend.run(linear_circuit).result().get_statevector()
    
    # Compare gate depths
    print(f"Quantum Nikhilam Depth: {nikhilam_circuit.depth()}")
    print(f"Quantum Linear Depth: {linear_circuit.depth()}")

    # === NEW: VEDIC QUANTUM ANALYSIS ===
    print("\n" + "="*70)
    try:
        print("🕉️  VEDIC QUANTUM FRAMEWORK ANALYSIS")
    except UnicodeEncodeError:
        print("OM  VEDIC QUANTUM FRAMEWORK ANALYSIS")
    print("="*70)

    # 1. QUANTUM DHARMA EFFICIENCY (Gate Depth as Elegance Metric)
    print("\n" + ("-" * 70))
    try:
        print("📐 1. QUANTUM DHARMA EFFICIENCY (Fewer Gates = More Elegant)")
    except UnicodeEncodeError:
        print("[GEOMETRY] 1. QUANTUM DHARMA EFFICIENCY (Fewer Gates = More Elegant)")
    print("-" * 70)

    nikhilam_depth = nikhilam_circuit.depth()
    linear_depth = linear_circuit.depth()
    quantum_efficiency = linear_depth / nikhilam_depth if nikhilam_depth > 0 else 1.0
    dharma_efficiency = 1 / (1 + nikhilam_depth)  # Lower depth = higher dharma

    print(f"Nikhilam Circuit Depth: {nikhilam_depth} gates")
    print(f"Linear Circuit Depth: {linear_depth} gates")
    print(f"Quantum Efficiency: {quantum_efficiency:.2f}x (Vedic advantage)")
    print(f"Dharma Efficiency: {dharma_efficiency:.6f}")
    print(f"Interpretation: Vedic circuit is {(quantum_efficiency - 1)*100:.0f}% more efficient")
    print(f"                (Dharma = {dharma_efficiency*100:.1f}% - simpler is better)")

    # 2. QUANTUM STATEVECTOR STABILITY
    print("\n" + ("-" * 70))
    try:
        print("🌊 2. QUANTUM STATEVECTOR STABILITY")
    except UnicodeEncodeError:
        print("[WAVE] 2. QUANTUM STATEVECTOR STABILITY")
    print("-" * 70)

    # Compute statevector magnitudes
    nikhilam_magnitudes = np.abs(nikhilam_result.data)
    linear_magnitudes = np.abs(linear_result.data)

    nikhilam_stability = 1 / (1 + np.var(nikhilam_magnitudes))
    linear_stability = 1 / (1 + np.var(linear_magnitudes))

    print(f"Nikhilam Statevector Stability: {nikhilam_stability:.6f}")
    print(f"Linear Statevector Stability: {linear_stability:.6f}")

    if nikhilam_stability > linear_stability:
        try:
            print(f"✨ DISCOVERY: Nikhilam statevector is MORE stable!")
        except UnicodeEncodeError:
            print(f"*** DISCOVERY: Nikhilam statevector is MORE stable!")
    else:
        print(f"Linear statevector is more stable (expected for Hadamard superposition)")

    # 3. CLASSICAL-QUANTUM DHARMA CORRESPONDENCE
    print("\n" + ("-" * 70))
    try:
        print("⚛️  3. CLASSICAL-QUANTUM DHARMA CORRESPONDENCE")
    except UnicodeEncodeError:
        print("[ATOM] 3. CLASSICAL-QUANTUM DHARMA CORRESPONDENCE")
    print("-" * 70)

    # Classical dharma constant
    classical_dharma = np.mean(vedic_indices)
    classical_dharma_index = 1 / (1 + np.var(vedic_indices))

    # Quantum dharma (gate efficiency)
    quantum_dharma_index = dharma_efficiency

    # Check for correspondence
    correspondence_ratio = quantum_dharma_index / classical_dharma_index if classical_dharma_index > 0 else 0

    print(f"Classical Dharma Constant: {classical_dharma:.6f}")
    print(f"Classical Dharma Index: {classical_dharma_index:.6f}")
    print(f"Quantum Dharma Index (Gate Efficiency): {quantum_dharma_index:.6f}")
    print(f"Correspondence Ratio (Q/C): {correspondence_ratio:.6f}")

    PHI = 0.618033988749
    if abs(correspondence_ratio - PHI) < 0.05:
        try:
            print(f"✨ DISCOVERY: Quantum-Classical ratio ≈ PHI (Golden Ratio)!")
        except UnicodeEncodeError:
            print(f"*** DISCOVERY: Quantum-Classical ratio ~= PHI (Golden Ratio)!")

    # 4. QUANTUM ATTRACTOR (Statevector Convergence)
    print("\n" + ("-" * 70))
    try:
        print("🎯 4. QUANTUM ATTRACTOR (Statevector Convergence)")
    except UnicodeEncodeError:
        print("[TARGET] 4. QUANTUM ATTRACTOR (Statevector Convergence)")
    print("-" * 70)

    # Find dominant amplitude in statevectors
    nikhilam_dominant = np.max(nikhilam_magnitudes)
    linear_dominant = np.max(linear_magnitudes)

    print(f"Nikhilam Dominant Amplitude: {nikhilam_dominant:.6f}")
    print(f"Linear Dominant Amplitude: {linear_dominant:.6f}")
    print(f"")
    print(f"Interpretation: Higher amplitude = stronger quantum attractor")
    if nikhilam_dominant > linear_dominant:
        print(f"                Nikhilam has stronger convergence ({nikhilam_dominant:.4f} vs {linear_dominant:.4f})")
    else:
        print(f"                Linear has stronger convergence ({linear_dominant:.4f} vs {nikhilam_dominant:.4f})")

    print("\n" + "="*70)
    try:
        print("🕉️  VEDIC QUANTUM FRAMEWORK ANALYSIS COMPLETE")
    except UnicodeEncodeError:
        print("OM  VEDIC QUANTUM FRAMEWORK ANALYSIS COMPLETE")
    print("="*70)

    # Output sample results
    print(f"\nClassical Results:")
    print(f"Baseline Scan: {baseline.time_s:.3f}s, Index: {baseline.security_index:.3f}")
    print(f"Vedic Scan: {vedic.time_s:.3f}s, Index: {vedic.security_index:.3f}, SHM: {(1 - abs(vedic.security_index)) * 100:.1f}")
    print(f"\nQuantum Results:")
    print(f"Nikhilam Depth: {nikhilam_depth} gates ({quantum_efficiency:.1f}x advantage)")
    print(f"Dharma Efficiency: {dharma_efficiency:.3f}")
    sonar.print_spiral()
    
    # Plot indices
    plt.scatter(baseline_indices, vedic_indices, c="gold", label="Scans")
    x = np.linspace(min(baseline_indices), max(baseline_indices), 100)
    plt.plot(x, slope * x + intercept, "r--", label=f"Fit: y = {slope:.2f}x + {intercept:.2f}")
    plt.xlabel("Baseline Index")
    plt.ylabel("Vedic Index")
    plt.legend()
    plt.title("Vedic Quantum Sonar - Statevector Comparison")
    plt.savefig("vedic_quantum_sonar_analysis.png", dpi=150, bbox_inches='tight')
    print(f"\n[CHART] Quantum analysis plot saved to: vedic_quantum_sonar_analysis.png")

if __name__ == "__main__":
    main()