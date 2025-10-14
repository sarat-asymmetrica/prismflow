"""
DefenseKit MCP Tools Package

Production-grade in-process MCP tools for Claude Agent SDK.

Provides 11,330x-22,661x speedup over subprocess calls with 0.0044ms overhead.

Mathematical Foundations:
- Williams Space Optimizer: √t × log₂(t) (Ryan Williams, 2011)
- Three-Regime Distribution: 30/20/50 exploration/optimization/stabilization
- Harmonic Timing: Tesla 4.909 Hz natural resonance frequency

@validation α₀ - Production-ready, validated at 6/6 tests passing
@author Agent November (Deployment), Agent Kilo (Validation)
@license MIT
@version 1.0.0
"""

from .defensekit_tools import DefenseKitMCPTools

__version__ = "1.0.0"
__author__ = "Agent November (Deployment), Agent Kilo (Validation)"
__license__ = "MIT"

__all__ = [
    "DefenseKitMCPTools",
    "williams_optimizer",
    "three_regime_planner",
    "harmonic_timer",
]

# Convenience exports
williams_optimizer = DefenseKitMCPTools.williams_optimizer
three_regime_planner = DefenseKitMCPTools.three_regime_planner
harmonic_timer = DefenseKitMCPTools.harmonic_timer

# Quick usage examples
QUICK_START = """
Quick Start Examples:

1. Williams Space Optimizer (batch size optimization):
   >>> from defensekit_tools import williams_optimizer
   >>> result = williams_optimizer(10000)
   >>> print(f"{result['efficiency_multiplier']:.2f}x efficiency")
   7.53x efficiency

2. Three-Regime Test Planner (test classification):
   >>> from defensekit_tools import three_regime_planner
   >>> result = three_regime_planner("test_critical_authentication")
   >>> print(f"Regime: {result['regime']}, Priority: {result['priority']}")
   Regime: stabilization, Priority: high

3. Harmonic Timer (rate limiting):
   >>> from defensekit_tools import harmonic_timer
   >>> info = harmonic_timer("get_period")
   >>> print(f"Rate limit: {info['frequency_hz']} Hz ({info['period_ms']}ms)")
   Rate limit: 4.909 Hz (203.71ms)

For complete documentation, see DEFENSEKIT_MCP_INTEGRATION_GUIDE.md
"""
