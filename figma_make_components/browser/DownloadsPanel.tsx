import { Download, FolderOpen, X } from 'lucide-react';
import { EmptyState } from './EmptyState';

interface DownloadItem {
  filename: string;
  url: string;
  status: 'downloading' | 'completed' | 'failed';
  progress: number;
  size: string;
}

interface DownloadsPanelProps {
  downloads: DownloadItem[];
  onClose: () => void;
}

export function DownloadsPanel({ downloads, onClose }: DownloadsPanelProps) {
  return (
    <div className="absolute top-[95px] right-4 w-80 max-h-[400px] glass-surface rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-slide-down">
      {/* Header */}
      <div className="p-4 border-b border-black/8 dark:border-white/8 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Downloads</h3>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors text-gray-700 dark:text-gray-300"
          aria-label="Close downloads"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Downloads List */}
      <div className="flex-1 overflow-y-auto p-2">
        {downloads.length === 0 ? (
          <EmptyState
            icon={Download}
            title="No downloads yet"
            description="Files you download will appear here for easy access."
          />
        ) : (
          <div className="space-y-2">
            {downloads.map((download, index) => (
              <div
                key={index}
                className="p-3 rounded-lg glass-surface-subtle"
              >
                <div className="flex items-start gap-3">
                  <Download className="w-4 h-4 mt-0.5 text-white/60" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{download.filename}</div>
                    <div className="text-xs text-white/40 mt-1">{download.size}</div>
                    
                    {/* Progress Bar */}
                    {download.status === 'downloading' && (
                      <div className="mt-2 h-1 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-300"
                          style={{ width: `${download.progress}%` }}
                        />
                      </div>
                    )}

                    {/* Status */}
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={`text-xs font-medium ${
                          download.status === 'completed'
                            ? 'text-green-600 dark:text-green-400'
                            : download.status === 'failed'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {download.status === 'completed' && 'Complete'}
                        {download.status === 'downloading' && `${download.progress}%`}
                        {download.status === 'failed' && 'Failed'}
                      </span>
                      {download.status === 'completed' && (
                        <button className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1 transition-colors">
                          <FolderOpen className="w-3 h-3" />
                          Show in folder
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



