const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Navigation
  navigate: (url) => ipcRenderer.invoke("navigate", url),
  goBack: () => ipcRenderer.invoke("go-back"),
  goForward: () => ipcRenderer.invoke("go-forward"),
  reload: () => ipcRenderer.invoke("reload"),

  // Tabs
  createTab: (url) => ipcRenderer.invoke("create-tab", url),
  closeTab: (tabId) => ipcRenderer.invoke("close-tab", tabId),
  switchTab: (tabId) => ipcRenderer.invoke("switch-tab", tabId),
  getTabs: () => ipcRenderer.invoke("get-tabs"),

  // Bookmarks
  addBookmark: (bookmark) => ipcRenderer.invoke("add-bookmark", bookmark),
  removeBookmark: (id) => ipcRenderer.invoke("remove-bookmark", id),
  getBookmarks: () => ipcRenderer.invoke("get-bookmarks"),

  // History
  getHistory: () => ipcRenderer.invoke("get-history"),
  clearHistory: () => ipcRenderer.invoke("clear-history"),

  // Downloads
  downloadFile: (url) => ipcRenderer.invoke("download-file", url),
  getDownloads: () => ipcRenderer.invoke("get-downloads"),

  // Settings
  getSettings: () => ipcRenderer.invoke("get-settings"),
  saveSettings: (settings) => ipcRenderer.invoke("save-settings", settings),

  // Optimization
  optimizeTab: (tabId, protocol) =>
    ipcRenderer.invoke("optimize-tab", tabId, protocol),
  getOptimizationStats: () => ipcRenderer.invoke("get-optimization-stats"),

  // Window
  minimizeWindow: () => ipcRenderer.invoke("minimize-window"),
  maximizeWindow: () => ipcRenderer.invoke("maximize-window"),
  closeWindow: () => ipcRenderer.invoke("close-window"),

  // DevTools
  toggleDevTools: () => ipcRenderer.invoke("toggle-devtools"),

  // Events
  onTabCreated: (cb) => ipcRenderer.on("tab-created", (e, d) => cb(d)),
  onTabClosed: (cb) => ipcRenderer.on("tab-closed", (e, d) => cb(d)),
  onTabSwitched: (cb) => ipcRenderer.on("tab-switched", (e, d) => cb(d)),
  onNavigationUpdate: (cb) =>
    ipcRenderer.on("navigation-update", (e, d) => cb(d)),
  onTitleUpdate: (cb) => ipcRenderer.on("title-update", (e, d) => cb(d)),
  onDownloadStarted: (cb) =>
    ipcRenderer.on("download-started", (e, d) => cb(d)),
  onResourceUpdate: (cb) => ipcRenderer.on("resource-update", (e, d) => cb(d)),
  onAudioStarted: (cb) => ipcRenderer.on("audio-started", (e, d) => cb(d)),
  onAudioStopped: (cb) => ipcRenderer.on("audio-stopped", (e, d) => cb(d)),
});

console.log("✅ Preload: Bridge established");

// Natural Asymmetry Extensions
contextBridge.exposeInMainWorld("naturalAsymmetry", {
  setMode: (mode) => ipcRenderer.invoke("set-resource-mode", mode),
  getStatus: () => ipcRenderer.invoke("get-resource-status"),
  ratios: {
    emergence: 0.3,
    precision: 0.2,
    support: 0.5,
  },
});
