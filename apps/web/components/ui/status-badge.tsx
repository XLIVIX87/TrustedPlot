type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

const variants: Record<StatusVariant, string> = {
  success: 'bg-green-50 text-status-success border-green-200',
  warning: 'bg-yellow-50 text-status-warning border-yellow-200',
  error: 'bg-red-50 text-status-error border-red-200',
  info: 'bg-blue-50 text-brand-primary border-blue-200',
  neutral: 'bg-gray-50 text-gray-600 border-gray-200',
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
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
