import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-16 h-16 rounded-full glass-surface flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-gray-500 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-serif mb-2 text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 rounded-full glass-surface hover:glass-surface-bright transition-all text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}



