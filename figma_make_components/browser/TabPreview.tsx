interface TabPreviewProps {
  title: string;
  url: string;
  position: { x: number; y: number };
}

export function TabPreview({ title, url, position }: TabPreviewProps) {
  return (
    <div
      className="fixed z-[80] w-64 glass-surface rounded-xl shadow-2xl p-4 animate-slide-down pointer-events-none"
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg mb-3 flex items-center justify-center">
        <div className="text-4xl">🌐</div>
      </div>
      <h4 className="font-medium text-sm mb-1 truncate text-gray-900 dark:text-gray-100">{title}</h4>
      <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{url}</p>
    </div>
  );
}



