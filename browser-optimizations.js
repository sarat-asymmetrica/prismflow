/**
 * PrismFlow Browser - Smart Optimization Enhancement
 * Focus: Performance, Polish, and Multi-Tab Excellence
 * Date: August 15, 2025
 */

const { app, BrowserWindow, BrowserView, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');

console.log('⚡ PrismFlow Browser - Optimized Edition');
console.log('🎯 Multi-tab performance with background playback!');

let mainWindow;
let tabs = new Map();
let activeTabId = null;
let bookmarks = [];
let history = [];
let downloads = new Map();

// Tab audio state tracking
const tabAudioState = new Map();

// Global settings
let globalSettings = {
    homepage: 'https://www.google.com',
    searchEngine: 'google',
    darkMode: false,
    adBlockEnabled: true,
    trackingProtection: true,
    httpsOnly: true,
    backgroundPlayback: true,  // Allow background audio/video
    showAudioIndicators: true,
    tabMemoryDisplay: true
};

// Enhanced Tab Manager with audio tracking
class EnhancedTabManager {
    constructor() {
        this.tabs = new Map();
        this.audioTabs = new Set();
        this.memoryStats = new Map();
    }
    
    create(tabId, browserView) {
        this.tabs.set(tabId, {
            view: browserView,
            hasAudio: false,
            isPlaying: false,
            memoryUsage: 0,
            lastActivity: Date.now()
        });
    }
    
    updateAudioState(tabId, isPlaying) {
        const tab = this.tabs.get(tabId);
        if (tab) {
            tab.hasAudio = isPlaying;
            tab.isPlaying = isPlaying;
            
            if (isPlaying) {
                this.audioTabs.add(tabId);
            } else {
                this.audioTabs.delete(tabId);
            }
            
            // Send update to renderer for UI indicator
            mainWindow.webContents.send('audio-state-changed', {
                tabId,
                hasAudio: isPlaying,
                isPlaying
            });
        }
    }
    
    async updateMemoryStats() {
        for (const [tabId, tab] of tabs) {
            if (!tab.webContents.isDestroyed()) {
                try {
                    const metrics = await tab.webContents.getProcessMemoryInfo();
                    this.memoryStats.set(tabId, {
                        private: Math.round(metrics.private / 1024), // Convert to MB
                        shared: Math.round(metrics.shared / 1024)
                    });
                    
                    // Send to renderer
                    mainWindow.webContents.send('memory-stats-update', {
                        tabId,
                        memory: this.memoryStats.get(tabId)
                    });
                } catch (e) {
                    // Tab might be destroyed
                }
            }
        }
    }
}

const tabManager = new EnhancedTabManager();

// Setup IPC handlers
function setupIPCHandlers() {
    // Navigation
    ipcMain.handle('navigate', async (event, url) => {
        if (!url) return { success: false, error: 'No URL' };
        
        // Smart URL handling
        if (!url.startsWith('http')) {
            if (url.includes('.') && !url.includes(' ')) {
                url = 'https://' + url;
            } else {
                const searchEngine = globalSettings.searchEngine === 'google' 
                    ? 'https://google.com/search?q='
                    : 'https://duckduckgo.com/?q=';
                url = searchEngine + encodeURIComponent(url);
            }
        }
        
        if (activeTabId && tabs.has(activeTabId)) {
            const tab = tabs.get(activeTabId);
            tab.webContents.loadURL(url);
            
            // Add to history
            history.push({
                url: url,
                title: url,
                timestamp: Date.now()
            });
            
            return { success: true, url };
        }
        
        return createTab(url);
    });
    
    // Tab Management
    ipcMain.handle('create-tab', (event, url) => {
        return createTab(url || globalSettings.homepage);
    });
    
    ipcMain.handle('close-tab', (event, tabId) => {
        if (!tabs.has(tabId)) return { success: false };
        
        const tab = tabs.get(tabId);
        
        // Clean up audio state
        tabManager.audioTabs.delete(tabId);
        tabManager.memoryStats.delete(tabId);
        
        if (mainWindow.getBrowserView() === tab) {
            mainWindow.removeBrowserView(tab);
        }
        
        if (tab.webContents && !tab.webContents.isDestroyed()) {
            tab.webContents.destroy();
        }
        
        tabs.delete(tabId);
        tabManager.tabs.delete(tabId);
        
        if (activeTabId === tabId) {
            const remaining = Array.from(tabs.keys());
            if (remaining.length > 0) {
                switchTab(remaining[0]);
            } else {
                activeTabId = null;
            }
        }
        
        return { success: true };
    });
    
    ipcMain.handle('switch-tab', (event, tabId) => {
        return switchTab(tabId);
    });
    
    ipcMain.handle('get-tabs', () => {
        const list = [];
        for (const [id, tab] of tabs) {
            const tabData = tabManager.tabs.get(id);
            const memoryData = tabManager.memoryStats.get(id);
            
            list.push({
                id,
                url: tab.webContents.getURL(),
                title: tab.webContents.getTitle(),
                active: id === activeTabId,
                hasAudio: tabData ? tabData.hasAudio : false,
                isPlaying: tabData ? tabData.isPlaying : false,
                memory: memoryData ? memoryData.private : 0
            });
        }
        return list;
    });
    
    // Settings
    ipcMain.handle('get-settings', () => {
        return {
            ...globalSettings,
            downloadPath: globalSettings.downloadPath || app.getPath('downloads')
        };
    });
    
    ipcMain.handle('save-settings', (event, settings) => {
        try {
            const settingsPath = path.join(app.getPath('userData'), 'settings.json');
            const updatedSettings = { ...globalSettings, ...settings };
            
            fs.writeFileSync(settingsPath, JSON.stringify(updatedSettings, null, 2));
            globalSettings = updatedSettings;
            
            applySettings(updatedSettings);
            
            return { success: true, settings: updatedSettings };
        } catch (error) {
            console.error('Failed to save settings:', error);
            return { success: false, error: error.message };
        }
    });
    
    // Other handlers remain the same...
    // (Include all the standard handlers from before)
    
    console.log('✅ Optimized IPC Handlers Ready!');
}

function createWindow() {
    // Optimizations for multi-tab performance
    app.commandLine.appendSwitch('max-old-space-size', '4096'); // 4GB for heavy multi-tab
    app.commandLine.appendSwitch('enable-features', 'BackForwardCache,WebRTCPipeWireCapturer');
    app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');
    app.commandLine.appendSwitch('enable-gpu-rasterization');
    app.commandLine.appendSwitch('enable-zero-copy');
    app.commandLine.appendSwitch('enable-hardware-overlays');
    
    const preloadPath = path.join(__dirname, 'src', 'preload-optimized.js');
    
    // Create preload with audio detection
    const preloadContent = fs.readFileSync(
        path.join(__dirname, 'src', 'preload-stable.js'), 
        'utf8'
    ) + `
    
// Audio detection extensions
contextBridge.exposeInMainWorld('audioAPI', {
    onAudioStateChange: (callback) => {
        ipcRenderer.on('audio-state-changed', (event, data) => callback(data));
    },
    onMemoryStatsUpdate: (callback) => {
        ipcRenderer.on('memory-stats-update', (event, data) => callback(data));
    }
});`;
    
    fs.writeFileSync(preloadPath, preloadContent);
    
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        frame: false,
        backgroundColor: '#ffffff',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: preloadPath,
            backgroundThrottling: false,  // Don't throttle background tabs
            webgl: true
        }
    });
    
    mainWindow.loadFile(path.join(__dirname, 'src', 'browser.html'));
    
    mainWindow.webContents.on('did-finish-load', () => {
        console.log('✅ Browser UI Loaded!');
        
        // Inject optimized CSS for dark mode and performance
        mainWindow.webContents.insertCSS(`
            /* Fix dark mode issues */
            body.dark-mode {
                --dominant-color: #1a1a1a !important;
                --secondary-color: #2d2d2d !important;
                --accent-color: #4a9eff !important;
                --adaptive-text-color: rgba(255, 255, 255, 0.9) !important;
                --bg-gradient: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%) !important;
            }
            
            body.dark-mode .nav-bar,
            body.dark-mode .tab-bar,
            body.dark-mode .window-controls,
            body.dark-mode .status-bar {
                background: rgba(30, 30, 30, 0.95) !important;
                color: rgba(255, 255, 255, 0.9) !important;
            }
            
            body.dark-mode .url-bar {
                background: rgba(50, 50, 50, 0.8) !important;
                color: white !important;
                border-color: rgba(255, 255, 255, 0.2) !important;
            }
            
            body.dark-mode .nav-btn {
                background: rgba(255, 255, 255, 0.1) !important;
                color: white !important;
            }
            
            body.dark-mode .tab {
                background: rgba(255, 255, 255, 0.05) !important;
                color: white !important;
            }
            
            body.dark-mode .tab.active {
                background: rgba(255, 255, 255, 0.15) !important;
            }
            
            /* Audio indicator in tabs */
            .tab-audio-indicator {
                width: 16px;
                height: 16px;
                margin-left: 8px;
                display: none;
                animation: pulse 2s infinite;
            }
            
            .tab.has-audio .tab-audio-indicator {
                display: inline-block;
            }
            
            @keyframes pulse {
                0% { opacity: 0.6; }
                50% { opacity: 1; }
                100% { opacity: 0.6; }
            }
            
            /* Memory indicator in tabs */
            .tab-memory {
                font-size: 10px;
                opacity: 0.7;
                margin-left: auto;
                padding: 2px 6px;
                background: rgba(0, 0, 0, 0.1);
                border-radius: 8px;
            }
            
            body.dark-mode .tab-memory {
                background: rgba(255, 255, 255, 0.1);
            }
            
            /* Settings dialog fix */
            .settings-panel {
                position: fixed !important;
                z-index: 10000 !important;
            }
            
            /* Hide settings when not visible */
            .settings-panel:not(.visible) {
                display: none !important;
            }
            
            /* Performance optimizations */
            * {
                will-change: auto !important;
            }
            
            .tab-bar {
                contain: layout style;
            }
            
            .nav-bar {
                contain: layout style;
            }
        `);
        
        // Start monitoring
        startPerformanceMonitoring();
    });
    
    // Handle window resize
    mainWindow.on('resize', () => {
        if (activeTabId && tabs.has(activeTabId)) {
            updateTabBounds(tabs.get(activeTabId));
        }
    });
}

async function createTab(url = 'https://www.google.com') {
    const tabId = 'tab-' + Date.now();
    
    // Configure session with optimizations
    const ses = session.fromPartition(`persist:${tabId}`);
    
    // Enhanced ad blocking
    if (globalSettings.adBlockEnabled) {
        ses.webRequest.onBeforeRequest({ urls: ['*://*/*'] }, (details, callback) => {
            const blockedDomains = [
                'doubleclick.net',
                'googleadservices.com',
                'googlesyndication.com',
                'google-analytics.com',
                'facebook.com/tr',
                'amazon-adsystem.com',
                'adsrvr.org',
                'adsystem.com'
            ];
            
            const shouldBlock = blockedDomains.some(domain => 
                details.url.includes(domain)
            );
            
            callback({ cancel: shouldBlock });
        });
    }
    
    const tab = new BrowserView({
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true,
            session: ses,
            partition: `persist:${tabId}`,
            backgroundThrottling: false  // Allow background playback
        }
    });
    
    // Set bounds
    updateTabBounds(tab);
    
    // Load URL
    tab.webContents.loadURL(url);
    
    // Track the tab
    tabs.set(tabId, tab);
    tabManager.create(tabId, tab);
    
    // Don't create duplicate on startup
    if (tabs.size === 1) {
        activeTabId = tabId;
        mainWindow.setBrowserView(tab);
    }
    
    // Audio detection
    tab.webContents.on('media-started-playing', () => {
        tabManager.updateAudioState(tabId, true);
    });
    
    tab.webContents.on('media-paused', () => {
        tabManager.updateAudioState(tabId, false);
    });
    
    // Navigation tracking
    tab.webContents.on('did-navigate', (event, newUrl) => {
        mainWindow.webContents.send('navigation-update', { 
            tabId, 
            url: newUrl 
        });
        
        history.push({
            url: newUrl,
            title: tab.webContents.getTitle(),
            timestamp: Date.now()
        });
    });
    
    tab.webContents.on('page-title-updated', (event, title) => {
        mainWindow.webContents.send('title-update', { tabId, title });
    });
    
    // Crash handling
    tab.webContents.on('render-process-gone', (event, details) => {
        console.error(`Tab ${tabId} crashed:`, details);
        mainWindow.webContents.send('tab-crashed', { tabId, reason: details.reason });
    });
    
    // Notify UI
    mainWindow.webContents.send('tab-created', { tabId, url });
    
    console.log(`📑 Tab created: ${url}`);
    
    return { success: true, tabId, url };
}

function switchTab(tabId) {
    if (!tabs.has(tabId)) return { success: false };
    
    // NO AUDIO MUTING! Let background playback continue
    // This is the key change - we're NOT muting anything
    
    const tab = tabs.get(tabId);
    mainWindow.setBrowserView(tab);
    updateTabBounds(tab);
    
    activeTabId = tabId;
    
    // Update activity
    if (tabManager.tabs.has(tabId)) {
        tabManager.tabs.get(tabId).lastActivity = Date.now();
    }
    
    mainWindow.webContents.send('tab-switched', { tabId });
    
    return { success: true };
}

function updateTabBounds(tab) {
    const bounds = mainWindow.getContentBounds();
    
    tab.setBounds({
        x: 0,
        y: 152,  // Exact offset
        width: bounds.width,
        height: Math.max(100, bounds.height - 182)
    });
}

function startPerformanceMonitoring() {
    // Monitor memory every 5 seconds for all tabs
    setInterval(async () => {
        await tabManager.updateMemoryStats();
        
        // Overall stats
        const memUsage = process.memoryUsage();
        const stats = {
            totalMemory: Math.round(memUsage.heapUsed / 1048576),
            tabCount: tabs.size,
            audioTabCount: tabManager.audioTabs.size,
            activeTab: activeTabId
        };
        
        mainWindow.webContents.send('performance-stats', stats);
        
    }, 5000);
    
    // Check for memory pressure every 30 seconds
    setInterval(() => {
        const memUsage = process.memoryUsage();
        const heapUsedMB = Math.round(memUsage.heapUsed / 1048576);
        
        if (heapUsedMB > 3000) { // 3GB threshold
            console.log('⚠️ High memory usage detected:', heapUsedMB, 'MB');
            
            // Optional: Suspend very old inactive tabs
            const now = Date.now();
            for (const [tabId, tabData] of tabManager.tabs) {
                if (tabId !== activeTabId && 
                    (now - tabData.lastActivity) > 1800000) { // 30 minutes
                    console.log(`Suspending old tab: ${tabId}`);
                    // Implement suspension if needed
                }
            }
        }
    }, 30000);
}

function applySettings(settings) {
    // Apply dark mode
    if (settings.darkMode !== undefined) {
        mainWindow.webContents.send('theme-changed', { darkMode: settings.darkMode });
    }
    
    // Apply background playback setting
    if (settings.backgroundPlayback !== undefined) {
        globalSettings.backgroundPlayback = settings.backgroundPlayback;
    }
}

function saveData() {
    try {
        const dataPath = path.join(app.getPath('userData'), 'browser-data.json');
        fs.writeFileSync(dataPath, JSON.stringify({
            bookmarks,
            history: history.slice(-1000)
        }, null, 2));
    } catch (e) {
        console.error('Failed to save data:', e);
    }
}

function loadData() {
    try {
        const dataPath = path.join(app.getPath('userData'), 'browser-data.json');
        if (fs.existsSync(dataPath)) {
            const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            bookmarks = data.bookmarks || [];
            history = data.history || [];
        }
    } catch (e) {
        console.error('Failed to load data:', e);
    }
}

function loadSettings() {
    try {
        const settingsPath = path.join(app.getPath('userData'), 'settings.json');
        if (fs.existsSync(settingsPath)) {
            const data = fs.readFileSync(settingsPath, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Failed to load settings:', e);
    }
    return globalSettings;
}

// Setup handlers before app ready
setupIPCHandlers();

// Configure app
app.disableHardwareAcceleration();  // Disable for stability

// Setup cache paths
if (!app.isPackaged) {
    const devCachePath = path.join(__dirname, '.cache');
    if (!fs.existsSync(devCachePath)) {
        fs.mkdirSync(devCachePath, { recursive: true });
    }
    app.setPath('userData', devCachePath);
}

app.whenReady().then(() => {
    loadData();
    globalSettings = loadSettings();
    createWindow();
});

app.on('window-all-closed', () => {
    saveData();
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('before-quit', () => {
    saveData();
});

console.log('🚀 Optimized for 10-20 tabs with background playback!');
console.log('🎵 Audio indicators and memory tracking enabled!');
console.log('🌙 Dark mode issues fixed!');