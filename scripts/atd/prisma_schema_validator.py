"""
[σ] Semantic: Prisma Schema Validator
[κ] Knowledge: Identifies schema drift between code and database

Analyzes TypeScript errors to identify missing Prisma models and fields,
then generates a migration recommendation report.

Created: 2025-10-14
ATD Version: 3.1.0 (D3 Enterprise Grade)
"""

import re
from pathlib import Path
from typing import List, Dict, Set
from prisma_schema_parser import PrismaSchemaParser


class PrismaSchemaValidator:
    """
    [σ] Prisma Schema Validator - Enterprise Grade

    Analyzes TypeScript errors to detect:
    - Missing models referenced in code
    - Missing fields in existing models
    - Schema drift patterns
    """

    def __init__(self, project_root: Path):
        """
        [κ] Initialize validator with Prisma schema

        Args:
            project_root: Root directory of project
        """
        self.project_root = project_root
        self.prisma_parser = PrismaSchemaParser(project_root / "prisma" / "schema.prisma")

        # Collections for missing items
        self.missing_models: Set[str] = set()
        self.missing_fields: Dict[str, Set[str]] = {}
        self.case_mismatches: List[Dict] = []

    def validate_against_errors(self, errors: List[Dict]):
        """
        [ρ] Analyze errors to find schema gaps

        Args:
            errors: List of TypeScript errors
        """
        for error in errors:
            error_code = error.get('error_code', '')
            message = error.get('message', '')

            if error_code == 'TS2339':
                self._analyze_ts2339_error(message, error)

            elif error_code == 'TS2305':
                self._analyze_ts2305_error(message, error)

    def _analyze_ts2339_error(self, message: str, error: Dict):
        """
        [σ] Analyze TS2339 "Property does not exist" error

        Args:
            message: Error message
            error: Full error dictionary
        """
        # Pattern 1: Missing model on PrismaClient
        if "does not exist on type 'PrismaClient" in message:
            match = re.search(r"Property '(\w+)' does not exist", message)
            if match:
                model_name = match.group(1)

                # Check if suggestion exists
                suggestion = self.prisma_parser.suggest_model_correction(model_name)
                if not suggestion:
                    # Truly missing
                    self.missing_models.add(model_name)
                else:
                    # Case mismatch
                    self.case_mismatches.append({
                        "type": "model",
                        "incorrect": model_name,
                        "correct": suggestion,
                        "file": error.get('file', 'unknown'),
                        "line": error.get('line', 0)
                    })

        # Pattern 2: Missing field on model type
        elif "does not exist in type" in message:
            match = re.search(r"'(\w+)' does not exist in type '(\w+)", message)
            if match:
                field_name = match.group(1)
                model_name = match.group(2)

                # Check if it's a Prisma model
                if self.prisma_parser.is_prisma_model(model_name):
                    # Check if field exists
                    if not self.prisma_parser.validate_field_exists(model_name, field_name):
                        # Field missing
                        if model_name not in self.missing_fields:
                            self.missing_fields[model_name] = set()
                        self.missing_fields[model_name].add(field_name)

    def _analyze_ts2305_error(self, message: str, error: Dict):
        """
        [κ] Analyze TS2305 "Module has no exported member" error

        Args:
            message: Error message
            error: Full error dictionary
        """
        # Check if it's a Prisma client import
        if "@prisma/client" in message or "generated/prisma" in message:
            match = re.search(r"has no exported member '(\w+)'", message)
            if match:
                member_name = match.group(1)

                # Check if it's a model name
                if not self.prisma_parser.is_prisma_model(member_name):
                    self.missing_models.add(member_name)

    def generate_migration_report(self) -> str:
        """
        [σ] Generate Prisma migration recommendations

        Returns:
            Formatted report string
        """
        report = []
        report.append("=" * 70)
        report.append("PRISMA SCHEMA VALIDATION REPORT")
        report.append("=" * 70)

        # Schema statistics
        stats = self.prisma_parser.get_statistics()
        report.append(f"\nCurrent Schema Statistics:")
        report.append(f"  Models: {stats['models_count']}")
        report.append(f"  Enums: {stats['enums_count']}")
        report.append(f"  Total Fields: {stats['total_fields']}")
        report.append(f"  Total Relations: {stats['total_relations']}")

        # Missing models
        if self.missing_models:
            report.append(f"\n[CRITICAL] Missing Models ({len(self.missing_models)}):")
            report.append("-" * 70)
            for model in sorted(self.missing_models):
                report.append(f"  X {model}")
                report.append(f"      -> Code references this model but it's not in schema")
        else:
            report.append("\n[OK] No missing models detected")

        # Missing fields
        if self.missing_fields:
            report.append(f"\n[CRITICAL] Missing Fields ({sum(len(fields) for fields in self.missing_fields.values())}):")
            report.append("-" * 70)
            for model, fields in sorted(self.missing_fields.items()):
                report.append(f"\n  Model: {model}")
                for field in sorted(fields):
                    report.append(f"    X {field}")
                    report.append(f"        -> Field used in code but not in schema")

                # Suggest similar fields
                all_fields = self.prisma_parser.get_model_fields(model)
                for field in sorted(fields):
                    similar = [f for f in all_fields if field.lower() in f.lower() or f.lower() in field.lower()]
                    if similar:
                        report.append(f"        -> Similar: {', '.join(similar[:3])}")
        else:
            report.append("\n[OK] No missing fields detected")

        # Case mismatches (fixable by ATD)
        if self.case_mismatches:
            report.append(f"\n[WARNING] Case Mismatches ({len(self.case_mismatches)}) - Auto-fixable:")
            report.append("-" * 70)
            for mismatch in self.case_mismatches[:10]:  # Show first 10
                report.append(f"  {mismatch['incorrect']} -> {mismatch['correct']}")
                report.append(f"    {mismatch['file']}:{mismatch['line']}")
            if len(self.case_mismatches) > 10:
                report.append(f"  ... and {len(self.case_mismatches) - 10} more")

        # Recommendations
        report.append("\n" + "=" * 70)
        report.append("RECOMMENDED ACTIONS:")
        report.append("=" * 70)

        if self.missing_models or self.missing_fields:
            report.append("\n1. Update prisma/schema.prisma with missing models/fields")

            if self.missing_models:
                report.append("\n   Missing Models to Add:")
                for model in sorted(self.missing_models):
                    report.append(f"   model {model} {{")
                    report.append(f"     id        String   @id @default(uuid()) @db.Uuid")
                    report.append(f"     createdAt DateTime @default(now())")
                    report.append(f"     updatedAt DateTime @updatedAt")
                    report.append(f"     // TODO: Add fields based on code usage")
                    report.append(f"     @@map(\"{model.lower()}s\")")
                    report.append(f"   }}\n")

            if self.missing_fields:
                report.append("\n   Missing Fields to Add:")
                for model, fields in sorted(self.missing_fields.items()):
                    report.append(f"\n   In model {model}:")
                    for field in sorted(fields):
                        report.append(f"     {field}  String?  // TODO: Set correct type")

            report.append("\n2. Run: npx prisma migrate dev --name schema_alignment")
            report.append("3. Run: npx prisma generate")
            report.append("4. Re-run: python scripts/atd/atd_v3.py fix --all")

        if self.case_mismatches:
            report.append("\n5. Case mismatches will be auto-fixed by ATD V3")

        if not self.missing_models and not self.missing_fields and not self.case_mismatches:
            report.append("\n[SUCCESS] Schema is aligned with code!")
            report.append("No migrations needed.")

        report.append("\n" + "=" * 70)

        return "\n".join(report)

    def has_issues(self) -> bool:
        """
        [ρ] Check if any issues were detected

        Returns:
            True if issues found
        """
        return bool(self.missing_models or self.missing_fields)

    def get_summary(self) -> Dict:
        """
        [κ] Get validation summary

        Returns:
            Dictionary with validation results
        """
        return {
            "missing_models": len(self.missing_models),
            "missing_fields": sum(len(fields) for fields in self.missing_fields.values()),
            "case_mismatches": len(self.case_mismatches),
            "has_critical_issues": self.has_issues()
        }
