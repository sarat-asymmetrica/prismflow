"""
[σ] Semantic Layer: Prisma Schema Parser
[ρ] Resilience: Handles malformed schemas gracefully
[κ] Knowledge: Source of truth for database structure

Parses prisma/schema.prisma to understand available models, fields, and relations.

Created: 2025-10-14
ATD Version: 3.1.0 (D3 Enterprise Grade)
"""

import re
from pathlib import Path
from typing import Dict, List, Set, Optional


class PrismaSchemaParser:
    """
    [σ] Prisma Schema Parser - Enterprise Grade

    Extracts:
    - All model names with case variations
    - All field names per model
    - All relations between models
    - Enum types and values
    """

    def __init__(self, schema_path: Path):
        """
        [κ] Initialize parser with schema path

        Args:
            schema_path: Path to prisma/schema.prisma
        """
        self.schema_path = schema_path
        self.models: Dict[str, Dict] = {}
        self.enums: Dict[str, List[str]] = {}
        self.relations: Dict[str, List[str]] = {}

        # Parse if schema exists
        if self.schema_path.exists():
            self._parse_schema()

    def _parse_schema(self):
        """
        [σ] Parse Prisma schema file

        Extracts models, fields, relations, and enums
        """
        try:
            content = self.schema_path.read_text(encoding='utf-8')

            # Parse models
            self._parse_models(content)

            # Parse enums
            self._parse_enums(content)

        except Exception as e:
            print(f"[PrismaParser] Warning: Error parsing schema: {e}")

    def _parse_models(self, content: str):
        """
        [κ] Parse model definitions from schema

        Args:
            content: Full schema file content
        """
        # Pattern: model ModelName { ... }
        model_pattern = r'model\s+(\w+)\s*\{([^}]+)\}'

        for match in re.finditer(model_pattern, content, re.DOTALL):
            model_name = match.group(1)
            model_body = match.group(2)

            self.models[model_name] = {
                'fields': self._parse_fields(model_body),
                'relations': self._parse_relations(model_body)
            }

    def _parse_fields(self, model_body: str) -> List[str]:
        """
        [σ] Extract field names from model body

        Args:
            model_body: Content between model { ... }

        Returns:
            List of field names
        """
        fields = []

        # Pattern: fieldName Type ... (field definition line)
        # Skip lines starting with //, @@, or @
        field_pattern = r'^\s*([a-zA-Z_]\w+)\s+\w+'

        for line in model_body.split('\n'):
            line = line.strip()

            # Skip comments and annotations
            if line.startswith('//') or line.startswith('@@') or line.startswith('@'):
                continue

            match = re.match(field_pattern, line)
            if match:
                field_name = match.group(1)
                fields.append(field_name)

        return fields

    def _parse_relations(self, model_body: str) -> List[str]:
        """
        [κ] Extract relation field names

        Args:
            model_body: Content between model { ... }

        Returns:
            List of relation field names
        """
        relations = []

        # Pattern: fieldName ModelType @relation or fieldName ModelType[]
        relation_pattern = r'^\s*([a-zA-Z_]\w+)\s+(\w+)(\[\])?\s+@relation'

        for line in model_body.split('\n'):
            line = line.strip()

            if '@relation' in line:
                match = re.match(r'^\s*([a-zA-Z_]\w+)\s+', line)
                if match:
                    relations.append(match.group(1))

        return relations

    def _parse_enums(self, content: str):
        """
        [σ] Parse enum definitions from schema

        Args:
            content: Full schema file content
        """
        # Pattern: enum EnumName { ... }
        enum_pattern = r'enum\s+(\w+)\s*\{([^}]+)\}'

        for match in re.finditer(enum_pattern, content, re.DOTALL):
            enum_name = match.group(1)
            enum_body = match.group(2)

            # Extract enum values (one per line, skip comments)
            values = []
            for line in enum_body.split('\n'):
                line = line.strip()
                if line and not line.startswith('//'):
                    # Extract first word (enum value)
                    value_match = re.match(r'^(\w+)', line)
                    if value_match:
                        values.append(value_match.group(1))

            self.enums[enum_name] = values

    def get_model_names(self) -> List[str]:
        """
        [κ] Get all model names

        Returns:
            List of model names
        """
        return list(self.models.keys())

    def get_model_fields(self, model_name: str) -> List[str]:
        """
        [σ] Get fields for a specific model

        Args:
            model_name: Name of model

        Returns:
            List of field names, or empty list if model not found
        """
        return self.models.get(model_name, {}).get('fields', [])

    def get_model_relations(self, model_name: str) -> List[str]:
        """
        [κ] Get relation fields for a specific model

        Args:
            model_name: Name of model

        Returns:
            List of relation field names
        """
        return self.models.get(model_name, {}).get('relations', [])

    def suggest_model_correction(self, incorrect_name: str) -> Optional[str]:
        """
        [σ] Suggest correction for incorrect model name

        Strategy:
        1. Exact match (case-insensitive)
        2. Contains match (e.g., "user" in "StaffUser")
        3. Fuzzy match (edit distance)

        Args:
            incorrect_name: Incorrect model name from error

        Returns:
            Suggested correct model name, or None
        """
        incorrect_lower = incorrect_name.lower()

        # Strategy 1: Exact case-insensitive match
        for model_name in self.models.keys():
            if model_name.lower() == incorrect_lower:
                return model_name

        # Strategy 2: Contains match (e.g., "user" -> "StaffUser")
        for model_name in self.models.keys():
            if incorrect_lower in model_name.lower():
                return model_name

        # Strategy 3: Reverse contains (e.g., "StaffUser" -> "user" in model name)
        for model_name in self.models.keys():
            if model_name.lower() in incorrect_lower:
                return model_name

        return None

    def validate_field_exists(self, model_name: str, field_name: str) -> bool:
        """
        [ρ] Check if a field exists in a model

        Args:
            model_name: Model name
            field_name: Field name to check

        Returns:
            True if field exists, False otherwise
        """
        fields = self.get_model_fields(model_name)
        return field_name in fields

    def get_enum_values(self, enum_name: str) -> List[str]:
        """
        [κ] Get values for an enum

        Args:
            enum_name: Enum name

        Returns:
            List of enum values, or empty list if enum not found
        """
        return self.enums.get(enum_name, [])

    def is_prisma_model(self, type_name: str) -> bool:
        """
        [σ] Check if a type name is a Prisma model

        Args:
            type_name: Type name to check

        Returns:
            True if it's a Prisma model
        """
        return type_name in self.models

    def get_statistics(self) -> Dict:
        """
        [κ] Get schema statistics for reporting

        Returns:
            Dictionary with schema statistics
        """
        total_fields = sum(len(model['fields']) for model in self.models.values())
        total_relations = sum(len(model['relations']) for model in self.models.values())

        return {
            "models_count": len(self.models),
            "enums_count": len(self.enums),
            "total_fields": total_fields,
            "total_relations": total_relations,
            "models": list(self.models.keys()),
            "enums": list(self.enums.keys())
        }

    def __repr__(self) -> str:
        """String representation"""
        stats = self.get_statistics()
        return f"PrismaSchemaParser(models={stats['models_count']}, enums={stats['enums_count']}, fields={stats['total_fields']})"
