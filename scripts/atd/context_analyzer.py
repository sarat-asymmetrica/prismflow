"""
Asymmetrica TypeScript Doctor - Context Analyzer
Parse Prisma schema and AsymmSocket registry for intelligent type inference

[σ] Semantic Layer: Extract schema knowledge for context-aware fixes
[ρ] Resilience: Handle missing or malformed schemas gracefully
[κ] Knowledge: Build comprehensive understanding of project structure
"""

import re
from pathlib import Path
from typing import Dict, List, Optional, Set


class ContextAnalyzer:
    """
    [κ] Analyze project context for intelligent error fixing

    Sources of truth:
    - Prisma schema (database models)
    - AsymmSocket registry (component dependencies)
    - File system structure (available modules)
    """

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.prisma_schema_path = project_root / "prisma" / "schema.prisma"
        self.socket_registry_path = project_root / "src" / "lib" / "asymm-socket" / "registry.ts"

        # Cached data
        self._prisma_models: Optional[Dict[str, Dict]] = None
        self._socket_registry: Optional[Dict] = None
        self._available_modules: Optional[Set[str]] = None

    def get_prisma_models(self) -> Dict[str, Dict]:
        """
        [σ] Parse Prisma schema for model definitions

        Returns:
            Dictionary mapping model names to their field definitions
        """
        if self._prisma_models is not None:
            return self._prisma_models

        self._prisma_models = {}

        if not self.prisma_schema_path.exists():
            print(f"[ContextAnalyzer] WARNING: Prisma schema not found: {self.prisma_schema_path}")
            return self._prisma_models

        try:
            with open(self.prisma_schema_path, "r", encoding="utf-8") as f:
                schema_content = f.read()

            # Parse model definitions
            # Format: model ModelName { field type, ... }
            model_pattern = re.compile(
                r"model\s+(\w+)\s*\{([^}]+)\}",
                re.MULTILINE | re.DOTALL
            )

            for match in model_pattern.finditer(schema_content):
                model_name = match.group(1)
                model_body = match.group(2)

                # Parse fields
                fields = {}
                field_pattern = re.compile(r"^\s*(\w+)\s+(\w+)(\?|\[\])?\s*", re.MULTILINE)

                for field_match in field_pattern.finditer(model_body):
                    field_name = field_match.group(1)
                    field_type = field_match.group(2)
                    optional = field_match.group(3)

                    # Skip Prisma directives (@id, @@index, etc.)
                    if field_name.startswith("@@") or field_name.startswith("@"):
                        continue

                    fields[field_name] = {
                        "type": field_type,
                        "optional": optional == "?",
                        "array": optional == "[]"
                    }

                self._prisma_models[model_name] = {
                    "name": model_name,
                    "fields": fields
                }

            print(f"[ContextAnalyzer] OK: Parsed {len(self._prisma_models)} Prisma models")

        except Exception as e:
            print(f"[ContextAnalyzer] WARNING: Error parsing Prisma schema: {e}")

        return self._prisma_models

    def get_model_fields(self, model_name: str) -> Optional[Dict[str, Dict]]:
        """
        [κ] Get fields for a specific Prisma model

        Args:
            model_name: Name of the Prisma model

        Returns:
            Dictionary of field definitions, or None if model not found
        """
        models = self.get_prisma_models()
        model = models.get(model_name)
        return model["fields"] if model else None

    def suggest_field_fix(self, model_name: str, incorrect_field: str) -> Optional[str]:
        """
        [σ] Suggest correct field name based on similarity

        Example: Customer.firstName → Customer.businessName

        Args:
            model_name: Prisma model name
            incorrect_field: Incorrect field name

        Returns:
            Suggested correct field name, or None
        """
        fields = self.get_model_fields(model_name)
        if not fields:
            return None

        # Exact match (case-insensitive)
        for field_name in fields.keys():
            if field_name.lower() == incorrect_field.lower():
                return field_name

        # Fuzzy match (simple Levenshtein distance)
        def levenshtein(s1: str, s2: str) -> int:
            if len(s1) < len(s2):
                return levenshtein(s2, s1)
            if len(s2) == 0:
                return len(s1)
            previous_row = range(len(s2) + 1)
            for i, c1 in enumerate(s1):
                current_row = [i + 1]
                for j, c2 in enumerate(s2):
                    insertions = previous_row[j + 1] + 1
                    deletions = current_row[j] + 1
                    substitutions = previous_row[j] + (c1 != c2)
                    current_row.append(min(insertions, deletions, substitutions))
                previous_row = current_row
            return previous_row[-1]

        # Find closest match
        best_match = None
        best_distance = float("inf")

        for field_name in fields.keys():
            distance = levenshtein(incorrect_field.lower(), field_name.lower())
            if distance < best_distance and distance <= 3:  # Max 3 character difference
                best_distance = distance
                best_match = field_name

        return best_match

    def get_available_modules(self) -> Set[str]:
        """
        [ρ] Scan project for available TypeScript/React modules

        Returns:
            Set of module paths (both absolute and relative)
        """
        if self._available_modules is not None:
            return self._available_modules

        self._available_modules = set()

        # Scan common directories
        search_dirs = [
            self.project_root / "src" / "components",
            self.project_root / "src" / "lib",
            self.project_root / "src" / "hooks",
            self.project_root / "src" / "stores",
            self.project_root / "src" / "types",
        ]

        for search_dir in search_dirs:
            if not search_dir.exists():
                continue

            # Find all .ts, .tsx files
            for file_path in search_dir.rglob("*.ts*"):
                if file_path.suffix not in [".ts", ".tsx"]:
                    continue

                # Convert to module path
                relative = file_path.relative_to(self.project_root / "src")

                # Remove extension
                module_path = str(relative.with_suffix(""))

                # Add both formats
                self._available_modules.add(f"@/{module_path}")
                self._available_modules.add(module_path)

        print(f"[ContextAnalyzer] OK: Found {len(self._available_modules)} available modules")

        return self._available_modules

    def resolve_import_path(self, current_file: str, import_module: str) -> Optional[str]:
        """
        [σ] Resolve correct import path for a module

        Args:
            current_file: File trying to import
            import_module: Module being imported (could be incorrect)

        Returns:
            Correct import path, or None if not resolvable
        """
        available = self.get_available_modules()

        # Check if already correct
        if import_module in available:
            return import_module

        # Try adding @/ prefix
        if not import_module.startswith("@/"):
            absolute_path = f"@/{import_module}"
            if absolute_path in available:
                return absolute_path

        # Try common UI component path corrections
        if "components/ui" in import_module and not import_module.startswith("@/"):
            # ../ui/button → @/components/ui/button
            component_name = import_module.split("/")[-1]
            corrected = f"@/components/ui/{component_name}"
            if corrected in available:
                return corrected

        # Try fuzzy matching (last resort)
        import_base = import_module.split("/")[-1]  # Get last part
        for available_module in available:
            if available_module.endswith(f"/{import_base}"):
                return available_module

        return None

    def get_react_event_type(self, event_handler: str) -> str:
        """
        [κ] Infer React event type from handler name

        Examples:
            onClick → React.MouseEvent<HTMLButtonElement>
            onChange → React.ChangeEvent<HTMLInputElement>
            onSubmit → React.FormEvent<HTMLFormElement>

        Args:
            event_handler: Name of event handler (e.g., "onClick")

        Returns:
            TypeScript type string
        """
        event_map = {
            "onClick": "React.MouseEvent<HTMLButtonElement>",
            "onDoubleClick": "React.MouseEvent<HTMLButtonElement>",
            "onMouseDown": "React.MouseEvent<HTMLElement>",
            "onMouseUp": "React.MouseEvent<HTMLElement>",
            "onMouseEnter": "React.MouseEvent<HTMLElement>",
            "onMouseLeave": "React.MouseEvent<HTMLElement>",
            "onChange": "React.ChangeEvent<HTMLInputElement>",
            "onInput": "React.FormEvent<HTMLInputElement>",
            "onSubmit": "React.FormEvent<HTMLFormElement>",
            "onFocus": "React.FocusEvent<HTMLElement>",
            "onBlur": "React.FocusEvent<HTMLElement>",
            "onKeyDown": "React.KeyboardEvent<HTMLElement>",
            "onKeyUp": "React.KeyboardEvent<HTMLElement>",
            "onKeyPress": "React.KeyboardEvent<HTMLElement>",
        }

        return event_map.get(event_handler, "React.SyntheticEvent")

    def get_prisma_type_mapping(self, prisma_type: str) -> str:
        """
        [κ] Map Prisma type to TypeScript type

        Args:
            prisma_type: Prisma field type (String, Int, Boolean, etc.)

        Returns:
            Equivalent TypeScript type
        """
        type_map = {
            "String": "string",
            "Int": "number",
            "Float": "number",
            "Decimal": "number",
            "Boolean": "boolean",
            "DateTime": "Date",
            "Json": "any",
            "Bytes": "Buffer",
        }

        return type_map.get(prisma_type, prisma_type)

    def get_socket_dependencies(self) -> Dict[str, List[str]]:
        """
        [ρ] Parse AsymmSocket registry for component dependencies

        Returns:
            Dictionary mapping component names to their dependencies
        """
        if self._socket_registry is not None:
            return self._socket_registry

        self._socket_registry = {}

        if not self.socket_registry_path.exists():
            print(f"[ContextAnalyzer] WARNING: Socket registry not found: {self.socket_registry_path}")
            return self._socket_registry

        try:
            with open(self.socket_registry_path, "r", encoding="utf-8") as f:
                content = f.read()

            # Simple parsing - extract socket definitions
            # This is a basic implementation; enhance as needed
            socket_pattern = re.compile(r"'([^']+)':\s*\{[^}]*downstream:\s*\[([^\]]*)\]", re.MULTILINE)

            for match in socket_pattern.finditer(content):
                socket_name = match.group(1)
                downstream_raw = match.group(2)

                # Parse downstream dependencies
                downstream = []
                for dep in re.findall(r"'([^']+)'", downstream_raw):
                    downstream.append(dep)

                self._socket_registry[socket_name] = downstream

            print(f"[ContextAnalyzer] OK: Parsed {len(self._socket_registry)} socket dependencies")

        except Exception as e:
            print(f"[ContextAnalyzer] WARNING: Error parsing socket registry: {e}")

        return self._socket_registry
