import { useState } from 'react';
import { Search, ExternalLink, X, Bookmark as BookmarkIcon, Star } from 'lucide-react';
import { Bookmark } from '../electron-api';
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
    <div className="h-full w-full flex flex-col">
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-white">Bookmarks</h3>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-gray-300 hover:text-white"
          aria-label="Close bookmarks"
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
            placeholder="Search bookmarks..."
            className="w-full h-10 pl-10 pr-3 rounded-lg bg-white/5 border border-white/10 outline-none focus:bg-white/10 focus:border-white/20 text-sm text-white placeholder:text-gray-400 transition-all"
            aria-label="Search bookmarks"
          />
        </div>
      </div>

      {/* Bookmarks List - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredBookmarks.length === 0 ? (
          <EmptyState
            icon={BookmarkIcon}
            title="No bookmarks yet"
            description="Bookmark pages to access them quickly. Press Ctrl+B to bookmark the current page."
          />
        ) : (
          <div className="space-y-2">
            {filteredBookmarks.map((bookmark, index) => (
              <button
                key={index}
                onClick={() => {
                  onNavigate(bookmark.url);
                }}
                className="w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 text-left flex items-start gap-3 group transition-all border border-white/10 hover:border-white/20"
              >
                <Star className="w-4 h-4 mt-0.5 text-amber-400 fill-amber-400" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate font-medium text-white">{bookmark.title}</div>
                  <div className="text-xs text-gray-400 truncate mt-1">{bookmark.url}</div>
                </div>
                <ExternalLink className="w-4 h-4 mt-0.5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



