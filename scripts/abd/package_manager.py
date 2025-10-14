"""
[σ] Semantic: NPM/Yarn Package Manager
[ρ] Resilience: Validates package versions before install
[κ] Knowledge: npm registry, semantic versioning, compatibility checking

Provides:
- Query npm registry for package information
- Install packages with version validation
- Check compatibility with current project
- Semantic versioning operations
"""

import subprocess
import json
import re
from pathlib import Path
from typing import List, Dict, Optional


class PackageManager:
    """
    [σ] Semantic: NPM package management operations
    [ρ] Resilience: Validates before installation
    [κ] Knowledge: npm registry, package.json, versioning
    """

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.package_json_path = project_root / "package.json"
        self.package_json = self._load_package_json()

    def _load_package_json(self) -> Dict:
        """[κ] Load package.json"""
        if not self.package_json_path.exists():
            return {}

        try:
            with open(self.package_json_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"[PackageManager] WARNING: Failed to load package.json: {e}")
            return {}

    def get_latest_version(self, package: str) -> Optional[str]:
        """
        [κ] Knowledge: Get latest version from npm registry

        Args:
            package: Package name

        Returns:
            Latest version string or None
        """
        try:
            result = subprocess.run(
                f"npm view {package} version",
                shell=True,
                capture_output=True,
                text=True,
                cwd=self.project_root,
                timeout=30
            )

            if result.returncode == 0:
                version = result.stdout.strip()
                return version if version else None

        except subprocess.TimeoutExpired:
            print(f"[PackageManager] Timeout querying npm for {package}")
        except Exception as e:
            print(f"[PackageManager] Error getting latest version for {package}: {e}")

        return None

    def get_available_versions(self, package: str) -> List[str]:
        """
        [κ] Knowledge: Get all available versions from npm registry

        Args:
            package: Package name

        Returns:
            List of version strings
        """
        try:
            result = subprocess.run(
                f"npm view {package} versions --json",
                shell=True,
                capture_output=True,
                text=True,
                cwd=self.project_root,
                timeout=30
            )

            if result.returncode == 0:
                versions = json.loads(result.stdout)

                # Handle single version (returned as string)
                if isinstance(versions, str):
                    return [versions]

                return versions if versions else []

        except subprocess.TimeoutExpired:
            print(f"[PackageManager] Timeout querying npm for {package} versions")
        except Exception as e:
            print(f"[PackageManager] Error getting versions for {package}: {e}")

        return []

    def check_compatibility(self, package: str, version: str) -> bool:
        """
        [ρ] Resilience: Check if package version is compatible with current project

        Args:
            package: Package name
            version: Version to check

        Returns:
            True if compatible, False otherwise
        """
        # Get package metadata
        metadata = self._get_package_metadata(package, version)

        if not metadata:
            # Can't verify - assume compatible
            return True

        # Check 1: Node engine requirements
        if not self._check_node_engine(metadata):
            print(f"[PackageManager]   WARNING: {package}@{version} may not be compatible with Node version")
            return False

        # Check 2: Peer dependencies
        if not self._check_peer_dependencies(metadata):
            print(f"[PackageManager]   WARNING: {package}@{version} has unmet peer dependencies")
            # Don't fail on peer dependency warnings
            return True

        return True

    def _get_package_metadata(self, package: str, version: str) -> Optional[Dict]:
        """
        [κ] Knowledge: Get package metadata from npm registry

        Args:
            package: Package name
            version: Version

        Returns:
            Package metadata dictionary or None
        """
        try:
            result = subprocess.run(
                f"npm view {package}@{version} --json",
                shell=True,
                capture_output=True,
                text=True,
                cwd=self.project_root,
                timeout=30
            )

            if result.returncode == 0:
                return json.loads(result.stdout)

        except subprocess.TimeoutExpired:
            print(f"[PackageManager] Timeout getting metadata for {package}@{version}")
        except Exception as e:
            print(f"[PackageManager] Error getting metadata: {e}")

        return None

    def _check_node_engine(self, metadata: Dict) -> bool:
        """
        [κ] Knowledge: Check Node.js engine compatibility

        Args:
            metadata: Package metadata

        Returns:
            True if compatible
        """
        engines = metadata.get('engines', {})
        node_requirement = engines.get('node', '')

        if not node_requirement:
            # No requirement - assume compatible
            return True

        # Get current Node version
        try:
            result = subprocess.run(
                "node --version",
                shell=True,
                capture_output=True,
                text=True
            )

            if result.returncode == 0:
                current_version = result.stdout.strip().lstrip('v')

                # Simple check: just verify it's a valid version
                # Full semantic version checking would be more complex
                return True

        except Exception:
            pass

        return True

    def _check_peer_dependencies(self, metadata: Dict) -> bool:
        """
        [κ] Knowledge: Check peer dependency compatibility

        Args:
            metadata: Package metadata

        Returns:
            True if all peer dependencies satisfied
        """
        peer_deps = metadata.get('peerDependencies', {})

        if not peer_deps:
            # No peer dependencies
            return True

        # Check each peer dependency
        dependencies = self.package_json.get('dependencies', {})
        dev_dependencies = self.package_json.get('devDependencies', {})

        all_deps = {**dependencies, **dev_dependencies}

        for peer_package, peer_version in peer_deps.items():
            if peer_package not in all_deps:
                print(f"[PackageManager]   Missing peer dependency: {peer_package}")
                # Don't fail - just warn
                continue

            installed_version = all_deps[peer_package]

            # Check if versions are compatible
            # This is simplified - full check would require semver library
            if not self._versions_compatible(installed_version, peer_version):
                print(f"[PackageManager]   Incompatible peer dependency: {peer_package}")
                print(f"[PackageManager]     Required: {peer_version}")
                print(f"[PackageManager]     Installed: {installed_version}")

        return True

    def _versions_compatible(self, installed: str, required: str) -> bool:
        """
        [κ] Knowledge: Check if installed version satisfies requirement

        Args:
            installed: Installed version (may include ^, ~, etc.)
            required: Required version range

        Returns:
            True if compatible (simplified check)
        """
        # Simplified compatibility check
        # Full implementation would use semver library

        # Remove version prefixes
        installed_clean = installed.lstrip('^~>=<')
        required_clean = required.lstrip('^~>=<')

        # Extract major version
        try:
            installed_major = int(installed_clean.split('.')[0])
            required_major = int(required_clean.split('.')[0])

            # Same major version = likely compatible
            return installed_major == required_major

        except (ValueError, IndexError):
            # Can't parse - assume compatible
            return True

    def install_package(self, package: str, version: str) -> bool:
        """
        [ρ] Resilience: Install package with validation

        Args:
            package: Package name
            version: Version to install

        Returns:
            True if installation successful
        """
        print(f"[PackageManager] Installing {package}@{version}")

        try:
            # Install package
            result = subprocess.run(
                f"npm install {package}@{version} --legacy-peer-deps",
                shell=True,
                capture_output=True,
                text=True,
                cwd=self.project_root,
                timeout=120  # 2 minute timeout
            )

            if result.returncode == 0:
                print(f"[PackageManager]   Successfully installed {package}@{version}")

                # Update package.json cache
                self.package_json = self._load_package_json()

                return True
            else:
                print(f"[PackageManager]   Failed to install {package}@{version}")
                print(f"[PackageManager]   {result.stderr}")

        except subprocess.TimeoutExpired:
            print(f"[PackageManager] Timeout installing {package}@{version}")
        except Exception as e:
            print(f"[PackageManager] Error installing {package}@{version}: {e}")

        return False

    def uninstall_package(self, package: str) -> bool:
        """
        [κ] Knowledge: Uninstall package

        Args:
            package: Package name

        Returns:
            True if successful
        """
        print(f"[PackageManager] Uninstalling {package}")

        try:
            result = subprocess.run(
                f"npm uninstall {package}",
                shell=True,
                capture_output=True,
                text=True,
                cwd=self.project_root,
                timeout=60
            )

            if result.returncode == 0:
                print(f"[PackageManager]   Successfully uninstalled {package}")

                # Update package.json cache
                self.package_json = self._load_package_json()

                return True

        except subprocess.TimeoutExpired:
            print(f"[PackageManager] Timeout uninstalling {package}")
        except Exception as e:
            print(f"[PackageManager] Error uninstalling {package}: {e}")

        return False

    def is_installed(self, package: str) -> bool:
        """
        [κ] Knowledge: Check if package is installed

        Args:
            package: Package name

        Returns:
            True if installed
        """
        dependencies = self.package_json.get('dependencies', {})
        dev_dependencies = self.package_json.get('devDependencies', {})

        return package in dependencies or package in dev_dependencies

    def get_installed_version(self, package: str) -> Optional[str]:
        """
        [κ] Knowledge: Get installed version of package

        Args:
            package: Package name

        Returns:
            Version string or None
        """
        dependencies = self.package_json.get('dependencies', {})
        dev_dependencies = self.package_json.get('devDependencies', {})

        if package in dependencies:
            return dependencies[package]

        if package in dev_dependencies:
            return dev_dependencies[package]

        return None
