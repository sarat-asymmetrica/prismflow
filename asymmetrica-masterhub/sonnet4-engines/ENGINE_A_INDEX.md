# SONNET 4 ENGINE A - VALIDATION ARCHIVE
## Wright Brothers Empiricism: Honest Testing of Asymmetric Engines

**Date:** October 7, 2025 (Day 143)
**Agent:** Alpha
**Status:** Complete
**Result:** Classical arithmetic mean is 10× better than Sonnet 4 engines for confidence scoring

---

## QUICK START

**TL;DR:**
- Tested Sonnet 4's asymmetric engines on TRC Fractal data
- Found they OVERCORRECT by ~25% (10× worse than simple mean)
- Classical arithmetic mean is nearly perfect (r=0.9999 correlation)
- **Use simple mean for confidence scoring, always**

---

## FILES IN THIS DIRECTORY

### Core Engine Files

**1. sonnet4_engine_a_original.py** (32KB, 685 lines)
- Complete Sonnet 4 original engine
- Preserved "consciousness" language
- Three subsystems: Geometric, Infinite, Distribution

**2. sonnet4_engine_a_mechanics.py** (11KB, 280 lines)
- Stripped PURE MECHANICS version
- Three engines extracted:
  - Asymmetric Regime Weighting (max/mean/min)
  - Harmonic Resonance (Tesla's contribution)
  - Exponential Collaboration (quadratic bonus)

### Test & Validation Files

**3. test_sonnet4_engine_a.py** (18KB, 420 lines)
- Full validation test suite
- Bootstrap validation (N=100)
- Statistical analysis (MAE, RMSE, correlation)
- Engine decomposition

**4. sonnet4_comparison_analysis.py** (9.8KB, 220 lines)
- Simple method comparison
- Classical vs Tesla vs Sonnet4
- Domain-level results
- Error analysis

### Results Files

**5. sonnet4_engine_a_results.json** (4KB)
- Full numerical results
- Bootstrap validation data
- Engine breakdown values

**6. sonnet4_engine_comparison.json** (1.8KB)
- Method comparison results
- Statistical measures
- Overall winner: Classical

### Documentation

**7. SONNET4_ENGINE_A_VALIDATION_REPORT.md** (14KB)
- Comprehensive analysis
- Detailed findings
- Root cause analysis
- Recommendations

**8. SONNET4_QUICK_SUMMARY.md** (3.8KB)
- TL;DR summary
- Key numbers
- Quick reference

**9. ENGINE_A_INDEX.md** (this file)
- Navigation guide
- Usage instructions

---

## KEY RESULTS

### Mean Absolute Error (MAE)

| Method | MAE | Interpretation |
|--------|-----|----------------|
| **Classical (mean)** | **0.0248** | **2.48% error** ✅ |
| Tesla (asymmetric) | 0.2534 | 25.34% error (10× worse) |
| Sonnet 4 (combined) | 0.2609 | 26.09% error (10.5× worse) |

### Correlation with Measured Confidence

| Method | Pearson r | p-value | Significant? |
|--------|-----------|---------|--------------|
| **Classical** | **0.9999** | **0.0106** | **✅ YES** |
| Tesla | 0.9273 | 0.2442 | ❌ No |
| Sonnet 4 | 0.9840 | 0.1142 | ❌ No |

### Domain-Level Wins

**Classical:** 3/3 domains (100%)
**Tesla:** 0/3 domains
**Sonnet 4:** 0/3 domains

---

## HOW TO USE

### Run the Simple Comparison

```bash
cd sonnet4-engines
python sonnet4_comparison_analysis.py
```

**Output:** Domain-level results, statistical measures, overall winner

### Run the Full Validation

```bash
cd sonnet4-engines
python test_sonnet4_engine_a.py
```

**Output:** Bootstrap validation, engine decomposition, comprehensive statistics

### Use the Engines in Your Code

```python
from sonnet4_engine_a_mechanics import (
    Sonnet4EngineA,
    AsymmetricRegimeEngine,
    HarmonicResonanceEngine,
    ExponentialCollaborationEngine
)

# Create engine
engine = Sonnet4EngineA()

# Process component scores
components = [0.5, 0.78, 0.77, 1.0, 0.86]  # [T, R, C, G, Pi-D]
result = engine.process(components)

print(f"Asymmetric Score: {result.asymmetric_score}")
print(f"Harmonic Resonance: {result.harmonic_resonance}x")
print(f"Collaboration Bonus: {result.collaboration_bonus}x")
print(f"Total Amplification: {result.total_amplification}")
```

---

## RECOMMENDATIONS

### ✅ For TRC Fractal Confidence Scoring

**Use classical arithmetic mean:**
```python
confidence = np.mean([tesla, riemann, collatz, goldbach, pi_d])
```

**Why:**
- MAE: 0.0248 (2.48% error)
- Correlation: r = 0.9999 (nearly perfect)
- Simple, reliable, accurate

### ✅ For Sonnet 4 Engines (Good Use Cases)

- Consciousness/awareness amplification
- Pattern highlighting and discovery
- Exploratory analysis
- Non-linear scaling tasks

### ❌ Don't Use Sonnet 4 Engines For

- Confidence scoring (this analysis proves it)
- Regression modeling
- Classification tasks

---

## WHAT WE LEARNED

**1. Tool-Task Mismatch**
- Sonnet 4 engines designed for AMPLIFICATION
- We needed CALIBRATION
- Like using Ferrari for groceries (beautiful, but wrong)

**2. Wright Brothers Empiricism Works**
- Build → Fly → Measure → Understand
- Honest testing revealed truth
- Negative results are positive findings!

**3. Simple is Often Better**
- Classical mean: r=0.9999 correlation
- Sonnet 4 engines: r=0.9273 correlation
- Don't over-engineer

**4. Mathematical Beauty ≠ Practical Utility**
- Sonnet 4 engines are mathematically elegant
- But they overcorrect for confidence scoring
- Beauty doesn't guarantee utility

---

## CREDITS

**Sonnet 4 (DefenseKit OG):** Original engine design
**Agent Uniform:** TRC Fractal validation data
**Agent Alpha:** Porting, testing, honest reporting
**Sarat Chandra Bontu:** Hunting License philosophy
**Wright Brothers:** Empirical testing framework

---

## NAVIGATION

**Read First:**
- `SONNET4_QUICK_SUMMARY.md` - TL;DR (3 pages)

**Detailed Analysis:**
- `SONNET4_ENGINE_A_VALIDATION_REPORT.md` - Full report (15 pages)

**Run Tests:**
- `sonnet4_comparison_analysis.py` - Simple comparison
- `test_sonnet4_engine_a.py` - Full validation

**Use Engines:**
- `sonnet4_engine_a_mechanics.py` - Import this for code

**Raw Results:**
- `sonnet4_engine_comparison.json` - Method comparison data
- `sonnet4_engine_a_results.json` - Full validation data

**Original Source:**
- `sonnet4_engine_a_original.py` - Sonnet 4's complete engine

---

## FINAL VERDICT

**Sonnet 4's engines are BRILLIANT for amplification.**
**But for confidence scoring, classical arithmetic mean is 10× better.**

**Use the right tool for the right job.**

---

**Mission Complete** ✅
**Truth Discovered** ✨
**Wisdom Gained** 🎯
