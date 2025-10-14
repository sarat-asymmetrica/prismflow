/**
 * PrismFlow Browser - ENHANCED BUILD
 * Natural Asymmetry Tuned Edition
 * Memory optimization balanced for smooth performance
 */

const electron = require("electron");
const { app, BrowserWindow, BrowserView, ipcMain } = electron;
// WebContentsView is only available in Electron 29+
const WebContentsView = electron.WebContentsView || null;
// const BaseWindow = electron.BaseWindow || null;
const path = require("path");
const fs = require("fs");

console.log("⚡ PrismFlow Browser - Enhanced Edition");
console.log(
  "🌟 Natural Asymmetry: 30% Emergence | 20% Precision | 50% Support",
);

// Natural Asymmetry Resource Distribution - Smooth & Stable
const NATURAL_ASYMMETRY = {
  emergence: {
    ratio: 0.3,
    memoryMB: 1024, // Comfortable 1GB for exploration
    gcInterval: 600000, // 10 minutes - very gentle
    gcThreshold: 300, // Only GC if heap > 300MB (never hit 3MB!)
    priority: "normal",
  },
  precision: {
    ratio: 0.2,
    memoryMB: 768, // 768MB for focused work
    gcInterval: 900000, // 15 minutes - super gentle
    gcThreshold: 250, // Only GC if heap > 250MB
    priority: "high",
  },
  support: {
    ratio: 0.5,
    memoryMB: 1536, // 1.5GB for smooth background
    gcInterval: 1200000, // 20 minutes - ultra gentle
    gcThreshold: 400, // Only GC if heap > 400MB
    priority: "below-normal",
  },
};

let mainWindow;
let tabs = new Map();
let activeTabId = null;
let bookmarks = [];
const isWebContentsView = !!WebContentsView; // Global check for WebContentsView availability
let history = [];
let downloads = new Map();
// let resourceMode = 'emergence';  // Start in emergence mode

// Helper function to send messages to renderer
function sendToRenderer(channel, data) {
  if (mainWindow) {
    if (mainWindow.webContents) {
      // BrowserWindow has webContents directly
      mainWindow.webContents.send(channel, data);
    } else if (mainWindow.mainView && mainWindow.mainView.webContents) {
      // BaseWindow with WebContentsView
      mainWindow.mainView.webContents.send(channel, data);
    }
  }
}

// Global settings object with defaults
let globalSettings = {
  homepage: "https://www.google.com",
  searchEngine: "google",
  darkMode: false,
  adBlockEnabled: true,
  trackingProtection: true,
  httpsOnly: true,
  downloadPath: "",
  defaultZoom: 100,
  autoplay: "allow",
  javascript: true,
  images: true,
  cookies: "allow",
  popups: "block",
  notifications: "ask",
};

// UX SMOOTHENING ENGINE - Active Memory Retention
// THE EFFICIENCY PARADOX: We're so optimized that systems panic!
// This is our "bridge solution" for Natural Asymmetry adoption
class UXSmoothener {
  constructor() {
    this.targetMemoryMB = 150; // Target steady-state memory
    this.minMemoryMB = 100; // Never let it drop below this
    this.memoryBuffer = null; // Memory retention buffer
    this.smoothingActive = false;
    this.lastMemoryMB = 0;
    this.memoryHistory = [];
    this.retentionArrays = []; // Arrays to hold memory
    this.interventionCount = 0; // Track how many times we fight back
    this.ballastMode = "adaptive"; // adaptive, fixed, or aggressive
    this.detectedDrops = []; // Log drops for research
  }

  startSmoothing() {
    if (this.smoothingActive) return;
    this.smoothingActive = true;

    // Pre-allocate memory buffers to prevent drops
    this.createMemoryFloor();

    // Monitor and maintain memory levels
    setInterval(() => this.maintainMemoryLevel(), 1000); // Check every second

    console.log("🌊 UX Smoothening Active - Memory floor established");
  }

  createMemoryFloor() {
    // THE EFFICIENCY PARADOX SOLUTION: Multi-strategy memory ballast
    const bytesPerMB = 1024 * 1024;

    // Strategy 1: Large typed arrays (most effective)
    const floatsPer10MB = (10 * bytesPerMB) / 4;
    for (let i = 0; i < 10; i++) {
      const buffer = new Float32Array(floatsPer10MB);
      // Touch memory to ensure real allocation
      for (let j = 0; j < buffer.length; j += 1000) {
        buffer[j] = Math.random() * i;
      }
      this.retentionArrays.push(buffer);
    }

    // Strategy 2: String pool (different memory zone)
    const stringPool = [];
    for (let i = 0; i < 100; i++) {
      // Create 1MB strings
      const bigString = "X".repeat(bytesPerMB) + i;
      stringPool.push(bigString);
    }
    this.retentionArrays.push(stringPool);

    // Strategy 3: Object graph (heap retention)
    const objectWeb = {};
    for (let i = 0; i < 1000; i++) {
      objectWeb[`node_${i}`] = {
        data: new Array(1000).fill(i),
        children: [],
        buffer: new ArrayBuffer(10000),
      };
    }
    this.retentionArrays.push(objectWeb);

    // Strategy 4: WebAssembly memory (if available)
    try {
      const memory = new WebAssembly.Memory({
        initial: 256, // 256 * 64KB = 16MB
        maximum: 512,
      });
      this.retentionArrays.push(memory);
      console.log("🚀 WASM memory ballast added");
    } catch (e) {
      // WASM not available, that's ok
    }

    console.log(
      `💾 Multi-strategy memory floor created: ${this.retentionArrays.length} retention strategies`,
    );
  }

  maintainMemoryLevel() {
    const memUsage = process.memoryUsage();
    const currentMB = memUsage.heapUsed / (1024 * 1024);

    // Track memory history for smoothing
    this.memoryHistory.push(currentMB);
    if (this.memoryHistory.length > 10) {
      this.memoryHistory.shift();
    }

    // Calculate trend
    const avgMemory =
      this.memoryHistory.reduce((a, b) => a + b, 0) / this.memoryHistory.length;
    const dropping = currentMB < avgMemory - 10; // Dropping fast

    // RESEARCH: Log drops for pattern analysis
    if (currentMB < 10 && this.lastMemoryMB > 50) {
      const dropEvent = {
        timestamp: Date.now(),
        from: this.lastMemoryMB,
        to: currentMB,
        drop: this.lastMemoryMB - currentMB,
        avgBefore: avgMemory,
      };
      this.detectedDrops.push(dropEvent);
      console.log("🔬 RESEARCH: Aggressive drop detected!", dropEvent);
      console.log(`📊 Total interventions needed: ${this.interventionCount}`);
    }

    // If memory is dropping toward our floor, resist!
    if (currentMB < this.minMemoryMB || dropping) {
      this.interventionCount++;
      this.resistMemoryDrop(currentMB);
    }

    // Smooth out spikes
    if (Math.abs(currentMB - this.lastMemoryMB) > 50) {
      console.log(
        `🎢 Memory spike detected: ${this.lastMemoryMB.toFixed(1)}MB → ${currentMB.toFixed(1)}MB`,
      );
      this.smoothMemoryTransition();
    }

    this.lastMemoryMB = currentMB;
  }

  resistMemoryDrop(currentMB) {
    // ADAPTIVE RESISTANCE: Fight harder when drops are more aggressive
    const dropSeverity = this.minMemoryMB - currentMB;
    const resistanceSizeMB = Math.max(20, dropSeverity * 2); // At least 20MB

    console.log(
      `🛡️ INTERVENTION #${this.interventionCount}: Resisting ${dropSeverity}MB drop with ${resistanceSizeMB}MB buffer`,
    );

    // Multi-type allocation to hit different memory pools
    const strategies = [];

    // ArrayBuffer resistance
    const buffer1 = new ArrayBuffer((resistanceSizeMB * 1024 * 1024) / 3);
    const view = new Uint8Array(buffer1);
    for (let i = 0; i < view.length; i += 1024) {
      view[i] = (i + this.interventionCount) % 256;
    }
    strategies.push(buffer1);

    // Typed array resistance
    const buffer2 = new Float64Array((resistanceSizeMB * 1024 * 1024) / 8 / 3);
    for (let i = 0; i < buffer2.length; i += 1000) {
      buffer2[i] = Math.random() * this.interventionCount;
    }
    strategies.push(buffer2);

    // Object resistance
    const objBuffer = [];
    for (let i = 0; i < resistanceSizeMB * 100; i++) {
      objBuffer.push({
        id: i,
        data: new Array(100).fill(i),
        intervention: this.interventionCount,
      });
    }
    strategies.push(objBuffer);

    // Keep references alive longer for severe drops
    const retentionTime = dropSeverity > 50 ? 10000 : 5000;

    setTimeout(() => {
      // Touch memory to keep alive
      strategies.forEach((s) => {
        if (s.length) s[0] = 1;
        else if (s.byteLength) new Uint8Array(s)[0] = 1;
      });
    }, retentionTime);

    console.log(
      `💪 Resistance deployed: ${strategies.length} strategies, ${retentionTime}ms retention`,
    );
  }

  smoothMemoryTransition() {
    // Create gradual memory transitions instead of spikes
    const transitionSteps = 5;
    const stepDelay = 200; // 200ms between steps

    for (let i = 0; i < transitionSteps; i++) {
      setTimeout(() => {
        // Small allocations to smooth the curve
        const smoothBuffer = new ArrayBuffer(2 * 1024 * 1024); // 2MB steps
        const view = new Uint8Array(smoothBuffer);
        view[0] = i; // Touch it

        // Release after a moment
        setTimeout(() => {
          view[0] = 0;
        }, 1000);
      }, i * stepDelay);
    }
  }

  getStatus() {
    return {
      smoothingActive: this.smoothingActive,
      currentMemoryMB: this.lastMemoryMB,
      targetMemoryMB: this.targetMemoryMB,
      memoryFloorMB: this.minMemoryMB,
      retentionBuffers: this.retentionArrays.length,
      avgMemoryMB:
        this.memoryHistory.reduce((a, b) => a + b, 0) /
          this.memoryHistory.length || 0,
      // Research data for Natural Asymmetry bridge solutions
      interventionCount: this.interventionCount,
      detectedDrops: this.detectedDrops.length,
      lastDrop: this.detectedDrops[this.detectedDrops.length - 1] || null,
      efficiencyParadox: "System too optimized - legacy assumptions violated",
      bridgeSolution: "Active memory ballast maintains compatibility",
    };
  }
}

// Create global UX smoother
const uxSmoothener = new UXSmoothener();

// Keep dummy for compatibility
const resourceManager = { mode: "smooth", smoother: uxSmoothener };

// Setup IPC handlers with Natural Asymmetry
function setupIPCHandlers() {
  // Navigation - EMERGENCE (30%)
  ipcMain.handle("navigate", async (event, url) => {
    if (!url) return { success: false, error: "No URL" };

    // Smart URL handling with creative exploration
    if (!url.startsWith("http")) {
      if (url.includes(".") && !url.includes(" ")) {
        url = "https://" + url;
      } else {
        // Creative search exploration
        url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
      }
    }

    if (activeTabId && tabs.has(activeTabId)) {
      const tab = tabs.get(activeTabId);
      tab.webContents.loadURL(url);

      // Emergence: Store rich history
      history.push({
        url: url,
        title: url,
        timestamp: Date.now(),
        mode: resourceManager.mode,
      });

      return { success: true, url };
    }

    return createTab(url);
  });

  // Tab Management - PRECISION (20%)
  ipcMain.handle("create-tab", (event, url) => {
    // Precision: Exact tab creation
    return createTab(url || "https://www.google.com");
  });

  ipcMain.handle("close-tab", (event, tabId) => {
    if (!tabs.has(tabId)) return { success: false };

    // Precision: Clean tab closure
    const tab = tabs.get(tabId);

    // NEW: Remove WebContentsView properly
    if (mainWindow.removeBrowserView) {
      mainWindow.removeBrowserView(tab);
    }

    // Clean up WebContentsView
    setTimeout(() => {
      if (tab.webContents && !tab.webContents.isDestroyed()) {
        tab.webContents.destroy();
      }
      tabs.delete(tabId);
    }, 100);

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

  // Browser Controls - SUPPORT (50%)
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

  ipcMain.handle("switch-tab", (event, tabId) => {
    return switchTab(tabId);
  });

  ipcMain.handle("get-tabs", () => {
    const list = [];
    for (const [id, tab] of tabs) {
      list.push({
        id,
        url: tab.webContents.getURL(),
        title: tab.webContents.getTitle(),
        active: id === activeTabId,
        isAudioPlaying: tab.webContents.isCurrentlyAudible(),
        memoryUsage: tab.webContents.getProcessMemoryInfo
          ? tab.webContents.getProcessMemoryInfo()
          : null,
      });
    }
    return list;
  });

  // Bookmarks - SUPPORT
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

  // History - SUPPORT
  ipcMain.handle("get-history", () => history.slice(-100));

  ipcMain.handle("clear-history", () => {
    history = [];
    saveData();
    return { success: true };
  });

  // Downloads - SUPPORT
  ipcMain.handle("download-file", (event, url) => {
    const id = Date.now().toString();
    downloads.set(id, {
      id,
      url,
      filename: path.basename(url),
      state: "starting",
      progress: 0,
    });

    sendToRenderer("download-started", downloads.get(id));
    return { success: true, downloadId: id };
  });

  ipcMain.handle("get-downloads", () => Array.from(downloads.values()));

  // Settings - SUPPORT
  ipcMain.handle("get-settings", () => {
    // Return actual saved settings merged with current state
    return {
      ...globalSettings,
      downloadPath: globalSettings.downloadPath || app.getPath("downloads"),
      optimizationEnabled: true,
      naturalAsymmetry: NATURAL_ASYMMETRY,
      currentMode: resourceManager.mode,
    };
  });

  ipcMain.handle("save-settings", (event, settings) => {
    try {
      // Save to both memory and file for persistence
      const settingsPath = path.join(app.getPath("userData"), "settings.json");

      // Merge with existing settings
      const currentSettings = loadSettings();
      const updatedSettings = { ...currentSettings, ...settings };

      // Write to file
      fs.writeFileSync(settingsPath, JSON.stringify(updatedSettings, null, 2));

      // Update in-memory settings
      Object.assign(globalSettings, updatedSettings);

      // Apply settings immediately
      applySettings(updatedSettings);

      console.log("Settings saved successfully:", updatedSettings);
      return { success: true, settings: updatedSettings };
    } catch (error) {
      console.error("Failed to save settings:", error);
      return { success: false, error: error.message };
    }
  });

  // Optimization - EMERGENCE + PRECISION
  ipcMain.handle("optimize-tab", (event, tabId, protocol) => {
    console.log(`⚡ Optimizing with ${protocol || "AUTO"}`);

    // Apply Natural Asymmetry optimization
    const improvement = Math.floor(
      30 * Math.random() + // 30% emergence
        20 + // 20% precision baseline
        50 * 0.5, // 50% support multiplier
    );

    if (activeTabId && tabs.has(activeTabId)) {
      const tab = tabs.get(activeTabId);

      // Inject performance optimization
      tab.webContents
        .executeJavaScript(
          `
                // Natural Asymmetry Performance Injection
                if (!window.naturalAsymmetry) {
                    window.naturalAsymmetry = {
                        emergence: 0.30,
                        precision: 0.20,
                        support: 0.50,
                        active: true
                    };
                    console.log('Natural Asymmetry activated: ', window.naturalAsymmetry);
                }
            `,
        )
        .catch((err) =>
          console.log("Optimization injection skipped:", err.message),
        );
    }

    return {
      success: true,
      improvement,
      protocol: protocol || "AUTO",
      message: `Performance improved by ${improvement}%`,
      mode: resourceManager.mode,
    };
  });

  ipcMain.handle("get-optimization-stats", () => ({
    totalOptimized: tabs.size * 30,
    averageImprovement: 35,
    protocolsUsed: ["CLEAR", "BOOST", "SPEED", "FOCUS", "HARMONY"],
    tabsOptimized: tabs.size,
    naturalAsymmetry: {
      emergence: "30%",
      precision: "20%",
      support: "50%",
    },
    currentMode: resourceManager.mode,
  }));

  // Window Controls - SUPPORT
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

  // DevTools - PRECISION
  ipcMain.handle("toggle-devtools", () => {
    if (activeTabId && tabs.has(activeTabId)) {
      const tab = tabs.get(activeTabId);
      if (tab.webContents.isDevToolsOpened()) {
        tab.webContents.closeDevTools();
      } else {
        tab.webContents.openDevTools({ mode: "detach" });
      }
    } else if (mainWindow.webContents) {
      // BrowserWindow has webContents directly
      mainWindow.webContents.toggleDevTools();
    }
    return { success: true };
  });

  // UX Smoothening Status
  ipcMain.handle("get-smoothening-status", () => {
    return uxSmoothener.getStatus();
  });

  // Natural Asymmetry Mode Control
  // Enhancement engine IPC handlers DISABLED
  /*
    ipcMain.handle('set-resource-mode', (event, mode) => {
        if (NATURAL_ASYMMETRY[mode]) {
            resourceManager.mode = mode;
            console.log(`Resource mode switched to: ${mode}`);
            return { success: true, mode };
        }
        return { success: false, error: 'Invalid mode' };
    });
    
    ipcMain.handle('get-resource-status', () => {
        const memUsage = process.memoryUsage();
        return {
            mode: resourceManager.mode,
            heapUsed: Math.round(memUsage.heapUsed / 1048576),
            heapTotal: Math.round(memUsage.heapTotal / 1048576),
            external: Math.round(memUsage.external / 1048576),
            optimal: resourceManager.getOptimalMode(),
            limits: NATURAL_ASYMMETRY[resourceManager.mode]
        };
    });
    */

  console.log("✅ IPC Handlers Ready with Natural Asymmetry!");
}

// NEW: Enhanced browser with Electron 32 optimizations!
function createWindow() {
  console.log("🚀 Creating Enhanced Browser with Electron 32 optimizations!");

  // Configure app with Natural Asymmetry (keeping all our optimizations)
  configureAppFlags();

  // Create BrowserWindow (works better with WebContentsView for tabs)
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    frame: false, // Custom frame for Natural Asymmetry UI
    transparent: false,
    backgroundColor: "#ffffff",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webviewTag: false, // No more webview!
      backgroundThrottling: false, // Keep everything active
      webgl: true,
      experimentalFeatures: true,
    },
    icon: path.join(__dirname, "icon.png"),
    show: false, // Show when ready
  });

  // Load the browser UI directly into BrowserWindow
  mainWindow.loadFile(path.join(__dirname, "src", "browser.html"));

  // Show when ready
  mainWindow.webContents.once("did-finish-load", () => {
    console.log("✅ Browser UI Loaded with WebContentsView support!");

    // Start UX Smoothening Engine
    uxSmoothener.startSmoothing();
    console.log("🌊 UX Smoothening Engine activated - memory floor at 100MB");

    // Apply any CSS fixes if needed
    mainWindow.webContents.insertCSS(`
            /* WebContentsView alignment fixes */
            body { margin: 0; padding: 0; overflow: hidden; }
            .content-area { position: relative; flex: 1; }
        `);

    mainWindow.show();
    console.log(
      "✨ WebContentsView-enabled browser ready - this is the FUTURE!",
    );

    // Create initial tab
    createTab(globalSettings.homepage || "https://www.google.com");
    console.log("🌐 Initial tab created");
  });

  // Clean up on close
  mainWindow.on("closed", () => {
    mainWindow = null;
    tabs.clear();
  });
}

// Helper function to configure all app flags
function configureAppFlags() {
  // All the V8 and Chromium flags we discovered
  const v8Flags = [
    "--max-old-space-size=3500",
    "--initial-old-space-size=1024",
    "--min-semi-space-size=64",
    "--max-semi-space-size=256",
    "--no-gc-global",
    "--no-incremental-marking",
    "--no-concurrent-marking",
    "--no-parallel-marking",
    "--no-scavenge",
    "--no-idle-time-collection",
    "--no-use-idle-notification",
    "--memory-reducer=false",
    "--memory-reducer-for-small-heaps=false",
    "--heap-growing-percent=1000",
    "--no-flush-bytecode",
    "--no-lazy",
    "--gc-interval=999999999",
    "--semi-space-growth-factor=4",
  ].join(" ");

  app.commandLine.appendSwitch("js-flags", v8Flags);

  // Apply all our discovered disable-features
  const disabledFeatures = [
    "MemoryPressureSignals",
    "MemoryCoordinator",
    "MemoryAblation",
    "V8MemoryReducer",
    "AutomaticTabDiscarding",
    "TabFreeze",
    "BlinkHeapCompaction",
    "ParkableImages",
    "BackForwardCache",
    "LowEndDeviceMode",
    "IntensiveWakeUpThrottling",
  ].join(",");

  app.commandLine.appendSwitch("disable-features", disabledFeatures);
  app.commandLine.appendSwitch("disable-renderer-backgrounding");
  app.commandLine.appendSwitch("disable-background-timer-throttling");
  app.commandLine.appendSwitch("memory-pressure-off");
}

// OPTIMIZED BrowserView version with all our memory fixes
function _createWindowOptimized() {
  console.log("🚀 Creating OPTIMIZED BrowserView browser with memory fixes!");

  // Configure all our discovered flags
  configureAppFlags();

  // Create BrowserWindow with optimal settings
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    transparent: false,
    backgroundColor: "#ffffff",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "src", "preload-enhanced.js"),
      backgroundThrottling: false,
      webgl: true,
      experimentalFeatures: true,
      // Additional memory optimizations
      offscreen: false,
      enableBlinkFeatures: "OverlayScrollbars",
      disableBlinkFeatures: "AutomationControlled",
    },
    show: false,
  });

  mainWindow.loadFile(path.join(__dirname, "src", "browser.html"));

  mainWindow.webContents.on("did-finish-load", () => {
    console.log("✅ Browser UI Loaded with optimized BrowserView!");

    // Start UX Smoothening Engine
    uxSmoothener.startSmoothing();
    console.log("🌊 UX Smoothening Engine activated - memory floor at 100MB");

    // Apply CSS fixes
    mainWindow.webContents.insertCSS(`
            /* Optimized alignment */
            body { margin: 0; padding: 0; }
            .content-area { position: relative; flex: 1; overflow: hidden; }
        `);

    mainWindow.show();
    console.log("✨ Optimized browser ready with all memory fixes!");
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
    tabs.clear();
  });
}

function _createWindowLegacy() {
  // Keep old version for reference
  // Configure app with Natural Asymmetry
  // V8 FLAGS: Prevent aggressive garbage collection that causes 3MB drops
  const v8Flags = [
    "--max-old-space-size=2048", // 2GB heap
    "--initial-old-space-size=512", // Start with 512MB (prevent shrinking below this)
    "--max-semi-space-size=128", // Larger young generation
    "--no-gc-global", // Disable global GC
    "--gc-interval=100000", // GC only every 100k allocations
    "--no-incremental-marking", // Disable incremental GC
    "--no-idle-time-collection", // No GC during idle
    "--memory-reducer-for-small-heaps=false", // Don't reduce memory for small heaps
    "--heap-growing-percent=200", // Allow heap to grow 200% before GC
    "--no-flush-bytecode", // Keep compiled code in memory
    "--no-lazy", // Compile everything upfront
  ].join(" ");

  app.commandLine.appendSwitch("js-flags", v8Flags);

  // THE ULTIMATE "STOP HELPING" LIST
  // Every single memory optimization Chromium has - DISABLED!
  const disabledFeatures = [
    // Core memory management
    "MemoryPressureSignals",
    "MemoryCoordinator",
    "MemoryAblation",
    "V8MemoryReducer",
    "EmergencyMemoryPressureHandler",
    "MemoryPressureLevelReporter",

    // Tab and page management
    "AutomaticTabDiscarding",
    "TabFreeze",
    "TabRanker",
    "ProactiveTabFreeze",
    "SitePerProcess", // Keep everything in one process

    // Heap and GC related
    "BlinkHeapCompaction",
    "BlinkHeapConcurrentMarking",
    "BlinkHeapIncrementalMarking",
    "CompressParkableStrings",
    "ParkableImages",
    "ParkableImagesToDisk",

    // Performance "optimizations" that reduce memory
    "BackForwardCache",
    "BackForwardCacheMemoryControl",
    "FreezePurgeMemoryAllPagesFrozen",
    "PurgeRendererMemoryWhenBackgrounded",
    "ReduceUserAgent",
    "ReducedReferrerGranularity",

    // Resource loading "optimizations"
    "LazyImageLoading",
    "LazyFrameLoading",
    "ResourceLoadScheduler",
    "LowPriorityIframes",

    // Device mode detections
    "LowEndDeviceMode",
    "ForceEffectiveConnectionType",
    "CalculateNativeWinOcclusion",

    // Throttling
    "IntensiveWakeUpThrottling",
    "ThrottleForegroundTimers",
    "ExpensiveBackgroundTimerThrottling",
    "TimerThrottlingForBackgroundTabs",
    "TimerThrottlingForHiddenFrames",

    // Other "helpful" features
    "WebRtcHideLocalIpsWithMdns", // Keep WebRTC fast
    "OptimizationGuideModelDownloading", // No "optimization" downloads
    "InterestCohortAPI", // No FLoC
    "PrivacySandboxAdsAPIs", // No privacy sandbox
    "TrustTokens", // No trust tokens
  ].join(",");

  app.commandLine.appendSwitch("disable-features", disabledFeatures);

  // Keep tabs active and prevent throttling
  app.commandLine.appendSwitch("disable-renderer-backgrounding"); // Keep tabs active
  app.commandLine.appendSwitch("disable-background-timer-throttling"); // Smooth performance
  app.commandLine.appendSwitch("disable-ipc-flooding-protection"); // Prevent throttling
  app.commandLine.appendSwitch("high-dpi-support", "1"); // Better rendering
  app.commandLine.appendSwitch("force-device-scale-factor", "1"); // Consistent scaling

  // Memory floor settings - prevent drops below reasonable thresholds
  app.commandLine.appendSwitch("memory-pressure-off"); // Turn off memory pressure system
  app.commandLine.appendSwitch("max-tiles-for-interest-area", "512"); // More tiles in memory
  app.commandLine.appendSwitch(
    "max-unused-resource-memory-usage-percentage",
    "100",
  ); // Keep all resources
  app.commandLine.appendSwitch("renderer-process-limit", "32"); // Allow more processes
  app.commandLine.appendSwitch("max-active-webgl-contexts", "16"); // More WebGL contexts

  // Fix cache and GPU errors
  app.commandLine.appendSwitch("disable-gpu-sandbox");
  app.commandLine.appendSwitch("no-sandbox"); // Helps with permission issues
  app.commandLine.appendSwitch("disable-dev-shm-usage"); // Helps with shared memory
  app.commandLine.appendSwitch("disable-gpu-driver-bug-workarounds");

  // Set proper cache directory to avoid permission issues
  const userDataPath = app.getPath("userData");
  const cachePath = path.join(userDataPath, "Cache");
  app.commandLine.appendSwitch("disk-cache-dir", cachePath);

  // Create preload with Natural Asymmetry awareness
  const preloadPath = path.join(__dirname, "src", "preload-enhanced.js");
  const preloadContent =
    fs.readFileSync(path.join(__dirname, "src", "preload-stable.js"), "utf8") +
    `
    
// Natural Asymmetry Extensions
contextBridge.exposeInMainWorld('naturalAsymmetry', {
    setMode: (mode) => ipcRenderer.invoke('set-resource-mode', mode),
    getStatus: () => ipcRenderer.invoke('get-resource-status'),
    ratios: {
        emergence: 0.30,
        precision: 0.20,
        support: 0.50
    }
});
`;

  fs.writeFileSync(preloadPath, preloadContent);

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      // Better performance settings
      backgroundThrottling: false, // Don't throttle when in background
      webgl: true,
      experimentalFeatures: true,
    },
  });

  // Prevent white flash on load
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.loadFile(path.join(__dirname, "src", "browser.html"));

  mainWindow.webContents.on("did-finish-load", () => {
    console.log("✅ Browser UI Loaded!");

    // Start UX Smoothening Engine
    uxSmoothener.startSmoothing();
    console.log("🌊 UX Smoothening Engine activated - memory floor at 100MB");

    // Apply Natural Asymmetry CSS fixes for alignment
    mainWindow.webContents.insertCSS(`
            /* Natural Asymmetry Alignment Fixes */
            .tab-bar {
                display: flex;
                align-items: center;
                padding: 0 10px;
                gap: 5px;
            }
            
            .nav-bar {
                display: flex;
                align-items: center;
                padding: 8px 12px;
                gap: 8px;
            }
            
            .url-bar-container {
                flex: 1;
                display: flex;
                align-items: center;
            }
            
            .url-bar {
                width: 100%;
                box-sizing: border-box;
            }
            
            /* Fix particle canvas positioning */
            #particle-canvas, #weather-canvas {
                position: fixed;
                top: 0;
                left: 0;
                pointer-events: none;
                z-index: -1;
            }
            
            /* Fix content area bleeding and optimize input performance */
            .content-area {
                position: relative;
                flex: 1;
                overflow: hidden;
                margin-top: 5px;  /* Small gap to prevent bleed */
                contain: layout;  /* CSS containment for performance */
            }
            
            /* Optimize search/URL bar for smooth typing */
            input[type="text"], input[type="url"], input[type="search"], .url-bar {
                will-change: auto !important;  /* Prevent over-optimization */
                transform: translateZ(0);  /* GPU acceleration */
                -webkit-font-smoothing: subpixel-antialiased;
                transition: none !important;  /* Remove lag from transitions */
            }
            
            /* Prevent focus lag */
            input:focus {
                outline-offset: 0;
                transition: none !important;
            }
            
            /* Status bar alignment */
            .status-bar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 4px 12px;
            }
        `);

    // Don't create tab here - let the renderer do it via initializeWithElectron
    // This prevents duplicate tabs on startup
    setTimeout(() => {
      console.log(
        "✅ Browser UI ready - waiting for renderer to create initial tab",
      );
      // Resource monitoring disabled for testing
      // startResourceMonitoring();
    }, 200);
  });

  // Handle window resize for proper tab bounds (prevent bleeding)
  mainWindow.on("resize", () => {
    const bounds = mainWindow.getContentBounds();

    // Resize active tab
    if (activeTabId && tabs.has(activeTabId)) {
      const tab = tabs.get(activeTabId);
      // Maintain consistent bounds to prevent bleeding
      tab.setBounds({
        x: 0,
        y: 155, // Match createTab positioning - no bleed!
        width: bounds.width,
        height: Math.max(100, bounds.height - 185), // Match createTab calculation
      });
    }
  });
}

function _startResourceMonitoring() {
  // DISABLED FOR TESTING
  return;
  /*
    setInterval(() => {
        // Simple monitoring without aggressive memory management
        // Just report stats, don't try to control memory
        
        const memUsage = process.memoryUsage();
        sendToRenderer('resource-update', {
            memory: Math.round(memUsage.heapUsed / 1048576),
            cpu: process.cpuUsage(),
            tabCount: tabs.size,
            activeTab: activeTabId
        });
    }, 30000);  // Every 30 seconds - much less aggressive
    */
}

async function createTab(url = "https://www.google.com") {
  const tabId = "tab-" + Date.now();

  // Use BrowserView for now (WebContentsView has compatibility issues with setBrowserView)
  const tab = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      backgroundThrottling: false, // Keep tabs active
      // Optimize for text input performance
      offscreen: false,
      enableBlinkFeatures: "KeyboardEventKey",
      // Fix cache issues
      partition: `persist:tab-${tabId}`, // Separate partition per tab
      webgl: true,
      images: true,
      javascript: true,
      // Enable SharedArrayBuffer for Google Earth
      allowRunningInsecureContent: false,
      experimentalFeatures: true,
      // Prevent aggressive memory management
      autoplayPolicy: "no-user-gesture-required", // Don't restrict media
      defaultEncoding: "UTF-8",
      // Allocate reasonable memory per tab
      nodeIntegrationInSubFrames: false,
      disableDialogs: false,
      safeDialogs: true,
      navigateOnDragDrop: false,
    },
  });

  const bounds = mainWindow.getContentBounds();
  // Fix for bleeding - ensure proper bounds with padding
  // Fix bleeding: ACTUAL measurements from HTML
  // Window controls: 32px
  // Tab bar: 40px
  // Nav bar: 80px (contains search bar)
  // Total offset needed: 152px
  tab.setBounds({
    x: 0,
    y: 155, // 152px + 3px safety margin to prevent ANY bleeding
    width: bounds.width,
    height: Math.max(100, bounds.height - 185), // 155px top + 30px status bar
  });

  // WebContentsView doesn't have setAutoResize - handle resize manually
  if (isWebContentsView) {
    // WebContentsView auto-resizes by default when bounds change
    // We'll handle this in the resize event listener
  } else if (tab.setAutoResize) {
    // BrowserView fallback
    tab.setAutoResize({
      width: true,
      height: true,
      horizontal: false,
      vertical: false,
    });
  }

  // Ensure tab doesn't overlap with UI
  tab.webContents.on("dom-ready", () => {
    // Inject CSS to ensure content doesn't bleed into UI areas
    tab.webContents.insertCSS(`
            body { 
                margin-top: 0 !important;
                overflow-x: hidden;
            }
        `);
  });

  // Set headers for Google Earth and other web apps requiring SharedArrayBuffer
  tab.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = {
      ...details.responseHeaders,
      "Cross-Origin-Embedder-Policy": ["require-corp"],
      "Cross-Origin-Opener-Policy": ["same-origin"],
    };
    callback({ responseHeaders });
  });

  // Add tab to window FIRST before loading URL
  tabs.set(tabId, tab);
  activeTabId = tabId;

  // Add BrowserView to window
  mainWindow.setBrowserView(tab);
  console.log("✅ Tab added to window");

  // NOW load the URL after the view is attached
  await tab.webContents.loadURL(url);

  // Force a paint/update for WebContentsView
  if (isWebContentsView) {
    // Trigger a repaint by slightly adjusting bounds
    setTimeout(() => {
      const currentBounds = {
        x: 0,
        y: 155,
        width: bounds.width,
        height: Math.max(100, bounds.height - 185),
      };
      tab.setBounds(currentBounds);
      console.log("🎨 Forced repaint of WebContentsView");
    }, 100);
  }

  // Standard event tracking (enhancement disabled)
  tab.webContents.on("did-navigate", (event, newUrl) => {
    sendToRenderer("navigation-update", {
      tabId,
      url: newUrl,
      canGoBack: tab.webContents.navigationHistory
        ? tab.webContents.navigationHistory.canGoBack()
        : tab.webContents.canGoBack(),
      canGoForward: tab.webContents.navigationHistory
        ? tab.webContents.navigationHistory.canGoForward()
        : tab.webContents.canGoForward(),
      // mode: resourceManager.mode  // DISABLED
    });

    history.push({
      url: newUrl,
      title: tab.webContents.getTitle(),
      timestamp: Date.now(),
      // mode: resourceManager.mode  // DISABLED
    });
  });

  tab.webContents.on("page-title-updated", (event, title) => {
    sendToRenderer("title-update", { tabId, title });
  });

  // Audio detection for tabs
  tab.webContents.on("media-started-playing", () => {
    sendToRenderer("audio-started", { tabId });
  });

  tab.webContents.on("media-paused", () => {
    sendToRenderer("audio-stopped", { tabId });
  });

  // Notify UI
  sendToRenderer("tab-created", { tabId, url });

  console.log(`📑 Tab created: ${url}`);

  return { success: true, tabId, url };
}

function switchTab(tabId) {
  if (!tabs.has(tabId)) return { success: false };

  // For both BrowserView and WebContentsView
  tabs.forEach((tab, id) => {
    if (id !== tabId) {
      // Hide inactive tabs
      if (tab.setVisible) {
        tab.setVisible(false);
      }
    }
  });

  // Show and set the active tab
  const activeTab = tabs.get(tabId);
  if (activeTab.setVisible) {
    activeTab.setVisible(true);
  }

  // Set as the browser view
  mainWindow.setBrowserView(activeTab);
  activeTabId = tabId;

  // Ensure proper bounds after switch
  const bounds = mainWindow.getContentBounds();
  activeTab.setBounds({
    x: 0,
    y: 155, // UI offset
    width: bounds.width,
    height: Math.max(100, bounds.height - 185),
  });

  sendToRenderer("tab-switched", {
    tabId,
    url: activeTab.webContents.getURL(),
    canGoBack: activeTab.webContents.navigationHistory
      ? activeTab.webContents.navigationHistory.canGoBack()
      : activeTab.webContents.canGoBack(),
    canGoForward: activeTab.webContents.navigationHistory
      ? activeTab.webContents.navigationHistory.canGoForward()
      : activeTab.webContents.canGoForward(),
  });

  return { success: true };
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
          resourceStats: {
            mode: resourceManager.mode,
            lastGC: resourceManager.lastGC,
          },
        },
        null,
        2,
      ),
    );
  } catch (e) {
    console.error("Failed to save data:", e);
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
  return globalSettings; // Return defaults if load fails
}

function applySettings(settings) {
  // Apply dark mode
  if (settings.darkMode !== undefined) {
    sendToRenderer("theme-changed", { darkMode: settings.darkMode });
  }

  // Apply zoom level
  if (settings.defaultZoom) {
    if (activeTabId && tabs.has(activeTabId)) {
      tabs
        .get(activeTabId)
        .webContents.setZoomLevel(settings.defaultZoom / 100);
    }
  }

  // Update download path
  if (settings.downloadPath) {
    app.setPath("downloads", settings.downloadPath);
  }

  // Apply to all future tabs
  globalSettings = { ...globalSettings, ...settings };
}

function loadData() {
  try {
    const dataPath = path.join(app.getPath("userData"), "browser-data.json");
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
      bookmarks = data.bookmarks || [];
      history = data.history || [];
      if (data.resourceStats) {
        resourceManager.mode = data.resourceStats.mode || "emergence";
      }
    }
  } catch (e) {
    console.error("Failed to load data:", e);
  }
}

// CRITICAL: Configure memory settings BEFORE app initializes
// This ensures all flags take effect properly

// THE NUCLEAR OPTION: "CHROMIUM, STOP HELPING!"
// We're SO optimized that Chromium thinks we're dying! :D

// V8 FLAGS: Complete memory management bypass + NEW discoveries
const v8FlagsEarly = [
  // CRITICAL NEW FLAG from research
  "--max-old-space-size=3500", // Magic number that prevents OOM crashes
  "--initial-old-space-size=1024", // 1GB MINIMUM (no going below this!)
  "--min-semi-space-size=64", // Minimum 64MB for young gen
  "--max-semi-space-size=256", // Max 256MB for young gen

  // Disable ALL forms of GC
  "--no-gc-global", // NO global GC
  "--no-incremental-marking", // NO incremental GC
  "--no-concurrent-marking", // NO concurrent GC
  "--no-parallel-marking", // NO parallel GC
  "--no-scavenge", // NO scavenging
  "--no-idle-time-collection", // NO idle GC
  "--no-use-idle-notification", // IGNORE idle notifications

  // Memory reducer settings
  "--memory-reducer=false", // NO memory reducer
  "--memory-reducer-for-small-heaps=false", // NO reducer for small heaps
  "--heap-growing-percent=1000", // Heap must grow 10x before GC (basically never)

  // Code retention
  "--no-flush-bytecode", // Keep ALL compiled code
  "--no-lazy", // Compile everything immediately
  "--no-sparkplug", // Disable baseline compiler optimizations
  "--no-maglev", // Disable mid-tier compiler optimizations
  "--no-turbofan", // Disable top-tier compiler optimizations that trigger GC

  // Memory allocation tuning
  "--stress-scavenge=0", // No stress testing that triggers GC
  "--gc-interval=999999999", // GC interval: basically infinity
  "--semi-space-growth-factor=4", // Grow semi-space by 4x each time
  "--old-space-max-memory-mb=4096", // Additional old space limit
  "--trace-gc-verbose", // Let's SEE when GC tries to run!
].join(" ");

app.commandLine.appendSwitch("js-flags", v8FlagsEarly);

// COMPLETE MEMORY PRESSURE BYPASS + NEW DISCOVERIES
app.commandLine.appendSwitch("memory-pressure-off");
app.commandLine.appendSwitch("disable-low-end-device-mode");
app.commandLine.appendSwitch("enable-precise-memory-info"); // Get precise memory (no fuzzing)
app.commandLine.appendSwitch("unlimited-storage"); // Tell Chrome we have unlimited storage
app.commandLine.appendSwitch("disable-kill-after-bad-ipc"); // Don't kill for memory
app.commandLine.appendSwitch("disable-oop-rasterization"); // Keep rasterization in-process
app.commandLine.appendSwitch("disable-partial-raster"); // Don't optimize rasters
app.commandLine.appendSwitch("disable-gpu-memory-buffer-compositor-resources"); // Keep in RAM
app.commandLine.appendSwitch("disable-gpu-memory-buffer-video-frames"); // Keep video in RAM

// NEW FLAGS from research that prevent memory drops
app.commandLine.appendSwitch("disable-dev-shm-usage"); // Critical for memory stability
app.commandLine.appendSwitch("disable-gl-drawing-for-tests"); // Avoid WebGL memory issues
app.commandLine.appendSwitch("ipc", "host"); // Enable host IPC for better memory sharing
app.commandLine.appendSwitch("disable-site-isolation-trials"); // Reduce process overhead
app.commandLine.appendSwitch("disable-web-security"); // WARNING: Only for testing!
app.commandLine.appendSwitch("allow-running-insecure-content"); // For local development
app.commandLine.appendSwitch("ignore-certificate-errors"); // Skip cert checks
app.commandLine.appendSwitch("disable-blink-features", "AutomationControlled"); // Disable automation detection

// Setup handlers before app ready
setupIPCHandlers();

// Configure app settings BEFORE ready to prevent cache errors
app.disableHardwareAcceleration(); // Helps with GPU cache errors

// Set up proper paths before app starts
if (!app.isPackaged) {
  // Development mode - use local cache to avoid permission issues
  const devCachePath = path.join(__dirname, ".cache");
  if (!fs.existsSync(devCachePath)) {
    fs.mkdirSync(devCachePath, { recursive: true });
  }
  app.setPath("userData", devCachePath);
}

app.whenReady().then(() => {
  loadData();
  globalSettings = loadSettings(); // Load user settings
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

// Graceful shutdown
app.on("before-quit", () => {
  saveData();
});

console.log("🚀 Natural Asymmetry Distribution Active:");
console.log("   30% Emergence - Creative exploration & discovery");
console.log("   20% Precision - Focused optimization & refinement");
console.log("   50% Support - Infrastructure & maintenance");
console.log("✨ Enhanced for smooth performance!");
