type BadgeVariant = 'VERIFIED_GOLD' | 'VERIFIED_GREEN' | 'CONDITIONAL' | 'NONE' | string;

const BADGE_CONFIG: Record<string, { className: string; label: string; icon: string | null }> = {
  VERIFIED_GOLD: {
    className: 'bg-amber-500 text-white',
    label: 'C of O Gold',
    icon: 'verified',
  },
  VERIFIED_GREEN: {
    className: 'bg-emerald-600 text-white',
    label: 'R of O Green',
    icon: 'check_circle',
  },
  CONDITIONAL: {
    className: 'bg-sky-500 text-white',
    label: 'Conditional',
    icon: 'pending',
  },
  NONE: {
    className: 'bg-white/80 backdrop-blur-sm text-slate-500 border border-white/40',
    label: 'Unverified',
    icon: null,
  },
};

export function VerificationBadge({ badge }: { badge: BadgeVariant }) {
  const config = BADGE_CONFIG[badge] || BADGE_CONFIG.NONE;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${config.className}`}
      title={config.label}
    >
      {config.icon && (
        <span
          className="material-symbols-outlined text-[13px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {config.icon}
        </span>
      )}
      {config.label}
    </span>
  );
}
