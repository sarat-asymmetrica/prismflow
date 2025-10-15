
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Navigation
    navigate: (url) => ipcRenderer.invoke('navigate', url),
    goBack: () => ipcRenderer.invoke('go-back'),
    goForward: () => ipcRenderer.invoke('go-forward'),
    reload: () => ipcRenderer.invoke('reload'),
    
    // Tabs
    createTab: (url) => ipcRenderer.invoke('create-tab', url),
    closeTab: (tabId) => ipcRenderer.invoke('close-tab', tabId),
    switchTab: (tabId) => ipcRenderer.invoke('switch-tab', tabId),
    getTabs: () => ipcRenderer.invoke('get-tabs'),
    
    // Bookmarks
    addBookmark: (bookmark) => ipcRenderer.invoke('add-bookmark', bookmark),
    removeBookmark: (id) => ipcRenderer.invoke('remove-bookmark', id),
    getBookmarks: () => ipcRenderer.invoke('get-bookmarks'),
    
    // History
    getHistory: () => ipcRenderer.invoke('get-history'),
    clearHistory: () => ipcRenderer.invoke('clear-history'),
    
    // Downloads
    downloadFile: (url) => ipcRenderer.invoke('download-file', url),
    getDownloads: () => ipcRenderer.invoke('get-downloads'),
    
    // Settings
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
    
    // Optimization
    optimizeTab: (tabId, protocol) => ipcRenderer.invoke('optimize-tab', tabId, protocol),
    getOptimizationStats: () => ipcRenderer.invoke('get-optimization-stats'),
    
    // Find in Page
    findInPage: (text, options) => ipcRenderer.invoke('find-in-page', text, options),
    stopFindInPage: (action) => ipcRenderer.invoke('stop-find-in-page', action),
    
    // Download actions (getDownloads already defined above in Downloads section)
    cancelDownload: (id) => ipcRenderer.invoke('cancel-download', id),
    pauseDownload: (id) => ipcRenderer.invoke('pause-download', id),
    resumeDownload: (id) => ipcRenderer.invoke('resume-download', id),
    
    // Window
    minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
    maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
    closeWindow: () => ipcRenderer.invoke('close-window'),
    
    // Overlays (Opera-style floating panels)
    toggleOverlay: (overlayType) => ipcRenderer.invoke('overlay:toggle', overlayType),
    hideOverlay: (overlayType) => ipcRenderer.invoke('overlay:hide', overlayType),
    hideAllOverlays: () => ipcRenderer.invoke('overlay:hide-all'),
    isOverlayVisible: (overlayType) => ipcRenderer.invoke('overlay:is-visible', overlayType),
    
    // DevTools
    toggleDevTools: () => ipcRenderer.invoke('toggle-devtools'),
    
    // Events
    onTabCreated: (cb) => ipcRenderer.on('tab-created', (e, d) => cb(d)),
    onTabClosed: (cb) => ipcRenderer.on('tab-closed', (e, d) => cb(d)),
    onTabSwitched: (cb) => ipcRenderer.on('tab-switched', (e, d) => cb(d)),
    onNavigationUpdate: (cb) => ipcRenderer.on('navigation-update', (e, d) => cb(d)),
    onTitleUpdate: (cb) => ipcRenderer.on('title-update', (e, d) => cb(d)),
    onDownloadStarted: (cb) => ipcRenderer.on('download-started', (e, d) => cb(d)),
    onDownloadUpdated: (cb) => ipcRenderer.on('download-updated', (e, d) => cb(d)),
    onResourceUpdate: (cb) => ipcRenderer.on('resource-update', (e, d) => cb(d)),
    onFindResult: (cb) => ipcRenderer.on('found-in-page', (e, d) => cb(d))
});

console.log('✅ Preload: Bridge established');
