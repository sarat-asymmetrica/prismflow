# ALD V1 - Usage Examples

## Basic Usage

### 1. Analyze Violations (No Changes)

```bash
python scripts/ald/ald_v1.py analyze
```

**Output**:

```
======================================================================
ASYMMETRICA LINTING DOCTOR V1 - VIOLATION ANALYSIS
======================================================================
[ALD-V1] Running ESLint analysis...

[ALD-V1] Total violations: 247
[ALD-V1] Auto-fixable: 198

[ALD-V1] Violations by rule:
  no-unused-vars: 89 [AUTO-FIX] [WARNING]
  quotes: 45 [AUTO-FIX] [ERROR]
  prefer-const: 34 [AUTO-FIX] [WARNING]
  semi: 23 [AUTO-FIX] [ERROR]
  no-console: 7 [AUTO-FIX] [WARNING]
  indent: 15 [MANUAL] [ERROR]
  complexity: 8 [MANUAL] [WARNING]
```

---

### 2. Fix All Violations

```bash
python scripts/ald/ald_v1.py fix
```

**Output**:

```
[PHASE 1/6] Git Safety Checkpoint
----------------------------------------------------------------------
[GitManager] OK: Checkpoint created: ald-checkpoint-20251014-143052

[PHASE 2/6] Baseline Violation Count
----------------------------------------------------------------------
[ALD-V1] Baseline: 247 violations

[ALD-V1] Violation breakdown:
  no-unused-vars: 89 [AUTO-FIX]
  quotes: 45 [AUTO-FIX]
  prefer-const: 34 [AUTO-FIX]

[PHASE 3/6] Deterministic Fixes
----------------------------------------------------------------------

[ALD-V1] Processing no-unused-vars: 89 violations
[NoUnusedVars] OK: Prefixed with _ in customer.ts:42
[NoUnusedVars] OK: Prefixed with _ in order.ts:128
[NoUnusedVars] OK: Removed unused import in utils.ts:5
...
[ALD-V1] no-unused-vars: 87 fixed

[ALD-V1] Processing quotes: 45 violations
[Quotes] OK: Fixed quotes in config.ts:12
[Quotes] OK: Fixed quotes in types.ts:34
...
[ALD-V1] quotes: 45 fixed

[ALD-V1] Processing prefer-const: 34 violations
[PreferConst] OK: Changed let to const in api.ts:67
...
[ALD-V1] prefer-const: 34 fixed

[PHASE 4/6] ESLint Auto-Fix Pass
----------------------------------------------------------------------
[ALD-V1] Running ESLint --fix...
[ALD-V1] OK: ESLint auto-fix completed

[PHASE 5/6] Corruption Detection
----------------------------------------------------------------------
[ALD-Corruption] SUCCESS! Fixed 198 violations
[ALD-Corruption]   Baseline: 247
[ALD-Corruption]   Current:  49
[ALD-Corruption]   Fixed:    198

[PHASE 6/6] Code Formatting
----------------------------------------------------------------------
[ALD-V1] Running Prettier...
[ALD-V1] OK: Code formatted with Prettier

======================================================================
ALD V1 COMPLETE
======================================================================
Violations fixed: 198
Remaining violations: 49
Success rate: 80.16%
```

---

### 3. Dry Run (Preview Only)

```bash
python scripts/ald/ald_v1.py fix --dry-run
```

**Output**:

```
[PHASE 1/6] Git Safety Checkpoint
----------------------------------------------------------------------
[GitManager] OK: Checkpoint created: ald-checkpoint-20251014-143052

[PHASE 2/6] Baseline Violation Count
----------------------------------------------------------------------
[ALD-V1] Baseline: 247 violations

[ALD-V1] Violation breakdown:
  no-unused-vars: 89 [AUTO-FIX]
  quotes: 45 [AUTO-FIX]
  prefer-const: 34 [AUTO-FIX]

[ALD-V1] DRY RUN mode - no changes will be made
```

---

### 4. Fix Specific Rule Only

```bash
python scripts/ald/ald_v1.py fix --rule no-unused-vars
```

**Output**:

```
[PHASE 2/6] Baseline Violation Count
----------------------------------------------------------------------
[ALD-V1] Baseline: 247 violations

[PHASE 3/6] Deterministic Fixes
----------------------------------------------------------------------

[ALD-V1] Processing no-unused-vars: 89 violations
[NoUnusedVars] OK: Prefixed with _ in customer.ts:42
[NoUnusedVars] OK: Prefixed with _ in order.ts:128
[NoUnusedVars] OK: Removed unused import in utils.ts:5
[NoUnusedVars] OK: Removed unused import in helpers.ts:12
[NoUnusedVars] OK: Commented out unused var in legacy.ts:234
...
[ALD-V1] no-unused-vars: 87 fixed

[PHASE 5/6] Corruption Detection
----------------------------------------------------------------------
[ALD-Corruption] SUCCESS! Fixed 87 violations
[ALD-Corruption]   Baseline: 247
[ALD-Corruption]   Current:  160
[ALD-Corruption]   Fixed:    87
```

---

## Real-World Scenarios

### Scenario 1: New Project Cleanup

```bash
# You inherit a project with 500+ ESLint violations

# Step 1: Analyze
python scripts/ald/ald_v1.py analyze

# Output shows:
# Total: 523 violations
# Auto-fixable: 412

# Step 2: Fix auto-fixable
python scripts/ald/ald_v1.py fix

# Result: 412 fixed, 111 remaining (manual fixes needed)

# Step 3: Commit
git add -A
git commit -m "fix: ALD V1 auto-fix (412 violations)"
```

---

### Scenario 2: Quote Style Standardization

```bash
# Your team decides to switch from double to single quotes

# Step 1: Update ESLint config
# .eslintrc.json: "quotes": ["error", "single"]

# Step 2: Fix just quotes
python scripts/ald/ald_v1.py fix --rule quotes

# Output:
# [Quotes] OK: Fixed quotes in customer.ts:12
# [Quotes] OK: Fixed quotes in order.ts:34
# ...
# quotes: 145 fixed

# Step 3: Done!
```

---

### Scenario 3: Unused Variable Cleanup

```bash
# You have lots of unused variables

# Step 1: Fix just no-unused-vars
python scripts/ald/ald_v1.py fix --rule no-unused-vars

# Strategies applied:
# - Function parameters prefixed with _
# - Unused imports removed
# - Unused declarations commented out

# Step 2: Review changes
git diff

# Step 3: Commit or rollback
git commit -m "fix: unused variables"
# OR
git reset --hard HEAD  # rollback if needed
```

---

### Scenario 4: Corruption Detection in Action

```bash
# You run ALD V1 and it detects corruption

python scripts/ald/ald_v1.py fix

# Output:
# [PHASE 5/6] Corruption Detection
# ----------------------------------------------------------------------
# [ALD-Corruption] CORRUPTION DETECTED!
# [ALD-Corruption]   Baseline: 247 violations
# [ALD-Corruption]   Current:  289 violations  <-- INCREASED!
# [ALD-Corruption]   Delta:    +42
# [GitManager] Rolling back to baseline...
# [GitManager] OK: Rollback successful - all changes discarded
# [ALD-V1] CRITICAL: Corruption detected - fixes reverted!

# Your code is safe! No bad changes persisted.
```

---

### Scenario 5: CI/CD Integration

```yaml
# .github/workflows/lint-fix.yml

name: Auto-fix ESLint violations

on:
  push:
    branches: [develop]

jobs:
  lint-fix:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.10"

      - name: Run ALD V1
        run: python scripts/ald/ald_v1.py fix

      - name: Verify no corruption
        run: |
          violations=$(python scripts/ald/ald_v1.py analyze | grep "Total violations" | awk '{print $3}')
          if [ $violations -gt 100 ]; then
            echo "Too many violations remaining: $violations"
            exit 1
          fi

      - name: Commit fixes
        run: |
          git config user.name "ALD Bot"
          git config user.email "ald@example.com"
          git add -A
          git commit -m "fix: ALD V1 auto-fix" || echo "No changes"
          git push
```

---

### Scenario 6: Pre-commit Hook

```bash
# .git/hooks/pre-commit

#!/bin/bash
echo "Running ALD V1..."

# Run analyze
violations=$(python scripts/ald/ald_v1.py analyze 2>&1 | grep "Total violations" | awk '{print $3}')

if [ $violations -gt 0 ]; then
    echo "Found $violations ESLint violations"
    echo "Running auto-fix..."
    python scripts/ald/ald_v1.py fix

    # Re-analyze
    new_violations=$(python scripts/ald/ald_v1.py analyze 2>&1 | grep "Total violations" | awk '{print $3}')

    echo "Violations after fix: $new_violations"

    if [ $new_violations -lt $violations ]; then
        echo "ALD V1 fixed some violations. Please review and re-commit."
        exit 1
    fi
fi

exit 0
```

---

### Scenario 7: Gradual Migration

```bash
# You have 1000+ violations and want to fix gradually

# Week 1: Fix no-unused-vars
python scripts/ald/ald_v1.py fix --rule no-unused-vars
git commit -m "fix: unused variables (Week 1)"

# Week 2: Fix quotes
python scripts/ald/ald_v1.py fix --rule quotes
git commit -m "fix: quote style (Week 2)"

# Week 3: Fix prefer-const
python scripts/ald/ald_v1.py fix --rule prefer-const
git commit -m "fix: prefer const (Week 3)"

# Week 4: Fix remaining
python scripts/ald/ald_v1.py fix
git commit -m "fix: remaining auto-fixable (Week 4)"
```

---

### Scenario 8: Testing on Sample File

```bash
# Test ALD V1 on the included test file

# Copy test file to your src
cp scripts/ald/test-ald-v1.js src/test-ald-demo.js

# Analyze it
python scripts/ald/ald_v1.py analyze

# Fix it
python scripts/ald/ald_v1.py fix

# Review changes
git diff src/test-ald-demo.js

# Clean up
rm src/test-ald-demo.js
```

---

## Troubleshooting Examples

### Issue: "No ESLint output"

```bash
# Problem: ALD says no violations found but you know there are some

# Solution: Check ESLint is configured
npx eslint --version
ls eslint.config.js .eslintrc.json

# If no config, create one:
npx eslint --init
```

---

### Issue: "Too many violations remain"

```bash
# Problem: ALD fixed some but many remain

# Solution: Analyze what's left
python scripts/ald/ald_v1.py analyze

# Look for [MANUAL] violations - these need manual fixes
# Common manual-only violations:
# - complexity (refactor needed)
# - max-lines (split file needed)
# - no-any (TypeScript type needed)
```

---

### Issue: "Want to undo fixes"

```bash
# Problem: ALD fixed but you want original back

# Solution 1: Git reset (if not committed)
git reset --hard HEAD

# Solution 2: Git stash pop (if checkpoint exists)
git stash list  # Find ald-checkpoint
git stash pop stash@{0}
```

---

## Advanced Usage

### Custom Rule Priority

```bash
# Fix in order of priority: syntax → style → quality

# 1. Syntax first (critical)
python scripts/ald/ald_v1.py fix --rule no-extra-semi
python scripts/ald/ald_v1.py fix --rule semi

# 2. Style next
python scripts/ald/ald_v1.py fix --rule quotes
python scripts/ald/ald_v1.py fix --rule indent

# 3. Quality last
python scripts/ald/ald_v1.py fix --rule no-unused-vars
python scripts/ald/ald_v1.py fix --rule prefer-const
```

---

### Batch Processing Multiple Projects

```bash
#!/bin/bash
# fix-all-projects.sh

projects=(
    "project-a"
    "project-b"
    "project-c"
)

for project in "${projects[@]}"; do
    echo "Fixing $project..."
    cd "$project"
    python scripts/ald/ald_v1.py fix
    git commit -am "fix: ALD V1 auto-fix"
    cd ..
done
```

---

## Success Patterns

### ✅ Do This

- Run `analyze` before `fix` (understand what will change)
- Use `--dry-run` for large projects
- Fix one rule at a time for large violation counts
- Review changes before committing
- Commit frequently (after each successful fix)

### ❌ Don't Do This

- Don't run on uncommitted changes (commit first!)
- Don't skip the analyze step
- Don't ignore remaining manual violations
- Don't disable ESLint after fixing (keep it clean!)

---

**ALD V1 Usage Examples**
_Pattern: ATD V3 D3 | Enterprise D3 Quality_
