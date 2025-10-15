import { useState } from 'react';
import { Search, Clock, X, ExternalLink } from 'lucide-react';
import { HistoryEntry } from '../electron-api';
import { EmptyState } from './EmptyState';

interface HistoryPanelProps {
  history: HistoryEntry[];
  onNavigate: (url: string) => void;
  onClose: () => void;
}

export function HistoryPanel({ history, onNavigate, onClose }: HistoryPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = history.filter(
    entry =>
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupHistoryByTime = (entries: HistoryEntry[]) => {
    const now = Date.now();
    const oneDay = 86400000;
    const oneWeek = oneDay * 7;

    return {
      today: entries.filter(e => now - e.visitTime < oneDay),
      yesterday: entries.filter(e => now - e.visitTime >= oneDay && now - e.visitTime < oneDay * 2),
      lastWeek: entries.filter(e => now - e.visitTime >= oneDay * 2 && now - e.visitTime < oneWeek),
    };
  };

  const grouped = groupHistoryByTime(filteredHistory);

  const renderGroup = (title: string, entries: HistoryEntry[]) => {
    if (entries.length === 0) return null;

    return (
      <div key={title} className="mb-6">
        <div className="px-2 py-2 text-xs text-gray-400 uppercase tracking-wider font-medium">
          {title}
        </div>
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <button
              key={index}
              onClick={() => {
                onNavigate(entry.url);
              }}
              className="w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 text-left flex items-start gap-3 group transition-all border border-white/10 hover:border-white/20"
            >
              <Clock className="w-4 h-4 mt-0.5 text-blue-400" />
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate font-medium text-white">{entry.title}</div>
                <div className="text-xs text-gray-400 truncate mt-1">{entry.url}</div>
              </div>
              <ExternalLink className="w-4 h-4 mt-0.5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">History</h3>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-gray-300 hover:text-white"
          aria-label="Close history"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search Bar - Fixed below header */}
      <div className="flex-shrink-0 p-4 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search history..."
            className="w-full h-10 pl-10 pr-3 rounded-lg bg-white/5 border border-white/10 outline-none focus:bg-white/10 focus:border-white/20 text-sm text-white placeholder:text-gray-400 transition-all"
            aria-label="Search history"
          />
        </div>
      </div>

      {/* History List - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredHistory.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No history yet"
            description="Your browsing history will appear here as you navigate the web."
          />
        ) : (
          <>
            {renderGroup('Today', grouped.today)}
            {renderGroup('Yesterday', grouped.yesterday)}
            {renderGroup('Last Week', grouped.lastWeek)}
          </>
        )}
      </div>
    </div>
  );
}



