# ATD V3 Quick Start Guide

**Get from 324 errors to 83 in 30 seconds** with Git safety!

## 🚀 Quick Start (3 Commands)

```bash
# 1. Go to ATD directory
cd c:/Projects/AsymmFlow-PH-Trading/scripts/atd

# 2. Analyze errors
python atd_v3.py analyze

# 3. Fix with Git safety
python atd_v3.py fix --all
```

**That's it!** ATD V3 will:

- Create Git checkpoint
- Fix 241 errors automatically
- Validate (no corruption)
- Offer AI collaboration for remaining 83

## 🔄 If Something Goes Wrong

```bash
# Nuclear rollback (restore everything)
python atd_v3.py rollback --full

# Surgical rollback (revert last batch only)
python atd_v3.py rollback --last
```

## 🧪 Test First (Recommended)

```bash
# Test on test file before real code
cd c:/Projects/AsymmFlow-PH-Trading
scripts\test-atd-v3.bat
```

## 📊 What You'll See

### Analysis Output

```
ASYMMETRICA TYPESCRIPT DOCTOR V3 - ERROR ANALYSIS
======================================================================

[ATD-V3] Total errors: 324

Error Breakdown:
----------------------------------------------------------------------
  TS2307: 180 errors - Cannot find module [OK] AUTO-FIXABLE
  TS7006:  61 errors - Implicit 'any' type [OK] AUTO-FIXABLE
  TS2339:  45 errors - Property does not exist [AI] AI COLLABORATION
----------------------------------------------------------------------

[ATD-V3] 241 auto-fixable, 83 require AI collaboration
```

### Fix Output

```
[PHASE 1/6] Git Safety Checkpoint
----------------------------------------------------------------------
[ATD-Git] Creating safety checkpoint...
[ATD-Git] Checkpoint created successfully!
[ATD-Git]   Baseline: a3f7d891
[ATD-Git]   Branch: atd-fixes-20251014-153022

[PHASE 2/6] Baseline Error Count
----------------------------------------------------------------------
[ATD-V3] Baseline: 324 errors

[PHASE 3/6] Deterministic Fixes
----------------------------------------------------------------------
[ATD-V3] Processing TS2307: 180 errors
[ATD-V3] TS2307: 180 fixed

[ATD-V3] Processing TS7006: 61 errors
[ATD-V3] TS7006: 61 fixed

[PHASE 4/6] Corruption Detection
----------------------------------------------------------------------
[ATD-Corruption] Validating fixes...
[ATD-Corruption] SUCCESS! Fixed 241 errors

[PHASE 5/6] AI Collaboration
----------------------------------------------------------------------
[ATD-V3] 83 errors remain
[ATD-V3] These errors require AI collaboration
[ATD-V3] Detected AI: Claude Code

[ATD-V3] Generate AI collaboration prompts? (y/n):

[PHASE 6/6] Final Report
----------------------------------------------------------------------
ATD V3 FINAL REPORT
======================================================================
Errors fixed: 241
Errors remaining: 83
Success rate: 74%
======================================================================

[ATD-V3] Safety Options:
  1. Keep fixes: git merge main
  2. Rollback all: python scripts/atd/atd_v3.py rollback --full
  3. Rollback last: python scripts/atd/atd_v3.py rollback --last
```

## 🎯 Common Scenarios

### Scenario 1: "Just fix everything I can"

```bash
python atd_v3.py analyze
python atd_v3.py fix --all
# Review changes
git checkout main && git merge atd-fixes-{timestamp}
```

### Scenario 2: "Fix imports only"

```bash
python atd_v3.py fix --type TS2307
```

### Scenario 3: "Preview fixes first"

```bash
python atd_v3.py fix --all --dry-run
# No files modified, just shows what would be fixed
```

### Scenario 4: "Test on test file"

```bash
python atd_v3.py fix --all --test-mode
# Skips Git checkpoint for testing
```

### Scenario 5: "I made a mistake, undo everything"

```bash
python atd_v3.py rollback --full
# Restores to baseline, like nothing happened
```

### Scenario 6: "Last batch was bad, keep earlier fixes"

```bash
python atd_v3.py rollback --last
# Reverts only the last commit
```

## 🔍 Verify Results

```bash
# Check TypeScript errors
npx tsc --noEmit

# Check Git history
git log --oneline -5

# Check what changed
git diff main

# Check ATD logs
type .atd\logs\session-*.json
```

## 🆘 Emergency Procedures

### ATD created a broken commit

```bash
# Nuclear rollback
python atd_v3.py rollback --full

# Verify clean state
git status
npx tsc --noEmit
```

### Errors increased after fix

ATD should detect this automatically and revert. If not:

```bash
# Manual rollback
python atd_v3.py rollback --last

# Check corruption log
type .atd\corruption-log.json
```

### Git conflicts

```bash
# Rollback to baseline
python atd_v3.py rollback --full

# Resolve conflicts manually
git stash pop
```

## 📁 Important Files

```
.atd/
├── registry.json              # Current error analysis
├── git-state.json             # Git checkpoint state
├── corruption-log.json        # Corruption events (check if issues)
├── ai-collaboration-log.json  # AI interaction history
└── logs/session-*.json        # Complete session logs
```

## 🎓 Pro Tips

1. **Always test first**: Run on `test-atd-v3.ts` before real code
2. **Review commits**: Use `git log --oneline` to see what ATD did
3. **Check corruption log**: If fixes reverted, check `.atd/corruption-log.json`
4. **Use dry run**: Preview fixes with `--dry-run` before applying
5. **One error type at a time**: Use `--type` for focused fixing
6. **Keep session logs**: `.atd/logs/` tracks everything for debugging

## 🚨 Troubleshooting

| Problem                      | Solution                                               |
| ---------------------------- | ------------------------------------------------------ |
| "Not a git repository"       | Run `git init && git add . && git commit -m "Initial"` |
| "No package.json found"      | Run from project root                                  |
| "TypeScript timed out"       | Check `tsconfig.json`, exclude large dirs              |
| "No errors found"            | Success! Or run `npx tsc --noEmit` to verify           |
| Fixes reverted automatically | Check `.atd/corruption-log.json` for reason            |

## 📚 Learn More

- Full documentation: `README_V3.md`
- Architecture details: `ATD_V3_COMPLETE_ARCHITECTURE.md`
- Test script: `test-atd-v3.bat`

## 🎯 Success Checklist

After running ATD V3, verify:

- [ ] Error count decreased (run `npx tsc --noEmit`)
- [ ] Build still works (run `npm run build`)
- [ ] Git branch created (see `git branch`)
- [ ] Commits have Asymmetrica annotations (see `git log`)
- [ ] Session log created (check `.atd/logs/`)
- [ ] No corruption events (check `.atd/corruption-log.json`)

## 💡 Philosophy

> "If it fails? Roll it back!"

ATD V3 gives you **fearless TypeScript fixing**:

- Try fixes confidently
- Git protects you
- Rollback anytime
- No fear of breaking things

**Start fixing!** 🚀
