"""
[σ] Semantic: Git Safety Manager for ABD V1
[ρ] Resilience: Checkpoint and rollback capability
[κ] Knowledge: Git operations, safe state management

Provides:
- Create safety checkpoints before fixes
- Detect uncommitted changes
- Rollback to baseline on corruption
- Git status reporting
"""

import subprocess
from pathlib import Path
from typing import Dict, Optional


class GitManager:
    """
    [σ] Semantic: Git operations for safe build fixing
    [ρ] Resilience: Multiple safety checks and rollback
    [κ] Knowledge: Git best practices
    """

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.checkpoint_commit = None
        self.checkpoint_branch = None

    def create_checkpoint(self) -> Dict:
        """
        [ρ] Resilience: Create Git checkpoint before making changes
        [κ] Knowledge: Git status, commit hash, branch info

        Returns:
            Dict with checkpoint information
        """
        try:
            # Get current branch
            branch_result = subprocess.run(
                "git rev-parse --abbrev-ref HEAD",
                shell=True,
                capture_output=True,
                text=True,
                cwd=self.project_root
            )

            if branch_result.returncode != 0:
                return {
                    'success': False,
                    'error': 'Not a git repository'
                }

            self.checkpoint_branch = branch_result.stdout.strip()

            # Get current commit hash
            commit_result = subprocess.run(
                "git rev-parse HEAD",
                shell=True,
                capture_output=True,
                text=True,
                cwd=self.project_root
            )

            if commit_result.returncode != 0:
                return {
                    'success': False,
                    'error': 'Failed to get commit hash'
                }

            self.checkpoint_commit = commit_result.stdout.strip()

            # Get git status
            status_result = subprocess.run(
                "git status --porcelain",
                shell=True,
                capture_output=True,
                text=True,
                cwd=self.project_root
            )

            status_lines = status_result.stdout.strip().split('\n') if status_result.stdout.strip() else []

            # Parse status
            staged_files = []
            modified_files = []
            untracked_files = []

            for line in status_lines:
                if not line:
                    continue

                status = line[:2]
                filename = line[3:]

                if status[0] in ['M', 'A', 'D', 'R', 'C']:
                    staged_files.append(filename)
                if status[1] == 'M':
                    modified_files.append(filename)
                if status == '??':
                    untracked_files.append(filename)

            return {
                'success': True,
                'commit_hash': self.checkpoint_commit,
                'branch': self.checkpoint_branch,
                'staged_files': len(staged_files),
                'modified_files': len(modified_files),
                'untracked_files': len(untracked_files),
                'has_uncommitted_changes': len(staged_files) > 0 or len(modified_files) > 0
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def rollback_to_baseline(self) -> Dict:
        """
        [ρ] Resilience: Rollback to checkpoint commit
        [κ] Knowledge: Git reset operations

        Returns:
            Dict with rollback result
        """
        if not self.checkpoint_commit:
            return {
                'success': False,
                'error': 'No checkpoint created'
            }

        try:
            # Hard reset to checkpoint
            reset_result = subprocess.run(
                f"git reset --hard {self.checkpoint_commit}",
                shell=True,
                capture_output=True,
                text=True,
                cwd=self.project_root
            )

            if reset_result.returncode != 0:
                return {
                    'success': False,
                    'error': 'Git reset failed',
                    'stderr': reset_result.stderr
                }

            # Clean untracked files
            clean_result = subprocess.run(
                "git clean -fd",
                shell=True,
                capture_output=True,
                text=True,
                cwd=self.project_root
            )

            return {
                'success': True,
                'restored_commit': self.checkpoint_commit,
                'branch': self.checkpoint_branch
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def get_status(self) -> Dict:
        """
        [κ] Knowledge: Get current git status

        Returns:
            Dict with git status information
        """
        try:
            status_result = subprocess.run(
                "git status --porcelain",
                shell=True,
                capture_output=True,
                text=True,
                cwd=self.project_root
            )

            if status_result.returncode != 0:
                return {
                    'success': False,
                    'error': 'Failed to get git status'
                }

            status_lines = status_result.stdout.strip().split('\n') if status_result.stdout.strip() else []

            return {
                'success': True,
                'has_changes': len(status_lines) > 0,
                'change_count': len(status_lines)
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def create_commit(self, message: str) -> Dict:
        """
        [κ] Knowledge: Create a commit with current changes

        Args:
            message: Commit message

        Returns:
            Dict with commit result
        """
        try:
            # Add all changes
            add_result = subprocess.run(
                "git add -A",
                shell=True,
                capture_output=True,
                text=True,
                cwd=self.project_root
            )

            if add_result.returncode != 0:
                return {
                    'success': False,
                    'error': 'Git add failed',
                    'stderr': add_result.stderr
                }

            # Create commit
            commit_result = subprocess.run(
                f'git commit -m "{message}"',
                shell=True,
                capture_output=True,
                text=True,
                cwd=self.project_root
            )

            if commit_result.returncode != 0:
                # Check if there's nothing to commit
                if 'nothing to commit' in commit_result.stdout.lower():
                    return {
                        'success': True,
                        'message': 'Nothing to commit'
                    }

                return {
                    'success': False,
                    'error': 'Git commit failed',
                    'stderr': commit_result.stderr
                }

            # Get new commit hash
            hash_result = subprocess.run(
                "git rev-parse HEAD",
                shell=True,
                capture_output=True,
                text=True,
                cwd=self.project_root
            )

            return {
                'success': True,
                'commit_hash': hash_result.stdout.strip()
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def get_diff_stats(self) -> Dict:
        """
        [κ] Knowledge: Get statistics about current changes

        Returns:
            Dict with diff statistics
        """
        try:
            # Get diff stats
            diff_result = subprocess.run(
                "git diff --stat",
                shell=True,
                capture_output=True,
                text=True,
                cwd=self.project_root
            )

            return {
                'success': True,
                'diff_stat': diff_result.stdout.strip()
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
