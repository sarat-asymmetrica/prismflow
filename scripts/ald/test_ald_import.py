"""
Quick test to verify ALD V1 modules can be imported
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

try:
    from ald_v1 import AsymmetricaLintingDoctor
    print("[OK] ald_v1.AsymmetricaLintingDoctor imported successfully")
except ImportError as e:
    print(f"[FAIL] Could not import AsymmetricaLintingDoctor: {e}")

try:
    from git_manager import GitManager
    print("[OK] git_manager.GitManager imported successfully")
except ImportError as e:
    print(f"[FAIL] Could not import GitManager: {e}")

try:
    from corruption_detector import CorruptionDetector
    print("[OK] corruption_detector.CorruptionDetector imported successfully")
except ImportError as e:
    print(f"[FAIL] Could not import CorruptionDetector: {e}")

try:
    from eslint_config_analyzer import ESLintConfigAnalyzer
    print("[OK] eslint_config_analyzer.ESLintConfigAnalyzer imported successfully")
except ImportError as e:
    print(f"[FAIL] Could not import ESLintConfigAnalyzer: {e}")

try:
    from rule_analyzer import RuleAnalyzer
    print("[OK] rule_analyzer.RuleAnalyzer imported successfully")
except ImportError as e:
    print(f"[FAIL] Could not import RuleAnalyzer: {e}")

try:
    from fixers.no_unused_vars_fixer import NoUnusedVarsFixer
    print("[OK] fixers.NoUnusedVarsFixer imported successfully")
except ImportError as e:
    print(f"[FAIL] Could not import NoUnusedVarsFixer: {e}")

try:
    from fixers.no_console_fixer import NoConsoleFixer
    print("[OK] fixers.NoConsoleFixer imported successfully")
except ImportError as e:
    print(f"[FAIL] Could not import NoConsoleFixer: {e}")

try:
    from fixers.prefer_const_fixer import PreferConstFixer
    print("[OK] fixers.PreferConstFixer imported successfully")
except ImportError as e:
    print(f"[FAIL] Could not import PreferConstFixer: {e}")

try:
    from fixers.quotes_fixer import QuotesFixer
    print("[OK] fixers.QuotesFixer imported successfully")
except ImportError as e:
    print(f"[FAIL] Could not import QuotesFixer: {e}")

try:
    from fixers.semi_fixer import SemiFixer
    print("[OK] fixers.SemiFixer imported successfully")
except ImportError as e:
    print(f"[FAIL] Could not import SemiFixer: {e}")

print("\n" + "="*60)
print("ALD V1 MODULE IMPORT TEST COMPLETE")
print("="*60)
