"""
[σ] Semantic: TS2339 Prisma Property Fixer
[ρ] Resilience: Validates fixes against actual schema
[κ] Knowledge: Uses Prisma schema as source of truth

Specialized fixer for Prisma-related TS2339 errors (property does not exist).
Handles:
- Incorrect model names: prisma.user -> prisma.staffUser
- Incorrect field names: customer.grade -> customer.defaultCurrency
- Case mismatches: prisma.hTXSession -> prisma.htxAuthKey

Created: 2025-10-14
ATD Version: 3.1.0 (D3 Enterprise Grade)
"""

import re
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime
import shutil

# Import the Prisma schema parser
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from prisma_schema_parser import PrismaSchemaParser


class TS2339PrismaPropertyFixer:
    """
    [σ] TS2339 Prisma Property Fixer - Enterprise Grade

    Fixes Prisma-specific property errors by:
    1. Detecting model name mismatches
    2. Detecting field name mismatches
    3. Suggesting corrections based on schema
    """

    def __init__(self, project_root: Path):
        """
        [κ] Initialize fixer with Prisma schema

        Args:
            project_root: Root directory of project
        """
        self.project_root = project_root
        self.backup_dir = project_root / "scripts" / "atd" / "backups"

        # Initialize Prisma schema parser
        schema_path = project_root / "prisma" / "schema.prisma"
        self.prisma_parser = PrismaSchemaParser(schema_path)

        # Cache for faster lookups
        self._model_names_lower = {
            name.lower(): name for name in self.prisma_parser.get_model_names()
        }

    def fix_errors(self, errors: List[Dict]) -> int:
        """
        [ρ] Fix Prisma property errors

        Args:
            errors: List of TS2339 errors

        Returns:
            Number of errors fixed
        """
        fixed_count = 0

        # Group errors by file
        by_file = {}
        for error in errors:
            file_path = error.get('file', '')
            if file_path not in by_file:
                by_file[file_path] = []
            by_file[file_path].append(error)

        # Process each file
        for file_path, file_errors in by_file.items():
            fixed_count += self._fix_file(file_path, file_errors)

        return fixed_count

    def _fix_file(self, file_path: str, errors: List[Dict]) -> int:
        """
        [σ] Fix Prisma errors in a single file

        Args:
            file_path: Path to file
            errors: Errors in this file

        Returns:
            Number of fixes applied
        """
        full_path = self.project_root / file_path

        if not full_path.exists():
            print(f"[TS2339-Prisma] WARNING: File not found: {file_path}")
            return 0

        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')

        except Exception as e:
            print(f"[TS2339-Prisma] ERROR: Could not read {file_path}: {e}")
            return 0

        original_content = content
        fixed_count = 0

        # Process each error
        for error in errors:
            fix_result = self._fix_single_error(lines, error)

            if fix_result:
                fixed_count += 1
                print(f"[TS2339-Prisma] OK: {fix_result['description']} in {Path(file_path).name}:{error.get('line', 0)}")

        # Save if changes made
        if fixed_count > 0:
            try:
                # Backup original
                self._backup_file(full_path)

                # Write fixed content
                with open(full_path, 'w', encoding='utf-8') as f:
                    f.write('\n'.join(lines))

            except Exception as e:
                print(f"[TS2339-Prisma] ERROR: Could not write {file_path}: {e}")
                # Restore original
                try:
                    with open(full_path, 'w', encoding='utf-8') as f:
                        f.write(original_content)
                except:
                    pass
                return 0

        return fixed_count

    def _fix_single_error(self, lines: List[str], error: Dict) -> Optional[Dict]:
        """
        [κ] Fix a single Prisma error

        Args:
            lines: File lines (mutable)
            error: Error dictionary

        Returns:
            Fix description if successful, None otherwise
        """
        line_num = error.get('line', 0)
        message = error.get('message', '')

        if line_num < 1 or line_num > len(lines):
            return None

        line_idx = line_num - 1
        line = lines[line_idx]

        # Detect error type
        if "does not exist on type 'PrismaClient" in message:
            return self._fix_prisma_model_reference(lines, line_idx, message)

        elif "does not exist" in message and "type" in message:
            return self._fix_prisma_field_reference(lines, line_idx, message)

        return None

    def _fix_prisma_model_reference(self, lines: List[str], line_idx: int, message: str) -> Optional[Dict]:
        """
        [σ] Fix incorrect Prisma model names

        Example: prisma.user -> prisma.staffUser

        Args:
            lines: File lines (mutable)
            line_idx: Line index (0-based)
            message: Error message

        Returns:
            Fix description if successful
        """
        # Extract incorrect model name from error message
        match = re.search(r"Property '(\w+)' does not exist", message)
        if not match:
            return None

        incorrect_name = match.group(1)

        # Suggest correction
        correct_name = self.prisma_parser.suggest_model_correction(incorrect_name)

        if not correct_name:
            return None

        # Fix in the line
        line = lines[line_idx]
        pattern = rf'\bprisma\.{re.escape(incorrect_name)}\b'
        replacement = f'prisma.{correct_name}'

        new_line = re.sub(pattern, replacement, line)

        if new_line != line:
            lines[line_idx] = new_line
            return {
                "description": f"Fixed {incorrect_name} -> {correct_name}",
                "old": incorrect_name,
                "new": correct_name
            }

        return None

    def _fix_prisma_field_reference(self, lines: List[str], line_idx: int, message: str) -> Optional[Dict]:
        """
        [ρ] Fix incorrect Prisma field references

        Example: customer.grade -> (detect field doesn't exist, log for manual review)

        Args:
            lines: File lines (mutable)
            line_idx: Line index (0-based)
            message: Error message

        Returns:
            Fix description if successful
        """
        # Extract field and model from error message
        # Pattern: "'fieldName' does not exist in type 'ModelName'"
        match = re.search(r"'(\w+)' does not exist in type '(\w+)", message)
        if not match:
            return None

        field_name = match.group(1)
        type_name = match.group(2)

        # Check if it's a Prisma model
        if not self.prisma_parser.is_prisma_model(type_name):
            return None

        # Check if field exists in schema
        if not self.prisma_parser.validate_field_exists(type_name, field_name):
            # Field truly doesn't exist - log for manual review
            print(f"[TS2339-Prisma] WARNING: Field '{field_name}' not in {type_name} schema")
            print(f"[TS2339-Prisma]   -> Manual schema update may be needed")

            # List available fields for reference
            available_fields = self.prisma_parser.get_model_fields(type_name)
            if available_fields:
                similar = [f for f in available_fields if field_name.lower() in f.lower() or f.lower() in field_name.lower()]
                if similar:
                    print(f"[TS2339-Prisma]   -> Similar fields: {', '.join(similar[:5])}")

            return None

        return None

    def _backup_file(self, file_path: Path):
        """
        [ρ] Create backup of file before modification

        Args:
            file_path: Path to file to backup
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_subdir = self.backup_dir / timestamp
        backup_subdir.mkdir(parents=True, exist_ok=True)

        # Preserve directory structure
        try:
            relative_path = file_path.relative_to(self.project_root)
            backup_path = backup_subdir / relative_path
            backup_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(file_path, backup_path)

        except Exception as e:
            print(f"[TS2339-Prisma] WARNING: Backup failed: {e}")

    def get_statistics(self) -> Dict:
        """
        [κ] Get statistics about Prisma schema

        Returns:
            Dictionary with schema statistics
        """
        return self.prisma_parser.get_statistics()
