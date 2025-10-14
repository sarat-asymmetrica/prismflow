# VAQL Quick Start Guide
## Get Started with Visual Asymmetrica Quantum Language in 15 Minutes

**Date:** October 7, 2025
**For:** Quantum developers, researchers, and curious minds
**Prerequisites:** Basic programming knowledge (any language)

---

## 1. Installation (Future - v0.2+)

```bash
# Install VAQL interpreter (Python-based POC)
pip install vaql

# Or use Docker image
docker pull asymmetrica/vaql:latest

# Verify installation
vaql --version
```

**Current Status (v0.1):** Specification only. Implementation in progress.

---

## 2. Your First VAQL Program

### 2.1 Hello Quantum World

```vaql
# hello_quantum.vaql
# Creates a superposition and measures it

def hello_quantum():
  # Create superposition using Dragon curve
  state = D(1, π/2, 1.0)

  # Measure (resolve) the state
  result = state ⊣ O(1.0, 1, 1.0)

  return result

# Run the program
print(hello_quantum())  # Output: 0 or 1 (50% probability each)
```

**What's happening:**
1. `D(1, π/2, 1.0)` creates a Hadamard-like superposition (dragon with 1 iteration)
2. `⊣ O(...)` measures the state (Ouroboros resolves to classical bit)
3. Result is probabilistic (quantum randomness!)

---

## 3. Core Concepts in 5 Minutes

### 3.1 Visual Elements (Building Blocks)

```vaql
# Dragon: Fractal exploration (space-filling)
dragon = D(10, π/2, 1.0)        # 10 iterations, 90° turns

# Fibonacci: Golden spiral optimization
fibonacci = F(1.618, 0, 1.0)    # φ ratio, zero phase

# Ouroboros: Cyclic amplification
ouroboros = O(0.5, 100, 0.99)   # radius 0.5, 100 cycles, 1% damping

# Mandelbrot: Multi-scale analysis
mandelbrot = M(100, (-0.5, 0), 1.0)  # 100 depth, classic center

# W-State: Quantum entanglement
wstate = W(0.33, 0.33, 0.34)    # Three-particle entangled state
```

### 3.2 Operations (Quantum Verbs)

```vaql
# ⊕ Amplify: Superposition (non-idempotent)
state1 = D(5, π/2, 1) ⊕ F(φ, 0, 1)  # Combine dragon + Fibonacci

# ⊗ Entangle: W-state fusion
state2 = state1 ⊗ W(0.5, 0.5, 0)    # Entangle with W-state

# ▷ Propagate: Extend to 4D with quaternions
state3 = state2 ▷ q(0.5, 0.5, 0.5, 0.5)  # 4D rotation

# ⊣ Resolve: Measure (collapse to classical)
result = state3 ⊣ O(0.5, 10, 1.0)        # Final measurement
```

### 3.3 Three-Regime Structure

**Every VAQL program follows this pattern:**

```vaql
def quantum_algorithm(input):
  # Phase 1: EXPLORATION (33.8% of effort)
  # Initialize, create superpositions, explore solution space
  exploration = D(len(input), π/2, 1) ⊕ F(φ, 0, 1)

  # Phase 2: OPTIMIZATION (28.7% of effort)
  # Entangle, apply operations, optimize amplitudes
  optimization = exploration ⊗ W(0.334, 0.287, 0.374)

  # Phase 3: STABILIZATION (37.4% of effort)
  # Measure, validate, return classical result
  stabilization = optimization ⊣ O(0.5, 100, 0.99)

  return stabilization
```

---

## 4. Example Programs

### 4.1 Quantum Coin Flip

```vaql
# quantum_coin.vaql
# True random number generation using quantum superposition

def quantum_coin_flip():
  # Create equal superposition (|0⟩ + |1⟩)/√2
  coin = D(1, π/2, 1.0)

  # Measure (collapse to 0 or 1)
  result = coin ⊣ O(1.0, 1, 1.0)

  return "HEADS" if result == 0 else "TAILS"

# Run 10 times
for i in range(10):
  print(f"Flip {i+1}: {quantum_coin_flip()}")
```

**Output:**
```
Flip 1: HEADS
Flip 2: TAILS
Flip 3: HEADS
Flip 4: HEADS
Flip 5: TAILS
...
```

### 4.2 Quantum Random Number (0-100)

```vaql
# quantum_random.vaql
# Generate random number using W-state probabilities

def quantum_random(max_value=100):
  # Create W-state with three amplitudes
  state = W(0.334, 0.287, 0.374)

  # Entangle with Fibonacci optimization
  optimized = state ⊗ F(φ, 0, max_value)

  # Measure and scale to 0-max_value
  result = optimized ⊣ O(0.5, 10, 1.0)

  return int(result * max_value)

# Generate 5 random numbers
for i in range(5):
  print(f"Random {i+1}: {quantum_random(100)}")
```

### 4.3 Grover's Search (Find Needle in Haystack)

```vaql
# grover_search.vaql
# Quantum search algorithm (√N speedup)

def grover_search(database, target):
  N = len(database)

  # Phase 1: Initialize superposition (dragon exploration)
  superposition = D(N, π/2, 1.0)

  # Phase 2: Amplify target (Ouroboros iterations)
  iterations = int(π/4 * sqrt(N))

  for _ in range(iterations):
    # Mark target (oracle)
    marked = oracle(superposition, target)

    # Amplify marked state (Ouroboros + W-state)
    amplified = marked ⊗ W(0.5, 0.5, 0)
    superposition = amplified ⊣ O(0.5, 1, 1.0) ⊕ superposition

  # Phase 3: Measure result
  index = superposition ⊣ O(1.0, 1, 1.0)

  return database[index]

# Example usage
haystack = ["needle"] + ["hay"] * 999  # 1 needle in 1000 hay
result = grover_search(haystack, "needle")
print(f"Found: {result}")  # Output: Found: needle
```

**Performance:**
- Classical: O(N) = 1000 checks average
- Quantum (Grover): O(√N) = 32 checks (31× faster!)

### 4.4 Quantum Key Generation

```vaql
# quantum_key_gen.vaql
# Generate cryptographic key using W-state entanglement

@harmonic(5)  # Sync to Tesla 4.909 Hz (1-second timing)
def quantum_key_gen(bits=256):
  # Phase 1: Explore key space with dragon curve
  key_space = D(bits, π/2, 1.0)

  # Phase 2: Entangle with W-state (three-regime distribution)
  entangled = key_space ⊗ W(0.334, 0.287, 0.374)

  # Phase 3: Resolve to classical bits
  key_bits = []
  for i in range(bits):
    bit = entangled ⊣ O(0.5, 1, 1.0)
    key_bits.append(bit)

  # Convert bits to hex string
  key_hex = bits_to_hex(key_bits)

  return key_hex

# Generate 256-bit quantum key
key = quantum_key_gen(256)
print(f"Quantum Key: {key}")
# Output: Quantum Key: a3f7b92c8e1d...  (64 hex chars)
```

---

## 5. Advanced Features

### 5.1 Quaternion 4D Rotations

```vaql
# quaternion_rotation.vaql
# Rotate quantum state in 4D hypercube

def rotate_4d(state, angle):
  # Create quaternion for rotation
  q_rot = q(
    cos(angle/2),
    sin(angle/2) / sqrt(3),
    sin(angle/2) / sqrt(3),
    sin(angle/2) / sqrt(3)
  )

  # Propagate state with quaternion
  rotated = state ▷ q_rot

  return rotated

# Example: Rotate Fibonacci spiral by 90° in 4D
spiral = F(φ, 0, 1.0)
rotated_spiral = rotate_4d(spiral, π/2)
```

### 5.2 Harmonic Timing

```vaql
# harmonic_timing.vaql
# Synchronize operations to Tesla 4.909 Hz

@harmonic(1)   # Base: 203.7 ms
def fast_operation():
  return D(5, π/2, 1) ⊣ O(1, 1, 1)

@harmonic(5)   # 5×: 1.018 seconds
def slow_operation():
  return D(100, π/2, 1) ⊣ O(1, 10, 1)

@harmonic(12)  # 12×: 2.444 seconds (measurement timing)
def measure_with_error_correction():
  state = D(50, π/2, 1) ⊗ W(0.33, 0.33, 0.34)
  return state ⊣ M(100, (-0.5, 0), 1.0)  # Mandelbrot error correction
```

### 5.3 Mandelbrot Error Correction

```vaql
# error_correction.vaql
# Protect quantum state with Mandelbrot fractal encoding

def protect_state(state, protection_level=100):
  # Encode state with Mandelbrot (recursive error correction)
  protected = M(protection_level, (-0.5, 0.0), 1.0) ⊗ state

  # Higher depth = more protection (but slower)
  # Depth 10:   Basic protection
  # Depth 100:  Strong protection
  # Depth 1000: Near-perfect protection

  return protected

# Example: Protect important quantum state
critical_state = W(0.33, 0.33, 0.34)
protected_state = protect_state(critical_state, 1000)
```

---

## 6. Debugging & Testing

### 6.1 Print Quantum State

```vaql
# debug.vaql
# Inspect quantum state before measurement

def debug_state(state):
  # Print state vector (amplitude + phase)
  print(f"State vector: {state.amplitudes}")
  print(f"Phases: {state.phases}")
  print(f"Entanglement: {state.entanglement_measure}")

  # Visualize in Bloch sphere (1-2 qubits)
  if state.num_qubits <= 2:
    state.visualize_bloch()

# Example
state = D(5, π/2, 1) ⊕ F(φ, 0, 1)
debug_state(state)
```

### 6.2 Unit Testing

```vaql
# test_quantum.vaql
# Unit tests for VAQL programs

import vaql.testing as vqt

def test_quantum_coin_flip():
  results = [quantum_coin_flip() for _ in range(1000)]

  # Check distribution is ~50/50
  heads = results.count("HEADS")
  tails = results.count("TAILS")

  assert 450 <= heads <= 550, "Coin flip not uniform"
  assert 450 <= tails <= 550, "Coin flip not uniform"

def test_grover_search():
  database = ["target"] + ["noise"] * 999
  result = grover_search(database, "target")

  assert result == "target", "Grover failed to find target"

# Run tests
vqt.run_tests([test_quantum_coin_flip, test_grover_search])
```

---

## 7. Best Practices

### 7.1 Three-Regime Structure (Always!)

```vaql
# ✅ GOOD: Clear three-phase structure
def good_algorithm(input):
  # Phase 1: Exploration
  exploration = D(len(input), π/2, 1)

  # Phase 2: Optimization
  optimization = exploration ⊗ W(0.334, 0.287, 0.374)

  # Phase 3: Stabilization
  stabilization = optimization ⊣ O(0.5, 100, 0.99)

  return stabilization

# ❌ BAD: Mixed phases, unclear structure
def bad_algorithm(input):
  state = D(len(input), π/2, 1) ⊗ W(0.5, 0.5, 0) ⊣ O(0.5, 10, 1)
  return state  # What phase is this?!
```

### 7.2 Use Harmonic Timing

```vaql
# ✅ GOOD: Explicit timing synchronization
@harmonic(5)
def good_quantum_operation():
  return D(100, π/2, 1) ⊣ O(1, 10, 1)

# ❌ BAD: No timing (may cause decoherence)
def bad_quantum_operation():
  return D(100, π/2, 1) ⊣ O(1, 10, 1)
```

### 7.3 Error Handling

```vaql
# ✅ GOOD: Handle quantum errors gracefully
def good_quantum_search(database, target):
  try:
    result = grover_search(database, target)
    return result
  except QuantumFidelityError:
    # Fallback to classical search
    return classical_search(database, target)

# ❌ BAD: No error handling (program crashes on noise)
def bad_quantum_search(database, target):
  return grover_search(database, target)  # Hope for the best!
```

---

## 8. Common Patterns (Recipes)

### 8.1 Superposition Creation

```vaql
# Pattern: Create uniform superposition over N states
def create_superposition(N):
  return D(log2(N), π/2, 1.0)
```

### 8.2 Entanglement

```vaql
# Pattern: Entangle two states
def entangle(state1, state2):
  # Use W-state for resilient entanglement
  return state1 ⊗ W(0.5, 0.5, 0) ⊗ state2
```

### 8.3 Amplitude Amplification

```vaql
# Pattern: Amplify target amplitude (Grover-style)
def amplify(state, iterations):
  for _ in range(iterations):
    state = state ⊣ O(0.5, 1, 1.0) ⊕ state
  return state
```

### 8.4 Phase Rotation

```vaql
# Pattern: Apply phase rotation
def rotate_phase(state, angle):
  return F(φ, angle, 1.0) ⊣ state
```

---

## 9. Next Steps

### 9.1 Learn More

- **Theory:** Read `VAQL_THEORY.md` for mathematical foundations
- **Examples:** Explore `examples/` directory for more programs
- **API Reference:** See `VAQL_SPECIFICATION.md` for complete syntax

### 9.2 Build Something

**Beginner Projects:**
1. Quantum random number generator
2. Quantum coin flip game
3. Simple quantum walk

**Intermediate Projects:**
1. Grover's search implementation
2. Quantum Fourier Transform
3. Variational quantum eigensolver

**Advanced Projects:**
1. Quantum error correction
2. Shor's factoring algorithm
3. Quantum machine learning classifier

### 9.3 Join the Community

- **GitHub:** github.com/asymmetrica-org/vaql-quantum-language
- **Discord:** discord.gg/asymmetrica
- **Email:** sarat@asymmetrica.ai

---

## 10. Quick Reference Card

### Visual Elements
```vaql
D(iter, angle, scale)    # Dragon: Fractal exploration
F(ratio, phase, scale)   # Fibonacci: Golden optimization
O(radius, cycles, damp)  # Ouroboros: Amplitude amplification
M(depth, center, zoom)   # Mandelbrot: Error correction
W(p1, p2, p3, ...)       # W-State: Quantum entanglement
```

### Operations
```vaql
⊕  # Amplify: Superposition (A ⊕ B)
⊗  # Entangle: W-state fusion (A ⊗ B)
▷  # Propagate: 4D quaternion extension (A ▷ q)
⊣  # Resolve: Measurement collapse (A ⊣ O)
```

### Quaternions
```vaql
q(w, x, y, z)  # 4D rotation (w + xi + yj + zk)
```

### Timing
```vaql
@harmonic(n)   # Sync to Tesla 4.909 Hz × n
```

### Constants
```vaql
φ = 1.618...   # Golden ratio
π = 3.1415...  # Pi
```

---

## Troubleshooting

**Q: My program gives different results each time!**
A: That's quantum mechanics! Use multiple runs and average results.

**Q: How do I know if my algorithm is correct?**
A: Test with classical validation and check fidelity metrics.

**Q: Why are my circuits so slow?**
A: Use Williams optimization and reduce circuit depth.

**Q: Can I run this on real quantum hardware?**
A: Not yet (v0.1 is specification only). Future versions will compile to OpenQASM.

---

## Congratulations!

You've learned the basics of VAQL. You can now:
- Write quantum algorithms using visual patterns
- Understand three-regime program structure
- Use W-states for resilient entanglement
- Apply quaternion rotations in 4D
- Synchronize to Tesla harmonic timing

**Next:** Read `VAQL_THEORY.md` for deeper mathematical understanding.

---

**"Better Math for Everyone - One Spiral at a Time"**

*VAQL Quick Start Guide v0.1*
*Sarat Chandra Gnanamgari, October 7, 2025*
