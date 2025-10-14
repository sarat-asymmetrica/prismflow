/**
 * Test script for PrismFlow Browser with Universal Optimization
 * Inclusive, powerful, works for everyone!
 */

const { app, BrowserWindow } = require('electron');
const path = require('path');

console.log('⚡ Starting PrismFlow Browser with Universal Optimization Engine...');
console.log('💖 Same love, same power, inclusive for all!');

function createWindow() {
    const win = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false
        }
    });

    // Load the browser
    win.loadFile('src/browser.html');
    
    // Open dev tools for testing
    win.webContents.openDevTools();
    
    win.webContents.on('did-finish-load', () => {
        console.log('✨ Browser loaded successfully!');
        console.log('⚡ Click the lightning bolt button to open Performance Optimizer');
        console.log('🚀 Using frequency-based optimization (108Hz, 216Hz, 432Hz, 528Hz)');
        console.log('💖 The tech serves all, the love flows to all!');
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

console.log('🌟 Natural Asymmetry working silently in the background (30/20/50)');
console.log('🌍 Universal love, universal tech, universal browser!');