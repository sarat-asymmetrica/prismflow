"""
Asymmetrica TypeScript Doctor - TS2339 Fixer
Fix "Property does not exist on type" errors

[σ] Semantic Layer: Use Prisma schema to suggest correct property names
[ρ] Resilience: Conservative fixes - only apply when confident
[κ] Knowledge: Learn from Prisma models and common patterns
"""

import re
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime
import shutil


class TS2339Fixer:
    """
    [σ] Fix TS2339 "Property does not exist" errors

    Common patterns:
    - Customer.firstName → Customer.businessName (Prisma schema correction)
    - customer.name → customer.businessName (schema-based)
    - Typos: cusotmer.id → customer.id (spelling correction)
    """

    def __init__(self, project_root: Path, context_analyzer):
        self.project_root = project_root
        self.context = context_analyzer
        self.backup_dir = project_root / "scripts" / "atd" / "backups"

    def fix_errors(self, errors: List[Dict], dry_run: bool = False) -> Dict:
        """
        [κ] Fix TS2339 errors across multiple files

        Args:
            errors: List of TS2339 errors
            dry_run: If True, only preview changes

        Returns:
            Dictionary with fix statistics
        """
        results = {
            "total": len(errors),
            "fixed": 0,
            "failed": 0,
            "skipped": 0,
            "fixes": []
        }

        # Group errors by file
        by_file = {}
        for error in errors:
            file_path = error["file"]
            if file_path not in by_file:
                by_file[file_path] = []
            by_file[file_path].append(error)

        # Process each file
        for file_path, file_errors in by_file.items():
            file_result = self._fix_file(file_path, file_errors, dry_run)

            results["fixed"] += file_result["fixed"]
            results["failed"] += file_result["failed"]
            results["skipped"] += file_result["skipped"]

            if file_result["fixed"] > 0:
                results["fixes"].append({
                    "file": file_path,
                    "count": file_result["fixed"],
                    "changes": file_result["changes"]
                })

        return results

    def _fix_file(self, file_path: str, errors: List[Dict], dry_run: bool) -> Dict:
        """
        [ρ] Fix property errors in a single file

        Args:
            file_path: Path to file to fix
            errors: List of errors in this file
            dry_run: If True, only preview changes

        Returns:
            Dictionary with fix results for this file
        """
        result = {
            "fixed": 0,
            "failed": 0,
            "skipped": 0,
            "changes": []
        }

        # Read file
        full_path = self.project_root / file_path
        if not full_path.exists():
            print(f"[TS2339] WARNING: File not found: {file_path}")
            result["failed"] = len(errors)
            return result

        try:
            with open(full_path, "r", encoding="utf-8") as f:
                content = f.read()
                original_content = content

        except Exception as e:
            print(f"[TS2339] WARNING: Error reading {file_path}: {e}")
            result["failed"] = len(errors)
            return result

        # Apply fixes
        changes = []
        for error in errors:
            if "property" not in error or "type" not in error:
                result["skipped"] += 1
                continue

            incorrect_property = error["property"]
            type_name = error["type"]

            # Try to suggest correct property from Prisma schema
            correct_property = self.context.suggest_field_fix(type_name, incorrect_property)

            if correct_property and correct_property != incorrect_property:
                # Replace property access
                # Handle various access patterns: obj.prop, obj?.prop, obj['prop']
                patterns = [
                    (rf"\.{re.escape(incorrect_property)}\b", f".{correct_property}"),
                    (rf"\?\.{re.escape(incorrect_property)}\b", f"?.{correct_property}"),
                    (rf"\['{re.escape(incorrect_property)}'\]", f"['{correct_property}']"),
                    (rf'\["{re.escape(incorrect_property)}"\]', f'["{correct_property}"]'),
                ]

                for pattern, replacement in patterns:
                    if re.search(pattern, content):
                        # Count occurrences
                        count = len(re.findall(pattern, content))
                        content = re.sub(pattern, replacement, content)

                        changes.append({
                            "line": error["line"],
                            "property": incorrect_property,
                            "corrected": correct_property,
                            "type": type_name,
                            "occurrences": count
                        })

                        result["fixed"] += 1
                        break
                else:
                    result["skipped"] += 1
            else:
                result["skipped"] += 1

        # Save changes if any
        if changes and not dry_run:
            # Backup original
            self._backup_file(full_path)

            # Write modified content
            try:
                with open(full_path, "w", encoding="utf-8") as f:
                    f.write(content)

                print(f"[TS2339] OK: Fixed {len(changes)} properties in {file_path}")

            except Exception as e:
                print(f"[TS2339] FAILED: Error writing {file_path}: {e}")
                result["failed"] = len(changes)
                result["fixed"] = 0

                # Restore original content
                try:
                    with open(full_path, "w", encoding="utf-8") as f:
                        f.write(original_content)
                except:
                    pass

        elif changes and dry_run:
            print(f"[TS2339] 🔍 Would fix {len(changes)} properties in {file_path}")
            for change in changes:
                print(f"       Line {change['line']}: {change['type']}.{change['property']} → {change['type']}.{change['corrected']}")

        result["changes"] = changes
        return result

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
        relative_path = file_path.relative_to(self.project_root)
        backup_path = backup_subdir / relative_path

        backup_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            shutil.copy2(file_path, backup_path)
        except Exception as e:
            print(f"[TS2339] WARNING: Backup failed for {file_path}: {e}")
