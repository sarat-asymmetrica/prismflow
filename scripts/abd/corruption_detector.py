"""
[σ] Semantic: Corruption Detector for ABD V1
[ρ] Resilience: Detects when fixes introduce new errors
[κ] Knowledge: Error count validation, regression detection

Validates:
- Error count doesn't increase after fixes
- No new critical errors introduced
- Build still succeeds or improves
"""

from typing import Dict, List


class CorruptionDetector:
    """
    [σ] Semantic: Detects corruption in automated fixes
    [ρ] Resilience: Multiple validation strategies
    [κ] Knowledge: Build error patterns, regression detection
    """

    def __init__(self):
        self.baseline_errors = None
        self.baseline_count = 0

    def set_baseline(self, errors: List[Dict], error_count: int):
        """
        [κ] Knowledge: Set baseline error state

        Args:
            errors: List of error dictionaries
            error_count: Total error count
        """
        self.baseline_errors = errors
        self.baseline_count = error_count

    def detect_corruption(
        self,
        new_errors: List[Dict],
        new_count: int
    ) -> Dict:
        """
        [ρ] Resilience: Detect if fixes introduced corruption
        [σ] Semantic: Multiple corruption indicators

        Args:
            new_errors: List of new error dictionaries
            new_count: New total error count

        Returns:
            Dict with corruption detection results
        """
        if self.baseline_errors is None:
            return {
                'corrupted': False,
                'reason': 'No baseline set'
            }

        # Check 1: Error count increased
        if new_count > self.baseline_count:
            return {
                'corrupted': True,
                'reason': 'Error count increased',
                'baseline_count': self.baseline_count,
                'new_count': new_count,
                'delta': new_count - self.baseline_count,
                'new_errors': self._identify_new_errors(new_errors)
            }

        # Check 2: New critical errors
        new_critical = self._identify_critical_errors(new_errors)
        baseline_critical = self._identify_critical_errors(self.baseline_errors)

        if len(new_critical) > len(baseline_critical):
            return {
                'corrupted': True,
                'reason': 'New critical errors introduced',
                'baseline_critical': len(baseline_critical),
                'new_critical': len(new_critical),
                'critical_errors': new_critical
            }

        # Check 3: Completely new error types
        baseline_types = set(e.get('type', 'unknown') for e in self.baseline_errors)
        new_types = set(e.get('type', 'unknown') for e in new_errors)

        introduced_types = new_types - baseline_types

        if introduced_types and len(introduced_types) > 2:
            return {
                'corrupted': True,
                'reason': 'Multiple new error types introduced',
                'new_types': list(introduced_types)
            }

        # No corruption detected
        return {
            'corrupted': False,
            'reason': 'Validation passed',
            'errors_fixed': self.baseline_count - new_count,
            'baseline_count': self.baseline_count,
            'new_count': new_count
        }

    def _identify_new_errors(self, new_errors: List[Dict]) -> List[Dict]:
        """
        [κ] Knowledge: Identify errors not present in baseline

        Args:
            new_errors: List of new error dictionaries

        Returns:
            List of genuinely new errors
        """
        if not self.baseline_errors:
            return new_errors

        # Create signature for each baseline error
        baseline_signatures = set()
        for error in self.baseline_errors:
            signature = self._create_error_signature(error)
            baseline_signatures.add(signature)

        # Find errors not in baseline
        new = []
        for error in new_errors:
            signature = self._create_error_signature(error)
            if signature not in baseline_signatures:
                new.append(error)

        return new

    def _create_error_signature(self, error: Dict) -> str:
        """
        [κ] Knowledge: Create unique signature for error

        Args:
            error: Error dictionary

        Returns:
            String signature
        """
        # Combine type and key parts of message
        error_type = error.get('type', 'unknown')
        message = error.get('message', '')
        file = error.get('file', '')

        # Create normalized signature
        signature = f"{error_type}:{file}:{message[:50]}"

        return signature

    def _identify_critical_errors(self, errors: List[Dict]) -> List[Dict]:
        """
        [κ] Knowledge: Identify critical errors

        Args:
            errors: List of error dictionaries

        Returns:
            List of critical errors
        """
        critical_types = [
            'syntax_error',
            'reference_error',
            'type_error',
            'fatal_error'
        ]

        critical = []

        for error in errors:
            error_type = error.get('type', 'unknown')
            message = error.get('message', '').lower()

            # Check if it's a critical type
            if error_type in critical_types:
                critical.append(error)
                continue

            # Check if message contains critical keywords
            critical_keywords = [
                'fatal',
                'critical',
                'cannot start',
                'failed to compile',
                'syntax error'
            ]

            for keyword in critical_keywords:
                if keyword in message:
                    critical.append(error)
                    break

        return critical

    def analyze_regression(
        self,
        baseline_errors: List[Dict],
        new_errors: List[Dict]
    ) -> Dict:
        """
        [σ] Semantic: Analyze regression between baseline and new state

        Args:
            baseline_errors: Baseline error list
            new_errors: New error list

        Returns:
            Dict with regression analysis
        """
        # Classify errors
        baseline_by_type = self._classify_by_type(baseline_errors)
        new_by_type = self._classify_by_type(new_errors)

        # Calculate deltas
        deltas = {}

        all_types = set(list(baseline_by_type.keys()) + list(new_by_type.keys()))

        for error_type in all_types:
            baseline_count = len(baseline_by_type.get(error_type, []))
            new_count = len(new_by_type.get(error_type, []))

            deltas[error_type] = {
                'baseline': baseline_count,
                'new': new_count,
                'delta': new_count - baseline_count,
                'improved': new_count < baseline_count
            }

        return {
            'total_baseline': len(baseline_errors),
            'total_new': len(new_errors),
            'total_delta': len(new_errors) - len(baseline_errors),
            'by_type': deltas,
            'improved_types': [t for t, d in deltas.items() if d['improved']],
            'regressed_types': [t for t, d in deltas.items() if d['delta'] > 0]
        }

    def _classify_by_type(self, errors: List[Dict]) -> Dict[str, List[Dict]]:
        """
        [κ] Knowledge: Classify errors by type

        Args:
            errors: List of errors

        Returns:
            Dict mapping error type to error list
        """
        classified = {}

        for error in errors:
            error_type = error.get('type', 'unknown')

            if error_type not in classified:
                classified[error_type] = []

            classified[error_type].append(error)

        return classified
