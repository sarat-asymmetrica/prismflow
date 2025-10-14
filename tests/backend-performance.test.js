/**
 * Backend Performance Tests & Benchmarks
 * Tests Williams Optimizer, Tesla Timer, and overall system performance
 */

const { WilliamsSpaceOptimizer } = require('../src/engines/williams-optimizer');
const { TeslaHarmonicTimer, HarmonicMultiple } = require('../src/engines/tesla-timer');

// ANSI colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(msg, color = colors.reset) {
  console.log(`${color}${msg}${colors.reset}`);
}

function success(msg) { log(`✅ ${msg}`, colors.green); }
function fail(msg) { log(`❌ ${msg}`, colors.red); }
function info(msg) { log(`ℹ️  ${msg}`, colors.cyan); }
function section(msg) { log(`\n${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}`, colors.magenta); }

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  total: 0,
  tests: []
};

function test(name, fn) {
  results.total++;
  try {
    fn();
    success(`Test passed: ${name}`);
    results.passed++;
    results.tests.push({ name, status: 'PASS' });
  } catch (error) {
    fail(`Test failed: ${name}`);
    console.error(`   Error: ${error.message}`);
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: error.message });
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertClose(actual, expected, tolerance, message) {
  const diff = Math.abs(actual - expected);
  if (diff > tolerance) {
    throw new Error(message || `Expected ${actual} to be close to ${expected} (tolerance: ${tolerance}), diff: ${diff}`);
  }
}

// =============================================================================
// WILLIAMS SPACE OPTIMIZER TESTS
// =============================================================================

section('🔧 WILLIAMS SPACE OPTIMIZER TESTS');

test('Williams: Calculate space bound for small scale (100 ops)', () => {
  const optimizer = new WilliamsSpaceOptimizer();
  const result = optimizer.calculateSpaceBound(100);
  
  // Expected: √100 × log₂(100) = 10 × 6.64 = 66.4
  assertClose(result.spaceBound, 66.4, 1, 'Space bound should be ~66.4');
  assert(result.efficiency > 1.0, 'Efficiency should be > 1');
  assert(result.spaceReductionPercent > 30, 'Space reduction should be > 30%');
  
  info(`   Space bound: ${result.spaceBound.toFixed(2)}`);
  info(`   Efficiency: ${result.efficiency.toFixed(2)}×`);
  info(`   Space reduction: ${result.spaceReductionPercent.toFixed(1)}%`);
});

test('Williams: Calculate space bound for medium scale (1000 ops)', () => {
  const optimizer = new WilliamsSpaceOptimizer();
  const result = optimizer.calculateSpaceBound(1000);
  
  // Expected: √1000 × log₂(1000) = 31.62 × 9.97 = 315.2
  assertClose(result.spaceBound, 315, 5, 'Space bound should be ~315');
  assert(result.efficiency > 3.0, 'Efficiency should be > 3×');
  assert(result.spaceReductionPercent > 65, 'Space reduction should be > 65%');
  
  info(`   Space bound: ${result.spaceBound.toFixed(2)}`);
  info(`   Efficiency: ${result.efficiency.toFixed(2)}×`);
  info(`   Space reduction: ${result.spaceReductionPercent.toFixed(1)}%`);
});

test('Williams: Calculate space bound for large scale (10000 ops)', () => {
  const optimizer = new WilliamsSpaceOptimizer();
  const result = optimizer.calculateSpaceBound(10000);
  
  // Expected: √10000 × log₂(10000) = 100 × 13.29 = 1329
  assertClose(result.spaceBound, 1329, 10, 'Space bound should be ~1329');
  assert(result.efficiency > 7.0, 'Efficiency should be > 7×');
  assert(result.spaceReductionPercent > 85, 'Space reduction should be > 85%');
  
  info(`   Space bound: ${result.spaceBound.toFixed(2)}`);
  info(`   Efficiency: ${result.efficiency.toFixed(2)}×`);
  info(`   Space reduction: ${result.spaceReductionPercent.toFixed(1)}%`);
});

test('Williams: Tab memory allocation respects min threshold (50MB)', () => {
  const optimizer = new WilliamsSpaceOptimizer();
  const smallSize = 1024 * 1024; // 1MB page
  const allocation = optimizer.calculateTabMemory(smallSize);
  
  const minThreshold = 50 * 1024 * 1024; // 50MB
  assert(allocation >= minThreshold, `Allocation (${allocation}) should be >= ${minThreshold}`);
  
  info(`   Small page (1MB) → ${Math.round(allocation / 1024 / 1024)}MB allocated`);
});

test('Williams: Tab memory allocation respects max threshold (512MB)', () => {
  const optimizer = new WilliamsSpaceOptimizer();
  const hugeSize = 5000 * 1024 * 1024; // 5GB page (unrealistic)
  const allocation = optimizer.calculateTabMemory(hugeSize);
  
  const maxThreshold = 512 * 1024 * 1024; // 512MB
  assert(allocation <= maxThreshold, `Allocation (${allocation}) should be <= ${maxThreshold}`);
  
  info(`   Huge page (5GB) → ${Math.round(allocation / 1024 / 1024)}MB allocated (capped)`);
});

test('Williams: Memory smoothing prevents sudden drops', () => {
  const optimizer = new WilliamsSpaceOptimizer();
  
  // Simulate current allocation at 120MB
  const currentAllocation = 120 * 1024 * 1024;
  
  // Target would normally be much lower
  const smallPage = 10 * 1024 * 1024; // 10MB
  const newAllocation = optimizer.calculateTabMemory(smallPage, currentAllocation);
  
  // Check that change is gradual (not >50%)
  const changePercent = Math.abs(newAllocation - currentAllocation) / currentAllocation;
  assert(changePercent <= 0.5, `Change should be <= 50%, got ${(changePercent * 100).toFixed(1)}%`);
  
  info(`   120MB → ${Math.round(newAllocation / 1024 / 1024)}MB (smooth transition)`);
});

test('Williams: Multi-tab memory optimization', () => {
  const optimizer = new WilliamsSpaceOptimizer();
  
  const tabSizes = [
    50 * 1024 * 1024,  // 50MB
    100 * 1024 * 1024, // 100MB
    200 * 1024 * 1024, // 200MB
  ];
  
  const allocations = optimizer.calculateMultiTabMemory(tabSizes);
  
  assert(allocations.length === 3, 'Should return 3 allocations');
  
  const totalAllocated = allocations.reduce((a, b) => a + b, 0);
  const maxTotal = 2048 * 1024 * 1024; // 2GB max
  assert(totalAllocated <= maxTotal, `Total allocation should be <= 2GB`);
  
  info(`   Total allocated: ${Math.round(totalAllocated / 1024 / 1024)}MB for 3 tabs`);
});

test('Williams: Cache optimization', () => {
  const optimizer = new WilliamsSpaceOptimizer();
  
  const itemCount = 1000;
  const avgItemSize = 2048; // 2KB per item
  
  const cache = optimizer.optimizeCacheSize(itemCount, avgItemSize);
  
  assert(cache.optimalItems < itemCount, 'Optimal items should be < total items');
  assert(cache.efficiency > 1, 'Cache efficiency should be > 1');
  
  info(`   ${itemCount} items → ${cache.optimalItems} optimal (${cache.efficiency.toFixed(2)}× efficiency)`);
});

// =============================================================================
// TESLA HARMONIC TIMER TESTS
// =============================================================================

section('⚡ TESLA HARMONIC TIMER TESTS');

test('Tesla: Base frequency is 4.909 Hz', () => {
  const timer = new TeslaHarmonicTimer();
  
  assert(timer.baseFrequencyHz === 4.909, 'Base frequency should be 4.909 Hz');
  assertClose(timer.basePeriodMs, 203.7, 0.5, 'Base period should be ~203.7ms');
  
  info(`   Frequency: ${timer.baseFrequencyHz} Hz`);
  info(`   Period: ${timer.basePeriodMs.toFixed(2)}ms`);
});

test('Tesla: Calculate harmonic delays', () => {
  const timer = new TeslaHarmonicTimer();
  
  const single = timer.calculateDelay(HarmonicMultiple.SINGLE);
  assertClose(single.delayMs, 203.7, 1, 'Single harmonic should be ~203.7ms');
  
  const double = timer.calculateDelay(HarmonicMultiple.DOUBLE);
  assertClose(double.delayMs, 407.4, 2, 'Double harmonic should be ~407.4ms');
  
  const quintuple = timer.calculateDelay(HarmonicMultiple.QUINTUPLE);
  assertClose(quintuple.delayMs, 1018.5, 5, 'Quintuple harmonic should be ~1018.5ms');
  
  info(`   1× harmonic: ${single.delayMs.toFixed(1)}ms`);
  info(`   2× harmonic: ${double.delayMs.toFixed(1)}ms`);
  info(`   5× harmonic: ${quintuple.delayMs.toFixed(1)}ms`);
});

test('Tesla: Sleep function (async timing)', async () => {
  const timer = new TeslaHarmonicTimer();
  
  const start = performance.now();
  await timer.sleep(HarmonicMultiple.SINGLE);
  const elapsed = performance.now() - start;
  
  // Allow 20ms tolerance for system timing variance
  assertClose(elapsed, 203.7, 20, 'Sleep should take ~203.7ms');
  
  info(`   Slept for ${elapsed.toFixed(1)}ms (expected ~203.7ms)`);
});

test('Tesla: Schedule and cancel timer', (done) => {
  const timer = new TeslaHarmonicTimer();
  
  let callbackFired = false;
  
  const timerId = timer.schedule(() => {
    callbackFired = true;
  }, HarmonicMultiple.SINGLE);
  
  // Cancel immediately
  timer.cancel(timerId);
  
  // Wait to ensure callback doesn't fire
  setTimeout(() => {
    assert(!callbackFired, 'Callback should not have fired after cancel');
    info(`   Timer cancelled successfully`);
  }, 300);
});

test('Tesla: Retry with harmonic backoff', async () => {
  const timer = new TeslaHarmonicTimer();
  
  let attempts = 0;
  const operation = async () => {
    attempts++;
    if (attempts < 3) {
      throw new Error('Simulated failure');
    }
    return 'success';
  };
  
  const start = performance.now();
  const result = await timer.retryWithBackoff(operation, 5, [1, 2]);
  const elapsed = performance.now() - start;
  
  assert(result.success, 'Retry should eventually succeed');
  assert(result.attempts === 3, 'Should take 3 attempts');
  assert(elapsed > 600, 'Should take at least 2 backoff periods');
  
  info(`   Succeeded after ${result.attempts} attempts in ${elapsed.toFixed(0)}ms`);
});

// =============================================================================
// PERFORMANCE BENCHMARKS
// =============================================================================

section('📊 PERFORMANCE BENCHMARKS');

function benchmark(name, iterations, fn) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const elapsed = performance.now() - start;
  const avgTime = elapsed / iterations;
  
  info(`${name}:`);
  info(`   Total: ${elapsed.toFixed(2)}ms for ${iterations} iterations`);
  info(`   Average: ${avgTime.toFixed(4)}ms per operation`);
  info(`   Throughput: ${(1000 / avgTime).toFixed(0)} ops/sec`);
  
  return { elapsed, avgTime, throughput: 1000 / avgTime };
}

info('Running performance benchmarks...\n');

const williamsResults = benchmark('Williams Space Bound Calculation', 10000, () => {
  const optimizer = new WilliamsSpaceOptimizer();
  optimizer.calculateSpaceBound(1000);
});

const teslaResults = benchmark('Tesla Delay Calculation', 10000, () => {
  const timer = new TeslaHarmonicTimer();
  timer.calculateDelay(HarmonicMultiple.QUINTUPLE);
});

const memoryResults = benchmark('Williams Tab Memory Allocation', 1000, () => {
  const optimizer = new WilliamsSpaceOptimizer();
  optimizer.calculateTabMemory(100 * 1024 * 1024);
});

// =============================================================================
// MEMORY USAGE TEST
// =============================================================================

section('💾 MEMORY USAGE TEST');

const memBefore = process.memoryUsage();
info(`Memory before tests:`);
info(`   Heap used: ${Math.round(memBefore.heapUsed / 1024 / 1024)}MB`);
info(`   Heap total: ${Math.round(memBefore.heapTotal / 1024 / 1024)}MB`);

// Create multiple optimizer instances
const optimizers = [];
for (let i = 0; i < 10; i++) {
  optimizers.push(new WilliamsSpaceOptimizer());
}

// Run operations
optimizers.forEach(opt => {
  for (let i = 0; i < 100; i++) {
    opt.calculateSpaceBound(1000 + i * 10);
  }
});

const memAfter = process.memoryUsage();
const memDelta = memAfter.heapUsed - memBefore.heapUsed;

info(`\nMemory after tests:`);
info(`   Heap used: ${Math.round(memAfter.heapUsed / 1024 / 1024)}MB`);
info(`   Delta: ${Math.round(memDelta / 1024)}KB`);

assert(memDelta < 10 * 1024 * 1024, 'Memory delta should be < 10MB');
success('Memory usage is acceptable');

// =============================================================================
// RESULTS SUMMARY
// =============================================================================

section('📋 TEST RESULTS SUMMARY');

console.log('\n');
info(`Total tests: ${results.total}`);
success(`Passed: ${results.passed}`);
if (results.failed > 0) {
  fail(`Failed: ${results.failed}`);
}

const passRate = (results.passed / results.total * 100).toFixed(1);
console.log('\n');
if (results.failed === 0) {
  log(`🎉 ALL TESTS PASSED! (${passRate}%)`, colors.green);
} else {
  log(`⚠️  ${results.failed} test(s) failed (${passRate}% pass rate)`, colors.yellow);
}

// Performance summary
console.log('\n');
info('Performance Summary:');
info(`   Williams optimizer: ${williamsResults.throughput.toFixed(0)} ops/sec`);
info(`   Tesla timer: ${teslaResults.throughput.toFixed(0)} ops/sec`);
info(`   Memory allocation: ${memoryResults.throughput.toFixed(0)} ops/sec`);

console.log('\n');
log('✨ Backend tests complete!', colors.cyan);

// Exit with appropriate code
process.exit(results.failed > 0 ? 1 : 0);
