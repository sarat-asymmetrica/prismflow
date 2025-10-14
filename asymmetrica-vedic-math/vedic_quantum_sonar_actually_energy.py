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
        severity = np.random.randint(2, 5)
        count = np.random.randint(1, 5)
        endpoints = np.random.choice(ENDPOINTS, size=np.random.randint(1, 3), replace=False).tolist()
        alerts.append(Alert(vuln_type, severity, count, endpoints))
    return alerts

@dataclass
class ScanResult:
    time_s: float
    security_index: float
    vuln_vector: Tuple[float, float, float, float]
    security_debt: float = 0.0

class SecuritySonarMath:
    BASE = 100  # Vedic base

    def baseline_scan(self, alerts: List[Alert], endpoints: List[str]) -> ScanResult:
        """Linear O(n) scan."""
        start_time = time.time()
        vuln_density = sum(a.count for a in alerts) / len(endpoints)
        coverage = len(set(sum((a.endpoints for a in alerts), []))) / len(endpoints)
        penalty = min(sum(0.5 for a in alerts if a.severity > 3), 10.0) / 10.0
        security_index = (vuln_density * REGIME_WEIGHTS["explore"] +
                         coverage * REGIME_WEIGHTS["optimize"] -
                         penalty * REGIME_WEIGHTS["support"])
        security_debt = max(-security_index * 100, 0)
        vuln_vector = (
            sum(a.count for a in alerts if a.vuln_type == "XSS") * LEVERAGE_MULTIPLIERS["XSS"],
            sum(a.count for a in alerts if a.vuln_type == "SQLi") * LEVERAGE_MULTIPLIERS["SQLi"],
            sum(a.count for a in alerts if a.vuln_type == "Auth") * LEVERAGE_MULTIPLIERS["Auth"],
            sum(a.count for a in alerts if a.vuln_type == "CSRF") * LEVERAGE_MULTIPLIERS["CSRF"]
        )
        return ScanResult(time.time() - start_time, security_index, vuln_vector, security_debt)

    def vedic_nikhilam(self, count: int) -> float:
        """Nikhilam folding: O(1)-ish."""
        deficit = self.BASE - count
        return (self.BASE - deficit) * deficit / self.BASE

    def vedic_crosswise(self, vuln_vector: Tuple[float, float, float, float], coverage: float, penalty: float) -> float:
        """Crosswise folding with PHI and dynamic noise."""
        base = sum(vuln_vector) * coverage * (1 - penalty * 0.5) * 0.618
        noise = 0.1 * sum(vuln_vector) / self.BASE
        return base + noise

    def vedic_scan(self, alerts: List[Alert], endpoints: List[str]) -> ScanResult:
        """Vedic scan with fractal folding."""
        start_time = time.time()
        vuln_density = self.vedic_nikhilam(sum(a.count for a in alerts))
        coverage = len(set(sum((a.endpoints for a in alerts), []))) / len(endpoints)
        penalty = min(sum(0.5 for a in alerts if a.severity > 3), 10.0) / 10.0
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
        n_qubits = 4
        qc = QuantumCircuit(n_qubits)
        for i, count in enumerate(counts[:n_qubits]):
            deficit = self.BASE - count
            phase = (self.BASE - deficit) * deficit / self.BASE * 2 * np.pi / self.BASE
            qc.rz(phase, i)
        return qc

    def quantum_linear_circuit(self, counts: List[int]) -> QuantumCircuit:
        """Linear summation as QFT-like circuit."""
        n_qubits = 4
        qc = QuantumCircuit(n_qubits)
        for i, count in enumerate(counts[:n_qubits]):
            qc.h(i)
            qc.rz(count * 2 * np.pi / self.BASE, i)
        return qc

    @staticmethod
    def print_spiral():
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

def attractor_analysis(variable: List[float], constant: float) -> dict:
    distances = [abs(v - constant) for v in variable]
    mean_distance = np.mean(distances)
    convergence = distances[0] - distances[-1] if len(distances) > 1 else None
    harmonic_mean_var = len(variable) / sum(1/abs(v) for v in variable if v != 0)
    resonance_ratio = constant / harmonic_mean_var if harmonic_mean_var != 0 else 0
    return {
        'mean_distance': mean_distance,
        'convergence': convergence,
        'resonance': resonance_ratio,
        'interpretation': f"Variable orbits constant at {mean_distance:.2f}, resonance {resonance_ratio:.4f}"
    }

async def main():
    sonar = SecuritySonarMath()
    alerts = generate_synthetic_alerts(len(ENDPOINTS))
    
    # Classical scans
    baseline_indices, vedic_indices = [], []
    for _ in range(10):
        baseline = sonar.baseline_scan(alerts, ENDPOINTS)
        vedic = sonar.vedic_scan(alerts, ENDPOINTS)
        baseline_indices.append(baseline.security_index)
        vedic_indices.append(vedic.security_index)
    
    # Stats
    stat, p_value = mannwhitneyu(baseline_indices, vedic_indices, alternative="two-sided")
    effect_size = (np.mean(vedic_indices) - np.mean(baseline_indices)) / np.std(baseline_indices + vedic_indices)
    
    # Attractor analysis
    attractor = attractor_analysis(baseline_indices, np.mean(vedic_indices))
    print(f"Attractor Analysis: {attractor['interpretation']}")
    print(f"Resonance Ratio: {attractor['resonance']:.4f} (target ≈ 0.618 or 1.618)")
    print(f"Convergence: {attractor['convergence']:.3f}")
    
    # Quantum simulation
    vuln_counts = [sum(a.count for a in alerts if a.vuln_type == t) for t in VULN_TYPES]
    nikhilam_circuit = sonar.quantum_nikhilam_circuit(vuln_counts)
    linear_circuit = sonar.quantum_linear_circuit(vuln_counts)
    
    backend = Aer.get_backend("statevector_simulator")
    nikhilam_result = execute(nikhilam_circuit, backend).result().get_statevector()
    linear_result = execute(linear_circuit, backend).result().get_statevector()
    
    # Output
    print(f"Quantum Nikhilam Depth: {nikhilam_circuit.depth()}")
    print(f"Quantum Linear Depth: {linear_circuit.depth()}")
    print(f"Baseline Scan: {baseline.time_s:.3f}s, Index: {baseline.security_index:.3f}, Debt: {baseline.security_debt:.1f}")
    print(f"Vedic Scan: {vedic.time_s:.3f}s, Index: {vedic.security_index:.3f}, SHM: {(1 - abs(vedic.security_index)) * 100:.1f}")
    sonar.print_spiral()
    
    # Plot
    plt.scatter(baseline_indices, vedic_indices, c="gold", label="Scans")
    plt.xlabel("Baseline Index (Security Debt)")
    plt.ylabel("Vedic Index (Security Attainment)")
    plt.legend()
    plt.title("Vedic vs Baseline: Dual-Axis Security")
    plt.savefig("vedic_babel_point_analysis.png")
    plt.show()

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())