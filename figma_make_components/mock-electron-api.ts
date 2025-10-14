// Mock Electron API for demonstration purposes
// In production, this would be replaced by the actual Electron contextBridge API

export interface Tab {
  id: string;
  url: string;
  title: string;
  active: boolean;
  favicon?: string;
  isPinned?: boolean;
  isAudioPlaying?: boolean;
  isMuted?: boolean;
}

export interface Bookmark {
  url: string;
  title: string;
  timestamp: number;
}

export interface HistoryEntry {
  url: string;
  title: string;
  timestamp: number;
}

export interface Download {
  filename: string;
  url: string;
  status: 'downloading' | 'completed' | 'failed';
  progress: number;
  size: string;
}

// Mock data store
class MockElectronAPI {
  private tabs: Tab[] = [
    {
      id: '1',
      url: 'https://www.google.com',
      title: 'Google',
      active: true,
    }
  ];

  private bookmarks: Bookmark[] = [
    { url: 'https://github.com', title: 'GitHub', timestamp: Date.now() - 86400000 },
    { url: 'https://stackoverflow.com', title: 'Stack Overflow', timestamp: Date.now() - 172800000 },
  ];

  private history: HistoryEntry[] = [
    { url: 'https://www.google.com', title: 'Google', timestamp: Date.now() - 3600000 },
    { url: 'https://news.ycombinator.com', title: 'Hacker News', timestamp: Date.now() - 7200000 },
    { url: 'https://www.reddit.com', title: 'Reddit', timestamp: Date.now() - 86400000 },
  ];

  private downloads: Map<string, Download> = new Map([
    ['1', { filename: 'document.pdf', url: 'https://example.com/doc.pdf', status: 'completed', progress: 100, size: '2.3 MB' }],
  ]);

  private theme: 'dark' | 'light' = 'dark';

  async navigate(url: string): Promise<{ success: boolean; url?: string }> {
    await this.delay(100);
    const activeTab = this.tabs.find(t => t.active);
    if (activeTab) {
      activeTab.url = url;
      activeTab.title = this.getTitleFromUrl(url);
      this.history.unshift({ url, title: activeTab.title, timestamp: Date.now() });
    }
    return { success: true, url };
  }

  async goBack(): Promise<void> {
    await this.delay(50);
    console.log('Navigate back');
  }

  async goForward(): Promise<void> {
    await this.delay(50);
    console.log('Navigate forward');
  }

  async refresh(): Promise<void> {
    await this.delay(50);
    console.log('Refresh current tab');
  }

  async createTab(url?: string): Promise<{ tabId: string; url: string }> {
    await this.delay(100);
    const newTab: Tab = {
      id: String(Date.now()),
      url: url || 'about:blank',
      title: url ? this.getTitleFromUrl(url) : 'New Tab',
      active: false,
      isPinned: false,
      isAudioPlaying: false,
      isMuted: false,
    };
    this.tabs.push(newTab);
    return { tabId: newTab.id, url: newTab.url };
  }

  async pinTab(tabId: string): Promise<{ success: boolean }> {
    await this.delay(50);
    const tab = this.tabs.find(t => t.id === tabId);
    if (tab) {
      tab.isPinned = !tab.isPinned;
      return { success: true };
    }
    return { success: false };
  }

  async muteTab(tabId: string): Promise<{ success: boolean }> {
    await this.delay(50);
    const tab = this.tabs.find(t => t.id === tabId);
    if (tab) {
      tab.isMuted = !tab.isMuted;
      return { success: true };
    }
    return { success: false };
  }

  async duplicateTab(tabId: string): Promise<{ tabId: string; url: string }> {
    await this.delay(100);
    const tab = this.tabs.find(t => t.id === tabId);
    if (tab) {
      return this.createTab(tab.url);
    }
    return { tabId: '', url: '' };
  }

  async closeTab(tabId: string): Promise<{ success: boolean }> {
    await this.delay(50);
    const index = this.tabs.findIndex(t => t.id === tabId);
    if (index !== -1) {
      this.tabs.splice(index, 1);
      if (this.tabs.length > 0) {
        this.tabs[0].active = true;
      }
      return { success: true };
    }
    return { success: false };
  }

  async switchTab(tabId: string): Promise<{ success: boolean }> {
    await this.delay(50);
    this.tabs.forEach(t => t.active = t.id === tabId);
    return { success: true };
  }

  async getTabs(): Promise<Tab[]> {
    await this.delay(30);
    return [...this.tabs];
  }

  async addBookmark(bookmark: { url: string; title: string }): Promise<{ success: boolean }> {
    await this.delay(50);
    this.bookmarks.unshift({ ...bookmark, timestamp: Date.now() });
    return { success: true };
  }

  async getBookmarks(): Promise<Bookmark[]> {
    await this.delay(30);
    return [...this.bookmarks];
  }

  async getHistory(): Promise<HistoryEntry[]> {
    await this.delay(30);
    return [...this.history];
  }

  async getDownloads(): Promise<Map<string, Download>> {
    await this.delay(30);
    return new Map(this.downloads);
  }

  async setTheme(theme: 'dark' | 'light'): Promise<void> {
    await this.delay(50);
    this.theme = theme;
  }

  async invokeProtocol(protocol: 'CLEAR' | 'BOOST' | 'SPEED' | 'FOCUS' | 'HARMONY'): Promise<{ success: boolean }> {
    await this.delay(100);
    console.log(`Protocol ${protocol} activated`);
    return { success: true };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getTitleFromUrl(url: string): string {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    } catch {
      return url;
    }
  }
}

export const electronAPI = new MockElectronAPI();

// Make it available globally (simulating Electron's contextBridge)
if (typeof window !== 'undefined') {
  (window as any).electronAPI = electronAPI;
}
