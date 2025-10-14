"""
[σ] AI Bridge - Asymmetrica TypeScript Doctor V3
[ρ] Collaborate with user's AI assistant for complex fixes
[κ] Knowledge: No API calls - user runs in their IDE

Philosophy: "AI collaboration makes complex fixes routine!"

Created: 2025-10-14
ATD Version: 3.0.0
"""

import os
import json
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional


class AIBridge:
    """
    [σ] AI Bridge

    Generates collaboration prompts for user's AI assistant:
    - Detects user's AI (Claude Code, Cursor, Windsurf, Copilot)
    - Generates prompts with full Asymmetrica context
    - NO API CALLS - user applies fix in their IDE
    - Tracks AI-assisted fixes
    """

    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.atd_dir = self.project_root / ".atd"
        self.prompts_dir = self.atd_dir / "ai-prompts"
        self.prisma_schema = self.project_root / "prisma" / "schema.prisma"
        self.socket_registry = self.project_root / "sockets" / "registry.json"

        # Ensure directories exist
        self.prompts_dir.mkdir(parents=True, exist_ok=True)

    def detect_users_ai(self) -> str:
        """
        [κ] Detect which AI assistant user has

        Returns:
            str: AI assistant name
        """
        # Check for AI configuration directories
        if (self.project_root / ".claude").exists():
            return "Claude Code"
        elif (self.project_root / ".cursor").exists():
            return "Cursor"
        elif (self.project_root / ".windsurf").exists():
            return "Windsurf"
        elif (self.project_root / ".github" / "copilot").exists():
            return "GitHub Copilot"
        else:
            return "Unknown (Any AI assistant)"

    def generate_collaboration_prompt(
        self,
        error: Dict,
        atd_analysis: Dict,
        context: Dict
    ) -> Dict:
        """
        [σ] Generate prompt with full Asymmetrica context

        Args:
            error: Error details
            atd_analysis: ATD's deterministic analysis
            context: Additional context (Prisma schema, Socket registry)

        Returns:
            dict: Prompt details (file path, content, instructions)
        """
        ai_detected = self.detect_users_ai()

        # Generate prompt content
        prompt_content = self._build_prompt_content(error, atd_analysis, context, ai_detected)

        # Save prompt to file
        error_id = f"{error['line']}-{error['code']}"
        prompt_file = self.prompts_dir / f"error-{error_id}.md"

        with open(prompt_file, "w", encoding="utf-8") as f:
            f.write(prompt_content)

        return {
            "prompt_file": str(prompt_file),
            "ai_detected": ai_detected,
            "error_id": error_id,
            "instructions": self._get_user_instructions(ai_detected, prompt_file)
        }

    def _build_prompt_content(
        self,
        error: Dict,
        atd_analysis: Dict,
        context: Dict,
        ai_detected: str
    ) -> str:
        """
        [σ] Build comprehensive prompt with Asymmetrica annotations

        Args:
            error: Error details
            atd_analysis: ATD analysis
            context: Additional context
            ai_detected: Detected AI assistant

        Returns:
            str: Formatted prompt content
        """
        lines = [
            "# AI Collaboration Request - TypeScript Error",
            "",
            f"[σ] Semantic Context: ATD V3 needs {ai_detected} collaboration for complex error",
            "",
            "## Error Details",
            f"- **Type**: {error['code']} ({error.get('error_type', 'Unknown')})",
            f"- **File**: {error['file']}:{error['line']}",
            f"- **Message**: {error['message']}",
            ""
        ]

        # Add code context
        if "code_context" in error:
            lines.extend([
                "## Code Context",
                "```typescript",
                error["code_context"],
                "```",
                ""
            ])

        # Add ATD analysis
        lines.extend([
            "## ATD Analysis",
            f"- **Confidence**: {atd_analysis.get('confidence', 0.0):.2f}",
            f"- **Strategy**: {atd_analysis.get('strategy', 'Unknown')}",
            f"- **Reason**: {atd_analysis.get('reason', 'Complex error requiring AI assistance')}",
            ""
        ])

        # Add Asymmetrica context
        lines.extend([
            "## Asymmetrica Context",
            "",
            "[κ] Knowledge Layer:",
        ])

        # Prisma schema context
        if context.get("prisma_models"):
            lines.append("- **Prisma Models**: " + ", ".join(context["prisma_models"]))

        # Socket registry context
        if context.get("socket_context"):
            socket = context["socket_context"]
            lines.extend([
                f"- **Socket ID**: {socket.get('id', 'N/A')}",
                f"- **Upstream**: {', '.join(socket.get('upstream', []))}",
                f"- **Downstream**: {', '.join(socket.get('downstream', []))}",
            ])

        # Add resilience layer
        lines.extend([
            "",
            "[ρ] Resilience Layer:",
            "- ATD will validate your fix",
            "- Git rollback available if corrupted",
            "- No fear - just fix!",
            ""
        ])

        # Add task
        lines.extend([
            "## Your Task",
            "",
            "Please suggest a fix with the following format:",
            "",
            "```typescript",
            "// Your fixed code here",
            "```",
            "",
            "**Confidence Score**: [0.0 - 1.0]",
            "",
            "ATD will handle validation and rollback if needed!",
            "",
            "---",
            f"*Generated by Asymmetrica TypeScript Doctor V3 - {datetime.now().isoformat()}*"
        ])

        return "\n".join(lines)

    def _get_user_instructions(self, ai_detected: str, prompt_file: Path) -> str:
        """
        Get user instructions for applying fix

        Args:
            ai_detected: Detected AI
            prompt_file: Path to prompt file

        Returns:
            str: User instructions
        """
        instructions = [
            f"\n[ATD-AI] Prompt saved to: {prompt_file}",
            f"[ATD-AI] Detected AI: {ai_detected}",
            "",
            "[ATD-AI] Next steps:",
            f"  1. Open {prompt_file} in {ai_detected}",
            "  2. Ask your AI to suggest a fix",
            "  3. Apply the fix to your code",
            "  4. Press ENTER when done (or 's' to skip)",
            ""
        ]

        return "\n".join(instructions)

    def wait_for_user_fix(self, prompt_file: str) -> Dict:
        """
        [ρ] Wait for user to apply AI suggestion

        Args:
            prompt_file: Path to prompt file

        Returns:
            dict: User action result
        """
        print(self._get_user_instructions(self.detect_users_ai(), Path(prompt_file)))

        while True:
            user_input = input("[ATD-AI] Press ENTER when fix applied (or 's' to skip): ").strip().lower()

            if user_input == "s":
                return {
                    "action": "SKIPPED",
                    "timestamp": datetime.now().isoformat()
                }
            elif user_input == "":
                return {
                    "action": "APPLIED",
                    "timestamp": datetime.now().isoformat()
                }
            else:
                print("[ATD-AI] Invalid input. Press ENTER or 's'")

    def get_prisma_context(self, file_path: str) -> List[str]:
        """
        [κ] Extract relevant Prisma models for a file

        Args:
            file_path: File being fixed

        Returns:
            list: Relevant model names
        """
        try:
            # Read file content
            with open(self.project_root / file_path, "r", encoding="utf-8") as f:
                content = f.read()

            # Read Prisma schema
            if not self.prisma_schema.exists():
                return []

            with open(self.prisma_schema, "r") as f:
                schema = f.read()

            # Extract model names from schema
            import re
            models = re.findall(r"model\s+(\w+)", schema)

            # Find which models are referenced in the file
            relevant_models = [model for model in models if model.lower() in content.lower()]

            return relevant_models

        except Exception as e:
            return []

    def get_socket_context(self, file_path: str) -> Optional[Dict]:
        """
        [κ] Get socket context if file is an API route

        Args:
            file_path: File being fixed

        Returns:
            dict: Socket context, or None
        """
        try:
            # Check if file is an API route
            if "/api/" not in file_path:
                return None

            # Load socket registry
            if not self.socket_registry.exists():
                return None

            with open(self.socket_registry, "r") as f:
                registry = json.load(f)

            # Find matching socket
            for socket in registry.get("sockets", []):
                if socket.get("file") in file_path:
                    return socket

            return None

        except Exception as e:
            return None

    def track_ai_fix(self, error: Dict, fix_applied: bool):
        """
        [κ] Track AI-assisted fixes for analysis

        Args:
            error: Error that was fixed
            fix_applied: Whether fix was applied
        """
        try:
            tracking_file = self.atd_dir / "ai-collaboration-log.json"

            # Load existing log
            if tracking_file.exists():
                with open(tracking_file, "r") as f:
                    log = json.load(f)
            else:
                log = {"collaborations": []}

            # Add entry
            log["collaborations"].append({
                "timestamp": datetime.now().isoformat(),
                "error_code": error["code"],
                "file": error["file"],
                "line": error["line"],
                "fix_applied": fix_applied,
                "ai_detected": self.detect_users_ai()
            })

            # Save log
            with open(tracking_file, "w") as f:
                json.dump(log, f, indent=2)

        except Exception as e:
            print(f"[ATD-AI] Warning: Could not track collaboration: {e}")
