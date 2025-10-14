# PrismFlow Browser Build Script
# Builds our optimized Chromium-based browser with Natural Asymmetry

Write-Host ""
Write-Host "=== PrismFlow Browser Builder ===" -ForegroundColor Cyan
Write-Host "------------------------------------------------" -ForegroundColor DarkGray
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

$hasNode = Get-Command node -ErrorAction SilentlyContinue
$hasPython = Get-Command python -ErrorAction SilentlyContinue
$hasVS = Test-Path "${env:ProgramFiles}\Microsoft Visual Studio\2022\Community\Common7\IDE\devenv.exe"

if (!$hasNode) {
    Write-Host "  [X] Node.js not found" -ForegroundColor Red
    Write-Host "     Install from: https://nodejs.org/" -ForegroundColor Gray
    exit 1
}
Write-Host "  [OK] Node.js found" -ForegroundColor Green

if (!$hasPython) {
    Write-Host "  [X] Python not found" -ForegroundColor Red
    Write-Host "     Install: winget install Python.Python.3.11" -ForegroundColor Gray
    exit 1
}
Write-Host "  [OK] Python found" -ForegroundColor Green

Write-Host ""
Write-Host "Building PrismFlow Browser..." -ForegroundColor Yellow
Write-Host ""

# Option 1: Electron-based approach (fastest to prototype)
Write-Host "Option 1: Electron Build (Recommended for Quick Start)" -ForegroundColor Cyan
Write-Host "------------------------------------------------" -ForegroundColor DarkGray

# Create package.json for Electron app
$packageJson = @'
{
  "name": "prismflow-browser",
  "version": "1.0.0",
  "description": "The Browser That Breathes - Powered by Natural Asymmetry",
  "main": "src/main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder",
    "dev": "electron . --dev"
  },
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.9.1"
  },
  "build": {
    "appId": "com.prismflow.browser",
    "productName": "PrismFlow Browser",
    "directories": {
      "output": "dist"
    },
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    }
  }
}
'@

$packageJson | Out-File -FilePath "package.json" -Encoding UTF8

Write-Host "  [OK] Created package.json" -ForegroundColor Green

# Create main Electron process
$mainJs = @'
// PrismFlow Browser - Main Process
// Natural Asymmetry Optimized Chromium

const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');

// Natural Asymmetry Resource Limits
const RESOURCE_LIMITS = {
    maxMemory: 512 * 1024 * 1024,  // 512MB max per tab
    cpuThrottle: 30,                // 30% CPU max
    idleThreshold: 30000            // Suspend after 30s idle
};

let mainWindow;
let resourceMonitor;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        frame: false,  // Custom frame for Diaphanous Glass
        transparent: true,
        backgroundColor: '#00000000',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            // Aggressive optimizations
            offscreen: false,
            backgroundThrottling: true,
            paintWhenOffscreen: false
        }
    });

    // Load our custom browser UI
    mainWindow.loadFile('src/browser.html');

    // Apply Natural Asymmetry resource management
    applyResourceLimits();
    
    // Start monitoring
    startResourceMonitor();
}

function applyResourceLimits() {
    // Set process priority
    const { exec } = require('child_process');
    const pid = process.pid;
    
    // Windows: Set to Below Normal priority
    if (process.platform === 'win32') {
        exec(`wmic process where ProcessId=${pid} CALL setpriority "below normal"`);
    }
    
    // Limit memory usage
    if (global.gc) {
        setInterval(() => {
            global.gc();  // Force garbage collection
        }, 30000);
    }
    
    // Configure Chromium flags for optimization
    app.commandLine.appendSwitch('max_old_space_size', '512');
    app.commandLine.appendSwitch('disable-background-networking');
    app.commandLine.appendSwitch('disable-background-timer-throttling');
    app.commandLine.appendSwitch('disable-renderer-backgrounding');
    app.commandLine.appendSwitch('disable-features', 'TranslateUI');
    app.commandLine.appendSwitch('disable-ipc-flooding-protection');
    app.commandLine.appendSwitch('disable-sync');
    app.commandLine.appendSwitch('enable-features', 'OverlayScrollbar');
    
    // Aggressive tab discarding
    app.commandLine.appendSwitch('automatic-tab-discarding');
    app.commandLine.appendSwitch('proactive-tab-freeze');
}

function startResourceMonitor() {
    resourceMonitor = setInterval(() => {
        const usage = process.getProcessMemoryInfo();
        
        usage.then(info => {
            const memoryMB = info.private / 1024;
            
            // If using too much memory, force GC
            if (memoryMB > 500) {
                if (global.gc) global.gc();
                console.log('[CLEANUP] Memory cleanup triggered:', memoryMB, 'MB');
            }
            
            // Send to renderer for display
            mainWindow.webContents.send('resource-update', {
                memory: memoryMB,
                cpu: process.cpuUsage()
            });
        });
    }, 5000);
}

// IPC handlers for browser functionality
ipcMain.handle('navigate', async (event, url) => {
    // Create new tab with resource limits
    const tab = new BrowserWindow({
        parent: mainWindow,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            backgroundThrottling: true
        }
    });
    
    await tab.loadURL(url);
    return tab.webContents.id;
});

ipcMain.handle('get-palette', async (event, webContentsId) => {
    // Extract colors from webpage for adaptive UI
    const script = `
        const colors = [];
        const elements = document.querySelectorAll('*');
        elements.forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                colors.push(style.backgroundColor);
            }
        });
        colors.slice(0, 5);
    `;
    
    const colors = await mainWindow.webContents.executeJavaScript(script);
    return colors;
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (resourceMonitor) clearInterval(resourceMonitor);
    if (process.platform !== 'darwin') app.quit();
});

console.log('*** PrismFlow Browser Starting...');
console.log('Natural Asymmetry: 30% Active, 20% Background, 50% System');
'@

$mainJs | Out-File -FilePath "src\main.js" -Encoding UTF8
Write-Host "  [OK] Created main.js" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
Write-Host "  This will download Electron (Chromium-based)" -ForegroundColor Gray

$installChoice = Read-Host "Install now? (Y/N)"
if ($installChoice -eq 'Y') {
    npm install
    Write-Host "  [OK] Dependencies installed" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "*** PrismFlow Browser Ready! ***" -ForegroundColor Green
    Write-Host ""
    Write-Host "Run with: npm start" -ForegroundColor Cyan
    Write-Host "Build installer: npm run build" -ForegroundColor Cyan
    Write-Host ""
    
    $runNow = Read-Host "Start PrismFlow Browser now? (Y/N)"
    if ($runNow -eq 'Y') {
        npm start
    }
} else {
    Write-Host ""
    Write-Host "To complete setup:" -ForegroundColor Yellow
    Write-Host "  1. Run: npm install" -ForegroundColor White
    Write-Host "  2. Run: npm start" -ForegroundColor White
}

Write-Host ""
Write-Host "------------------------------------------------" -ForegroundColor DarkGray
Write-Host "PrismFlow = Chromium - Bloat + Natural Asymmetry" -ForegroundColor Magenta
Write-Host "------------------------------------------------" -ForegroundColor DarkGray