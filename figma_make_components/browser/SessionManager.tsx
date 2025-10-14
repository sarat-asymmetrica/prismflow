import { useState } from 'react';
import { Save, FolderOpen, Trash2, Clock } from 'lucide-react';

interface Session {
  id: string;
  name: string;
  tabs: Array<{ url: string; title: string }>;
  timestamp: number;
}

interface SessionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSession: (name: string, tabs: any[]) => void;
  onRestoreSession: (session: Session) => void;
  onDeleteSession: (sessionId: string) => void;
  sessions: Session[];
  currentTabs: any[];
}

export function SessionManager({
  isOpen,
  onClose,
  onSaveSession,
  onRestoreSession,
  onDeleteSession,
  sessions,
  currentTabs,
}: SessionManagerProps) {
  const [sessionName, setSessionName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!sessionName.trim()) return;
    onSaveSession(sessionName, currentTabs);
    setSessionName('');
    setIsSaving(false);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 dark:bg-black/60 backdrop-blur-md animate-slide-up">
      <div className="w-full max-w-2xl glass-surface rounded-3xl shadow-2xl overflow-hidden bg-white/95 dark:bg-transparent">
        {/* Header */}
        <div className="p-6 border-b border-black/8 dark:border-white/8">
          <h2 className="text-xl font-serif text-gray-900 dark:text-gray-100">Session Manager</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Save and restore your browsing sessions
          </p>
        </div>

        {/* Save Current Session */}
        <div className="p-6 border-b border-black/8 dark:border-white/8">
          {!isSaving ? (
            <button
              onClick={() => setIsSaving(true)}
              className="w-full h-12 px-4 rounded-xl glass-surface hover:glass-surface-bright transition-all flex items-center justify-center gap-2 text-gray-900 dark:text-gray-100 font-medium"
            >
              <Save className="w-4 h-4" />
              Save Current Session ({currentTabs.length} tabs)
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="Session name..."
                className="flex-1 h-12 px-4 rounded-xl glass-surface border-0 outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-500"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
              <button
                onClick={handleSave}
                disabled={!sessionName.trim()}
                className="h-12 px-6 rounded-xl glass-surface hover:glass-surface-bright transition-all text-gray-900 dark:text-gray-100 font-medium disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsSaving(false);
                  setSessionName('');
                }}
                className="h-12 px-6 rounded-xl glass-surface hover:glass-surface-bright transition-all text-gray-900 dark:text-gray-100"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Saved Sessions */}
        <div className="p-6 max-h-[400px] overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-500">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No saved sessions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 rounded-xl glass-surface-subtle hover:glass-surface transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{session.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(session.timestamp)}
                        </span>
                        <span>{session.tabs.length} tabs</span>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onRestoreSession(session)}
                        className="p-2 rounded-lg hover:glass-surface-subtle transition-all text-gray-700 dark:text-gray-300"
                        title="Restore session"
                      >
                        <FolderOpen className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteSession(session.id)}
                        className="p-2 rounded-lg hover:glass-surface-subtle transition-all text-red-600 dark:text-red-400"
                        title="Delete session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {session.tabs.slice(0, 5).map((tab, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
                        {tab.title}
                      </span>
                    ))}
                    {session.tabs.length > 5 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-400">
                        +{session.tabs.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-black/8 dark:border-white/8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl glass-surface hover:glass-surface-bright transition-all text-gray-900 dark:text-gray-100 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}



