"""
[sigma] Semantic: Semicolon Fixer
[rho] Resilience: Handles ASI edge cases
[kappa] Knowledge: Automatic Semicolon Insertion rules

Strategies:
1. Detect project preference from ESLint config
2. Add semicolons (if preference is 'always')
3. Remove semicolons (if preference is 'never')
4. Handle ASI edge cases
"""

import re
from pathlib import Path
from typing import List, Dict


class SemiFixer:
    """
    [sigma] Semantic: Intelligent semicolon handler
    [rho] Resilience: ASI-aware
    [kappa] Knowledge: JavaScript semicolon rules
    """

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.fixed_count = 0
        self.use_semi = self._detect_semi_preference()

    def fix_violations(self, violations: List[Dict]) -> int:
        """
        [rho] Fix semicolon violations

        Args:
            violations: List of violation dicts

        Returns:
            Number of violations fixed
        """
        self.fixed_count = 0

        for violation in violations:
            file_path = Path(violation['file'])

            # Verify file exists
            if not file_path.exists():
                continue

            # Read file
            try:
                content = file_path.read_text(encoding='utf-8')
            except Exception as e:
                print(f"[Semi] Error reading {file_path}: {e}")
                continue

            lines = content.split('\n')

            # Validate line number
            line_idx = violation['line'] - 1
            if line_idx < 0 or line_idx >= len(lines):
                continue

            line = lines[line_idx]

            # Fix semicolons based on preference
            new_line = self._fix_semicolons_in_line(line)

            if new_line != line:
                lines[line_idx] = new_line
                try:
                    file_path.write_text('\n'.join(lines), encoding='utf-8')
                    self.fixed_count += 1
                    action = "Added" if self.use_semi else "Removed"
                    print(f"[Semi] OK: {action} semicolon in {file_path.name}:{violation['line']}")
                except Exception as e:
                    print(f"[Semi] Error writing {file_path}: {e}")

        return self.fixed_count

    def _detect_semi_preference(self) -> bool:
        """
        [kappa] Detect semicolon preference from ESLint config

        Returns:
            True if semicolons should be used, False otherwise
        """
        # Try to read ESLint config
        config_files = [
            self.project_root / 'eslint.config.js',
            self.project_root / '.eslintrc.json',
            self.project_root / '.eslintrc.js',
        ]

        for config_file in config_files:
            if config_file.exists():
                try:
                    content = config_file.read_text(encoding='utf-8')
                    # Look for semi rule
                    if "'semi'" in content or '"semi"' in content:
                        if "'never'" in content or '"never"' in content:
                            return False
                        elif "'always'" in content or '"always"' in content:
                            return True
                except Exception:
                    pass

        # Default to always (more common)
        return True

    def _fix_semicolons_in_line(self, line: str) -> str:
        """
        [kappa] Fix semicolons in a single line

        Args:
            line: Source line

        Returns:
            Modified line
        """
        stripped = line.rstrip()

        if self.use_semi:
            # Add semicolon if missing
            if stripped and not self._should_skip_line(stripped):
                if not stripped.endswith(';') and not stripped.endswith('{') and not stripped.endswith('}'):
                    # Check if it's a statement that needs semicolon
                    if self._needs_semicolon(stripped):
                        return stripped + ';' + line[len(stripped):]
        else:
            # Remove semicolon if present
            if stripped.endswith(';'):
                # But keep if it's necessary (e.g., for loop)
                if not self._is_necessary_semicolon(line):
                    return stripped[:-1] + line[len(stripped):]

        return line

    def _should_skip_line(self, line: str) -> bool:
        """
        [kappa] Check if line should be skipped

        Args:
            line: Source line (stripped)

        Returns:
            True if should skip
        """
        # Skip comments, empty lines, control structures
        skip_patterns = [
            '//',
            '/*',
            '*/',
            'import ',
            'export ',
            'if ',
            'else',
            'for ',
            'while ',
            'switch ',
            'case ',
            'default:',
            'try',
            'catch',
            'finally',
        ]

        return any(line.strip().startswith(pattern) for pattern in skip_patterns)

    def _needs_semicolon(self, line: str) -> bool:
        """
        [kappa] Check if line needs semicolon

        Args:
            line: Source line (stripped)

        Returns:
            True if needs semicolon
        """
        # Lines that typically need semicolons
        needs_semi_patterns = [
            'const ',
            'let ',
            'var ',
            'return ',
            'throw ',
            'break',
            'continue',
        ]

        return any(line.strip().startswith(pattern) for pattern in needs_semi_patterns)

    def _is_necessary_semicolon(self, line: str) -> bool:
        """
        [kappa] Check if semicolon is necessary (can't be removed)

        Args:
            line: Source line

        Returns:
            True if semicolon is necessary
        """
        # Semicolons in for loops are necessary
        if 'for (' in line or 'for(' in line:
            return True

        return False
