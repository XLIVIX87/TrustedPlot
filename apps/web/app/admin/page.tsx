'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
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

export default function AdminDashboardPage() {
  const { data: session } = useSession();
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

  function actionBorderColor(actionType: string) {
    if (actionType.includes('VERIFICATION')) return 'border-tertiary-fixed';
    if (actionType.includes('ESCROW')) return 'border-secondary-fixed';
    if (actionType.includes('DISPUTE')) return 'border-error';
    if (actionType.includes('LISTING')) return 'border-primary';
    return 'border-outline-variant';
  }

  return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-32 pb-20 px-8 max-w-[1440px] mx-auto">
        {/* Page header */}
        <section className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-on-surface mb-2">
              Admin Dashboard
            </h1>
            <p className="text-on-surface-variant max-w-2xl">
              Monitor platform health, review metrics, and manage operations from a single command center.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/users"
              className="px-6 py-3 rounded-lg text-sm font-bold text-on-surface-variant border border-outline-variant hover:bg-surface-container-low transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">group</span>
              Users
            </Link>
            <Link
              href="/verification"
              className="px-6 py-3 rounded-lg text-sm font-bold text-on-surface-variant border border-outline-variant hover:bg-surface-container-low transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">verified_user</span>
              Verification Queue
            </Link>
            <Link
              href="/admin/audit"
              className="px-6 py-3 rounded-lg text-sm font-bold text-on-surface-variant border border-outline-variant hover:bg-surface-container-low transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">history</span>
              Audit Log
            </Link>
          </div>
        </section>

        {/* Error alert */}
        {error && (
          <div className="mb-6 rounded-xl bg-error-container p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-on-error-container">error</span>
            <p className="text-sm text-on-error-container font-medium">{error}</p>
          </div>
        )}

        {/* Bento stat grid */}
        {loading ? (
          <section className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10 animate-pulse">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-surface-container-lowest rounded-2xl h-32" />
            ))}
          </section>
        ) : metrics && (
          <section className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
            {[
              { icon: 'group',                  label: 'Total Users',          value: metrics.totalUsers,            iconBg: 'bg-blue-100',    iconColor: 'text-blue-600'   },
              { icon: 'inventory_2',            label: 'Total Listings',       value: metrics.totalListings,         iconBg: 'bg-teal-100',    iconColor: 'text-teal-600'   },
              { icon: 'pending_actions',        label: 'Pending Verifications',value: metrics.pendingVerifications,  iconBg: 'bg-amber-100',   iconColor: 'text-amber-600'  },
              { icon: 'account_balance_wallet', label: 'Active Escrows',       value: metrics.activeEscrows,         iconBg: 'bg-violet-100',  iconColor: 'text-violet-600' },
              { icon: 'gavel',                  label: 'Open Disputes',        value: metrics.openDisputes,          iconBg: metrics.openDisputes > 0 ? 'bg-red-100' : 'bg-slate-100', iconColor: metrics.openDisputes > 0 ? 'text-red-600' : 'text-slate-400' },
            ].map(m => (
              <div key={m.label} className="bg-surface-container-lowest p-5 rounded-2xl flex flex-col gap-4 hover:shadow-md transition-all border border-outline-variant/10 animate-fade-in-up">
                <div className={`w-10 h-10 rounded-xl ${m.iconBg} flex items-center justify-center`}>
                  <span className={`material-symbols-outlined ${m.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>{m.icon}</span>
                </div>
                <div>
                  <p className="text-3xl font-black font-headline text-on-surface">{m.value}</p>
                  <p className="text-xs text-on-surface-variant font-medium mt-0.5">{m.label}</p>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Recent activity */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold font-headline tracking-tight">Recent Activity</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Last 10 platform events</p>
            </div>
            <Link href="/admin/audit"
              className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
              View all <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-black/5 overflow-hidden">
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
                      <div className={`w-8 h-8 rounded-lg ${iconMap.bg} flex items-center justify-center shrink-0`}>
                        <span className={`material-symbols-outlined text-sm ${iconMap.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                          {iconMap.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-bold text-on-surface">{log.actor?.name || 'System'}</span>
                          <span className="text-sm text-on-surface-variant">{log.actionType.replace(/_/g, ' ').toLowerCase()}</span>
                        </div>
                        <span className="text-[11px] text-on-surface-variant/50 font-mono">{log.entityType} · {log.entityId.slice(0, 10)}…</span>
                      </div>
                      <span className="text-xs text-on-surface-variant/60 shrink-0 tabular-nums">{formatDate(log.createdAt)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
