/**
 * PrismFlow Browser - NATIVE BUILD
 * Pure BrowserView implementation without overlays
 * Optimized memory management without aggressive GC
 */

const {
  app,
  BrowserWindow,
  BrowserView,
  ipcMain,
  session,
} = require("electron");
const path = require("path");
const fs = require("fs");

console.log("⚡ PrismFlow Browser - Native BrowserView Edition");
console.log("🎯 Direct Chromium integration, no overlays!");

let mainWindow;
let tabs = new Map();
let activeTabId = null;
let bookmarks = [];
let history = [];
// let downloads = new Map();

// Global settings
let globalSettings = {
  homepage: "https://www.google.com",
  searchEngine: "google",
  darkMode: false,
  adBlockEnabled: true,
  trackingProtection: true,
  httpsOnly: true,
  downloadPath: "",
  defaultZoom: 100,
  memoryOptimization: "balanced", // balanced | aggressive | minimal
};

// Memory management configuration
const MEMORY_CONFIG = {
  balanced: {
    maxHeapMB: 512, // Per tab limit
    idleThrottleMs: 30000, // Throttle after 30s idle
    suspendAfterMs: 300000, // Suspend after 5 min
    gcStrategy: "natural", // Let V8 handle it
  },
  aggressive: {
    maxHeapMB: 256,
    idleThrottleMs: 10000,
    suspendAfterMs: 60000,
    gcStrategy: "forced",
  },
  minimal: {
    maxHeapMB: 1024,
    idleThrottleMs: 60000,
    suspendAfterMs: 600000,
    gcStrategy: "natural",
  },
};

// Tab state management
class TabManager {
  constructor() {
    this.tabs = new Map();
    this.suspended = new Map();
    this.lastActivity = new Map();
  }

  create(tabId, browserView) {
    this.tabs.set(tabId, {
      view: browserView,
      suspended: false,
      lastActivity: Date.now(),
      memoryUsage: 0,
    });
  }

  shouldSuspend(tabId) {
    if (tabId === activeTabId) return false;

    const tab = this.tabs.get(tabId);
    if (!tab) return false;

    const config =
      MEMORY_CONFIG[globalSettings.memoryOptimization || "balanced"];
    const idleTime = Date.now() - tab.lastActivity;

    return idleTime > config.suspendAfterMs;
  }

  suspend(tabId) {
    const tab = this.tabs.get(tabId);
    if (!tab || tab.suspended) return;

    // Capture screenshot before suspending
    tab.view.webContents.capturePage().then((image) => {
      this.suspended.set(tabId, {
        screenshot: image,
        url: tab.view.webContents.getURL(),
        title: tab.view.webContents.getTitle(),
      });

      // Now destroy the view to free memory
      if (!tab.view.webContents.isDestroyed()) {
        tab.view.webContents.destroy();
      }
      tab.suspended = true;

      console.log(`Tab ${tabId} suspended to save memory`);
    });
  }

  resume(tabId) {
    const tab = this.tabs.get(tabId);
    const suspended = this.suspended.get(tabId);

    if (!tab || !suspended) return;

    // Recreate the BrowserView
    const newView = new BrowserView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
      },
    });

    // Restore URL
    newView.webContents.loadURL(suspended.url);

    // Update references
    tab.view = newView;
    tab.suspended = false;
    tab.lastActivity = Date.now();

    this.suspended.delete(tabId);

    console.log(`Tab ${tabId} resumed`);

    return newView;
  }
}

const tabManager = new TabManager();

// Setup IPC handlers
function setupIPCHandlers() {
  // Navigation
  ipcMain.handle("navigate", async (event, url) => {
    if (!url) return { success: false, error: "No URL" };

    // Smart URL handling
    if (!url.startsWith("http")) {
      if (url.includes(".") && !url.includes(" ")) {
        url = "https://" + url;
      } else {
        const searchEngine =
          globalSettings.searchEngine === "google"
            ? "https://google.com/search?q="
            : "https://duckduckgo.com/?q=";
        url = searchEngine + encodeURIComponent(url);
      }
    }

    if (activeTabId && tabs.has(activeTabId)) {
      const tab = tabs.get(activeTabId);

      // Update activity tracking
      tabManager.tabs.get(activeTabId).lastActivity = Date.now();

      tab.webContents.loadURL(url);

      // Add to history
      history.push({
        url: url,
        title: url,
        timestamp: Date.now(),
      });

      return { success: true, url };
    }

    return createTab(url);
  });

  // Tab Management
  ipcMain.handle("create-tab", (event, url) => {
    return createTab(url || globalSettings.homepage);
  });

  ipcMain.handle("close-tab", (event, tabId) => {
    if (!tabs.has(tabId)) return { success: false };

    const tab = tabs.get(tabId);

    // Use removeBrowserView instead of setBrowserView(null)
    if (mainWindow.getBrowserView() === tab) {
      mainWindow.removeBrowserView(tab);
    }

    // Properly destroy the webContents
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
        createTab();
      }
    }

    return { success: true };
  });

  ipcMain.handle("switch-tab", (event, tabId) => {
    return switchTab(tabId);
  });

  ipcMain.handle("get-tabs", () => {
    const list = [];
    for (const [id, tab] of tabs) {
      const tabData = tabManager.tabs.get(id);
      list.push({
        id,
        url: tab.webContents.getURL(),
        title: tab.webContents.getTitle(),
        active: id === activeTabId,
        suspended: tabData ? tabData.suspended : false,
        memoryUsage: tabData ? tabData.memoryUsage : 0,
      });
    }
    return list;
  });

  // Browser Controls
  ipcMain.handle("go-back", () => {
    if (activeTabId && tabs.has(activeTabId)) {
      tabs.get(activeTabId).webContents.goBack();
    }
    return { success: true };
  });

  ipcMain.handle("go-forward", () => {
    if (activeTabId && tabs.has(activeTabId)) {
      tabs.get(activeTabId).webContents.goForward();
    }
    return { success: true };
  });

  ipcMain.handle("reload", () => {
    if (activeTabId && tabs.has(activeTabId)) {
      tabs.get(activeTabId).webContents.reload();
    }
    return { success: true };
  });

  // Settings
  ipcMain.handle("get-settings", () => {
    return {
      ...globalSettings,
      downloadPath: globalSettings.downloadPath || app.getPath("downloads"),
    };
  });

  ipcMain.handle("save-settings", (event, settings) => {
    try {
      const settingsPath = path.join(app.getPath("userData"), "settings.json");

      // Merge settings
      const updatedSettings = { ...globalSettings, ...settings };

      // Write to file
      fs.writeFileSync(settingsPath, JSON.stringify(updatedSettings, null, 2));

      // Update in memory
      globalSettings = updatedSettings;

      // Apply settings
      applySettings(updatedSettings);

      return { success: true, settings: updatedSettings };
    } catch (error) {
      console.error("Failed to save settings:", error);
      return { success: false, error: error.message };
    }
  });

  // Memory Management
  ipcMain.handle("suspend-tab", (event, tabId) => {
    tabManager.suspend(tabId);
    return { success: true };
  });

  ipcMain.handle("resume-tab", (event, tabId) => {
    const view = tabManager.resume(tabId);
    if (view) {
      tabs.set(tabId, view);
      return { success: true };
    }
    return { success: false };
  });

  ipcMain.handle("get-memory-stats", async () => {
    const stats = {
      total: process.memoryUsage(),
      tabs: {},
    };

    for (const [id, tab] of tabs) {
      if (!tab.webContents.isDestroyed()) {
        try {
          const metrics = await tab.webContents.getProcessMemoryInfo();
          stats.tabs[id] = metrics;

          // Update tab memory tracking
          if (tabManager.tabs.has(id)) {
            tabManager.tabs.get(id).memoryUsage = metrics.private;
          }
        } catch (e) {
          // Tab might be destroyed
        }
      }
    }

    return stats;
  });

  // Bookmarks & History
  ipcMain.handle("add-bookmark", (event, bookmark) => {
    bookmark = bookmark || {};
    bookmark.id = Date.now().toString();
    bookmark.timestamp = Date.now();

    if (activeTabId && tabs.has(activeTabId)) {
      const tab = tabs.get(activeTabId);
      bookmark.url = bookmark.url || tab.webContents.getURL();
      bookmark.title = bookmark.title || tab.webContents.getTitle();
    }

    bookmarks.push(bookmark);
    saveData();
    return { success: true, bookmark };
  });

  ipcMain.handle("remove-bookmark", (event, bookmarkId) => {
    bookmarks = bookmarks.filter((b) => b.id !== bookmarkId);
    saveData();
    return { success: true };
  });

  ipcMain.handle("get-bookmarks", () => bookmarks);

  ipcMain.handle("get-history", () => history.slice(-100));

  ipcMain.handle("clear-history", () => {
    history = [];
    saveData();
    return { success: true };
  });

  // Window Controls
  ipcMain.handle("minimize-window", () => {
    mainWindow.minimize();
    return { success: true };
  });

  ipcMain.handle("maximize-window", () => {
    if (mainWindow.isMaximized()) {
      mainWindow.restore();
    } else {
      mainWindow.maximize();
    }
    return { success: true };
  });

  ipcMain.handle("close-window", () => {
    saveData();
    app.quit();
    return { success: true };
  });

  // DevTools
  ipcMain.handle("toggle-devtools", () => {
    if (activeTabId && tabs.has(activeTabId)) {
      const tab = tabs.get(activeTabId);
      if (tab.webContents.isDevToolsOpened()) {
        tab.webContents.closeDevTools();
      } else {
        tab.webContents.openDevTools({ mode: "detach" });
      }
    } else {
      mainWindow.webContents.toggleDevTools();
    }
    return { success: true };
  });

  // Find in Page
  ipcMain.handle("find-in-page", (event, text, options = {}) => {
    if (activeTabId && tabs.has(activeTabId)) {
      const tab = tabs.get(activeTabId);
      tab.webContents.findInPage(text, options);

      // Return find results
      return new Promise((resolve) => {
        tab.webContents.once("found-in-page", (event, result) => {
          resolve(result);
        });
      });
    }
    return { matches: 0 };
  });

  ipcMain.handle("find-next", () => {
    if (activeTabId && tabs.has(activeTabId)) {
      const tab = tabs.get(activeTabId);
      tab.webContents.findInPage("", { forward: true, findNext: true });
    }
    return { success: true };
  });

  ipcMain.handle("find-previous", () => {
    if (activeTabId && tabs.has(activeTabId)) {
      const tab = tabs.get(activeTabId);
      tab.webContents.findInPage("", { forward: false, findNext: true });
    }
    return { success: true };
  });

  ipcMain.handle("clear-find", () => {
    if (activeTabId && tabs.has(activeTabId)) {
      const tab = tabs.get(activeTabId);
      tab.webContents.stopFindInPage("clearSelection");
    }
    return { success: true };
  });

  // Zoom Control
  ipcMain.handle("set-zoom", (event, level) => {
    if (activeTabId && tabs.has(activeTabId)) {
      const tab = tabs.get(activeTabId);
      tab.webContents.setZoomFactor(level);
    }
    return { success: true };
  });

  ipcMain.handle("get-zoom", () => {
    if (activeTabId && tabs.has(activeTabId)) {
      const tab = tabs.get(activeTabId);
      return { zoom: tab.webContents.getZoomFactor() };
    }
    return { zoom: 1.0 };
  });

  // Print
  ipcMain.handle("print", () => {
    if (activeTabId && tabs.has(activeTabId)) {
      const tab = tabs.get(activeTabId);
      tab.webContents.print({ silent: false, printBackground: true });
    }
    return { success: true };
  });

  // Audio Control
  ipcMain.handle("pause-background-audio", () => {
    // Pause audio in all non-active tabs
    for (const [tabId, tab] of tabs) {
      if (tabId !== activeTabId) {
        tab.webContents.setAudioMuted(true);
      }
    }

    // Unmute active tab
    if (activeTabId && tabs.has(activeTabId)) {
      tabs.get(activeTabId).webContents.setAudioMuted(false);
    }

    return { success: true };
  });

  console.log("✅ Native IPC Handlers Ready with ALL enhancements!");
}

function createWindow() {
  // Memory optimization settings
  app.commandLine.appendSwitch("max-old-space-size", "2048"); // 2GB max
  app.commandLine.appendSwitch("enable-features", "BackForwardCache");
  app.commandLine.appendSwitch(
    "disable-features",
    "CalculateNativeWinOcclusion",
  );

  // Use system GPU when available
  app.commandLine.appendSwitch("enable-gpu-rasterization");
  app.commandLine.appendSwitch("enable-zero-copy");

  // Create preload
  const preloadPath = path.join(__dirname, "src", "preload-stable.js");

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    frame: false,
    backgroundColor: "#ffffff", // Solid background, no transparency
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      backgroundThrottling: true, // Enable throttling for inactive tabs
      webgl: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "src", "browser.html"));

  mainWindow.webContents.on("did-finish-load", () => {
    console.log("✅ Browser UI Loaded!");

    // Start memory monitoring
    startMemoryMonitoring();

    // Don't create initial tab - let renderer do it
    setTimeout(() => {
      console.log("✅ Ready for renderer to create initial tab");
    }, 100);
  });

  // Handle window resize
  mainWindow.on("resize", () => {
    if (activeTabId && tabs.has(activeTabId)) {
      updateTabBounds(tabs.get(activeTabId));
    }
  });
}

function createTab(url = "https://www.google.com") {
  const tabId = "tab-" + Date.now();

  // Configure content security
  const ses = session.fromPartition(`persist:${tabId}`);

  // Apply security settings
  if (globalSettings.adBlockEnabled) {
    ses.webRequest.onBeforeRequest(
      { urls: ["*://*/*"] },
      (details, callback) => {
        // Simple ad blocking
        const blockedDomains = [
          "doubleclick.net",
          "googleadservices.com",
          "googlesyndication.com",
          "google-analytics.com",
          "facebook.com/tr",
        ];

        const shouldBlock = blockedDomains.some((domain) =>
          details.url.includes(domain),
        );

        callback({ cancel: shouldBlock });
      },
    );
  }

  const tab = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      session: ses,
      partition: `persist:${tabId}`,
    },
  });

  // Configure memory limits per tab
  // const config = MEMORY_CONFIG[globalSettings.memoryOptimization || 'balanced'];
  tab.webContents.setBackgroundThrottling(true);

  // Set proper bounds
  updateTabBounds(tab);

  // Load URL
  tab.webContents.loadURL(url);

  // Track the tab
  tabs.set(tabId, tab);
  tabManager.create(tabId, tab);
  activeTabId = tabId;

  // Set as active view (replaces setBrowserView)
  mainWindow.setBrowserView(tab);

  // Track navigation
  tab.webContents.on("did-navigate", (event, newUrl) => {
    mainWindow.webContents.send("navigation-update", {
      tabId,
      url: newUrl,
    });

    // Update activity
    if (tabManager.tabs.has(tabId)) {
      tabManager.tabs.get(tabId).lastActivity = Date.now();
    }

    // Add to history
    history.push({
      url: newUrl,
      title: tab.webContents.getTitle(),
      timestamp: Date.now(),
    });
  });

  tab.webContents.on("page-title-updated", (event, title) => {
    mainWindow.webContents.send("title-update", { tabId, title });
  });

  // Memory pressure handling
  tab.webContents.on("render-process-gone", (event, details) => {
    console.error(`Tab ${tabId} crashed:`, details);
    mainWindow.webContents.send("tab-crashed", {
      tabId,
      reason: details.reason,
    });
  });

  // Notify UI
  mainWindow.webContents.send("tab-created", { tabId, url });

  console.log(`📑 Native tab created: ${url}`);

  return { success: true, tabId, url };
}

function switchTab(tabId) {
  if (!tabs.has(tabId)) return { success: false };

  // Mute audio in previous active tab
  if (activeTabId && tabs.has(activeTabId)) {
    const previousTab = tabs.get(activeTabId);
    if (previousTab.webContents && !previousTab.webContents.isDestroyed()) {
      previousTab.webContents.setAudioMuted(true);
    }
  }

  // Check if tab is suspended
  const tabData = tabManager.tabs.get(tabId);
  if (tabData && tabData.suspended) {
    const view = tabManager.resume(tabId);
    if (view) {
      tabs.set(tabId, view);
      mainWindow.setBrowserView(view);
      updateTabBounds(view);
    }
  } else {
    const tab = tabs.get(tabId);
    mainWindow.setBrowserView(tab);
    updateTabBounds(tab);

    // Unmute audio in new active tab
    if (tab.webContents && !tab.webContents.isDestroyed()) {
      tab.webContents.setAudioMuted(false);
    }
  }

  activeTabId = tabId;

  // Update activity
  if (tabManager.tabs.has(tabId)) {
    tabManager.tabs.get(tabId).lastActivity = Date.now();
  }

  mainWindow.webContents.send("tab-switched", { tabId });

  return { success: true };
}

function updateTabBounds(tab) {
  const bounds = mainWindow.getContentBounds();

  // EXACT measurements to prevent bleeding
  // Window controls: 32px
  // Tab bar: 40px
  // Nav bar: 80px
  // Total: 152px
  tab.setBounds({
    x: 0,
    y: 152, // Exact offset, no extra margin needed
    width: bounds.width,
    height: Math.max(100, bounds.height - 182), // 152px top + 30px status
  });
}

function startMemoryMonitoring() {
  // Monitor memory usage every 30 seconds
  setInterval(async () => {
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1048576);

    // Check for memory pressure
    const config =
      MEMORY_CONFIG[globalSettings.memoryOptimization || "balanced"];
    const maxTotalHeap = config.maxHeapMB * tabs.size;

    if (heapUsedMB > maxTotalHeap * 0.9) {
      console.log("Memory pressure detected, suspending inactive tabs...");

      // Suspend inactive tabs
      for (const [tabId] of tabs) {
        if (tabManager.shouldSuspend(tabId)) {
          tabManager.suspend(tabId);
        }
      }
    }

    // Send stats to renderer
    mainWindow.webContents.send("resource-update", {
      memory: heapUsedMB,
      tabCount: tabs.size,
      activeTab: activeTabId,
      suspended: Array.from(tabManager.suspended.keys()),
    });
  }, 30000);

  // Tab idle detection
  setInterval(() => {
    const config =
      MEMORY_CONFIG[globalSettings.memoryOptimization || "balanced"];

    for (const [tabId, tab] of tabs) {
      if (tabId === activeTabId) continue;

      const tabData = tabManager.tabs.get(tabId);
      if (!tabData || tabData.suspended) continue;

      const idleTime = Date.now() - tabData.lastActivity;

      // Throttle idle tabs
      if (idleTime > config.idleThrottleMs) {
        tab.webContents.setBackgroundThrottling(true);
        tab.webContents.setAudioMuted(true); // Mute background tabs
      }
    }
  }, 10000);
}

function applySettings(settings) {
  // Apply dark mode
  if (settings.darkMode !== undefined) {
    mainWindow.webContents.send("theme-changed", {
      darkMode: settings.darkMode,
    });
  }

  // Apply zoom
  if (settings.defaultZoom && activeTabId && tabs.has(activeTabId)) {
    tabs.get(activeTabId).webContents.setZoomLevel(settings.defaultZoom / 100);
  }
}

function saveData() {
  try {
    const dataPath = path.join(app.getPath("userData"), "browser-data.json");
    fs.writeFileSync(
      dataPath,
      JSON.stringify(
        {
          bookmarks,
          history: history.slice(-1000),
        },
        null,
        2,
      ),
    );
  } catch (e) {
    console.error("Failed to save data:", e);
  }
}

function loadData() {
  try {
    const dataPath = path.join(app.getPath("userData"), "browser-data.json");
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
      bookmarks = data.bookmarks || [];
      history = data.history || [];
    }
  } catch (e) {
    console.error("Failed to load data:", e);
  }
}

function loadSettings() {
  try {
    const settingsPath = path.join(app.getPath("userData"), "settings.json");
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, "utf8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to load settings:", e);
  }
  return globalSettings;
}

// Setup handlers before app ready
setupIPCHandlers();

// Configure app
app.disableHardwareAcceleration(); // Disable for stability

// Setup cache paths
if (!app.isPackaged) {
  const devCachePath = path.join(__dirname, ".cache");
  if (!fs.existsSync(devCachePath)) {
    fs.mkdirSync(devCachePath, { recursive: true });
  }
  app.setPath("userData", devCachePath);
}

app.whenReady().then(() => {
  loadData();
  globalSettings = loadSettings();
  createWindow();
});

app.on("window-all-closed", () => {
  saveData();
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("before-quit", () => {
  saveData();
});

console.log("🚀 Native BrowserView Implementation");
console.log("💾 Smart memory management with tab suspension");
console.log("⚡ No overlays, pure Chromium integration!");
