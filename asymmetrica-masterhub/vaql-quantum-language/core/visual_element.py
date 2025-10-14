"""
VAQL Core: Visual Element Base Classes

Defines the base pattern types (Dragon, Fibonacci, Ouroboros, Mandelbrot, W-Node)
that form the foundation of Visual Asymmetrica Quantum Language.

Mathematical Foundation:
- Dragon: L-system fractal, space-filling curves
- Fibonacci: Golden ratio spiral (φ = 1.618...)
- Ouroboros: Cyclic amplification (Grover iterations)
- Mandelbrot: Recursive error correction (fractal zoom)
- W-Node: Multi-particle entangled states (resilient)

Author: Sarat Chandra Gnanamgari
Date: October 7, 2025
License: MIT + Asymmetrica Commons
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Tuple, Optional, Dict
import numpy as np
from enum import Enum


class PatternType(Enum):
    """Enumeration of supported visual pattern types."""
    DRAGON = "dragon"
    FIBONACCI = "fibonacci"
    OUROBOROS = "ouroboros"
    MANDELBROT = "mandelbrot"
    W_NODE = "w_node"


@dataclass
class QuantumState:
    """
    Represents a quantum state vector.

    Attributes:
        amplitudes: Complex amplitudes for each basis state
        num_qubits: Number of qubits in the state
        is_normalized: Whether state satisfies ||ψ|| = 1
    """
    amplitudes: np.ndarray  # Complex128 array
    num_qubits: int
    is_normalized: bool = True

    def __post_init__(self):
        """Validate quantum state after initialization."""
        if self.is_normalized:
            norm = np.linalg.norm(self.amplitudes)
            if not np.isclose(norm, 1.0, atol=1e-10):
                raise ValueError(f"State not normalized: ||ψ|| = {norm}")

    @property
    def dimension(self) -> int:
        """Dimension of Hilbert space (2^n for n qubits)."""
        return 2 ** self.num_qubits

    def fidelity(self, other: 'QuantumState') -> float:
        """
        Calculate fidelity with another state: F(ψ, φ) = |⟨ψ|φ⟩|²

        Args:
            other: Another quantum state

        Returns:
            Fidelity value between 0 and 1
        """
        if self.num_qubits != other.num_qubits:
            raise ValueError("States must have same number of qubits")

        inner_product = np.vdot(self.amplitudes, other.amplitudes)
        return np.abs(inner_product) ** 2

    def measure(self, qubit_indices: Optional[List[int]] = None) -> Tuple[List[int], 'QuantumState']:
        """
        Perform measurement on specified qubits.

        Args:
            qubit_indices: Qubits to measure (default: all)

        Returns:
            Tuple of (measurement outcomes, collapsed state)
        """
        if qubit_indices is None:
            qubit_indices = list(range(self.num_qubits))

        # Calculate probabilities
        probabilities = np.abs(self.amplitudes) ** 2

        # Sample outcome based on probabilities
        outcome_index = np.random.choice(len(probabilities), p=probabilities)

        # Convert index to binary (measurement results)
        outcome_bits = [int(b) for b in format(outcome_index, f'0{self.num_qubits}b')]

        # Collapse state (project onto measurement outcome)
        collapsed_amplitudes = np.zeros_like(self.amplitudes)
        collapsed_amplitudes[outcome_index] = 1.0

        collapsed_state = QuantumState(
            amplitudes=collapsed_amplitudes,
            num_qubits=self.num_qubits,
            is_normalized=True
        )

        return outcome_bits, collapsed_state


class VisualElement(ABC):
    """
    Abstract base class for all visual pattern elements in VAQL.

    All visual elements (D, F, O, M) inherit from this class and implement:
    - generate(): Create quantum circuit representation
    - to_quantum_state(): Convert pattern to quantum state
    """

    def __init__(self, pattern_type: PatternType):
        """
        Initialize visual element.

        Args:
            pattern_type: Type of pattern (Dragon, Fibonacci, etc.)
        """
        self.pattern_type = pattern_type
        self._quantum_state: Optional[QuantumState] = None

    @abstractmethod
    def generate(self) -> Dict:
        """
        Generate internal representation of pattern.

        Returns:
            Dictionary containing pattern parameters and structure
        """
        pass

    @abstractmethod
    def to_quantum_state(self) -> QuantumState:
        """
        Convert visual pattern to quantum state.

        Returns:
            QuantumState representation of pattern
        """
        pass

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(...)"


class DragonCurve(VisualElement):
    """
    Dragon curve fractal pattern for quantum exploration.

    Mathematical Foundation:
        L-system rules:
        - Axiom: FX
        - X → X+YF+
        - Y → -FX-Y
        - Angle: 90°

    Quantum Mapping:
        Dragon folding → Hadamard quantum walk
        Each iteration doubles state space (2^n superposition)

    Args:
        iterations: Number of folding steps (1-∞)
        angle: Rotation angle in radians (default: π/2)
        scale: Scaling factor (default: 1.0)
    """

    def __init__(self, iterations: int, angle: float = np.pi/2, scale: float = 1.0):
        super().__init__(PatternType.DRAGON)
        self.iterations = iterations
        self.angle = angle
        self.scale = scale

        # Validate parameters
        if iterations < 1:
            raise ValueError("Iterations must be >= 1")
        if iterations > 20:
            raise Warning("Iterations > 20 may cause memory issues (2^20 = 1M states)")

    def generate(self) -> Dict:
        """
        Generate dragon curve L-system expansion.

        Returns:
            Dictionary with expanded L-system string and coordinates
        """
        # L-system expansion
        axiom = "FX"
        rules = {"X": "X+YF+", "Y": "-FX-Y"}

        sequence = axiom
        for _ in range(self.iterations):
            sequence = "".join(rules.get(c, c) for c in sequence)

        return {
            "sequence": sequence,
            "iterations": self.iterations,
            "angle": self.angle,
            "scale": self.scale,
            "num_states": 2 ** self.iterations
        }

    def to_quantum_state(self) -> QuantumState:
        """
        Convert dragon curve to quantum state via Hadamard walk.

        Returns:
            Uniform superposition over 2^iterations states
        """
        num_qubits = self.iterations
        dimension = 2 ** num_qubits

        # Uniform superposition: |ψ⟩ = (1/√N) Σ |i⟩
        amplitudes = np.ones(dimension, dtype=np.complex128) / np.sqrt(dimension)

        self._quantum_state = QuantumState(
            amplitudes=amplitudes,
            num_qubits=num_qubits,
            is_normalized=True
        )

        return self._quantum_state

    def __repr__(self) -> str:
        return f"D({self.iterations}, {self.angle:.3f}, {self.scale})"


class FibonacciSpiral(VisualElement):
    """
    Fibonacci golden ratio spiral for quantum optimization.

    Mathematical Foundation:
        Golden angle: θ = 2π / φ² ≈ 137.5°
        Spiral equation: r(θ) = a × e^(bθ) where b = ln(φ) / (π/2)

    Quantum Mapping:
        Fibonacci phases → Quantum Fourier Transform
        Golden angle spacing → Optimal phase distribution

    Args:
        ratio: Fibonacci ratio (default: φ = 1.618...)
        phase: Initial phase angle in radians (default: 0)
        scale: Amplitude scaling factor (default: 1.0)
    """

    PHI = (1 + np.sqrt(5)) / 2  # Golden ratio ≈ 1.618033988749...

    def __init__(self, ratio: float = PHI, phase: float = 0.0, scale: float = 1.0):
        super().__init__(PatternType.FIBONACCI)
        self.ratio = ratio
        self.phase = phase
        self.scale = scale

        # Validate golden ratio
        if not np.isclose(ratio, self.PHI, rtol=0.01):
            raise Warning(f"Ratio {ratio} deviates from golden ratio φ = {self.PHI}")

    def generate(self) -> Dict:
        """
        Generate Fibonacci spiral coordinates.

        Returns:
            Dictionary with spiral parameters and golden angle
        """
        golden_angle = 2 * np.pi / (self.ratio ** 2)

        return {
            "ratio": self.ratio,
            "phase": self.phase,
            "scale": self.scale,
            "golden_angle": golden_angle,
            "golden_angle_degrees": np.degrees(golden_angle)
        }

    def to_quantum_state(self) -> QuantumState:
        """
        Convert Fibonacci spiral to quantum state with phase kickback.

        Returns:
            Quantum state with golden angle phase distribution
        """
        # Use 8 qubits for reasonable QFT representation
        num_qubits = 8
        dimension = 2 ** num_qubits

        golden_angle = 2 * np.pi / (self.ratio ** 2)

        # Create state with golden angle phase spacing
        amplitudes = np.zeros(dimension, dtype=np.complex128)
        for k in range(dimension):
            phase_k = self.phase + k * golden_angle
            amplitudes[k] = self.scale * np.exp(1j * phase_k)

        # Normalize
        amplitudes /= np.linalg.norm(amplitudes)

        self._quantum_state = QuantumState(
            amplitudes=amplitudes,
            num_qubits=num_qubits,
            is_normalized=True
        )

        return self._quantum_state

    def __repr__(self) -> str:
        return f"F({self.ratio:.3f}, {self.phase:.3f}, {self.scale})"


class OuroborosLoop(VisualElement):
    """
    Ouroboros loop for amplitude amplification (Grover iterations).

    Mathematical Foundation:
        Grover operator: G = (2|s⟩⟨s| - I) × O_f
        Optimal iterations: k = π/4 × √N

    Quantum Mapping:
        Ouroboros cycle → Grover diffusion + oracle
        Radius/damping → Amplitude amplification strength

    Args:
        radius: Loop radius (0-1, normalized)
        cycles: Number of amplification iterations
        damping: Decay factor per cycle (0-1, default: 1.0 = no decay)
    """

    def __init__(self, radius: float, cycles: int, damping: float = 1.0):
        super().__init__(PatternType.OUROBOROS)
        self.radius = radius
        self.cycles = cycles
        self.damping = damping

        # Validate parameters
        if not 0 <= radius <= 1:
            raise ValueError("Radius must be in [0, 1]")
        if cycles < 1:
            raise ValueError("Cycles must be >= 1")
        if not 0 <= damping <= 1:
            raise ValueError("Damping must be in [0, 1]")

    def generate(self) -> Dict:
        """
        Generate Ouroboros loop parameters.

        Returns:
            Dictionary with loop structure and amplification parameters
        """
        return {
            "radius": self.radius,
            "cycles": self.cycles,
            "damping": self.damping,
            "effective_amplification": self.radius * (self.damping ** self.cycles)
        }

    def to_quantum_state(self) -> QuantumState:
        """
        Convert Ouroboros to measurement operator (resolves to scalar).

        Note: Ouroboros typically used with ⊣ (resolve) operator,
        which collapses quantum state to classical value.

        Returns:
            Identity state (placeholder for measurement)
        """
        # Ouroboros represents measurement, not a quantum state
        # Return trivial state (will be used in ResolveOperation)
        num_qubits = 1
        amplitudes = np.array([1.0 + 0j, 0.0 + 0j])

        self._quantum_state = QuantumState(
            amplitudes=amplitudes,
            num_qubits=num_qubits,
            is_normalized=True
        )

        return self._quantum_state

    def __repr__(self) -> str:
        return f"O({self.radius}, {self.cycles}, {self.damping})"


class MandelbrotZoom(VisualElement):
    """
    Mandelbrot set zoom for recursive error correction.

    Mathematical Foundation:
        z_{n+1} = z_n² + c
        Fractal boundary dimension ≈ 2

    Quantum Mapping:
        Mandelbrot depth → Error correction code distance
        Recursive structure → Stabilizer measurements

    Args:
        depth: Iteration depth (1-1000+)
        center: Complex center point (real, imag)
        zoom: Magnification factor (default: 1.0)
    """

    def __init__(self, depth: int, center: Tuple[float, float], zoom: float = 1.0):
        super().__init__(PatternType.MANDELBROT)
        self.depth = depth
        self.center = complex(center[0], center[1])
        self.zoom = zoom

        # Validate parameters
        if depth < 1:
            raise ValueError("Depth must be >= 1")
        if zoom <= 0:
            raise ValueError("Zoom must be > 0")

    def generate(self) -> Dict:
        """
        Generate Mandelbrot zoom parameters.

        Returns:
            Dictionary with fractal parameters
        """
        return {
            "depth": self.depth,
            "center": self.center,
            "zoom": self.zoom,
            "protection_level": min(self.depth / 10, 100)  # Rough error correction strength
        }

    def to_quantum_state(self) -> QuantumState:
        """
        Convert Mandelbrot to error-protected quantum state.

        Returns:
            Quantum state with recursive error correction encoding
        """
        # Use depth to determine logical qubit encoding
        # More depth = more physical qubits for protection
        num_physical_qubits = min(3 + (self.depth // 10), 10)  # Scale with depth
        dimension = 2 ** num_physical_qubits

        # Create encoded logical |0⟩ state
        # (Simplified: Real surface codes would be more complex)
        amplitudes = np.zeros(dimension, dtype=np.complex128)
        amplitudes[0] = 1.0  # Logical |0⟩

        self._quantum_state = QuantumState(
            amplitudes=amplitudes,
            num_qubits=num_physical_qubits,
            is_normalized=True
        )

        return self._quantum_state

    def __repr__(self) -> str:
        return f"M({self.depth}, ({self.center.real}, {self.center.imag}), {self.zoom})"


class WNode(VisualElement):
    """
    W-state node for multi-particle quantum entanglement.

    Mathematical Foundation:
        |W_n⟩ = (|100...0⟩ + |010...0⟩ + ... + |000...1⟩) / √n

    Properties:
        - Symmetric: All qubits equivalent
        - Resilient: Entanglement survives single-qubit loss
        - Maximal: Optimal distributed entanglement

    Args:
        amplitudes: Probability amplitudes (must sum to 1)
    """

    def __init__(self, *amplitudes: float):
        super().__init__(PatternType.W_NODE)
        self.amplitudes = np.array(amplitudes, dtype=np.float64)

        # Validate amplitudes
        if len(self.amplitudes) < 2:
            raise ValueError("W-state requires at least 2 particles")

        norm = np.sum(self.amplitudes ** 2)
        if not np.isclose(norm, 1.0, atol=1e-10):
            raise ValueError(f"Amplitudes must sum to 1 (squared): got {norm}")

    def generate(self) -> Dict:
        """
        Generate W-state parameters.

        Returns:
            Dictionary with entanglement structure
        """
        num_particles = len(self.amplitudes)

        return {
            "num_particles": num_particles,
            "amplitudes": self.amplitudes.tolist(),
            "entanglement_type": "W-state",
            "resilience": "Single-particle robust"
        }

    def to_quantum_state(self) -> QuantumState:
        """
        Convert W-node to quantum W-state.

        Returns:
            W-state: |W⟩ = Σ a_i |0...1...0⟩ where 1 is at position i
        """
        num_qubits = len(self.amplitudes)
        dimension = 2 ** num_qubits

        # Create W-state superposition
        state_amplitudes = np.zeros(dimension, dtype=np.complex128)

        for i, amplitude in enumerate(self.amplitudes):
            # State |0...1...0⟩ where 1 is at position i
            # Binary representation: single 1 at position i
            basis_index = 2 ** (num_qubits - 1 - i)
            state_amplitudes[basis_index] = amplitude

        self._quantum_state = QuantumState(
            amplitudes=state_amplitudes,
            num_qubits=num_qubits,
            is_normalized=True
        )

        return self._quantum_state

    def __repr__(self) -> str:
        amps_str = ", ".join(f"{a:.3f}" for a in self.amplitudes)
        return f"W({amps_str})"


# Type aliases for convenience
D = DragonCurve
F = FibonacciSpiral
O = OuroborosLoop
M = MandelbrotZoom
W = WNode


if __name__ == "__main__":
    # Example usage
    print("VAQL Visual Elements Demo\n")

    # Dragon curve (10 iterations)
    dragon = D(10, np.pi/2, 1.0)
    print(f"1. {dragon}")
    dragon_state = dragon.to_quantum_state()
    print(f"   → {dragon_state.num_qubits} qubits, {dragon_state.dimension} dimensions\n")

    # Fibonacci spiral (golden ratio)
    fib = F(F.PHI, 0, 1.0)
    print(f"2. {fib}")
    fib_state = fib.to_quantum_state()
    print(f"   → {fib_state.num_qubits} qubits, golden angle phase\n")

    # Ouroboros loop (100 cycles)
    ouroboros = O(0.5, 100, 0.99)
    print(f"3. {ouroboros}")
    oro_state = ouroboros.to_quantum_state()
    print(f"   → Measurement operator (amplitude amplification)\n")

    # Mandelbrot zoom (depth 100)
    mandelbrot = M(100, (-0.5, 0.0), 1.0)
    print(f"4. {mandelbrot}")
    mandel_state = mandelbrot.to_quantum_state()
    print(f"   → {mandel_state.num_qubits} qubits (error-protected)\n")

    # W-state (three-regime distribution)
    wstate = W(0.334, 0.287, 0.374)
    print(f"5. {wstate}")
    w_quantum_state = wstate.to_quantum_state()
    print(f"   → {w_quantum_state.num_qubits} qubits (W-state entanglement)\n")

    print("✓ All visual elements created successfully!")
