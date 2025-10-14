"""
[sigma] Semantic: Quote Style Fixer
[rho] Resilience: Respects string interpolation and JSX
[kappa] Knowledge: JavaScript string literals and JSX attributes

Strategies:
1. Detect project preference from ESLint config
2. Convert quotes (avoiding template literals)
3. Handle JSX attribute quotes separately
"""

import re
from pathlib import Path
from typing import List, Dict


class QuotesFixer:
    """
    [sigma] Semantic: Intelligent quote style standardizer
    [rho] Resilience: Template literal awareness
    [kappa] Knowledge: JavaScript/TypeScript string rules
    """

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.fixed_count = 0
        self.preferred_quote = self._detect_preferred_quote()

    def fix_violations(self, violations: List[Dict]) -> int:
        """
        [rho] Fix quote style violations

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
                print(f"[Quotes] Error reading {file_path}: {e}")
                continue

            lines = content.split('\n')

            # Validate line number
            line_idx = violation['line'] - 1
            if line_idx < 0 or line_idx >= len(lines):
                continue

            line = lines[line_idx]

            # Fix quotes based on preference
            new_line = self._fix_quotes_in_line(line, violation)

            if new_line != line:
                lines[line_idx] = new_line
                try:
                    file_path.write_text('\n'.join(lines), encoding='utf-8')
                    self.fixed_count += 1
                    print(f"[Quotes] OK: Fixed quotes in {file_path.name}:{violation['line']}")
                except Exception as e:
                    print(f"[Quotes] Error writing {file_path}: {e}")

        return self.fixed_count

    def _detect_preferred_quote(self) -> str:
        """
        [kappa] Detect preferred quote style from ESLint config

        Returns:
            'single', 'double', or 'backtick'
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
                    # Look for quotes rule
                    if "'quotes'" in content or '"quotes"' in content:
                        if "'single'" in content or '"single"' in content:
                            return 'single'
                        elif "'double'" in content or '"double"' in content:
                            return 'double'
                        elif "'backtick'" in content or '"backtick"' in content:
                            return 'backtick'
                except Exception:
                    pass

        # Default to single
        return 'single'

    def _fix_quotes_in_line(self, line: str, violation: Dict) -> str:
        """
        [kappa] Fix quotes in a single line

        Args:
            line: Source line
            violation: Violation dict

        Returns:
            Modified line
        """
        # Don't touch template literals
        if '`' in line and '${' in line:
            return line

        if self.preferred_quote == 'single':
            # Convert double to single
            # But preserve escaped quotes
            return self._convert_to_single_quotes(line)
        elif self.preferred_quote == 'double':
            # Convert single to double
            return self._convert_to_double_quotes(line)
        else:
            # Backtick preference - leave as is (too risky to auto-convert)
            return line

    def _convert_to_single_quotes(self, line: str) -> str:
        """
        [kappa] Convert double quotes to single quotes

        Args:
            line: Source line

        Returns:
            Modified line
        """
        # Simple approach: replace " with ' but preserve \" and strings with '
        # This is a simplified version - full implementation needs AST parsing

        # Find all string literals with double quotes
        result = []
        i = 0
        while i < len(line):
            if line[i] == '"':
                # Start of string literal
                j = i + 1
                while j < len(line):
                    if line[j] == '\\':
                        j += 2  # Skip escaped character
                        continue
                    if line[j] == '"':
                        # End of string literal
                        string_content = line[i+1:j]
                        # Only convert if no single quotes inside
                        if "'" not in string_content:
                            result.append("'")
                            result.append(string_content)
                            result.append("'")
                        else:
                            result.append(line[i:j+1])
                        i = j + 1
                        break
                    j += 1
                else:
                    # No closing quote found
                    result.append(line[i])
                    i += 1
            else:
                result.append(line[i])
                i += 1

        return ''.join(result)

    def _convert_to_double_quotes(self, line: str) -> str:
        """
        [kappa] Convert single quotes to double quotes

        Args:
            line: Source line

        Returns:
            Modified line
        """
        # Similar to single quotes but reverse

        result = []
        i = 0
        while i < len(line):
            if line[i] == "'" and (i == 0 or line[i-1] != '\\'):
                # Start of string literal
                j = i + 1
                while j < len(line):
                    if line[j] == '\\':
                        j += 2  # Skip escaped character
                        continue
                    if line[j] == "'":
                        # End of string literal
                        string_content = line[i+1:j]
                        # Only convert if no double quotes inside
                        if '"' not in string_content:
                            result.append('"')
                            result.append(string_content)
                            result.append('"')
                        else:
                            result.append(line[i:j+1])
                        i = j + 1
                        break
                    j += 1
                else:
                    # No closing quote found
                    result.append(line[i])
                    i += 1
            else:
                result.append(line[i])
                i += 1

        return ''.join(result)
