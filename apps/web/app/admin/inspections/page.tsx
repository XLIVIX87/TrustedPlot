'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { AdminSidebar } from '@/components/ui/admin-sidebar';

interface InspectionRow {
  id: string;
  status: string;
  slotAt: string;
  createdAt: string;
  notes: string | null;
  listing: { id: string; title: string; city: string; district: string };
  buyer: { id: string; name: string | null; email: string };
  inspector: { id: string; name: string | null; email: string } | null;
  hasReport: boolean;
}

interface InspectorOption {
  id: string;
  name: string | null;
  email: string;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  REQUESTED:   { bg: 'bg-amber-100',   text: 'text-amber-800',   dot: 'bg-amber-400'   },
  CONFIRMED:   { bg: 'bg-blue-100',    text: 'text-blue-800',    dot: 'bg-blue-500'    },
  ASSIGNED:    { bg: 'bg-indigo-100',  text: 'text-indigo-800',  dot: 'bg-indigo-500'  },
  IN_PROGRESS: { bg: 'bg-violet-100',  text: 'text-violet-800',  dot: 'bg-violet-500'  },
  COMPLETED:   { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  CANCELLED:   { bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-400'     },
  OVERDUE:     { bg: 'bg-red-50',      text: 'text-red-600',     dot: 'bg-red-300'     },
};

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.REQUESTED;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status.replace('_', ' ')}
    </span>
  );
}

function SlotDate({ slotAt }: { slotAt: string }) {
  const d = new Date(slotAt);
  const isPast = d < new Date();
  return (
    <div className={`text-xs ${isPast ? 'text-red-500 font-bold' : 'text-on-surface-variant'}`}>
      <p>{d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
      <p>{d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}</p>
      {isPast && <p className="text-[10px] font-normal mt-0.5">Past slot</p>}
    </div>
  );
}

export default function AdminInspectionsPage() {
  const [inspections, setInspections] = useState<InspectionRow[]>([]);
  const [inspectors, setInspectors] = useState<InspectorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('REQUESTED');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Action panel state
  const [activeRow, setActiveRow] = useState<string | null>(null);
  const [selectedInspector, setSelectedInspector] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [toast, setToast] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  // Load inspections
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), pageSize: '25' });
        if (statusFilter) params.set('status', statusFilter);
        // Use the dashboard/inspections endpoint (admin sees all)
        const res = await fetch(`/api/dashboard/inspections?${params}`);
        const data = await res.json();
        if (data.data) {
          setInspections(data.data.inspections || []);
          setTotal(data.data.pagination?.total || 0);
          setTotalPages(Math.ceil((data.data.pagination?.total || 0) / 25));
        } else {
          setError(data?.error?.message || 'Failed to load inspections');
        }
      } catch { setError('Failed to load inspections'); }
      finally { setLoading(false); }
    }
    load();
  }, [page, statusFilter]);

  // Load inspector options once
  useEffect(() => {
    async function loadInspectors() {
      try {
        const res = await fetch('/api/admin/users?role=INSPECTOR&status=ACTIVE&page=1');
        const data = await res.json();
        if (data.data?.users) setInspectors(data.data.users);
      } catch {}
    }
    loadInspectors();
  }, []);

  async function handleAction(inspectionId: string, action: 'confirm' | 'assign' | 'cancel') {
    setActionLoading(`${inspectionId}-${action}`);
    try {
      const body: any = {};
      if (action === 'confirm') body.status = 'CONFIRMED';
      if (action === 'cancel')  body.status = 'CANCELLED';
      if (action === 'assign') {
        if (!selectedInspector) { showToast('Select an inspector first'); setActionLoading(''); return; }
        body.inspectorUserId = selectedInspector;
        body.status = 'ASSIGNED';
      }

      const res = await fetch(`/api/inspections/${inspectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok) {
        setInspections(prev =>
          prev.map(i => i.id === inspectionId
            ? {
                ...i,
                status: data.data.status,
                inspector: data.data.inspector || i.inspector,
              }
            : i
          )
        );
        setActiveRow(null);
        setSelectedInspector('');
        showToast(
          action === 'confirm' ? 'Inspection confirmed' :
          action === 'assign'  ? 'Inspector assigned'  :
          'Inspection cancelled'
        );
      } else {
        showToast(data?.error?.message || 'Action failed');
      }
    } catch { showToast('Something went wrong'); }
    finally { setActionLoading(''); }
  }

  const statusCounts = inspections.reduce((acc, i) => {
    acc[i.status] = (acc[i.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const FILTER_TABS = [
    { key: 'REQUESTED',   label: 'Requested'   },
    { key: 'CONFIRMED',   label: 'Confirmed'   },
    { key: 'ASSIGNED',    label: 'Assigned'    },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'COMPLETED',   label: 'Completed'   },
    { key: '',            label: 'All'         },
  ];

  return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-28 pb-20 px-4 md:px-8 max-w-[1440px] mx-auto">
        <div className="flex gap-8 items-start">
          <AdminSidebar />
          <div className="flex-1 min-w-0">

            {/* Header */}
            <div className="mb-8 animate-fade-in-up">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Operations</p>
              <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tight">Inspection Queue</h1>
              <p className="text-on-surface-variant text-sm mt-1">{total} total inspections</p>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-0 mb-6 border-b border-outline-variant/15 overflow-x-auto">
              {FILTER_TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setStatusFilter(tab.key); setPage(1); }}
                  className={`px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 -mb-px transition-colors ${
                    statusFilter === tab.key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            {error ? (
              <div className="bg-error-container rounded-xl p-6 text-center">
                <p className="text-on-error-container font-medium">{error}</p>
              </div>
            ) : loading ? (
              <div className="space-y-2 animate-pulse">
                {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-surface-container-low rounded-xl" />)}
              </div>
            ) : inspections.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-2xl p-16 text-center border border-outline-variant/10">
                <span className="material-symbols-outlined text-5xl text-outline-variant mb-3 block">search_off</span>
                <p className="font-headline font-bold">No {statusFilter.toLowerCase() || ''} inspections</p>
                <p className="text-sm text-on-surface-variant mt-1">All caught up.</p>
              </div>
            ) : (
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-surface-container-low border-b border-outline-variant/15">
                    <tr>
                      <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Property</th>
                      <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Buyer</th>
                      <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider hidden lg:table-cell">Slot</th>
                      <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Status</th>
                      <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider hidden md:table-cell">Inspector</th>
                      <th className="text-right px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspections.map(insp => (
                      <>
                        <tr
                          key={insp.id}
                          className="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <Link href={`/listings/${insp.listing.id}`} className="font-medium hover:text-primary hover:underline block max-w-[200px] truncate">
                              {insp.listing.title}
                            </Link>
                            <p className="text-xs text-on-surface-variant">{insp.listing.city}, {insp.listing.district}</p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-medium text-xs">{insp.buyer.name || insp.buyer.email}</p>
                            {insp.buyer.name && <p className="text-[10px] text-on-surface-variant">{insp.buyer.email}</p>}
                          </td>
                          <td className="px-5 py-4 hidden lg:table-cell">
                            <SlotDate slotAt={insp.slotAt} />
                          </td>
                          <td className="px-5 py-4">
                            <StatusPill status={insp.status} />
                            {insp.hasReport && (
                              <p className="text-[10px] text-emerald-600 font-medium mt-1">Report filed</p>
                            )}
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            {insp.inspector ? (
                              <div>
                                <p className="text-xs font-medium">{insp.inspector.name || insp.inspector.email}</p>
                                {insp.inspector.name && <p className="text-[10px] text-on-surface-variant">{insp.inspector.email}</p>}
                              </div>
                            ) : (
                              <span className="text-xs text-on-surface-variant/50">Unassigned</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex gap-2 justify-end">
                              {insp.status === 'REQUESTED' && (
                                <button
                                  onClick={() => handleAction(insp.id, 'confirm')}
                                  disabled={!!actionLoading}
                                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
                                >
                                  {actionLoading === `${insp.id}-confirm` ? '…' : 'Confirm'}
                                </button>
                              )}
                              {['REQUESTED', 'CONFIRMED'].includes(insp.status) && !insp.inspector && (
                                <button
                                  onClick={() => setActiveRow(activeRow === insp.id ? null : insp.id)}
                                  className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-all"
                                >
                                  Assign
                                </button>
                              )}
                              {['REQUESTED', 'CONFIRMED', 'ASSIGNED'].includes(insp.status) && (
                                <button
                                  onClick={() => handleAction(insp.id, 'cancel')}
                                  disabled={!!actionLoading}
                                  className="px-3 py-1.5 bg-surface-container-high text-on-surface-variant text-xs font-bold rounded-lg hover:bg-error-container hover:text-on-error-container disabled:opacity-40 transition-colors"
                                >
                                  {actionLoading === `${insp.id}-cancel` ? '…' : 'Cancel'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Inline assign panel */}
                        {activeRow === insp.id && (
                          <tr key={`${insp.id}-panel`} className="bg-primary-fixed/10">
                            <td colSpan={6} className="px-5 py-4">
                              <div className="flex items-center gap-4 flex-wrap">
                                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Assign Inspector:</span>
                                <select
                                  value={selectedInspector}
                                  onChange={e => setSelectedInspector(e.target.value)}
                                  className="px-3 py-2 bg-surface-container-low rounded-lg text-sm border border-outline-variant focus:border-primary focus:ring-0 min-w-[220px]"
                                >
                                  <option value="">Select inspector…</option>
                                  {inspectors.map(i => (
                                    <option key={i.id} value={i.id}>
                                      {i.name || i.email}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => handleAction(insp.id, 'assign')}
                                  disabled={!selectedInspector || !!actionLoading}
                                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-40 transition-all"
                                >
                                  {actionLoading === `${insp.id}-assign` ? 'Assigning…' : 'Confirm Assignment'}
                                </button>
                                <button
                                  onClick={() => { setActiveRow(null); setSelectedInspector(''); }}
                                  className="text-xs text-on-surface-variant hover:text-on-surface"
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-5 py-4 border-t border-outline-variant/15 flex items-center justify-between">
                    <p className="text-xs text-on-surface-variant">Page {page} of {totalPages}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-surface-container-low rounded-lg text-xs font-bold uppercase tracking-wider disabled:opacity-30"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 bg-surface-container-low rounded-lg text-xs font-bold uppercase tracking-wider disabled:opacity-30"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>{/* end flex-1 */}
        </div>{/* end flex gap-8 */}
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-sm font-bold px-6 py-3 rounded-full shadow-xl z-50 animate-fade-in-up">
          {toast}
        </div>
      )}

      <Footer />
    </main>
  );
}
