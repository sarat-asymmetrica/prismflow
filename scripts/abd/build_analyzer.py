"""
[σ] Semantic: Build Output Analyzer
[ρ] Resilience: Handles malformed build output
[κ] Knowledge: Next.js/Webpack error formats, error parsing

Parses:
- Next.js build errors
- Webpack compilation errors
- Module resolution errors
- Dependency errors
- TypeScript errors from build
"""

import re
from pathlib import Path
from typing import List, Dict, Optional


class BuildAnalyzer:
    """
    [σ] Semantic: Parse and analyze build output
    [ρ] Resilience: Multiple parsing strategies
    [κ] Knowledge: Next.js, Webpack, npm error formats
    """

    def __init__(self, project_root: Path):
        self.project_root = project_root

        # Error patterns for different error types
        self.patterns = self._initialize_patterns()

    def _initialize_patterns(self) -> Dict[str, str]:
        """
        [κ] Knowledge: Define regex patterns for different error types
        """
        return {
            # Module not found errors
            'module_not_found': r"Module not found: Can't resolve '([^']+)'(?: in '([^']+)')?",

            # Dependency missing
            'dependency_missing': r"Cannot find module '([^']+)'",

            # Export not found
            'export_not_found': r"export '([^']+)' \(.*\) was not found in '([^']+)'",

            # Peer dependency errors
            'peer_dependency': r"(?:peer dep|ERESOLVE).*?(\S+)@([^\s,]+)",

            # Version conflicts
            'version_conflict': r"npm ERR!.*conflict.*with.*",

            # Invalid config
            'invalid_config': r"Invalid.*configuration",

            # Syntax errors
            'syntax_error': r"SyntaxError: (.*)",

            # TypeScript errors (from build)
            'typescript_error': r"TS\d+: (.*)",

            # Webpack errors
            'webpack_error': r"webpack.*?error.*?:(.*)",

            # File not found
            'file_not_found': r"(?:ENOENT|no such file).*?'([^']+)'",
        }

    def parse_build_output(self, output: str) -> List[Dict]:
        """
        [κ] Knowledge: Parse build output and extract structured errors
        [ρ] Resilience: Handles various error formats

        Args:
            output: Build output text

        Returns:
            List of error dictionaries
        """
        errors = []

        # Split into lines
        lines = output.split('\n')

        # Track multi-line errors
        current_error = None

        for i, line in enumerate(lines):
            # Skip empty lines
            if not line.strip():
                continue

            # Try each pattern
            for error_type, pattern in self.patterns.items():
                match = re.search(pattern, line, re.IGNORECASE)

                if match:
                    error = {
                        'type': error_type,
                        'message': line.strip(),
                        'line_number': i,
                        'file': self._extract_file_path(line),
                        'module': None,
                        'source': self._detect_source(line)
                    }

                    # Extract additional information based on error type
                    if error_type == 'module_not_found':
                        error['module'] = match.group(1)
                        if match.groups() and len(match.groups()) > 1:
                            error['file'] = match.group(2)

                    elif error_type == 'dependency_missing':
                        error['module'] = match.group(1)

                    elif error_type == 'export_not_found':
                        error['export_name'] = match.group(1)
                        error['module'] = match.group(2)

                    elif error_type == 'peer_dependency':
                        error['module'] = match.group(1)
                        error['required_version'] = match.group(2)

                    elif error_type == 'file_not_found':
                        error['file'] = match.group(1)

                    errors.append(error)
                    current_error = error
                    break

            # Check for continuation of previous error
            if current_error and self._is_continuation_line(line):
                # Append to previous error message
                current_error['message'] += ' ' + line.strip()

        # Deduplicate errors
        errors = self._deduplicate_errors(errors)

        return errors

    def _extract_file_path(self, line: str) -> Optional[str]:
        """
        [κ] Knowledge: Extract file path from error line

        Args:
            line: Error line

        Returns:
            File path or None
        """
        # Pattern 1: "./path/to/file.ts" or './path/to/file.ts'
        match = re.search(r"['\"]([^'\"]+\.[a-zA-Z]+)['\"]", line)
        if match:
            path = match.group(1)
            # Filter out module names (they don't have ./ or ../)
            if path.startswith('.') or '/' in path:
                return path

        # Pattern 2: at /absolute/path/to/file.ts:line:col
        match = re.search(r"at ([^\s]+\.[a-zA-Z]+):\d+:\d+", line)
        if match:
            return match.group(1)

        # Pattern 3: /absolute/path/to/file.ts(line,col)
        match = re.search(r"([^\s]+\.[a-zA-Z]+)\(\d+,\d+\)", line)
        if match:
            return match.group(1)

        return None

    def _detect_source(self, line: str) -> str:
        """
        [κ] Knowledge: Detect error source (Next.js, Webpack, npm, etc.)

        Args:
            line: Error line

        Returns:
            Source identifier
        """
        line_lower = line.lower()

        if 'next' in line_lower:
            return 'nextjs'
        elif 'webpack' in line_lower:
            return 'webpack'
        elif 'npm err' in line_lower:
            return 'npm'
        elif 'typescript' in line_lower or 'ts(' in line_lower:
            return 'typescript'
        elif 'eslint' in line_lower:
            return 'eslint'
        else:
            return 'unknown'

    def _is_continuation_line(self, line: str) -> bool:
        """
        [κ] Knowledge: Check if line is continuation of previous error

        Args:
            line: Line to check

        Returns:
            True if continuation line
        """
        # Lines that typically continue errors
        continuation_indicators = [
            '  at ',
            '    ',
            '  > ',
            '  | ',
            '     ',
        ]

        return any(line.startswith(indicator) for indicator in continuation_indicators)

    def _deduplicate_errors(self, errors: List[Dict]) -> List[Dict]:
        """
        [ρ] Resilience: Remove duplicate errors

        Args:
            errors: List of errors

        Returns:
            Deduplicated list
        """
        seen = set()
        unique = []

        for error in errors:
            # Create signature
            signature = self._create_error_signature(error)

            if signature not in seen:
                seen.add(signature)
                unique.append(error)

        return unique

    def _create_error_signature(self, error: Dict) -> str:
        """
        [κ] Knowledge: Create unique signature for error

        Args:
            error: Error dictionary

        Returns:
            Signature string
        """
        error_type = error.get('type', 'unknown')
        file = error.get('file', '')
        module = error.get('module', '')

        # Use first 50 chars of message for signature
        message = error.get('message', '')[:50]

        return f"{error_type}:{file}:{module}:{message}"

    def classify_severity(self, error: Dict) -> str:
        """
        [κ] Knowledge: Classify error severity

        Args:
            error: Error dictionary

        Returns:
            Severity level (critical, high, medium, low)
        """
        error_type = error.get('type', 'unknown')
        message = error.get('message', '').lower()

        # Critical errors
        critical_types = ['syntax_error', 'fatal_error']
        critical_keywords = ['fatal', 'cannot start', 'failed to compile']

        if error_type in critical_types:
            return 'critical'

        if any(keyword in message for keyword in critical_keywords):
            return 'critical'

        # High severity
        high_types = ['module_not_found', 'dependency_missing', 'typescript_error']

        if error_type in high_types:
            return 'high'

        # Medium severity
        medium_types = ['export_not_found', 'config_error']

        if error_type in medium_types:
            return 'medium'

        # Low severity
        return 'low'

    def group_by_file(self, errors: List[Dict]) -> Dict[str, List[Dict]]:
        """
        [σ] Semantic: Group errors by file

        Args:
            errors: List of errors

        Returns:
            Dict mapping file to errors
        """
        grouped = {}

        for error in errors:
            file = error.get('file', 'unknown')

            if file not in grouped:
                grouped[file] = []

            grouped[file].append(error)

        return grouped

    def get_statistics(self, errors: List[Dict]) -> Dict:
        """
        [σ] Semantic: Calculate error statistics

        Args:
            errors: List of errors

        Returns:
            Statistics dictionary
        """
        # Count by type
        by_type = {}
        for error in errors:
            error_type = error.get('type', 'unknown')
            by_type[error_type] = by_type.get(error_type, 0) + 1

        # Count by severity
        by_severity = {'critical': 0, 'high': 0, 'medium': 0, 'low': 0}
        for error in errors:
            severity = self.classify_severity(error)
            by_severity[severity] += 1

        # Count by source
        by_source = {}
        for error in errors:
            source = error.get('source', 'unknown')
            by_source[source] = by_source.get(source, 0) + 1

        return {
            'total': len(errors),
            'by_type': by_type,
            'by_severity': by_severity,
            'by_source': by_source,
            'unique_files': len(self.group_by_file(errors))
        }
