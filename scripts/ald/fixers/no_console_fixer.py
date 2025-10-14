"""
[sigma] Semantic: Console Statement Remover
[rho] Resilience: Preserves debugging in development files
[kappa] Knowledge: Development vs production contexts

Strategies:
1. Comment out console statements (preserves for debugging)
2. Remove console statements (aggressive mode)
3. Skip test and script files (preserve debug logs)
"""

import re
from pathlib import Path
from typing import List, Dict


class NoConsoleFixer:
    """
    [sigma] Semantic: Intelligent console statement handler
    [rho] Resilience: Context-aware removal
    [kappa] Knowledge: Production vs development patterns
    """

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.fixed_count = 0

    def fix_violations(self, violations: List[Dict]) -> int:
        """
        [rho] Fix console statement violations

        Args:
            violations: List of violation dicts

        Returns:
            Number of violations fixed
        """
        self.fixed_count = 0

        for violation in violations:
            file_path = Path(violation['file'])

            # Skip test and script files (preserve debug logs)
            if self._should_skip_file(file_path):
                print(f"[NoConsole] SKIP: {file_path.name} (test/script file)")
                continue

            # Verify file exists
            if not file_path.exists():
                continue

            # Read file
            try:
                content = file_path.read_text(encoding='utf-8')
            except Exception as e:
                print(f"[NoConsole] Error reading {file_path}: {e}")
                continue

            lines = content.split('\n')

            # Validate line number
            line_idx = violation['line'] - 1
            if line_idx < 0 or line_idx >= len(lines):
                continue

            line = lines[line_idx]

            # Strategy 1: Comment out (safer than deleting)
            if 'console.' in line:
                lines[line_idx] = self._comment_out_console(line)
                try:
                    file_path.write_text('\n'.join(lines), encoding='utf-8')
                    self.fixed_count += 1
                    print(f"[NoConsole] OK: Commented out console in {file_path.name}:{violation['line']}")
                except Exception as e:
                    print(f"[NoConsole] Error writing {file_path}: {e}")
                continue

        return self.fixed_count

    def _should_skip_file(self, file_path: Path) -> bool:
        """
        [kappa] Determine if file should be skipped

        Args:
            file_path: Path to file

        Returns:
            True if file should be skipped
        """
        file_str = str(file_path).lower()

        # Skip patterns
        skip_patterns = [
            'test',
            'spec',
            '.test.',
            '.spec.',
            '__tests__',
            'scripts/',
            'script/',
        ]

        return any(pattern in file_str for pattern in skip_patterns)

    def _comment_out_console(self, line: str) -> str:
        """
        [kappa] Comment out console statement

        Args:
            line: Source line

        Returns:
            Commented line
        """
        indent = len(line) - len(line.lstrip())
        return ' ' * indent + '// ' + line.lstrip()

    def _remove_console_line(self, line: str) -> str:
        """
        [kappa] Remove console statement entirely (aggressive)

        Args:
            line: Source line

        Returns:
            Empty string or cleaned line
        """
        # If line only contains console statement, remove it
        stripped = line.strip()
        if stripped.startswith('console.') and stripped.endswith(';'):
            return ''

        # Otherwise just remove the console call
        return re.sub(r'console\.\w+\([^)]*\);?', '', line)
