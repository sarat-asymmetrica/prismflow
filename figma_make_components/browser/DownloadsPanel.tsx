import { Download as DownloadIcon, FolderOpen, X } from 'lucide-react';
import { Download } from '../electron-api';
import { EmptyState } from './EmptyState';

interface DownloadsPanelProps {
  downloads: Download[];
  onClose: () => void;
  onShowInFolder?: (id: string) => void;
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export function DownloadsPanel({ downloads, onClose, onShowInFolder }: DownloadsPanelProps) {
  // Helper to format bytes to human-readable size
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Helper to calculate progress percentage
  const getProgress = (download: Download) => {
    if (download.totalBytes === 0) return 0;
    return Math.round((download.receivedBytes / download.totalBytes) * 100);
  };

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DownloadIcon className="w-5 h-5 text-green-400" />
          <h3 className="font-semibold text-white">Downloads</h3>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-gray-300 hover:text-white"
          aria-label="Close downloads"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Downloads List - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {downloads.length === 0 ? (
          <EmptyState
            icon={DownloadIcon}
            title="No downloads yet"
            description="Files you download will appear here for easy access."
          />
        ) : (
          <div className="space-y-2">
            {downloads.map((download) => {
              const progress = getProgress(download);
              const isDownloading = download.state === 'progressing';
              const isCompleted = download.state === 'completed';
              const isFailed = download.state === 'interrupted' || download.state === 'cancelled';

              return (
                <div
                  key={download.id}
                  className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <DownloadIcon className="w-4 h-4 mt-0.5 text-green-400" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate text-white font-medium">{download.filename}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {formatBytes(download.receivedBytes)} / {formatBytes(download.totalBytes)}
                      </div>
                      
                      {/* Progress Bar */}
                      {isDownloading && (
                        <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-400 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}

                      {/* Status */}
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={`text-xs font-medium ${
                            isCompleted
                              ? 'text-green-400'
                              : isFailed
                              ? 'text-red-400'
                              : 'text-blue-400'
                          }`}
                        >
                          {isCompleted && 'Complete'}
                          {isDownloading && `${progress}%`}
                          {isFailed && 'Failed'}
                          {download.state === 'paused' && 'Paused'}
                        </span>
                        {isCompleted && onShowInFolder && (
                          <button 
                            onClick={() => onShowInFolder(download.id)}
                            className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                            aria-label="Show in folder"
                          >
                            <FolderOpen className="w-3 h-3" />
                            Show in folder
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}



