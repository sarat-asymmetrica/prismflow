"""
[sigma] Semantic: ESLint Rule Analyzer
[rho] Resilience: Handles unknown rules gracefully
[kappa] Knowledge: ESLint rule categorization and confidence scoring

Provides:
- Rule categorization (style, quality, best-practices, etc.)
- Fix confidence scoring (0.0 - 1.0)
- Rule priority ranking
"""

from typing import Dict


class RuleAnalyzer:
    """
    [sigma] Semantic: ESLint rule categorizer and analyzer
    [rho] Resilience: Graceful handling of unknown rules
    [kappa] Knowledge: ESLint rule taxonomy
    """

    RULE_CATEGORIES = {
        'style': [
            'quotes',
            'semi',
            'indent',
            'comma-dangle',
            'comma-spacing',
            'key-spacing',
            'object-curly-spacing',
            'array-bracket-spacing',
            'space-before-function-paren',
            'space-before-blocks',
            'keyword-spacing',
            'space-infix-ops',
            'eol-last',
            'no-trailing-spaces',
            'no-multiple-empty-lines',
        ],
        'quality': [
            'no-unused-vars',
            'no-console',
            'prefer-const',
            'no-var',
            'no-undef',
            'no-extra-semi',
            'no-unreachable',
            'no-dupe-keys',
            'no-duplicate-case',
        ],
        'best-practices': [
            'eqeqeq',
            'no-var',
            'prefer-arrow-callback',
            'prefer-template',
            'prefer-spread',
            'prefer-rest-params',
            'no-eval',
            'no-implied-eval',
            'no-with',
            'no-new-func',
        ],
        'typescript': [
            '@typescript-eslint/no-unused-vars',
            '@typescript-eslint/no-explicit-any',
            '@typescript-eslint/explicit-function-return-type',
            '@typescript-eslint/no-non-null-assertion',
            '@typescript-eslint/no-empty-function',
        ],
        'react': [
            'react/jsx-key',
            'react/self-closing-comp',
            'react/jsx-closing-bracket-location',
            'react/jsx-closing-tag-location',
            'react/jsx-curly-spacing',
            'react/jsx-equals-spacing',
            'react/jsx-first-prop-new-line',
            'react/jsx-indent',
            'react/jsx-indent-props',
        ],
    }

    def categorize_rule(self, rule: str) -> str:
        """
        [kappa] Categorize ESLint rule

        Args:
            rule: Rule name

        Returns:
            Category name ('style', 'quality', 'best-practices', etc.)
        """
        for category, rules in self.RULE_CATEGORIES.items():
            if rule in rules:
                return category
        return 'other'

    def get_fix_confidence(self, rule: str) -> float:
        """
        [kappa] Estimate confidence level for automatic fix

        Args:
            rule: Rule name

        Returns:
            Confidence score (0.0 - 1.0)
        """
        # High confidence - very safe to auto-fix
        high_confidence = [
            'quotes',
            'semi',
            'prefer-const',
            'no-extra-semi',
            'comma-dangle',
            'comma-spacing',
            'key-spacing',
            'space-before-function-paren',
            'keyword-spacing',
            'eol-last',
            'no-trailing-spaces',
        ]

        # Medium confidence - generally safe with some edge cases
        medium_confidence = [
            'no-unused-vars',
            '@typescript-eslint/no-unused-vars',
            'no-console',
            'indent',
            'object-curly-spacing',
            'array-bracket-spacing',
        ]

        # Low confidence - requires careful analysis
        low_confidence = [
            'eqeqeq',
            'no-var',
            'prefer-arrow-callback',
            '@typescript-eslint/explicit-function-return-type',
        ]

        if rule in high_confidence:
            return 0.95
        elif rule in medium_confidence:
            return 0.75
        elif rule in low_confidence:
            return 0.50
        else:
            return 0.30

    def get_fix_priority(self, rule: str) -> int:
        """
        [kappa] Get fix priority for rule (1=highest, 5=lowest)

        Args:
            rule: Rule name

        Returns:
            Priority (1-5)
        """
        # Priority 1 - Fix first (syntax/structure)
        priority_1 = ['no-extra-semi', 'no-dupe-keys']

        # Priority 2 - Style consistency
        priority_2 = ['quotes', 'semi', 'indent']

        # Priority 3 - Code quality
        priority_3 = ['no-unused-vars', 'prefer-const', 'no-var']

        # Priority 4 - Best practices
        priority_4 = ['eqeqeq', 'prefer-arrow-callback']

        # Priority 5 - Others
        if rule in priority_1:
            return 1
        elif rule in priority_2:
            return 2
        elif rule in priority_3:
            return 3
        elif rule in priority_4:
            return 4
        else:
            return 5

    def is_auto_fixable(self, rule: str) -> bool:
        """
        [kappa] Check if rule is auto-fixable by ESLint

        Args:
            rule: Rule name

        Returns:
            True if ESLint can auto-fix this rule
        """
        # Most style rules are auto-fixable
        auto_fixable = [
            'quotes',
            'semi',
            'no-extra-semi',
            'indent',
            'comma-dangle',
            'comma-spacing',
            'key-spacing',
            'object-curly-spacing',
            'array-bracket-spacing',
            'space-before-function-paren',
            'space-before-blocks',
            'keyword-spacing',
            'space-infix-ops',
            'eol-last',
            'no-trailing-spaces',
            'prefer-const',
            'no-var',
            'react/self-closing-comp',
        ]

        return rule in auto_fixable

    def get_rule_description(self, rule: str) -> str:
        """
        [kappa] Get human-readable description of rule

        Args:
            rule: Rule name

        Returns:
            Description string
        """
        descriptions = {
            'quotes': 'Enforce consistent use of quotes',
            'semi': 'Require or disallow semicolons',
            'no-unused-vars': 'Disallow unused variables',
            'no-console': 'Disallow console statements',
            'prefer-const': 'Prefer const over let for never-reassigned variables',
            'no-var': 'Require let or const instead of var',
            'eqeqeq': 'Require === and !== instead of == and !=',
            'indent': 'Enforce consistent indentation',
            '@typescript-eslint/no-unused-vars': 'Disallow unused variables (TypeScript)',
        }

        return descriptions.get(rule, f'ESLint rule: {rule}')
