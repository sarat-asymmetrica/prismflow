/**
 * Command Palette Overlay - Top Center
 * 
 * Beautiful glass morphism command palette for quick actions
 * Slides down from top, 600x400
 */

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '../globals.css';
import { Search, Command, Zap } from 'lucide-react';

interface Command {
  id: string;
  title: string;
  description: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
}

function CommandPaletteOverlay() {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: Command[] = [
    {
      id: 'new-tab',
      title: 'New Tab',
      description: 'Open a new browser tab',
      shortcut: 'Ctrl+T',
      icon: <Zap className="w-4 h-4" />,
      action: () => window.electronAPI?.createTab()
    },
    {
      id: 'bookmarks',
      title: 'Show Bookmarks',
      description: 'Toggle bookmarks panel',
      shortcut: 'Ctrl+B',
      icon: <Command className="w-4 h-4" />,
      action: () => console.log('Toggle bookmarks')
    },
    {
      id: 'history',
      title: 'Show History',
      description: 'Toggle history panel',
      shortcut: 'Ctrl+H',
      icon: <Command className="w-4 h-4" />,
      action: () => console.log('Toggle history')
    },
    {
      id: 'downloads',
      title: 'Show Downloads',
      description: 'Toggle downloads panel',
      shortcut: 'Ctrl+J',
      icon: <Command className="w-4 h-4" />,
      action: () => console.log('Toggle downloads')
    },
    {
      id: 'settings',
      title: 'Open Settings',
      description: 'Open browser settings',
      shortcut: 'Ctrl+,',
      icon: <Command className="w-4 h-4" />,
      action: () => console.log('Open settings')
    }
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.title.toLowerCase().includes(search.toLowerCase()) ||
    cmd.description.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault();
        filteredCommands[selectedIndex].action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredCommands, selectedIndex]);

  return (
    <div className="h-screen w-screen bg-transparent dark overflow-hidden flex items-start justify-center pt-16">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      
      {/* Command Palette Card */}
      <div className="relative z-10 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl">
        {/* Glass morphism background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl" />
        
        {/* Border glow */}
        <div className="absolute inset-0 border border-white/20 rounded-2xl" />
        
        {/* Content */}
        <div className="relative z-10">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-white/10">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400 text-lg"
              autoFocus
            />
          </div>

          {/* Command List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No commands found
              </div>
            ) : (
              filteredCommands.map((cmd, index) => (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  className={`w-full flex items-center gap-3 p-4 border-b border-white/5 transition-all ${
                    index === selectedIndex
                      ? 'bg-white/10'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex-shrink-0 text-blue-400">
                    {cmd.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-white font-medium">{cmd.title}</div>
                    <div className="text-sm text-gray-400">{cmd.description}</div>
                  </div>
                  {cmd.shortcut && (
                    <div className="flex-shrink-0 px-2 py-1 rounded bg-white/5 text-xs text-gray-400 font-mono">
                      {cmd.shortcut}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CommandPaletteOverlay />
  </React.StrictMode>
);
