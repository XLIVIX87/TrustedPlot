'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  createdAt: string;
  image: string | null;
  _count: { inspectionBookings: number; escrowsAsBuyer: number; uploadedDocuments: number };
  sellerProfile: { id: string; displayName: string; kycStatus: string } | null;
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-error-container text-on-error-container',
  LEGAL_OPS: 'bg-tertiary-fixed/30 text-on-tertiary-fixed',
  INSPECTOR: 'bg-secondary-fixed/30 text-on-secondary-fixed',
  SELLER: 'bg-primary-fixed/30 text-primary',
  MANDATE: 'bg-primary-fixed/30 text-primary',
  BUYER: 'bg-surface-container-high text-on-surface-variant',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-tertiary-fixed/30 text-on-tertiary-fixed',
  SUSPENDED: 'bg-error-container text-on-error-container',
  DEACTIVATED: 'bg-surface-container-high text-on-surface-variant',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', String(page));
        if (roleFilter) params.set('role', roleFilter);
        if (statusFilter) params.set('status', statusFilter);
        if (search) params.set('search', search);
        const res = await fetch(`/api/admin/users?${params}`);
        const data = await res.json();
        if (data.data) {
          setUsers(data.data.users);
          setTotalPages(data.data.pagination.totalPages);
          setTotal(data.data.pagination.total);
        } else {
          setError(data?.error?.message || 'Failed to load users');
        }
      } catch { setError('Failed to load users'); }
      finally { setLoading(false); }
    }
    load();
  }, [page, roleFilter, statusFilter, search]);

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  const initials = (name: string | null, email: string) => {
    const src = name || email;
    return src.split(/\s|@|\./).filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('') || '?';
  };

  return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-32 pb-20 px-6 md:px-8 max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <Link href="/admin" className="text-sm text-on-surface-variant hover:text-primary mb-2 inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">arrow_back</span> Back to admin
            </Link>
            <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tight">User Management</h1>
            <p className="text-on-surface-variant mt-1">{total} total users</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-surface-container-lowest rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-3 border border-outline-variant/10">
          <input type="search" placeholder="Search name or email…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-surface-container-low rounded-lg text-sm font-medium border border-outline-variant focus:border-primary focus:ring-0 md:col-span-2" />
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-surface-container-low rounded-lg text-sm font-medium border border-outline-variant focus:border-primary focus:ring-0">
            <option value="">All Roles</option>
            <option value="BUYER">Buyer</option>
            <option value="SELLER">Seller</option>
            <option value="MANDATE">Mandate</option>
            <option value="INSPECTOR">Inspector</option>
            <option value="LEGAL_OPS">Legal Ops</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-surface-container-low rounded-lg text-sm font-medium border border-outline-variant focus:border-primary focus:ring-0">
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="DEACTIVATED">Deactivated</option>
          </select>
        </div>

        {/* Table */}
        {error ? (
          <div className="bg-error-container rounded-xl p-6 text-center">
            <p className="text-on-error-container font-medium">{error}</p>
          </div>
        ) : loading ? (
          <div className="space-y-2 animate-pulse">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="bg-surface-container-low h-16 rounded-lg" />)}
          </div>
        ) : users.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-outline-variant mb-3 block">person_off</span>
            <p className="font-headline font-bold">No users match your filters</p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-container-low border-b border-outline-variant/20">
                  <tr>
                    <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider">User</th>
                    <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider">Role</th>
                    <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider hidden md:table-cell">Activity</th>
                    <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider hidden md:table-cell">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold text-xs shrink-0">
                            {initials(u.name, u.email)}
                          </div>
                          <div>
                            <div className="font-medium">{u.name || '—'}</div>
                            <div className="text-xs text-on-surface-variant">{u.email}</div>
                            {u.sellerProfile && (
                              <div className="text-[10px] text-on-surface-variant mt-0.5">
                                {u.sellerProfile.displayName} · KYC: <span className={u.sellerProfile.kycStatus === 'VERIFIED' ? 'text-tertiary' : 'text-on-surface-variant'}>{u.sellerProfile.kycStatus}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${ROLE_COLORS[u.role] || ROLE_COLORS.BUYER}`}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${STATUS_COLORS[u.status] || STATUS_COLORS.ACTIVE}`}>{u.status}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-on-surface-variant">
                        <div className="flex gap-3">
                          {u._count.inspectionBookings > 0 && <span title="Inspections">🔍 {u._count.inspectionBookings}</span>}
                          {u._count.escrowsAsBuyer > 0 && <span title="Escrows">💼 {u._count.escrowsAsBuyer}</span>}
                          {u._count.uploadedDocuments > 0 && <span title="Documents">📄 {u._count.uploadedDocuments}</span>}
                          {u._count.inspectionBookings + u._count.escrowsAsBuyer + u._count.uploadedDocuments === 0 && <span className="opacity-50">No activity</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-on-surface-variant">{fmtDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-xs text-on-surface-variant">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 bg-surface-container-low rounded-lg text-xs font-bold uppercase tracking-wider disabled:opacity-30">
                Previous
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-4 py-2 bg-surface-container-low rounded-lg text-xs font-bold uppercase tracking-wider disabled:opacity-30">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
