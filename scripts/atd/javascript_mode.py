"""
JavaScript Mode for ATD V3
Adapts TypeScript Doctor for JavaScript/JSDoc projects (like PrismFlow Browser)
"""

import json
import os
from pathlib import Path
from typing import Dict, Optional


class JavaScriptMode:
    """
    Configures TypeScript compiler to check JavaScript files with JSDoc.
    This allows ATD V3 to work on JavaScript-only projects like Electron apps.
    """

    def __init__(self, project_root: str = '.'):
        self.project_root = Path(project_root)
        self.tsconfig_path = self.project_root / 'tsconfig.json'
        self.fixes_applied = 0

    def configure_for_javascript(self) -> Dict:
        """
        Configure tsconfig.json for JavaScript checking with JSDoc.

        Returns:
            Dict with success status and details
        """
        print("[ATD-JS] Configuring TypeScript for JavaScript checking...")

        # JavaScript-optimized tsconfig
        tsconfig = {
            "compilerOptions": {
                # Allow JavaScript files
                "allowJs": True,
                "checkJs": True,

                # Don't emit files (we're just checking)
                "noEmit": True,
                "skipLibCheck": True,

                # Modern JavaScript features
                "lib": ["ES2022", "DOM"],
                "target": "ES2022",
                "module": "commonjs",
                "moduleResolution": "node",

                # Electron/Node.js specifics
                "esModuleInterop": True,
                "allowSyntheticDefaultImports": True,
                "resolveJsonModule": True,

                # Type checking strictness (relaxed for JavaScript)
                "strict": False,
                "noImplicitAny": False,
                "strictNullChecks": False,

                # Helpful options
                "forceConsistentCasingInFileNames": True,
                "isolatedModules": False
            },
            "include": [
                "*.js",
                "src/**/*.js",
                "test*.js",
                "browser-*.js"
            ],
            "exclude": [
                "node_modules",
                "dist",
                "dist-packager",
                ".cache",
                "coverage",
                "**/*.min.js",
                "**/*.bundle.js"
            ]
        }

        # Write tsconfig.json
        try:
            with open(self.tsconfig_path, 'w', encoding='utf-8') as f:
                json.dump(tsconfig, f, indent=2)

            self.fixes_applied = 1

            print("[ATD-JS] ✓ Configured tsconfig.json for JavaScript checking")
            print("[ATD-JS] ✓ Enabled JSDoc type checking")
            print("[ATD-JS] ✓ Set up Electron/Node.js module resolution")

            return {
                'success': True,
                'message': 'JavaScript mode configured',
                'fixes': 1,
                'details': 'TypeScript compiler configured to check JavaScript files'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to write tsconfig.json: {e}'
            }

    def analyze_javascript_errors(self, tsc_output: str) -> Dict:
        """
        Analyze TypeScript compiler errors in JavaScript context.

        Args:
            tsc_output: Raw output from tsc --noEmit

        Returns:
            Dict with categorized errors
        """
        errors = []

        for line in tsc_output.split('\n'):
            # Parse TypeScript error format: file(line,col): error TS####: message
            if 'error TS' in line:
                errors.append(line.strip())

        # Categorize errors
        categorized = {
            'type_errors': [],      # TS2307, TS2305, etc.
            'syntax_errors': [],    # TS1005, TS1109, etc.
            'config_errors': [],    # TS6053, etc.
            'other_errors': []
        }

        for error in errors:
            if 'TS2307' in error or 'TS2305' in error or 'TS2304' in error:
                categorized['type_errors'].append(error)
            elif 'TS1' in error:
                categorized['syntax_errors'].append(error)
            elif 'TS6' in error:
                categorized['config_errors'].append(error)
            else:
                categorized['other_errors'].append(error)

        return {
            'total_errors': len(errors),
            'errors': errors,
            'categorized': categorized,
            'javascript_friendly': len(categorized['syntax_errors']) == 0
        }

    def generate_jsdoc_types(self, files: list) -> Dict:
        """
        Generate JSDoc type annotations for JavaScript files.

        Args:
            files: List of JavaScript file paths

        Returns:
            Dict with generation status
        """
        generated = 0

        print("[ATD-JS] Generating JSDoc type hints...")

        for file_path in files:
            try:
                # Read file
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Check if already has JSDoc
                if '/**' in content and '@param' in content:
                    print(f"[ATD-JS] Skipping {file_path} (already has JSDoc)")
                    continue

                # This would be enhanced with actual JSDoc generation logic
                # For now, just report what could be generated
                print(f"[ATD-JS] Could generate types for: {file_path}")

            except Exception as e:
                print(f"[ATD-JS] Error processing {file_path}: {e}")

        return {
            'success': True,
            'files_processed': len(files),
            'types_generated': generated
        }

    def get_stats(self) -> Dict:
        """Return statistics about JavaScript mode configuration"""
        return {
            'mode': 'JavaScriptMode',
            'fixes_applied': self.fixes_applied,
            'tsconfig_path': str(self.tsconfig_path),
            'configured': self.tsconfig_path.exists()
        }


# Standalone usage
if __name__ == '__main__':
    js_mode = JavaScriptMode()
    result = js_mode.configure_for_javascript()
    print(f"\nResult: {result}")
    print(f"Stats: {js_mode.get_stats()}")
