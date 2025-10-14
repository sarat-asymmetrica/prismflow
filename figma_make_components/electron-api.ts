// Electron API Bridge - Real implementation for browser-stable.js
// Replaces mock-electron-api.ts with actual Electron IPC communication

export interface Tab {
  id: number;
  url: string;
  title: string;
  favicon: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  active?: boolean;
  isPinned?: boolean;
  isMuted?: boolean;
  isAudioPlaying?: boolean;
}

export interface Bookmark {
  id: number;
  title: string;
  url: string;
  favicon: string;
  folder?: string;
  dateAdded: number;
}

export interface HistoryEntry {
  id: number;
  title: string;
  url: string;
  favicon: string;
  visitTime: number;
  visitCount: number;
}

export interface Download {
  id: string;
  filename: string;
  url: string;
  totalBytes: number;
  receivedBytes: number;
  state: 'progressing' | 'completed' | 'cancelled' | 'interrupted' | 'paused';
  isPaused: boolean;
  canResume: boolean;
  startTime: number;
  endTime?: number;
  savePath: string;
}

export interface Settings {
  homepage: string;
  searchEngine: string;
  darkMode: boolean;
  autoSaveSession: boolean;
  blockPopups: boolean;
  enableJavaScript: boolean;
  enableImages: boolean;
  enableNotifications: boolean;
  clearOnExit: boolean;
  downloadPath: string;
}

export interface FindResult {
  activeMatchOrdinal: number;
  matches: number;
  finalUpdate: boolean;
}

export interface ElectronAPI {
  // Tab Management
  createTab: (url?: string) => Promise<Tab>;
  closeTab: (tabId: number) => Promise<void>;
  switchTab: (tabId: number) => Promise<void>;
  getTabs: () => Promise<Tab[]>;
  getActiveTab: () => Promise<Tab | null>;
  updateTab: (tabId: number, url: string) => Promise<void>;
  reloadTab: (tabId: number) => Promise<void>;
  goBack: (tabId: number) => Promise<void>;
  goForward: (tabId: number) => Promise<void>;
  stopTab: (tabId: number) => Promise<void>;
  
  // Bookmarks
  getBookmarks: () => Promise<Bookmark[]>;
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'dateAdded'>) => Promise<Bookmark>;
  removeBookmark: (id: number) => Promise<void>;
  
  // History
  getHistory: () => Promise<HistoryEntry[]>;
  clearHistory: () => Promise<void>;
  
  // Downloads
  getDownloads: () => Promise<Download[]>;
  pauseDownload: (id: string) => Promise<void>;
  resumeDownload: (id: string) => Promise<void>;
  cancelDownload: (id: string) => Promise<void>;
  openDownload: (id: string) => Promise<void>;
  showInFolder: (id: string) => Promise<void>;
  
  // Settings
  getSettings: () => Promise<Settings>;
  updateSettings: (settings: Partial<Settings>) => Promise<Settings>;
  
  // Find in Page
  findInPage: (text: string, options?: { forward?: boolean; matchCase?: boolean }) => Promise<void>;
  stopFindInPage: (action: 'clearSelection' | 'keepSelection' | 'activateSelection') => Promise<void>;
  
  // Session Management
  saveSession: (name: string) => Promise<void>;
  restoreSession: (name: string) => Promise<void>;
  getSessions: () => Promise<string[]>;
  
  // Window Controls
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  
  // Overlay Management (Opera-style floating panels)
  toggleOverlay: (overlayType: string) => Promise<{ success: boolean; visible: boolean }>;
  hideOverlay: (overlayType: string) => Promise<{ success: boolean }>;
  hideAllOverlays: () => Promise<{ success: boolean; count: number }>;
  isOverlayVisible: (overlayType: string) => Promise<{ visible: boolean }>;
  
  // Event Listeners
  onTabCreated: (callback: (tab: Tab) => void) => () => void;
  onTabClosed: (callback: (tabId: number) => void) => () => void;
  onTabUpdated: (callback: (tab: Tab) => void) => () => void;
  onTabSwitched: (callback: (tabId: number) => void) => () => void;
  onDownloadStarted: (callback: (download: Download) => void) => () => void;
  onDownloadProgress: (callback: (download: Download) => void) => () => void;
  onDownloadCompleted: (callback: (download: Download) => void) => () => void;
  onFindResult: (callback: (result: FindResult) => void) => () => void;
}

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;

// Create API wrapper
const electronAPI: ElectronAPI = isElectron ? window.electronAPI : createMockAPI();

// Mock API for development (when running outside Electron)
function createMockAPI(): ElectronAPI {
  console.warn('Running in development mode with mock Electron API');
  
  const mockTabs: Tab[] = [
    {
      id: 1,
      url: 'https://www.google.com',
      title: 'Google',
      favicon: 'https://www.google.com/favicon.ico',
      isLoading: false,
      canGoBack: false,
      canGoForward: false
    }
  ];
  
  const mockBookmarks: Bookmark[] = [];
  const mockHistory: HistoryEntry[] = [];
  const mockDownloads: Download[] = [];
  const mockSettings: Settings = {
    homepage: 'https://www.google.com',
    searchEngine: 'https://www.google.com/search?q=',
    darkMode: true,
    autoSaveSession: true,
    blockPopups: true,
    enableJavaScript: true,
    enableImages: true,
    enableNotifications: false,
    clearOnExit: false,
    downloadPath: ''
  };
  
  return {
    createTab: async (url) => {
      const tab: Tab = {
        id: Date.now(),
        url: url || 'about:blank',
        title: 'New Tab',
        favicon: '',
        isLoading: false,
        canGoBack: false,
        canGoForward: false
      };
      mockTabs.push(tab);
      return tab;
    },
    closeTab: async (tabId) => {
      const index = mockTabs.findIndex(t => t.id === tabId);
      if (index !== -1) mockTabs.splice(index, 1);
    },
    switchTab: async (tabId) => {
      console.log('Mock: Switch to tab', tabId);
    },
    getTabs: async () => mockTabs,
    getActiveTab: async () => mockTabs[0] || null,
    updateTab: async (tabId, url) => {
      const tab = mockTabs.find(t => t.id === tabId);
      if (tab) {
        tab.url = url;
        tab.isLoading = true;
      }
    },
    reloadTab: async (tabId) => console.log('Mock: Reload tab', tabId),
    goBack: async (tabId) => console.log('Mock: Go back', tabId),
    goForward: async (tabId) => console.log('Mock: Go forward', tabId),
    stopTab: async (tabId) => console.log('Mock: Stop tab', tabId),
    
    getBookmarks: async () => mockBookmarks,
    addBookmark: async (bookmark) => {
      const newBookmark: Bookmark = {
        ...bookmark,
        id: Date.now(),
        dateAdded: Date.now()
      };
      mockBookmarks.push(newBookmark);
      return newBookmark;
    },
    removeBookmark: async (id) => {
      const index = mockBookmarks.findIndex(b => b.id === id);
      if (index !== -1) mockBookmarks.splice(index, 1);
    },
    
    getHistory: async () => mockHistory,
    clearHistory: async () => {
      mockHistory.length = 0;
    },
    
    getDownloads: async () => mockDownloads,
    pauseDownload: async (id) => console.log('Mock: Pause download', id),
    resumeDownload: async (id) => console.log('Mock: Resume download', id),
    cancelDownload: async (id) => console.log('Mock: Cancel download', id),
    openDownload: async (id) => console.log('Mock: Open download', id),
    showInFolder: async (id) => console.log('Mock: Show in folder', id),
    
    getSettings: async () => mockSettings,
    updateSettings: async (settings) => {
      Object.assign(mockSettings, settings);
      return mockSettings;
    },
    
    findInPage: async (text, options) => console.log('Mock: Find in page', text, options),
    stopFindInPage: async (action) => console.log('Mock: Stop find', action),
    
    saveSession: async (name) => console.log('Mock: Save session', name),
    restoreSession: async (name) => console.log('Mock: Restore session', name),
    getSessions: async () => [],
    
    minimizeWindow: async () => console.log('Mock: Minimize window'),
    maximizeWindow: async () => console.log('Mock: Maximize window'),
    closeWindow: async () => console.log('Mock: Close window'),
    
    toggleOverlay: async (overlayType) => {
      console.log('Mock: Toggle overlay', overlayType);
      return { success: true, visible: true };
    },
    hideOverlay: async (overlayType) => {
      console.log('Mock: Hide overlay', overlayType);
      return { success: true };
    },
    hideAllOverlays: async () => {
      console.log('Mock: Hide all overlays');
      return { success: true, count: 0 };
    },
    isOverlayVisible: async (overlayType) => {
      console.log('Mock: Check overlay visibility', overlayType);
      return { visible: false };
    },
    
    onTabCreated: (callback) => () => {},
    onTabClosed: (callback) => () => {},
    onTabUpdated: (callback) => () => {},
    onTabSwitched: (callback) => () => {},
    onDownloadStarted: (callback) => () => {},
    onDownloadProgress: (callback) => () => {},
    onDownloadCompleted: (callback) => () => {},
    onFindResult: (callback) => () => {}
  };
}

// TypeScript declaration for window.electronAPI
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export { electronAPI };
export default electronAPI;
