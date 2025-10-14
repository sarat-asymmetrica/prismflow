"""
[σ] Corruption Detector - Asymmetrica TypeScript Doctor V3
[ρ] Auto-detect and revert corrupted fixes
[κ] Knowledge: Never let errors increase, always validate

Philosophy: "If errors increased? Revert immediately!"

Created: 2025-10-14
ATD Version: 3.0.0
"""

import subprocess
import json
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional


class CorruptionDetector:
    """
    [ρ] Corruption Detector

    Validates TypeScript fixes and auto-reverts if:
    - Errors increased
    - Build fails
    - Syntax errors introduced
    """

    def __init__(self, git_manager, project_root: str):
        self.git_manager = git_manager
        self.project_root = Path(project_root)
        self.atd_dir = self.project_root / ".atd"
        self.corruption_log = self.atd_dir / "corruption-log.json"

        # Ensure directory exists
        self.atd_dir.mkdir(exist_ok=True)

    def validate_fix_batch(self, commit: str, files: List[str], baseline_errors: int) -> Dict:
        """
        [ρ] Validate fixes didn't break codebase

        Args:
            commit: Git commit hash of fixes
            files: Files that were modified
            baseline_errors: Number of errors before fixes

        Returns:
            dict: Validation results
        """
        print("\n[ATD-Corruption] Validating fixes...")

        # Step 1: Run TypeScript compiler
        print("[ATD-Corruption] Running TypeScript compiler...")
        ts_result = self._run_typescript_check()

        if ts_result["success"]:
            current_errors = ts_result["error_count"]

            # Check if errors increased
            if current_errors > baseline_errors:
                print(f"[ATD-Corruption] CORRUPTION DETECTED!")
                print(f"[ATD-Corruption]   Baseline: {baseline_errors} errors")
                print(f"[ATD-Corruption]   Current:  {current_errors} errors")
                print(f"[ATD-Corruption]   Delta:    +{current_errors - baseline_errors}")

                # Auto-revert
                self._handle_corruption(
                    commit,
                    files,
                    f"Errors INCREASED: {baseline_errors} -> {current_errors}"
                )

                return {
                    "status": "CORRUPTED",
                    "reason": "errors_increased",
                    "baseline_errors": baseline_errors,
                    "current_errors": current_errors,
                    "action": "AUTO_REVERTED"
                }

            elif current_errors < baseline_errors:
                print(f"[ATD-Corruption] SUCCESS! Fixed {baseline_errors - current_errors} errors")
                return {
                    "status": "VALID",
                    "baseline_errors": baseline_errors,
                    "current_errors": current_errors,
                    "errors_fixed": baseline_errors - current_errors
                }

            else:
                print("[ATD-Corruption] Warning: No errors fixed")
                return {
                    "status": "NO_CHANGE",
                    "baseline_errors": baseline_errors,
                    "current_errors": current_errors
                }

        else:
            # TypeScript check failed
            print("[ATD-Corruption] CORRUPTION DETECTED!")
            print(f"[ATD-Corruption]   Reason: {ts_result['error']}")

            self._handle_corruption(
                commit,
                files,
                f"TypeScript check failed: {ts_result['error']}"
            )

            return {
                "status": "CORRUPTED",
                "reason": "ts_check_failed",
                "error": ts_result["error"],
                "action": "AUTO_REVERTED"
            }

    def _run_typescript_check(self) -> Dict:
        """
        Run TypeScript compiler and count errors

        Returns:
            dict: Check results
        """
        try:
            result = subprocess.run(
                ["npx", "tsc", "--noEmit"],
                cwd=self.project_root,
                capture_output=True,
                text=True,
                shell=True,
                timeout=60
            )

            # Parse output for error count
            output = result.stdout + result.stderr
            error_count = self._count_errors(output)

            return {
                "success": True,
                "error_count": error_count,
                "output": output
            }

        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error": "TypeScript check timed out"
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def _count_errors(self, tsc_output: str) -> int:
        """
        Count TypeScript errors from tsc output

        Args:
            tsc_output: Output from tsc --noEmit

        Returns:
            int: Number of errors
        """
        # Look for "Found X errors" at end of output
        match = re.search(r"Found (\d+) errors?", tsc_output)
        if match:
            return int(match.group(1))

        # Fallback: count lines with "error TS"
        error_lines = [line for line in tsc_output.split("\n") if "error TS" in line]
        return len(error_lines)

    def _handle_corruption(self, commit: Optional[str], files: List[str], reason: str) -> Dict:
        """
        [ρ] Auto-restore corrupted files

        Args:
            commit: Commit hash that caused corruption (None if no commit created)
            files: Files that were corrupted
            reason: Reason for corruption detection

        Returns:
            dict: Restoration results
        """
        print(f"\n[ATD-Corruption] AUTO-RESTORING corrupted files...")

        try:
            # If no commit (files not staged), restore from working tree
            if commit is None:
                print("[ATD-Corruption] No commit created - restoring from working tree")
                success = self._restore_from_working_tree(files)
                action = "RESTORED_FROM_WORKING_TREE" if success else "RESTORE_FAILED"
            else:
                # Revert the commit
                result = subprocess.run(
                    ["git", "revert", "--no-edit", commit],
                    cwd=self.project_root,
                    capture_output=True,
                    text=True,
                    shell=True
                )

                if result.returncode != 0:
                    print(f"[ATD-Corruption] Revert failed: {result.stderr}")
                    success = False
                else:
                    print(f"[ATD-Corruption] Successfully reverted {commit[:8]}")
                    success = True

                action = "AUTO_REVERTED" if success else "REVERT_FAILED"

            # Log corruption event
            self._log_corruption_event({
                "commit": commit or "NO_COMMIT",
                "files": files,
                "reason": reason,
                "action": action,
                "success": success
            })

            return {
                "success": success,
                "commit": commit,
                "files": files,
                "reason": reason,
                "action": action
            }

        except Exception as e:
            print(f"[ATD-Corruption] Error during restoration: {e}")
            self._log_corruption_event({
                "commit": commit or "NO_COMMIT",
                "files": files,
                "reason": reason,
                "action": "RESTORE_ERROR",
                "success": False,
                "error": str(e)
            })

            return {
                "success": False,
                "error": str(e)
            }

    def _restore_from_working_tree(self, files: List[str]) -> bool:
        """
        [ρ] Restore files that were modified but not committed

        Args:
            files: List of file paths to restore

        Returns:
            bool: True if all files restored successfully
        """
        all_success = True

        for file_path in files:
            try:
                result = subprocess.run(
                    ["git", "checkout", "HEAD", "--", file_path],
                    cwd=self.project_root,
                    capture_output=True,
                    text=True,
                    shell=True,
                    check=False
                )

                if result.returncode == 0:
                    print(f"[ATD-Corruption] Restored: {file_path}")
                else:
                    # File might not exist in HEAD (new file), try removing it
                    try:
                        full_path = self.project_root / file_path
                        if full_path.exists():
                            subprocess.run(
                                ["git", "restore", "--staged", file_path],
                                cwd=self.project_root,
                                shell=True,
                                check=False
                            )
                            print(f"[ATD-Corruption] Unstaged: {file_path}")
                    except Exception:
                        print(f"[ATD-Corruption] Warning: Could not restore {file_path}")
                        all_success = False

            except Exception as e:
                print(f"[ATD-Corruption] Error restoring {file_path}: {e}")
                all_success = False

        return all_success

    def _log_corruption_event(self, event_data: Dict):
        """
        [κ] Log corruption event for future analysis

        Args:
            event_data: Dictionary containing event details
        """
        try:
            # Load existing log
            if self.corruption_log.exists():
                with open(self.corruption_log, "r") as f:
                    log = json.load(f)
            else:
                log = {"events": []}

            # Build event with Asymmetrica annotations
            event = {
                "timestamp": datetime.now().isoformat(),
                "commit": event_data.get("commit", "NO_COMMIT"),
                "files": event_data.get("files", []),
                "reason": event_data.get("reason", "Unknown"),
                "action": event_data.get("action", "UNKNOWN"),
                "success": event_data.get("success", False),
                "annotations": {
                    "sigma": "Semantic corruption detected in TypeScript fixes",
                    "rho": "Auto-restored to prevent cascading failures" if event_data.get("success") else "Restoration failed - manual intervention needed",
                    "kappa": f"Pattern learned: Avoid this fix strategy - {event_data.get('reason', 'Unknown')}"
                }
            }

            if "error" in event_data:
                event["error"] = event_data["error"]

            log["events"].append(event)

            # Save log
            with open(self.corruption_log, "w") as f:
                json.dump(log, f, indent=2)

            print(f"[ATD-Corruption] Event logged to {self.corruption_log}")

        except Exception as e:
            print(f"[ATD-Corruption] Warning: Could not log event: {e}")

    def get_corruption_history(self) -> List[Dict]:
        """
        Get history of corruption events

        Returns:
            list: Corruption events
        """
        try:
            if self.corruption_log.exists():
                with open(self.corruption_log, "r") as f:
                    log = json.load(f)
                    return log.get("events", [])
            return []

        except Exception as e:
            print(f"[ATD-Corruption] Error reading log: {e}")
            return []

    def run_syntax_validation(self, file_path: str) -> Dict:
        """
        [ρ] Validate TypeScript syntax for a single file

        Args:
            file_path: Path to file to validate

        Returns:
            dict: Validation results
        """
        try:
            # Try to parse with TypeScript compiler
            result = subprocess.run(
                ["npx", "tsc", "--noEmit", file_path],
                cwd=self.project_root,
                capture_output=True,
                text=True,
                shell=True,
                timeout=10
            )

            output = result.stdout + result.stderr

            # Check for syntax errors
            if "error TS" in output:
                errors = [line for line in output.split("\n") if "error TS" in line]
                return {
                    "valid": False,
                    "errors": errors,
                    "error_count": len(errors)
                }

            return {
                "valid": True,
                "errors": [],
                "error_count": 0
            }

        except Exception as e:
            return {
                "valid": False,
                "error": str(e)
            }
