'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Navbar } from '@/components/ui/navbar';

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

  return (
    <main className="min-h-screen bg-page">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-brand-dark">Admin Dashboard</h1>
          <div className="flex gap-3">
            <Link href="/verification" className="rounded-md border border-border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Verification Queue</Link>
            <Link href="/admin/audit" className="rounded-md border border-border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Audit Log</Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-status-error">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8 animate-pulse">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-24 bg-white rounded-lg border border-border" />)}
          </div>
        ) : metrics && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Total Users', value: metrics.totalUsers, color: 'text-brand-dark' },
              { label: 'Total Listings', value: metrics.totalListings, color: 'text-brand-dark' },
              { label: 'Pending Verifications', value: metrics.pendingVerifications, color: 'text-status-warning' },
              { label: 'Active Escrows', value: metrics.activeEscrows, color: 'text-brand-primary' },
              { label: 'Open Disputes', value: metrics.openDisputes, color: 'text-status-error' },
            ].map(m => (
              <div key={m.label} className="bg-white rounded-lg border border-border p-5">
                <p className="text-sm text-gray-500">{m.label}</p>
                <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Recent activity */}
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-brand-dark">Recent Activity</h2>
            <Link href="/admin/audit" className="text-sm text-brand-primary hover:underline">View all</Link>
          </div>
          {activity.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">No recent activity.</div>
          ) : (
            <div className="divide-y divide-border">
              {activity.slice(0, 10).map(log => (
                <div key={log.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-brand-dark">{log.actor?.name || 'System'}</span>
                    <span className="text-sm text-gray-500 ml-2">{log.actionType.replace(/_/g, ' ').toLowerCase()}</span>
                    <span className="text-xs text-gray-400 ml-2">{log.entityType} #{log.entityId.slice(0, 8)}</span>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(log.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
