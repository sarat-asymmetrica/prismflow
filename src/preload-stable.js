
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
    
    // Downloads
    getDownloads: () => ipcRenderer.invoke('get-downloads'),
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
    
    // Events - return cleanup functions for React useEffect
    onTabCreated: (cb) => {
        const handler = (e, d) => cb(d);
        ipcRenderer.on('tab-created', handler);
        return () => ipcRenderer.removeListener('tab-created', handler);
    },
    onTabClosed: (cb) => {
        const handler = (e, d) => cb(d);
        ipcRenderer.on('tab-closed', handler);
        return () => ipcRenderer.removeListener('tab-closed', handler);
    },
    onTabSwitched: (cb) => {
        const handler = (e, d) => cb(d);
        ipcRenderer.on('tab-switched', handler);
        return () => ipcRenderer.removeListener('tab-switched', handler);
    },
    onNavigationUpdate: (cb) => {
        const handler = (e, d) => cb(d);
        ipcRenderer.on('navigation-update', handler);
        return () => ipcRenderer.removeListener('navigation-update', handler);
    },
    onTitleUpdate: (cb) => {
        const handler = (e, d) => cb(d);
        ipcRenderer.on('title-update', handler);
        return () => ipcRenderer.removeListener('title-update', handler);
    },
    onDownloadStarted: (cb) => {
        const handler = (e, d) => cb(d);
        ipcRenderer.on('download-started', handler);
        return () => ipcRenderer.removeListener('download-started', handler);
    },
    onDownloadUpdated: (cb) => {
        const handler = (e, d) => cb(d);
        ipcRenderer.on('download-updated', handler);
        return () => ipcRenderer.removeListener('download-updated', handler);
    },
    onResourceUpdate: (cb) => {
        const handler = (e, d) => cb(d);
        ipcRenderer.on('resource-update', handler);
        return () => ipcRenderer.removeListener('resource-update', handler);
    },
    onFindResult: (cb) => {
        const handler = (e, d) => cb(d);
        ipcRenderer.on('found-in-page', handler);
        return () => ipcRenderer.removeListener('found-in-page', handler);
    }
});

console.log('✅ Preload: Bridge established');
