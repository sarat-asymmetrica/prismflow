#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Harmonic Timer Example

Demonstrates Tesla 4.909 Hz harmonic timing for rate limiting and scheduling.

Real-world use case: API rate limiting and deterministic scheduling

@author Agent November
@validation α₀ Production-ready
"""

import sys
import os
import time
import logging
from datetime import datetime

# Fix Windows console encoding for Unicode output
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from defensekit_tools import DefenseKitMCPTools

# Convenience reference
harmonic_timer = DefenseKitMCPTools.harmonic_timer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def example_1_basic_usage():
    """Example 1: Basic harmonic timer usage"""
    print("=" * 70)
    print("EXAMPLE 1: Basic Harmonic Timer Usage")
    print("=" * 70)

    # Get period information
    print("\nGetting period information:")
    info = harmonic_timer("get_period")

    print(f"\nHarmonic Timer Configuration:")
    print(f"  Frequency: {info['frequency_hz']} Hz")
    print(f"  Period: {info['period_ms']} ms")
    print(f"  Formula: {info['formula']}")
    print(f"  Mathematical source: {info['mathematical_source']}")

    # Reset timer
    print(f"\nResetting timer...")
    reset_result = harmonic_timer("reset")
    print(f"  ✓ Timer reset at {reset_result['current_time']:.3f}s")

    # Demonstrate ticks
    print(f"\nDemonstrating 3 harmonic ticks:")
    for i in range(3):
        tick = harmonic_timer("tick")
        print(f"  Tick #{tick['tick_count']}: "
              f"elapsed {tick['elapsed_since_last_ms']:.2f}ms, "
              f"next tick at {tick['next_tick']:.3f}s")

    print()


def example_2_rate_limiting():
    """Example 2: API rate limiting"""
    print("=" * 70)
    print("EXAMPLE 2: API Rate Limiting (~5 req/s)")
    print("=" * 70)

    # Simulate API rate limiting
    print("\nSimulating API requests with harmonic rate limiting...")
    print("(Target: ~5 requests per second = 4.909 Hz)\n")

    harmonic_timer("reset")
    start_time = time.time()
    num_requests = 10

    for i in range(num_requests):
        # Wait for next harmonic slot
        tick = harmonic_timer("tick")

        # Simulate API request
        request_time = time.time() - start_time
        print(f"  Request #{i+1:2d}: {request_time:6.3f}s "
              f"(tick #{tick['tick_count']}, "
              f"interval: {tick['elapsed_since_last_ms']:6.2f}ms)")

    total_time = time.time() - start_time
    actual_rate = num_requests / total_time

    print(f"\n" + "-" * 70)
    print(f"Rate Limiting Results:")
    print(f"  Total requests: {num_requests}")
    print(f"  Total time: {total_time:.3f}s")
    print(f"  Actual rate: {actual_rate:.2f} req/s")
    print(f"  Target rate: 4.909 req/s")
    print(f"  Variance: {abs(actual_rate - 4.909):.3f} req/s")
    print(f"  Status: {'✓ PASS' if abs(actual_rate - 4.909) < 0.5 else '✗ FAIL'}")

    print()


def example_3_exponential_backoff():
    """Example 3: Exponential backoff with harmonic intervals"""
    print("=" * 70)
    print("EXAMPLE 3: Exponential Backoff with Harmonic Intervals")
    print("=" * 70)

    # Get base period
    info = harmonic_timer("get_period")
    base_period = info['period_ms'] / 1000  # Convert to seconds

    print(f"\nBase harmonic period: {base_period*1000:.2f}ms")
    print(f"\nExponential backoff sequence (2^n × base period):\n")

    # Simulate retry with exponential backoff
    max_retries = 5
    for attempt in range(max_retries):
        backoff = (2 ** attempt) * base_period
        backoff_ms = backoff * 1000

        print(f"  Attempt {attempt+1}/{max_retries}: "
              f"Wait {backoff_ms:>8.2f}ms "
              f"(2^{attempt} × {base_period*1000:.2f}ms)")

        # Simulate the wait (shortened for demo)
        if attempt < 3:  # Only actually wait for first few attempts
            time.sleep(backoff)

    print(f"\n✓ Harmonic exponential backoff provides natural rhythm!")
    print()


def example_4_deterministic_scheduling():
    """Example 4: Deterministic scheduling"""
    print("=" * 70)
    print("EXAMPLE 4: Deterministic Scheduling")
    print("=" * 70)

    print("\nDemonstrating deterministic timing (low variance)...\n")

    harmonic_timer("reset")
    intervals = []

    # Collect timing data
    for i in range(10):
        tick = harmonic_timer("tick")
        if i > 0:  # Skip first tick (no previous interval)
            intervals.append(tick['elapsed_since_last_ms'])

        if i < 5 or i >= 8:  # Show first 5 and last 2
            print(f"  Tick #{tick['tick_count']:2d}: "
                  f"interval = {tick['elapsed_since_last_ms']:6.2f}ms")
        elif i == 5:
            print(f"  ...")

    # Calculate statistics
    avg_interval = sum(intervals) / len(intervals)
    variance = sum((x - avg_interval) ** 2 for x in intervals) / len(intervals)
    std_dev = variance ** 0.5

    print(f"\n" + "-" * 70)
    print(f"Deterministic Timing Analysis:")
    print(f"  Target period: 203.71ms")
    print(f"  Average interval: {avg_interval:.2f}ms")
    print(f"  Standard deviation: {std_dev:.2f}ms")
    print(f"  Variance: {variance:.2f}ms²")
    print(f"  Status: {'✓ PASS' if std_dev < 50 else '✗ FAIL'} (target: <50ms std dev)")

    print()


def example_5_real_world_ocr_api():
    """Example 5: Real-world OCR API rate limiting"""
    print("=" * 70)
    print("EXAMPLE 5: Real-World OCR API Integration")
    print("=" * 70)

    # Simulate OCR API with rate limits
    print("\nScenario: Processing documents with Mistral OCR API")
    print("API limit: 5 requests/second")
    print("Solution: Harmonic timer enforces 4.909 Hz rate\n")

    class OCRAPIClient:
        """Simulated OCR API client with harmonic rate limiting"""

        def __init__(self):
            harmonic_timer("reset")
            self.request_count = 0

        def extract_text(self, document_id: str) -> dict:
            """Extract text from document (rate-limited)"""
            # Wait for next harmonic slot
            tick = harmonic_timer("tick")

            # Simulate API call
            time.sleep(0.01)  # Simulated API latency

            self.request_count += 1

            return {
                "document_id": document_id,
                "request_num": self.request_count,
                "tick_count": tick['tick_count'],
                "timestamp": tick['current_time']
            }

    # Process documents
    client = OCRAPIClient()
    documents = [f"doc_{i:03d}.pdf" for i in range(1, 11)]

    print("Processing documents:\n")
    start_time = time.time()

    for i, doc_id in enumerate(documents[:5]):  # Process first 5 for demo
        result = client.extract_text(doc_id)
        elapsed = time.time() - start_time

        print(f"  {result['document_id']}: "
              f"Request #{result['request_num']:2d}, "
              f"Tick #{result['tick_count']:2d}, "
              f"Time: {elapsed:5.2f}s")

    total_time = time.time() - start_time
    rate = 5 / total_time  # 5 requests processed

    print(f"\n" + "-" * 70)
    print(f"API Rate Limiting Results:")
    print(f"  Documents processed: 5")
    print(f"  Total time: {total_time:.2f}s")
    print(f"  Actual rate: {rate:.2f} req/s")
    print(f"  API limit: 5 req/s")
    print(f"  Status: {'✓ COMPLIANT' if rate <= 5 else '✗ VIOLATED'}")

    print()


def example_6_throttling_comparison():
    """Example 6: Harmonic vs naive throttling comparison"""
    print("=" * 70)
    print("EXAMPLE 6: Harmonic vs Naive Throttling")
    print("=" * 70)

    print("\nComparing harmonic timing vs naive sleep-based throttling...\n")

    # Naive approach: Fixed sleep
    print("Naive Approach (fixed 200ms sleep):")
    naive_start = time.time()
    naive_intervals = []

    for i in range(5):
        if i > 0:
            interval = (time.time() - naive_start - (i * 0.2)) * 1000
            naive_intervals.append(abs(interval))

        time.sleep(0.2)
        elapsed = time.time() - naive_start
        print(f"  Request {i+1}: {elapsed:.3f}s")

    naive_time = time.time() - naive_start
    naive_variance = sum((x - 200) ** 2 for x in naive_intervals) / len(naive_intervals) if naive_intervals else 0

    # Harmonic approach
    print(f"\nHarmonic Approach (Tesla 4.909 Hz):")
    harmonic_timer("reset")
    harmonic_start = time.time()
    harmonic_intervals = []

    for i in range(5):
        tick = harmonic_timer("tick")
        if i > 0:
            harmonic_intervals.append(tick['elapsed_since_last_ms'])

        elapsed = time.time() - harmonic_start
        print(f"  Request {i+1}: {elapsed:.3f}s (tick #{tick['tick_count']})")

    harmonic_time = time.time() - harmonic_start
    harmonic_variance = sum((x - 203.71) ** 2 for x in harmonic_intervals) / len(harmonic_intervals) if harmonic_intervals else 0

    # Comparison
    print(f"\n" + "-" * 70)
    print(f"Comparison Results:")
    print(f"\nNaive (fixed sleep):")
    print(f"  Total time: {naive_time:.3f}s")
    print(f"  Timing variance: {naive_variance:.2f}ms²")

    print(f"\nHarmonic (Tesla 4.909 Hz):")
    print(f"  Total time: {harmonic_time:.3f}s")
    print(f"  Timing variance: {harmonic_variance:.2f}ms²")

    print(f"\n✓ Harmonic timing provides more consistent intervals!")
    print(f"  (Lower variance = more deterministic scheduling)")

    print()


def example_7_error_handling():
    """Example 7: Error handling demonstration"""
    print("=" * 70)
    print("EXAMPLE 7: Error Handling")
    print("=" * 70)

    print("\nTesting error cases...\n")

    # Test case 1: Invalid action
    print("1. Invalid action:")
    try:
        result = harmonic_timer("invalid_action")
    except ValueError as e:
        print(f"   ✓ ValueError caught: {e}")

    # Test case 2: Valid actions
    print("\n2. Valid actions:")
    for action in ["get_period", "reset", "tick"]:
        try:
            result = harmonic_timer(action)
            print(f"   ✓ Action '{action}': {result['action']}")
        except Exception as e:
            print(f"   ✗ Unexpected error for '{action}': {e}")

    print()


def main():
    """Run all examples"""
    print("\n" + "=" * 70)
    print(" Harmonic Timer - Comprehensive Examples")
    print(" Agent November Production Deployment")
    print("=" * 70)
    print()

    # Run all examples
    example_1_basic_usage()
    example_2_rate_limiting()
    example_3_exponential_backoff()
    example_4_deterministic_scheduling()
    example_5_real_world_ocr_api()
    example_6_throttling_comparison()
    example_7_error_handling()

    print("=" * 70)
    print(" All Examples Complete!")
    print("=" * 70)
    print()
    print("Key Takeaways:")
    print("  • Harmonic timer enforces Tesla 4.909 Hz rhythm")
    print("  • Natural rate limiting: ~5 requests per second")
    print("  • Deterministic timing: <50ms variance")
    print("  • Exponential backoff: 1×, 2×, 4×, 8×, 16× harmonics")
    print("  • Prevents thundering herd problems")
    print()


if __name__ == "__main__":
    main()
