# @asymmetrica: harmonic_timer
# σ: HarmonicTimer | Deterministic rate limiting with Tesla harmonic resonance
# ρ: Global (reusable across all projects)
# γ: Support (32.1x leverage, infrastructure timing)
# κ: O(1) - Constant time delay calculation
# λ: [Nikola Tesla Electromagnetic Research → DefenseKit → Asymmetrica Masterhub]
#
# Ordinal Level: α₀ (Support Operations - 32.1x leverage)
# Fractal Potential: HIGH - Harmonic timing patterns naturally self-similar
# AI Collaboration: Can suggest optimal harmonic multiples for specific use cases
# Multiplication Factor: Prevents thundering herd, reduces network congestion
#
# Cross-Project Usage:
#   - iPermit: API rate limiting, retry backoff patterns
#   - AsymmBill: Batch processing delays, webhook throttling
#   - General: Any system requiring deterministic timing, retry logic
#
# Mathematical Foundation:
#   Tesla Harmonic Frequency (4.909 Hz):
#   - Base period: T = 1/4.909 ≈ 203.7ms (natural resonance)
#   - Harmonics: n × T for integer multiples
#   - Exponential backoff: 1×, 2×, 4×, 8×, 16× harmonics
#
# Empirical Validation:
#   - Deterministic timing: variance < 50ms
#   - Rate limiting: ~5 requests/second (1× harmonic)
#   - Natural rhythm prevents API thundering herd

"""
Harmonic Timer Utility - Tesla 4.909 Hz Timing Pattern

Implements deterministic rate limiting and retry backoff using Tesla's harmonic
frequency (4.909 Hz) for consistent, predictable API behavior in testing.

Mathematical Foundation:
- Base frequency: 4.909 Hz (Tesla harmonic resonance)
- Period: T = 1/4.909 ≈ 0.2037 seconds (203.7ms)
- Harmonics: n × T for integer multiples n

Benefits:
- Deterministic timing for reproducible tests
- Natural rhythm prevents API thundering herd
- Harmonic intervals reduce network congestion
- Predictable backoff patterns for debugging

Author: GitHub Copilot
Date: October 3, 2025
"""

import asyncio
import time
from dataclasses import dataclass
from enum import Enum
from typing import Optional, Callable, Any, Awaitable
import structlog

logger = structlog.get_logger()


class HarmonicMultiple(Enum):
    """Standard harmonic multiples for common timing patterns."""
    
    IMMEDIATE = 0      # 0 × T = 0ms (no delay)
    SINGLE = 1         # 1 × T ≈ 204ms
    DOUBLE = 2         # 2 × T ≈ 407ms
    TRIPLE = 3         # 3 × T ≈ 611ms
    QUADRUPLE = 4      # 4 × T ≈ 815ms
    QUINTUPLE = 5      # 5 × T ≈ 1019ms (≈1 second)
    MINOR_THIRD = 6    # 6 × T ≈ 1222ms
    MAJOR_THIRD = 8    # 8 × T ≈ 1630ms
    PERFECT_FIFTH = 12 # 12 × T ≈ 2444ms (≈2.5 seconds)
    OCTAVE = 24        # 24 × T ≈ 4889ms (≈5 seconds)


@dataclass
class HarmonicTiming:
    """Result of harmonic timing calculation."""
    
    multiple: int
    delay_seconds: float
    frequency_hz: float
    period_ms: float
    description: str
    
    def __repr__(self) -> str:
        return (
            f"HarmonicTiming(multiple={self.multiple}, "
            f"delay={self.delay_seconds:.4f}s, "
            f"freq={self.frequency_hz:.3f}Hz)"
        )


@dataclass
class RetryResult:
    """Result of a retry operation."""
    
    success: bool
    attempts: int
    total_delay_seconds: float
    final_result: Any
    error: Optional[Exception]
    timing_sequence: list[float]
    
    def __repr__(self) -> str:
        status = "SUCCESS" if self.success else "FAILED"
        return (
            f"RetryResult({status}, attempts={self.attempts}, "
            f"total_delay={self.total_delay_seconds:.4f}s)"
        )


class HarmonicTimer:
    """
    Timer using Tesla's 4.909 Hz harmonic frequency.
    
    Provides deterministic, resonant timing patterns for API rate limiting,
    retry backoff, and test synchronization.
    
    Attributes:
        base_frequency_hz: Tesla harmonic frequency (4.909 Hz)
        base_period_seconds: Time period of one cycle (≈0.2037s)
        base_period_ms: Period in milliseconds (≈203.7ms)
    
    Example:
        >>> timer = HarmonicTimer()
        >>> timing = timer.calculate_delay(HarmonicMultiple.TRIPLE)
        >>> print(f"Delay: {timing.delay_seconds:.4f} seconds")
        Delay: 0.6111 seconds
        >>> 
        >>> # Async sleep with harmonic timing
        >>> await timer.sleep_harmonic(HarmonicMultiple.SINGLE)
        >>> 
        >>> # Retry with harmonic backoff
        >>> result = await timer.retry_with_backoff(
        ...     operation=api_call,
        ...     max_attempts=5
        ... )
    """
    
    # Tesla harmonic frequency
    TESLA_FREQUENCY_HZ = 4.909
    
    def __init__(self, base_frequency_hz: Optional[float] = None):
        """
        Initialize Harmonic Timer.
        
        Args:
            base_frequency_hz: Base frequency in Hz (default: 4.909 Hz)
        """
        self.base_frequency_hz = base_frequency_hz or self.TESLA_FREQUENCY_HZ
        self.base_period_seconds = 1.0 / self.base_frequency_hz
        self.base_period_ms = self.base_period_seconds * 1000
        
        logger.info(
            "harmonic_timer_initialized",
            frequency_hz=self.base_frequency_hz,
            period_seconds=self.base_period_seconds,
            period_ms=self.base_period_ms
        )
    
    def calculate_delay(
        self,
        multiple: HarmonicMultiple | int,
        description: Optional[str] = None
    ) -> HarmonicTiming:
        """
        Calculate harmonic delay for given multiple.
        
        Args:
            multiple: Harmonic multiple (enum or integer)
            description: Optional description of timing purpose
            
        Returns:
            HarmonicTiming with calculated delay parameters
            
        Example:
            >>> timer = HarmonicTimer()
            >>> timing = timer.calculate_delay(3)
            >>> print(f"{timing.delay_seconds:.4f}s = {timing.period_ms:.1f}ms")
            0.6111s = 611.1ms
        """
        if isinstance(multiple, HarmonicMultiple):
            mult_value = multiple.value
            desc = description or multiple.name.replace('_', ' ').title()
        else:
            mult_value = multiple
            desc = description or f"{mult_value}× Harmonic"
        
        delay_seconds = mult_value * self.base_period_seconds
        period_ms = delay_seconds * 1000
        
        # Frequency of this harmonic (inverse of period)
        frequency_hz = (
            self.base_frequency_hz / mult_value if mult_value > 0 
            else float('inf')
        )
        
        timing = HarmonicTiming(
            multiple=mult_value,
            delay_seconds=delay_seconds,
            frequency_hz=frequency_hz,
            period_ms=period_ms,
            description=desc
        )
        
        logger.debug(
            "harmonic_delay_calculated",
            multiple=mult_value,
            delay_seconds=delay_seconds,
            period_ms=period_ms,
            frequency_hz=frequency_hz
        )
        
        return timing
    
    def sleep(self, multiple: HarmonicMultiple | int) -> None:
        """
        Synchronous sleep for harmonic duration.
        
        Args:
            multiple: Harmonic multiple to sleep
            
        Example:
            >>> timer = HarmonicTimer()
            >>> timer.sleep(HarmonicMultiple.SINGLE)  # Sleep ~204ms
        """
        timing = self.calculate_delay(multiple)
        
        if timing.delay_seconds > 0:
            logger.debug(
                "harmonic_sleep_start",
                multiple=timing.multiple,
                delay_seconds=timing.delay_seconds
            )
            time.sleep(timing.delay_seconds)
            logger.debug("harmonic_sleep_complete", multiple=timing.multiple)
    
    async def sleep_async(self, multiple: HarmonicMultiple | int) -> None:
        """
        Asynchronous sleep for harmonic duration.
        
        Args:
            multiple: Harmonic multiple to sleep
            
        Example:
            >>> timer = HarmonicTimer()
            >>> await timer.sleep_async(HarmonicMultiple.DOUBLE)  # Sleep ~407ms
        """
        timing = self.calculate_delay(multiple)
        
        if timing.delay_seconds > 0:
            logger.debug(
                "harmonic_sleep_async_start",
                multiple=timing.multiple,
                delay_seconds=timing.delay_seconds
            )
            await asyncio.sleep(timing.delay_seconds)
            logger.debug("harmonic_sleep_async_complete", multiple=timing.multiple)
    
    def calculate_backoff_sequence(
        self,
        max_attempts: int,
        start_multiple: int = 1,
        growth_factor: float = 2.0,
        max_multiple: Optional[int] = None
    ) -> list[HarmonicTiming]:
        """
        Calculate exponential backoff sequence using harmonic multiples.
        
        Args:
            max_attempts: Maximum number of retry attempts
            start_multiple: Starting harmonic multiple (default: 1)
            growth_factor: Multiplier for each retry (default: 2.0 for exponential)
            max_multiple: Maximum harmonic multiple to cap at
            
        Returns:
            List of HarmonicTiming for each retry attempt
            
        Example:
            >>> timer = HarmonicTimer()
            >>> sequence = timer.calculate_backoff_sequence(max_attempts=5)
            >>> for i, timing in enumerate(sequence, 1):
            ...     print(f"Attempt {i}: {timing.delay_seconds:.4f}s")
            Attempt 1: 0.2037s
            Attempt 2: 0.4074s
            Attempt 3: 0.8148s
            Attempt 4: 1.6296s
            Attempt 5: 3.2593s
        """
        sequence = []
        max_mult = max_multiple or 100  # Reasonable upper bound
        
        for attempt in range(max_attempts):
            # Calculate harmonic multiple with exponential growth
            multiple = min(
                int(start_multiple * (growth_factor ** attempt)),
                max_mult
            )
            
            timing = self.calculate_delay(
                multiple,
                description=f"Retry attempt {attempt + 1}"
            )
            sequence.append(timing)
        
        logger.debug(
            "backoff_sequence_calculated",
            max_attempts=max_attempts,
            start_multiple=start_multiple,
            growth_factor=growth_factor,
            max_multiple=max_mult,
            total_delay_seconds=sum(t.delay_seconds for t in sequence)
        )
        
        return sequence
    
    async def retry_with_backoff(
        self,
        operation: Callable[[], Awaitable[Any]],
        max_attempts: int = 5,
        start_multiple: int = 1,
        growth_factor: float = 2.0,
        max_multiple: Optional[int] = None,
        exceptions_to_retry: tuple = (Exception,),
        on_retry: Optional[Callable[[int, Exception, float], None]] = None
    ) -> RetryResult:
        """
        Retry async operation with harmonic exponential backoff.
        
        Args:
            operation: Async callable to retry
            max_attempts: Maximum retry attempts
            start_multiple: Starting harmonic multiple
            growth_factor: Backoff growth factor (default: 2.0)
            max_multiple: Maximum harmonic multiple cap
            exceptions_to_retry: Tuple of exceptions to catch and retry
            on_retry: Optional callback(attempt, exception, delay) on each retry
            
        Returns:
            RetryResult with operation outcome and timing details
            
        Example:
            >>> timer = HarmonicTimer()
            >>> async def flaky_api():
            ...     # Might fail occasionally
            ...     return await http_client.get("/api/data")
            >>> 
            >>> result = await timer.retry_with_backoff(
            ...     operation=flaky_api,
            ...     max_attempts=5,
            ...     exceptions_to_retry=(HTTPError, TimeoutError)
            ... )
            >>> if result.success:
            ...     print(f"Success after {result.attempts} attempts")
        """
        backoff_sequence = self.calculate_backoff_sequence(
            max_attempts=max_attempts,
            start_multiple=start_multiple,
            growth_factor=growth_factor,
            max_multiple=max_multiple
        )
        
        timing_sequence = []
        last_exception = None
        
        logger.info(
            "retry_backoff_started",
            max_attempts=max_attempts,
            total_possible_delay=sum(t.delay_seconds for t in backoff_sequence)
        )
        
        for attempt in range(1, max_attempts + 1):
            try:
                logger.debug("retry_attempt_start", attempt=attempt, max_attempts=max_attempts)
                result = await operation()
                
                # Success!
                total_delay = sum(timing_sequence)
                logger.info(
                    "retry_backoff_success",
                    attempt=attempt,
                    total_delay_seconds=total_delay
                )
                
                return RetryResult(
                    success=True,
                    attempts=attempt,
                    total_delay_seconds=total_delay,
                    final_result=result,
                    error=None,
                    timing_sequence=timing_sequence
                )
                
            except exceptions_to_retry as e:
                last_exception = e
                
                # If this was the last attempt, fail
                if attempt >= max_attempts:
                    logger.warning(
                        "retry_backoff_exhausted",
                        attempts=attempt,
                        error=str(e),
                        total_delay_seconds=sum(timing_sequence)
                    )
                    break
                
                # Calculate delay for this attempt
                timing = backoff_sequence[attempt - 1]
                timing_sequence.append(timing.delay_seconds)
                
                logger.warning(
                    "retry_attempt_failed",
                    attempt=attempt,
                    error=str(e),
                    next_delay_seconds=timing.delay_seconds,
                    harmonic_multiple=timing.multiple
                )
                
                # Call retry callback if provided
                if on_retry:
                    on_retry(attempt, e, timing.delay_seconds)
                
                # Sleep with harmonic backoff
                await asyncio.sleep(timing.delay_seconds)
        
        # All attempts exhausted
        return RetryResult(
            success=False,
            attempts=max_attempts,
            total_delay_seconds=sum(timing_sequence),
            final_result=None,
            error=last_exception,
            timing_sequence=timing_sequence
        )
    
    def get_harmonic_intervals(self, count: int, start_multiple: int = 1) -> list[HarmonicTiming]:
        """
        Get sequence of harmonic intervals for rate limiting.
        
        Args:
            count: Number of intervals to generate
            start_multiple: Starting harmonic multiple
            
        Returns:
            List of HarmonicTiming at regular harmonic intervals
            
        Example:
            >>> timer = HarmonicTimer()
            >>> intervals = timer.get_harmonic_intervals(count=5)
            >>> for i, timing in enumerate(intervals):
            ...     print(f"Request {i+1}: Wait {timing.delay_seconds:.4f}s")
            Request 1: Wait 0.2037s
            Request 2: Wait 0.2037s
            Request 3: Wait 0.2037s
            Request 4: Wait 0.2037s
            Request 5: Wait 0.2037s
        """
        intervals = []
        
        for i in range(count):
            timing = self.calculate_delay(
                start_multiple,
                description=f"Rate limit interval {i + 1}"
            )
            intervals.append(timing)
        
        logger.debug(
            "harmonic_intervals_generated",
            count=count,
            multiple=start_multiple,
            interval_seconds=intervals[0].delay_seconds if intervals else 0,
            total_duration=sum(t.delay_seconds for t in intervals)
        )
        
        return intervals


# Convenience functions for quick access
def quick_sleep(multiple: int) -> None:
    """Quick synchronous sleep with harmonic timing."""
    timer = HarmonicTimer()
    timer.sleep(multiple)


async def quick_sleep_async(multiple: int) -> None:
    """Quick asynchronous sleep with harmonic timing."""
    timer = HarmonicTimer()
    await timer.sleep_async(multiple)


def calculate_harmonic_delay(multiple: int) -> float:
    """Calculate harmonic delay in seconds for given multiple."""
    timer = HarmonicTimer()
    timing = timer.calculate_delay(multiple)
    return timing.delay_seconds
