import { useState } from 'react';
import { Search, Clock, X } from 'lucide-react';
import { HistoryEntry } from '../../lib/mock-electron-api';
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
      today: entries.filter(e => now - e.timestamp < oneDay),
      yesterday: entries.filter(e => now - e.timestamp >= oneDay && now - e.timestamp < oneDay * 2),
      lastWeek: entries.filter(e => now - e.timestamp >= oneDay * 2 && now - e.timestamp < oneWeek),
    };
  };

  const grouped = groupHistoryByTime(filteredHistory);

  const renderGroup = (title: string, entries: HistoryEntry[]) => {
    if (entries.length === 0) return null;

    return (
      <div key={title} className="mb-4">
        <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider font-medium">
          {title}
        </div>
        <div className="space-y-1">
          {entries.map((entry, index) => (
            <button
              key={index}
              onClick={() => {
                onNavigate(entry.url);
                onClose();
              }}
              className="w-full p-3 rounded-lg hover:glass-surface-subtle text-left flex items-start gap-3 group transition-all text-gray-800 dark:text-gray-200"
            >
              <Clock className="w-4 h-4 mt-0.5 text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate font-medium">{entry.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 truncate">{entry.url}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="absolute top-[95px] right-4 w-80 max-h-[400px] glass-surface rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-slide-down">
      {/* Header */}
      <div className="p-4 border-b border-black/8 dark:border-white/8 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">History</h3>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors text-gray-700 dark:text-gray-300"
          aria-label="Close history"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-black/8 dark:border-white/8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search history..."
            className="w-full h-9 pl-10 pr-3 rounded-lg glass-surface-subtle border-0 outline-none focus:glass-surface text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500"
            aria-label="Search history"
          />
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-2">
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



