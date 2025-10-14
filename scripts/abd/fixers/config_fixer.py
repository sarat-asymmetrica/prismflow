"""
[σ] Semantic: Next.js/Webpack Config Fixer
[ρ] Resilience: Backs up config before modifications
[κ] Knowledge: next.config.js best practices, webpack configuration

Fixes:
- Missing next.config.js
- Invalid configuration syntax
- Missing webpack configuration
- Module resolution issues in config
- TypeScript configuration issues
"""

import re
import json
from pathlib import Path
from typing import List, Dict, Optional
import shutil


class ConfigFixer:
    """
    [σ] Semantic: Fixes Next.js and Webpack configuration issues
    [ρ] Resilience: Backs up configs before modification
    [κ] Knowledge: Next.js 13/14/15 configuration, webpack 5
    """

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.next_config_path = project_root / "next.config.js"
        self.tsconfig_path = project_root / "tsconfig.json"
        self.backup_suffix = ".abd-backup"

    def fix_errors(self, errors: List[Dict]) -> int:
        """
        [ρ] Resilience: Fix configuration errors
        [σ] Semantic: Intelligent config updates

        Returns:
            int: Number of errors fixed
        """
        fixed_count = 0

        # Check if next.config.js exists
        if not self.next_config_path.exists():
            print(f"[ConfigFixer] next.config.js not found - creating default config")
            if self._create_default_next_config():
                fixed_count += 1

        # Process each error
        for error in errors:
            message = error.get('message', '')

            # Invalid configuration object
            if 'invalid configuration' in message.lower():
                if self._fix_invalid_config(error):
                    print(f"[ConfigFixer]   -> Fixed invalid configuration")
                    fixed_count += 1
                    continue

            # Webpack configuration issues
            if 'webpack' in message.lower():
                if self._fix_webpack_config(error):
                    print(f"[ConfigFixer]   -> Fixed webpack configuration")
                    fixed_count += 1
                    continue

            # Module resolution issues
            if 'resolve' in message.lower() or 'module' in message.lower():
                if self._fix_module_resolution(error):
                    print(f"[ConfigFixer]   -> Fixed module resolution")
                    fixed_count += 1
                    continue

            # TypeScript configuration
            if 'tsconfig' in message.lower() or 'typescript' in message.lower():
                if self._fix_tsconfig(error):
                    print(f"[ConfigFixer]   -> Fixed TypeScript configuration")
                    fixed_count += 1
                    continue

        return fixed_count

    def _create_default_next_config(self) -> bool:
        """
        [κ] Knowledge: Create default next.config.js with best practices
        """
        default_config = """/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Custom webpack configuration
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },

  // Experimental features
  experimental: {
    // Enable experimental features as needed
  },

  // Image optimization
  images: {
    domains: [],
  },
};

module.exports = nextConfig;
"""

        try:
            with open(self.next_config_path, 'w', encoding='utf-8') as f:
                f.write(default_config)

            print(f"[ConfigFixer] Created default next.config.js")
            return True

        except Exception as e:
            print(f"[ConfigFixer] ERROR creating next.config.js: {e}")
            return False

    def _fix_invalid_config(self, error: Dict) -> bool:
        """
        [κ] Knowledge: Fix invalid configuration syntax
        [ρ] Resilience: Backs up before modifying
        """
        if not self.next_config_path.exists():
            return False

        # Backup current config
        self._backup_file(self.next_config_path)

        try:
            # Read current config
            with open(self.next_config_path, 'r', encoding='utf-8') as f:
                config_content = f.read()

            # Common fixes
            fixed_content = config_content

            # Fix 1: Missing module.exports
            if 'module.exports' not in fixed_content:
                # Wrap in module.exports
                fixed_content = f"module.exports = {{\n{fixed_content}\n}};"

            # Fix 2: Invalid JavaScript syntax
            # Remove trailing commas in objects (if not in array)
            fixed_content = re.sub(r',(\s*)\}', r'\1}', fixed_content)

            # Fix 3: Missing semicolons
            if not fixed_content.rstrip().endswith(';'):
                fixed_content += ';'

            # Write back
            with open(self.next_config_path, 'w', encoding='utf-8') as f:
                f.write(fixed_content)

            print(f"[ConfigFixer]   Fixed invalid configuration syntax")
            return True

        except Exception as e:
            print(f"[ConfigFixer] ERROR fixing invalid config: {e}")
            self._restore_backup(self.next_config_path)
            return False

    def _fix_webpack_config(self, error: Dict) -> bool:
        """
        [κ] Knowledge: Fix webpack configuration issues
        """
        if not self.next_config_path.exists():
            return self._create_default_next_config()

        # Backup current config
        self._backup_file(self.next_config_path)

        try:
            # Read current config
            with open(self.next_config_path, 'r', encoding='utf-8') as f:
                config_content = f.read()

            # Check if webpack config exists
            if 'webpack:' not in config_content:
                # Add webpack configuration
                webpack_config = """
  webpack: (config, { isServer }) => {
    // Fallback for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      path: false,
      os: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
    };

    return config;
  },
"""
                # Insert before closing brace
                config_content = config_content.replace(
                    '};',
                    webpack_config + '};'
                )

            # Write back
            with open(self.next_config_path, 'w', encoding='utf-8') as f:
                f.write(config_content)

            print(f"[ConfigFixer]   Added webpack configuration")
            return True

        except Exception as e:
            print(f"[ConfigFixer] ERROR fixing webpack config: {e}")
            self._restore_backup(self.next_config_path)
            return False

    def _fix_module_resolution(self, error: Dict) -> bool:
        """
        [κ] Knowledge: Fix module resolution issues
        """
        # This typically involves updating webpack resolve configuration
        if not self.next_config_path.exists():
            return self._create_default_next_config()

        # Backup current config
        self._backup_file(self.next_config_path)

        try:
            # Read current config
            with open(self.next_config_path, 'r', encoding='utf-8') as f:
                config_content = f.read()

            # Add module resolution to webpack config
            if 'resolve.extensions' not in config_content:
                resolution_config = """
    // Add module resolution
    config.resolve.extensions = [
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
      '.json',
      ...config.resolve.extensions
    ];
"""
                # Insert into webpack config
                if 'webpack: (config' in config_content:
                    # Add before return config
                    config_content = config_content.replace(
                        'return config;',
                        resolution_config + '    return config;'
                    )

            # Write back
            with open(self.next_config_path, 'w', encoding='utf-8') as f:
                f.write(config_content)

            print(f"[ConfigFixer]   Added module resolution configuration")
            return True

        except Exception as e:
            print(f"[ConfigFixer] ERROR fixing module resolution: {e}")
            self._restore_backup(self.next_config_path)
            return False

    def _fix_tsconfig(self, error: Dict) -> bool:
        """
        [κ] Knowledge: Fix TypeScript configuration issues
        """
        if not self.tsconfig_path.exists():
            return self._create_default_tsconfig()

        # Backup current config
        self._backup_file(self.tsconfig_path)

        try:
            # Read current tsconfig
            with open(self.tsconfig_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Remove comments (simple approach)
            content_clean = re.sub(r'//.*$', '', content, flags=re.MULTILINE)
            content_clean = re.sub(r'/\*.*?\*/', '', content_clean, flags=re.DOTALL)

            tsconfig = json.loads(content_clean)

            # Ensure compilerOptions exists
            if 'compilerOptions' not in tsconfig:
                tsconfig['compilerOptions'] = {}

            compiler_options = tsconfig['compilerOptions']

            # Common fixes
            fixes_applied = False

            # Fix 1: Module resolution
            if 'moduleResolution' not in compiler_options:
                compiler_options['moduleResolution'] = 'node'
                fixes_applied = True

            # Fix 2: JSX
            if 'jsx' not in compiler_options:
                compiler_options['jsx'] = 'preserve'
                fixes_applied = True

            # Fix 3: Strict mode
            if 'strict' not in compiler_options:
                compiler_options['strict'] = False
                fixes_applied = True

            # Fix 4: ES module interop
            if 'esModuleInterop' not in compiler_options:
                compiler_options['esModuleInterop'] = True
                fixes_applied = True

            # Fix 5: Skip lib check
            if 'skipLibCheck' not in compiler_options:
                compiler_options['skipLibCheck'] = True
                fixes_applied = True

            # Fix 6: Module
            if 'module' not in compiler_options:
                compiler_options['module'] = 'esnext'
                fixes_applied = True

            # Fix 7: Target
            if 'target' not in compiler_options:
                compiler_options['target'] = 'es5'
                fixes_applied = True

            # Fix 8: Lib
            if 'lib' not in compiler_options:
                compiler_options['lib'] = ['dom', 'dom.iterable', 'esnext']
                fixes_applied = True

            # Fix 9: Allow JS
            if 'allowJs' not in compiler_options:
                compiler_options['allowJs'] = True
                fixes_applied = True

            # Fix 10: No emit
            if 'noEmit' not in compiler_options:
                compiler_options['noEmit'] = True
                fixes_applied = True

            # Fix 11: Incremental
            if 'incremental' not in compiler_options:
                compiler_options['incremental'] = True
                fixes_applied = True

            if fixes_applied:
                # Write back
                with open(self.tsconfig_path, 'w', encoding='utf-8') as f:
                    json.dump(tsconfig, f, indent=2)

                print(f"[ConfigFixer]   Fixed TypeScript configuration")
                return True

        except Exception as e:
            print(f"[ConfigFixer] ERROR fixing tsconfig: {e}")
            self._restore_backup(self.tsconfig_path)

        return False

    def _create_default_tsconfig(self) -> bool:
        """
        [κ] Knowledge: Create default tsconfig.json
        """
        default_tsconfig = {
            "compilerOptions": {
                "target": "es5",
                "lib": ["dom", "dom.iterable", "esnext"],
                "allowJs": True,
                "skipLibCheck": True,
                "strict": False,
                "forceConsistentCasingInFileNames": True,
                "noEmit": True,
                "esModuleInterop": True,
                "module": "esnext",
                "moduleResolution": "node",
                "resolveJsonModule": True,
                "isolatedModules": True,
                "jsx": "preserve",
                "incremental": True,
                "paths": {
                    "@/*": ["./src/*"]
                }
            },
            "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
            "exclude": ["node_modules"]
        }

        try:
            with open(self.tsconfig_path, 'w', encoding='utf-8') as f:
                json.dump(default_tsconfig, f, indent=2)

            print(f"[ConfigFixer] Created default tsconfig.json")
            return True

        except Exception as e:
            print(f"[ConfigFixer] ERROR creating tsconfig.json: {e}")
            return False

    def _backup_file(self, file_path: Path):
        """
        [ρ] Resilience: Backup file before modification
        """
        if not file_path.exists():
            return

        backup_path = Path(str(file_path) + self.backup_suffix)

        try:
            shutil.copy2(file_path, backup_path)
            print(f"[ConfigFixer]   Backed up {file_path.name}")
        except Exception as e:
            print(f"[ConfigFixer] WARNING: Failed to backup {file_path.name}: {e}")

    def _restore_backup(self, file_path: Path):
        """
        [ρ] Resilience: Restore file from backup
        """
        backup_path = Path(str(file_path) + self.backup_suffix)

        if not backup_path.exists():
            return

        try:
            shutil.copy2(backup_path, file_path)
            print(f"[ConfigFixer]   Restored {file_path.name} from backup")
        except Exception as e:
            print(f"[ConfigFixer] ERROR: Failed to restore {file_path.name}: {e}")
