# Asymmetrica Protocol Quality Gates Guide

**Version:** 1.0.0
**Date:** October 7, 2025
**Status:** Production-Ready (alpha-0)

---

## Overview

This guide explains the automated quality enforcement system for the Asymmetrica Protocol. It combines **protocol compliance checking** with **Three-Regime test distribution** to ensure high-quality, well-documented, and empirically validated code.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Protocol Compliance](#protocol-compliance)
3. [Three-Regime Test System](#three-regime-test-system)
4. [Pre-Commit Hooks](#pre-commit-hooks)
5. [CI/CD Integration](#cicd-integration)
6. [Developer Workflow](#developer-workflow)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Installation

```bash
# 1. Install pre-commit
pip install pre-commit

# 2. Install git hooks
pre-commit install

# 3. Install test dependencies
pip install pytest pytest-cov pyyaml

# 4. Run initial compliance check
python scripts/check_protocol_compliance.py
```

### First Test Run

```bash
# Run tests with regime reporting
pytest --regime-report --verbose

# View regime distribution report
cat test_logs/regime_report.json
```

---

## Protocol Compliance

### Required Annotations

All production Python files must include three annotations:

#### 1. @complexity

Describes the algorithmic complexity in Big-O notation.

```python
"""
@complexity O(n) where n = number of items
"""
```

**Examples:**
- `O(1)` - Constant time (hash lookups, array access)
- `O(log n)` - Logarithmic (binary search)
- `O(n)` - Linear (single loop)
- `O(n log n)` - Linearithmic (efficient sorting)
- `O(n²)` - Quadratic (nested loops)

#### 2. @performance

Specifies measurable performance targets with validation status.

```python
"""
@performance Target: <50ms (validated: 17.31ms)
"""
```

**Format:**
- Must include "Target:" or "target:"
- Should include measured values when validated
- Use realistic, testable metrics

#### 3. @validation

Classifies code maturity level using Greek letters.

```python
"""
@validation alpha-0 - Production-ready (5/5 tests passing)
"""
```

**Levels:**
- **alpha-0 (α₀)**: Production-ready, 100% tests passing, deployed to production
- **alpha-1 (α₁)**: Needs review, >80% tests passing, staging deployment
- **alpha-2 (α₂)**: Experimental, research-level, not production-ready

### Compliance Checking

#### Manual Check

```bash
# Full compliance report
python scripts/check_protocol_compliance.py

# Check specific annotation type
python scripts/check_protocol_compliance.py --check-validation
python scripts/check_protocol_compliance.py --check-performance
python scripts/check_protocol_compliance.py --check-complexity

# Custom threshold
python scripts/check_protocol_compliance.py --min-compliance 90
```

#### Expected Output

```
=== Full Asymmetrica Protocol Compliance ===
Files scanned: 10
Fully compliant: 10 (100.0%)
Threshold: 80.0%

Validation Level Distribution:
  alpha-0 (Production-ready): 8
  alpha-1 (Needs review): 2
  alpha-2 (Experimental): 0
  Missing: 0

[PASS] 100.0% compliance (>= 80.0%)
```

---

## Three-Regime Test System

### Regime Classification

Tests are classified into three regimes using pytest markers:

#### 1. Exploration Regime (30% target)

**Purpose:** Edge cases, new features, experimental code
**Pass Threshold:** 70%
**Weight:** 0.70

```python
import pytest

@pytest.mark.exploration
def test_new_feature_edge_case():
    """Test experimental feature with unusual input"""
    # It's OK if some exploration tests fail
    assert experimental_function(edge_case_input) is not None
```

**Use for:**
- New features under development
- Edge cases and corner scenarios
- Experimental algorithms
- Proof-of-concept code

#### 2. Optimization Regime (20% target)

**Purpose:** Performance, refactoring, efficiency improvements
**Pass Threshold:** 85%
**Weight:** 0.85

```python
import pytest

@pytest.mark.optimization
def test_batch_processing_performance():
    """Verify batch processing meets performance targets"""
    start = time.time()
    process_batch(1000_items)
    duration = time.time() - start
    assert duration < 1.0  # Must complete in <1s
```

**Use for:**
- Performance benchmarks
- Refactoring validation
- Memory usage optimization
- Algorithm efficiency tests

#### 3. Stabilization Regime (50% target)

**Purpose:** Critical paths, regression tests, production code
**Pass Threshold:** 100%
**Weight:** 1.00

```python
import pytest

@pytest.mark.stabilization
def test_user_authentication_flow():
    """Critical: User login must work"""
    user = authenticate(username, password)
    assert user is not None
    assert user.is_authenticated
```

**Use for:**
- Critical user flows
- Security-critical code
- Data integrity validation
- Regression prevention

### Weighted Confidence Score

The system calculates an overall confidence score:

```
confidence = Σ (regime_pass_rate × regime_weight × regime_proportion)

Example:
- Exploration: 80% pass × 0.70 weight × 30% = 16.8%
- Optimization: 90% pass × 0.85 weight × 20% = 15.3%
- Stabilization: 100% pass × 1.00 weight × 50% = 50.0%

Total Weighted Confidence: 82.1%
```

### Running Regime Tests

```bash
# Run all tests with regime report
pytest --regime-report --verbose

# Run specific regime only
pytest -m exploration
pytest -m optimization
pytest -m stabilization

# Run critical tests only
pytest -m "stabilization and critical"

# Skip slow tests
pytest -m "not slow"
```

### Regime Report

After running tests, check `test_logs/regime_report.json`:

```json
{
  "timestamp": "2025-10-07T07:30:00",
  "total_tests": 100,
  "weighted_confidence": 85.5,
  "regimes": {
    "exploration": {
      "total": 30,
      "passed": 24,
      "failed": 6,
      "pass_rate": 0.80,
      "actual_ratio": 0.30,
      "target_ratio": 0.30,
      "pass_threshold": 0.70
    },
    "optimization": {
      "total": 20,
      "passed": 18,
      "failed": 2,
      "pass_rate": 0.90,
      "actual_ratio": 0.20,
      "target_ratio": 0.20,
      "pass_threshold": 0.85
    },
    "stabilization": {
      "total": 50,
      "passed": 50,
      "failed": 0,
      "pass_rate": 1.00,
      "actual_ratio": 0.50,
      "target_ratio": 0.50,
      "pass_threshold": 1.00
    }
  }
}
```

---

## Pre-Commit Hooks

### What Gets Checked

Pre-commit hooks automatically validate:

1. **Code formatting** (black, isort)
2. **Linting** (flake8)
3. **Type checking** (mypy)
4. **Protocol compliance** (custom)
5. **Annotation presence** (custom)

### Installation

```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Test hooks
pre-commit run --all-files
```

### Hook Configuration

See `.pre-commit-config.yaml` for full configuration. Key hooks:

```yaml
- id: asymmetrica-protocol-compliance
  name: Asymmetrica Protocol Compliance
  entry: python scripts/check_protocol_compliance.py
```

### Bypassing Hooks (Emergency Only)

```bash
# Skip all hooks (use sparingly!)
git commit --no-verify -m "Emergency fix"

# Skip specific hook
SKIP=asymmetrica-protocol-compliance git commit -m "WIP"
```

---

## CI/CD Integration

### GitHub Actions Workflow

The `.github/workflows/quality-gates.yml` workflow runs on:

- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`
- Manual triggers

### Quality Gates (BLOCKING)

These must pass for PR merge:

1. **Protocol Compliance:** ≥80% compliance rate
2. **Validation Annotations:** 100% of files
3. **Performance Annotations:** 100% of files
4. **Complexity Annotations:** 100% of files
5. **Stabilization Tests:** 100% pass rate
6. **Memory System:** 100% pass rate (5/5 tests)

### Quality Gates (WARNING)

These generate warnings but don't block:

1. **Optimization Tests:** ≥85% pass rate
2. **Exploration Tests:** ≥70% pass rate

### Quality Gates (INFORMATIONAL)

Reported but not enforced:

1. **Weighted Confidence:** Reported in summary
2. **Regime Distribution:** Actual vs. target (30/20/50)

### Viewing CI Results

1. Go to GitHub Actions tab
2. Select "Asymmetrica Quality Gates" workflow
3. View job results:
   - Protocol Compliance Check
   - Three-Regime Test Suite
   - Memory System Validation
   - Quality Gate Summary

### Artifacts

Download test reports from Actions:
- `regime-test-report` - JSON report with full metrics

---

## Developer Workflow

### 1. Feature Development

```bash
# 1. Create feature branch
git checkout -b feature/new-algorithm

# 2. Write code with annotations
# File: new_algorithm.py
"""
New sorting algorithm with O(n log n) complexity

@complexity O(n log n) where n = array length
@performance Target: <100ms for 10K items
@validation alpha-2 - Experimental (research phase)
"""

# 3. Write tests (mark as exploration initially)
@pytest.mark.exploration
def test_new_algorithm_basic():
    """Test basic functionality"""
    result = new_algorithm([3, 1, 2])
    assert result == [1, 2, 3]

# 4. Run tests locally
pytest --regime-report

# 5. Check compliance
python scripts/check_protocol_compliance.py
```

### 2. Code Review & Refinement

```bash
# 1. Address failing tests
# 2. Move tests to optimization regime when stable
@pytest.mark.optimization
def test_new_algorithm_performance():
    """Benchmark performance"""
    # ...

# 3. Update validation level
@validation alpha-1 - Needs review (8/10 tests passing)
```

### 3. Production Deployment

```bash
# 1. Ensure all stabilization tests pass
pytest -m stabilization

# 2. Move critical tests to stabilization
@pytest.mark.stabilization
def test_new_algorithm_critical_path():
    """Production-critical test"""
    # ...

# 3. Update validation level
@validation alpha-0 - Production-ready (10/10 tests passing)

# 4. Commit with hooks
git add .
git commit -m "feat: Add optimized sorting algorithm"

# 5. Push and create PR
git push origin feature/new-algorithm

# 6. Wait for CI to pass
# 7. Merge to main
```

---

## Troubleshooting

### Pre-Commit Hook Fails

**Problem:** Hook fails but you can't see why

```bash
# Run hooks manually to see full output
pre-commit run --all-files --verbose
```

**Problem:** Hook fails on specific file

```bash
# Run compliance check on single file
python scripts/check_protocol_compliance.py --path path/to/file.py
```

### Tests Fail in CI but Pass Locally

**Problem:** Regime thresholds met locally but CI fails

```bash
# Check if report file exists
ls test_logs/regime_report.json

# Validate thresholds manually
python scripts/validate_regime_thresholds.py
```

**Problem:** Unicode encoding errors

The scripts have been updated to avoid Unicode emojis on Windows. If you still see errors, ensure your terminal supports UTF-8:

```bash
# Windows PowerShell
$env:PYTHONIOENCODING = "utf-8"

# Or use plain ASCII output in scripts
```

### Compliance Check Fails

**Problem:** Missing annotations

```bash
# Find files missing annotations
python scripts/check_protocol_compliance.py --check-validation
```

**Fix:** Add required annotations to file docstrings:

```python
"""
Your module description here

@complexity O(n) - describe your complexity
@performance Target: <100ms - add measurable target
@validation alpha-1 - classify your code maturity
"""
```

### Regime Distribution Off Target

**Problem:** Too many tests in one regime

**Solution:** Review test markers and reclassify:
- New/experimental → `@pytest.mark.exploration`
- Performance/refactoring → `@pytest.mark.optimization`
- Critical/stable → `@pytest.mark.stabilization`

**Target distribution:**
- 30% Exploration
- 20% Optimization
- 50% Stabilization

---

## Best Practices

### 1. Write Tests First

```python
# Write exploration test for new feature
@pytest.mark.exploration
def test_new_feature():
    """Test basic behavior"""
    # ...

# Implement feature
def new_feature():
    """
    @complexity O(n)
    @performance Target: <10ms
    @validation alpha-2 - Experimental
    """
    # ...
```

### 2. Promote Tests as Code Matures

```python
# Start: Exploration
@pytest.mark.exploration

# After benchmarking: Optimization
@pytest.mark.optimization

# After production validation: Stabilization
@pytest.mark.stabilization
```

### 3. Keep Stabilization Tests Fast

Stabilization tests run on every commit and must pass 100%. Keep them:
- Fast (<1s each)
- Deterministic (no flaky tests)
- Critical-path only

### 4. Document Performance Targets

Always include measured values when available:

```python
# Good
@performance Target: <50ms (validated: 17.31ms, 65% better)

# Bad
@performance Fast enough
```

### 5. Use Meaningful Validation Levels

```python
# alpha-0: In production, 100% tests pass
@validation alpha-0 - Production-ready (50/50 tests passing)

# alpha-1: Staging, most tests pass
@validation alpha-1 - Needs review (45/50 tests passing)

# alpha-2: Research, experimental
@validation alpha-2 - Experimental (proof of concept)
```

---

## Configuration Files Reference

### `.pre-commit-config.yaml`

Pre-commit hook configuration. Defines all quality checks that run before commits.

### `pytest.ini`

Pytest configuration with regime markers and test discovery settings.

### `conftest.py`

Pytest plugin for regime reporting. Calculates weighted confidence scores.

### `.github/workflows/quality-gates.yml`

GitHub Actions workflow for CI/CD quality enforcement.

### `scripts/check_protocol_compliance.py`

Protocol compliance checker script. Validates annotations.

### `scripts/validate_regime_thresholds.py`

Regime threshold validator. Ensures test pass rates meet targets.

---

## Metrics & Reporting

### Key Metrics

1. **Protocol Compliance Rate:** % of files with all annotations
2. **Validation Level Distribution:** How many files at each alpha level
3. **Regime Pass Rates:** % of tests passing per regime
4. **Weighted Confidence:** Overall quality score (0-100%)
5. **Regime Distribution:** Actual vs. target (30/20/50)

### Report Locations

- **Protocol Compliance:** Console output from `check_protocol_compliance.py`
- **Regime Report:** `test_logs/regime_report.json`
- **Memory System:** `sdk-integration/memory/memory_validation_report.json`
- **CI/CD Results:** GitHub Actions artifacts

---

## Support & Contact

For questions or issues:

1. Check this guide first
2. Review error messages carefully
3. Run compliance/validation checks manually
4. Check existing test examples in `sdk-integration/`
5. Consult `CLAUDE.md` for project context

---

## Version History

**1.0.0** (October 7, 2025)
- Initial release
- Protocol compliance checking
- Three-Regime test system
- Pre-commit hooks
- CI/CD integration
- Memory system validation (5/5 tests passing, alpha-0)

---

**Last Updated:** October 7, 2025
**Status:** Production-Ready (alpha-0)
**Maintained by:** Agent Oscar (Quality Assurance Specialist)
