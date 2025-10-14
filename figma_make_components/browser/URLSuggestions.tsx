import { ExternalLink, Clock, Bookmark, Search } from 'lucide-react';

interface Suggestion {
  type: 'history' | 'bookmark' | 'search';
  title: string;
  url: string;
}

interface URLSuggestionsProps {
  suggestions: Suggestion[];
  selectedIndex: number;
  onSelect: (url: string) => void;
  onHover: (index: number) => void;
}

export function URLSuggestions({ suggestions, selectedIndex, onSelect, onHover }: URLSuggestionsProps) {
  if (suggestions.length === 0) return null;

  const getIcon = (type: Suggestion['type']) => {
    switch (type) {
      case 'history': return Clock;
      case 'bookmark': return Bookmark;
      case 'search': return Search;
    }
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-2 glass-surface rounded-2xl shadow-2xl overflow-hidden z-50 animate-slide-down">
      <div className="max-h-[400px] overflow-y-auto p-2">
        {suggestions.map((suggestion, index) => {
          const Icon = getIcon(suggestion.type);
          return (
            <button
              key={index}
              onClick={() => onSelect(suggestion.url)}
              onMouseEnter={() => onHover(index)}
              className={`
                w-full p-3 rounded-lg text-left flex items-center gap-3 transition-all
                ${index === selectedIndex
                  ? 'glass-surface-bright text-gray-900 dark:text-gray-100'
                  : 'hover:glass-surface-subtle text-gray-800 dark:text-gray-200'
                }
              `}
            >
              <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{suggestion.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 truncate">{suggestion.url}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}



