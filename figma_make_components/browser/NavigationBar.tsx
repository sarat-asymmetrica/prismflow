import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Lock, Unlock, Star, Menu, Book } from 'lucide-react';
import { URLSuggestions } from './URLSuggestions';

interface NavigationBarProps {
  currentUrl: string;
  isSecure: boolean;
  isBookmarked: boolean;
  onNavigate: (url: string) => void;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  onToggleBookmark: () => void;
  onMenuClick: () => void;
  onToggleReadingMode: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading?: boolean;
  bookmarks?: Array<{ url: string; title: string }>;
  history?: Array<{ url: string; title: string }>;
}

export function NavigationBar({
  currentUrl,
  isSecure,
  isBookmarked,
  onNavigate,
  onBack,
  onForward,
  onRefresh,
  onToggleBookmark,
  onMenuClick,
  onToggleReadingMode,
  canGoBack,
  canGoForward,
  isLoading = false,
  bookmarks = [],
  history = [],
}: NavigationBarProps) {
  const [urlInput, setUrlInput] = useState(currentUrl);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

  useEffect(() => {
    setUrlInput(currentUrl);
  }, [currentUrl]);

  const suggestions = useMemo(() => {
    if (!urlInput || !showSuggestions) return [];

    const query = urlInput.toLowerCase();
    const results: Array<{ type: 'history' | 'bookmark' | 'search'; title: string; url: string }> = [];

    // Add matching bookmarks
    bookmarks.forEach(bookmark => {
      if (bookmark.title.toLowerCase().includes(query) || bookmark.url.toLowerCase().includes(query)) {
        results.push({ type: 'bookmark', title: bookmark.title, url: bookmark.url });
      }
    });

    // Add matching history
    history.forEach(entry => {
      if (entry.title.toLowerCase().includes(query) || entry.url.toLowerCase().includes(query)) {
        if (!results.find(r => r.url === entry.url)) {
          results.push({ type: 'history', title: entry.title, url: entry.url });
        }
      }
    });

    // Add search suggestion
    if (query && !query.includes('.')) {
      results.push({ 
        type: 'search', 
        title: `Search for "${urlInput}"`, 
        url: `https://duckduckgo.com/?q=${encodeURIComponent(urlInput)}` 
      });
    }

    return results.slice(0, 8);
  }, [urlInput, showSuggestions, bookmarks, history]);

  const handleSubmit = (e?: React.FormEvent, overrideUrl?: string) => {
    e?.preventDefault();
    let url = overrideUrl || urlInput.trim();
    
    // Smart URL handling
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.') && !url.includes(' ')) {
        url = 'https://' + url;
      } else {
        // Search query
        url = 'https://duckduckgo.com/?q=' + encodeURIComponent(url);
      }
    }
    
    onNavigate(url);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(i => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(i => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && suggestions[selectedSuggestionIndex]) {
      e.preventDefault();
      handleSubmit(undefined, suggestions[selectedSuggestionIndex].url);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="h-14 px-6 flex items-center gap-3 glass-surface-subtle">
      {/* Back Button */}
      <button
        onClick={onBack}
        disabled={!canGoBack}
        className="w-9 h-9 rounded-full glass-surface hover:glass-surface-bright flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
        title="Back (Alt+←)"
        aria-label="Go back"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Forward Button */}
      <button
        onClick={onForward}
        disabled={!canGoForward}
        className="w-9 h-9 rounded-full glass-surface hover:glass-surface-bright flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
        title="Forward (Alt+→)"
        aria-label="Go forward"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        className="w-9 h-9 rounded-full glass-surface hover:glass-surface-bright flex items-center justify-center transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
        title="Refresh (Ctrl+R)"
        aria-label="Refresh page"
      >
        <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
      </button>

      {/* Security Icon */}
      <div className="w-6 h-6 flex items-center justify-center" title={isSecure ? 'Secure connection' : 'Not secure'}>
        {isSecure ? (
          <Lock className="w-4 h-4 text-green-600 dark:text-green-400" />
        ) : (
          <Unlock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        )}
      </div>

      {/* URL Bar */}
      <form onSubmit={handleSubmit} className="flex-1 relative">
        <input
          type="text"
          value={urlInput}
          onChange={(e) => {
            setUrlInput(e.target.value);
            setShowSuggestions(true);
            setSelectedSuggestionIndex(0);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={handleKeyDown}
          className="w-full h-10 px-5 rounded-full glass-surface border-0 outline-none focus:glass-surface-bright transition-all duration-200 text-sm tracking-wide placeholder:text-gray-500 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100"
          placeholder="Search or enter URL..."
          aria-label="URL bar"
        />
        
        {/* URL Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <URLSuggestions
            suggestions={suggestions}
            selectedIndex={selectedSuggestionIndex}
            onSelect={(url) => handleSubmit(undefined, url)}
            onHover={setSelectedSuggestionIndex}
          />
        )}
      </form>

      {/* Reading Mode Button */}
      <button
        onClick={onToggleReadingMode}
        className="w-9 h-9 rounded-full glass-surface hover:glass-surface-bright flex items-center justify-center transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
        title="Reading Mode (Ctrl+Shift+R)"
        aria-label="Toggle reading mode"
      >
        <Book className="w-4 h-4" />
      </button>

      {/* Bookmark Button */}
      <button
        onClick={onToggleBookmark}
        className="w-9 h-9 rounded-full glass-surface hover:glass-surface-bright flex items-center justify-center transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
        title={isBookmarked ? 'Remove Bookmark (Ctrl+D)' : 'Add Bookmark (Ctrl+D)'}
        aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        <Star className={`w-4 h-4 transition-all duration-200 ${isBookmarked ? 'fill-current text-amber-500 dark:text-amber-400' : ''}`} />
      </button>

      {/* Menu Button */}
      <button
        onClick={onMenuClick}
        className="w-9 h-9 rounded-full glass-surface hover:glass-surface-bright flex items-center justify-center transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
        title="Menu (Alt+F)"
        aria-label="Menu"
      >
        <Menu className="w-4 h-4" />
      </button>
    </div>
  );
}



