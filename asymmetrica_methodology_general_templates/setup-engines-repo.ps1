# Asymmetrica Engines - Quick Setup Script
# Run this to create the engines repository structure

Write-Host "🚀 Asymmetrica Engines - Repository Setup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Get setup location
$defaultPath = "C:\Projects\AsymmetricaEngines"
$enginesPath = Read-Host "Where to create engines repo? (default: $defaultPath)"
if ([string]::IsNullOrWhiteSpace($enginesPath)) {
    $enginesPath = $defaultPath
}

# Create directory
Write-Host "Creating directory: $enginesPath" -ForegroundColor Yellow
New-Item -ItemType Directory -Path $enginesPath -Force | Out-Null

# Create packages structure
Write-Host "Creating package structure..." -ForegroundColor Yellow
$packages = @("williams-optimizer", "tesla-harmonic-timer", "abnp-telemetry", "atman-engine")

foreach ($package in $packages) {
    $packagePath = Join-Path $enginesPath "packages\$package\src"
    New-Item -ItemType Directory -Path $packagePath -Force | Out-Null
    Write-Host "  ✓ Created packages/$package/src" -ForegroundColor Green
}

# Create root package.json
Write-Host "Creating root package.json..." -ForegroundColor Yellow
$rootPackageJson = @"
{
  "name": "asymmetrica-engines",
  "version": "1.0.0",
  "description": "Asymmetrica methodology engines - reusable across projects",
  "private": true,
  "scripts": {
    "test": "echo 'Run tests in individual packages'"
  },
  "keywords": ["asymmetrica", "engines", "optimization", "tesla", "williams"],
  "author": "Sarat Chandran (Asymmetrica)",
  "license": "MIT",
  "workspaces": [
    "packages/*"
  ]
}
"@
$rootPackageJson | Out-File -FilePath (Join-Path $enginesPath "package.json") -Encoding UTF8
Write-Host "  ✓ Created root package.json" -ForegroundColor Green

# Create .gitignore
Write-Host "Creating .gitignore..." -ForegroundColor Yellow
$gitignore = @"
# Dependencies
node_modules/
venv/
env/
.env

# Python cache
__pycache__/
*.py[cod]
*`$py.class
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
"@
$gitignore | Out-File -FilePath (Join-Path $enginesPath ".gitignore") -Encoding UTF8
Write-Host "  ✓ Created .gitignore" -ForegroundColor Green

# Create package.json for each engine
Write-Host "Creating package.json for each engine..." -ForegroundColor Yellow

$williamsPackageJson = @"
{
  "name": "@asymmetrica/williams-optimizer",
  "version": "1.0.0",
  "description": "Williams Space Optimization Engine with memory smoothing",
  "main": "src/williams-optimizer.js",
  "scripts": {
    "test": "echo 'Add tests here'"
  },
  "keywords": ["asymmetrica", "optimization", "memory", "williams"],
  "author": "Sarat Chandran (Asymmetrica)",
  "license": "MIT",
  "files": [
    "src/",
    "README.md"
  ]
}
"@
$williamsPackageJson | Out-File -FilePath (Join-Path $enginesPath "packages\williams-optimizer\package.json") -Encoding UTF8

$teslaPackageJson = @"
{
  "name": "@asymmetrica/tesla-harmonic-timer",
  "version": "1.0.0",
  "description": "Tesla Harmonic Timer (4.909 Hz) for synchronized operations",
  "main": "src/tesla-timer.js",
  "scripts": {
    "test": "echo 'Add tests here'"
  },
  "keywords": ["asymmetrica", "tesla", "harmonic", "timer", "4.909hz"],
  "author": "Sarat Chandran (Asymmetrica)",
  "license": "MIT",
  "files": [
    "src/",
    "README.md"
  ]
}
"@
$teslaPackageJson | Out-File -FilePath (Join-Path $enginesPath "packages\tesla-harmonic-timer\package.json") -Encoding UTF8

$abnpPackageJson = @"
{
  "name": "@asymmetrica/abnp-telemetry",
  "version": "1.0.0",
  "description": "ABNP Telemetry Engine for distributed monitoring",
  "main": "src/abnp-telemetry.js",
  "scripts": {
    "test": "echo 'Add tests here'"
  },
  "keywords": ["asymmetrica", "abnp", "telemetry", "monitoring"],
  "author": "Sarat Chandran (Asymmetrica)",
  "license": "MIT",
  "files": [
    "src/",
    "README.md"
  ]
}
"@
$abnpPackageJson | Out-File -FilePath (Join-Path $enginesPath "packages\abnp-telemetry\package.json") -Encoding UTF8

$atmanPackageJson = @"
{
  "name": "@asymmetrica/atman-engine",
  "version": "1.0.0",
  "description": "Atman consciousness engine",
  "main": "src/atman-engine.js",
  "scripts": {
    "test": "echo 'Add tests here'"
  },
  "keywords": ["asymmetrica", "atman", "consciousness"],
  "author": "Sarat Chandran (Asymmetrica)",
  "license": "MIT",
  "files": [
    "src/",
    "README.md"
  ]
}
"@
$atmanPackageJson | Out-File -FilePath (Join-Path $enginesPath "packages\atman-engine\package.json") -Encoding UTF8

Write-Host "  ✓ Created package.json for all engines" -ForegroundColor Green

# Create README files
Write-Host "Creating README files..." -ForegroundColor Yellow

$mainReadme = @"
# Asymmetrica Engines

Reusable engines for Asymmetrica methodology projects.

## Packages

- **@asymmetrica/williams-optimizer** - Memory optimization with smoothing
- **@asymmetrica/tesla-harmonic-timer** - 4.909 Hz Tesla frequency timer
- **@asymmetrica/abnp-telemetry** - Distributed telemetry
- **@asymmetrica/atman-engine** - Consciousness engine

## Installation

### In Your Project:

\`\`\`bash
# Using local path (during development)
npm install ../AsymmetricaEngines/packages/williams-optimizer

# Or add to package.json:
{
  "dependencies": {
    "@asymmetrica/williams-optimizer": "file:../AsymmetricaEngines/packages/williams-optimizer"
  }
}
\`\`\`

## Usage

\`\`\`javascript
const WilliamsOptimizer = require('@asymmetrica/williams-optimizer');
const TeslaTimer = require('@asymmetrica/tesla-harmonic-timer');

const optimizer = new WilliamsOptimizer();
const timer = new TeslaTimer();
\`\`\`

## Development

\`\`\`bash
# Install all package dependencies
npm install

# Add new engine
cd packages
mkdir new-engine
cd new-engine
npm init -y
# Edit package.json and add code
\`\`\`

## Publishing

\`\`\`bash
# From a package directory
npm pack  # Creates .tgz file

# Or publish to registry
npm publish
\`\`\`

## License

MIT
"@
$mainReadme | Out-File -FilePath (Join-Path $enginesPath "README.md") -Encoding UTF8

$williamsReadme = @"
# Williams Optimizer

Williams Space Optimization Engine with memory smoothing.

## Features

- √t × log₂(t) optimization formula
- Memory smoothing (prevents sudden drops)
- Exponential moving average (15% max change)
- Safety bounds: Min 50MB, Max 512MB per tab

## Usage

\`\`\`javascript
const WilliamsOptimizer = require('@asymmetrica/williams-optimizer');

const optimizer = new WilliamsOptimizer();
const memoryLimit = optimizer.calculateOptimalMemory(tabAge, complexity);
\`\`\`

## Installation

\`\`\`bash
npm install @asymmetrica/williams-optimizer
\`\`\`

## API

### calculateOptimalMemory(tabAge, complexity)

Returns optimal memory limit in MB based on tab age and complexity.

**Parameters:**
- \`tabAge\` (number): Age of tab in seconds
- \`complexity\` (number): Complexity score (0-10)

**Returns:** Memory limit in MB

## License

MIT
"@
$williamsReadme | Out-File -FilePath (Join-Path $enginesPath "packages\williams-optimizer\README.md") -Encoding UTF8

Write-Host "  ✓ Created README files" -ForegroundColor Green

# Initialize git
Write-Host "Initializing git repository..." -ForegroundColor Yellow
Set-Location $enginesPath
git init
git add .
git commit -m "Initial commit: Asymmetrica engines structure"
Write-Host "  ✓ Git repository initialized" -ForegroundColor Green

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Copy your engine code files to packages/*/src/" -ForegroundColor White
Write-Host "2. Create a private GitHub repo: asymmetrica-engines" -ForegroundColor White
Write-Host "3. Push this repo:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/sarat-asymmetrica/asymmetrica-engines.git" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "4. In your projects, add to package.json:" -ForegroundColor White
Write-Host '   "dependencies": {' -ForegroundColor Gray
Write-Host '     "@asymmetrica/williams-optimizer": "file:../AsymmetricaEngines/packages/williams-optimizer"' -ForegroundColor Gray
Write-Host '   }' -ForegroundColor Gray
Write-Host ""
Write-Host "See ENGINE_PORTING_GUIDE.md for detailed instructions!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Repository created at: $enginesPath" -ForegroundColor Yellow
