"""
[σ] Asymmetrica Logger - Asymmetrica TypeScript Doctor V3
[ρ] Complete logging with Asymmetrica Protocol annotations
[κ] Knowledge: Track all operations with cycle awareness

Philosophy: "Log everything with Asymmetrica Protocol!"

Created: 2025-10-14
ATD Version: 3.0.0
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional


class AsymmetricaLogger:
    """
    [σ] Asymmetrica Protocol Logger

    Logs all ATD operations with:
    - Asymmetrica annotations ([σ], [ρ], [κ])
    - Cycle phase tracking (30% Emergence, 20% Optimization, 50% Stabilization)
    - Socket context (if API route)
    """

    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.atd_dir = self.project_root / ".atd"
        self.logs_dir = self.atd_dir / "logs"
        self.socket_registry = self.project_root / "sockets" / "registry.json"

        # Ensure directories exist
        self.logs_dir.mkdir(parents=True, exist_ok=True)

        # Session tracking
        self.session_id = None
        self.session_start = None
        self.operations = []

    def start_session(self, session_id: str):
        """
        [ρ] Start new ATD session

        Args:
            session_id: Unique session identifier
        """
        self.session_id = session_id
        self.session_start = datetime.now()
        self.operations = []

        print(f"[ATD-Log] Session started: {session_id}")

    def log_operation(
        self,
        operation_type: str,
        details: Dict,
        files: List[str] = None,
        errors: List[Dict] = None
    ):
        """
        [σ] Log operation with Asymmetrica annotations

        Args:
            operation_type: Type of operation (FIX_BATCH, ROLLBACK, etc.)
            details: Operation details
            files: Files affected
            errors: Errors processed
        """
        # Calculate cycle position
        cycle_position = self._calculate_cycle_position()
        cycle_phase = self._determine_cycle_phase(cycle_position)

        # Build operation log
        operation = {
            "timestamp": datetime.now().isoformat(),
            "type": operation_type,
            "phase": cycle_phase,
            "cycle_position": cycle_position,
            "details": details,
            "annotations": self._generate_annotations(operation_type, details),
        }

        # Add file context
        if files:
            operation["files"] = files
            operation["socket_context"] = self._get_socket_contexts(files)

        # Add error context
        if errors:
            operation["errors"] = {
                "count": len(errors),
                "types": self._count_error_types(errors)
            }

        # Add Git context
        operation["git_context"] = self._get_git_context()

        self.operations.append(operation)

    def _calculate_cycle_position(self) -> float:
        """
        [κ] Calculate position in Asymmetrica Cycle

        Returns:
            float: Position (0.0 - 1.0)
        """
        if not self.session_start:
            return 0.0

        # Calculate time elapsed in session
        elapsed = (datetime.now() - self.session_start).total_seconds()

        # Assume typical session is 30 minutes (1800 seconds)
        typical_session = 1800
        position = min(elapsed / typical_session, 1.0)

        return position

    def _determine_cycle_phase(self, position: float) -> str:
        """
        [κ] Determine Asymmetrica Cycle phase

        Args:
            position: Cycle position (0.0 - 1.0)

        Returns:
            str: Phase name
        """
        # Asymmetrica Cycle: 30% Emergence, 20% Optimization, 50% Stabilization
        if position < 0.3:
            return "EMERGENCE"
        elif position < 0.5:
            return "OPTIMIZATION"
        else:
            return "STABILIZATION"

    def _generate_annotations(self, operation_type: str, details: Dict) -> Dict:
        """
        [σ] Generate Asymmetrica annotations for operation

        Args:
            operation_type: Type of operation
            details: Operation details

        Returns:
            dict: Annotations
        """
        annotations = {}

        # Semantic layer annotation
        if operation_type == "FIX_BATCH":
            count = details.get("errors_fixed", 0)
            annotations["sigma"] = f"Semantic analysis via chain-of-thought fixed {count} errors"

        elif operation_type == "ROLLBACK":
            annotations["sigma"] = "Semantic corruption detected, initiating rollback"

        elif operation_type == "AI_COLLABORATION":
            annotations["sigma"] = "Complex error requiring AI collaboration"

        # Resilience layer annotation
        if operation_type in ["FIX_BATCH", "AI_COLLABORATION"]:
            annotations["rho"] = "Resilient execution with Git rollback protection"

        elif operation_type == "ROLLBACK":
            annotations["rho"] = "Auto-restored to prevent cascading failures"

        # Knowledge layer annotation
        annotations["kappa"] = self._get_knowledge_annotation(operation_type, details)

        return annotations

    def _get_knowledge_annotation(self, operation_type: str, details: Dict) -> str:
        """
        [κ] Generate knowledge layer annotation

        Args:
            operation_type: Type of operation
            details: Operation details

        Returns:
            str: Knowledge annotation
        """
        if operation_type == "FIX_BATCH":
            strategy = details.get("strategy", "unknown")
            return f"Knowledge from Prisma schema + Socket registry applied via {strategy}"

        elif operation_type == "AI_COLLABORATION":
            return "Knowledge augmented with AI assistant capabilities"

        elif operation_type == "ROLLBACK":
            return "Pattern learned: Avoid this fix strategy in future"

        return "Knowledge accumulated from operation"

    def _get_socket_contexts(self, files: List[str]) -> List[Dict]:
        """
        [κ] Get socket contexts for API routes

        Args:
            files: Files being processed

        Returns:
            list: Socket contexts
        """
        try:
            # Load socket registry
            if not self.socket_registry.exists():
                return []

            with open(self.socket_registry, "r") as f:
                registry = json.load(f)

            contexts = []
            for file_path in files:
                if "/api/" in file_path:
                    # Find matching socket
                    for socket in registry.get("sockets", []):
                        if socket.get("file") in file_path:
                            contexts.append({
                                "file": file_path,
                                "socket_id": socket.get("id"),
                                "upstream": socket.get("upstream", []),
                                "downstream": socket.get("downstream", []),
                                "latency_target": socket.get("latency_target")
                            })
                            break

            return contexts

        except Exception as e:
            return []

    def _get_git_context(self) -> Dict:
        """
        Get current Git context

        Returns:
            dict: Git context
        """
        import subprocess

        try:
            # Get current branch
            result = subprocess.run(
                ["git", "branch", "--show-current"],
                cwd=self.project_root,
                capture_output=True,
                text=True,
                shell=True
            )
            branch = result.stdout.strip()

            # Get current commit
            result = subprocess.run(
                ["git", "rev-parse", "HEAD"],
                cwd=self.project_root,
                capture_output=True,
                text=True,
                shell=True
            )
            commit = result.stdout.strip()

            return {
                "branch": branch,
                "commit": commit[:8]
            }

        except Exception as e:
            return {"error": str(e)}

    def _count_error_types(self, errors: List[Dict]) -> Dict[str, int]:
        """
        Count errors by type

        Args:
            errors: List of errors

        Returns:
            dict: Error type counts
        """
        counts = {}
        for error in errors:
            error_type = error.get("code", "UNKNOWN")
            counts[error_type] = counts.get(error_type, 0) + 1

        return counts

    def save_session_log(self):
        """
        [ρ] Save session log to file

        Returns:
            str: Log file path
        """
        if not self.session_id:
            return None

        log_file = self.logs_dir / f"session-{self.session_id}.json"

        session_log = {
            "session_id": self.session_id,
            "start_time": self.session_start.isoformat(),
            "end_time": datetime.now().isoformat(),
            "duration_seconds": (datetime.now() - self.session_start).total_seconds(),
            "operations": self.operations,
            "summary": self._generate_summary()
        }

        with open(log_file, "w") as f:
            json.dump(session_log, f, indent=2)

        print(f"[ATD-Log] Session log saved: {log_file}")
        return str(log_file)

    def _generate_summary(self) -> Dict:
        """
        Generate session summary

        Returns:
            dict: Summary statistics
        """
        total_errors_fixed = 0
        total_rollbacks = 0
        total_ai_collaborations = 0

        for op in self.operations:
            if op["type"] == "FIX_BATCH":
                total_errors_fixed += op.get("details", {}).get("errors_fixed", 0)
            elif op["type"] == "ROLLBACK":
                total_rollbacks += 1
            elif op["type"] == "AI_COLLABORATION":
                total_ai_collaborations += 1

        return {
            "total_operations": len(self.operations),
            "errors_fixed": total_errors_fixed,
            "rollbacks": total_rollbacks,
            "ai_collaborations": total_ai_collaborations,
            "final_phase": self._determine_cycle_phase(1.0)
        }
