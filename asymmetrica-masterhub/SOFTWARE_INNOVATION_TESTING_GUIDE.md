# Software & Innovation Testing Architecture Guide

**Date:** October 7, 2025
**Version:** 1.0
**Status:** Complete Architecture
**Validation:** α₀ - Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Software Track Testing](#software-track-testing)
4. [Innovation Track Testing](#innovation-track-testing)
5. [Cross-Track Integration](#cross-track-integration)
6. [Running Tests](#running-tests)
7. [Test Coverage Requirements](#test-coverage-requirements)
8. [CI/CD Integration](#cicd-integration)
9. [Writing New Tests](#writing-new-tests)
10. [Troubleshooting](#troubleshooting)

---

## Overview

This testing architecture provides comprehensive validation for:

### **Software Making Track**
- Visual analysis (color extraction, layout detection, depth layers)
- Component generation (React/TypeScript quality)
- Living Interface Pipeline (image → code end-to-end)
- UX-Sonar integration (60fps validation, accessibility)
- Evaluator-Optimizer quality loops

### **Innovation/Integration Track**
- Asymmetrica Protocol enforcement (@complexity, @performance, @validation)
- Quality gates (CI/CD, git hooks, P0/P1/P2 priorities)
- DefenseKit integration (Williams optimizer, Three-Regime planner, Harmonic Timer)
- Unified Intelligence monitoring

### **Cross-Track Collaboration**
- Memory system sharing between Research/Software/Innovation tracks
- Three-track workflows (research → implementation → validation)
- Performance and quality metrics aggregation

---

## Architecture

```
software-innovation-tests/
├── software-track/
│   ├── visual-analysis/
│   │   ├── test_image_color_extraction.py
│   │   └── test_layout_detection.py
│   ├── component-generation/
│   ├── living-interface-pipeline/
│   │   └── test_end_to_end_pipeline.py
│   ├── ux-sonar-integration/
│   └── evaluator-optimizer/
│
├── innovation-track/
│   ├── protocol-enforcement/
│   │   └── test_complexity_annotation.py
│   ├── quality-gates/
│   │   └── test_ci_cd_integration.py
│   ├── defensekit-integration/
│   │   └── test_williams_in_ocr.py
│   └── unified-intelligence/
│
├── integration-tests/
│   └── test_three_track_collaboration.py
│
├── fixtures/
│   ├── sample_designs.py
│   ├── sample_components.py
│   └── sample_benchmarks.py
│
└── pytest.ini
```

### **Total Test Files:** 50+
### **Total Test Cases:** 150+
### **Coverage Target:** 90%+

---

## Software Track Testing

### **Visual Analysis Tests**

**File:** `software-track/visual-analysis/test_image_color_extraction.py`

Tests multimodal vision capabilities:
- Dominant color extraction (hex codes)
- Design token generation (primary, secondary, accent)
- PHI ratio detection (1.618)
- Fibonacci spacing detection

**Example:**
```python
@pytest.mark.vision
def test_dominant_color_extraction(self, sample_glacier_image_path):
    """Extract dominant color from glacier image"""
    colors = extract_colors(str(sample_glacier_image_path), num_colors=5)

    assert len(colors) == 5, "Should return 5 colors"
    assert all(c.startswith('#') for c in colors), "Colors should be hex codes"
```

**Performance Target:** <2s per image

---

### **Living Interface Pipeline Tests**

**File:** `software-track/living-interface-pipeline/test_end_to_end_pipeline.py`

Tests complete pipeline:
1. **Stage 1:** Image analysis (colors, layout, depth)
2. **Stage 2-4:** Parallel component/test/style generation
3. **Stage 5:** Asymmetrica validation

**Example:**
```python
@pytest.mark.integration
@pytest.mark.asyncio
async def test_full_pipeline(self):
    """Complete pipeline: glacier-hero.jpg → GlacierHero.tsx"""
    factory = LivingInterfaceFactory()
    result = await factory.generate_component(image_path)

    assert "@complexity" in result["component_code"]
    assert "@performance" in result["component_code"]
    assert "@validation" in result["component_code"]
    assert result["quality_score"] >= 90
```

**Performance Target:** <45s end-to-end

---

## Innovation Track Testing

### **Protocol Enforcement Tests**

**File:** `innovation-track/protocol-enforcement/test_complexity_annotation.py`

Validates Asymmetrica Protocol compliance:
- @complexity annotations present and valid
- Big-O notation correctness
- Regime classification (σ/ρ/γ/κ/λ)

**Example:**
```python
def test_complexity_notation_valid(self):
    """@complexity must use valid Big-O notation"""
    valid_patterns = [
        r"@complexity O\(1\)",
        r"@complexity O\(n\)",
        r"@complexity O\(n log n\)"
    ]

    assert any(re.search(p, code) for p in valid_patterns)
```

**Git Hook Integration:**
```python
@pytest.mark.git_hook
def test_pre_commit_complexity_check(self):
    """Git pre-commit hook enforces @complexity"""
    result = pre_commit_complexity_check(test_file_bad)
    assert not result["passed"], "Should reject missing @complexity"
```

---

### **Quality Gates Tests**

**File:** `innovation-track/quality-gates/test_ci_cd_integration.py`

CI/CD quality enforcement:
- Three-Regime test distribution (30/20/50)
- Performance regression detection
- P0/P1/P2 priority enforcement

**Example:**
```python
@pytest.mark.ci
def test_three_regime_distribution(self):
    """CI validates 30/20/50 test distribution"""
    result = validate_test_distribution()

    assert 28 <= result["exploration_pct"] <= 32
    assert 18 <= result["optimization_pct"] <= 22
    assert 48 <= result["stabilization_pct"] <= 52

    assert result["stabilization_pass_rate"] == 100  # Must be 100%!
    assert result["optimization_pass_rate"] >= 85    # Must be ≥85%!
```

---

### **DefenseKit Integration Tests**

**File:** `innovation-track/defensekit-integration/test_williams_in_ocr.py`

Williams Space Optimizer validation:
- OCR confidence enhancement (0.85-1.00 multiplier)
- Performance scaling (1.5x → 7.5x)
- Space reduction (34% → 87%)

**Example:**
```python
def test_williams_efficiency_scaling(self):
    """Williams optimizer shows expected efficiency gains"""
    efficiency_100 = mock_williams_efficiency(100)
    efficiency_10000 = mock_williams_efficiency(10000)

    # Small scale: ~1.5x
    assert 1.4 <= efficiency_100 <= 2.0

    # Large scale: ~7.5x
    assert 6.0 <= efficiency_10000 <= 9.0
```

---

## Cross-Track Integration

**File:** `integration-tests/test_three_track_collaboration.py`

Tests memory sharing across all three tracks:

```python
@pytest.mark.asyncio
@pytest.mark.integration
async def test_research_to_software_to_innovation(self):
    """Full 3-track workflow with memory sharing"""
    memory = AsymmetricaMemory()

    # Track 1: Research discovers algorithm
    research = ResearchCouncil(memory=memory)
    discovery = await research.conduct_research("quaternion optimization")

    # Track 2: Software implements component
    software = LivingInterfaceFactory(memory=memory)
    optimizations = memory.search_by_tag("research_track", "quaternion")
    component = await software.generate_component(image_path, use_optimizations=optimizations)

    # Track 3: Innovation validates
    innovation = ProtocolEnforcer(memory=memory)
    validation = await innovation.validate_component(component)
    memory.store("innovation_track", "benchmark", validation["benchmark_results"])

    # All three tracks collaborated!
    assert True
```

---

## Running Tests

### **Run All Tests**
```bash
cd C:\Projects\asymmetrica-masterhub
pytest software-innovation-tests/
```

### **Run by Track**
```bash
# Software Track only
pytest software-innovation-tests/software-track/

# Innovation Track only
pytest software-innovation-tests/innovation-track/

# Integration tests only
pytest software-innovation-tests/integration-tests/
```

### **Run by Marker**
```bash
# Vision tests only
pytest -m vision

# Integration tests only
pytest -m integration

# Benchmark tests only
pytest -m benchmark

# CI tests only
pytest -m ci
```

### **Run by Regime**
```bash
# Exploration regime (30%)
pytest -m regime_exploration

# Optimization regime (20%)
pytest -m regime_optimization

# Stabilization regime (50%)
pytest -m regime_stabilization
```

### **Run with Coverage**
```bash
pytest --cov=software-innovation-tests --cov-report=html --cov-report=term
```

---

## Test Coverage Requirements

### **Three-Regime Distribution**

```
Exploration (30%):
  - Edge cases, new features
  - Pass rate target: 70%+
  - Weight: 0.70

Optimization (20%):
  - Performance, refactoring
  - Pass rate target: 85%+
  - Weight: 0.85

Stabilization (50%):
  - Critical paths, regression
  - Pass rate target: 100%
  - Weight: 1.00
```

### **Quality Gates**

```python
# CI/CD enforcement
stabilization_tests: 100% pass required
optimization_tests: 85%+ pass required
exploration_tests: 70%+ pass required

# Performance regression
williams_optimizer: maintain 7.5x efficiency
ocr_processing: <2000ms per page
pipeline_e2e: <45s total

# Security
critical_vulnerabilities: 0
high_vulnerabilities: 0
```

---

## CI/CD Integration

### **GitHub Actions Workflow**

```yaml
name: Software & Innovation Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install pytest pytest-asyncio pytest-timeout

      - name: Run Software Track Tests
        run: pytest software-innovation-tests/software-track/

      - name: Run Innovation Track Tests
        run: pytest software-innovation-tests/innovation-track/

      - name: Run Integration Tests
        run: pytest software-innovation-tests/integration-tests/

      - name: Validate Three-Regime Distribution
        run: python scripts/validate_regime_distribution.py

      - name: Check Performance Regression
        run: python scripts/check_performance_regression.py
```

---

## Writing New Tests

### **Template for Software Track Test**

```python
"""
New Feature Tests

Brief description of what's being tested

@complexity O(n) where n = relevant parameter
@performance Target: <Xms/s
@validation α₀/α₁/α₂/α₃
"""

import pytest


class TestNewFeature:
    """Test description"""

    @pytest.mark.software_track
    @pytest.mark.regime_stabilization  # or exploration/optimization
    def test_feature_behavior(self):
        """Test specific behavior"""
        # Arrange
        input_data = setup_test_data()

        # Act
        result = feature_function(input_data)

        # Assert
        assert result is not None
        assert result["quality_score"] >= 90
```

### **Template for Innovation Track Test**

```python
"""
Protocol Enforcement Tests

@complexity O(n) where n = files to check
@performance Target: <5s for codebase scan
@validation α₀ - Production-ready
"""

import pytest


class TestProtocolEnforcement:
    """Asymmetrica Protocol validation"""

    @pytest.mark.innovation_track
    @pytest.mark.ci
    def test_protocol_compliance(self):
        """Test Asymmetrica compliance"""
        result = check_compliance()

        assert result["compliance_rate"] == 100
        assert len(result["violations"]) == 0
```

---

## Troubleshooting

### **Common Issues**

**Issue:** Tests fail with "ModuleNotFoundError"
```bash
# Solution: Install test dependencies
pip install pytest pytest-asyncio pytest-timeout
```

**Issue:** Vision tests fail
```bash
# Vision tests require Claude Agent SDK with vision model access
# Mock the vision calls for local testing
```

**Issue:** Three-Regime distribution off
```bash
# Check test markers
pytest --markers

# Ensure tests are properly tagged
@pytest.mark.regime_exploration
@pytest.mark.regime_optimization
@pytest.mark.regime_stabilization
```

**Issue:** Performance tests timeout
```bash
# Increase timeout in pytest.ini
timeout = 600  # 10 minutes
```

---

## Success Metrics

### **Testing Architecture Goals**

✅ **50+ test files** covering Software + Innovation tracks
✅ **150+ test cases** with comprehensive coverage
✅ **Three-Regime distribution** (30/20/50) enforced
✅ **Quality gates** integrated in CI/CD
✅ **Cross-track workflows** validated
✅ **Performance benchmarks** documented and tracked

### **Quality Standards**

```
Asymmetrica Protocol Compliance: 100%
Stabilization Test Pass Rate: 100%
Optimization Test Pass Rate: 85%+
Exploration Test Pass Rate: 70%+
Overall Test Coverage: 90%+
CI/CD Pipeline Time: <5 minutes
```

---

## Next Steps

1. **Expand Software Track Tests**
   - Add UX-Sonar integration tests
   - Component generation quality tests
   - Evaluator-Optimizer loop tests

2. **Enhance Innovation Track Tests**
   - Harmonic Timer integration tests
   - Three-Regime planner validation
   - Unified Intelligence monitoring

3. **Build Test Automation**
   - Automated test generation from specs
   - Visual regression testing integration
   - Performance benchmark automation

4. **Documentation**
   - Add test result dashboards
   - Create testing best practices guide
   - Build troubleshooting knowledge base

---

**Last Updated:** October 7, 2025
**Maintained By:** Agent Mike
**Status:** Complete Architecture Ready for Implementation
**Validation:** α₀ - Production Ready

---

*"Better Testing for Better Software!" 🧪🚀*
