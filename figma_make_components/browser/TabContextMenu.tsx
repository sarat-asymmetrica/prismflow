import { Pin, Volume2, VolumeX, Copy, X, RefreshCw } from 'lucide-react';

interface TabContextMenuProps {
  position: { x: number; y: number };
  onClose: () => void;
  onPinTab: () => void;
  onMuteTab: () => void;
  onDuplicateTab: () => void;
  onCloseTab: () => void;
  onCloseOtherTabs: () => void;
  onRefreshTab: () => void;
  isPinned: boolean;
  isMuted: boolean;
}

export function TabContextMenu({
  position,
  onClose,
  onPinTab,
  onMuteTab,
  onDuplicateTab,
  onCloseTab,
  onCloseOtherTabs,
  onRefreshTab,
  isPinned,
  isMuted,
}: TabContextMenuProps) {
  const menuItems = [
    { icon: RefreshCw, label: 'Reload', action: onRefreshTab },
    { icon: Pin, label: isPinned ? 'Unpin Tab' : 'Pin Tab', action: onPinTab },
    { icon: isMuted ? Volume2 : VolumeX, label: isMuted ? 'Unmute Tab' : 'Mute Tab', action: onMuteTab },
    { icon: Copy, label: 'Duplicate Tab', action: onDuplicateTab },
    { divider: true },
    { icon: X, label: 'Close Tab', action: onCloseTab },
    { icon: X, label: 'Close Other Tabs', action: onCloseOtherTabs },
  ];

  return (
    <>
      <div 
        className="fixed inset-0 z-[90]" 
        onClick={onClose}
      />
      <div
        className="fixed z-[100] min-w-[200px] glass-surface rounded-xl shadow-2xl p-1 animate-slide-down"
        style={{
          top: position.y,
          left: position.x,
        }}
      >
        {menuItems.map((item, index) => {
          if ('divider' in item) {
            return <div key={index} className="h-px bg-black/8 dark:bg-white/8 my-1" />;
          }

          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => {
                item.action();
                onClose();
              }}
              className="w-full px-3 py-2 rounded-lg text-left flex items-center gap-3 hover:glass-surface-subtle transition-all text-gray-800 dark:text-gray-200 text-sm"
            >
              <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}



