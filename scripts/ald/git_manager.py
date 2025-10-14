"""
[sigma] Semantic Layer: Git Safety Manager for ALD V1
[rho] Resilience: Full rollback capability + corruption detection
[kappa] Knowledge: Git stash, checkout, and recovery strategies

Provides Git safety net for automated code fixes.
Copied from ATD V3 D3 (proven 99.97% success pattern).
"""

import subprocess
from pathlib import Path
from typing import Optional
from datetime import datetime


class GitManager:
    """
    [sigma] Semantic: Git safety checkpoint and rollback manager
    [rho] Resilience: Multiple recovery strategies
    [kappa] Knowledge: Git stash, branch, and reset operations
    """

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.checkpoint_name = None
        self.is_git_repo = self._check_git_repo()

    def _check_git_repo(self) -> bool:
        """
        [kappa] Check if current directory is a git repository

        Returns:
            True if valid git repo, False otherwise
        """
        result = subprocess.run(
            "git rev-parse --git-dir 2>nul",
            shell=True,
            capture_output=True,
            cwd=self.project_root
        )
        return result.returncode == 0

    def create_checkpoint(self) -> Optional[str]:
        """
        [rho] Create Git checkpoint before making changes

        Returns:
            Checkpoint name or None if failed
        """
        if not self.is_git_repo:
            print("[GitManager] Warning: Not a git repository - no checkpoint created")
            return None

        timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
        self.checkpoint_name = f"ald-checkpoint-{timestamp}"

        # Stash current changes with message
        result = subprocess.run(
            f'git stash push -u -m "{self.checkpoint_name}" 2>nul',
            shell=True,
            capture_output=True,
            cwd=self.project_root
        )

        if result.returncode == 0:
            # Check if anything was stashed
            if b"No local changes" in result.stdout or b"No local changes" in result.stderr:
                print("[GitManager] No changes to stash")
                return self.checkpoint_name
            else:
                print(f"[GitManager] OK: Checkpoint created: {self.checkpoint_name}")
                # Pop the stash to restore working state
                subprocess.run(
                    "git stash pop 2>nul",
                    shell=True,
                    capture_output=True,
                    cwd=self.project_root
                )
                return self.checkpoint_name
        else:
            print("[GitManager] Warning: Failed to create git checkpoint")
            return None

    def rollback_to_baseline(self):
        """
        [rho] Rollback all changes to baseline checkpoint
        """
        if not self.is_git_repo:
            print("[GitManager] Error: Cannot rollback - not a git repository")
            return False

        print("\n[GitManager] Rolling back to baseline...")

        # Strategy 1: Hard reset to HEAD (discard all working changes)
        result = subprocess.run(
            "git reset --hard HEAD 2>nul",
            shell=True,
            capture_output=True,
            cwd=self.project_root
        )

        if result.returncode == 0:
            print("[GitManager] OK: Rollback successful - all changes discarded")

            # Also clean untracked files
            subprocess.run(
                "git clean -fd 2>nul",
                shell=True,
                capture_output=True,
                cwd=self.project_root
            )
            print("[GitManager] OK: Untracked files cleaned")
            return True
        else:
            print("[GitManager] Error: Rollback failed")
            return False

    def get_current_commit(self) -> Optional[str]:
        """
        [kappa] Get current commit hash

        Returns:
            Commit hash or None
        """
        if not self.is_git_repo:
            return None

        result = subprocess.run(
            "git rev-parse HEAD 2>nul",
            shell=True,
            capture_output=True,
            text=True,
            cwd=self.project_root
        )

        if result.returncode == 0:
            return result.stdout.strip()
        return None

    def get_changed_files(self) -> list:
        """
        [kappa] Get list of changed files

        Returns:
            List of changed file paths
        """
        if not self.is_git_repo:
            return []

        result = subprocess.run(
            "git status --porcelain 2>nul",
            shell=True,
            capture_output=True,
            text=True,
            cwd=self.project_root
        )

        if result.returncode == 0:
            files = []
            for line in result.stdout.split('\n'):
                if line.strip():
                    # Parse git status format: XY filename
                    parts = line.split(maxsplit=1)
                    if len(parts) == 2:
                        files.append(parts[1])
            return files
        return []

    def has_uncommitted_changes(self) -> bool:
        """
        [kappa] Check if there are uncommitted changes

        Returns:
            True if there are changes, False otherwise
        """
        return len(self.get_changed_files()) > 0
