import { useState, useRef } from 'react';
import { X, Plus, Settings, Volume2, VolumeX, Pin, Minimize2, Maximize2, XCircle } from 'lucide-react';
import { Tab } from '../electron-api';
import { TabContextMenu } from './TabContextMenu';
import { TabPreview } from './TabPreview';

interface TabBarProps {
  tabs: Tab[];
  onTabClick: (tabId: string | number) => void;
  onTabClose: (tabId: string | number) => void;
  onNewTab: () => void;
  onSettingsClick: () => void;
  onPinTab: (tabId: string | number) => void;
  onMuteTab: (tabId: string | number) => void;
  onDuplicateTab: (tabId: string | number) => void;
  onCloseOtherTabs: (tabId: string | number) => void;
  onRefreshTab: (tabId: string | number) => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

export function TabBar({ 
  tabs, 
  onTabClick, 
  onTabClose, 
  onNewTab, 
  onSettingsClick,
  onPinTab,
  onMuteTab,
  onDuplicateTab,
  onCloseOtherTabs,
  onRefreshTab,
  onMinimize,
  onMaximize,
  onClose,
}: TabBarProps) {
  const [rippleTab, setRippleTab] = useState<string | number | null>(null);
  const [contextMenu, setContextMenu] = useState<{ tabId: string | number; x: number; y: number } | null>(null);
  const [hoverTab, setHoverTab] = useState<{ tab: Tab; x: number; y: number } | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  const handleTabClick = (tabId: string | number) => {
    setRippleTab(tabId);
    setTimeout(() => setRippleTab(null), 600);
    onTabClick(tabId);
  };

  const handleContextMenu = (e: React.MouseEvent, tabId: string | number) => {
    e.preventDefault();
    setContextMenu({ tabId, x: e.clientX, y: e.clientY });
  };

  const handleMouseEnter = (e: React.MouseEvent, tab: Tab) => {
    hoverTimeoutRef.current = setTimeout(() => {
      const rect = e.currentTarget.getBoundingClientRect();
      setHoverTab({
        tab,
        x: rect.left + rect.width / 2 - 128,
        y: rect.bottom + 10,
      });
    }, 500);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoverTab(null);
  };

  const pinnedTabs = tabs.filter(t => t.isPinned);
  const regularTabs = tabs.filter(t => !t.isPinned);

  return (
    <div 
      className="h-11 px-4 flex items-center gap-3 glass-surface border-b border-black/8 dark:border-white/8"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Tabs */}
      <div 
        className="flex items-center gap-2 flex-1 overflow-x-auto scrollbar-hide"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Pinned Tabs */}
        {pinnedTabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            onContextMenu={(e) => handleContextMenu(e, tab.id)}
            onMouseEnter={(e) => handleMouseEnter(e, tab)}
            onMouseLeave={handleMouseLeave}
            className={`
              group relative h-8 w-12 flex items-center justify-center
              rounded-full transition-all duration-200 overflow-hidden flex-shrink-0
              ${tab.active 
                ? 'glass-surface-bright text-gray-900 dark:text-gray-100' 
                : 'glass-surface-subtle text-gray-700 dark:text-gray-300 opacity-70 hover:opacity-100'
              }
            `}
            title={tab.title}
          >
            {rippleTab === tab.id && (
              <span className="absolute inset-0 bg-white/20 dark:bg-white/10 rounded-full animate-[ripple_600ms_ease-out]" />
            )}
            <Pin className="w-3 h-3 relative z-10" />
            {tab.isAudioPlaying && (
              <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
            )}
          </button>
        ))}

        {/* Regular Tabs */}
        {regularTabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            onContextMenu={(e) => handleContextMenu(e, tab.id)}
            onMouseEnter={(e) => handleMouseEnter(e, tab)}
            onMouseLeave={handleMouseLeave}
            className={`
              group relative h-8 min-w-[140px] max-w-[220px] px-4 flex items-center gap-2
              rounded-full transition-all duration-200 overflow-hidden
              ${tab.active 
                ? 'glass-surface-bright text-gray-900 dark:text-gray-100' 
                : 'glass-surface-subtle text-gray-700 dark:text-gray-300 opacity-70 hover:opacity-100'
              }
            `}
            style={{
              animationDelay: `${index * 30}ms`,
            }}
          >
            {rippleTab === tab.id && (
              <span className="absolute inset-0 bg-white/20 dark:bg-white/10 rounded-full animate-[ripple_600ms_ease-out]" />
            )}
            
            {/* Audio Indicator */}
            {tab.isAudioPlaying && !tab.isMuted && (
              <Volume2 className="w-3 h-3 text-blue-600 dark:text-blue-400 relative z-10 flex-shrink-0" />
            )}
            {tab.isMuted && (
              <VolumeX className="w-3 h-3 text-gray-500 relative z-10 flex-shrink-0" />
            )}

            <span className="flex-1 truncate text-xs font-medium tracking-wide relative z-10">{tab.title}</span>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 relative z-10"
              aria-label="Close tab"
            >
              <X className="w-3 h-3" />
            </button>
          </button>
        ))}
      </div>

      {/* New Tab Button */}
      <button
        onClick={onNewTab}
        className="w-8 h-8 rounded-full glass-surface hover:glass-surface-bright flex items-center justify-center transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        title="New Tab (Ctrl+T)"
        aria-label="New tab"
      >
        <Plus className="w-4 h-4" />
      </button>

      {/* Settings Button */}
      <button
        onClick={onSettingsClick}
        className="w-8 h-8 rounded-full glass-surface hover:glass-surface-bright flex items-center justify-center transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        title="Settings (Ctrl+,)"
        aria-label="Settings"
      >
        <Settings className="w-4 h-4" />
      </button>

      {/* Window Controls */}
      {onMinimize && (
        <div 
          className="flex items-center gap-1 ml-2 border-l border-black/8 dark:border-white/8 pl-2"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            onClick={onMinimize}
            className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            title="Minimize"
            aria-label="Minimize window"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onMaximize}
            className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            title="Maximize"
            aria-label="Maximize window"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-red-500/20 flex items-center justify-center transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
            title="Close"
            aria-label="Close window"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <TabContextMenu
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
          onPinTab={() => onPinTab(contextMenu.tabId)}
          onMuteTab={() => onMuteTab(contextMenu.tabId)}
          onDuplicateTab={() => onDuplicateTab(contextMenu.tabId)}
          onCloseTab={() => onTabClose(contextMenu.tabId)}
          onCloseOtherTabs={() => onCloseOtherTabs(contextMenu.tabId)}
          onRefreshTab={() => onRefreshTab(contextMenu.tabId)}
          isPinned={tabs.find(t => t.id === contextMenu.tabId)?.isPinned || false}
          isMuted={tabs.find(t => t.id === contextMenu.tabId)?.isMuted || false}
        />
      )}

      {/* Tab Preview */}
      {hoverTab && (
        <TabPreview
          title={hoverTab.tab.title}
          url={hoverTab.tab.url}
          position={{ x: hoverTab.x, y: hoverTab.y }}
        />
      )}
    </div>
  );
}



