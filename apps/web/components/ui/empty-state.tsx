interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const GRADIENT_BY_ICON: Record<string, string> = {
  add_home:   'from-blue-500/20 to-blue-600/10',
  event_busy: 'from-violet-500/20 to-violet-600/10',
  payments:   'from-emerald-500/20 to-emerald-600/10',
  search:     'from-amber-500/20 to-amber-600/10',
  verified:   'from-teal-500/20 to-teal-600/10',
  lock:       'from-slate-500/20 to-slate-600/10',
  home:       'from-blue-500/20 to-blue-600/10',
};

const ICON_COLOR: Record<string, string> = {
  add_home:   'text-blue-500',
  event_busy: 'text-violet-500',
  payments:   'text-emerald-500',
  search:     'text-amber-500',
  verified:   'text-teal-500',
  lock:       'text-slate-500',
  home:       'text-blue-500',
};

export function EmptyState({ icon, title, description, action, size = 'md' }: EmptyStateProps) {
  const gradient = icon ? (GRADIENT_BY_ICON[icon] || 'from-outline-variant/20 to-outline-variant/10') : '';
  const iconColor = icon ? (ICON_COLOR[icon] || 'text-on-surface-variant') : '';

  const paddingClass   = size === 'sm' ? 'py-10' : size === 'lg' ? 'py-24' : 'py-16';
  const iconSizeClass  = size === 'sm' ? 'w-12 h-12 text-2xl' : size === 'lg' ? 'w-20 h-20 text-5xl' : 'w-16 h-16 text-4xl';
  const titleSizeClass = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg';

  return (
    <div className={`flex flex-col items-center justify-center text-center ${paddingClass} animate-fade-in`}>
      {icon && (
        <div className={`${iconSizeClass} rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 ring-1 ring-outline-variant/10`}>
          <span className={`material-symbols-outlined ${iconColor}`} style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24", fontSize: 'inherit' }}>
            {icon}
          </span>
        </div>
      )}
      <p className={`font-headline font-bold text-on-surface ${titleSizeClass} mb-2`}>{title}</p>
      {description && (
        <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed">{description}</p>
      )}
      {action && (
        <div className="mt-6">{action}</div>
      )}
    </div>
  );
}
