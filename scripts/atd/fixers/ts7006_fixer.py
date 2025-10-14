"""
Asymmetrica TypeScript Doctor - TS7006 Fixer
Fix "Parameter implicitly has an 'any' type" errors

[σ] Semantic Layer: Infer types from context (React events, Prisma models)
[ρ] Resilience: Conservative type inference (prefer any over wrong type)
[κ] Knowledge: Use React patterns and Prisma schema for type hints
"""

import re
from pathlib import Path
from typing import Dict, List
from datetime import datetime
import shutil


class TS7006Fixer:
    """
    [σ] Fix TS7006 "Implicit any" errors

    Common patterns:
    - React event handlers: (e) → (e: React.MouseEvent)
    - Form handlers: (e) → (e: React.FormEvent)
    - Callback parameters: (item) → (item: any)
    """

    def __init__(self, project_root: Path, context_analyzer):
        self.project_root = project_root
        self.context = context_analyzer
        self.backup_dir = project_root / "scripts" / "atd" / "backups"

    def fix_errors(self, errors: List[Dict], dry_run: bool = False) -> Dict:
        """
        [κ] Fix TS7006 errors across multiple files

        Args:
            errors: List of TS7006 errors
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
        [ρ] Fix implicit any errors in a single file

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
            print(f"[TS7006] WARNING: File not found: {file_path}")
            result["failed"] = len(errors)
            return result

        try:
            with open(full_path, "r", encoding="utf-8") as f:
                lines = f.readlines()
                original_content = "".join(lines)

        except Exception as e:
            print(f"[TS7006] WARNING: Error reading {file_path}: {e}")
            result["failed"] = len(errors)
            return result

        # Apply fixes
        changes = []
        for error in errors:
            line_num = error["line"]
            if line_num < 1 or line_num > len(lines):
                result["skipped"] += 1
                continue

            # Get the problematic line (0-indexed)
            line = lines[line_num - 1]
            parameter = error.get("parameter", "")

            if not parameter:
                result["skipped"] += 1
                continue

            # Infer type
            inferred_type = self._infer_parameter_type(line, parameter)

            if inferred_type:
                # Apply fix
                fixed_line = self._add_type_annotation(line, parameter, inferred_type)

                if fixed_line != line:
                    lines[line_num - 1] = fixed_line

                    changes.append({
                        "line": line_num,
                        "parameter": parameter,
                        "type": inferred_type,
                        "old": line.strip(),
                        "new": fixed_line.strip()
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
                    f.writelines(lines)

                print(f"[TS7006] OK: Fixed {len(changes)} parameters in {file_path}")

            except Exception as e:
                print(f"[TS7006] FAILED: Error writing {file_path}: {e}")
                result["failed"] = len(changes)
                result["fixed"] = 0

                # Restore original content
                try:
                    with open(full_path, "w", encoding="utf-8") as f:
                        f.write(original_content)
                except:
                    pass

        elif changes and dry_run:
            print(f"[TS7006] 🔍 Would fix {len(changes)} parameters in {file_path}")
            for change in changes:
                print(f"       Line {change['line']}: {change['parameter']} → {change['parameter']}: {change['type']}")

        result["changes"] = changes
        return result

    def _infer_parameter_type(self, line: str, parameter: str) -> str:
        """
        [σ] Infer TypeScript type from context with improved intelligence

        Strategies:
        1. React event handlers (specific types)
        2. Prisma operations (string IDs, model types)
        3. Array methods (infer from context)
        4. Comparison patterns (infer from usage)
        5. Parameter name hints
        6. Fallback to 'unknown' (better than 'any')

        Args:
            line: Source code line
            parameter: Parameter name

        Returns:
            Inferred TypeScript type, or 'unknown' if unable to infer
        """
        # Pattern 1: React event handlers
        # onClick={(e) => ...} → React.MouseEvent
        # onChange={(e) => ...} → React.ChangeEvent
        event_patterns = {
            r"onClick\s*=\s*\{.*\(" + re.escape(parameter): "React.MouseEvent<HTMLElement>",
            r"onChange\s*=\s*\{.*\(" + re.escape(parameter): "React.ChangeEvent<HTMLInputElement>",
            r"onSubmit\s*=\s*\{.*\(" + re.escape(parameter): "React.FormEvent<HTMLFormElement>",
            r"onFocus\s*=\s*\{.*\(" + re.escape(parameter): "React.FocusEvent<HTMLElement>",
            r"onBlur\s*=\s*\{.*\(" + re.escape(parameter): "React.FocusEvent<HTMLElement>",
            r"onKeyDown\s*=\s*\{.*\(" + re.escape(parameter): "React.KeyboardEvent<HTMLElement>",
            r"onKeyUp\s*=\s*\{.*\(" + re.escape(parameter): "React.KeyboardEvent<HTMLElement>",
            r"onMouseEnter\s*=\s*\{.*\(" + re.escape(parameter): "React.MouseEvent<HTMLElement>",
            r"onMouseLeave\s*=\s*\{.*\(" + re.escape(parameter): "React.MouseEvent<HTMLElement>",
        }

        for pattern, event_type in event_patterns.items():
            if re.search(pattern, line):
                return event_type

        # Pattern 2: Prisma operations with where clauses
        # prisma.customer.findUnique({ where: { id } }) → id: string
        if re.search(rf'\bwhere:\s*{{\s*{re.escape(parameter)}\s*}}', line):
            return 'string'

        # Pattern 3: Prisma operations with IDs
        if 'prisma.' in line and parameter in ['id', 'userId', 'customerId', 'orderId']:
            return 'string'

        # Pattern 4: Array methods with type inference
        # customers.map((customer) => ...) → Customer
        # orders.filter((order) => ...) → Order
        array_context_patterns = {
            r'customers\.map\s*\(\s*' + re.escape(parameter): 'Customer',
            r'orders\.map\s*\(\s*' + re.escape(parameter): 'Order',
            r'items\.map\s*\(\s*' + re.escape(parameter): 'any',
            r'users\.map\s*\(\s*' + re.escape(parameter): 'StaffUser',
            r'invoices\.map\s*\(\s*' + re.escape(parameter): 'Invoice',
        }

        for pattern, inferred_type in array_context_patterns.items():
            if re.search(pattern, line):
                return inferred_type

        # Pattern 5: Generic array methods (use unknown instead of any)
        array_methods = [r"\.map\s*\(", r"\.filter\s*\(", r"\.forEach\s*\(", r"\.reduce\s*\("]
        for pattern in array_methods:
            if re.search(pattern, line):
                return "unknown"

        # Pattern 6: Comparison to string literal
        # if (status === "DRAFT") → status: string
        if re.search(rf'{re.escape(parameter)}\s*===\s*["\']', line):
            return 'string'

        # Pattern 7: Comparison to number
        # if (count > 5) → count: number
        if re.search(rf'{re.escape(parameter)}\s*[<>=]+\s*\d+', line):
            return 'number'

        # Pattern 8: Boolean operations
        # if (isActive && ...) → isActive: boolean
        if parameter.startswith('is') or parameter.startswith('has') or parameter.startswith('should'):
            if re.search(rf'{re.escape(parameter)}\s*[&|]', line):
                return 'boolean'

        # Pattern 9: Function parameters in callbacks
        # addEventListener('click', (e) => ...) → Event
        if "addEventListener" in line:
            return "Event"

        # Pattern 10: Promise handlers
        # .then((result) => ...) → unknown
        # .catch((error) => ...) → Error
        if ".then(" in line or ".catch(" in line:
            if parameter in ["error", "err"]:
                return "Error"
            return "unknown"

        # Pattern 11: React hooks
        # useEffect(() => { ... }, [dep]) → void
        if "useEffect" in line or "useCallback" in line or "useMemo" in line:
            return "unknown"

        # Pattern 12: Common parameter names
        name_hints = {
            "event": "Event",
            "evt": "Event",
            "error": "Error",
            "err": "Error",
            "exception": "Error",
            "data": "unknown",
            "response": "unknown",
            "result": "unknown",
            "value": "unknown",
            "item": "unknown",
            "element": "unknown",
            "index": "number",
            "idx": "number",
            "count": "number",
            "total": "number",
            "id": "string",
            "name": "string",
            "email": "string",
            "phone": "string",
            "message": "string",
        }

        param_lower = parameter.lower()
        for hint, type_hint in name_hints.items():
            if hint in param_lower:
                return type_hint

        # Default: Conservative 'unknown' (better than 'any')
        # Forces explicit type handling and is more type-safe
        return "unknown"

    def _add_type_annotation(self, line: str, parameter: str, type_annotation: str) -> str:
        """
        [κ] Add type annotation to parameter

        Args:
            line: Source code line
            parameter: Parameter name
            type_annotation: Type to add

        Returns:
            Modified line with type annotation
        """
        # Pattern: (param) → (param: Type)
        # Handle various formats:
        # 1. Arrow function: (param) =>
        # 2. Function expression: function(param)
        # 3. Method: method(param)

        patterns = [
            (rf"\({re.escape(parameter)}\)", f"({parameter}: {type_annotation})"),
            (rf"\(\s*{re.escape(parameter)}\s*\)", f"({parameter}: {type_annotation})"),
            (rf",\s*{re.escape(parameter)}\)", f", {parameter}: {type_annotation})"),
            (rf"\({re.escape(parameter)},", f"({parameter}: {type_annotation},"),
        ]

        modified_line = line
        for pattern, replacement in patterns:
            if re.search(pattern, modified_line):
                modified_line = re.sub(pattern, replacement, modified_line, count=1)
                break

        return modified_line

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
            print(f"[TS7006] WARNING: Backup failed for {file_path}: {e}")
