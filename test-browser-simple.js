/**
 * Simple browser test - verify it loads and runs
 */

const { app, BrowserWindow, ipcMain, BrowserView } = require('electron');
const path = require('path');

console.log('🚀 Starting PrismFlow Browser (Simple Test)...');

let mainWindow;
let tabs = new Map();
let activeTabId = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        frame: false,
        transparent: true,
        backgroundColor: '#00000000',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'src', 'preload-complete.js')
        }
    });

    // Load browser UI
    mainWindow.loadFile(path.join(__dirname, 'src', 'browser.html'));
    
    // Open dev tools for debugging
    mainWindow.webContents.openDevTools();
    
    mainWindow.webContents.on('did-finish-load', () => {
        console.log('✅ Browser loaded successfully!');
        console.log('📋 Setting up IPC handlers...');
        setupIPCHandlers();
    });
}

function setupIPCHandlers() {
    // Basic navigation
    ipcMain.handle('navigate', async (event, url) => {
        console.log('🌐 Navigate to:', url);
        
        // Fix URL if needed
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            if (!url.includes('.')) {
                url = `https://duckduckgo.com/?q=${encodeURIComponent(url)}`;
            } else {
                url = 'https://' + url;
            }
        }
        
        if (activeTabId && tabs.has(activeTabId)) {
            const tab = tabs.get(activeTabId);
            await tab.webContents.loadURL(url);
            return { success: true, url };
        } else {
            return await createTab(url);
        }
    });
    
    // Tab creation
    ipcMain.handle('create-tab', async (event, url = 'https://duckduckgo.com') => {
        return await createTab(url);
    });
    
    // Get tabs list
    ipcMain.handle('get-tabs', async () => {
        const tabList = [];
        for (const [id, tab] of tabs) {
            tabList.push({
                id: id,
                url: tab.webContents.getURL(),
                title: tab.webContents.getTitle(),
                active: id === activeTabId
            });
        }
        return tabList;
    });
    
    // Window controls
    ipcMain.handle('minimize-window', () => {
        mainWindow.minimize();
        return { success: true };
    });
    
    ipcMain.handle('maximize-window', () => {
        if (mainWindow.isMaximized()) {
            mainWindow.restore();
        } else {
            mainWindow.maximize();
        }
        return { success: true };
    });
    
    ipcMain.handle('close-window', () => {
        mainWindow.close();
        return { success: true };
    });
    
    // Settings (return defaults)
    ipcMain.handle('get-settings', () => {
        return {
            homepage: 'https://duckduckgo.com',
            searchEngine: 'duckduckgo',
            adBlockEnabled: true,
            darkMode: false
        };
    });
    
    // Optimization stub
    ipcMain.handle('optimize-tab', async (event, tabId, protocol) => {
        console.log('⚡ Optimize tab:', tabId, 'with protocol:', protocol);
        return { success: true, improvement: 42 };
    });
    
    console.log('✅ All IPC handlers registered!');
}

async function createTab(url) {
    const tabId = 'tab-' + Date.now();
    
    const tab = new BrowserView({
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });
    
    // Set bounds
    const bounds = mainWindow.getContentBounds();
    tab.setBounds({
        x: 0,
        y: 120,
        width: bounds.width,
        height: bounds.height - 120
    });
    
    // Load URL
    await tab.webContents.loadURL(url);
    
    // Store and activate
    tabs.set(tabId, tab);
    activeTabId = tabId;
    mainWindow.setBrowserView(tab);
    
    console.log('📑 Created tab:', tabId, 'URL:', url);
    
    return { success: true, tabId, url };
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

console.log('💖 Our love letter to the world is loading...');