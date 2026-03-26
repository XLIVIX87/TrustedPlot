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
          <section className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12 animate-pulse">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-surface-container-lowest rounded-xl h-32" />
            ))}
          </section>
        ) : metrics && (
          <section className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
            {[
              { icon: 'group', label: 'Total Users', value: metrics.totalUsers, tag: 'USERS', tagColor: 'bg-surface-container-high text-on-surface-variant' },
              { icon: 'inventory_2', label: 'Total Listings', value: metrics.totalListings, tag: 'ACTIVE', tagColor: 'bg-tertiary-fixed text-on-tertiary-fixed' },
              { icon: 'pending_actions', label: 'Pending Verifications', value: metrics.pendingVerifications, tag: 'QUEUE', tagColor: 'bg-secondary-fixed text-on-secondary-fixed' },
              { icon: 'account_balance_wallet', label: 'Active Escrows', value: metrics.activeEscrows, tag: 'ESCROW', tagColor: 'bg-primary text-on-primary' },
              { icon: 'gavel', label: 'Open Disputes', value: metrics.openDisputes, tag: 'ALERT', tagColor: 'bg-error text-on-error' },
            ].map(m => (
              <div key={m.label} className="bg-surface-container-lowest p-6 rounded-xl flex flex-col gap-3 border-b-2 border-transparent hover:border-primary transition-all group">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">{m.icon}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${m.tagColor}`}>{m.tag}</span>
                </div>
                <div>
                  <p className="text-3xl font-black font-headline">{m.value}</p>
                  <p className="text-xs text-on-surface-variant font-medium">{m.label}</p>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Recent activity */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-2xl font-bold font-headline tracking-tight">Recent Activity</h3>
            <Link href="/admin/audit" className="text-sm font-bold text-primary border-b border-primary/20 pb-0.5 hover:border-primary transition-all">View all</Link>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-black/5 overflow-hidden">
            {activity.length === 0 ? (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3">inbox</span>
                <p className="text-sm text-on-surface-variant">No recent activity.</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/20">
                {activity.slice(0, 10).map(log => (
                  <div key={log.id} className={`px-6 py-4 flex items-center justify-between border-l-4 ${actionBorderColor(log.actionType)} hover:bg-surface-container-low/40 transition-colors`}>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-on-surface-variant text-xl">
                        {log.actionType.includes('VERIFICATION') ? 'verified_user' :
                         log.actionType.includes('ESCROW') ? 'account_balance_wallet' :
                         log.actionType.includes('DISPUTE') ? 'gavel' :
                         log.actionType.includes('LISTING') ? 'inventory_2' :
                         log.actionType.includes('USER') ? 'person_add' :
                         'history'}
                      </span>
                      <div>
                        <span className="text-sm font-bold text-on-surface">{log.actor?.name || 'System'}</span>
                        <span className="text-sm text-on-surface-variant ml-2">{log.actionType.replace(/_/g, ' ').toLowerCase()}</span>
                        <span className="text-xs text-on-surface-variant/50 ml-2 font-mono">{log.entityType} #{log.entityId.slice(0, 8)}</span>
                      </div>
                    </div>
                    <span className="text-xs text-on-surface-variant/60 shrink-0 ml-4">{formatDate(log.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
