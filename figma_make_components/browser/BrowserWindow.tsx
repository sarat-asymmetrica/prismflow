import { useState, useEffect } from 'react';
import { TabBar } from './TabBar';
import { NavigationBar } from './NavigationBar';
import { StatusBar } from './StatusBar';
import { GreyBackground } from './GreyBackground';
import { SettingsPage } from './SettingsPage';
import { BookmarksPanel } from './BookmarksPanel';
import { HistoryPanel } from './HistoryPanel';
import { DownloadsPanel } from './DownloadsPanel';
import { CommandPalette } from './CommandPalette';
import { LoadingProgress } from './LoadingProgress';
import { SessionManager } from './SessionManager';
import { ReadingMode } from './ReadingMode';
import { electronAPI, Tab, Bookmark, HistoryEntry, Download } from "../electron-api";
import { toast } from 'sonner';

type PanelType = 'bookmarks' | 'history' | 'downloads' | null;

export function BrowserWindow() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [glassIntensity, setGlassIntensity] = useState(20);
  const [particleDensity, setParticleDensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState<'ready' | 'loading' | 'error'>('ready');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showSessionManager, setShowSessionManager] = useState(false);
  const [showReadingMode, setShowReadingMode] = useState(false);
  const [sessions, setSessions] = useState<Array<{
    id: string;
    name: string;
    tabs: Array<{ url: string; title: string }>;
    timestamp: number;
  }>>([]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K: Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      // Ctrl/Cmd + T: New tab
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        handleCreateTab();
      }
      // Ctrl/Cmd + W: Close tab
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault();
        const activeTab = tabs.find(t => t.active);
        if (activeTab) handleCloseTab(activeTab.id);
      }
      // Ctrl/Cmd + ,: Settings
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        setShowSettings(true);
      }
      // Ctrl/Cmd + D: Toggle bookmark
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        handleToggleBookmark();
      }
      // Ctrl/Cmd + R: Refresh
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        electronAPI.reload();
      }
      // Ctrl/Cmd + Shift + S: Session Manager
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        setShowSessionManager(true);
      }
      // Ctrl/Cmd + Shift + R: Reading Mode
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        setShowReadingMode(true);
      }
      // Escape: Close panels and settings
      if (e.key === 'Escape') {
        setShowSettings(false);
        setActivePanel(null);
        setShowCommandPalette(false);
        setShowSessionManager(false);
        setShowReadingMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs]);

  // Load initial data
  useEffect(() => {
    loadTabs();
    loadBookmarks();
    loadHistory();
    loadDownloads();
  }, []);

  const loadTabs = async () => {
    const tabs = await electronAPI.getTabs();
    setTabs(tabs);
  };

  const loadBookmarks = async () => {
    const bookmarks = await electronAPI.getBookmarks();
    setBookmarks(bookmarks);
  };

  const loadHistory = async () => {
    const history = await electronAPI.getHistory();
    setHistory(history);
  };

  const loadDownloads = async () => {
    const downloadsMap = await electronAPI.getDownloads();
    setDownloads(Array.from(downloadsMap.values()));
  };

  const handleNavigate = async (url: string) => {
    setStatus('loading');
    const result = await electronAPI.navigate(url);
    if (result.success) {
      await loadTabs();
      await loadHistory();
      setStatus('ready');
    } else {
      setStatus('error');
      toast.error('Navigation failed');
    }
  };

  const handleCreateTab = async () => {
    const result = await electronAPI.createTab('https://www.google.com');
    if (result && result.id) {
      await loadTabs();
      toast.success('New tab created');
    }
  };

  const handleCloseTab = async (tabId: string | number) => {
    await electronAPI.closeTab(tabId);
    await loadTabs();
  };

  const handleSwitchTab = async (tabId: string | number) => {
    await electronAPI.switchTab(tabId);
    await loadTabs();
  };

  const handleToggleBookmark = async () => {
    const activeTab = tabs.find(t => t.active);
    if (activeTab) {
      const isBookmarked = bookmarks.some(b => b.url === activeTab.url);
      
      if (!isBookmarked) {
        await electronAPI.addBookmark({ 
          url: activeTab.url, 
          title: activeTab.title,
          favicon: activeTab.favicon || '' 
        });
        await loadBookmarks();
        toast.success('Bookmark added');
      } else {
        toast.info('Already bookmarked');
      }
    }
  };

  const handlePinTab = async (tabId: string | number) => {
    // TODO: Implement pinTab in backend
    toast.info('Pin tab feature coming soon');
    console.log('Pin tab:', tabId);
  };

  const handleMuteTab = async (tabId: string | number) => {
    // TODO: Implement muteTab in backend
    toast.info('Mute tab feature coming soon');
    console.log('Mute tab:', tabId);
  };

  const handleDuplicateTab = async (tabId: string | number) => {
    // TODO: Implement duplicateTab in backend
    toast.info('Duplicate tab feature coming soon');
    console.log('Duplicate tab:', tabId);
  };

  const handleCloseOtherTabs = async (tabId: string | number) => {
    const otherTabs = tabs.filter(t => t.id !== tabId);
    for (const tab of otherTabs) {
      await electronAPI.closeTab(tab.id);
    }
    await loadTabs();
    toast.success('Other tabs closed');
  };

  const handleRefreshTab = async (tabId: string | number) => {
    await electronAPI.reload();
    toast.success('Tab refreshed');
  };

  const handleSaveSession = (name: string, currentTabs: Tab[]) => {
    const session = {
      id: String(Date.now()),
      name,
      tabs: currentTabs.map(t => ({ url: t.url, title: t.title })),
      timestamp: Date.now(),
    };
    setSessions([...sessions, session]);
    toast.success('Session saved');
  };

  const handleRestoreSession = async (session: typeof sessions[0]) => {
    for (const tab of session.tabs) {
      await electronAPI.createTab(tab.url);
    }
    await loadTabs();
    toast.success('Session restored');
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
    toast.success('Session deleted');
  };

  const handleProtocolInvoke = async (protocol: string) => {
    // TODO: Implement invokeProtocol in backend
    toast.success(`${protocol} protocol activated`, {
      description: 'System optimization in progress',
    });
    console.log('Invoke protocol:', protocol);
  };

  const activeTab = tabs.find(t => t.active);
  const currentUrl = activeTab?.url || '';
  const isSecure = currentUrl.startsWith('https://');
  const isBookmarked = bookmarks.some(b => b.url === currentUrl);

  const particleCounts = {
    low: 50,
    medium: 75,
    high: 100,
  };

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      {/* Grey Background */}
      <GreyBackground isDark={isDarkMode} />

      {/* Loading Progress */}
      <LoadingProgress isLoading={status === 'loading'} />

      {/* UI Container - positioned above BrowserView */}
      <div className="relative z-50 pointer-events-auto">
        {/* Tab Bar */}
        <TabBar
        tabs={tabs}
        onTabClick={handleSwitchTab}
        onTabClose={handleCloseTab}
        onNewTab={handleCreateTab}
        onSettingsClick={() => setShowSettings(true)}
        onPinTab={handlePinTab}
        onMuteTab={handleMuteTab}
        onDuplicateTab={handleDuplicateTab}
        onCloseOtherTabs={handleCloseOtherTabs}
        onRefreshTab={handleRefreshTab}
        onMinimize={() => electronAPI.minimizeWindow()}
        onMaximize={() => electronAPI.maximizeWindow()}
        onClose={() => electronAPI.closeWindow()}
      />

      {/* Navigation Bar */}
      <NavigationBar
        currentUrl={currentUrl}
        isSecure={isSecure}
        isBookmarked={isBookmarked}
        onNavigate={handleNavigate}
        onBack={() => electronAPI.goBack()}
        onForward={() => electronAPI.goForward()}
        onRefresh={() => electronAPI.reload()}
        onToggleBookmark={handleToggleBookmark}
        onMenuClick={() => setActivePanel(activePanel === 'bookmarks' ? null : 'bookmarks')}
        onToggleReadingMode={() => setShowReadingMode(true)}
        canGoBack={false}
        canGoForward={false}
        isLoading={status === 'loading'}
        bookmarks={bookmarks}
        history={history}
      />
      </div>

      {/* Content Area - BrowserView renders here below the UI */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden pointer-events-none">
        <div className="text-center space-y-8 max-w-2xl mx-auto p-12 animate-slide-up">
          <h1 className="text-7xl font-serif tracking-tight text-gray-900 dark:text-gray-100">
            PrismFlow
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-light tracking-wide">
            Minimalist consciousness browser
          </p>
          
          {/* Demo Navigation Suggestions */}
          <div className="mt-12 flex flex-wrap gap-3 justify-center pt-8">
            {['google.com', 'github.com', 'wikipedia.org'].map((site, index) => (
              <button
                key={site}
                onClick={() => handleNavigate(`https://www.${site}`)}
                className="px-6 py-3 rounded-full glass-surface hover:glass-surface-bright transition-all duration-200 text-sm font-medium tracking-wide text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {site}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar status={status} />

      {/* Settings Modal */}
      {showSettings && (
        <SettingsPage
          onClose={() => setShowSettings(false)}
          isDarkMode={isDarkMode}
          onThemeToggle={() => setIsDarkMode(!isDarkMode)}
          glassIntensity={glassIntensity}
          onGlassIntensityChange={setGlassIntensity}
          particleDensity={particleDensity}
          onParticleDensityChange={setParticleDensity}
          onProtocolInvoke={handleProtocolInvoke}
        />
      )}

      {/* Auxiliary Panels */}
      {activePanel === 'bookmarks' && (
        <BookmarksPanel
          bookmarks={bookmarks}
          onNavigate={handleNavigate}
          onClose={() => setActivePanel(null)}
        />
      )}
      {activePanel === 'history' && (
        <HistoryPanel
          history={history}
          onNavigate={handleNavigate}
          onClose={() => setActivePanel(null)}
        />
      )}
      {activePanel === 'downloads' && (
        <DownloadsPanel
          downloads={downloads}
          onClose={() => setActivePanel(null)}
        />
      )}

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNavigate={handleNavigate}
        onOpenSettings={() => {
          setShowSettings(true);
          setShowCommandPalette(false);
        }}
        bookmarks={bookmarks}
        history={history}
        tabs={tabs.map(tab => ({ ...tab, id: String(tab.id) }))}
        onSwitchTab={handleSwitchTab}
        onNewTab={handleCreateTab}
      />

      {/* Session Manager */}
      <SessionManager
        isOpen={showSessionManager}
        onClose={() => setShowSessionManager(false)}
        onSaveSession={handleSaveSession}
        onRestoreSession={handleRestoreSession}
        onDeleteSession={handleDeleteSession}
        sessions={sessions}
        currentTabs={tabs}
      />

      {/* Reading Mode */}
      <ReadingMode
        isOpen={showReadingMode}
        onClose={() => setShowReadingMode(false)}
        content={{
          title: 'Sample Article',
          author: 'PrismFlow Team',
          publishDate: 'October 15, 2025',
          body: '<p>This is a demonstration of reading mode. In a production browser, this would extract and display the main content from the current page in a clean, distraction-free format.</p><p>The reader can adjust font size and focus on the content without ads, sidebars, or other distractions.</p>',
        }}
      />

      {/* Panel Toggle Buttons (Demo) */}
      <div className="fixed bottom-8 left-4 flex gap-2 z-40">
        <button
          onClick={() => setActivePanel(activePanel === 'bookmarks' ? null : 'bookmarks')}
          className="px-4 py-2 rounded-lg glass-surface hover:glass-surface-bright text-sm transition-all text-gray-900 dark:text-gray-100"
        >
          Bookmarks
        </button>
        <button
          onClick={() => setActivePanel(activePanel === 'history' ? null : 'history')}
          className="px-4 py-2 rounded-lg glass-surface hover:glass-surface-bright text-sm transition-all text-gray-900 dark:text-gray-100"
        >
          History
        </button>
        <button
          onClick={() => setActivePanel(activePanel === 'downloads' ? null : 'downloads')}
          className="px-4 py-2 rounded-lg glass-surface hover:glass-surface-bright text-sm transition-all text-gray-900 dark:text-gray-100"
        >
          Downloads
        </button>
        <button
          onClick={() => setShowSessionManager(true)}
          className="px-4 py-2 rounded-lg glass-surface hover:glass-surface-bright text-sm transition-all text-gray-900 dark:text-gray-100"
        >
          Sessions
        </button>
      </div>
    </div>
  );
}



