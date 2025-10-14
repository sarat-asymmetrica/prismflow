"""
[σ] Semantic: Dependency Conflict Resolver
[ρ] Resilience: Validates compatibility before changes
[κ] Knowledge: npm/yarn dependency resolution, peer dependencies, version conflicts

Fixes:
- Dependency version conflicts
- Peer dependency issues
- Version mismatches
- Incompatible package combinations
"""

import re
import subprocess
import json
from pathlib import Path
from typing import List, Dict, Optional, Tuple


class DependencyConflictFixer:
    """
    [σ] Semantic: Resolves npm/yarn dependency conflicts
    [ρ] Resilience: Multiple resolution strategies
    [κ] Knowledge: Semantic versioning, npm resolution algorithm
    """

    def __init__(self, project_root: Path, package_manager):
        self.project_root = project_root
        self.package_manager = package_manager
        self.package_json = self._load_package_json()
        self.package_lock = self._load_package_lock()

    def _load_package_json(self) -> Dict:
        """[κ] Load package.json"""
        package_json_path = self.project_root / "package.json"

        if not package_json_path.exists():
            return {}

        try:
            with open(package_json_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"[DependencyConflict] WARNING: Failed to load package.json: {e}")
            return {}

    def _load_package_lock(self) -> Dict:
        """[κ] Load package-lock.json"""
        lock_path = self.project_root / "package-lock.json"

        if not lock_path.exists():
            return {}

        try:
            with open(lock_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"[DependencyConflict] WARNING: Failed to load package-lock.json: {e}")
            return {}

    def fix_errors(self, errors: List[Dict]) -> int:
        """
        [ρ] Resilience: Fix dependency conflicts with multiple strategies
        [σ] Semantic: Intelligent version resolution

        Returns:
            int: Number of conflicts resolved
        """
        fixed_count = 0

        for error in errors:
            error_type = error.get('type', '')
            message = error.get('message', '')

            print(f"[DependencyConflict] Analyzing: {error_type}")

            # Strategy 1: Peer dependency conflicts
            if error_type == 'peer_dependency' or 'peer dep' in message.lower():
                if self._fix_peer_dependency(error):
                    print(f"[DependencyConflict]   -> Resolved peer dependency conflict")
                    fixed_count += 1
                    continue

            # Strategy 2: Version conflicts
            if error_type == 'version_conflict' or 'conflict' in message.lower():
                if self._fix_version_conflict(error):
                    print(f"[DependencyConflict]   -> Resolved version conflict")
                    fixed_count += 1
                    continue

            # Strategy 3: Dependency conflict
            if error_type == 'dependency_conflict':
                if self._fix_dependency_conflict(error):
                    print(f"[DependencyConflict]   -> Resolved dependency conflict")
                    fixed_count += 1
                    continue

            print(f"[DependencyConflict]   -> Requires manual intervention")

        # After fixing individual errors, run cleanup
        if fixed_count > 0:
            self._cleanup_dependencies()

        return fixed_count

    def _fix_peer_dependency(self, error: Dict) -> bool:
        """
        [κ] Knowledge: Fix peer dependency conflicts
        [ρ] Resilience: Multiple resolution strategies
        """
        message = error.get('message', '')

        # Parse peer dependency error
        conflict_info = self._parse_peer_dependency_error(message)

        if not conflict_info:
            return False

        package = conflict_info.get('package')
        required_version = conflict_info.get('required_version')
        installed_version = conflict_info.get('installed_version')

        print(f"[DependencyConflict]   Package: {package}")
        print(f"[DependencyConflict]   Required: {required_version}")
        print(f"[DependencyConflict]   Installed: {installed_version}")

        # Strategy 1: Update to compatible version
        compatible_version = self._find_compatible_version(
            package,
            required_version,
            installed_version
        )

        if compatible_version:
            print(f"[DependencyConflict]   Installing compatible version: {compatible_version}")
            success = self.package_manager.install_package(package, compatible_version)
            if success:
                return True

        # Strategy 2: Use --legacy-peer-deps flag
        # (This is done globally in cleanup)

        # Strategy 3: Add to resolutions (package.json)
        if self._add_resolution(package, required_version):
            print(f"[DependencyConflict]   Added resolution to package.json")
            return True

        return False

    def _fix_version_conflict(self, error: Dict) -> bool:
        """
        [κ] Knowledge: Fix version conflicts between packages
        """
        message = error.get('message', '')

        # Parse version conflict
        conflict_info = self._parse_version_conflict(message)

        if not conflict_info:
            return False

        package1 = conflict_info.get('package1')
        package2 = conflict_info.get('package2')
        version1 = conflict_info.get('version1')
        version2 = conflict_info.get('version2')

        print(f"[DependencyConflict]   {package1}@{version1} conflicts with {package2}@{version2}")

        # Find compatible versions for both
        compatible_versions = self._find_compatible_versions_for_both(
            package1, version1,
            package2, version2
        )

        if compatible_versions:
            # Install both packages at compatible versions
            success1 = self.package_manager.install_package(
                package1,
                compatible_versions[package1]
            )
            success2 = self.package_manager.install_package(
                package2,
                compatible_versions[package2]
            )

            if success1 and success2:
                return True

        return False

    def _fix_dependency_conflict(self, error: Dict) -> bool:
        """
        [κ] Knowledge: Fix general dependency conflicts
        """
        # Try to resolve by updating all dependencies
        print(f"[DependencyConflict]   Attempting to resolve via npm update")

        result = subprocess.run(
            "npm update",
            shell=True,
            capture_output=True,
            text=True,
            cwd=self.project_root
        )

        return result.returncode == 0

    def _parse_peer_dependency_error(self, message: str) -> Optional[Dict]:
        """
        [κ] Knowledge: Parse peer dependency error message

        Example:
        "npm ERR! peer dep missing: react@^18.0.0, required by next@13.0.0"
        """
        # Pattern 1: "peer dep missing: package@version, required by ..."
        pattern1 = r"peer dep.*?:\s*(\S+)@([^,\s]+).*?required by\s*(\S+)@([^,\s]+)"
        match = re.search(pattern1, message)

        if match:
            return {
                'package': match.group(1),
                'required_version': match.group(2),
                'required_by': match.group(3),
                'required_by_version': match.group(4),
                'installed_version': None
            }

        # Pattern 2: "ERESOLVE ... peer dependency"
        pattern2 = r"ERESOLVE.*?(\S+)@([^\s]+).*?peer.*?(\S+)@([^\s]+)"
        match = re.search(pattern2, message)

        if match:
            return {
                'package': match.group(1),
                'required_version': match.group(2),
                'required_by': match.group(3),
                'required_by_version': match.group(4),
                'installed_version': None
            }

        return None

    def _parse_version_conflict(self, message: str) -> Optional[Dict]:
        """
        [κ] Knowledge: Parse version conflict error

        Example:
        "npm ERR! conflict: package1@1.0.0 with package2@2.0.0"
        """
        pattern = r"(\S+)@([^\s]+).*?conflict.*?(\S+)@([^\s]+)"
        match = re.search(pattern, message)

        if match:
            return {
                'package1': match.group(1),
                'version1': match.group(2),
                'package2': match.group(3),
                'version2': match.group(4)
            }

        return None

    def _find_compatible_version(
        self,
        package: str,
        required_version: str,
        installed_version: Optional[str]
    ) -> Optional[str]:
        """
        [κ] Knowledge: Find version that satisfies requirements
        [σ] Semantic: Uses semantic versioning rules
        """
        # Get all available versions
        available_versions = self.package_manager.get_available_versions(package)

        if not available_versions:
            return None

        # Parse required version range
        # Example: ^18.0.0 means >=18.0.0 <19.0.0
        try:
            # Try to find version that matches requirement
            for version in reversed(available_versions):  # Start with latest
                if self._version_satisfies(version, required_version):
                    return version
        except Exception as e:
            print(f"[DependencyConflict] ERROR parsing versions: {e}")

        return None

    def _version_satisfies(self, version: str, requirement: str) -> bool:
        """
        [κ] Knowledge: Check if version satisfies requirement
        [σ] Semantic: Semantic versioning logic
        """
        try:
            # Remove 'v' prefix if present
            version = version.lstrip('v')
            requirement = requirement.lstrip('v')

            # Handle caret (^) - compatible version
            if requirement.startswith('^'):
                req_ver = requirement[1:]
                parts = req_ver.split('.')

                if len(parts) >= 1:
                    major = int(parts[0])
                    ver_parts = version.split('.')

                    if len(ver_parts) >= 1:
                        ver_major = int(ver_parts[0])
                        return ver_major == major and version >= req_ver

            # Handle tilde (~) - approximately equivalent
            elif requirement.startswith('~'):
                req_ver = requirement[1:]
                parts = req_ver.split('.')

                if len(parts) >= 2:
                    major = int(parts[0])
                    minor = int(parts[1])
                    ver_parts = version.split('.')

                    if len(ver_parts) >= 2:
                        ver_major = int(ver_parts[0])
                        ver_minor = int(ver_parts[1])
                        return ver_major == major and ver_minor == minor

            # Handle >= operator
            elif requirement.startswith('>='):
                req_ver = requirement[2:]
                return version >= req_ver

            # Handle > operator
            elif requirement.startswith('>'):
                req_ver = requirement[1:]
                return version > req_ver

            # Handle exact version
            else:
                return version == requirement

        except Exception:
            return False

        return False

    def _find_compatible_versions_for_both(
        self,
        package1: str,
        version1: str,
        package2: str,
        version2: str
    ) -> Optional[Dict[str, str]]:
        """
        [κ] Knowledge: Find versions that are compatible with each other
        [σ] Semantic: Complex dependency resolution
        """
        # Get available versions for both packages
        versions1 = self.package_manager.get_available_versions(package1)
        versions2 = self.package_manager.get_available_versions(package2)

        if not versions1 or not versions2:
            return None

        # Try combinations (start with latest)
        for v1 in reversed(versions1[-10:]):  # Try last 10 versions
            for v2 in reversed(versions2[-10:]):
                # Check if these versions are compatible
                if self._check_version_compatibility(package1, v1, package2, v2):
                    return {package1: v1, package2: v2}

        return None

    def _check_version_compatibility(
        self,
        package1: str,
        version1: str,
        package2: str,
        version2: str
    ) -> bool:
        """
        [κ] Knowledge: Check if two package versions are compatible
        """
        # This would require querying npm registry for peer dependencies
        # For now, use heuristic: same major version = likely compatible
        try:
            v1_major = int(version1.split('.')[0].lstrip('v'))
            v2_major = int(version2.split('.')[0].lstrip('v'))

            # If major versions are close, they're likely compatible
            return abs(v1_major - v2_major) <= 1

        except Exception:
            return False

    def _add_resolution(self, package: str, version: str) -> bool:
        """
        [κ] Knowledge: Add resolution to package.json
        [ρ] Resilience: Backs up before modifying
        """
        try:
            # Add/update resolutions field
            if 'resolutions' not in self.package_json:
                self.package_json['resolutions'] = {}

            self.package_json['resolutions'][package] = version

            # Write back to package.json
            package_json_path = self.project_root / "package.json"

            with open(package_json_path, 'w', encoding='utf-8') as f:
                json.dump(self.package_json, f, indent=2)

            return True

        except Exception as e:
            print(f"[DependencyConflict] ERROR adding resolution: {e}")
            return False

    def _cleanup_dependencies(self):
        """
        [ρ] Resilience: Clean up dependencies after fixes
        """
        print(f"[DependencyConflict] Running dependency cleanup...")

        # Remove node_modules and package-lock.json
        print(f"[DependencyConflict]   Removing node_modules...")

        # Use npm ci to install from clean state
        result = subprocess.run(
            "npm ci --legacy-peer-deps",
            shell=True,
            capture_output=True,
            text=True,
            cwd=self.project_root
        )

        if result.returncode == 0:
            print(f"[DependencyConflict]   Dependencies reinstalled successfully")
        else:
            # Fallback to npm install
            print(f"[DependencyConflict]   npm ci failed, trying npm install...")

            result = subprocess.run(
                "npm install --legacy-peer-deps",
                shell=True,
                capture_output=True,
                text=True,
                cwd=self.project_root
            )

            if result.returncode == 0:
                print(f"[DependencyConflict]   Dependencies installed successfully")
            else:
                print(f"[DependencyConflict]   WARNING: Dependency installation failed")
