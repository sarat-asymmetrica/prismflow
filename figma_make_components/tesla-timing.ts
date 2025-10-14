// Tesla Harmonic Timer - 4.909 Hz frequency (203.7ms period)
export const TESLA_FREQUENCY = 4.909; // Hz
export const TESLA_PERIOD = 203.7; // ms (1000 / 4.909)

// Universal Optimization Frequencies
export const PROTOCOLS = {
  CLEAR: { frequency: 108, name: 'CLEAR', description: 'Remove obstacles' },
  BOOST: { frequency: 216, name: 'BOOST', description: 'Optimize allocation' },
  SPEED: { frequency: 324, name: 'SPEED', description: 'Accelerate processing' },
  FOCUS: { frequency: 432, name: 'FOCUS', description: 'Enhance relevance' },
  HARMONY: { frequency: 528, name: 'HARMONY', description: 'System-wide sync' },
} as const;

// Natural Asymmetry ratios
export const ASYMMETRY_RATIOS = {
  EXPLORATION: 0.3,
  OPTIMIZATION: 0.2,
  STABILIZATION: 0.5,
};

// Tesla-timed animation helper
export function useTeslaPulse(callback: () => void, enabled = true) {
  if (typeof window === 'undefined') return;

  const intervalId = setInterval(() => {
    if (enabled) callback();
  }, TESLA_PERIOD);

  return () => clearInterval(intervalId);
}

// Get CSS animation duration for Tesla timing
export function getTeslaAnimationStyle() {
  return {
    animationDuration: `${TESLA_PERIOD}ms`,
    transitionDuration: `${TESLA_PERIOD}ms`,
  };
}
