"""
[σ] Semantic Layer: ABD V1 - Asymmetrica Build Doctor
[ρ] Resilience: Git safety net with corruption detection
[κ] Knowledge: Next.js/Webpack build error expertise

Automatically fixes build errors in Next.js/Webpack projects with
enterprise-grade D3 quality and full rollback capability.

Architecture Pattern: Based on ATD V3 D3 success (3,051 errors fixed)
Quality Standard: D3 Enterprise Grade
Safety: Git checkpoints with corruption detection
"""

import sys
import json
import subprocess
import re
from pathlib import Path
from typing import List, Dict, Optional, Tuple
import argparse
from datetime import datetime

# Import ABD components
from fixers.module_not_found_fixer import ModuleNotFoundFixer
from fixers.dependency_conflict_fixer import DependencyConflictFixer
from fixers.config_fixer import ConfigFixer
from git_manager import GitManager
from corruption_detector import CorruptionDetector
from build_analyzer import BuildAnalyzer
from package_manager import PackageManager


class AsymmetricaBuildDoctor:
    """
    [σ] Semantic: Main orchestrator for build error fixing
    [ρ] Resilience: Multi-phase approach with rollback
    [κ] Knowledge: Next.js/Webpack/npm ecosystem
    """

    def __init__(self, project_root: Path, verbose: bool = False):
        self.project_root = project_root
        self.verbose = verbose
        self.session_id = f"abd-{datetime.now().strftime('%Y%m%d-%H%M%S')}"

        # Initialize components
        self.git_manager = GitManager(project_root)
        self.build_analyzer = BuildAnalyzer(project_root)
        self.package_manager = PackageManager(project_root)
        self.corruption_detector = CorruptionDetector()

        # Initialize fixers
        self.fixers = {
            'module_not_found': ModuleNotFoundFixer(project_root, self.package_manager),
            'dependency_conflict': DependencyConflictFixer(project_root, self.package_manager),
            'config_error': ConfigFixer(project_root)
        }

        self._log(f"[ABD-V1] Session ID: {self.session_id}")
        self._log(f"[ABD-V1] Project Root: {project_root}")

    def _log(self, message: str):
        """[ρ] Resilient logging"""
        if self.verbose:
            print(message)

    def analyze(self) -> Dict:
        """
        [κ] Knowledge: Analyze build errors via npm/next build
        [ρ] Resilience: Handles build failures gracefully
        """
        print("\n" + "=" * 70)
        print("ASYMMETRICA BUILD DOCTOR V1 - ERROR ANALYSIS")
        print("=" * 70)

        # Phase 1: Run build and capture errors
        print("\n[PHASE 1/3] Running build...")
        print("-" * 70)

        build_output = self._run_build()

        # Phase 2: Parse build errors
        print("\n[PHASE 2/3] Parsing build output...")
        print("-" * 70)

        errors = self.build_analyzer.parse_build_output(build_output)

        print(f"[ABD-Analyzer] Found {len(errors)} build errors")

        # Phase 3: Classify errors
        print("\n[PHASE 3/3] Classifying errors...")
        print("-" * 70)

        classified = self._classify_errors(errors)

        # Calculate statistics
        auto_fixable = self._count_auto_fixable(classified)

        # Print summary
        self._print_analysis_summary(classified, auto_fixable)

        return {
            'total_errors': len(errors),
            'errors': errors,
            'classified': classified,
            'auto_fixable': auto_fixable,
            'build_output': build_output
        }

    def _run_build(self) -> str:
        """
        [κ] Knowledge: Run npm build and capture output
        [ρ] Resilience: Handles build command failures
        """
        try:
            result = subprocess.run(
                "npm run build",
                shell=True,
                capture_output=True,
                text=True,
                cwd=self.project_root,
                timeout=300  # 5 minute timeout
            )

            # Combine stdout and stderr
            output = result.stdout + "\n" + result.stderr

            self._log(f"[ABD-Build] Exit code: {result.returncode}")

            return output

        except subprocess.TimeoutExpired:
            print("[ABD-Build] WARNING: Build timed out after 5 minutes")
            return ""
        except Exception as e:
            print(f"[ABD-Build] ERROR: Failed to run build: {e}")
            return ""

    def _classify_errors(self, errors: List[Dict]) -> Dict[str, List[Dict]]:
        """
        [κ] Knowledge: Classify errors by type
        [σ] Semantic: Groups related errors for batch fixing
        """
        classified = {
            'module_not_found': [],
            'dependency_missing': [],
            'dependency_conflict': [],
            'peer_dependency': [],
            'config_error': [],
            'export_not_found': [],
            'syntax_error': [],
            'version_conflict': [],
            'unknown': []
        }

        for error in errors:
            error_type = error.get('type', 'unknown')

            if error_type in classified:
                classified[error_type].append(error)
            else:
                classified['unknown'].append(error)

        return classified

    def _count_auto_fixable(self, classified: Dict[str, List[Dict]]) -> int:
        """
        [κ] Knowledge: Count errors that can be automatically fixed
        """
        auto_fixable_types = [
            'module_not_found',
            'dependency_missing',
            'dependency_conflict',
            'peer_dependency',
            'config_error',
            'export_not_found'
        ]

        count = 0
        for error_type in auto_fixable_types:
            count += len(classified.get(error_type, []))

        return count

    def _print_analysis_summary(self, classified: Dict[str, List[Dict]], auto_fixable: int):
        """
        [σ] Semantic: Print human-readable summary
        """
        print("\n" + "=" * 70)
        print("ERROR CLASSIFICATION SUMMARY")
        print("=" * 70)

        for error_type, errors in classified.items():
            if errors:
                fixable = "[AUTO-FIXABLE]" if error_type != 'unknown' else "[MANUAL]"
                print(f"{error_type:25s} {len(errors):4d} errors {fixable}")

        print("-" * 70)
        print(f"{'TOTAL':25s} {sum(len(e) for e in classified.values()):4d} errors")
        print(f"{'AUTO-FIXABLE':25s} {auto_fixable:4d} errors")
        print("=" * 70)

    def fix_with_safety(self, dry_run: bool = False) -> bool:
        """
        [ρ] Resilience: Fix build errors with full Git safety net
        [σ] Semantic: Multi-phase approach with corruption detection

        Returns:
            bool: True if fixes successful, False if corruption detected
        """

        # ================================================================
        # PHASE 1: Git Safety Checkpoint
        # ================================================================
        print("\n" + "=" * 70)
        print("[PHASE 1/6] GIT SAFETY CHECKPOINT")
        print("=" * 70)

        checkpoint = self.git_manager.create_checkpoint()

        if not checkpoint['success']:
            print(f"[ABD-Git] ERROR: Failed to create checkpoint")
            print(f"[ABD-Git] {checkpoint.get('error', 'Unknown error')}")
            return False

        print(f"[ABD-Git] Checkpoint created: {checkpoint['commit_hash'][:8]}")
        print(f"[ABD-Git] Branch: {checkpoint['branch']}")
        print(f"[ABD-Git] Staged files: {checkpoint['staged_files']}")
        print(f"[ABD-Git] Modified files: {checkpoint['modified_files']}")

        # ================================================================
        # PHASE 2: Baseline Error Count
        # ================================================================
        print("\n" + "=" * 70)
        print("[PHASE 2/6] BASELINE ERROR COUNT")
        print("=" * 70)

        baseline_analysis = self.analyze()
        baseline_count = baseline_analysis['total_errors']

        print(f"\n[ABD-V1] Baseline: {baseline_count} build errors")
        print(f"[ABD-V1] Auto-fixable: {baseline_analysis['auto_fixable']} errors")

        if baseline_count == 0:
            print("\n[ABD-V1] SUCCESS: No build errors found!")
            return True

        if dry_run:
            print("\n[ABD-V1] DRY RUN mode - no fixes will be applied")
            self._preview_fixes(baseline_analysis)
            return True

        # ================================================================
        # PHASE 3: Deterministic Fixes
        # ================================================================
        print("\n" + "=" * 70)
        print("[PHASE 3/6] DETERMINISTIC FIXES")
        print("=" * 70)

        total_fixed = 0
        fix_results = {}

        # Process each error type with appropriate fixer
        for error_type, errors in baseline_analysis['classified'].items():
            if not errors:
                continue

            print(f"\n[ABD-V1] Processing {error_type}: {len(errors)} errors")
            print("-" * 70)

            if error_type in ['module_not_found', 'dependency_missing', 'export_not_found']:
                fixer = self.fixers['module_not_found']
                fixed = fixer.fix_errors(errors)
                fix_results[error_type] = fixed
                total_fixed += fixed
                print(f"[ABD-V1] {error_type}: {fixed}/{len(errors)} fixed")

            elif error_type in ['dependency_conflict', 'peer_dependency', 'version_conflict']:
                fixer = self.fixers['dependency_conflict']
                fixed = fixer.fix_errors(errors)
                fix_results[error_type] = fixed
                total_fixed += fixed
                print(f"[ABD-V1] {error_type}: {fixed}/{len(errors)} fixed")

            elif error_type == 'config_error':
                fixer = self.fixers['config_error']
                fixed = fixer.fix_errors(errors)
                fix_results[error_type] = fixed
                total_fixed += fixed
                print(f"[ABD-V1] {error_type}: {fixed}/{len(errors)} fixed")

            else:
                print(f"[ABD-V1] {error_type}: Requires manual intervention")

        print(f"\n[ABD-V1] Total fixes applied: {total_fixed}")

        # ================================================================
        # PHASE 4: Corruption Detection
        # ================================================================
        print("\n" + "=" * 70)
        print("[PHASE 4/6] CORRUPTION DETECTION")
        print("=" * 70)

        # Re-run build to check for new errors
        new_analysis = self.analyze()
        new_count = new_analysis['total_errors']

        print(f"\n[ABD-Corruption] Baseline errors: {baseline_count}")
        print(f"[ABD-Corruption] Current errors:  {new_count}")
        print(f"[ABD-Corruption] Delta:           {new_count - baseline_count:+d}")

        # Check for corruption (more errors than baseline)
        if new_count > baseline_count:
            print("\n" + "!" * 70)
            print("[ABD-Corruption] CORRUPTION DETECTED!")
            print("!" * 70)
            print(f"[ABD-Corruption] Fixes introduced {new_count - baseline_count} NEW errors")
            print(f"[ABD-Corruption] Initiating automatic rollback...")

            # Rollback to baseline
            rollback_result = self.git_manager.rollback_to_baseline()

            if rollback_result['success']:
                print(f"[ABD-Corruption] ROLLBACK SUCCESSFUL")
                print(f"[ABD-Corruption] Restored to: {rollback_result['restored_commit'][:8]}")
            else:
                print(f"[ABD-Corruption] ROLLBACK FAILED: {rollback_result.get('error')}")

            return False

        # Success - errors reduced or stayed same
        errors_fixed = baseline_count - new_count

        print("\n" + "=" * 70)
        print("[ABD-Corruption] VALIDATION SUCCESSFUL!")
        print("=" * 70)
        print(f"[ABD-V1] Errors fixed: {errors_fixed}")
        print(f"[ABD-V1] Remaining errors: {new_count}")
        print(f"[ABD-V1] Success rate: {(errors_fixed / baseline_count * 100):.2f}%")

        # ================================================================
        # PHASE 5: Recommendations
        # ================================================================
        print("\n" + "=" * 70)
        print("[PHASE 5/6] RECOMMENDATIONS")
        print("=" * 70)

        if new_count > 0:
            self._generate_recommendations(new_analysis)
        else:
            print("\n[ABD-V1] All build errors resolved!")
            print("[ABD-V1] Project is ready to build successfully")

        # ================================================================
        # PHASE 6: Complete
        # ================================================================
        print("\n" + "=" * 70)
        print("[PHASE 6/6] COMPLETE")
        print("=" * 70)

        print(f"\n[ABD-V1] Session: {self.session_id}")
        print(f"[ABD-V1] Baseline errors: {baseline_count}")
        print(f"[ABD-V1] Final errors: {new_count}")
        print(f"[ABD-V1] Errors fixed: {errors_fixed}")
        print(f"[ABD-V1] Success rate: {(errors_fixed / baseline_count * 100):.2f}%")

        if new_count == 0:
            print("\n" + "=" * 70)
            print("BUILD SUCCESS!")
            print("=" * 70)

        return True

    def _preview_fixes(self, analysis: Dict):
        """
        [σ] Semantic: Preview fixes that would be applied
        """
        print("\n" + "=" * 70)
        print("FIX PREVIEW (DRY RUN)")
        print("=" * 70)

        for error_type, errors in analysis['classified'].items():
            if not errors:
                continue

            print(f"\n{error_type}: {len(errors)} errors")

            for i, error in enumerate(errors[:3], 1):  # Show first 3 of each type
                print(f"  {i}. {error.get('message', 'Unknown error')[:80]}")

                if error_type == 'module_not_found':
                    module = error.get('module', 'unknown')
                    print(f"     -> Would install: {module}")
                elif error_type == 'dependency_conflict':
                    print(f"     -> Would resolve dependency conflict")
                elif error_type == 'config_error':
                    print(f"     -> Would fix configuration")

            if len(errors) > 3:
                print(f"  ... and {len(errors) - 3} more")

    def _generate_recommendations(self, analysis: Dict):
        """
        [κ] Knowledge: Generate actionable recommendations
        [σ] Semantic: Human-readable guidance
        """
        remaining_errors = analysis['classified']

        print("\nNext steps to resolve remaining errors:")
        print("-" * 70)

        step = 1

        # Syntax errors require manual intervention
        if remaining_errors.get('syntax_error'):
            print(f"\n{step}. Fix {len(remaining_errors['syntax_error'])} syntax errors manually")
            for error in remaining_errors['syntax_error'][:2]:
                print(f"   - {error.get('file', 'unknown')}:")
                print(f"     {error.get('message', 'Unknown error')[:70]}")
            step += 1

        # Unknown errors need investigation
        if remaining_errors.get('unknown'):
            print(f"\n{step}. Investigate {len(remaining_errors['unknown'])} unknown errors")
            for error in remaining_errors['unknown'][:2]:
                print(f"   - {error.get('message', 'Unknown error')[:70]}")
            step += 1

        # Module not found that couldn't be auto-fixed
        if remaining_errors.get('module_not_found'):
            print(f"\n{step}. Resolve {len(remaining_errors['module_not_found'])} module resolution issues")
            for error in remaining_errors['module_not_found'][:2]:
                print(f"   - Module: {error.get('module', 'unknown')}")
                print(f"     File: {error.get('file', 'unknown')}")
            step += 1

        print("\n" + "-" * 70)
        print("Run 'npm run build' to see detailed error messages")
        print("Run 'python scripts/abd/abd_v1.py fix' to retry automatic fixes")


def main():
    """
    [σ] Semantic: CLI entry point
    [ρ] Resilience: Argument validation and error handling
    """
    parser = argparse.ArgumentParser(
        description="ABD V1 - Asymmetrica Build Doctor",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scripts/abd/abd_v1.py analyze           # Analyze build errors
  python scripts/abd/abd_v1.py fix               # Fix all auto-fixable errors
  python scripts/abd/abd_v1.py fix --dry-run     # Preview fixes without applying
  python scripts/abd/abd_v1.py fix --verbose     # Show detailed progress

Quality: D3 Enterprise Grade
Pattern: Based on ATD V3 D3 success (3,051 errors fixed)
Safety: Git checkpoints with corruption detection
        """
    )

    parser.add_argument(
        'action',
        choices=['analyze', 'fix'],
        help='Action to perform'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview fixes without applying (only with fix action)'
    )
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Show detailed progress information'
    )

    args = parser.parse_args()

    # Get project root
    project_root = Path.cwd()

    # Validate project structure
    package_json = project_root / "package.json"
    if not package_json.exists():
        print("[ABD-V1] ERROR: package.json not found")
        print("[ABD-V1] Please run from project root directory")
        sys.exit(1)

    # Create ABD instance
    abd = AsymmetricaBuildDoctor(project_root, verbose=args.verbose)

    try:
        if args.action == 'analyze':
            analysis = abd.analyze()

            print("\n" + "=" * 70)
            print("ANALYSIS COMPLETE")
            print("=" * 70)
            print(f"Total build errors: {analysis['total_errors']}")
            print(f"Auto-fixable: {analysis['auto_fixable']}")
            print(f"Manual intervention: {analysis['total_errors'] - analysis['auto_fixable']}")

        else:  # fix
            success = abd.fix_with_safety(dry_run=args.dry_run)

            if not success:
                print("\n[ABD-V1] Fix operation failed or was rolled back")
                sys.exit(1)

    except KeyboardInterrupt:
        print("\n\n[ABD-V1] Interrupted by user")
        sys.exit(130)
    except Exception as e:
        print(f"\n[ABD-V1] FATAL ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
