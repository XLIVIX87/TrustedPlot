'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';

interface AuditEntry {
  id: string;
  actionType: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  actor: { name: string; email: string; role: string };
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionType, setActionType] = useState('');
  const [entityType, setEntityType] = useState('');

  async function fetchLogs() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), pageSize: '25' });
      if (actionType) params.set('actionType', actionType);
      if (entityType) params.set('entityType', entityType);
      const res = await fetch(`/api/audit?${params}`);
      const data = await res.json();
      if (data.data) {
        setLogs(data.data.logs || []);
        setTotal(data.data.pagination?.total || 0);
      }
    } catch {} finally { setLoading(false); }
  }

  useEffect(() => { fetchLogs(); }, [page, actionType, entityType]);

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-32 pb-20 px-8 max-w-[1440px] mx-auto">
        {/* Page header */}
        <section className="mb-12">
          <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-on-surface mb-2">
            Audit Log
          </h1>
          <p className="text-on-surface-variant max-w-2xl">
            Complete record of platform activity for compliance review and forensic analysis.
          </p>
        </section>

        {/* Filters */}
        <div className="bg-surface-container-low rounded-2xl p-6 mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Filters</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Action Type</label>
              <select
                value={actionType}
                onChange={e => { setActionType(e.target.value); setPage(1); }}
                className="w-full bg-surface-container-lowest rounded-lg border-b-2 border-outline-variant focus:border-primary px-4 py-3 text-sm text-on-surface outline-none transition-colors"
              >
                <option value="">All Actions</option>
                <option value="LISTING_CREATED">Listing Created</option>
                <option value="LISTING_UPDATED">Listing Updated</option>
                <option value="DOCUMENT_UPLOADED">Document Uploaded</option>
                <option value="VERIFICATION_SUBMITTED">Verification Submitted</option>
                <option value="VERIFICATION_DECISION">Verification Decision</option>
                <option value="INSPECTION_BOOKED">Inspection Booked</option>
                <option value="ESCROW_CREATED">Escrow Created</option>
                <option value="ESCROW_FUNDED">Escrow Funded</option>
                <option value="DISPUTE_OPENED">Dispute Opened</option>
                <option value="USER_REGISTERED">User Registered</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Entity Type</label>
              <select
                value={entityType}
                onChange={e => { setEntityType(e.target.value); setPage(1); }}
                className="w-full bg-surface-container-lowest rounded-lg border-b-2 border-outline-variant focus:border-primary px-4 py-3 text-sm text-on-surface outline-none transition-colors"
              >
                <option value="">All Entities</option>
                <option value="User">User</option>
                <option value="Listing">Listing</option>
                <option value="ListingDocument">Document</option>
                <option value="VerificationCase">Verification</option>
                <option value="InspectionBooking">Inspection</option>
                <option value="EscrowCase">Escrow</option>
                <option value="Dispute">Dispute</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant text-sm">database</span>
              <span className="text-sm text-on-surface-variant font-medium">{total} total entries</span>
            </div>
          </div>
        </div>

        {/* Audit table */}
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-black/5 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3 animate-pulse">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 bg-surface-container-high rounded-lg" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3">search_off</span>
              <p className="text-sm text-on-surface-variant">No audit logs found matching your filters.</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-surface-container">
                  <tr>
                    {['Timestamp', 'Actor', 'Action', 'Entity', 'ID'].map(h => (
                      <th key={h} className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {logs.map(log => (
                    <tr key={log.id} className="bg-surface-container-lowest hover:bg-surface-container-low/40 transition-colors">
                      <td className="px-6 py-4 text-xs text-on-surface-variant">{formatDate(log.createdAt)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="font-bold text-on-surface">{log.actor?.name}</span>
                        <span className="text-xs text-on-surface-variant/60 ml-1.5">({log.actor?.role})</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface">{log.actionType.replace(/_/g, ' ')}</td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">{log.entityType}</td>
                      <td className="px-6 py-4 text-xs font-mono text-on-surface-variant/60">{log.entityId.slice(0, 12)}...</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-outline-variant/20 flex items-center justify-between">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="text-sm font-bold text-primary hover:underline disabled:text-on-surface-variant/30 disabled:no-underline flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                  Previous
                </button>
                <span className="text-sm text-on-surface-variant font-medium">Page {page}</span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={logs.length < 25}
                  className="text-sm font-bold text-primary hover:underline disabled:text-on-surface-variant/30 disabled:no-underline flex items-center gap-1 transition-colors"
                >
                  Next
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
