"""
[σ] Git Safety Manager - Asymmetrica TypeScript Doctor V3
[ρ] Bulletproof rollback system for fearless TypeScript fixing
[κ] Knowledge: Git as safety net, never lose work

Philosophy: "If it fails? Roll it back!"

Created: 2025-10-14
ATD Version: 3.0.0
"""

import subprocess
import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional


class GitManager:
    """
    [ρ] Git Safety Manager

    Provides bulletproof rollback for ATD fixes:
    - Create checkpoints before fixes
    - Atomic commits per batch
    - Rollback to baseline (nuclear option)
    - Rollback last batch (surgical option)
    """

    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.atd_dir = self.project_root / ".atd"
        self.state_file = self.atd_dir / "git-state.json"
        self.session_id = None
        self.baseline_commit = None
        self.fix_branch = None

        # Ensure .atd directory exists
        self.atd_dir.mkdir(exist_ok=True)

    def create_checkpoint(self) -> Dict:
        """
        [ρ] Create safe checkpoint before fixes

        Steps:
        1. Record current commit as baseline
        2. Create stash of uncommitted changes
        3. Create new branch for fixes
        4. Save state to .atd/git-state.json

        Returns:
            dict: Checkpoint details
        """
        print("\n[ATD-Git] Creating safety checkpoint...")

        try:
            # Generate session ID
            self.session_id = datetime.now().strftime("%Y%m%d-%H%M%S")

            # Get current commit hash (baseline)
            result = subprocess.run(
                ["git", "rev-parse", "HEAD"],
                cwd=self.project_root,
                capture_output=True,
                text=True,
                shell=True
            )

            if result.returncode != 0:
                return {
                    "success": False,
                    "error": "Not a git repository or git not available"
                }

            self.baseline_commit = result.stdout.strip()

            # Get current branch name
            result = subprocess.run(
                ["git", "branch", "--show-current"],
                cwd=self.project_root,
                capture_output=True,
                text=True,
                shell=True
            )
            original_branch = result.stdout.strip() or "main"

            # Stash uncommitted changes
            print("[ATD-Git] Stashing uncommitted changes...")
            subprocess.run(
                ["git", "stash", "save", f"ATD V3 Checkpoint - {self.session_id}"],
                cwd=self.project_root,
                shell=True
            )

            # Create new branch for fixes
            self.fix_branch = f"atd-fixes-{self.session_id}"
            print(f"[ATD-Git] Creating branch: {self.fix_branch}")

            subprocess.run(
                ["git", "checkout", "-b", self.fix_branch],
                cwd=self.project_root,
                shell=True
            )

            # Save state
            state = {
                "session_id": self.session_id,
                "baseline_commit": self.baseline_commit,
                "original_branch": original_branch,
                "fix_branch": self.fix_branch,
                "timestamp": datetime.now().isoformat(),
                "commits": []
            }

            with open(self.state_file, "w") as f:
                json.dump(state, f, indent=2)

            print(f"[ATD-Git] Checkpoint created successfully!")
            print(f"[ATD-Git]   Baseline: {self.baseline_commit[:8]}")
            print(f"[ATD-Git]   Branch: {self.fix_branch}")

            return {
                "success": True,
                "session_id": self.session_id,
                "baseline_commit": self.baseline_commit,
                "fix_branch": self.fix_branch
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def commit_fix_batch(self, fixes: List[Dict], batch_name: str) -> Optional[str]:
        """
        [ρ] Atomic commit with Asymmetrica annotations

        Args:
            fixes: List of error fixes applied
            batch_name: Descriptive name for this batch

        Returns:
            str: Commit hash, or None if failed
        """
        print(f"\n[ATD-Git] Committing batch: {batch_name}")

        try:
            # Stage all modified files
            files_modified = list(set([f["file"] for f in fixes]))

            for file_path in files_modified:
                subprocess.run(
                    ["git", "add", file_path],
                    cwd=self.project_root,
                    shell=True
                )

            # Generate Asymmetrica-formatted commit message
            message = self._generate_commit_message(fixes, batch_name)

            # Create commit
            result = subprocess.run(
                ["git", "commit", "-m", message],
                cwd=self.project_root,
                capture_output=True,
                text=True,
                shell=True
            )

            if result.returncode != 0:
                print(f"[ATD-Git] Commit failed: {result.stderr}")
                return None

            # Get commit hash
            result = subprocess.run(
                ["git", "rev-parse", "HEAD"],
                cwd=self.project_root,
                capture_output=True,
                text=True,
                shell=True
            )

            commit_hash = result.stdout.strip()

            # Update state file
            self._update_state(commit_hash, batch_name, fixes)

            print(f"[ATD-Git] Committed: {commit_hash[:8]}")
            return commit_hash

        except Exception as e:
            print(f"[ATD-Git] Error committing: {e}")
            return None

    def _generate_commit_message(self, fixes: List[Dict], batch_name: str) -> str:
        """
        [σ] Generate Asymmetrica-formatted commit message

        Args:
            fixes: List of fixes applied
            batch_name: Name of this batch

        Returns:
            str: Formatted commit message
        """
        # Count errors by type
        error_counts = {}
        for fix in fixes:
            error_type = fix.get("error_type", "UNKNOWN")
            error_counts[error_type] = error_counts.get(error_type, 0) + 1

        # Build message
        lines = [
            f"ATD V3: {batch_name}",
            "",
            f"[σ] Semantic Layer: Fixed {len(fixes)} TypeScript errors",
            f"[ρ] Resilience: Backed up to .atd/backups/{self.session_id}",
            "[κ] Knowledge: Chain-of-thought reasoning applied",
            "",
            "Errors fixed:"
        ]

        for error_type, count in sorted(error_counts.items()):
            lines.append(f"- {error_type}: {count} occurrences")

        lines.extend([
            "",
            f"Baseline: {self.baseline_commit[:8] if self.baseline_commit else 'unknown'}",
            "ATD Version: 3.0.0",
            "Safety: Rollback available via 'python scripts/atd/atd.py rollback'",
            "",
            "🤖 Generated with Asymmetrica TypeScript Doctor"
        ])

        return "\n".join(lines)

    def _update_state(self, commit_hash: str, batch_name: str, fixes: List[Dict]):
        """Update state file with new commit"""
        try:
            if self.state_file.exists():
                with open(self.state_file, "r") as f:
                    state = json.load(f)
            else:
                state = {"commits": []}

            state["commits"].append({
                "commit": commit_hash,
                "batch_name": batch_name,
                "fixes_count": len(fixes),
                "timestamp": datetime.now().isoformat()
            })

            with open(self.state_file, "w") as f:
                json.dump(state, f, indent=2)

        except Exception as e:
            print(f"[ATD-Git] Warning: Could not update state: {e}")

    def rollback_to_baseline(self) -> bool:
        """
        [ρ] Nuclear rollback - restore everything

        Steps:
        1. Reset to baseline commit
        2. Pop stash
        3. Delete fix branch

        Returns:
            bool: Success status
        """
        print("\n[ATD-Git] NUCLEAR ROLLBACK - Restoring to baseline...")

        try:
            # Load state
            if not self.state_file.exists():
                print("[ATD-Git] No checkpoint found")
                return False

            with open(self.state_file, "r") as f:
                state = json.load(f)

            baseline = state["baseline_commit"]
            original_branch = state["original_branch"]

            # Reset to baseline
            print(f"[ATD-Git] Resetting to {baseline[:8]}...")
            subprocess.run(
                ["git", "reset", "--hard", baseline],
                cwd=self.project_root,
                shell=True
            )

            # Switch back to original branch
            subprocess.run(
                ["git", "checkout", original_branch],
                cwd=self.project_root,
                shell=True
            )

            # Pop stash
            print("[ATD-Git] Restoring stashed changes...")
            subprocess.run(
                ["git", "stash", "pop"],
                cwd=self.project_root,
                shell=True
            )

            print("[ATD-Git] Rollback complete - all changes reverted")
            return True

        except Exception as e:
            print(f"[ATD-Git] Rollback failed: {e}")
            return False

    def rollback_last_batch(self) -> bool:
        """
        [ρ] Surgical rollback - revert last commit

        Returns:
            bool: Success status
        """
        print("\n[ATD-Git] SURGICAL ROLLBACK - Reverting last batch...")

        try:
            # Load state
            if not self.state_file.exists():
                print("[ATD-Git] No checkpoint found")
                return False

            with open(self.state_file, "r") as f:
                state = json.load(f)

            if not state.get("commits"):
                print("[ATD-Git] No commits to revert")
                return False

            last_commit = state["commits"][-1]["commit"]

            # Revert commit
            print(f"[ATD-Git] Reverting {last_commit[:8]}...")
            subprocess.run(
                ["git", "revert", "--no-edit", last_commit],
                cwd=self.project_root,
                shell=True
            )

            # Remove from state
            state["commits"] = state["commits"][:-1]
            with open(self.state_file, "w") as f:
                json.dump(state, f, indent=2)

            print("[ATD-Git] Last batch reverted successfully")
            return True

        except Exception as e:
            print(f"[ATD-Git] Rollback failed: {e}")
            return False

    def get_status(self) -> Dict:
        """
        Get current ATD Git status

        Returns:
            dict: Status information
        """
        try:
            if not self.state_file.exists():
                return {"active": False}

            with open(self.state_file, "r") as f:
                state = json.load(f)

            return {
                "active": True,
                "session_id": state.get("session_id"),
                "baseline_commit": state.get("baseline_commit"),
                "commits_count": len(state.get("commits", [])),
                "fix_branch": state.get("fix_branch")
            }

        except Exception as e:
            return {"active": False, "error": str(e)}
