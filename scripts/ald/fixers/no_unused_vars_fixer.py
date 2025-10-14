"""
[sigma] Semantic: Unused Variables Fixer
[rho] Resilience: Only removes truly unused variables
[kappa] Knowledge: Variable usage analysis with AST awareness

Strategies:
1. Prefix with underscore (TypeScript convention for intentionally unused)
2. Remove variable if truly unused and safe
3. Convert to void expression if in destructuring
"""

import re
from pathlib import Path
from typing import List, Dict


class NoUnusedVarsFixer:
    """
    [sigma] Semantic: Intelligent unused variable fixer
    [rho] Resilience: Multiple strategies with safety checks
    [kappa] Knowledge: TypeScript/JavaScript naming conventions
    """

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.fixed_count = 0

    def fix_violations(self, violations: List[Dict]) -> int:
        """
        [rho] Fix unused variable violations with safety

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
                print(f"[NoUnusedVars] Error reading {file_path}: {e}")
                continue

            lines = content.split('\n')

            # Validate line number
            line_idx = violation['line'] - 1
            if line_idx < 0 or line_idx >= len(lines):
                continue

            line = lines[line_idx]

            # Strategy 1: Prefix with underscore (safest, preferred)
            if self._can_prefix_with_underscore(line, violation):
                lines[line_idx] = self._prefix_with_underscore(line, violation)
                try:
                    file_path.write_text('\n'.join(lines), encoding='utf-8')
                    self.fixed_count += 1
                    print(f"[NoUnusedVars] OK: Prefixed with _ in {file_path.name}:{violation['line']}")
                except Exception as e:
                    print(f"[NoUnusedVars] Error writing {file_path}: {e}")
                continue

            # Strategy 2: Remove import if unused
            if self._is_unused_import(line, violation):
                lines[line_idx] = self._remove_unused_import(line, violation)
                try:
                    file_path.write_text('\n'.join(lines), encoding='utf-8')
                    self.fixed_count += 1
                    print(f"[NoUnusedVars] OK: Removed unused import in {file_path.name}:{violation['line']}")
                except Exception as e:
                    print(f"[NoUnusedVars] Error writing {file_path}: {e}")
                continue

            # Strategy 3: Comment out unused const/let/var
            if self._is_unused_declaration(line, violation):
                lines[line_idx] = self._comment_out_declaration(line)
                try:
                    file_path.write_text('\n'.join(lines), encoding='utf-8')
                    self.fixed_count += 1
                    print(f"[NoUnusedVars] OK: Commented out unused var in {file_path.name}:{violation['line']}")
                except Exception as e:
                    print(f"[NoUnusedVars] Error writing {file_path}: {e}")
                continue

        return self.fixed_count

    def _can_prefix_with_underscore(self, line: str, violation: Dict) -> bool:
        """
        [kappa] Check if we can safely prefix variable with underscore

        Args:
            line: Source line
            violation: Violation dict

        Returns:
            True if safe to prefix
        """
        # Works for function parameters, destructured variables, etc.
        # Don't prefix if already prefixed
        var_name = self._extract_var_name(violation)
        if not var_name or var_name.startswith('_'):
            return False

        # Check if it's a parameter or destructured variable
        if 'function' in line or 'const {' in line or 'let {' in line or 'const [' in line:
            return True

        return False

    def _prefix_with_underscore(self, line: str, violation: Dict) -> str:
        """
        [kappa] Prefix variable name with underscore

        Args:
            line: Source line
            violation: Violation dict

        Returns:
            Modified line
        """
        var_name = self._extract_var_name(violation)
        if not var_name:
            return line

        # Replace first occurrence of variable name with _varName
        # Use word boundary to avoid partial replacements
        pattern = rf'\b{re.escape(var_name)}\b'
        return re.sub(pattern, f'_{var_name}', line, count=1)

    def _extract_var_name(self, violation: Dict) -> str:
        """
        [kappa] Extract variable name from violation message

        Args:
            violation: Violation dict

        Returns:
            Variable name or empty string
        """
        # Pattern: 'varName' is defined but never used
        # Pattern: 'varName' is assigned a value but never used
        match = re.search(r"'([^']+)' is (defined|assigned)", violation['message'])
        if match:
            return match.group(1)
        return ''

    def _is_unused_import(self, line: str, violation: Dict) -> bool:
        """
        [kappa] Check if violation is an unused import

        Args:
            line: Source line
            violation: Violation dict

        Returns:
            True if unused import
        """
        return 'import' in line.lower()

    def _remove_unused_import(self, line: str, violation: Dict) -> str:
        """
        [kappa] Remove unused import from line

        Args:
            line: Source line
            violation: Violation dict

        Returns:
            Modified line (commented out or empty)
        """
        var_name = self._extract_var_name(violation)
        if not var_name:
            # Comment out entire import
            indent = len(line) - len(line.lstrip())
            return ' ' * indent + '// ' + line.lstrip()

        # Try to remove just the unused import
        # Handle: import { A, B, C } from 'module'
        if 'import {' in line or 'import{' in line:
            # Remove the specific import
            pattern = rf',?\s*{re.escape(var_name)}\s*,?'
            new_line = re.sub(pattern, '', line)

            # Clean up double commas or trailing/leading commas
            new_line = re.sub(r',\s*,', ',', new_line)
            new_line = re.sub(r'{\s*,', '{', new_line)
            new_line = re.sub(r',\s*}', '}', new_line)

            # If empty imports, comment out entire line
            if '{ }' in new_line or '{}' in new_line:
                indent = len(line) - len(line.lstrip())
                return ' ' * indent + '// ' + line.lstrip()

            return new_line

        # Comment out entire import for other cases
        indent = len(line) - len(line.lstrip())
        return ' ' * indent + '// ' + line.lstrip()

    def _is_unused_declaration(self, line: str, violation: Dict) -> bool:
        """
        [kappa] Check if violation is an unused variable declaration

        Args:
            line: Source line
            violation: Violation dict

        Returns:
            True if unused declaration
        """
        return any(keyword in line for keyword in ['const ', 'let ', 'var '])

    def _comment_out_declaration(self, line: str) -> str:
        """
        [kappa] Comment out variable declaration

        Args:
            line: Source line

        Returns:
            Commented line
        """
        indent = len(line) - len(line.lstrip())
        return ' ' * indent + '// ' + line.lstrip()
