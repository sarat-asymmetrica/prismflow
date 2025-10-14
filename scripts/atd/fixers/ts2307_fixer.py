"""
Asymmetrica TypeScript Doctor - TS2307 Fixer
Fix "Cannot find module" errors

[σ] Semantic Layer: Resolve import paths using project context
[ρ] Resilience: Backup files before modification
[κ] Knowledge: Use AsymmSocket registry and file system for accurate resolution
"""

import re
from pathlib import Path
from typing import Dict, List
from datetime import datetime
import shutil


class TS2307Fixer:
    """
    [σ] Fix TS2307 "Cannot find module" errors

    Common patterns:
    - Relative imports: ../ui/button → @/components/ui/button
    - Missing @/ prefix: components/ui/button → @/components/ui/button
    - Wrong paths: @/components/Button → @/components/ui/button
    """

    def __init__(self, project_root: Path, context_analyzer):
        self.project_root = project_root
        self.context = context_analyzer
        self.backup_dir = project_root / "scripts" / "atd" / "backups"

    def fix_errors(self, errors: List[Dict], dry_run: bool = False) -> Dict:
        """
        [κ] Fix TS2307 errors across multiple files

        Args:
            errors: List of TS2307 errors
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
        [ρ] Fix import errors in a single file

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
            print(f"[TS2307] WARNING: File not found: {file_path}")
            result["failed"] = len(errors)
            return result

        try:
            with open(full_path, "r", encoding="utf-8") as f:
                content = f.read()
                original_content = content

        except Exception as e:
            print(f"[TS2307] WARNING: Error reading {file_path}: {e}")
            result["failed"] = len(errors)
            return result

        # Apply fixes
        changes = []
        for error in errors:
            if "module" not in error:
                result["skipped"] += 1
                continue

            incorrect_module = error["module"]
            correct_module = self.context.resolve_import_path(file_path, incorrect_module)

            if not correct_module:
                # Try common patterns
                correct_module = self._apply_common_patterns(incorrect_module)

            if correct_module and correct_module != incorrect_module:
                # Replace import statement
                old_import = self._find_import_statement(content, incorrect_module)
                if old_import:
                    new_import = old_import.replace(incorrect_module, correct_module)
                    content = content.replace(old_import, new_import)

                    changes.append({
                        "line": error["line"],
                        "old": incorrect_module,
                        "new": correct_module
                    })

                    result["fixed"] += 1
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

                print(f"[TS2307] OK: Fixed {len(changes)} imports in {file_path}")

            except Exception as e:
                print(f"[TS2307] FAILED: Error writing {file_path}: {e}")
                result["failed"] = len(changes)
                result["fixed"] = 0

                # Restore original content
                try:
                    with open(full_path, "w", encoding="utf-8") as f:
                        f.write(original_content)
                except:
                    pass

        elif changes and dry_run:
            print(f"[TS2307] PREVIEW: Would fix {len(changes)} imports in {file_path}")
            for change in changes:
                print(f"       Line {change['line']}: {change['old']} -> {change['new']}")

        result["changes"] = changes
        return result

    def _find_import_statement(self, content: str, module: str) -> str:
        """
        [σ] Find the complete import statement for a module

        Args:
            content: File content
            module: Module to find

        Returns:
            Complete import statement line, or empty string if not found
        """
        # Match various import patterns
        patterns = [
            rf"import\s+.*\s+from\s+['\"]{ re.escape(module)}['\"]",  # import X from "module"
            rf"import\s+['\"]{ re.escape(module)}['\"]",  # import "module"
            rf"import\(['\"]{ re.escape(module)}['\"]\)",  # dynamic import("module")
        ]

        for pattern in patterns:
            match = re.search(pattern, content)
            if match:
                return match.group(0)

        return ""

    def _apply_common_patterns(self, incorrect_module: str) -> str:
        """
        [κ] Apply common fix patterns for module paths

        Args:
            incorrect_module: Incorrect module path

        Returns:
            Corrected module path
        """
        # Pattern 1: Relative UI imports → @/components/ui
        # ../ui/button → @/components/ui/button
        # ./ui/button → @/components/ui/button
        # ../../ui/button → @/components/ui/button
        if "/ui/" in incorrect_module or incorrect_module.startswith("../ui") or incorrect_module.startswith("./ui"):
            # Extract everything after 'ui/'
            if "/ui/" in incorrect_module:
                component = incorrect_module.split("/ui/", 1)[1]
                return f"@/components/ui/{component}"
            # Handle ../ui or ./ui without trailing slash
            elif incorrect_module.endswith("/ui"):
                return "@/components/ui"

        # Pattern 2: Relative component/lib/hook imports
        # ./components/MetricCard → @/components/dashboard/components/MetricCard
        # ./hooks/useMetrics → @/components/dashboard/hooks/useMetrics
        # ../../lib/deliveryData → @/lib/deliveryData (STUB NEEDED)
        if incorrect_module.startswith("./") or incorrect_module.startswith("../"):
            # Remove leading dots and slashes
            clean_path = incorrect_module.lstrip("./")

            # Check if it's a component-local file (./components/, ./hooks/, ./utils/)
            if clean_path.startswith("components/") or clean_path.startswith("hooks/") or clean_path.startswith("utils/"):
                # These are LOCAL to the component, leave as-is (or skip - they don't exist)
                return None  # Signal: SKIP (file doesn't exist)

            # Handle ../../lib/ patterns
            if "/lib/" in incorrect_module:
                lib_path = incorrect_module.split("/lib/", 1)[1]
                return f"@/lib/{lib_path}"

            # Handle ../../hooks/ patterns
            if "/hooks/" in incorrect_module:
                hook_path = incorrect_module.split("/hooks/", 1)[1]
                return f"@/hooks/{hook_path}"

        # Pattern 3: Missing @/ prefix
        # components/ui/button → @/components/ui/button
        if not incorrect_module.startswith("@/") and not incorrect_module.startswith("."):
            if any(x in incorrect_module for x in ["components", "lib", "hooks", "stores", "types"]):
                return f"@/{incorrect_module}"

        # Pattern 4: NPM packages with version tags
        # sonner@2.0.3 → sonner
        if "@" in incorrect_module and not incorrect_module.startswith("@"):
            return incorrect_module.split("@")[0]

        # Pattern 5: @/lib/utils variants
        if "utils" in incorrect_module and "lib" in incorrect_module:
            return "@/lib/utils"

        # No pattern matched - return None (skip)
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
        relative_path = file_path.relative_to(self.project_root)
        backup_path = backup_subdir / relative_path

        backup_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            shutil.copy2(file_path, backup_path)
        except Exception as e:
            print(f"[TS2307] WARNING: Backup failed for {file_path}: {e}")
