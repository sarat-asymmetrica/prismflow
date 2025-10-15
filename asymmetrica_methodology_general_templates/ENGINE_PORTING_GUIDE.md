# 🔧 ASYMMETRICA ENGINES - PORTING GUIDE

## How to Reuse Engines Across Projects (The RIGHT Way!)

**Date**: October 15, 2025  
**Purpose**: Guide for porting Williams, Tesla, ABNP, and other Asymmetrica engines without the pain

---

## 🎯 THE PROBLEM

When copying engines between projects, you get:
- ❌ Entire `node_modules/` folder (hundreds of MB)
- ❌ Python `__pycache__/` and `.pyc` files
- ❌ `.nul` files and other junk
- ❌ Massive git commits (slow!)
- ❌ Duplicate code across projects (maintenance nightmare)
- ❌ Version drift (fix bug in one, forgot to update others)

---

## ✅ THE SOLUTIONS (Choose Based on Your Needs)

### **Option 1: NPM Private Packages** ⭐ (BEST for Node.js/Electron)

Create standalone NPM packages for each engine. Publish to private registry or use local packages.

**When to use**:
- ✅ You're building Node.js/Electron projects
- ✅ You want version management
- ✅ You want `npm install` convenience
- ✅ You might publish to NPM eventually

**Setup time**: 1-2 hours (one-time)

---

### **Option 2: Git Submodules** (GOOD for any language)

Use git submodules to link a shared engines repository into multiple projects.

**When to use**:
- ✅ You have multiple project types (Python, Node.js, etc.)
- ✅ You want git version control
- ✅ You're comfortable with git submodules
- ✅ You want atomic updates across projects

**Setup time**: 30 minutes (one-time)

---

### **Option 3: Symlinks** (QUICK & DIRTY for local dev)

Create symbolic links from your projects to a central engines folder.

**When to use**:
- ✅ All projects on same machine
- ✅ Quick local development
- ✅ Don't need version management yet
- ✅ Want immediate updates everywhere

**Setup time**: 5 minutes

---

### **Option 4: Template Files** (SIMPLEST for small engines)

Keep clean template files and copy when needed.

**When to use**:
- ✅ Engines are small (<500 lines)
- ✅ Engines don't change often
- ✅ You want maximum simplicity
- ✅ Each project might customize

**Setup time**: Immediate

---

## 📦 OPTION 1: NPM PRIVATE PACKAGES (DETAILED)

### Step 1: Create Engine Package Structure

```bash
# Create a separate repository for your engines
mkdir asymmetrica-engines
cd asymmetrica-engines
npm init -y

# Set up monorepo structure (optional but recommended)
mkdir packages

# Create Williams Optimizer package
mkdir -p packages/williams-optimizer
cd packages/williams-optimizer
npm init -y
```

### Step 2: Package.json for Williams Optimizer

```json
{
  "name": "@asymmetrica/williams-optimizer",
  "version": "1.0.0",
  "description": "Williams Space Optimization Engine with memory smoothing",
  "main": "src/williams-optimizer.js",
  "scripts": {
    "test": "jest"
  },
  "keywords": ["asymmetrica", "optimization", "memory"],
  "author": "Sarat Chandran (Asymmetrica)",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/sarat-asymmetrica/asymmetrica-engines.git",
    "directory": "packages/williams-optimizer"
  },
  "files": [
    "src/",
    "README.md"
  ],
  "dependencies": {},
  "devDependencies": {
    "jest": "^29.0.0"
  }
}
```

**Key point**: The `"files"` array specifies ONLY what gets published. No `node_modules`, no cache files!

### Step 3: Create .npmignore (Safety Net)

```bash
# packages/williams-optimizer/.npmignore
node_modules/
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
*.log
*.nul
.DS_Store
.env
.vscode/
.idea/
coverage/
.nyc_output/
dist/
build/
*.test.js
*.spec.js
```

### Step 4: Organize Your Engine Code

```
packages/williams-optimizer/
├── package.json
├── .npmignore
├── README.md
├── src/
│   ├── williams-optimizer.js  (main engine)
│   └── utils.js               (helpers if needed)
└── __tests__/                 (tests, NOT published)
    └── williams.test.js
```

### Step 5: Publishing Options

#### Option 5A: NPM Private Registry (Paid)

```bash
# Publish to NPM (requires paid account for private packages)
npm publish --access restricted
```

#### Option 5B: GitHub Packages (Free for private repos)

```json
// In package.json, add:
{
  "publishConfig": {
    "registry": "https://npm.pkg.github.com/@sarat-asymmetrica"
  }
}
```

```bash
# Create GitHub token, then:
npm login --registry=https://npm.pkg.github.com
npm publish
```

#### Option 5C: Local NPM Packages (No registry needed!)

```bash
# In your engine package directory:
npm pack

# This creates: asymmetrica-williams-optimizer-1.0.0.tgz
# Copy this file or use the path directly
```

### Step 6: Use in Other Projects

#### From NPM/GitHub Packages:
```bash
# In your project:
npm install @asymmetrica/williams-optimizer
```

#### From Local Package:
```bash
# In your project:
npm install /path/to/asymmetrica-engines/packages/williams-optimizer

# Or from .tgz:
npm install /path/to/asymmetrica-williams-optimizer-1.0.0.tgz

# Or add to package.json:
{
  "dependencies": {
    "@asymmetrica/williams-optimizer": "file:../asymmetrica-engines/packages/williams-optimizer"
  }
}
```

#### Usage in Code:
```javascript
// In your project
const WilliamsOptimizer = require('@asymmetrica/williams-optimizer');

const optimizer = new WilliamsOptimizer();
const memoryLimit = optimizer.calculateOptimalMemory(tabAge, complexity);
```

---

## 🔗 OPTION 2: GIT SUBMODULES (DETAILED)

### Step 1: Create Engines Repository

```bash
# Create a new repository for engines ONLY
mkdir asymmetrica-engines
cd asymmetrica-engines
git init

# Create clean structure
mkdir engines
mkdir engines/williams-optimizer
mkdir engines/tesla-harmonic-timer
mkdir engines/abnp-telemetry

# Add .gitignore (CRITICAL!)
cat > .gitignore << 'EOF'
node_modules/
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
*.log
*.nul
.DS_Store
.env
.vscode/
.idea/
coverage/
dist/
build/
EOF

git add .
git commit -m "Initial commit: Asymmetrica engines structure"
```

### Step 2: Push to Private GitHub Repository

```bash
# Create private repo on GitHub: asymmetrica-engines
git remote add origin https://github.com/sarat-asymmetrica/asymmetrica-engines.git
git branch -M main
git push -u origin main
```

### Step 3: Add as Submodule in Projects

```bash
# In your PrismFlow project:
cd "c:/Projects/PrismFlow Final"
git submodule add https://github.com/sarat-asymmetrica/asymmetrica-engines.git lib/asymmetrica-engines

# This creates:
# - lib/asymmetrica-engines/ (the submodule)
# - .gitmodules file (tracks submodule)

git commit -m "Add asymmetrica-engines as submodule"
```

### Step 4: Clone Project with Submodules

```bash
# When cloning your project on a new machine:
git clone https://github.com/sarat-asymmetrica/prismflow.git
cd prismflow

# Initialize submodules:
git submodule init
git submodule update

# Or in one command:
git clone --recurse-submodules https://github.com/sarat-asymmetrica/prismflow.git
```

### Step 5: Update Engine in All Projects

```bash
# When you update an engine:
cd lib/asymmetrica-engines
# Make changes to engine
git add .
git commit -m "fix: Williams memory smoothing edge case"
git push

# Back in main project:
cd ../..
git add lib/asymmetrica-engines
git commit -m "Update asymmetrica-engines submodule"
git push

# Other projects pull the update:
git pull
git submodule update --remote
```

### Step 6: Usage in Code

```javascript
// In your project
const WilliamsOptimizer = require('./lib/asymmetrica-engines/engines/williams-optimizer/williams-optimizer.js');

const optimizer = new WilliamsOptimizer();
```

---

## 🔗 OPTION 3: SYMLINKS (DETAILED)

### Step 1: Create Central Engines Folder

```bash
# Create one central location for engines
mkdir c:/AsymmetricaEngines

# Organize by engine
mkdir c:/AsymmetricaEngines/williams-optimizer
mkdir c:/AsymmetricaEngines/tesla-harmonic-timer
mkdir c:/AsymmetricaEngines/abnp-telemetry

# Copy clean engine files (just the code, no node_modules!)
```

### Step 2: Add .gitignore in Central Folder

```bash
# c:/AsymmetricaEngines/.gitignore
node_modules/
__pycache__/
*.pyc
*.log
.env
```

### Step 3: Create Symlinks in Projects

#### On Windows (PowerShell as Administrator):
```powershell
# In your project directory
cd "c:/Projects/PrismFlow Final"

# Create symlink for Williams
New-Item -ItemType SymbolicLink -Path "src/engines/williams-optimizer" -Target "c:/AsymmetricaEngines/williams-optimizer"

# Create symlink for Tesla
New-Item -ItemType SymbolicLink -Path "src/engines/tesla-harmonic-timer" -Target "c:/AsymmetricaEngines/tesla-harmonic-timer"
```

#### On Mac/Linux:
```bash
# In your project directory
cd ~/Projects/PrismFlow

# Create symlink
ln -s ~/AsymmetricaEngines/williams-optimizer src/engines/williams-optimizer
ln -s ~/AsymmetricaEngines/tesla-harmonic-timer src/engines/tesla-harmonic-timer
```

### Step 4: Add to .gitignore in Project

```bash
# In your project's .gitignore
# Don't commit symlinks themselves (add the link paths)
src/engines/williams-optimizer
src/engines/tesla-harmonic-timer
src/engines/abnp-telemetry
```

### Step 5: Document the Symlinks

Create `SETUP.md` in your project:

```markdown
# Setup Instructions

## Engine Symlinks

This project uses symlinks to shared Asymmetrica engines.

### One-Time Setup:

1. Clone the engines repository:
   ```bash
   git clone https://github.com/sarat-asymmetrica/asymmetrica-engines.git c:/AsymmetricaEngines
   ```

2. Create symlinks (Windows PowerShell as Admin):
   ```powershell
   New-Item -ItemType SymbolicLink -Path "src/engines/williams-optimizer" -Target "c:/AsymmetricaEngines/williams-optimizer"
   New-Item -ItemType SymbolicLink -Path "src/engines/tesla-harmonic-timer" -Target "c:/AsymmetricaEngines/tesla-harmonic-timer"
   ```

3. Continue with regular project setup...
```

---

## 📄 OPTION 4: TEMPLATE FILES (DETAILED)

### Step 1: Create Template Repository

```bash
mkdir asymmetrica-engine-templates
cd asymmetrica-engine-templates
git init

# Create template structure
mkdir templates
mkdir templates/williams-optimizer
mkdir templates/tesla-harmonic-timer

# Add ONLY source code (no dependencies!)
```

### Step 2: Create Clean Templates

```
templates/williams-optimizer/
├── williams-optimizer.js  (just the code, 250 lines)
├── README.md              (usage instructions)
└── package.json           (minimal, no node_modules installed)
```

### Step 3: Document Dependencies

In each template's README.md:

```markdown
# Williams Optimizer Template

## Dependencies Required:

None! Pure JavaScript.

## Usage:

1. Copy `williams-optimizer.js` to your project
2. Import and use:
   ```javascript
   const WilliamsOptimizer = require('./path/to/williams-optimizer.js');
   ```

## Customization:

Feel free to modify for your specific needs!
```

### Step 4: Create Copy Script

```bash
# copy-engine.sh (for Mac/Linux)
#!/bin/bash

ENGINE=$1
TARGET=$2

if [ -z "$ENGINE" ] || [ -z "$TARGET" ]; then
  echo "Usage: ./copy-engine.sh <engine-name> <target-path>"
  echo "Example: ./copy-engine.sh williams-optimizer ../my-project/src/engines/"
  exit 1
fi

cp -r "templates/$ENGINE" "$TARGET"
echo "Copied $ENGINE to $TARGET"
```

```powershell
# copy-engine.ps1 (for Windows)
param(
    [Parameter(Mandatory=$true)]
    [string]$Engine,
    
    [Parameter(Mandatory=$true)]
    [string]$TargetPath
)

Copy-Item -Path "templates\$Engine" -Destination $TargetPath -Recurse -Force
Write-Host "Copied $Engine to $TargetPath"
```

### Step 5: Copy to New Project

```bash
# Copy engine template to your project
./copy-engine.sh williams-optimizer ../PrismFlow/src/engines/

# Or manually:
cp -r templates/williams-optimizer ../PrismFlow/src/engines/
```

---

## 🎯 RECOMMENDED APPROACH BY PROJECT TYPE

### For Electron/Node.js Projects (like PrismFlow):
**BEST**: Option 1 (NPM Packages) with local file dependencies
- Easy to use: `npm install ../asymmetrica-engines/packages/williams-optimizer`
- Version management built-in
- No registry needed for private work
- Clean separation

**ALTERNATIVE**: Option 2 (Git Submodules) if you prefer git workflow

---

### For Multi-Language Projects (Node.js + Python):
**BEST**: Option 2 (Git Submodules)
- Works for any language
- Git version control
- Clean updates

**ALTERNATIVE**: Option 3 (Symlinks) for local dev speed

---

### For Small Projects (<5 engines):
**BEST**: Option 4 (Template Files)
- Simplest approach
- Copy when needed
- Customize freely

---

## 🛠️ PRACTICAL EXAMPLE: SETTING UP NPM PACKAGES (RECOMMENDED)

Let me show you exactly how to set this up for PrismFlow:

### Step-by-Step Setup:

```bash
# 1. Create engines repository (ONE TIME)
cd c:/Projects
mkdir AsymmetricaEngines
cd AsymmetricaEngines
npm init -y

# 2. Create package structure
mkdir -p packages/williams-optimizer/src
mkdir -p packages/tesla-harmonic-timer/src
mkdir -p packages/abnp-telemetry/src

# 3. Set up Williams package
cd packages/williams-optimizer
npm init -y

# Edit package.json to add:
# - "name": "@asymmetrica/williams-optimizer"
# - "main": "src/williams-optimizer.js"
# - "files": ["src/"]

# 4. Copy your clean Williams code
cp "c:/Projects/PrismFlow Final/src/williams-optimizer.js" src/

# 5. Create .npmignore
echo "node_modules/
__pycache__/
*.pyc
*.log
.nul" > .npmignore

# 6. Go back to root and initialize git
cd ../..
git init
git add .
git commit -m "Initial commit: Asymmetrica engines"

# 7. Push to private GitHub repo (create repo first on github.com)
git remote add origin https://github.com/sarat-asymmetrica/asymmetrica-engines.git
git push -u origin main
```

### In Your PrismFlow Project:

```bash
# Add engine as local dependency
cd "c:/Projects/PrismFlow Final"

# Edit package.json, add to dependencies:
{
  "dependencies": {
    "@asymmetrica/williams-optimizer": "file:../AsymmetricaEngines/packages/williams-optimizer",
    "@asymmetrica/tesla-harmonic-timer": "file:../AsymmetricaEngines/packages/tesla-harmonic-timer"
  }
}

# Install
npm install

# Now you can use it:
# const WilliamsOptimizer = require('@asymmetrica/williams-optimizer');
```

---

## 🎯 CRITICAL: WHAT TO INCLUDE IN ENGINE REPO

### ✅ INCLUDE:
- Source code files (`.js`, `.py`, etc.)
- README files
- LICENSE files
- package.json / setup.py (WITHOUT installing deps)
- Documentation
- Examples (small, clean)

### ❌ EXCLUDE (Add to .gitignore):
```gitignore
# Dependencies
node_modules/
venv/
env/
.env

# Python cache
__pycache__/
*.py[cod]
*$py.class
*.so

# Build artifacts
dist/
build/
*.egg-info/

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db
.nul

# IDE
.vscode/
.idea/
*.swp
*.swo

# Test coverage
coverage/
.nyc_output/
```

---

## 🚀 MIGRATION PLAN (From Current PrismFlow Setup)

### Phase 1: Extract Engines (1 hour)

```bash
# 1. Create new engines repo
mkdir c:/Projects/AsymmetricaEngines
cd c:/Projects/AsymmetricaEngines
npm init -y

# 2. Create package structure
mkdir -p packages/williams-optimizer/src
mkdir -p packages/tesla-harmonic-timer/src

# 3. Copy ONLY the engine code (no node_modules!)
cp "c:/Projects/PrismFlow Final/src/williams-optimizer.js" packages/williams-optimizer/src/
cp "c:/Projects/PrismFlow Final/src/tesla-timer.js" packages/tesla-harmonic-timer/src/

# 4. Create package.json for each
cd packages/williams-optimizer
npm init -y
# Edit package.json as shown above

cd ../tesla-harmonic-timer
npm init -y
# Edit package.json

# 5. Initialize git
cd ../..
git init

# 6. Create .gitignore (CRITICAL!)
cat > .gitignore << 'EOF'
node_modules/
__pycache__/
*.pyc
*.log
.nul
.DS_Store
.env
EOF

git add .
git commit -m "Initial commit: Clean Asymmetrica engines"
```

### Phase 2: Update PrismFlow (30 min)

```bash
cd "c:/Projects/PrismFlow Final"

# Add local dependencies to package.json
# Then:
npm install

# Update imports in code
# From: const WilliamsOptimizer = require('./src/williams-optimizer.js');
# To:   const WilliamsOptimizer = require('@asymmetrica/williams-optimizer');
```

### Phase 3: Test (15 min)

```bash
# Test that everything still works
npm start
# Run tests
npm test
```

### Phase 4: Clean Up (15 min)

```bash
# Remove old engine files from PrismFlow
rm "c:/Projects/PrismFlow Final/src/williams-optimizer.js"
rm "c:/Projects/PrismFlow Final/src/tesla-timer.js"

git add .
git commit -m "Migrate to @asymmetrica packages"
```

---

## 📊 COMPARISON TABLE

| Feature | NPM Packages | Git Submodules | Symlinks | Template Files |
|---------|--------------|----------------|----------|----------------|
| **Setup Time** | 1-2 hours | 30 min | 5 min | Immediate |
| **Version Control** | ✅ Excellent | ✅ Excellent | ❌ No | ⚠️ Manual |
| **Cross-Machine** | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| **Cross-Language** | ⚠️ Node.js only | ✅ Yes | ✅ Yes | ✅ Yes |
| **Update Ease** | ✅ `npm update` | ✅ `git pull` | ✅ Instant | ⚠️ Manual copy |
| **Dependencies** | ✅ Managed | ⚠️ Manual | ⚠️ Manual | ⚠️ Manual |
| **Best For** | Production | Multi-project | Local dev | Simplicity |

---

## 🎓 BEST PRACTICES

### 1. Keep Engines Standalone
Each engine should:
- Have ZERO dependencies on your project
- Include its own tests
- Have clear documentation
- Work independently

### 2. Version Semantically
Use semantic versioning (semver):
- `1.0.0` - Initial release
- `1.0.1` - Bug fix
- `1.1.0` - New feature (backward compatible)
- `2.0.0` - Breaking change

### 3. Document Dependencies
In engine's README:
```markdown
## Dependencies
- Node.js >= 14.0.0
- No external packages required (pure JavaScript)

## Optional Dependencies
- For testing: jest >= 29.0.0
```

### 4. Test Before Publishing
Always test engine in isolation:
```bash
cd packages/williams-optimizer
npm test
```

### 5. Tag Releases
```bash
git tag -a v1.0.0 -m "Williams Optimizer v1.0.0"
git push origin v1.0.0
```

---

## 🎯 MY RECOMMENDATION FOR YOU

Based on your situation (PrismFlow + future projects):

### **Use Option 1: NPM Packages with Local File Dependencies**

**Why**:
1. ✅ Clean separation (no node_modules copied)
2. ✅ Easy to use (`npm install`)
3. ✅ Version management built-in
4. ✅ No need for paid NPM account (use local paths)
5. ✅ Can publish to NPM later if you want
6. ✅ Works great for Electron/Node.js projects
7. ✅ Clear .npmignore prevents junk files

**Setup**:
- 1-2 hours one-time setup
- Then `npm install` in any project
- Update engine, run `npm install` to get latest

---

## 📝 CHECKLIST FOR ENGINE REPOSITORY

```markdown
## Engine Repository Setup Checklist

### Repository Structure:
- [ ] Created `asymmetrica-engines` repository
- [ ] Added `packages/` folder for each engine
- [ ] Each engine has own `package.json`
- [ ] Each engine has own `README.md`

### Git Hygiene:
- [ ] Created `.gitignore` with node_modules, __pycache__, etc.
- [ ] Verified no node_modules in repo
- [ ] Verified no cache files in repo
- [ ] Committed only source code

### Package Configuration:
- [ ] Set package name (@asymmetrica/engine-name)
- [ ] Set main entry point
- [ ] Added "files" array (only src/)
- [ ] Created .npmignore as safety net

### Documentation:
- [ ] Each engine has usage examples
- [ ] Dependencies documented
- [ ] Version documented
- [ ] License included

### Testing:
- [ ] Can install in test project
- [ ] Engine works independently
- [ ] No errors or warnings
```

---

## 🆘 TROUBLESHOOTING

### Problem: "npm install" copies node_modules

**Solution**: Add "files" array to package.json:
```json
{
  "files": ["src/", "README.md"]
}
```

### Problem: Still seeing cache files

**Solution**: Create .npmignore:
```
node_modules/
__pycache__/
*.pyc
```

### Problem: Changes not reflected in project

**Solution**: 
```bash
# For file: dependencies, reinstall:
cd your-project
npm install --force

# Or update the link:
npm install ../AsymmetricaEngines/packages/engine-name
```

### Problem: Git submodule not updating

**Solution**:
```bash
git submodule update --remote --merge
```

---

## 🎉 CONCLUSION

**For PrismFlow and future projects, I recommend**:

1. **Create `asymmetrica-engines` repository** (1 hour)
2. **Use NPM packages with local file paths** (Easy!)
3. **Add clean .gitignore** (Prevent junk!)
4. **Document usage in each engine** (Help future you!)

This gives you:
- ✅ Clean copies (no node_modules!)
- ✅ Easy updates (`npm install`)
- ✅ Version control (git tags)
- ✅ Reusable across all projects
- ✅ Professional structure

**Start with this, expand as needed!** 🚀

---

*Last Updated: October 15, 2025*  
*"Clean engines, clean projects, clean conscience!"* ✨
