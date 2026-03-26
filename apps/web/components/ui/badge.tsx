type BadgeVariant = 'VERIFIED_GOLD' | 'VERIFIED_GREEN' | 'CONDITIONAL' | 'NONE' | string;

const badgeStyles: Record<string, { bg: string; text: string; label: string }> = {
  VERIFIED_GOLD: { bg: 'bg-yellow-50 border-status-gold', text: 'text-status-gold', label: 'Verified Gold' },
  VERIFIED_GREEN: { bg: 'bg-green-50 border-status-success', text: 'text-status-success', label: 'Verified' },
  CONDITIONAL: { bg: 'bg-orange-50 border-status-warning', text: 'text-status-warning', label: 'Conditional' },
  NONE: { bg: 'bg-gray-50 border-gray-300', text: 'text-gray-500', label: 'Unverified' },
};

export function VerificationBadge({ badge }: { badge: BadgeVariant }) {
  const style = badgeStyles[badge] || badgeStyles.NONE;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}
      title={style.label}
    >
      {badge === 'VERIFIED_GOLD' && (
        <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )}
      {badge === 'VERIFIED_GREEN' && (
        <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )}
      {style.label}
    </span>
  );
}
