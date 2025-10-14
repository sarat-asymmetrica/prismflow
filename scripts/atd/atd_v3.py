#!/usr/bin/env python3
"""
[σ] Asymmetrica TypeScript Doctor V3 - Complete System
[ρ] Resilience: Git Safety Net + Corruption Detection
[κ] Knowledge: AI Collaboration + Asymmetrica Protocol

Philosophy: "If it fails? Roll it back!" - Fearless TypeScript fixing

Created: 2025-10-14
ATD Version: 3.0.0
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
from fixers.ts2307_fixer_v2 import TS2307FixerV2
from fixers.ts7006_fixer import TS7006Fixer
from fixers.ts2339_fixer import TS2339Fixer
from fixers.ts2305_fixer import TS2305Fixer

# Import V3 components
from git_manager import GitManager
from corruption_detector import CorruptionDetector
from ai_bridge import AIBridge
from asymm_logger import AsymmetricaLogger

# Import Prisma awareness components (D3 Enterprise Grade)
from prisma_schema_parser import PrismaSchemaParser
from prisma_schema_validator import PrismaSchemaValidator
from fixers.ts2339_prisma_property_fixer import TS2339PrismaPropertyFixer


class AsymmetricaTypeScriptDoctorV3:
    """
    [σ] Asymmetrica TypeScript Doctor V3

    Complete system with:
    - Deterministic Logic (Chain-of-thought)
    - AI Collaboration Bridge (User's AI assistant)
    - Git Safety Net (Bulletproof rollback)
    """

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.atd_dir = project_root / ".atd"
        self.registry_path = self.atd_dir / "registry.json"
        self.backup_dir = self.atd_dir / "backups"

        # Initialize core components
        self.error_parser = ErrorParser()
        self.context_analyzer = ContextAnalyzer(project_root)

        # Initialize V3 components
        self.git_manager = GitManager(str(project_root))
        self.corruption_detector = CorruptionDetector(self.git_manager, str(project_root))
        self.ai_bridge = AIBridge(str(project_root))
        self.logger = AsymmetricaLogger(str(project_root))

        # Initialize Prisma awareness (D3 Enterprise Grade)
        schema_path = project_root / "prisma" / "schema.prisma"
        self.prisma_parser = PrismaSchemaParser(schema_path)
        self.prisma_validator = PrismaSchemaValidator(project_root)
        self.prisma_fixer = TS2339PrismaPropertyFixer(project_root)

        # Initialize fixers
        self.fixers = {
            "TS2307": TS2307FixerV2(project_root, self.context_analyzer),  # Use V2 (chain-of-thought)
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
        """
        print("[ATD-V3] Running TypeScript compiler...")
        try:
            result = subprocess.run(
                ["npx", "tsc", "--noEmit"],
                cwd=self.project_root,
                capture_output=True,
                text=True,
                timeout=120,
                shell=True  # Windows compatibility
            )
            return result.stdout + result.stderr
        except subprocess.TimeoutExpired:
            print("[ATD-V3] WARNING: TypeScript compilation timed out (>120s)")
            return ""
        except Exception as e:
            print(f"[ATD-V3] ERROR: Could not run tsc: {str(e)}")
            return ""

    def count_errors(self, tsc_output: str) -> int:
        """
        Count TypeScript errors from tsc output
        """
        errors = self.error_parser.parse(tsc_output)
        return len(errors)

    def analyze(self) -> Dict:
        """
        [σ] Analyze current TypeScript errors
        """
        print("\n" + "="*70)
        print("ASYMMETRICA TYPESCRIPT DOCTOR V3 - ERROR ANALYSIS")
        print("="*70 + "\n")

        # Get tsc output
        tsc_output = self.run_tsc()
        if not tsc_output:
            print("[ATD-V3] OK: No TypeScript errors found!")
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
        print(f"[ATD-V3] Total errors: {len(errors)}")
        print(f"[ATD-V3] Registry saved: {self.registry_path}\n")

        print("Error Breakdown:")
        print("-" * 70)

        # Sort by count (descending)
        sorted_types = sorted(by_type.items(), key=lambda x: len(x[1]), reverse=True)

        for error_code, error_list in sorted_types:
            count = len(error_list)
            description = self._get_error_description(error_code)
            fixable = "[OK] AUTO-FIXABLE" if error_code in self.fixers else "[AI] AI COLLABORATION"
            print(f"  {error_code}: {count:>3} errors - {description} {fixable}")

        print("-" * 70)

        # Show fixable summary
        fixable_count = sum(len(v) for k, v in by_type.items() if k in self.fixers)
        ai_count = len(errors) - fixable_count
        print(f"\n[ATD-V3] {fixable_count} auto-fixable, {ai_count} require AI collaboration")

        return registry

    def fix_with_safety(self, error_type: Optional[str] = None, dry_run: bool = False, test_mode: bool = False) -> Dict:
        """
        [ρ] Complete V3 workflow with Git safety and AI collaboration

        Phases:
        1. Git Safety Checkpoint
        2. ATD Deterministic Analysis
        3. Apply Deterministic Fixes
        4. Corruption Check
        5. AI Collaboration (if needed)
        6. Final Report
        """
        print("\n" + "="*70)
        print("ASYMMETRICA TYPESCRIPT DOCTOR V3 - COMPLETE FIX WORKFLOW")
        print("="*70 + "\n")

        if dry_run:
            print("[ATD-V3] DRY RUN MODE - No files will be modified\n")

        # Start session logging
        session_id = datetime.now().strftime("%Y%m%d-%H%M%S")
        self.logger.start_session(session_id)

        # Phase 1: Git Safety Checkpoint
        print("\n[PHASE 1/6] Git Safety Checkpoint")
        print("-" * 70)

        if not dry_run and not test_mode:
            checkpoint = self.git_manager.create_checkpoint()
            if not checkpoint["success"]:
                print(f"[ATD-V3] ERROR: Failed to create checkpoint: {checkpoint.get('error')}")
                return {"success": False, "error": "Checkpoint failed"}

            self.logger.log_operation("CHECKPOINT", checkpoint)
        else:
            print("[ATD-V3] Skipping checkpoint (dry run or test mode)")

        # Phase 2: Get baseline error count
        print("\n[PHASE 2/6] Baseline Error Count")
        print("-" * 70)

        tsc_output = self.run_tsc()
        baseline_errors = self.count_errors(tsc_output)
        print(f"[ATD-V3] Baseline: {baseline_errors} errors")

        # Phase 2.5: Prisma Schema Validation (D3 Enterprise Grade)
        print("\n[PHASE 2.5/6] Prisma Schema Validation")
        print("-" * 70)

        # Parse current errors
        errors = self.error_parser.parse(tsc_output)

        # Validate against Prisma schema
        self.prisma_validator.validate_against_errors(errors)

        # Generate report if issues found
        if self.prisma_validator.has_issues():
            print("[ATD-V3] WARNING: Prisma schema gaps detected!")
            report = self.prisma_validator.generate_migration_report()
            print(report)

            # Save report
            report_path = self.atd_dir / "prisma-schema-gaps.txt"
            report_path.write_text(report, encoding='utf-8')
            print(f"\n[ATD-V3] Report saved: {report_path}")
        else:
            summary = self.prisma_validator.get_summary()
            print(f"[ATD-V3] OK: Prisma schema aligned with code")
            if summary['case_mismatches'] > 0:
                print(f"[ATD-V3] Note: {summary['case_mismatches']} case mismatches will be auto-fixed")

        # Phase 3: Apply Deterministic Fixes
        print("\n[PHASE 3/6] Deterministic Fixes")
        print("-" * 70)

        fix_results = self._apply_deterministic_fixes(error_type, dry_run)

        if not dry_run and fix_results["fixed"] > 0:
            # Commit fixes
            fixes_list = [
                {"file": f, "error_type": error_type or "MULTIPLE"}
                for f in fix_results.get("files_modified", [])
            ]

            commit_hash = self.git_manager.commit_fix_batch(fixes_list, "Deterministic fixes")

            if commit_hash:
                self.logger.log_operation(
                    "FIX_BATCH",
                    {"errors_fixed": fix_results["fixed"], "strategy": "deterministic"},
                    files=fix_results.get("files_modified", [])
                )

        # Phase 4: Corruption Check
        if not dry_run and fix_results["fixed"] > 0:
            print("\n[PHASE 4/6] Corruption Detection")
            print("-" * 70)

            tsc_output = self.run_tsc()
            current_errors = self.count_errors(tsc_output)

            validation = self.corruption_detector.validate_fix_batch(
                commit_hash,
                fix_results.get("files_modified", []),
                baseline_errors
            )

            if validation["status"] == "CORRUPTED":
                print("[ATD-V3] CRITICAL: Corruption detected - fixes reverted!")
                self.logger.log_operation("ROLLBACK", validation)
                return {
                    "success": False,
                    "error": "Corruption detected",
                    "validation": validation
                }

            print(f"[ATD-V3] SUCCESS: Fixed {baseline_errors - current_errors} errors")
            baseline_errors = current_errors  # Update baseline

        # Phase 5: AI Collaboration (if errors remain)
        if not dry_run and baseline_errors > 0:
            print("\n[PHASE 5/6] AI Collaboration")
            print("-" * 70)

            ai_results = self._handle_ai_collaboration(baseline_errors)

            if ai_results["collaborations"] > 0:
                self.logger.log_operation("AI_COLLABORATION", ai_results)

        # Phase 6: Final Report
        print("\n[PHASE 6/6] Final Report")
        print("-" * 70)

        self._print_final_report(fix_results, baseline_errors)

        # Save session log
        self.logger.save_session_log()

        return fix_results

    def _apply_deterministic_fixes(self, error_type: Optional[str], dry_run: bool) -> Dict:
        """
        [κ] Apply deterministic fixes with high confidence
        """
        # Load registry
        if not self.registry_path.exists():
            print("[ATD-V3] WARNING: No error registry found. Running analyze...")
            self.analyze()

        with open(self.registry_path, "r", encoding="utf-8") as f:
            registry = json.load(f)

        errors = registry["errors"]
        if not errors:
            return {"success": True, "fixed": 0, "failed": 0, "files_modified": []}

        # Filter by error type if specified
        if error_type:
            errors = [e for e in errors if e["error_code"] == error_type]

        # Group by type
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
            "files_modified": [],
            "by_type": {}
        }

        for error_code, error_list in by_type.items():
            print(f"\n[ATD-V3] Processing {error_code}: {len(error_list)} errors")

            if error_code not in self.fixers:
                print(f"[ATD-V3] Skipping {error_code} (requires AI collaboration)")
                results["skipped"] += len(error_list)
                continue

            # Special handling for TS2339: Use Prisma-aware fixer first
            if error_code == "TS2339":
                # Separate Prisma errors from general errors
                prisma_errors = [e for e in error_list if self._is_prisma_error(e)]
                other_errors = [e for e in error_list if not self._is_prisma_error(e)]

                print(f"[ATD-V3] TS2339: {len(prisma_errors)} Prisma-related, {len(other_errors)} general")

                # Fix Prisma errors first
                if prisma_errors:
                    prisma_fixed = self.prisma_fixer.fix_errors(prisma_errors)
                    results["fixed"] += prisma_fixed
                    print(f"[ATD-V3] TS2339-Prisma: {prisma_fixed} fixed")

                # Fix remaining errors with standard fixer
                if other_errors:
                    fixer = self.fixers[error_code]
                    type_results = fixer.fix_errors(other_errors, dry_run=dry_run)
                    results["fixed"] += type_results["fixed"]
                    results["failed"] += type_results["failed"]
                    results["skipped"] += type_results["skipped"]

                results["by_type"][error_code] = {
                    "fixed": prisma_fixed + (type_results["fixed"] if other_errors else 0),
                    "total": len(error_list)
                }

                continue

            # Standard fixer for other error types
            fixer = self.fixers[error_code]
            type_results = fixer.fix_errors(error_list, dry_run=dry_run)

            results["fixed"] += type_results["fixed"]
            results["failed"] += type_results["failed"]
            results["skipped"] += type_results["skipped"]
            results["by_type"][error_code] = type_results

            # Track modified files
            if "files_modified" in type_results:
                results["files_modified"].extend(type_results["files_modified"])

            print(f"[ATD-V3] {error_code}: {type_results['fixed']} fixed")

        return results

    def _is_prisma_error(self, error: Dict) -> bool:
        """
        [σ] Detect if error is Prisma-related

        Args:
            error: Error dictionary

        Returns:
            True if error is related to Prisma
        """
        message = error.get('message', '')

        # Check for Prisma indicators
        return (
            "PrismaClient" in message or
            "Prisma" in message or
            "@prisma/client" in message or
            "generated/prisma" in message or
            any(model in message for model in self.prisma_parser.get_model_names())
        )

    def _handle_ai_collaboration(self, remaining_errors: int) -> Dict:
        """
        [σ] Handle AI collaboration for complex errors
        """
        print(f"[ATD-V3] {remaining_errors} errors remain")
        print("[ATD-V3] These errors require AI collaboration")
        print()

        ai_detected = self.ai_bridge.detect_users_ai()
        print(f"[ATD-V3] Detected AI: {ai_detected}")
        print()

        # Ask user if they want AI collaboration
        response = input("[ATD-V3] Generate AI collaboration prompts? (y/n): ").strip().lower()

        if response != "y":
            print("[ATD-V3] Skipping AI collaboration")
            return {"collaborations": 0}

        # Load registry
        with open(self.registry_path, "r", encoding="utf-8") as f:
            registry = json.load(f)

        errors = registry["errors"]

        # Filter to errors needing AI
        ai_errors = [e for e in errors if e["error_code"] not in self.fixers]

        collaborations = 0
        for error in ai_errors[:5]:  # Limit to 5 at a time
            # Generate context
            context = {
                "prisma_models": self.ai_bridge.get_prisma_context(error["file"]),
                "socket_context": self.ai_bridge.get_socket_context(error["file"])
            }

            # Generate prompt
            prompt = self.ai_bridge.generate_collaboration_prompt(
                error,
                {"confidence": 0.3, "strategy": "ai_required", "reason": "Complex error"},
                context
            )

            print(prompt["instructions"])

            # Wait for user to apply fix
            user_action = self.ai_bridge.wait_for_user_fix(prompt["prompt_file"])

            if user_action["action"] == "APPLIED":
                collaborations += 1
                # Commit this fix
                self.git_manager.commit_fix_batch(
                    [{"file": error["file"], "error_type": error["error_code"]}],
                    f"AI collaboration fix: {error['error_code']}"
                )

        return {"collaborations": collaborations}

    def _print_final_report(self, fix_results: Dict, remaining_errors: int):
        """
        Print final report with rollback options
        """
        print("\n" + "="*70)
        print("ATD V3 FINAL REPORT")
        print("="*70)
        print(f"Errors fixed: {fix_results['fixed']}")
        print(f"Errors remaining: {remaining_errors}")
        print(f"Success rate: {fix_results['fixed']*100//(fix_results['fixed']+remaining_errors) if fix_results['fixed']>0 else 0}%")
        print("="*70)

        if fix_results["fixed"] > 0:
            print("\n[ATD-V3] Safety Options:")
            print("  1. Keep fixes: git merge main")
            print("  2. Rollback all: python scripts/atd/atd_v3.py rollback --full")
            print("  3. Rollback last: python scripts/atd/atd_v3.py rollback --last")

        git_status = self.git_manager.get_status()
        if git_status["active"]:
            print(f"\n[ATD-V3] Session: {git_status['session_id']}")
            print(f"[ATD-V3] Branch: {git_status['fix_branch']}")
            print(f"[ATD-V3] Commits: {git_status['commits_count']}")

    def rollback(self, full: bool = False) -> bool:
        """
        [ρ] Rollback fixes

        Args:
            full: Full rollback to baseline (nuclear) vs last batch (surgical)
        """
        if full:
            print("\n[ATD-V3] NUCLEAR ROLLBACK - Restoring to baseline...")
            success = self.git_manager.rollback_to_baseline()
        else:
            print("\n[ATD-V3] SURGICAL ROLLBACK - Reverting last batch...")
            success = self.git_manager.rollback_last_batch()

        if success:
            self.logger.log_operation("ROLLBACK", {"type": "full" if full else "surgical"})

        return success

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


def main():
    """CLI entry point"""
    parser = argparse.ArgumentParser(
        description="Asymmetrica TypeScript Doctor V3 - Complete Self-Healing System",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python atd_v3.py analyze                    # Analyze current errors
  python atd_v3.py fix --all                  # Fix with Git safety
  python atd_v3.py fix --all --test-mode      # Test on test file
  python atd_v3.py rollback --full            # Nuclear rollback
  python atd_v3.py rollback --last            # Surgical rollback
        """
    )

    parser.add_argument(
        "command",
        choices=["analyze", "fix", "rollback"],
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
        "--test-mode",
        action="store_true",
        help="Test mode (skip Git checkpoint)"
    )

    parser.add_argument(
        "--full",
        action="store_true",
        help="Full rollback to baseline (for rollback command)"
    )

    parser.add_argument(
        "--last",
        action="store_true",
        help="Rollback last batch only (for rollback command)"
    )

    args = parser.parse_args()

    # Detect project root
    project_root = Path.cwd()
    if not (project_root / "package.json").exists():
        if (project_root.parent / "package.json").exists():
            project_root = project_root.parent
        else:
            print("[ATD-V3] WARNING: Could not find package.json. Run from project root.")
            sys.exit(1)

    # Initialize ATD V3
    atd = AsymmetricaTypeScriptDoctorV3(project_root)

    # Execute command
    if args.command == "analyze":
        atd.analyze()

    elif args.command == "fix":
        if args.type:
            atd.fix_with_safety(error_type=args.type, dry_run=args.dry_run, test_mode=args.test_mode)
        elif args.all:
            atd.fix_with_safety(dry_run=args.dry_run, test_mode=args.test_mode)
        else:
            print("[ATD-V3] WARNING: Specify --type <ERROR_CODE> or --all")
            sys.exit(1)

    elif args.command == "rollback":
        if args.full:
            atd.rollback(full=True)
        elif args.last:
            atd.rollback(full=False)
        else:
            print("[ATD-V3] WARNING: Specify --full or --last for rollback")
            sys.exit(1)


if __name__ == "__main__":
    main()
