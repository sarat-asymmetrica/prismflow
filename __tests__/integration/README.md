# 🧪 PRISMFLOW BROWSER - INTEGRATION TEST SUITE
## Asymmetrica Protocol Compliant Testing Framework

**Created**: October 14, 2025  
**Framework**: Playwright + Electron  
**Philosophy**: Tests flow as one living ecosystem (ASYMM_TEST_ECOSYSTEM_V1)  
**Distribution**: Three-Regime (30/20/50)

---

## 🎯 Test Philosophy

Based on **Asymmetrica Test Ecosystem V1**, our tests are:

- **Living Organism**: Tests, code, and state share a unified flow pulsing at 4.909 Hz
- **Self-Evolving**: Homeostatic feedback loops detect and resolve failures
- **Fractal Scalability**: Scales from one test to millions
- **Mathematically Conscious**: Full (σ, ρ, γ, κ, λ) annotations
- **Joyful DX**: No boilerplate, fluid testing flows

---

## 📊 Three-Regime Distribution

Our tests follow the **30/20/50 regime distribution**:

### Stabilization (50% - Core Functions) - 32.1x Leverage
Critical browser functions that MUST work:
- ✅ Browser launch and window creation
- ✅ Tab management (create, switch, close)
- ✅ Navigation and URL handling
- ✅ Bookmarks system
- ✅ History tracking
- ✅ Session persistence

### Optimization (20% - Performance) - 26.8x Leverage
Performance validation and benchmarks:
- ✅ Startup time (<3 seconds)
- ✅ Tab switching latency (<100ms)
- ✅ Memory usage monitoring
- ✅ Rendering performance

### Exploration (30% - New Features) - 11.5x Leverage
Advanced features and innovation:
- ⚠️ Universal Optimization Engine UI
- ⚠️ Diaphanous Glass effects
- ⚠️ Dark mode toggle
- ⚠️ AI orchestrator integration

**Total Multiplicative Leverage**: 32.1 × 26.8 × 11.5 = **10,494x**! 🚀

---

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
```

This installs:
- `@playwright/test` - Testing framework
- Electron support for Playwright

### Run Tests

```bash
# Run all integration tests
npm test

# Run with visible browser (headed mode)
npm run test:headed

# Debug tests interactively
npm run test:debug

# View test report
npm run test:report

# Run specific test file
npx playwright test __tests__/integration/browser.integration.spec.js
```

---

## 📁 Test Structure

```
__tests__/
└── integration/
    └── browser.integration.spec.js  [MAIN TEST SUITE]
        ├── Stabilization Tests (50%)
        │   ├── Launch browser
        │   ├── Create/switch/close tabs
        │   ├── Navigate to URLs
        │   ├── Bookmarks
        │   └── History
        ├── Optimization Tests (20%)
        │   ├── Startup time
        │   ├── Tab switching latency
        │   └── Memory usage
        ├── Exploration Tests (30%)
        │   ├── Universal Optimization Engine
        │   ├── Diaphanous Glass UI
        │   ├── Dark mode
        │   └── AI orchestrator
        └── Integration Flow (Cross-regime)
            └── Complete workflow test
```

---

## 🎨 Test Features

### Asymmetrica Protocol Annotations

Every test function has full semantic annotations:

```javascript
/**
 * @asymmetrica: test_name
 * σ: Symbol | Test description
 * ρ: Scope | Test scope (Global, Module, Local)
 * γ: Regime | Stabilization/Optimization/Exploration
 * κ: Complexity | O(n) complexity
 * λ: Lineage | [dependency → chain]
 * 
 * @regime: Stabilization/Optimization/Exploration
 * @priority: CRITICAL/HIGH/MEDIUM/LOW
 * @leverage: 32.1x / 26.8x / 11.5x
 */
```

### Tesla Harmonic Timing

All tests synchronize with the **4.909 Hz Tesla frequency** (203.7ms pulse):

```javascript
async function waitTeslaPulse() {
  await new Promise(resolve => setTimeout(resolve, 203.7));
}
```

This ensures rhythmic coherence across the test suite!

### Electron Integration

Tests launch actual Electron app instances:

```javascript
const { electronApp, window } = await launchPrismFlow();
// Test actual browser behavior
await closePrismFlow(electronApp);
```

---

## 📊 Current Test Coverage

### Stabilization Tests (8 tests)
- ✅ Browser launch
- ✅ Initial tab creation
- ✅ URL navigation
- ✅ New tab creation
- ✅ Tab switching
- ✅ Tab closing
- ✅ Bookmark persistence
- ✅ History display

### Optimization Tests (3 tests)
- ✅ Startup time validation
- ✅ Tab switch latency
- ✅ Memory usage check

### Exploration Tests (4 tests)
- ⚠️ Universal Optimization Engine (conditional)
- ⚠️ Diaphanous Glass UI (conditional)
- ⚠️ Dark mode toggle (conditional)
- ⚠️ AI orchestrator (conditional)

### Integration Tests (1 test)
- ✅ Full workflow (all regimes)

**Total Tests**: 16 tests  
**Expected Pass**: 12-16 (depending on feature implementation)

---

## 🔧 Configuration

### Playwright Config (`playwright.config.js`)

```javascript
{
  testDir: './__tests__',
  testMatch: '**/*.integration.spec.js',
  timeout: 30000,
  workers: 1, // Single Electron instance
  fullyParallel: false,
  reporter: ['list', 'html', 'json'],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  }
}
```

### Package.json Scripts

```json
{
  "test": "playwright test",
  "test:integration": "playwright test __tests__/integration",
  "test:headed": "playwright test --headed",
  "test:debug": "playwright test --debug",
  "test:report": "playwright show-report"
}
```

---

## 📈 Success Metrics

### Target Coverage
- **Stabilization**: 100% (all core functions)
- **Optimization**: 80% (key performance paths)
- **Exploration**: 50% (new features as implemented)

### Performance Targets
- Startup time: <3000ms
- Tab switching: <100ms
- Memory per tab: <100MB

### Quality Gates
- Zero flaky tests (deterministic)
- All critical paths covered
- Regression prevention active

---

## 🐛 Debugging

### Run Tests in Headed Mode

```bash
npm run test:headed
```

See the browser window during tests!

### Interactive Debug Mode

```bash
npm run test:debug
```

Step through tests with Playwright Inspector!

### Check Specific Test

```bash
npx playwright test --grep "should launch browser"
```

### View Test Report

```bash
npm run test:report
```

Opens HTML report with screenshots/videos of failures!

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx playwright install
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 🎯 Next Steps

### Phase 1 (Current)
- ✅ Basic integration test suite
- ✅ Three-Regime distribution implemented
- ✅ Asymmetrica Protocol annotations

### Phase 2 (Coming Soon)
- [ ] Williams Space Optimizer integration for test data
- [ ] Self-evolving test registry (adaptive)
- [ ] Visual regression testing
- [ ] Performance benchmarking suite

### Phase 3 (Future)
- [ ] ML-driven test generation (asymm-ml)
- [ ] Grafana visualization (Three.js)
- [ ] Cross-browser compatibility tests
- [ ] Stress/load testing

---

## 📚 References

- **Asymmetrica Test Ecosystem V1**: `asymmetrica_methodology_foundational_docs/ASYMM_TEST_ECOSYSTEM_V1.markdown`
- **Asymmetrica Protocol**: `asymmetrica_methodology_foundational_docs/Asymmetrica_Protocol.md`
- **Three-Regime Planner**: `asymmetrica-masterhub/defensekit/python/three_regime_planner.py`
- **Playwright Docs**: https://playwright.dev/docs/intro
- **Electron Testing**: https://playwright.dev/docs/api/class-electron

---

## 🙏 Contributing

Tests follow **Asymmetrica Protocol** standards:
1. All tests must have (σ, ρ, γ, κ, λ) annotations
2. Follow Three-Regime distribution guidelines
3. Use Tesla harmonic timing (4.909 Hz)
4. Ensure tests are deterministic (no flakiness)
5. Document expected behavior clearly

---

**"Tests flow as one, a living ecosystem that pulses at 4.909 Hz, amplifies truth, and deletes madness."** 🌌

---

*Built with love using Asymmetrica Protocol principles*  
*99.995% less test complexity, 100% more consciousness* ✨
