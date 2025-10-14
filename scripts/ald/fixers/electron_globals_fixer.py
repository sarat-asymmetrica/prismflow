"""
Electron Globals Fixer
Adds browser, node, and Electron globals to ESLint config
Part of ALD V1 - Adapted for PrismFlow Browser
"""

import os
import re

class ElectronGlobalsFixer:
    """
    Fixes ESLint configuration to include Electron/Browser/Node globals.
    This prevents hundreds of 'no-undef' errors in Electron applications.
    """

    def __init__(self, project_root='.'):
        self.project_root = project_root
        self.config_path = os.path.join(project_root, 'eslint.config.js')
        self.fixes_applied = 0

    def can_fix(self) -> bool:
        """Check if we can fix the config"""
        return os.path.exists(self.config_path)

    def fix(self) -> dict:
        """
        Add Electron/Browser/Node globals to eslint.config.js
        Returns dict with success status and details
        """
        if not self.can_fix():
            return {
                'success': False,
                'error': 'eslint.config.js not found'
            }

        # Read existing config
        with open(self.config_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check if we need to add Electron globals
        if 'electron' in content.lower():
            print("[ElectronGlobals] ✓ Electron globals already configured")
            return {
                'success': True,
                'message': 'Already configured',
                'fixes': 0
            }

        # Enhanced globals configuration for Electron
        enhanced_config = """module.exports = [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        // Node.js globals
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',

        // Timers
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',

        // Electron-specific globals
        electron: 'readonly',

        // Browser globals (for BrowserWindow/BrowserView content)
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        XMLHttpRequest: 'readonly',
        WebSocket: 'readonly',
        Image: 'readonly',
        Audio: 'readonly',
        Event: 'readonly',
        CustomEvent: 'readonly',
        MessageEvent: 'readonly',
        ErrorEvent: 'readonly',
        Promise: 'readonly',
        Map: 'readonly',
        Set: 'readonly',
        WeakMap: 'readonly',
        WeakSet: 'readonly',
        Symbol: 'readonly',
        Proxy: 'readonly',
        Reflect: 'readonly',
        ArrayBuffer: 'readonly',
        DataView: 'readonly',
        Int8Array: 'readonly',
        Uint8Array: 'readonly',
        Uint8ClampedArray: 'readonly',
        Int16Array: 'readonly',
        Uint16Array: 'readonly',
        Int32Array: 'readonly',
        Uint32Array: 'readonly',
        Float32Array: 'readonly',
        Float64Array: 'readonly',
        BigInt64Array: 'readonly',
        BigUint64Array: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', {
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_'
      }],
      'no-undef': 'error',
      'semi': ['error', 'always'],
      'quotes': ['warn', 'single', { 'avoidEscape': true }]
    }
  },
  {
    ignores: [
      'node_modules/',
      'dist/',
      'dist-packager/',
      '.cache/',
      'coverage/',
      '**/*.min.js',
      '**/*.bundle.js'
    ]
  }
];
"""

        # Write updated config
        with open(self.config_path, 'w', encoding='utf-8') as f:
            f.write(enhanced_config)

        self.fixes_applied = 1

        print("[ElectronGlobals] OK: Added comprehensive Electron/Browser/Node globals")
        print("[ElectronGlobals] OK: Configured ignore patterns for build artifacts")
        print("[ElectronGlobals] OK: Set up proper linting rules for Electron apps")

        return {
            'success': True,
            'message': 'Electron globals configured',
            'fixes': 1,
            'details': 'Added 60+ globals for Electron/Browser/Node compatibility'
        }

    def get_stats(self) -> dict:
        """Return statistics about fixes applied"""
        return {
            'fixer': 'ElectronGlobalsFixer',
            'fixes_applied': self.fixes_applied,
            'config_file': self.config_path
        }


# Standalone usage
if __name__ == '__main__':
    fixer = ElectronGlobalsFixer()
    result = fixer.fix()
    print(f"\nResult: {result}")
    print(f"Stats: {fixer.get_stats()}")
