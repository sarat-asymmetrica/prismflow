# 🚀 ENGINE PORTING - QUICK REFERENCE

## TL;DR: Best Practice for Reusable Engines

---

## ⚡ FASTEST SETUP (5 MINUTES)

### Step 1: Run Setup Script
```powershell
# In asymmetrica_methodology_general_templates folder:
.\setup-engines-repo.ps1

# Choose location (default: C:\Projects\AsymmetricaEngines)
```

### Step 2: Copy Your Engine Code
```powershell
# Copy just the .js files (NO node_modules!)
cp "c:\Projects\PrismFlow Final\src\williams-optimizer.js" `
   "C:\Projects\AsymmetricaEngines\packages\williams-optimizer\src\"

cp "c:\Projects\PrismFlow Final\src\tesla-timer.js" `
   "C:\Projects\AsymmetricaEngines\packages\tesla-harmonic-timer\src\"
```

### Step 3: Use in Projects
```json
// In your project's package.json:
{
  "dependencies": {
    "@asymmetrica/williams-optimizer": "file:../AsymmetricaEngines/packages/williams-optimizer",
    "@asymmetrica/tesla-harmonic-timer": "file:../AsymmetricaEngines/packages/tesla-harmonic-timer"
  }
}
```

```bash
npm install
```

### Step 4: Import and Use
```javascript
// In your project code:
const WilliamsOptimizer = require('@asymmetrica/williams-optimizer');
const TeslaTimer = require('@asymmetrica/tesla-harmonic-timer');

// Use as before!
const optimizer = new WilliamsOptimizer();
```

**Done!** ✅ No node_modules, no cache files, clean copies!

---

## 📋 WHAT GETS COPIED

### ✅ INCLUDED (via "files" in package.json):
- `src/` folder (your code)
- `README.md` (documentation)
- `package.json` (metadata)

### ❌ EXCLUDED (by .gitignore + .npmignore):
- `node_modules/` (NEVER copied!)
- `__pycache__/` (Python cache)
- `*.pyc` (compiled Python)
- `*.log` (log files)
- `.nul` (null files)
- `coverage/` (test coverage)
- `dist/` (build artifacts)

**Result**: Only clean source code! 🎯

---

## 🔄 UPDATING ENGINES

### Make Change in Engine:
```bash
cd C:\Projects\AsymmetricaEngines\packages\williams-optimizer
# Edit src/williams-optimizer.js
git add .
git commit -m "fix: memory smoothing edge case"
git push
```

### Update in Projects:
```bash
cd c:\Projects\PrismFlow Final
npm install --force

# Or just:
npm install
```

**Done!** Changes reflected in all projects using the engine.

---

## 🎯 FOUR OPTIONS COMPARED

| Method | Setup | Speed | Best For |
|--------|-------|-------|----------|
| **1. NPM Packages** ⭐ | 1-2 hours | ⚡⚡⚡ | Production, multiple projects |
| **2. Git Submodules** | 30 min | ⚡⚡ | Multi-language, git workflow |
| **3. Symlinks** | 5 min | ⚡⚡⚡⚡ | Local dev only (same machine) |
| **4. Template Files** | Immediate | ⚡ | Small engines, rare updates |

**Recommended for you: Option 1 (NPM Packages)** 🏆

---

## 🛠️ COMMON COMMANDS

### Create New Engine:
```bash
cd C:\Projects\AsymmetricaEngines\packages
mkdir my-new-engine
cd my-new-engine
npm init -y

# Edit package.json:
# - Set name: @asymmetrica/my-new-engine
# - Set main: src/index.js
# - Add files: ["src/"]

# Add code:
mkdir src
# Create src/index.js

# Commit:
git add .
git commit -m "Add my-new-engine"
```

### Add Engine to Project:
```bash
cd your-project
npm install ../AsymmetricaEngines/packages/my-new-engine
```

### Update All Engines:
```bash
cd your-project
npm update
```

### Remove Engine from Project:
```bash
npm uninstall @asymmetrica/my-new-engine
```

---

## 🚨 TROUBLESHOOTING

### Problem: node_modules still being copied
**Fix**: Add "files" to package.json:
```json
{
  "files": ["src/", "README.md"]
}
```

### Problem: Changes not reflected
**Fix**: Force reinstall:
```bash
npm install --force
```

### Problem: Can't find module
**Fix**: Check package name and path:
```json
{
  "dependencies": {
    "@asymmetrica/williams-optimizer": "file:../AsymmetricaEngines/packages/williams-optimizer"
  }
}
```

### Problem: Git says files changed but I didn't change them
**Fix**: Check line endings, add to .gitattributes:
```
* text=auto
```

---

## ✅ VERIFICATION CHECKLIST

After setup, verify:
- [ ] Engines repo has NO node_modules folder
- [ ] Each engine has package.json with "files" array
- [ ] .gitignore exists and includes node_modules
- [ ] Can `npm install` in test project
- [ ] Engine works in test project
- [ ] Changes to engine reflect in project after reinstall
- [ ] Git repo size is small (<1MB for code-only)

---

## 📁 FINAL STRUCTURE

```
AsymmetricaEngines/                    (Your engines repo)
├── .gitignore                         (Prevents junk)
├── package.json                       (Root config)
├── README.md                          (Main docs)
└── packages/
    ├── williams-optimizer/
    │   ├── package.json               (Has "files" array)
    │   ├── README.md
    │   └── src/
    │       └── williams-optimizer.js  (ONLY YOUR CODE!)
    ├── tesla-harmonic-timer/
    │   ├── package.json
    │   ├── README.md
    │   └── src/
    │       └── tesla-timer.js
    └── abnp-telemetry/
        ├── package.json
        ├── README.md
        └── src/
            └── abnp-telemetry.js

YourProject/                           (Using the engines)
├── package.json
│   └── dependencies:
│       └── "@asymmetrica/williams-optimizer": "file:../AsymmetricaEngines/..."
├── node_modules/
│   └── @asymmetrica/
│       └── williams-optimizer/        (Symlink or copy, NO sub node_modules!)
└── src/
    └── main.js
        └── const WilliamsOptimizer = require('@asymmetrica/williams-optimizer');
```

**Key**: No nested node_modules, no cache files, just clean code! ✨

---

## 🎓 BEST PRACTICES

1. **Keep engines standalone** - Zero dependencies on projects
2. **Use semantic versioning** - 1.0.0, 1.0.1, 1.1.0, 2.0.0
3. **Document API clearly** - README with usage examples
4. **Test in isolation** - Each engine should work independently
5. **Tag releases** - `git tag v1.0.0`
6. **Never commit node_modules** - Check .gitignore!
7. **Use "files" array** - Whitelist what gets published
8. **Update changelog** - Document changes for future you

---

## 🎯 TYPICAL WORKFLOW

### Daily Development:
```bash
# Morning: Check engines repo is up to date
cd C:\Projects\AsymmetricaEngines
git pull

# Work on project
cd c:\Projects\MyProject
npm install  # Get latest engine versions
npm start

# Make engine change if needed
cd C:\Projects\AsymmetricaEngines\packages\williams-optimizer
# Edit code
git commit -m "fix: edge case"

# Update project
cd c:\Projects\MyProject
npm install --force
```

### New Project Setup:
```bash
# 1. Create new project
cd c:\Projects
mkdir NewProject
cd NewProject
npm init -y

# 2. Add engines
# Edit package.json, add dependencies with file: paths
npm install

# 3. Start coding!
```

---

## 💡 PRO TIPS

1. **Use file: paths during development**
   - Fast updates
   - Easy debugging
   - No registry needed

2. **Switch to git URLs for production**
   - Versioned
   - Team can access
   - CI/CD friendly

3. **Create .npmrc for private registry**
   - If using GitHub Packages
   - Or private NPM registry

4. **Use npm workspaces**
   - Manage all engines together
   - Single `npm install` for all

5. **Add pre-commit hooks**
   - Ensure tests pass
   - Check no node_modules

---

## 📚 FURTHER READING

- Full guide: `ENGINE_PORTING_GUIDE.md` (detailed explanations)
- NPM docs: https://docs.npmjs.com/cli/v8/configuring-npm/package-json
- Workspaces: https://docs.npmjs.com/cli/v8/using-npm/workspaces
- Semantic Versioning: https://semver.org/

---

**Summary**: Run setup script → Copy code → Add to package.json → npm install → Done! ✅

*Last Updated: October 15, 2025*  
*"Clean engines, happy projects!"* 🎉
