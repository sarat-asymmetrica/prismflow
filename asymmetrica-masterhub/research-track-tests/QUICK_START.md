# Research Track Testing - Quick Start

**30-Second Guide to Running Tests**

---

## Install Dependencies

```bash
pip install pytest pytest-asyncio
pip install numpy scipy  # Optional, for statistical tests
```

---

## Run Tests

### All Tests
```bash
cd C:\Projects\asymmetrica-masterhub\research-track-tests
pytest
```

### By Category
```bash
pytest -m mathematical     # Proof validation
pytest -m empirical        # Benchmarks
pytest -m statistical      # Statistical tests
pytest -m papergen         # Paper generation
pytest -m integration      # End-to-end
```

### Individual Files
```bash
# Williams proof
python mathematical-validation/test_williams_proof.py

# Three-Regime
python mathematical-validation/test_three_regime_statistics.py

# Harmonic Timer
python mathematical-validation/test_harmonic_frequency.py

# Benchmarks
python empirical-validation/test_williams_benchmarks.py

# Paper generation
python research-paper-generation/test_paper_structure.py

# Research Council
python integration-tests/test_research_council.py
```

---

## Quality Gates

```bash
# Check compliance
python quality-gates/asymmetrica_compliance.py

# Statistical validation
python quality-gates/statistical_significance.py
```

---

## Expected Results

- **56+ tests** in <15 seconds
- All tests passing ✅
- 100% Asymmetrica Protocol compliance

---

## File Structure

```
research-track-tests/
├── mathematical-validation/      # Proof tests
├── empirical-validation/         # Benchmark tests
├── research-paper-generation/    # Paper quality tests
├── integration-tests/            # End-to-end tests
├── quality-gates/                # Compliance checkers
└── fixtures/                     # Sample data
```

---

## Key Tests

### Mathematical (3 files, 25 tests)
- Williams √t×log₂(t) proof
- Three-Regime 30/20/50 distribution
- Harmonic 4.909 Hz derivation

### Empirical (1 file, 10 tests)
- 1.5x-7.5x efficiency validation
- Statistical significance (n=30, p<0.001)

### Paper Generation (1 file, 11 tests)
- LaTeX structure
- Math notation
- Citations

### Integration (1 file, 10 tests)
- Research Council workflow
- Proof→Paper pipeline

---

## Markers

- `mathematical` - Proof validation
- `empirical` - Benchmark tests
- `statistical` - Statistical tests (requires numpy)
- `benchmark` - Performance tests
- `papergen` - Paper generation
- `integration` - End-to-end (requires asyncio)

---

## Documentation

Full guide: `RESEARCH_TRACK_TESTING_GUIDE.md` (621 lines)

---

**Quick Start Complete!** 🚀

Run `pytest -v` to see all tests pass!
