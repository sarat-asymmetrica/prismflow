"""
Unit tests for Harmonic Timer.

Tests Tesla's 4.909 Hz harmonic timing for deterministic rate limiting
and retry backoff patterns.

Test Coverage:
- Harmonic delay calculations
- Synchronous and asynchronous sleep
- Exponential backoff sequences
- Retry operations with backoff
- Rate limiting intervals
- Edge cases and boundary conditions

Author: GitHub Copilot
Date: October 3, 2025
"""

import asyncio
import pytest
import time
from unittest.mock import AsyncMock, MagicMock
from app.utils.harmonic_timer import (
    HarmonicTimer,
    HarmonicMultiple,
    HarmonicTiming,
    RetryResult,
    quick_sleep_async,
    calculate_harmonic_delay
)


class TestHarmonicDelayCalculation:
    """Test suite for harmonic delay calculation."""
    
    def test_tesla_frequency_default(self):
        """Test default Tesla frequency is 4.909 Hz."""
        timer = HarmonicTimer()
        assert timer.base_frequency_hz == 4.909
        assert abs(timer.base_period_seconds - 0.2037) < 0.001  # ~203.7ms
    
    def test_calculate_single_harmonic(self):
        """Test single harmonic delay calculation."""
        timer = HarmonicTimer()
        timing = timer.calculate_delay(HarmonicMultiple.SINGLE)
        
        assert timing.multiple == 1
        assert abs(timing.delay_seconds - 0.2037) < 0.001
        assert abs(timing.period_ms - 203.7) < 1.0
        assert abs(timing.frequency_hz - 4.909) < 0.01
    
    def test_calculate_double_harmonic(self):
        """Test double harmonic delay calculation."""
        timer = HarmonicTimer()
        timing = timer.calculate_delay(HarmonicMultiple.DOUBLE)
        
        assert timing.multiple == 2
        assert abs(timing.delay_seconds - 0.4074) < 0.001
        assert abs(timing.period_ms - 407.4) < 1.0
        assert abs(timing.frequency_hz - 2.4545) < 0.01
    
    def test_calculate_triple_harmonic(self):
        """Test triple harmonic delay calculation."""
        timer = HarmonicTimer()
        timing = timer.calculate_delay(HarmonicMultiple.TRIPLE)
        
        assert timing.multiple == 3
        assert abs(timing.delay_seconds - 0.6111) < 0.001
        assert abs(timing.period_ms - 611.1) < 1.0
    
    def test_calculate_octave_harmonic(self):
        """Test octave (24×) harmonic delay."""
        timer = HarmonicTimer()
        timing = timer.calculate_delay(HarmonicMultiple.OCTAVE)
        
        assert timing.multiple == 24
        assert abs(timing.delay_seconds - 4.8889) < 0.01  # ~5 seconds
        assert abs(timing.period_ms - 4888.9) < 10.0
    
    def test_calculate_with_integer_multiple(self):
        """Test calculation with raw integer multiple."""
        timer = HarmonicTimer()
        timing = timer.calculate_delay(10)
        
        assert timing.multiple == 10
        assert abs(timing.delay_seconds - 2.037) < 0.01
        assert "10× Harmonic" in timing.description
    
    def test_calculate_zero_multiple(self):
        """Test zero multiple results in no delay."""
        timer = HarmonicTimer()
        timing = timer.calculate_delay(HarmonicMultiple.IMMEDIATE)
        
        assert timing.multiple == 0
        assert timing.delay_seconds == 0.0
        assert timing.frequency_hz == float('inf')
    
    def test_custom_frequency(self):
        """Test timer with custom frequency."""
        timer = HarmonicTimer(base_frequency_hz=10.0)  # 10 Hz = 100ms period
        timing = timer.calculate_delay(HarmonicMultiple.SINGLE)
        
        assert timer.base_frequency_hz == 10.0
        assert abs(timing.delay_seconds - 0.1) < 0.001  # 100ms
        assert abs(timing.period_ms - 100.0) < 1.0


class TestSynchronousSleep:
    """Test suite for synchronous sleep operations."""
    
    def test_sleep_single_harmonic(self):
        """Test synchronous sleep for single harmonic."""
        timer = HarmonicTimer()
        
        start_time = time.time()
        timer.sleep(HarmonicMultiple.SINGLE)
        elapsed = time.time() - start_time
        
        # Should sleep ~204ms (allow ±50ms tolerance for system jitter)
        assert abs(elapsed - 0.204) < 0.05
    
    def test_sleep_zero_multiple(self):
        """Test sleep with zero multiple doesn't delay."""
        timer = HarmonicTimer()
        
        start_time = time.time()
        timer.sleep(HarmonicMultiple.IMMEDIATE)
        elapsed = time.time() - start_time
        
        # Should be nearly instant
        assert elapsed < 0.01
    
    def test_sleep_with_integer(self):
        """Test sleep with integer multiple."""
        timer = HarmonicTimer()
        
        start_time = time.time()
        timer.sleep(2)  # 2× harmonic
        elapsed = time.time() - start_time
        
        # Should sleep ~407ms
        assert abs(elapsed - 0.407) < 0.05


class TestAsynchronousSleep:
    """Test suite for asynchronous sleep operations."""
    
    @pytest.mark.asyncio
    async def test_sleep_async_single_harmonic(self):
        """Test asynchronous sleep for single harmonic."""
        timer = HarmonicTimer()
        
        start_time = time.time()
        await timer.sleep_async(HarmonicMultiple.SINGLE)
        elapsed = time.time() - start_time
        
        # Should sleep ~204ms
        assert abs(elapsed - 0.204) < 0.05
    
    @pytest.mark.asyncio
    async def test_sleep_async_double_harmonic(self):
        """Test asynchronous sleep for double harmonic."""
        timer = HarmonicTimer()
        
        start_time = time.time()
        await timer.sleep_async(HarmonicMultiple.DOUBLE)
        elapsed = time.time() - start_time
        
        # Should sleep ~407ms
        assert abs(elapsed - 0.407) < 0.05
    
    @pytest.mark.asyncio
    async def test_sleep_async_zero_multiple(self):
        """Test async sleep with zero multiple doesn't delay."""
        timer = HarmonicTimer()
        
        start_time = time.time()
        await timer.sleep_async(HarmonicMultiple.IMMEDIATE)
        elapsed = time.time() - start_time
        
        # Should be nearly instant
        assert elapsed < 0.01
    
    @pytest.mark.asyncio
    async def test_quick_sleep_async_convenience(self):
        """Test convenience function for quick async sleep."""
        start_time = time.time()
        await quick_sleep_async(1)
        elapsed = time.time() - start_time
        
        # Should sleep ~204ms
        assert abs(elapsed - 0.204) < 0.05


class TestBackoffSequence:
    """Test suite for exponential backoff sequence calculation."""
    
    def test_backoff_sequence_default(self):
        """Test default exponential backoff sequence."""
        timer = HarmonicTimer()
        sequence = timer.calculate_backoff_sequence(max_attempts=5)
        
        assert len(sequence) == 5
        
        # Check exponential growth: 1, 2, 4, 8, 16
        assert sequence[0].multiple == 1
        assert sequence[1].multiple == 2
        assert sequence[2].multiple == 4
        assert sequence[3].multiple == 8
        assert sequence[4].multiple == 16
        
        # Check delays roughly double each time
        assert abs(sequence[1].delay_seconds - 2 * sequence[0].delay_seconds) < 0.01
        assert abs(sequence[2].delay_seconds - 2 * sequence[1].delay_seconds) < 0.01
    
    def test_backoff_sequence_linear_growth(self):
        """Test linear backoff with growth_factor=1.0."""
        timer = HarmonicTimer()
        sequence = timer.calculate_backoff_sequence(
            max_attempts=4,
            start_multiple=2,
            growth_factor=1.0
        )
        
        assert len(sequence) == 4
        # All multiples should be 2 (no growth)
        for timing in sequence:
            assert timing.multiple == 2
    
    def test_backoff_sequence_with_max_cap(self):
        """Test backoff sequence with maximum cap."""
        timer = HarmonicTimer()
        sequence = timer.calculate_backoff_sequence(
            max_attempts=10,
            start_multiple=1,
            growth_factor=2.0,
            max_multiple=10
        )
        
        # Should cap at max_multiple=10
        for timing in sequence:
            assert timing.multiple <= 10
        
        # Later attempts should be capped
        assert sequence[-1].multiple == 10
    
    def test_backoff_sequence_total_delay(self):
        """Test total delay calculation for backoff sequence."""
        timer = HarmonicTimer()
        sequence = timer.calculate_backoff_sequence(max_attempts=5)
        
        total_delay = sum(t.delay_seconds for t in sequence)
        
        # 1+2+4+8+16 = 31 multiples
        # 31 × 0.2037 ≈ 6.31 seconds
        assert abs(total_delay - 6.31) < 0.1


class TestRetryWithBackoff:
    """Test suite for retry operations with harmonic backoff."""
    
    @pytest.mark.asyncio
    async def test_retry_success_first_attempt(self):
        """Test successful operation on first attempt (no retries)."""
        timer = HarmonicTimer()
        
        async def always_succeeds():
            return "success"
        
        result = await timer.retry_with_backoff(
            operation=always_succeeds,
            max_attempts=5
        )
        
        assert result.success is True
        assert result.attempts == 1
        assert result.final_result == "success"
        assert result.error is None
        assert result.total_delay_seconds == 0.0
        assert len(result.timing_sequence) == 0
    
    @pytest.mark.asyncio
    async def test_retry_success_after_failures(self):
        """Test successful operation after some failures."""
        timer = HarmonicTimer()
        call_count = 0
        
        async def fails_twice():
            nonlocal call_count
            call_count += 1
            if call_count < 3:
                raise ValueError("Not ready yet")
            return "success"
        
        result = await timer.retry_with_backoff(
            operation=fails_twice,
            max_attempts=5,
            exceptions_to_retry=(ValueError,)
        )
        
        assert result.success is True
        assert result.attempts == 3
        assert result.final_result == "success"
        assert result.error is None
        assert len(result.timing_sequence) == 2  # 2 retries (attempts 1 & 2 failed)
        assert result.total_delay_seconds > 0
    
    @pytest.mark.asyncio
    async def test_retry_all_attempts_exhausted(self):
        """Test failure after all retry attempts exhausted."""
        timer = HarmonicTimer()
        
        async def always_fails():
            raise ConnectionError("Cannot connect")
        
        result = await timer.retry_with_backoff(
            operation=always_fails,
            max_attempts=3,
            exceptions_to_retry=(ConnectionError,)
        )
        
        assert result.success is False
        assert result.attempts == 3
        assert result.final_result is None
        assert isinstance(result.error, ConnectionError)
        assert len(result.timing_sequence) == 2  # 2 retries (3 attempts total)
    
    @pytest.mark.asyncio
    async def test_retry_with_callback(self):
        """Test retry with on_retry callback."""
        timer = HarmonicTimer()
        callback_calls = []
        
        async def fails_once():
            if len(callback_calls) == 0:
                raise TimeoutError("Timeout")
            return "success"
        
        def on_retry_callback(attempt, exception, delay):
            callback_calls.append({
                'attempt': attempt,
                'exception': str(exception),
                'delay': delay
            })
        
        result = await timer.retry_with_backoff(
            operation=fails_once,
            max_attempts=3,
            exceptions_to_retry=(TimeoutError,),
            on_retry=on_retry_callback
        )
        
        assert result.success is True
        assert result.attempts == 2
        assert len(callback_calls) == 1  # Called once on first failure
        assert callback_calls[0]['attempt'] == 1
        assert 'Timeout' in callback_calls[0]['exception']
        assert callback_calls[0]['delay'] > 0
    
    @pytest.mark.asyncio
    async def test_retry_exponential_backoff_timing(self):
        """Test that retry delays follow exponential backoff pattern."""
        timer = HarmonicTimer()
        attempt_count = 0
        
        async def fails_multiple_times():
            nonlocal attempt_count
            attempt_count += 1
            if attempt_count < 4:
                raise RuntimeError("Still failing")
            return "success"
        
        start_time = time.time()
        result = await timer.retry_with_backoff(
            operation=fails_multiple_times,
            max_attempts=5,
            start_multiple=1,
            growth_factor=2.0,
            exceptions_to_retry=(RuntimeError,)
        )
        elapsed = time.time() - start_time
        
        assert result.success is True
        assert result.attempts == 4
        
        # Total delay should be: 1× + 2× + 4× = 7× base period
        # 7 × 0.2037 ≈ 1.426 seconds
        expected_delay = 7 * 0.2037
        assert abs(result.total_delay_seconds - expected_delay) < 0.2
        assert abs(elapsed - expected_delay) < 0.3  # Allow system jitter


class TestRateLimitingIntervals:
    """Test suite for rate limiting interval generation."""
    
    def test_harmonic_intervals_same_multiple(self):
        """Test generating intervals with same harmonic multiple."""
        timer = HarmonicTimer()
        intervals = timer.get_harmonic_intervals(count=5, start_multiple=1)
        
        assert len(intervals) == 5
        
        # All intervals should be equal
        for timing in intervals:
            assert timing.multiple == 1
            assert abs(timing.delay_seconds - 0.2037) < 0.001
    
    def test_harmonic_intervals_total_duration(self):
        """Test total duration of rate limiting sequence."""
        timer = HarmonicTimer()
        intervals = timer.get_harmonic_intervals(count=10, start_multiple=2)
        
        total_duration = sum(t.delay_seconds for t in intervals)
        
        # 10 intervals × 2× harmonic = 20× base period
        # 20 × 0.2037 ≈ 4.074 seconds
        assert abs(total_duration - 4.074) < 0.01
    
    def test_harmonic_intervals_for_rate_limiting(self):
        """Test intervals suitable for API rate limiting."""
        timer = HarmonicTimer()
        
        # Simulate 5 requests per second (200ms intervals)
        intervals = timer.get_harmonic_intervals(count=5, start_multiple=1)
        
        # Each interval ~204ms, perfect for 5 RPS
        for timing in intervals:
            assert abs(timing.delay_seconds - 0.204) < 0.01


class TestConvenienceFunctions:
    """Test suite for convenience functions."""
    
    def test_calculate_harmonic_delay_function(self):
        """Test calculate_harmonic_delay convenience function."""
        delay = calculate_harmonic_delay(3)
        
        # 3× harmonic ≈ 0.611 seconds
        assert abs(delay - 0.611) < 0.01
    
    def test_calculate_harmonic_delay_zero(self):
        """Test calculate_harmonic_delay with zero multiple."""
        delay = calculate_harmonic_delay(0)
        assert delay == 0.0
    
    def test_calculate_harmonic_delay_large_multiple(self):
        """Test calculate_harmonic_delay with large multiple."""
        delay = calculate_harmonic_delay(100)
        
        # 100× harmonic ≈ 20.37 seconds
        assert abs(delay - 20.37) < 0.1


class TestHarmonicTimingDataclass:
    """Test suite for HarmonicTiming dataclass."""
    
    def test_harmonic_timing_repr(self):
        """Test HarmonicTiming string representation."""
        timing = HarmonicTiming(
            multiple=3,
            delay_seconds=0.6111,
            frequency_hz=1.636,
            period_ms=611.1,
            description="Triple"
        )
        
        repr_str = repr(timing)
        assert "HarmonicTiming" in repr_str
        assert "multiple=3" in repr_str
        assert "0.6111" in repr_str


class TestRetryResultDataclass:
    """Test suite for RetryResult dataclass."""
    
    def test_retry_result_success_repr(self):
        """Test RetryResult string representation for success."""
        result = RetryResult(
            success=True,
            attempts=3,
            total_delay_seconds=1.234,
            final_result="data",
            error=None,
            timing_sequence=[0.2, 0.4, 0.8]
        )
        
        repr_str = repr(result)
        assert "SUCCESS" in repr_str
        assert "attempts=3" in repr_str
        assert "1.234" in repr_str
    
    def test_retry_result_failure_repr(self):
        """Test RetryResult string representation for failure."""
        result = RetryResult(
            success=False,
            attempts=5,
            total_delay_seconds=6.31,
            final_result=None,
            error=Exception("Failed"),
            timing_sequence=[0.2, 0.4, 0.8, 1.6, 3.2]
        )
        
        repr_str = repr(result)
        assert "FAILED" in repr_str
        assert "attempts=5" in repr_str


class TestEdgeCases:
    """Test suite for edge cases and boundary conditions."""
    
    def test_very_small_frequency(self):
        """Test timer with very small frequency."""
        timer = HarmonicTimer(base_frequency_hz=0.1)  # 10 second period
        timing = timer.calculate_delay(1)
        
        assert abs(timing.delay_seconds - 10.0) < 0.1
    
    def test_very_large_frequency(self):
        """Test timer with very large frequency."""
        timer = HarmonicTimer(base_frequency_hz=1000.0)  # 1ms period
        timing = timer.calculate_delay(1)
        
        assert abs(timing.delay_seconds - 0.001) < 0.0001
    
    def test_backoff_single_attempt(self):
        """Test backoff with only one attempt (no retries)."""
        timer = HarmonicTimer()
        sequence = timer.calculate_backoff_sequence(max_attempts=1)
        
        assert len(sequence) == 1
        assert sequence[0].multiple == 1
    
    @pytest.mark.asyncio
    async def test_retry_single_attempt_failure(self):
        """Test retry with single attempt that fails."""
        timer = HarmonicTimer()
        
        async def always_fails():
            raise ValueError("Error")
        
        result = await timer.retry_with_backoff(
            operation=always_fails,
            max_attempts=1,
            exceptions_to_retry=(ValueError,)
        )
        
        assert result.success is False
        assert result.attempts == 1
        assert len(result.timing_sequence) == 0  # No retries with max_attempts=1
