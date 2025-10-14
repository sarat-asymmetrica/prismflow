import { useState } from 'react';
import { Search, ExternalLink, X, Bookmark as BookmarkIcon } from 'lucide-react';
import { Bookmark } from '../../lib/mock-electron-api';
import { EmptyState } from './EmptyState';

interface BookmarksPanelProps {
  bookmarks: Bookmark[];
  onNavigate: (url: string) => void;
  onClose: () => void;
}

export function BookmarksPanel({ bookmarks, onNavigate, onClose }: BookmarksPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBookmarks = bookmarks.filter(
    bookmark =>
      bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="absolute top-[95px] right-4 w-80 max-h-[400px] glass-surface rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-slide-down">
      {/* Header */}
      <div className="p-4 border-b border-black/8 dark:border-white/8 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Bookmarks</h3>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors text-gray-700 dark:text-gray-300"
          aria-label="Close bookmarks"
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
            placeholder="Search bookmarks..."
            className="w-full h-9 pl-10 pr-3 rounded-lg glass-surface-subtle border-0 outline-none focus:glass-surface text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500"
            aria-label="Search bookmarks"
          />
        </div>
      </div>

      {/* Bookmarks List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredBookmarks.length === 0 ? (
          <EmptyState
            icon={BookmarkIcon}
            title="No bookmarks yet"
            description="Bookmark pages to access them quickly. Press Ctrl+D to bookmark the current page."
          />
        ) : (
          <div className="space-y-1">
            {filteredBookmarks.map((bookmark, index) => (
              <button
                key={index}
                onClick={() => {
                  onNavigate(bookmark.url);
                  onClose();
                }}
                className="w-full p-3 rounded-lg hover:glass-surface-subtle text-left flex items-start gap-3 group transition-all text-gray-800 dark:text-gray-200"
              >
                <ExternalLink className="w-4 h-4 mt-0.5 text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate font-medium">{bookmark.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 truncate">{bookmark.url}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



