interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      {icon && (
        <span className="material-symbols-outlined text-5xl text-outline-variant mb-4 block">
          {icon}
        </span>
      )}
      <p className="text-on-surface font-headline font-bold text-lg">{title}</p>
      {description && <p className="text-sm text-on-surface-variant mt-2 max-w-md mx-auto">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
