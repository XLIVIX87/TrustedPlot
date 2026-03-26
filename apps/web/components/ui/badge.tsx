type BadgeVariant = 'VERIFIED_GOLD' | 'VERIFIED_GREEN' | 'CONDITIONAL' | 'NONE' | string;

const badgeStyles: Record<string, { bg: string; text: string; label: string; icon?: string }> = {
  VERIFIED_GOLD: {
    bg: 'bg-secondary-fixed',
    text: 'text-on-secondary-fixed',
    label: 'C of O Verified',
    icon: 'verified',
  },
  VERIFIED_GREEN: {
    bg: 'bg-tertiary-fixed',
    text: 'text-on-tertiary-fixed',
    label: 'R of O Verified',
    icon: 'check_circle',
  },
  CONDITIONAL: {
    bg: 'bg-surface-container-high',
    text: 'text-on-surface-variant',
    label: 'Conditional',
    icon: 'pending',
  },
  NONE: {
    bg: 'bg-surface-container-highest',
    text: 'text-on-surface-variant',
    label: 'Unverified',
  },
};

export function VerificationBadge({ badge }: { badge: BadgeVariant }) {
  const style = badgeStyles[badge] || badgeStyles.NONE;
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${style.bg} ${style.text}`}
      title={style.label}
    >
      {style.icon && (
        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          {style.icon}
        </span>
      )}
      {style.label}
    </span>
  );
}
