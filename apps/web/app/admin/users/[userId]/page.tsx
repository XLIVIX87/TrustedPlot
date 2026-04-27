'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { AdminSidebar } from '@/components/ui/admin-sidebar';

interface UserDetail {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  image: string | null;
  sellerProfile: {
    id: string;
    displayName: string;
    sellerType: string;
    kycStatus: string;
    _count: { listings: number };
  } | null;
  _count: { inspectionBookings: number; escrowsAsBuyer: number; uploadedDocuments: number };
}

interface ActivityEntry {
  id: string;
  actionType: string;
  entityType: string;
  createdAt: string;
}

const ROLE_OPTIONS = ['BUYER', 'SELLER', 'MANDATE', 'INSPECTOR', 'LEGAL_OPS', 'ADMIN'];
const STATUS_OPTIONS = ['ACTIVE', 'SUSPENDED', 'DEACTIVATED'];

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:      'bg-emerald-100 text-emerald-800',
  SUSPENDED:   'bg-amber-100 text-amber-800',
  DEACTIVATED: 'bg-surface-container-high text-on-surface-variant',
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN:     'bg-red-100 text-red-800',
  LEGAL_OPS: 'bg-violet-100 text-violet-800',
  INSPECTOR: 'bg-blue-100 text-blue-800',
  SELLER:    'bg-primary-fixed/30 text-primary',
  MANDATE:   'bg-primary-fixed/30 text-primary',
  BUYER:     'bg-surface-container-high text-on-surface-variant',
};

function ActionRow({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-5 border-b border-outline-variant/15 last:border-0">
      <div>
        <p className="font-medium text-sm text-on-surface">{label}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function AdminUserDetailPage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/users/${params.userId}`);
        const data = await res.json();
        if (data.data) {
          setUser(data.data.user);
          setActivity(data.data.recentActivity || []);
        } else {
          setError(data?.error?.message || 'User not found');
        }
      } catch { setError('Failed to load user'); }
      finally { setLoading(false); }
    }
    load();
  }, [params.userId]);

  async function applyChange(field: 'status' | 'role', value: string) {
    if (!user) return;
    setSaving(field);
    try {
      const res = await fetch(`/api/admin/users/${params.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(prev => prev ? { ...prev, [field]: value } : prev);
        setToast(`${field === 'status' ? 'Status' : 'Role'} updated to ${value}`);
        setTimeout(() => setToast(''), 3000);
      } else {
        setToast(data?.error?.message || 'Update failed');
        setTimeout(() => setToast(''), 4000);
      }
    } catch { setToast('Something went wrong'); setTimeout(() => setToast(''), 4000); }
    finally { setSaving(''); }
  }

  const initials = (name: string | null, email: string) => {
    const src = name || email;
    return src.split(/\s|@|\./).filter(Boolean).slice(0, 2).map((p: string) => p[0]?.toUpperCase()).join('') || '?';
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  const fmtDateTime = (d: string) => new Date(d).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-28 pb-20 px-4 md:px-8 max-w-[1440px] mx-auto">
        <div className="flex gap-8 items-start">
          <AdminSidebar />
          <div className="flex-1 min-w-0">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-6">
              <Link href="/admin" className="hover:text-primary">Admin</Link>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <Link href="/admin/users" className="hover:text-primary">Users</Link>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-on-surface">{user?.name || user?.email || '…'}</span>
            </div>

            {error ? (
              <div className="bg-error-container rounded-xl p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-on-error-container mb-3 block">person_off</span>
                <p className="text-on-error-container font-bold">{error}</p>
                <Link href="/admin/users" className="text-primary font-bold text-sm mt-4 inline-block hover:underline">← Back to users</Link>
              </div>
            ) : loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-32 bg-surface-container-low rounded-2xl" />
                <div className="h-48 bg-surface-container-low rounded-2xl" />
                <div className="h-32 bg-surface-container-low rounded-2xl" />
              </div>
            ) : user ? (
              <div className="space-y-6 animate-fade-in-up">

                {/* Profile card */}
                <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
                  <div className="flex items-start gap-5 flex-wrap">
                    <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-black text-xl shrink-0">
                      {initials(user.name, user.email)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 flex-wrap">
                        <div>
                          <h1 className="text-2xl font-headline font-extrabold tracking-tight">{user.name || '—'}</h1>
                          <p className="text-on-surface-variant text-sm">{user.email}</p>
                          <p className="text-xs text-on-surface-variant mt-1">Joined {fmtDate(user.createdAt)}</p>
                        </div>
                        <div className="flex gap-2 flex-wrap mt-1">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${ROLE_COLORS[user.role] || ROLE_COLORS.BUYER}`}>{user.role}</span>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[user.status] || STATUS_COLORS.ACTIVE}`}>{user.status}</span>
                        </div>
                      </div>

                      {/* Stats row */}
                      <div className="flex gap-6 mt-4 flex-wrap">
                        {[
                          { label: 'Inspections', value: user._count.inspectionBookings, icon: 'search' },
                          { label: 'Escrows',     value: user._count.escrowsAsBuyer,    icon: 'account_balance_wallet' },
                          { label: 'Documents',   value: user._count.uploadedDocuments,  icon: 'description' },
                        ].map(s => (
                          <div key={s.label} className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                            <span className="material-symbols-outlined text-sm">{s.icon}</span>
                            <span className="font-bold text-on-surface">{s.value}</span>
                            <span>{s.label}</span>
                          </div>
                        ))}
                        {user.sellerProfile && (
                          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                            <span className="material-symbols-outlined text-sm">storefront</span>
                            <span className="font-bold text-on-surface">{user.sellerProfile._count.listings}</span>
                            <span>Listings · KYC: </span>
                            <span className={user.sellerProfile.kycStatus === 'VERIFIED' ? 'text-emerald-700 font-bold' : ''}>
                              {user.sellerProfile.kycStatus}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin actions */}
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
                  <div className="px-6 py-4 border-b border-outline-variant/10 bg-surface-container-low">
                    <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Admin Actions</p>
                  </div>
                  <div className="px-6">
                    <ActionRow
                      label="Account Status"
                      description="SUSPENDED blocks login. DEACTIVATED is permanent."
                    >
                      <div className="flex gap-2">
                        {STATUS_OPTIONS.map(s => (
                          <button
                            key={s}
                            onClick={() => applyChange('status', s)}
                            disabled={saving === 'status' || user.status === s}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border-2 ${
                              user.status === s
                                ? 'border-primary bg-primary text-white cursor-default'
                                : 'border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary disabled:opacity-40'
                            }`}
                          >
                            {saving === 'status' && user.status !== s ? '…' : s}
                          </button>
                        ))}
                      </div>
                    </ActionRow>

                    <ActionRow
                      label="Role"
                      description="Changing role takes effect immediately. Use with care."
                    >
                      <div className="flex gap-2 flex-wrap justify-end">
                        {ROLE_OPTIONS.map(r => (
                          <button
                            key={r}
                            onClick={() => applyChange('role', r)}
                            disabled={saving === 'role' || user.role === r}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border-2 ${
                              user.role === r
                                ? 'border-primary bg-primary text-white cursor-default'
                                : 'border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary disabled:opacity-40'
                            }`}
                          >
                            {saving === 'role' && user.role !== r ? '…' : r}
                          </button>
                        ))}
                      </div>
                    </ActionRow>
                  </div>
                </div>

                {/* Recent activity */}
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
                  <div className="px-6 py-4 border-b border-outline-variant/10 bg-surface-container-low flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Recent Activity</p>
                    <Link href={`/admin/audit`} className="text-xs text-primary font-bold hover:underline">
                      Full audit log →
                    </Link>
                  </div>
                  {activity.length === 0 ? (
                    <div className="px-6 py-8 text-center text-sm text-on-surface-variant">No recorded activity</div>
                  ) : (
                    <div className="divide-y divide-outline-variant/10">
                      {activity.map(entry => (
                        <div key={entry.id} className="px-6 py-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-on-surface">{entry.actionType.replace(/_/g, ' ')}</p>
                            <p className="text-xs text-on-surface-variant">{entry.entityType}</p>
                          </div>
                          <p className="text-xs text-on-surface-variant">{fmtDateTime(entry.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ) : null}

          </div>{/* end flex-1 */}
        </div>{/* end flex gap-8 */}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-sm font-bold px-6 py-3 rounded-full shadow-xl z-50 animate-fade-in-up">
          {toast}
        </div>
      )}

      <Footer />
    </main>
  );
}
