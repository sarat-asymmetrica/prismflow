"""
Asymmetrica TypeScript Doctor - TS2305 Fixer
Fix "Module has no exported member" errors

[σ] Semantic Layer: Add missing exports or fix import names
[ρ] Resilience: Verify exports exist before modifying
[κ] Knowledge: Use file system and AST patterns
"""

import re
from pathlib import Path
from typing import Dict, List, Set
from datetime import datetime
import shutil


class TS2305Fixer:
    """
    [σ] Fix TS2305 "Module has no exported member" errors

    Common patterns:
    - Import name mismatch: import { Button } vs export default Button
    - Missing export: Add export to source module
    - Typo in import name: { Cusotmer } → { Customer }
    """

    def __init__(self, project_root: Path, context_analyzer):
        self.project_root = project_root
        self.context = context_analyzer
        self.backup_dir = project_root / "scripts" / "atd" / "backups"

    def fix_errors(self, errors: List[Dict], dry_run: bool = False) -> Dict:
        """
        [κ] Fix TS2305 errors across multiple files

        Args:
            errors: List of TS2305 errors
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
        [ρ] Fix export errors in a single file

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
            print(f"[TS2305] WARNING: File not found: {file_path}")
            result["failed"] = len(errors)
            return result

        try:
            with open(full_path, "r", encoding="utf-8") as f:
                content = f.read()
                original_content = content

        except Exception as e:
            print(f"[TS2305] WARNING: Error reading {file_path}: {e}")
            result["failed"] = len(errors)
            return result

        # Apply fixes
        changes = []
        for error in errors:
            if "module" not in error:
                result["skipped"] += 1
                continue

            module_path = error["module"]

            # Parse error message to get the missing export name
            # Format: "Module '...' has no exported member 'MemberName'"
            match = re.search(r"has no exported member ['\"]([^'\"]+)['\"]", error["message"])
            if not match:
                result["skipped"] += 1
                continue

            missing_export = match.group(1)

            # Try to fix by checking the target module
            fix_applied = self._try_fix_export(
                content, module_path, missing_export, error["line"]
            )

            if fix_applied:
                content = fix_applied["content"]
                changes.append({
                    "line": error["line"],
                    "module": module_path,
                    "export": missing_export,
                    "fix_type": fix_applied["type"]
                })
                result["fixed"] += 1
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

                print(f"[TS2305] OK: Fixed {len(changes)} exports in {file_path}")

            except Exception as e:
                print(f"[TS2305] FAILED: Error writing {file_path}: {e}")
                result["failed"] = len(changes)
                result["fixed"] = 0

                # Restore original content
                try:
                    with open(full_path, "w", encoding="utf-8") as f:
                        f.write(original_content)
                except:
                    pass

        elif changes and dry_run:
            print(f"[TS2305] 🔍 Would fix {len(changes)} exports in {file_path}")
            for change in changes:
                print(f"       Line {change['line']}: {change['export']} from {change['module']} ({change['fix_type']})")

        result["changes"] = changes
        return result

    def _try_fix_export(self, content: str, module_path: str, missing_export: str, line_num: int) -> Dict:
        """
        [σ] Attempt to fix missing export

        Strategies:
        1. Check if it's a default export being imported as named
        2. Check if export name is similar (typo)
        3. Add export to target module (not implemented - requires modifying other files)

        Args:
            content: Current file content
            module_path: Module being imported from
            missing_export: Name of missing export
            line_num: Line number of error

        Returns:
            Dictionary with fixed content and fix type, or None
        """
        # Get the import statement
        import_stmt = self._find_import_statement(content, module_path, missing_export)
        if not import_stmt:
            return None

        # Strategy 1: Check if target module exists and has default export
        target_file = self._resolve_module_path(module_path)
        if target_file and target_file.exists():
            target_exports = self._get_module_exports(target_file)

            # Check for default export
            if "default" in target_exports and missing_export not in target_exports:
                # Convert to default import
                # import { Component } from 'module' → import Component from 'module'
                new_import = re.sub(
                    rf"import\s*\{{\s*{re.escape(missing_export)}\s*\}}",
                    f"import {missing_export}",
                    import_stmt
                )

                if new_import != import_stmt:
                    new_content = content.replace(import_stmt, new_import)
                    return {
                        "content": new_content,
                        "type": "converted_to_default_import"
                    }

            # Check for similar export names (typo correction)
            similar = self._find_similar_export(missing_export, target_exports)
            if similar:
                new_import = import_stmt.replace(missing_export, similar)
                new_content = content.replace(import_stmt, new_import)

                # Also replace usage in file
                new_content = re.sub(
                    rf"\b{re.escape(missing_export)}\b",
                    similar,
                    new_content
                )

                return {
                    "content": new_content,
                    "type": f"corrected_typo_to_{similar}"
                }

        return None

    def _find_import_statement(self, content: str, module: str, member: str) -> str:
        """
        [κ] Find import statement for specific module and member

        Args:
            content: File content
            module: Module path
            member: Imported member name

        Returns:
            Complete import statement, or empty string
        """
        # Match: import { Member, ... } from "module"
        pattern = rf"import\s*\{{[^}}]*\b{re.escape(member)}\b[^}}]*\}}\s*from\s*['\"]{ re.escape(module)}['\"]"
        match = re.search(pattern, content)

        if match:
            return match.group(0)

        return ""

    def _resolve_module_path(self, module: str) -> Path:
        """
        [ρ] Resolve module path to actual file

        Args:
            module: Import module path (e.g., "@/components/ui/button")

        Returns:
            Path to file, or None if not found
        """
        # Handle @/ alias
        if module.startswith("@/"):
            relative = module[2:]
            base = self.project_root / "src" / relative
        elif module.startswith("./") or module.startswith("../"):
            # Relative import - would need current file context
            return None
        else:
            base = self.project_root / "src" / module

        # Try various extensions
        for ext in [".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.tsx"]:
            candidate = Path(str(base) + ext)
            if candidate.exists():
                return candidate

        return None

    def _get_module_exports(self, file_path: Path) -> Set[str]:
        """
        [σ] Extract exported names from a module

        Args:
            file_path: Path to module file

        Returns:
            Set of exported names
        """
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            exports = set()

            # Match: export { Name, ... }
            named_exports = re.findall(r"export\s*\{\s*([^}]+)\s*\}", content)
            for match in named_exports:
                names = [n.strip() for n in match.split(",")]
                exports.update(names)

            # Match: export const Name = ...
            # Match: export function Name() ...
            # Match: export class Name ...
            pattern = r"export\s+(const|let|var|function|class)\s+(\w+)"
            for match in re.finditer(pattern, content):
                exports.add(match.group(2))

            # Match: export default
            if re.search(r"export\s+default\s+", content):
                exports.add("default")

            return exports

        except Exception as e:
            print(f"[TS2305] WARNING: Error reading exports from {file_path}: {e}")
            return set()

    def _find_similar_export(self, name: str, available: Set[str]) -> str:
        """
        [κ] Find similar export name (typo correction)

        Args:
            name: Incorrect name
            available: Set of available exports

        Returns:
            Similar name, or empty string
        """
        # Simple case-insensitive match
        for export in available:
            if export.lower() == name.lower():
                return export

        # Levenshtein distance for typos
        def levenshtein(s1: str, s2: str) -> int:
            if len(s1) < len(s2):
                return levenshtein(s2, s1)
            if len(s2) == 0:
                return len(s1)
            previous_row = range(len(s2) + 1)
            for i, c1 in enumerate(s1):
                current_row = [i + 1]
                for j, c2 in enumerate(s2):
                    insertions = previous_row[j + 1] + 1
                    deletions = current_row[j] + 1
                    substitutions = previous_row[j] + (c1 != c2)
                    current_row.append(min(insertions, deletions, substitutions))
                previous_row = current_row
            return previous_row[-1]

        best_match = ""
        best_distance = float("inf")

        for export in available:
            distance = levenshtein(name.lower(), export.lower())
            if distance < best_distance and distance <= 2:  # Max 2 character difference
                best_distance = distance
                best_match = export

        return best_match

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
            print(f"[TS2305] WARNING: Backup failed for {file_path}: {e}")
