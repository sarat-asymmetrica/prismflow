"""
Asymmetrica TypeScript Doctor - Error Parser
Parse TypeScript compiler output into structured error objects

[σ] Semantic Layer: Extract meaningful error information from tsc output
[ρ] Resilience: Handle malformed output gracefully
[κ] Knowledge: Recognize all TypeScript error patterns
"""

import re
from typing import List, Dict
from pathlib import Path


class ErrorParser:
    """
    Parse TypeScript compiler errors into structured format

    Example tsc output:
        src/app/page.tsx(45,23): error TS2307: Cannot find module '@/components/ui/button'.
    """

    # Regex pattern for TypeScript errors
    # Format: file(line,col): error TSXXXX: message
    ERROR_PATTERN = re.compile(
        r"^(?P<file>.+?)\((?P<line>\d+),(?P<column>\d+)\):\s*error\s+(?P<code>TS\d+):\s*(?P<message>.+)$",
        re.MULTILINE
    )

    def parse(self, tsc_output: str) -> List[Dict]:
        """
        [σ] Parse TypeScript compiler output

        Args:
            tsc_output: Raw output from 'npx tsc --noEmit'

        Returns:
            List of structured error dictionaries
        """
        errors = []

        for match in self.ERROR_PATTERN.finditer(tsc_output):
            error = {
                "file": match.group("file"),
                "line": int(match.group("line")),
                "column": int(match.group("column")),
                "error_code": match.group("code"),
                "message": match.group("message").strip(),
                "raw": match.group(0)
            }

            # Extract module name for import errors (TS2307, TS2305)
            if error["error_code"] in ["TS2307", "TS2305"]:
                module_match = re.search(r"['\"]([^'\"]+)['\"]", error["message"])
                if module_match:
                    error["module"] = module_match.group(1)

            # Extract property name for TS2339 errors
            if error["error_code"] == "TS2339":
                prop_match = re.search(r"Property ['\"]([^'\"]+)['\"]", error["message"])
                if prop_match:
                    error["property"] = prop_match.group(1)

                type_match = re.search(r"on type ['\"]([^'\"]+)['\"]", error["message"])
                if type_match:
                    error["type"] = type_match.group(1)

            # Extract parameter name for TS7006 errors
            if error["error_code"] == "TS7006":
                param_match = re.search(r"Parameter ['\"]([^'\"]+)['\"]", error["message"])
                if param_match:
                    error["parameter"] = param_match.group(1)

            errors.append(error)

        return errors

    def parse_file(self, log_file: Path) -> List[Dict]:
        """
        [ρ] Parse errors from saved log file

        Args:
            log_file: Path to tsc output log file

        Returns:
            List of structured error dictionaries
        """
        try:
            with open(log_file, "r", encoding="utf-8") as f:
                content = f.read()
            return self.parse(content)
        except Exception as e:
            print(f"[ErrorParser] WARNING: Error reading file {log_file}: {e}")
            return []

    def categorize(self, errors: List[Dict]) -> Dict[str, List[Dict]]:
        """
        [κ] Categorize errors by error code

        Args:
            errors: List of parsed errors

        Returns:
            Dictionary mapping error codes to error lists
        """
        categorized = {}

        for error in errors:
            code = error["error_code"]
            if code not in categorized:
                categorized[code] = []
            categorized[code].append(error)

        return categorized

    def get_file_errors(self, errors: List[Dict], file_path: str) -> List[Dict]:
        """
        [κ] Get all errors for a specific file

        Args:
            errors: List of parsed errors
            file_path: File path to filter by

        Returns:
            List of errors for that file
        """
        return [e for e in errors if e["file"] == file_path]

    def get_statistics(self, errors: List[Dict]) -> Dict:
        """
        [σ] Generate statistics about errors

        Returns:
            Dictionary with error statistics
        """
        stats = {
            "total": len(errors),
            "by_code": {},
            "by_file": {},
            "files_affected": set()
        }

        for error in errors:
            code = error["error_code"]
            file_path = error["file"]

            # Count by error code
            stats["by_code"][code] = stats["by_code"].get(code, 0) + 1

            # Count by file
            stats["by_file"][file_path] = stats["by_file"].get(file_path, 0) + 1

            # Track unique files
            stats["files_affected"].add(file_path)

        stats["files_affected"] = len(stats["files_affected"])

        return stats
