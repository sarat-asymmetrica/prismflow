/**
 * Tesla Harmonic Timer (JavaScript Port)
 * 
 * @asymmetrica: harmonic_timer
 * σ: TeslaHarmonicTimer | Deterministic rate limiting with Tesla harmonic resonance
 * ρ: Global (reusable across all projects)
 * γ: Support (32.1x leverage, infrastructure timing)
 * κ: O(1) - Constant time delay calculation
 * λ: [Nikola Tesla Electromagnetic Research → DefenseKit → PrismFlow Browser]
 * 
 * Mathematical Foundation:
 *   Tesla Harmonic Frequency (4.909 Hz):
 *   - Base period: T = 1/4.909 ≈ 203.7ms (natural resonance)
 *   - Harmonics: n × T for integer multiples
 *   - Exponential backoff: 1×, 2×, 4×, 8×, 16× harmonics
 * 
 * Applications in PrismFlow Browser:
 *   - Animation synchronization (requestAnimationFrame)
 *   - Status bar updates (memory, frequency indicator)
 *   - Particle background motion
 *   - Loading spinner rotation
 *   - Protocol button pulse effects
 */

// Standard harmonic multiples
const HarmonicMultiple = {
  IMMEDIATE: 0,      // 0 × T = 0ms (no delay)
  SINGLE: 1,         // 1 × T ≈ 204ms
  DOUBLE: 2,         // 2 × T ≈ 407ms
  TRIPLE: 3,         // 3 × T ≈ 611ms
  QUADRUPLE: 4,      // 4 × T ≈ 815ms
  QUINTUPLE: 5,      // 5 × T ≈ 1019ms (≈1 second)
  MINOR_THIRD: 6,    // 6 × T ≈ 1222ms
  MAJOR_THIRD: 8,    // 8 × T ≈ 1630ms
  PERFECT_FIFTH: 12, // 12 × T ≈ 2444ms (≈2.5 seconds)
  OCTAVE: 24         // 24 × T ≈ 4889ms (≈5 seconds)
};

class TeslaHarmonicTimer {
  constructor(baseFrequencyHz = 4.909) {
    this.baseFrequencyHz = baseFrequencyHz;
    this.basePeriodSeconds = 1.0 / this.baseFrequencyHz;
    this.basePeriodMs = this.basePeriodSeconds * 1000;
    
    this.activeTimers = new Map();
    this.animationFrameId = null;
    this.lastFrameTime = 0;
    
    console.log(`✅ Tesla Harmonic Timer initialized (JS port)`);
    console.log(`   Frequency: ${this.baseFrequencyHz} Hz`);
    console.log(`   Period: ${this.basePeriodMs.toFixed(2)}ms`);
  }

  /**
   * Calculate harmonic delay for given multiple
   * @param {number|string} multiple - Harmonic multiple (number or HarmonicMultiple key)
   * @param {string} description - Optional description
   * @returns {Object} HarmonicTiming result
   */
  calculateDelay(multiple, description = null) {
    let multValue;
    let desc;

    if (typeof multiple === 'string' && HarmonicMultiple[multiple] !== undefined) {
      multValue = HarmonicMultiple[multiple];
      desc = description || multiple.replace('_', ' ');
    } else {
      multValue = multiple;
      desc = description || `${multValue}× Harmonic`;
    }

    const delaySeconds = multValue * this.basePeriodSeconds;
    const periodMs = delaySeconds * 1000;
    const frequencyHz = multValue > 0 ? this.baseFrequencyHz / multValue : Infinity;

    return {
      multiple: multValue,
      delaySeconds: delaySeconds,
      delayMs: periodMs,
      frequencyHz: frequencyHz,
      periodMs: periodMs,
      description: desc
    };
  }

  /**
   * Sleep for harmonic duration (Promise-based)
   * @param {number|string} multiple - Harmonic multiple
   * @returns {Promise<Object>} Timing information
   */
  sleep(multiple) {
    const timing = this.calculateDelay(multiple);
    
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(timing);
      }, timing.delayMs);
    });
  }

  /**
   * Schedule callback at harmonic interval
   * @param {Function} callback - Function to call
   * @param {number|string} multiple - Harmonic multiple
   * @param {boolean} repeat - Whether to repeat
   * @returns {string} Timer ID
   */
  schedule(callback, multiple, repeat = false) {
    const timing = this.calculateDelay(multiple);
    const timerId = `timer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const execute = () => {
      callback(timing);
      
      if (repeat) {
        const intervalId = setInterval(() => {
          callback(timing);
        }, timing.delayMs);
        
        this.activeTimers.set(timerId, {
          type: 'interval',
          id: intervalId,
          timing: timing
        });
      }
    };

    if (timing.delayMs > 0) {
      const timeoutId = setTimeout(execute, timing.delayMs);
      this.activeTimers.set(timerId, {
        type: repeat ? 'timeout+interval' : 'timeout',
        id: timeoutId,
        timing: timing
      });
    } else {
      execute();
    }

    return timerId;
  }

  /**
   * Cancel scheduled timer
   * @param {string} timerId - Timer ID from schedule()
   */
  cancel(timerId) {
    const timer = this.activeTimers.get(timerId);
    if (timer) {
      if (timer.type === 'timeout' || timer.type === 'timeout+interval') {
        clearTimeout(timer.id);
      } else if (timer.type === 'interval') {
        clearInterval(timer.id);
      }
      this.activeTimers.delete(timerId);
    }
  }

  /**
   * Cancel all active timers
   */
  cancelAll() {
    for (const [timerId] of this.activeTimers) {
      this.cancel(timerId);
    }
  }

  /**
   * Start Tesla-synchronized animation loop
   * @param {Function} callback - Called every Tesla pulse with delta time
   * @returns {Function} Stop function
   */
  startAnimationLoop(callback) {
    let lastPulseTime = performance.now();
    let accumulatedTime = 0;

    const loop = (currentTime) => {
      const deltaTime = currentTime - this.lastFrameTime;
      this.lastFrameTime = currentTime;

      // Accumulate time
      accumulatedTime += deltaTime;

      // Fire callback at Tesla pulse intervals (203.7ms)
      if (accumulatedTime >= this.basePeriodMs) {
        const pulseCount = Math.floor(accumulatedTime / this.basePeriodMs);
        accumulatedTime = accumulatedTime % this.basePeriodMs;

        callback({
          time: currentTime,
          deltaTime: deltaTime,
          pulseCount: pulseCount,
          timeSinceLastPulse: currentTime - lastPulseTime,
          basePeriodMs: this.basePeriodMs
        });

        lastPulseTime = currentTime;
      }

      // Only use requestAnimationFrame in browser context
      if (typeof requestAnimationFrame !== 'undefined') {
        this.animationFrameId = requestAnimationFrame(loop);
      }
    };

    // Only start animation loop in browser context
    if (typeof requestAnimationFrame !== 'undefined') {
      this.animationFrameId = requestAnimationFrame(loop);
    }

    // Return stop function
    return () => {
      if (this.animationFrameId && typeof cancelAnimationFrame !== 'undefined') {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    };
  }

  /**
   * Retry operation with harmonic backoff
   * @param {Function} operation - Async operation to retry
   * @param {number} maxAttempts - Maximum retry attempts
   * @param {Array<number>} backoffSequence - Harmonic multiples for each retry
   * @returns {Promise<Object>} RetryResult
   */
  async retryWithBackoff(operation, maxAttempts = 5, backoffSequence = [1, 2, 4, 8, 16]) {
    const timingSequence = [];
    let lastError = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const result = await operation();
        return {
          success: true,
          attempts: attempt + 1,
          totalDelaySeconds: timingSequence.reduce((a, b) => a + b, 0) / 1000,
          finalResult: result,
          error: null,
          timingSequence: timingSequence
        };
      } catch (error) {
        lastError = error;
        
        // If not last attempt, wait with harmonic backoff
        if (attempt < maxAttempts - 1) {
          const multiple = backoffSequence[Math.min(attempt, backoffSequence.length - 1)];
          const timing = await this.sleep(multiple);
          timingSequence.push(timing.delayMs);
          
          console.log(`🔄 Retry ${attempt + 1}/${maxAttempts} after ${timing.delayMs.toFixed(0)}ms (${multiple}× harmonic)`);
        }
      }
    }

    return {
      success: false,
      attempts: maxAttempts,
      totalDelaySeconds: timingSequence.reduce((a, b) => a + b, 0) / 1000,
      finalResult: null,
      error: lastError,
      timingSequence: timingSequence
    };
  }

  /**
   * Get current timer statistics
   * @returns {Object} Stats
   */
  getStats() {
    return {
      baseFrequencyHz: this.baseFrequencyHz,
      basePeriodMs: this.basePeriodMs,
      activeTimers: this.activeTimers.size,
      animationActive: this.animationFrameId !== null
    };
  }
}

module.exports = { TeslaHarmonicTimer, HarmonicMultiple };
