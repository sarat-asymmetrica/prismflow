#!/usr/bin/env python3
"""
Asymmetrica TypeScript Doctor (ATD) V1
Main CLI entry point for self-healing TypeScript error resolution

[σ] Semantic Layer: Orchestrates error analysis and fix application
[ρ] Resilience: Safe execution with rollback support
[κ] Knowledge: Learns from Prisma schema and Socket registry
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional

from error_parser import ErrorParser
from context_analyzer import ContextAnalyzer
from fixers.ts2307_fixer import TS2307Fixer
from fixers.ts2307_fixer_v2 import TS2307FixerV2  # Chain-of-thought version
from fixers.ts7006_fixer import TS7006Fixer
from fixers.ts2339_fixer import TS2339Fixer
from fixers.ts2305_fixer import TS2305Fixer


class AsymmetricaTypeScriptDoctor:
    """
    [σ] Self-healing TypeScript error resolution system
    Philosophy: "It's just logic as code" - simple, elegant, effective
    """

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.atd_dir = project_root / "scripts" / "atd"
        self.registry_path = self.atd_dir / "registry.json"
        self.history_path = self.atd_dir / "fix_history.json"
        self.backup_dir = self.atd_dir / "backups"

        # Initialize components
        self.error_parser = ErrorParser()
        self.context_analyzer = ContextAnalyzer(project_root)

        # Initialize fixers
        self.fixers = {
            "TS2307": TS2307Fixer(project_root, self.context_analyzer),
            "TS7006": TS7006Fixer(project_root, self.context_analyzer),
            "TS2339": TS2339Fixer(project_root, self.context_analyzer),
            "TS2305": TS2305Fixer(project_root, self.context_analyzer),
        }

        # Ensure directories exist
        self.atd_dir.mkdir(parents=True, exist_ok=True)
        self.backup_dir.mkdir(parents=True, exist_ok=True)

    def run_tsc(self) -> str:
        """
        [ρ] Run TypeScript compiler to get current errors
        Returns raw tsc output
        """
        print("[ATD] Running TypeScript compiler...")
        try:
            result = subprocess.run(
                ["npx", "tsc", "--noEmit"],
                cwd=self.project_root,
                capture_output=True,
                text=True,
                timeout=120
            )
            return result.stdout + result.stderr
        except subprocess.TimeoutExpired:
            print("[ATD] WARNING: TypeScript compilation timed out (>120s)")
            return ""
        except Exception as e:
            print(f"[ATD] WARNING: Error running tsc: {str(e)}")
            # Try with shell=True on Windows
            try:
                result = subprocess.run(
                    "npx tsc --noEmit",
                    cwd=self.project_root,
                    capture_output=True,
                    text=True,
                    shell=True,
                    timeout=120
                )
                return result.stdout + result.stderr
            except Exception as e2:
                print(f"[ATD] ERROR: Could not run tsc: {str(e2)}")
                return ""

    def analyze(self) -> Dict:
        """
        [σ] Analyze current TypeScript errors
        Returns structured error breakdown
        """
        print("\n" + "="*70)
        print("ASYMMETRICA TYPESCRIPT DOCTOR V1 - ERROR ANALYSIS")
        print("="*70 + "\n")

        # Get tsc output
        tsc_output = self.run_tsc()
        if not tsc_output:
            print("[ATD] OK: No TypeScript errors found!")
            return {"total": 0, "by_type": {}, "errors": []}

        # Parse errors
        errors = self.error_parser.parse(tsc_output)

        # Categorize by type
        by_type = {}
        for error in errors:
            error_code = error["error_code"]
            if error_code not in by_type:
                by_type[error_code] = []
            by_type[error_code].append(error)

        # Save to registry
        registry = {
            "timestamp": datetime.now().isoformat(),
            "total": len(errors),
            "by_type": {k: len(v) for k, v in by_type.items()},
            "errors": errors
        }

        with open(self.registry_path, "w", encoding="utf-8") as f:
            json.dump(registry, f, indent=2)

        # Display results
        print(f"[ATD] Total errors: {len(errors)}")
        print(f"[ATD] Registry saved: {self.registry_path}\n")

        print("Error Breakdown:")
        print("-" * 70)

        # Sort by count (descending)
        sorted_types = sorted(by_type.items(), key=lambda x: len(x[1]), reverse=True)

        for error_code, error_list in sorted_types:
            count = len(error_list)
            description = self._get_error_description(error_code)
            fixable = "[OK] FIXABLE" if error_code in self.fixers else "[!] MANUAL"
            print(f"  {error_code}: {count:>3} errors - {description} {fixable}")

        print("-" * 70)

        # Show fixable summary
        fixable_count = sum(len(v) for k, v in by_type.items() if k in self.fixers)
        print(f"\n[ATD] {fixable_count}/{len(errors)} errors are auto-fixable ({fixable_count*100//len(errors)}%)")

        return registry

    def fix(self, error_type: Optional[str] = None, dry_run: bool = False) -> Dict:
        """
        [κ] Fix TypeScript errors automatically

        Args:
            error_type: Specific error code to fix (e.g., "TS2307"), or None for all
            dry_run: Preview changes without applying

        Returns:
            Dictionary with fix results
        """
        print("\n" + "="*70)
        print("ASYMMETRICA TYPESCRIPT DOCTOR V1 - FIX EXECUTION")
        print("="*70 + "\n")

        if dry_run:
            print("[ATD] DRY RUN MODE - No files will be modified\n")

        # Load registry
        if not self.registry_path.exists():
            print("[ATD] WARNING: No error registry found. Run 'analyze' first.")
            return {"success": False, "message": "No registry found"}

        with open(self.registry_path, "r", encoding="utf-8") as f:
            registry = json.load(f)

        errors = registry["errors"]
        if not errors:
            print("[ATD] OK: No errors to fix!")
            return {"success": True, "fixed": 0, "failed": 0}

        # Filter by error type if specified
        if error_type:
            errors = [e for e in errors if e["error_code"] == error_type]
            if not errors:
                print(f"[ATD] WARNING: No errors found for type: {error_type}")
                return {"success": False, "message": f"No {error_type} errors"}

        # Group errors by type
        by_type = {}
        for error in errors:
            code = error["error_code"]
            if code not in by_type:
                by_type[code] = []
            by_type[code].append(error)

        # Apply fixes
        results = {
            "timestamp": datetime.now().isoformat(),
            "dry_run": dry_run,
            "total_errors": len(errors),
            "fixed": 0,
            "failed": 0,
            "skipped": 0,
            "by_type": {}
        }

        for error_code, error_list in by_type.items():
            print(f"\n[ATD] Processing {error_code}: {len(error_list)} errors")

            if error_code not in self.fixers:
                print(f"[ATD] WARNING: No fixer available for {error_code} (manual fix required)")
                results["skipped"] += len(error_list)
                results["by_type"][error_code] = {
                    "total": len(error_list),
                    "fixed": 0,
                    "failed": 0,
                    "skipped": len(error_list)
                }
                continue

            fixer = self.fixers[error_code]
            type_results = fixer.fix_errors(error_list, dry_run=dry_run)

            results["fixed"] += type_results["fixed"]
            results["failed"] += type_results["failed"]
            results["skipped"] += type_results["skipped"]
            results["by_type"][error_code] = type_results

            print(f"[ATD] {error_code}: {type_results['fixed']} fixed, {type_results['failed']} failed, {type_results['skipped']} skipped")

        # Save to history (if not dry run)
        if not dry_run:
            self._save_history(results)

        # Display summary
        print("\n" + "="*70)
        print("FIX SUMMARY")
        print("="*70)
        print(f"Total errors processed: {results['total_errors']}")
        print(f"OK: Fixed: {results['fixed']}")
        print(f"FAILED: Failed: {results['failed']}")
        print(f"WARNING: Skipped: {results['skipped']}")
        print("="*70 + "\n")

        if not dry_run and results['fixed'] > 0:
            print("[ATD] SUCCESS: Fixes applied! Run 'npx tsc --noEmit' to verify.")
            print("[ATD] Backups saved to: scripts/atd/backups/")
            print("[ATD] Use 'atd.py rollback' to undo changes if needed.\n")

        return results

    def history(self, limit: int = 10) -> List[Dict]:
        """
        [κ] Show fix history
        """
        if not self.history_path.exists():
            print("[ATD] No fix history found.")
            return []

        with open(self.history_path, "r", encoding="utf-8") as f:
            history = json.load(f)

        print("\n" + "="*70)
        print("ASYMMETRICA TYPESCRIPT DOCTOR V1 - FIX HISTORY")
        print("="*70 + "\n")

        recent = history[-limit:]
        for i, entry in enumerate(reversed(recent), 1):
            timestamp = entry["timestamp"]
            fixed = entry["fixed"]
            failed = entry["failed"]
            total = entry["total_errors"]

            print(f"{i}. {timestamp}")
            print(f"   Fixed: {fixed}/{total} ({fixed*100//total if total > 0 else 0}%)")
            if failed > 0:
                print(f"   Failed: {failed}")
            print()

        return history

    def rollback(self) -> bool:
        """
        [ρ] Rollback last fix operation
        Restores files from backup directory
        """
        print("\n[ATD] Rollback functionality")
        print("[ATD] Backups are stored in: scripts/atd/backups/")
        print("[ATD] To rollback manually:")
        print("      1. Navigate to backups directory")
        print("      2. Find the timestamp folder")
        print("      3. Copy files back to their original locations")
        print("\n[ATD] WARNING: Automated rollback not yet implemented (D3 Phase 4)")
        return False

    def _get_error_description(self, error_code: str) -> str:
        """Get human-readable error description"""
        descriptions = {
            "TS2307": "Cannot find module",
            "TS7006": "Implicit 'any' type",
            "TS2339": "Property does not exist",
            "TS2305": "Module has no exported member",
            "TS2322": "Type assignment error",
            "TS2304": "Cannot find name",
            "TS2345": "Argument type mismatch",
            "TS2571": "Object is of type 'unknown'",
            "TS2532": "Object is possibly 'undefined'",
            "TS2769": "No overload matches this call",
        }
        return descriptions.get(error_code, "Unknown error type")

    def _save_history(self, result: Dict):
        """Save fix result to history"""
        history = []
        if self.history_path.exists():
            with open(self.history_path, "r", encoding="utf-8") as f:
                history = json.load(f)

        history.append(result)

        with open(self.history_path, "w", encoding="utf-8") as f:
            json.dump(history, f, indent=2)


def main():
    """CLI entry point"""
    parser = argparse.ArgumentParser(
        description="Asymmetrica TypeScript Doctor V1 - Self-healing TypeScript error resolution",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python atd.py analyze                    # Analyze current errors
  python atd.py fix --type TS2307          # Fix import errors
  python atd.py fix --all                  # Fix all auto-fixable errors
  python atd.py fix --all --dry-run        # Preview fixes without applying
  python atd.py history                    # Show fix history
  python atd.py rollback                   # Rollback last fix
        """
    )

    parser.add_argument(
        "command",
        choices=["analyze", "fix", "history", "rollback"],
        help="Command to execute"
    )

    parser.add_argument(
        "--type",
        help="Specific error type to fix (e.g., TS2307)"
    )

    parser.add_argument(
        "--all",
        action="store_true",
        help="Fix all auto-fixable errors"
    )

    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview changes without applying"
    )

    parser.add_argument(
        "--limit",
        type=int,
        default=10,
        help="Number of history entries to show"
    )

    args = parser.parse_args()

    # Detect project root (current directory or parent with package.json)
    project_root = Path.cwd()
    if not (project_root / "package.json").exists():
        # Try parent directory
        if (project_root.parent / "package.json").exists():
            project_root = project_root.parent
        else:
            print("[ATD] WARNING: Could not find package.json. Run from project root.")
            sys.exit(1)

    # Initialize ATD
    atd = AsymmetricaTypeScriptDoctor(project_root)

    # Execute command
    if args.command == "analyze":
        atd.analyze()

    elif args.command == "fix":
        if args.type:
            atd.fix(error_type=args.type, dry_run=args.dry_run)
        elif args.all:
            atd.fix(dry_run=args.dry_run)
        else:
            print("[ATD] WARNING: Specify --type <ERROR_CODE> or --all")
            sys.exit(1)

    elif args.command == "history":
        atd.history(limit=args.limit)

    elif args.command == "rollback":
        atd.rollback()


if __name__ == "__main__":
    main()
