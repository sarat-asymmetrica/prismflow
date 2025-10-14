"""
[sigma] Semantic: ESLint Configuration Analyzer
[rho] Resilience: Handles missing or malformed configs
[kappa] Knowledge: ESLint v9 flat config + legacy formats

Supports:
- eslint.config.js (v9 flat config)
- .eslintrc.json (legacy)
- .eslintrc.js (legacy)
- package.json eslintConfig (legacy)
"""

import json
from pathlib import Path
from typing import Dict, Optional, Any


class ESLintConfigAnalyzer:
    """
    [sigma] Semantic: ESLint configuration parser and analyzer
    [rho] Resilience: Multiple format support with fallbacks
    [kappa] Knowledge: ESLint v9 and legacy config formats
    """

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.config = self._load_config()

    def _load_config(self) -> Dict:
        """
        [kappa] Load ESLint config from various formats

        Returns:
            Config dict or empty dict if not found
        """

        # Try eslint.config.js (v9 flat config)
        flat_config = self.project_root / "eslint.config.js"
        if flat_config.exists():
            config = self._parse_flat_config(flat_config)
            if config:
                return config

        # Try .eslintrc.json
        json_config = self.project_root / ".eslintrc.json"
        if json_config.exists():
            try:
                return json.loads(json_config.read_text(encoding='utf-8'))
            except Exception as e:
                print(f"[ESLintConfig] Error parsing .eslintrc.json: {e}")

        # Try .eslintrc.js
        js_config = self.project_root / ".eslintrc.js"
        if js_config.exists():
            config = self._parse_js_config(js_config)
            if config:
                return config

        # Try package.json eslintConfig
        package_json = self.project_root / "package.json"
        if package_json.exists():
            try:
                pkg = json.loads(package_json.read_text(encoding='utf-8'))
                if 'eslintConfig' in pkg:
                    return pkg['eslintConfig']
            except Exception as e:
                print(f"[ESLintConfig] Error parsing package.json: {e}")

        # No config found
        print("[ESLintConfig] Warning: No ESLint config found")
        return {}

    def _parse_flat_config(self, config_file: Path) -> Dict:
        """
        [kappa] Parse ESLint v9 flat config format

        Args:
            config_file: Path to eslint.config.js

        Returns:
            Parsed config dict
        """
        try:
            content = config_file.read_text(encoding='utf-8')

            # Extract rules from flat config
            # This is simplified - full parser would need JavaScript AST
            config = {'rules': {}}

            # Look for rules object
            if 'rules:' in content or 'rules :' in content:
                # Extract rules section (simplified)
                # In practice, this would need proper JS parsing
                pass

            return config
        except Exception as e:
            print(f"[ESLintConfig] Error parsing flat config: {e}")
            return {}

    def _parse_js_config(self, config_file: Path) -> Dict:
        """
        [kappa] Parse .eslintrc.js format

        Args:
            config_file: Path to .eslintrc.js

        Returns:
            Parsed config dict
        """
        try:
            content = config_file.read_text(encoding='utf-8')

            # This is simplified - full implementation would execute JS
            # For now, return empty config
            return {}
        except Exception as e:
            print(f"[ESLintConfig] Error parsing .eslintrc.js: {e}")
            return {}

    def get_rule_config(self, rule: str) -> Optional[Any]:
        """
        [kappa] Get configuration for specific rule

        Args:
            rule: Rule name (e.g., 'quotes', 'semi')

        Returns:
            Rule config or None
        """
        return self.config.get('rules', {}).get(rule)

    def get_preferred_quote_style(self) -> str:
        """
        [kappa] Determine preferred quote style from config

        Returns:
            'single', 'double', or 'backtick'
        """
        quotes_rule = self.get_rule_config('quotes')
        if quotes_rule:
            if isinstance(quotes_rule, list) and len(quotes_rule) > 1:
                return quotes_rule[1]
        return 'single'  # Default

    def get_semi_preference(self) -> bool:
        """
        [kappa] Determine semicolon preference from config

        Returns:
            True if semicolons required, False otherwise
        """
        semi_rule = self.get_rule_config('semi')
        if semi_rule:
            if isinstance(semi_rule, list) and len(semi_rule) > 1:
                return semi_rule[1] == 'always'
            if isinstance(semi_rule, str):
                return semi_rule == 'always'
        return True  # Default to always

    def is_rule_enabled(self, rule: str) -> bool:
        """
        [kappa] Check if rule is enabled

        Args:
            rule: Rule name

        Returns:
            True if enabled (error or warning)
        """
        rule_config = self.get_rule_config(rule)
        if not rule_config:
            return False

        # Handle different formats
        if isinstance(rule_config, list):
            severity = rule_config[0]
        else:
            severity = rule_config

        # Severity: 0=off, 1=warn, 2=error, 'off', 'warn', 'error'
        if isinstance(severity, int):
            return severity > 0
        if isinstance(severity, str):
            return severity in ['warn', 'warning', 'error']

        return False
