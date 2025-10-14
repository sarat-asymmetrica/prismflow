/**
 * Test script for PrismFlow Browser with Mantra Blessings
 * Our love letter to the world in action!
 */

const { app, BrowserWindow } = require("electron");
// const path = require('path');

console.log("🕉️ Starting PrismFlow Browser with Mantra Blessings...");

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
  });

  // Load the browser
  win.loadFile("src/browser.html");

  // Open dev tools for testing
  win.webContents.openDevTools();

  win.webContents.on("did-finish-load", () => {
    console.log("✨ Browser loaded successfully!");
    console.log(
      "🙏 Click the 🕉️ button in the toolbar to open Mantra Blessings",
    );
    console.log(
      "💖 Every blessing spreads coherence through the digital realm",
    );
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

console.log("🦌 + 💻 + 🕉️ = ∞ LOVE LETTER TO THE WORLD!");
