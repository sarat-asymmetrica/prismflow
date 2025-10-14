"""
Asymmetrica TypeScript Doctor - Intent Inference
Chain-of-thought module for inferring developer intent

[σ] Semantic Layer: Understand what developer meant to import
[ρ] Resilience: Handle ambiguous cases with confidence scoring
[κ] Knowledge: Use filesystem, package.json, and patterns
"""

import json
from pathlib import Path
from typing import Dict, Optional, List
from pattern_classifier import ImportPattern, PatternClassifier


class IntentInference:
    """
    [σ] Infer developer intent from import patterns

    Given a broken import, determine:
    1. What the developer intended to import
    2. What the correct path should be
    3. What action should be taken
    4. Confidence level (0.0 - 1.0)
    """

    def __init__(self, project_root: Path, context_analyzer):
        self.project_root = project_root
        self.context = context_analyzer
        self.classifier = PatternClassifier()
        self.package_json_path = project_root / "package.json"

        # Cache package.json data
        self._package_data: Optional[Dict] = None
        self._load_package_json()

    def _load_package_json(self):
        """[ρ] Load and cache package.json"""
        if self.package_json_path.exists():
            try:
                with open(self.package_json_path, "r", encoding="utf-8") as f:
                    self._package_data = json.load(f)
            except Exception as e:
                print(f"[IntentInference] WARNING: Could not load package.json: {e}")
                self._package_data = {}
        else:
            self._package_data = {}

    def infer(self, module: str, file_path: str) -> Dict[str, any]:
        """
        [σ] Main intent inference logic chain

        Args:
            module: Import module string
            file_path: File trying to import the module

        Returns:
            Dictionary with intent analysis
        """
        # Step 1: Classify pattern
        pattern = self.classifier.classify(module)

        # Step 2: Build initial intent structure
        intent = {
            "module": module,
            "file_path": file_path,
            "pattern": pattern.value,
            "action": None,
            "corrected_path": None,
            "confidence": 0.0,
            "reasoning": [],
            "metadata": {}
        }

        # Step 3: Pattern-specific intent inference
        if pattern == ImportPattern.VERSION_TAGGED:
            intent.update(self._infer_version_tagged(module))

        elif pattern == ImportPattern.NPM_SCOPED:
            intent.update(self._infer_npm_scoped(module))

        elif pattern == ImportPattern.NPM_UNSCOPED:
            intent.update(self._infer_npm_unscoped(module))

        elif pattern == ImportPattern.RELATIVE_UI:
            intent.update(self._infer_relative_ui(module, file_path))

        elif pattern == ImportPattern.RELATIVE_LIB:
            intent.update(self._infer_relative_lib(module, file_path))

        elif pattern == ImportPattern.RELATIVE_HOOKS:
            intent.update(self._infer_relative_hooks(module, file_path))

        elif pattern == ImportPattern.RELATIVE_LOCAL:
            intent.update(self._infer_relative_local(module, file_path))

        elif pattern == ImportPattern.ABSOLUTE_ALIAS:
            intent.update(self._infer_absolute_alias(module, file_path))

        elif pattern == ImportPattern.ABSOLUTE_NO_PREFIX:
            intent.update(self._infer_absolute_no_prefix(module))

        else:
            intent.update({
                "action": "SKIP",
                "confidence": 0.0,
                "reasoning": ["Unknown pattern - cannot infer intent"]
            })

        return intent

    def _infer_version_tagged(self, module: str) -> Dict:
        """[κ] Infer intent for version-tagged imports (e.g., sonner@2.0.3)"""
        # Remove version tag
        base_module = module.split('@')[0]

        return {
            "action": "FIX_PATH",
            "corrected_path": base_module,
            "confidence": 1.0,
            "reasoning": [
                "Version tags are invalid in import statements",
                f"Remove version tag: {module} → {base_module}"
            ]
        }

    def _infer_npm_scoped(self, module: str) -> Dict:
        """[κ] Infer intent for scoped NPM packages (e.g., @radix-ui/react-dialog)"""
        # Check if package exists in package.json
        if self._package_data:
            all_deps = {
                **self._package_data.get("dependencies", {}),
                **self._package_data.get("devDependencies", {})
            }

            # Check exact match
            if module in all_deps:
                return {
                    "action": "ALREADY_DECLARED",
                    "confidence": 0.9,
                    "reasoning": [
                        f"Package '{module}' exists in package.json",
                        "Should work after 'npm install'",
                        "May need to restart TypeScript server"
                    ]
                }

            # Check if base package exists (e.g., @radix-ui/react-dialog vs @radix-ui/react-*)
            base_scope = module.split('/')[0]  # @radix-ui
            matching_packages = [pkg for pkg in all_deps if pkg.startswith(base_scope)]

            if matching_packages:
                return {
                    "action": "CHECK_SUBPACKAGE",
                    "confidence": 0.7,
                    "reasoning": [
                        f"Related packages found: {', '.join(matching_packages)}",
                        f"Verify '{module}' is exported by base package",
                        "Or add to package.json if separate package"
                    ],
                    "metadata": {"related_packages": matching_packages}
                }

        # Package not in dependencies
        return {
            "action": "NEEDS_INSTALL",
            "confidence": 0.8,
            "reasoning": [
                f"Package '{module}' not found in package.json",
                "Add to package.json and run 'npm install'"
            ]
        }

    def _infer_npm_unscoped(self, module: str) -> Dict:
        """[κ] Infer intent for unscoped NPM packages (e.g., canvas-confetti)"""
        if self._package_data:
            all_deps = {
                **self._package_data.get("dependencies", {}),
                **self._package_data.get("devDependencies", {})
            }

            if module in all_deps:
                return {
                    "action": "ALREADY_DECLARED",
                    "confidence": 0.9,
                    "reasoning": [
                        f"Package '{module}' exists in package.json",
                        "Should work after 'npm install'"
                    ]
                }

        return {
            "action": "NEEDS_INSTALL",
            "confidence": 0.8,
            "reasoning": [
                f"Package '{module}' not found in package.json",
                "Add to package.json and run 'npm install'"
            ]
        }

    def _infer_relative_ui(self, module: str, file_path: str) -> Dict:
        """[κ] Infer intent for relative UI imports (e.g., ../ui/button)"""
        # Extract component name
        # ../ui/button → button
        # ./ui/button → button
        # ../../ui/button → button
        if '/ui/' in module:
            component = module.split('/ui/', 1)[1]
        elif module.endswith('/ui'):
            component = None  # Importing the index
        else:
            component = module.split('/')[-1]

        # Construct correct path
        if component:
            corrected = f"@/components/ui/{component}"
        else:
            corrected = "@/components/ui"

        # Check if file exists
        if component:
            potential_paths = [
                self.project_root / "src" / "components" / "ui" / f"{component}.tsx",
                self.project_root / "src" / "components" / "ui" / f"{component}.ts",
                self.project_root / "src" / "components" / "ui" / component / "index.tsx",
                self.project_root / "src" / "components" / "ui" / component / "index.ts",
            ]

            for path in potential_paths:
                if path.exists():
                    return {
                        "action": "FIX_PATH",
                        "corrected_path": corrected,
                        "confidence": 1.0,
                        "reasoning": [
                            f"UI component '{component}' exists at {path}",
                            f"Convert relative import to absolute: {module} → {corrected}"
                        ]
                    }

        # File doesn't exist
        return {
            "action": "FILE_MISSING",
            "corrected_path": corrected,
            "confidence": 0.6,
            "reasoning": [
                f"UI component '{component}' not found in src/components/ui/",
                "May need to create stub or component is misnamed"
            ]
        }

    def _infer_relative_lib(self, module: str, file_path: str) -> Dict:
        """[κ] Infer intent for relative lib imports (e.g., ../../lib/deliveryData)"""
        # Extract lib path
        lib_path = module.split('/lib/', 1)[1] if '/lib/' in module else module.split('/')[-1]
        corrected = f"@/lib/{lib_path}"

        # Check if file exists
        potential_paths = [
            self.project_root / "src" / "lib" / f"{lib_path}.ts",
            self.project_root / "src" / "lib" / f"{lib_path}.tsx",
            self.project_root / "src" / "lib" / lib_path / "index.ts",
            self.project_root / "lib" / f"{lib_path}.ts",  # Check root lib too
        ]

        for path in potential_paths:
            if path.exists():
                return {
                    "action": "FIX_PATH",
                    "corrected_path": corrected,
                    "confidence": 1.0,
                    "reasoning": [
                        f"Lib module '{lib_path}' exists at {path}",
                        f"Convert relative import to absolute: {module} → {corrected}"
                    ]
                }

        return {
            "action": "FILE_MISSING",
            "corrected_path": corrected,
            "confidence": 0.5,
            "reasoning": [
                f"Lib module '{lib_path}' not found",
                "May need to create stub or check if path is correct"
            ]
        }

    def _infer_relative_hooks(self, module: str, file_path: str) -> Dict:
        """[κ] Infer intent for relative hooks imports (e.g., ../../hooks/useMetrics)"""
        # Extract hook name
        hook_path = module.split('/hooks/', 1)[1] if '/hooks/' in module else module.split('/')[-1]
        corrected = f"@/hooks/{hook_path}"

        # Check if file exists
        potential_paths = [
            self.project_root / "src" / "hooks" / f"{hook_path}.ts",
            self.project_root / "src" / "hooks" / f"{hook_path}.tsx",
        ]

        for path in potential_paths:
            if path.exists():
                return {
                    "action": "FIX_PATH",
                    "corrected_path": corrected,
                    "confidence": 1.0,
                    "reasoning": [
                        f"Hook '{hook_path}' exists at {path}",
                        f"Convert relative import to absolute: {module} → {corrected}"
                    ]
                }

        return {
            "action": "FILE_MISSING",
            "corrected_path": corrected,
            "confidence": 0.5,
            "reasoning": [
                f"Hook '{hook_path}' not found in src/hooks/",
                "May need to create stub"
            ]
        }

    def _infer_relative_local(self, module: str, file_path: str) -> Dict:
        """[κ] Infer intent for relative local imports (e.g., ./components/MetricCard)"""
        # These are files local to the component directory
        # Usually these don't exist (deleted during refactoring)

        # Try to resolve the path relative to current file
        current_dir = Path(file_path).parent
        clean_module = module.lstrip('./')

        # Check if it's a component-local file that should exist
        if any(x in clean_module for x in ['components/', 'utils/', 'types/']):
            return {
                "action": "DELETE_IMPORT",
                "confidence": 0.8,
                "reasoning": [
                    f"Local file '{module}' appears to be refactored/deleted",
                    "Component-local files are uncommon in AsymmFlow",
                    "Consider deleting import or checking if moved to src/"
                ]
            }

        return {
            "action": "FILE_MISSING",
            "confidence": 0.6,
            "reasoning": [
                f"Local file '{module}' not found",
                "May have been moved or deleted during refactoring"
            ]
        }

    def _infer_absolute_alias(self, module: str, file_path: str) -> Dict:
        """[κ] Infer intent for absolute alias imports (e.g., @/lib/utils)"""
        # This is the correct format - just verify file exists

        # Convert @/ to src/
        relative_path = module[2:]  # Remove @/

        potential_paths = [
            self.project_root / "src" / f"{relative_path}.ts",
            self.project_root / "src" / f"{relative_path}.tsx",
            self.project_root / "src" / relative_path / "index.ts",
            self.project_root / "src" / relative_path / "index.tsx",
        ]

        for path in potential_paths:
            if path.exists():
                return {
                    "action": "ALREADY_CORRECT",
                    "confidence": 1.0,
                    "reasoning": [
                        f"File exists at {path}",
                        "Import path is correct - may be TypeScript config issue"
                    ]
                }

        return {
            "action": "FILE_MISSING",
            "confidence": 0.7,
            "reasoning": [
                f"File '{module}' not found in src/",
                "Either file is missing or path is incorrect"
            ]
        }

    def _infer_absolute_no_prefix(self, module: str) -> Dict:
        """[κ] Infer intent for absolute paths without @/ prefix"""
        corrected = f"@/{module}"

        return {
            "action": "FIX_PATH",
            "corrected_path": corrected,
            "confidence": 0.95,
            "reasoning": [
                "Absolute imports should use @/ prefix",
                f"Convert: {module} → {corrected}"
            ]
        }
