import { useEffect, useState, useMemo } from 'react';
import { Search, Clock, Bookmark, Settings, ExternalLink, History, Download, Globe, Zap, X } from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: any;
  category: 'navigation' | 'bookmarks' | 'history' | 'actions' | 'settings';
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (url: string) => void;
  onOpenSettings: () => void;
  bookmarks: Array<{ url: string; title: string }>;
  history: Array<{ url: string; title: string }>;
  tabs: Array<{ id: string; title: string; url: string }>;
  onSwitchTab: (tabId: string) => void;
  onNewTab: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onOpenSettings,
  bookmarks,
  history,
  tabs,
  onSwitchTab,
  onNewTab,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const commands: CommandItem[] = useMemo(() => {
    const items: CommandItem[] = [
      {
        id: 'new-tab',
        label: 'New Tab',
        description: 'Open a new browser tab',
        icon: Globe,
        category: 'actions',
        action: () => {
          onNewTab();
          onClose();
        },
        keywords: ['new', 'tab', 'open'],
      },
      {
        id: 'settings',
        label: 'Settings',
        description: 'Open browser settings',
        icon: Settings,
        category: 'settings',
        action: () => {
          onOpenSettings();
          onClose();
        },
        keywords: ['settings', 'preferences', 'options'],
      },
    ];

    // Add tabs
    tabs.forEach(tab => {
      items.push({
        id: `tab-${tab.id}`,
        label: tab.title,
        description: tab.url,
        icon: Globe,
        category: 'navigation',
        action: () => {
          onSwitchTab(tab.id);
          onClose();
        },
        keywords: ['tab', 'switch', tab.title.toLowerCase()],
      });
    });

    // Add bookmarks
    bookmarks.forEach((bookmark, index) => {
      items.push({
        id: `bookmark-${index}`,
        label: bookmark.title,
        description: bookmark.url,
        icon: Bookmark,
        category: 'bookmarks',
        action: () => {
          onNavigate(bookmark.url);
          onClose();
        },
        keywords: ['bookmark', bookmark.title.toLowerCase()],
      });
    });

    // Add history
    history.slice(0, 10).forEach((entry, index) => {
      items.push({
        id: `history-${index}`,
        label: entry.title,
        description: entry.url,
        icon: History,
        category: 'history',
        action: () => {
          onNavigate(entry.url);
          onClose();
        },
        keywords: ['history', entry.title.toLowerCase()],
      });
    });

    return items;
  }, [tabs, bookmarks, history, onNavigate, onOpenSettings, onSwitchTab, onNewTab, onClose]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands.slice(0, 8);

    const lowerQuery = query.toLowerCase();
    return commands
      .filter(cmd => {
        const searchString = `${cmd.label} ${cmd.description || ''} ${cmd.keywords?.join(' ') || ''}`.toLowerCase();
        return searchString.includes(lowerQuery);
      })
      .slice(0, 8);
  }, [query, commands]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => (i + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => (i - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  const categoryLabels = {
    navigation: 'Tabs',
    bookmarks: 'Bookmarks',
    history: 'History',
    actions: 'Actions',
    settings: 'Settings',
  };

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/40 dark:bg-black/60 backdrop-blur-md animate-slide-up"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl glass-surface rounded-2xl shadow-2xl overflow-hidden bg-white/95 dark:bg-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="p-4 border-b border-black/8 dark:border-white/8 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-500 dark:text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent border-0 outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-500"
            autoFocus
          />
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors text-gray-500"
            aria-label="Close command palette"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Commands List */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-500 text-sm">
              No results found
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category} className="mb-3">
                <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider font-medium">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </div>
                <div className="space-y-1">
                  {items.map((cmd, index) => {
                    const globalIndex = filteredCommands.indexOf(cmd);
                    const Icon = cmd.icon;
                    return (
                      <button
                        key={cmd.id}
                        onClick={cmd.action}
                        className={`
                          w-full p-3 rounded-lg text-left flex items-center gap-3 transition-all
                          ${globalIndex === selectedIndex
                            ? 'glass-surface-bright text-gray-900 dark:text-gray-100'
                            : 'hover:glass-surface-subtle text-gray-800 dark:text-gray-200'
                          }
                        `}
                      >
                        <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{cmd.label}</div>
                          {cmd.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-500 truncate">{cmd.description}</div>
                          )}
                        </div>
                        {globalIndex === selectedIndex && (
                          <div className="text-xs text-gray-500 dark:text-gray-500 flex-shrink-0">↵</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-black/8 dark:border-white/8 flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">↵</kbd> Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">Esc</kbd> Close
            </span>
          </div>
          <span>{filteredCommands.length} results</span>
        </div>
      </div>
    </div>
  );
}



