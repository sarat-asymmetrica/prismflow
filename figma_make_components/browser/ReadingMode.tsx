import { X, Type, Minus, Plus } from 'lucide-react';
import { useState } from 'react';

interface ReadingModeProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    title: string;
    author?: string;
    publishDate?: string;
    body: string;
  };
}

export function ReadingMode({ isOpen, onClose, content }: ReadingModeProps) {
  const [fontSize, setFontSize] = useState(18);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-gray-50 dark:bg-gray-900 animate-slide-up overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 h-14 px-6 glass-surface-subtle border-b border-black/8 dark:border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full glass-surface hover:glass-surface-bright flex items-center justify-center transition-all text-gray-700 dark:text-gray-300"
            aria-label="Exit reading mode"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">Reading Mode</span>
        </div>

        {/* Font Size Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFontSize(s => Math.max(14, s - 2))}
            className="w-9 h-9 rounded-full glass-surface hover:glass-surface-bright flex items-center justify-center transition-all text-gray-700 dark:text-gray-300"
            aria-label="Decrease font size"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="w-9 h-9 rounded-full glass-surface flex items-center justify-center text-gray-700 dark:text-gray-300">
            <Type className="w-4 h-4" />
          </div>
          <button
            onClick={() => setFontSize(s => Math.min(28, s + 2))}
            className="w-9 h-9 rounded-full glass-surface hover:glass-surface-bright flex items-center justify-center transition-all text-gray-700 dark:text-gray-300"
            aria-label="Increase font size"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-8 py-16">
        <article>
          <h1 className="text-4xl font-serif mb-4 text-gray-900 dark:text-gray-100">
            {content.title}
          </h1>
          
          {(content.author || content.publishDate) && (
            <div className="flex items-center gap-4 mb-8 text-sm text-gray-600 dark:text-gray-400">
              {content.author && <span>By {content.author}</span>}
              {content.publishDate && <span>{content.publishDate}</span>}
            </div>
          )}

          <div 
            className="prose prose-gray dark:prose-invert max-w-none"
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.7 }}
          >
            <div 
              className="text-gray-800 dark:text-gray-200"
              dangerouslySetInnerHTML={{ __html: content.body }}
            />
          </div>
        </article>
      </div>
    </div>
  );
}



