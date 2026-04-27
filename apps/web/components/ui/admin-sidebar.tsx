'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin',               icon: 'grid_view',              label: 'Dashboard'     },
  { href: '/admin/users',         icon: 'group',                  label: 'Users'         },
  { href: '/verification',        icon: 'verified_user',          label: 'Verifications' },
  { href: '/admin/inspections',   icon: 'manage_search',          label: 'Inspections'   },
  { href: '/escrow',              icon: 'account_balance_wallet', label: 'Escrow'        },
  { href: '/admin/audit',         icon: 'history',                label: 'Audit Log'     },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-24 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden shadow-[0_4px_20px_rgba(11,31,51,0.04)]">
        {/* Brand mark */}
        <div className="px-5 py-4 border-b border-outline-variant/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>shield</span>
            </div>
            <div>
              <p className="text-xs font-black text-on-surface leading-none">Admin</p>
              <p className="text-[10px] text-on-surface-variant">Operations Center</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="p-3 space-y-0.5">
          {NAV_ITEMS.map(item => {
            // Exact match for dashboard; prefix match for everything else
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-outline-variant/10">
          <p className="text-[10px] text-on-surface-variant/50 font-medium">TrustedPlot Phase 1 MVP</p>
        </div>
      </div>
    </aside>
  );
}
