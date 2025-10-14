"""
[σ] Semantic: Module Not Found Error Fixer
[ρ] Resilience: Validates fixes don't break other imports
[κ] Knowledge: Next.js/Webpack module resolution

Fixes:
- Module not found errors
- Missing npm dependencies
- Incorrect import paths
- Module name typos
- Missing file extensions
"""

import re
import subprocess
from pathlib import Path
from typing import List, Dict, Optional, Tuple
import json
from difflib import get_close_matches


class ModuleNotFoundFixer:
    """
    [σ] Semantic: Resolves module not found errors
    [ρ] Resilience: Multiple fallback strategies
    [κ] Knowledge: npm registry, Next.js aliases, import resolution
    """

    def __init__(self, project_root: Path, package_manager):
        self.project_root = project_root
        self.package_manager = package_manager
        self.package_json = self._load_package_json()
        self.tsconfig = self._load_tsconfig()

        # Cache of installed modules
        self.node_modules = self._scan_node_modules()

        # Common module aliases
        self.aliases = self._extract_aliases()

    def _load_package_json(self) -> Dict:
        """[κ] Load and parse package.json"""
        package_json_path = self.project_root / "package.json"

        if not package_json_path.exists():
            return {}

        try:
            with open(package_json_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"[ModuleNotFound] WARNING: Failed to load package.json: {e}")
            return {}

    def _load_tsconfig(self) -> Dict:
        """[κ] Load and parse tsconfig.json for path aliases"""
        tsconfig_path = self.project_root / "tsconfig.json"

        if not tsconfig_path.exists():
            return {}

        try:
            # Read tsconfig (may have comments)
            with open(tsconfig_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Remove comments (simple approach)
            content = re.sub(r'//.*$', '', content, flags=re.MULTILINE)
            content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)

            return json.loads(content)
        except Exception as e:
            print(f"[ModuleNotFound] WARNING: Failed to load tsconfig.json: {e}")
            return {}

    def _scan_node_modules(self) -> List[str]:
        """[κ] Scan node_modules directory for installed packages"""
        node_modules_path = self.project_root / "node_modules"

        if not node_modules_path.exists():
            return []

        modules = []

        try:
            # Get top-level packages
            for item in node_modules_path.iterdir():
                if item.is_dir() and not item.name.startswith('.'):
                    if item.name.startswith('@'):
                        # Scoped package
                        for scoped_item in item.iterdir():
                            if scoped_item.is_dir():
                                modules.append(f"{item.name}/{scoped_item.name}")
                    else:
                        modules.append(item.name)

        except Exception as e:
            print(f"[ModuleNotFound] WARNING: Failed to scan node_modules: {e}")

        return modules

    def _extract_aliases(self) -> Dict[str, str]:
        """[κ] Extract path aliases from tsconfig"""
        aliases = {}

        if 'compilerOptions' in self.tsconfig:
            paths = self.tsconfig['compilerOptions'].get('paths', {})

            for alias, targets in paths.items():
                # Remove wildcard
                clean_alias = alias.rstrip('/*')
                clean_target = targets[0].rstrip('/*') if targets else ''

                aliases[clean_alias] = clean_target

        return aliases

    def fix_errors(self, errors: List[Dict]) -> int:
        """
        [ρ] Resilience: Fix module not found errors with multiple strategies
        [σ] Semantic: Tries intelligent fixes before falling back to installation

        Returns:
            int: Number of errors fixed
        """
        fixed_count = 0

        for error in errors:
            module = error.get('module', '')
            file = error.get('file', '')

            if not module:
                continue

            print(f"[ModuleNotFound] Attempting to fix: {module}")

            # Strategy 1: Check if it's a typo
            if self._fix_module_typo(file, module):
                print(f"[ModuleNotFound]   -> Fixed typo in module name")
                fixed_count += 1
                continue

            # Strategy 2: Check if module exists but path is wrong
            if self._fix_import_path(file, module):
                print(f"[ModuleNotFound]   -> Fixed import path")
                fixed_count += 1
                continue

            # Strategy 3: Check if it's a missing file extension
            if self._add_file_extension(file, module):
                print(f"[ModuleNotFound]   -> Added missing file extension")
                fixed_count += 1
                continue

            # Strategy 4: Check if it's an alias issue
            if self._fix_alias_path(file, module):
                print(f"[ModuleNotFound]   -> Fixed path alias")
                fixed_count += 1
                continue

            # Strategy 5: Check if it's a missing npm dependency
            if self._is_npm_package(module):
                if self._install_missing_dependency(module):
                    print(f"[ModuleNotFound]   -> Installed missing dependency")
                    fixed_count += 1
                    continue

            # Strategy 6: Check if it's a relative path issue
            if self._fix_relative_path(file, module):
                print(f"[ModuleNotFound]   -> Fixed relative path")
                fixed_count += 1
                continue

            print(f"[ModuleNotFound]   -> Could not auto-fix (manual intervention required)")

        return fixed_count

    def _is_npm_package(self, module: str) -> bool:
        """
        [κ] Knowledge: Determine if module is an npm package
        """
        # Check if it's a relative or absolute path
        if module.startswith('.') or module.startswith('/'):
            return False

        # Check if it's an alias
        for alias in self.aliases:
            if module.startswith(alias):
                return False

        # It's likely an npm package
        return True

    def _module_exists_in_node_modules(self, module: str) -> bool:
        """
        [κ] Knowledge: Check if module is installed in node_modules
        """
        # Extract package name (remove sub-paths)
        if module.startswith('@'):
            # Scoped package: @scope/package
            parts = module.split('/')
            if len(parts) >= 2:
                package_name = f"{parts[0]}/{parts[1]}"
            else:
                package_name = module
        else:
            # Regular package
            package_name = module.split('/')[0]

        return package_name in self.node_modules

    def _install_missing_dependency(self, module: str) -> bool:
        """
        [κ] Knowledge: Install missing npm dependency
        [ρ] Resilience: Validates before installation
        """
        print(f"[ModuleNotFound] Checking npm registry for: {module}")

        # Extract package name
        if module.startswith('@'):
            parts = module.split('/')
            package_name = f"{parts[0]}/{parts[1]}" if len(parts) >= 2 else module
        else:
            package_name = module.split('/')[0]

        # Get latest version
        version = self.package_manager.get_latest_version(package_name)

        if not version:
            print(f"[ModuleNotFound]   -> Package not found in npm registry")
            return False

        print(f"[ModuleNotFound] Installing {package_name}@{version}")

        # Check compatibility
        if not self.package_manager.check_compatibility(package_name, version):
            print(f"[ModuleNotFound]   -> Compatibility issues detected (skipping)")
            return False

        # Install package
        success = self.package_manager.install_package(package_name, version)

        if success:
            # Update cache
            self.node_modules.append(package_name)

        return success

    def _fix_module_typo(self, file: str, module: str) -> bool:
        """
        [κ] Knowledge: Fix common typos in module names
        [σ] Semantic: Fuzzy match against known modules
        """
        if not file or not self.project_root:
            return False

        # Get similar module names
        similar = self._find_similar_module(module)

        if not similar:
            return False

        # Read file
        file_path = self._resolve_file_path(file)
        if not file_path or not file_path.exists():
            return False

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Replace module name
            # Match: import ... from 'module' or import ... from "module"
            patterns = [
                (f"from ['\"]({re.escape(module)})['\"]", f"from '{similar}'"),
                (f"require\\(['\"]({re.escape(module)})['\"]\\)", f"require('{similar}')"),
                (f"import\\(['\"]({re.escape(module)})['\"]\\)", f"import('{similar}')")
            ]

            modified = False
            for pattern, replacement in patterns:
                if re.search(pattern, content):
                    content = re.sub(pattern, replacement, content)
                    modified = True

            if modified:
                # Write back
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)

                print(f"[ModuleNotFound]   Replaced '{module}' with '{similar}' in {file_path.name}")
                return True

        except Exception as e:
            print(f"[ModuleNotFound] ERROR fixing typo: {e}")

        return False

    def _find_similar_module(self, module: str) -> Optional[str]:
        """
        [κ] Knowledge: Find similar module names using fuzzy matching
        """
        # Combine installed modules and common Next.js modules
        candidates = self.node_modules + [
            'next',
            'react',
            'react-dom',
            '@/components',
            '@/lib',
            '@/types',
            '@/utils'
        ]

        # Find close matches
        matches = get_close_matches(module, candidates, n=1, cutoff=0.7)

        return matches[0] if matches else None

    def _fix_import_path(self, file: str, module: str) -> bool:
        """
        [κ] Knowledge: Fix incorrect import paths
        """
        # Check if module is a local file that exists with different path
        if module.startswith('.'):
            return self._fix_relative_path(file, module)

        # Check if it's an alias that needs adjustment
        return self._fix_alias_path(file, module)

    def _add_file_extension(self, file: str, module: str) -> bool:
        """
        [κ] Knowledge: Add missing file extensions (.ts, .tsx, .js, .jsx)
        """
        if not module.startswith('.'):
            return False

        file_path = self._resolve_file_path(file)
        if not file_path:
            return False

        # Calculate absolute path to module
        module_dir = file_path.parent
        module_path = (module_dir / module).resolve()

        # Try common extensions
        extensions = ['.ts', '.tsx', '.js', '.jsx', '.json']

        for ext in extensions:
            test_path = Path(str(module_path) + ext)
            if test_path.exists():
                # Add extension to import
                return self._update_import_in_file(file_path, module, module + ext)

        return False

    def _fix_alias_path(self, file: str, module: str) -> bool:
        """
        [κ] Knowledge: Fix path alias issues
        """
        # Check if module uses an alias
        for alias, target in self.aliases.items():
            if module.startswith(alias):
                # Alias is correctly used
                return False

        # Check if it should use an alias
        # Example: './components/Button' -> '@/components/Button'
        if module.startswith('./') or module.startswith('../'):
            file_path = self._resolve_file_path(file)
            if not file_path:
                return False

            # Try to convert to alias
            for alias, target in self.aliases.items():
                target_path = self.project_root / target

                # Calculate absolute module path
                module_abs = (file_path.parent / module).resolve()

                # Check if module is under alias target
                try:
                    relative = module_abs.relative_to(target_path)
                    new_import = f"{alias}/{relative}".replace('\\', '/')

                    # Update import
                    return self._update_import_in_file(file_path, module, new_import)
                except ValueError:
                    continue

        return False

    def _fix_relative_path(self, file: str, module: str) -> bool:
        """
        [κ] Knowledge: Fix incorrect relative paths
        """
        file_path = self._resolve_file_path(file)
        if not file_path:
            return False

        # Current import target
        current_target = (file_path.parent / module).resolve()

        # Search for the file
        module_name = Path(module).name

        # Search in common directories
        search_dirs = [
            self.project_root / 'src',
            self.project_root / 'components',
            self.project_root / 'lib',
            self.project_root / 'utils',
            self.project_root / 'types'
        ]

        for search_dir in search_dirs:
            if not search_dir.exists():
                continue

            # Search for matching files
            for match in search_dir.rglob(f"{module_name}*"):
                if match.is_file():
                    # Calculate correct relative path
                    try:
                        correct_relative = match.relative_to(file_path.parent)
                        correct_import = './' + str(correct_relative).replace('\\', '/')

                        # Remove extension if present
                        correct_import = re.sub(r'\.(tsx?|jsx?)$', '', correct_import)

                        # Update import
                        return self._update_import_in_file(file_path, module, correct_import)
                    except ValueError:
                        continue

        return False

    def _update_import_in_file(self, file_path: Path, old_import: str, new_import: str) -> bool:
        """
        [ρ] Resilience: Update import statement in file
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Replace import
            patterns = [
                (f"from ['\"]({re.escape(old_import)})['\"]", f"from '{new_import}'"),
                (f"require\\(['\"]({re.escape(old_import)})['\"]\\)", f"require('{new_import}')"),
                (f"import\\(['\"]({re.escape(old_import)})['\"]\\)", f"import('{new_import}')")
            ]

            modified = False
            for pattern, replacement in patterns:
                if re.search(pattern, content):
                    content = re.sub(pattern, replacement, content)
                    modified = True

            if modified:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                return True

        except Exception as e:
            print(f"[ModuleNotFound] ERROR updating import: {e}")

        return False

    def _resolve_file_path(self, file: str) -> Optional[Path]:
        """
        [κ] Knowledge: Resolve file path to absolute Path
        """
        if not file:
            return None

        # Handle absolute paths
        if Path(file).is_absolute():
            path = Path(file)
        else:
            # Relative to project root
            path = self.project_root / file

        return path if path.exists() else None
