import { IconType } from 'react-icons';

interface EmptyStateProps {
  icon: IconType;
  title: string;
  description: string;
  actions?: React.ReactNode;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actions,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-primary-400" />
      </div>
      <h3 className="text-lg font-semibold text-surface-900 mb-2">{title}</h3>
      <p className="text-sm text-surface-500 text-center max-w-sm mb-6">
        {description}
      </p>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
