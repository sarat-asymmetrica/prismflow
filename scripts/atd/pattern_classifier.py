"""
Asymmetrica TypeScript Doctor - Pattern Classifier
Chain-of-thought module for classifying import patterns

[σ] Semantic Layer: Deterministic pattern recognition
[ρ] Resilience: Handle all edge cases gracefully
[κ] Knowledge: Complete pattern taxonomy
"""

from typing import Dict, Optional
from enum import Enum


class ImportPattern(Enum):
    """
    [κ] Complete taxonomy of import patterns
    """
    NPM_SCOPED = "npm_scoped"              # @radix-ui/react-dialog
    NPM_UNSCOPED = "npm_unscoped"          # canvas-confetti
    VERSION_TAGGED = "version_tagged"       # sonner@2.0.3
    RELATIVE_UI = "relative_ui"            # ../ui/button, ./ui/button
    RELATIVE_LOCAL = "relative_local"      # ./components/MetricCard
    RELATIVE_LIB = "relative_lib"          # ../../lib/deliveryData
    RELATIVE_HOOKS = "relative_hooks"      # ../../hooks/useMetrics
    ABSOLUTE_ALIAS = "absolute_alias"      # @/lib/utils
    ABSOLUTE_NO_PREFIX = "absolute_no_prefix"  # components/ui/button
    UNKNOWN = "unknown"


class PatternClassifier:
    """
    [σ] Chain-of-thought pattern classifier

    Deterministically categorize import statements into
    logical pattern groups for intelligent resolution.
    """

    def __init__(self):
        # Known NPM packages (common ones to recognize immediately)
        self.known_npm_packages = {
            # UI Libraries
            '@radix-ui', '@dnd-kit', '@tanstack', '@hookform',
            # Utilities
            'canvas-confetti', 'sonner', 'recharts', 'framer-motion',
            'lucide-react', 'date-fns', 'zod', 'react-hook-form',
            # Others
            'three', 'gsap', 'd3', 'clsx', 'tailwind-merge'
        }

    def classify(self, module: str) -> ImportPattern:
        """
        [σ] Deterministic pattern classification

        Args:
            module: Import module string (e.g., "@/lib/utils", "../ui/button")

        Returns:
            ImportPattern enum value
        """
        # GATE 1: Version-tagged imports (highest priority)
        # Pattern: module@version
        if '@' in module and not module.startswith('@'):
            # sonner@2.0.3 → VERSION_TAGGED
            return ImportPattern.VERSION_TAGGED

        # GATE 2: NPM scoped packages
        # Pattern: @scope/package
        if module.startswith('@') and '/' in module and not module.startswith('@/'):
            # @radix-ui/react-dialog → NPM_SCOPED
            return ImportPattern.NPM_SCOPED

        # GATE 3: Absolute alias (AsymmFlow convention)
        # Pattern: @/path/to/module
        if module.startswith('@/'):
            # @/lib/utils → ABSOLUTE_ALIAS
            return ImportPattern.ABSOLUTE_ALIAS

        # GATE 4: Relative imports (complex decision tree)
        if module.startswith('./') or module.startswith('../'):
            # Sub-gate 4.1: UI components
            if '/ui/' in module or module.endswith('/ui') or module.endswith('/ui/'):
                # ../ui/button → RELATIVE_UI
                # ./ui/button → RELATIVE_UI
                return ImportPattern.RELATIVE_UI

            # Sub-gate 4.2: Hooks
            if '/hooks/' in module or module.endswith('/hooks'):
                # ../../hooks/useMetrics → RELATIVE_HOOKS
                return ImportPattern.RELATIVE_HOOKS

            # Sub-gate 4.3: Lib utilities
            if '/lib/' in module:
                # ../../lib/deliveryData → RELATIVE_LIB
                return ImportPattern.RELATIVE_LIB

            # Sub-gate 4.4: Local components/files
            # ./components/MetricCard → RELATIVE_LOCAL
            return ImportPattern.RELATIVE_LOCAL

        # GATE 5: Absolute path without @/ prefix
        # Pattern: components/ui/button (should be @/components/ui/button)
        if not module.startswith('.') and not module.startswith('@'):
            # Check if it looks like NPM package
            base_module = module.split('/')[0]

            # Known NPM package check
            for npm_prefix in self.known_npm_packages:
                if base_module.startswith(npm_prefix):
                    return ImportPattern.NPM_UNSCOPED

            # If contains typical project paths, it's absolute without prefix
            if any(x in module for x in ['components', 'lib', 'hooks', 'stores', 'types']):
                # components/ui/button → ABSOLUTE_NO_PREFIX
                return ImportPattern.ABSOLUTE_NO_PREFIX

            # Otherwise, assume NPM package
            return ImportPattern.NPM_UNSCOPED

        # GATE 6: Unknown pattern
        return ImportPattern.UNKNOWN

    def get_pattern_metadata(self, pattern: ImportPattern) -> Dict[str, any]:
        """
        [κ] Get metadata about pattern type

        Args:
            pattern: ImportPattern enum value

        Returns:
            Dictionary with pattern metadata
        """
        metadata = {
            ImportPattern.NPM_SCOPED: {
                "description": "NPM scoped package",
                "action_hint": "Check package.json or install",
                "fixable": True,
                "confidence": 0.9
            },
            ImportPattern.NPM_UNSCOPED: {
                "description": "NPM unscoped package",
                "action_hint": "Check package.json or install",
                "fixable": True,
                "confidence": 0.85
            },
            ImportPattern.VERSION_TAGGED: {
                "description": "Version-tagged import (invalid syntax)",
                "action_hint": "Remove version tag",
                "fixable": True,
                "confidence": 1.0
            },
            ImportPattern.RELATIVE_UI: {
                "description": "Relative UI component import",
                "action_hint": "Convert to @/components/ui/",
                "fixable": True,
                "confidence": 0.95
            },
            ImportPattern.RELATIVE_LOCAL: {
                "description": "Relative local file import",
                "action_hint": "Resolve or create stub",
                "fixable": True,
                "confidence": 0.7
            },
            ImportPattern.RELATIVE_LIB: {
                "description": "Relative lib import",
                "action_hint": "Convert to @/lib/",
                "fixable": True,
                "confidence": 0.9
            },
            ImportPattern.RELATIVE_HOOKS: {
                "description": "Relative hooks import",
                "action_hint": "Convert to @/hooks/",
                "fixable": True,
                "confidence": 0.9
            },
            ImportPattern.ABSOLUTE_ALIAS: {
                "description": "Absolute alias import (correct)",
                "action_hint": "Verify file exists",
                "fixable": True,
                "confidence": 0.8
            },
            ImportPattern.ABSOLUTE_NO_PREFIX: {
                "description": "Absolute path without @/ prefix",
                "action_hint": "Add @/ prefix",
                "fixable": True,
                "confidence": 0.95
            },
            ImportPattern.UNKNOWN: {
                "description": "Unknown import pattern",
                "action_hint": "Manual review required",
                "fixable": False,
                "confidence": 0.0
            }
        }

        return metadata.get(pattern, metadata[ImportPattern.UNKNOWN])

    def explain_classification(self, module: str) -> Dict[str, any]:
        """
        [σ] Explain why a module was classified a certain way

        Args:
            module: Import module string

        Returns:
            Dictionary with classification and reasoning
        """
        pattern = self.classify(module)
        metadata = self.get_pattern_metadata(pattern)

        return {
            "module": module,
            "pattern": pattern.value,
            "pattern_name": pattern.name,
            "description": metadata["description"],
            "action_hint": metadata["action_hint"],
            "fixable": metadata["fixable"],
            "confidence": metadata["confidence"]
        }
