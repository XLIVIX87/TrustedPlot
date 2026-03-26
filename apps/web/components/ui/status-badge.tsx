type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

const variants: Record<StatusVariant, string> = {
  success: 'bg-tertiary-fixed text-on-tertiary-fixed',
  warning: 'bg-secondary-fixed text-on-secondary-fixed',
  error: 'bg-error-container text-on-error-container',
  info: 'bg-primary-fixed text-on-primary-fixed',
  neutral: 'bg-surface-container-high text-on-surface-variant',
};

const statusMap: Record<string, StatusVariant> = {
  DRAFT: 'neutral',
  SUBMITTED: 'info',
  UNDER_VERIFICATION: 'info',
  VERIFIED: 'success',
  CONDITIONAL: 'warning',
  REJECTED: 'error',
  SUSPENDED: 'error',
  PENDING: 'warning',
  IN_REVIEW: 'info',
  APPROVED: 'success',
  CANCELLED: 'neutral',
  REQUESTED: 'info',
  CONFIRMED: 'info',
  ASSIGNED: 'info',
  COMPLETED: 'success',
  OVERDUE: 'error',
  CREATED: 'info',
  FUNDING_PENDING: 'warning',
  FUNDED: 'success',
  RELEASED: 'success',
  REFUNDED: 'neutral',
  DISPUTED: 'error',
  OPEN: 'warning',
  RESOLVED: 'success',
};

export function StatusBadge({ status }: { status: string }) {
  const variant = statusMap[status] || 'neutral';
  const style = variants[variant];

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${style}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
