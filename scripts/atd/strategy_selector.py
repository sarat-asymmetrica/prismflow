"""
Asymmetrica TypeScript Doctor - Strategy Selector
Chain-of-thought module for selecting resolution strategies

[σ] Semantic Layer: Choose optimal fix strategy based on intent
[ρ] Resilience: Safe, conservative decisions with confidence thresholds
[κ] Knowledge: Map intents to actionable fix strategies
"""

from typing import Dict, Optional, List
from enum import Enum


class FixStrategy(Enum):
    """
    [κ] Available fix strategies
    """
    FIX_PATH = "fix_path"              # Correct the import path
    INSTALL_NPM = "install_npm"        # Add to npm install list
    CREATE_STUB = "create_stub"        # Generate stub file
    DELETE_IMPORT = "delete_import"    # Mark for deletion (dead code)
    ALREADY_CORRECT = "already_correct"  # Path is correct, issue elsewhere
    SKIP = "skip"                      # Cannot resolve automatically


class StrategySelector:
    """
    [σ] Select optimal fix strategy based on intent analysis

    Decision thresholds:
    - confidence >= 0.9: High confidence fix
    - confidence >= 0.7: Medium confidence fix (with warning)
    - confidence < 0.7: Skip (manual review needed)
    """

    def __init__(self, confidence_threshold: float = 0.7):
        self.confidence_threshold = confidence_threshold

        # Action to strategy mapping
        self.action_strategy_map = {
            "FIX_PATH": FixStrategy.FIX_PATH,
            "NEEDS_INSTALL": FixStrategy.INSTALL_NPM,
            "FILE_MISSING": None,  # Requires sub-decision
            "DELETE_IMPORT": FixStrategy.DELETE_IMPORT,
            "ALREADY_CORRECT": FixStrategy.ALREADY_CORRECT,
            "ALREADY_DECLARED": FixStrategy.SKIP,  # Already in package.json
            "CHECK_SUBPACKAGE": FixStrategy.SKIP,  # Needs manual verification
            "SKIP": FixStrategy.SKIP
        }

    def select(self, intent: Dict) -> Dict[str, any]:
        """
        [σ] Main strategy selection logic

        Args:
            intent: Intent analysis from IntentInference

        Returns:
            Dictionary with selected strategy and metadata
        """
        action = intent.get("action")
        confidence = intent.get("confidence", 0.0)
        corrected_path = intent.get("corrected_path")
        pattern = intent.get("pattern")
        module = intent.get("module")

        # Build strategy decision
        decision = {
            "module": module,
            "intent_action": action,
            "strategy": None,
            "corrected_path": corrected_path,
            "confidence": confidence,
            "should_apply": False,
            "reasoning": [],
            "metadata": {}
        }

        # GATE 1: Confidence check
        if confidence < self.confidence_threshold:
            decision.update({
                "strategy": FixStrategy.SKIP,
                "should_apply": False,
                "reasoning": [
                    f"Confidence too low ({confidence:.2f} < {self.confidence_threshold})",
                    "Manual review required"
                ]
            })
            return decision

        # GATE 2: Action-based strategy selection
        if action == "FIX_PATH":
            decision.update({
                "strategy": FixStrategy.FIX_PATH,
                "should_apply": True,
                "reasoning": [
                    f"High confidence path fix ({confidence:.2f})",
                    f"Correct path: {corrected_path}"
                ]
            })

        elif action == "NEEDS_INSTALL":
            decision.update({
                "strategy": FixStrategy.INSTALL_NPM,
                "should_apply": True,
                "reasoning": [
                    "Package missing from package.json",
                    "Add to npm install list"
                ]
            })

        elif action == "FILE_MISSING":
            # Sub-decision: Create stub or delete?
            decision.update(self._handle_file_missing(intent))

        elif action == "DELETE_IMPORT":
            decision.update({
                "strategy": FixStrategy.DELETE_IMPORT,
                "should_apply": False,  # Dangerous - require manual confirmation
                "reasoning": [
                    "Import appears to be dead code",
                    "Recommend manual deletion after verification"
                ]
            })

        elif action == "ALREADY_CORRECT":
            decision.update({
                "strategy": FixStrategy.ALREADY_CORRECT,
                "should_apply": False,
                "reasoning": [
                    "Import path is correct",
                    "Issue may be TypeScript config or missing file"
                ]
            })

        elif action in ["ALREADY_DECLARED", "CHECK_SUBPACKAGE"]:
            decision.update({
                "strategy": FixStrategy.SKIP,
                "should_apply": False,
                "reasoning": intent.get("reasoning", ["No action needed"])
            })

        else:
            decision.update({
                "strategy": FixStrategy.SKIP,
                "should_apply": False,
                "reasoning": [
                    f"Unknown action: {action}",
                    "Manual review required"
                ]
            })

        return decision

    def _handle_file_missing(self, intent: Dict) -> Dict:
        """
        [κ] Handle FILE_MISSING action with sub-decision logic

        Decision tree:
        1. If UI component → CREATE_STUB (high value)
        2. If hook/lib → CREATE_STUB (medium value)
        3. If local component file → DELETE_IMPORT (low value)
        4. Otherwise → SKIP
        """
        pattern = intent.get("pattern")
        module = intent.get("module")
        corrected_path = intent.get("corrected_path")

        # Pattern 1: UI components (high value)
        if pattern == "relative_ui":
            return {
                "strategy": FixStrategy.CREATE_STUB,
                "should_apply": False,  # Manual creation recommended
                "reasoning": [
                    "UI component missing",
                    f"Recommend creating: {corrected_path}",
                    "Or check if component was renamed/moved"
                ]
            }

        # Pattern 2: Hooks/Lib (medium value)
        if pattern in ["relative_hooks", "relative_lib"]:
            return {
                "strategy": FixStrategy.CREATE_STUB,
                "should_apply": False,
                "reasoning": [
                    f"Module missing: {corrected_path}",
                    "May need to create stub or verify path"
                ]
            }

        # Pattern 3: Local files (low value - likely dead code)
        if pattern == "relative_local":
            return {
                "strategy": FixStrategy.DELETE_IMPORT,
                "should_apply": False,
                "reasoning": [
                    "Local file missing - likely refactored/deleted",
                    "Recommend manual removal of import"
                ]
            }

        # Pattern 4: Absolute alias (should exist but doesn't)
        if pattern == "absolute_alias":
            return {
                "strategy": FixStrategy.SKIP,
                "should_apply": False,
                "reasoning": [
                    "File should exist at this path but doesn't",
                    "Manual investigation required"
                ]
            }

        # Default: Skip
        return {
            "strategy": FixStrategy.SKIP,
            "should_apply": False,
            "reasoning": [
                "File missing and no clear resolution strategy",
                "Manual review required"
            ]
        }

    def batch_select(self, intents: List[Dict]) -> Dict[str, List[Dict]]:
        """
        [σ] Batch strategy selection for multiple intents

        Args:
            intents: List of intent analyses

        Returns:
            Dictionary grouping decisions by strategy
        """
        by_strategy = {
            FixStrategy.FIX_PATH: [],
            FixStrategy.INSTALL_NPM: [],
            FixStrategy.CREATE_STUB: [],
            FixStrategy.DELETE_IMPORT: [],
            FixStrategy.ALREADY_CORRECT: [],
            FixStrategy.SKIP: []
        }

        for intent in intents:
            decision = self.select(intent)
            strategy = decision.get("strategy")

            if strategy:
                by_strategy[strategy].append(decision)

        return by_strategy

    def get_npm_install_list(self, decisions: List[Dict]) -> List[str]:
        """
        [κ] Extract NPM packages that need to be installed

        Args:
            decisions: List of strategy decisions

        Returns:
            List of package names to install
        """
        packages = []

        for decision in decisions:
            if decision.get("strategy") == FixStrategy.INSTALL_NPM:
                module = decision.get("module")
                if module:
                    # Clean version tags if any
                    clean_module = module.split('@')[0] if '@' in module and not module.startswith('@') else module
                    packages.append(clean_module)

        return list(set(packages))  # Remove duplicates

    def generate_summary(self, batch_decisions: Dict[str, List[Dict]]) -> Dict:
        """
        [σ] Generate summary statistics for batch decisions

        Args:
            batch_decisions: Decisions grouped by strategy

        Returns:
            Summary dictionary with counts and details
        """
        summary = {
            "total_decisions": 0,
            "by_strategy": {},
            "high_confidence_fixes": 0,
            "manual_review_needed": 0,
            "npm_packages_to_install": 0
        }

        for strategy, decisions in batch_decisions.items():
            count = len(decisions)
            summary["total_decisions"] += count
            summary["by_strategy"][strategy.value] = count

            # Count high confidence fixes
            high_conf = sum(1 for d in decisions if d.get("confidence", 0) >= 0.9)
            summary["high_confidence_fixes"] += high_conf

            # Count manual reviews
            if strategy == FixStrategy.SKIP:
                summary["manual_review_needed"] += count

            # Count npm installs
            if strategy == FixStrategy.INSTALL_NPM:
                summary["npm_packages_to_install"] += count

        return summary
