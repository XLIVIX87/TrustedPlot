'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';

interface DashboardMetrics {
  totalUsers: number;
  totalListings: number;
  pendingVerifications: number;
  activeEscrows: number;
  openDisputes: number;
}

interface ActivityLog {
  id: string;
  actionType: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  actor: { name: string; email: string };
}

const NAV_ITEMS = [
  { href: '/admin',             icon: 'grid_view',                label: 'Dashboard'     },
  { href: '/admin/users',       icon: 'group',                    label: 'Users'         },
  { href: '/verification',      icon: 'verified_user',            label: 'Verifications' },
  { href: '/escrow',            icon: 'account_balance_wallet',   label: 'Escrow'        },
  { href: '/inspections',       icon: 'search',                   label: 'Inspections'   },
  { href: '/admin/audit',       icon: 'history',                  label: 'Audit Log'     },
];

function AdminSidebar({ active }: { active: string }) {
  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-24 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden shadow-[0_4px_20px_rgba(11,31,51,0.04)]">
        {/* Brand mark */}
        <div className="px-5 py-4 border-b border-outline-variant/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
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
            const isActive = active === item.href;
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
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer note */}
        <div className="px-5 py-4 border-t border-outline-variant/10">
          <p className="text-[10px] text-on-surface-variant/50 font-medium">TrustedPlot Phase 1 MVP</p>
        </div>
      </div>
    </aside>
  );
}

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/admin/dashboard');
        const data = await res.json();
        if (data.data) {
          setMetrics(data.data.metrics);
          setActivity(data.data.recentActivity || []);
        } else if (data.error) {
          setError(data.error.message);
        }
      } catch { setError('Failed to load dashboard'); }
      finally { setLoading(false); }
    }
    fetchDashboard();
  }, []);

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  const STAT_CARDS = metrics ? [
    {
      icon: 'group',
      label: 'Total Users',
      value: metrics.totalUsers,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      href: '/admin/users',
      delta: null,
    },
    {
      icon: 'inventory_2',
      label: 'Total Listings',
      value: metrics.totalListings,
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
      href: '/listings',
      delta: null,
    },
    {
      icon: 'pending_actions',
      label: 'Pending Verifications',
      value: metrics.pendingVerifications,
      iconBg: metrics.pendingVerifications > 0 ? 'bg-amber-100' : 'bg-slate-100',
      iconColor: metrics.pendingVerifications > 0 ? 'text-amber-600' : 'text-slate-400',
      href: '/verification',
      delta: null,
    },
    {
      icon: 'account_balance_wallet',
      label: 'Active Escrows',
      value: metrics.activeEscrows,
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      href: '/escrow',
      delta: null,
    },
    {
      icon: 'gavel',
      label: 'Open Disputes',
      value: metrics.openDisputes,
      iconBg: metrics.openDisputes > 0 ? 'bg-red-100' : 'bg-slate-100',
      iconColor: metrics.openDisputes > 0 ? 'text-red-600' : 'text-slate-400',
      href: '/admin/audit',
      delta: metrics.openDisputes > 0 ? 'Needs attention' : null,
    },
  ] : [];

  return (
    <main className="min-h-screen bg-surface">
      <Navbar />

      <div className="pt-28 pb-20 px-4 md:px-8 max-w-[1440px] mx-auto">
        <div className="flex gap-8 items-start">
          {/* Sidebar */}
          <AdminSidebar active={pathname} />

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Page header */}
            <section className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 animate-fade-in-up">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Operations</p>
                <h1 className="text-3xl font-extrabold font-headline tracking-tighter text-on-surface mb-1">
                  Admin Dashboard
                </h1>
                <p className="text-on-surface-variant text-sm max-w-xl">
                  Monitor platform health, review metrics, and manage operations.
                </p>
              </div>
              {/* Mobile quick links */}
              <div className="flex gap-2 lg:hidden">
                <Link href="/admin/users"
                  className="px-4 py-2 rounded-lg text-xs font-bold text-on-surface-variant border border-outline-variant hover:bg-surface-container-low transition-all flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-xs">group</span>
                  Users
                </Link>
                <Link href="/verification"
                  className="px-4 py-2 rounded-lg text-xs font-bold text-on-surface-variant border border-outline-variant hover:bg-surface-container-low transition-all flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-xs">verified_user</span>
                  Queue
                </Link>
              </div>
            </section>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-xl bg-error-container p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-on-error-container">error</span>
                <p className="text-sm text-on-error-container font-medium">{error}</p>
              </div>
            )}

            {/* Stat cards bento grid */}
            {loading ? (
              <section className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 animate-pulse">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="bg-surface-container-lowest rounded-2xl h-32" />
                ))}
              </section>
            ) : metrics && (
              <section className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {STAT_CARDS.map((m, i) => (
                  <Link
                    key={m.label}
                    href={m.href}
                    className="bg-surface-container-lowest p-5 rounded-2xl flex flex-col gap-3 border border-outline-variant/10 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(11,31,51,0.08)] transition-all duration-300 animate-fade-in-up group"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className={`w-10 h-10 rounded-xl ${m.iconBg} flex items-center justify-center`}>
                      <span className={`material-symbols-outlined ${m.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>{m.icon}</span>
                    </div>
                    <div>
                      <p className="text-3xl font-black font-headline text-on-surface">{m.value}</p>
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5">{m.label}</p>
                      {m.delta && (
                        <p className="text-[10px] font-bold text-red-500 mt-1">{m.delta}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </section>
            )}

            {/* Quick actions row */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                {
                  icon: 'pending_actions',
                  title: 'Verification Queue',
                  desc: 'Review pending document submissions',
                  href: '/verification',
                  accent: 'bg-amber-50 border-amber-200',
                  iconColor: 'text-amber-600',
                },
                {
                  icon: 'group',
                  title: 'User Management',
                  desc: 'Manage roles, access, and accounts',
                  href: '/admin/users',
                  accent: 'bg-blue-50 border-blue-200',
                  iconColor: 'text-blue-600',
                },
                {
                  icon: 'history',
                  title: 'Audit Log',
                  desc: 'View complete platform event history',
                  href: '/admin/audit',
                  accent: 'bg-slate-50 border-slate-200',
                  iconColor: 'text-slate-600',
                },
              ].map((action, i) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`${action.accent} border rounded-2xl p-5 flex items-start gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-200 animate-fade-in-up`}
                  style={{ animationDelay: `${300 + i * 60}ms` }}
                >
                  <div className={`w-10 h-10 rounded-xl bg-white/80 border border-current/10 flex items-center justify-center shrink-0`}>
                    <span className={`material-symbols-outlined text-sm ${action.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>{action.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-on-surface">{action.title}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{action.desc}</p>
                  </div>
                  <span className="material-symbols-outlined text-sm text-on-surface-variant/40 ml-auto shrink-0 mt-0.5">arrow_forward</span>
                </Link>
              ))}
            </section>

            {/* Recent activity */}
            <section className="animate-fade-in-up" style={{ animationDelay: '480ms' }}>
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="text-lg font-bold font-headline tracking-tight">Recent Activity</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">Last 10 platform events across all operations</p>
                </div>
                <Link href="/admin/audit"
                  className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
                  View all <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>

              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden shadow-[0_4px_20px_rgba(11,31,51,0.04)]">
                {activity.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-12 h-12 bg-surface-container-high rounded-xl flex items-center justify-center mx-auto mb-3">
                      <span className="material-symbols-outlined text-2xl text-on-surface-variant/40">inbox</span>
                    </div>
                    <p className="text-sm text-on-surface-variant font-medium">No recent activity.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-outline-variant/10">
                    {activity.slice(0, 10).map((log, i) => {
                      const isVerification = log.actionType.includes('VERIFICATION');
                      const isEscrow       = log.actionType.includes('ESCROW');
                      const isDispute      = log.actionType.includes('DISPUTE');
                      const isListing      = log.actionType.includes('LISTING');
                      const isUser         = log.actionType.includes('USER');

                      const iconMap = {
                        icon:  isVerification ? 'verified_user' : isEscrow ? 'account_balance_wallet' : isDispute ? 'gavel' : isListing ? 'inventory_2' : isUser ? 'person_add' : 'history',
                        bg:    isVerification ? 'bg-teal-100'   : isEscrow ? 'bg-violet-100'          : isDispute ? 'bg-red-100'  : isListing ? 'bg-blue-100'   : isUser ? 'bg-emerald-100' : 'bg-slate-100',
                        color: isVerification ? 'text-teal-600' : isEscrow ? 'text-violet-600'        : isDispute ? 'text-red-600': isListing ? 'text-blue-600' : isUser ? 'text-emerald-600' : 'text-slate-500',
                      };

                      return (
                        <div key={log.id}
                          className="px-6 py-4 flex items-center gap-4 hover:bg-surface-container-low/50 transition-colors">
                          {/* Timeline dot + icon */}
                          <div className="flex flex-col items-center shrink-0">
                            <div className={`w-8 h-8 rounded-lg ${iconMap.bg} flex items-center justify-center`}>
                              <span className={`material-symbols-outlined text-sm ${iconMap.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                {iconMap.icon}
                              </span>
                            </div>
                            {i < activity.slice(0, 10).length - 1 && (
                              <div className="w-px flex-1 min-h-[1.5rem] bg-outline-variant/20 mt-1" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm font-bold text-on-surface">{log.actor?.name || 'System'}</span>
                              <span className="text-sm text-on-surface-variant">
                                {log.actionType.replace(/_/g, ' ').toLowerCase()}
                              </span>
                            </div>
                            <span className="text-[11px] text-on-surface-variant/50 font-mono">
                              {log.entityType} · {log.entityId.slice(0, 10)}…
                            </span>
                          </div>
                          <span className="text-xs text-on-surface-variant/55 shrink-0 tabular-nums">{formatDate(log.createdAt)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
