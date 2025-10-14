"""
[sigma] Semantic: Corruption Detection for ALD V1
[rho] Resilience: Multiple validation strategies
[kappa] Knowledge: File integrity, syntax validation, ESLint re-analysis

Detects:
- Increased violation count (regression)
- Syntax errors introduced
- File corruption
- Import/export breakage
"""

import subprocess
from pathlib import Path
from typing import Dict, Optional


class CorruptionDetector:
    """
    [sigma] Semantic: Multi-strategy corruption detector
    [rho] Resilience: Catches regressions before they persist
    [kappa] Knowledge: Syntax validation + ESLint analysis
    """

    def __init__(self, project_root: Path):
        self.project_root = project_root

    def detect_corruption(self, baseline_violations: int, current_violations: int) -> bool:
        """
        [rho] Detect if fixes introduced corruption

        Args:
            baseline_violations: Number of violations before fixes
            current_violations: Number of violations after fixes

        Returns:
            True if corruption detected, False if OK
        """
        # Primary check: violation count should decrease, not increase
        if current_violations > baseline_violations:
            return True

        return False

    def validate_syntax(self, file_path: Path) -> bool:
        """
        [kappa] Validate JavaScript/TypeScript syntax

        Args:
            file_path: Path to file to validate

        Returns:
            True if syntax is valid, False otherwise
        """
        # Try TypeScript compiler check
        result = subprocess.run(
            f'npx tsc --noEmit "{file_path}" 2>nul',
            shell=True,
            capture_output=True,
            cwd=self.project_root
        )

        return result.returncode == 0

    def check_imports(self, file_path: Path) -> bool:
        """
        [kappa] Check if imports are still valid

        Args:
            file_path: Path to file to check

        Returns:
            True if imports are valid, False otherwise
        """
        try:
            content = file_path.read_text(encoding='utf-8')

            # Check for common import issues
            # Unclosed imports
            if 'import {' in content:
                if content.count('import {') != content.count('}'):
                    return False

            # Unclosed strings in imports
            import_lines = [line for line in content.split('\n') if 'import' in line]
            for line in import_lines:
                if line.count('"') % 2 != 0 and line.count("'") % 2 != 0:
                    return False

            return True
        except Exception:
            return False

    def get_corruption_details(self, baseline: int, current: int) -> Dict:
        """
        [kappa] Get detailed corruption information

        Args:
            baseline: Baseline violation count
            current: Current violation count

        Returns:
            Dict with corruption details
        """
        return {
            'corrupted': current > baseline,
            'baseline_violations': baseline,
            'current_violations': current,
            'delta': current - baseline,
            'severity': self._get_corruption_severity(baseline, current)
        }

    def _get_corruption_severity(self, baseline: int, current: int) -> str:
        """
        [kappa] Determine corruption severity level

        Args:
            baseline: Baseline count
            current: Current count

        Returns:
            Severity level ('none', 'minor', 'major', 'critical')
        """
        if current <= baseline:
            return 'none'

        delta = current - baseline

        if delta <= 5:
            return 'minor'
        elif delta <= 20:
            return 'major'
        else:
            return 'critical'
