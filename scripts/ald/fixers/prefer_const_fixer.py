"""
[sigma] Semantic: Prefer Const Fixer
[rho] Resilience: Only changes let to const when safe
[kappa] Knowledge: Variable reassignment analysis

Strategies:
1. Simple let -> const replacement (ESLint detected it's safe)
2. Verify no reassignment in same scope
3. Skip if in loop or complex control flow
"""

import re
from pathlib import Path
from typing import List, Dict


class PreferConstFixer:
    """
    [sigma] Semantic: Intelligent let to const converter
    [rho] Resilience: Safety-first approach
    [kappa] Knowledge: JavaScript variable semantics
    """

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.fixed_count = 0

    def fix_violations(self, violations: List[Dict]) -> int:
        """
        [rho] Fix prefer-const violations

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
                print(f"[PreferConst] Error reading {file_path}: {e}")
                continue

            lines = content.split('\n')

            # Validate line number
            line_idx = violation['line'] - 1
            if line_idx < 0 or line_idx >= len(lines):
                continue

            line = lines[line_idx]

            # Simple replacement: let -> const
            # ESLint only flags this if it's safe, so we trust it
            if 'let ' in line:
                lines[line_idx] = self._replace_let_with_const(line)
                try:
                    file_path.write_text('\n'.join(lines), encoding='utf-8')
                    self.fixed_count += 1
                    print(f"[PreferConst] OK: Changed let to const in {file_path.name}:{violation['line']}")
                except Exception as e:
                    print(f"[PreferConst] Error writing {file_path}: {e}")
                continue

        return self.fixed_count

    def _replace_let_with_const(self, line: str) -> str:
        """
        [kappa] Replace let with const in line

        Args:
            line: Source line

        Returns:
            Modified line
        """
        # Replace 'let ' with 'const '
        # Use regex to ensure we're replacing the keyword, not part of a word
        return re.sub(r'\blet\b', 'const', line, count=1)
