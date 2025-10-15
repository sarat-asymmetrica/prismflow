import { useState, useEffect } from 'react';
import { TabBar } from './TabBar';
import { NavigationBar } from './NavigationBar';
import { GreyBackground } from './GreyBackground';
import { LoadingProgress } from './LoadingProgress';
import { electronAPI, Tab } from "../electron-api";

export function MinimalChrome() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [currentUrl, setCurrentUrl] = useState('https://www.google.com');
  const [isSecure, setIsSecure] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Load initial tabs - create one if none exist
  useEffect(() => {
    const loadTabs = async () => {
      try {
        console.log('🔍 Loading tabs...');
        const tabsList = await electronAPI.getTabs();
        console.log('📋 Tabs list:', tabsList);
        
        if (tabsList.length === 0) {
          // No tabs exist, create initial tab
          console.log('🆕 Creating initial tab...');
          const newTab = await electronAPI.createTab('https://www.google.com');
          console.log('✅ Initial tab created:', newTab);
          setTabs([newTab]);
        } else {
          setTabs(tabsList);
        }
      } catch (error) {
        console.error('❌ Error loading tabs:', error);
      }
    };
    loadTabs();
  }, []);

  // Event listeners for tab updates
  useEffect(() => {
    // Listen for navigation updates
    const unsubNav = electronAPI.onNavigationUpdate?.((data: { tabId: string; url: string }) => {
      console.log('🔄 Navigation update:', data);
      setTabs(prevTabs => prevTabs.map(tab => 
        tab.id === data.tabId 
          ? { ...tab, url: data.url }
          : tab
      ));
      
      // Update current URL if it's the active tab
      const activeTab = tabs.find(t => t.active);
      if (activeTab && activeTab.id === data.tabId) {
        setCurrentUrl(data.url);
        setIsSecure(data.url.startsWith('https://'));
      }
    });

    // Listen for title updates
    const unsubTitle = electronAPI.onTitleUpdate?.((data: { tabId: string; title: string }) => {
      console.log('📝 Title update:', data);
      setTabs(prevTabs => prevTabs.map(tab => 
        tab.id === data.tabId 
          ? { ...tab, title: data.title }
          : tab
      ));
    });

    // Listen for tab created events
    const unsubCreate = electronAPI.onTabCreated?.((tab: Tab) => {
      console.log('🆕 Tab created event:', tab);
      setTabs(prevTabs => {
        // Check if tab already exists (avoid duplicates)
        if (prevTabs.some(t => t.id === tab.id)) {
          return prevTabs;
        }
        return [...prevTabs, tab];
      });
    });

    // Listen for tab closed events
    const unsubClose = electronAPI.onTabClosed?.((data: { tabId: string }) => {
      console.log('❌ Tab closed event:', data);
      setTabs(prevTabs => prevTabs.filter(t => t.id !== data.tabId));
    });

    // Listen for tab switched events
    const unsubSwitch = electronAPI.onTabSwitched?.((data: { tabId: string }) => {
      console.log('🔀 Tab switched event:', data);
      setTabs(prevTabs => prevTabs.map(tab => ({
        ...tab,
        active: tab.id === data.tabId
      })));
      
      const switchedTab = tabs.find(t => t.id === data.tabId);
      if (switchedTab) {
        setCurrentUrl(switchedTab.url);
        setIsSecure(switchedTab.url.startsWith('https://'));
      }
    });

    return () => {
      unsubNav?.();
      unsubTitle?.();
      unsubCreate?.();
      unsubClose?.();
      unsubSwitch?.();
    };
  }, [tabs]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      // Ctrl/Cmd + B: Toggle Bookmarks
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        electronAPI.toggleOverlay('bookmarks');
      }
      // Ctrl/Cmd + H: Toggle History
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        electronAPI.toggleOverlay('history');
      }
      // Ctrl/Cmd + J: Toggle Downloads
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        electronAPI.toggleOverlay('downloads');
      }
      // Ctrl/Cmd + K: Toggle Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        electronAPI.toggleOverlay('command-palette');
      }
      // Ctrl/Cmd + ,: Toggle Settings
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        electronAPI.toggleOverlay('settings');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs]);

  const handleCreateTab = async () => {
    const newTab = await electronAPI.createTab('https://www.google.com');
    setTabs(prevTabs => [...prevTabs, newTab]);
  };

  const handleCloseTab = async (tabId: string | number) => {
    await electronAPI.closeTab(tabId);
    setTabs(prevTabs => prevTabs.filter(t => t.id !== tabId));
  };

  const handleSwitchTab = async (tabId: string | number) => {
    await electronAPI.switchTab(tabId);
    const updatedTabs = tabs.map(t => ({
      ...t,
      active: t.id === tabId
    }));
    setTabs(updatedTabs);
  };

  const handleNavigate = async (url: string) => {
    const activeTab = tabs.find(t => t.active);
    if (activeTab) {
      await electronAPI.navigate(url);
      setCurrentUrl(url);
      setIsSecure(url.startsWith('https://'));
    }
  };

  const handlePinTab = async (tabId: string | number) => {
    // TODO: Implement pin logic
    console.log('Pin tab:', tabId);
  };

  const handleMuteTab = async (tabId: string | number) => {
    // TODO: Implement mute logic
    console.log('Mute tab:', tabId);
  };

  const handleDuplicateTab = async (tabId: string | number) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      const newTab = await electronAPI.createTab(tab.url);
      setTabs(prevTabs => [...prevTabs, newTab]);
    }
  };

  const handleCloseOtherTabs = async (tabId: string | number) => {
    const otherTabs = tabs.filter(t => t.id !== tabId);
    for (const tab of otherTabs) {
      await electronAPI.closeTab(tab.id);
    }
    setTabs(tabs.filter(t => t.id === tabId));
  };

  const handleRefreshTab = async (tabId: string | number) => {
    await electronAPI.reloadTab(tabId);
  };

  return (
    <>
      {/* Beautiful Figma Background */}
      <GreyBackground isDark={true} />
      
      {/* Loading Progress Bar */}
      <LoadingProgress isLoading={isLoading} />
      
      {/* Minimal Chrome - 100px total */}
      <div className="fixed top-0 left-0 right-0 z-50">
      {/* Tab Bar */}
      <TabBar
        tabs={tabs}
        onTabClick={handleSwitchTab}
        onTabClose={handleCloseTab}
        onNewTab={handleCreateTab}
        onSettingsClick={() => electronAPI.toggleOverlay('settings')}
        onPinTab={handlePinTab}
        onMuteTab={handleMuteTab}
        onDuplicateTab={handleDuplicateTab}
        onCloseOtherTabs={handleCloseOtherTabs}
        onRefreshTab={handleRefreshTab}
        onMinimize={() => electronAPI.minimizeWindow()}
        onMaximize={() => electronAPI.maximizeWindow()}
        onClose={() => electronAPI.closeWindow()}
      />      {/* Navigation Bar */}
      <NavigationBar
        currentUrl={currentUrl}
        isSecure={isSecure}
        isBookmarked={false}
        onNavigate={handleNavigate}
        onBack={() => electronAPI.goBack()}
        onForward={() => electronAPI.goForward()}
        onRefresh={() => electronAPI.reload()}
        onToggleBookmark={() => electronAPI.toggleOverlay('bookmarks')}
        onMenuClick={() => electronAPI.toggleOverlay('command-palette')}
        onToggleReadingMode={() => console.log('Reading mode - TODO: Implement')}
        canGoBack={tabs.find(t => t.active)?.canGoBack || false}
        canGoForward={tabs.find(t => t.active)?.canGoForward || false}
        isLoading={tabs.find(t => t.active)?.isLoading || false}
        bookmarks={[]}
        history={[]}
      />
      </div>
    </>
  );
}
