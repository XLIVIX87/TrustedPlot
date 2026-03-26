'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/ui/navbar';

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
    <main className="min-h-screen bg-page">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">Audit Log</h1>

        <div className="bg-white rounded-lg border border-border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
              <select value={actionType} onChange={e => { setActionType(e.target.value); setPage(1); }} className="w-full rounded-md border border-border px-3 py-2 text-sm">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
              <select value={entityType} onChange={e => { setEntityType(e.target.value); setPage(1); }} className="w-full rounded-md border border-border px-3 py-2 text-sm">
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
            <div className="flex items-end">
              <span className="text-sm text-gray-500">{total} total entries</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3 animate-pulse">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 bg-gray-100 rounded" />)}
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-sm">No audit logs found.</div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actor</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Entity</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-xs text-gray-500">{formatDate(log.createdAt)}</td>
                      <td className="px-6 py-3 text-sm">
                        <span className="font-medium text-brand-dark">{log.actor?.name}</span>
                        <span className="text-xs text-gray-400 ml-1">({log.actor?.role})</span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700">{log.actionType.replace(/_/g, ' ')}</td>
                      <td className="px-6 py-3 text-sm text-gray-500">{log.entityType}</td>
                      <td className="px-6 py-3 text-xs font-mono text-gray-400">{log.entityId.slice(0, 12)}...</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-3 border-t border-border flex items-center justify-between">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="text-sm text-brand-primary hover:underline disabled:text-gray-300">Previous</button>
                <span className="text-sm text-gray-500">Page {page}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={logs.length < 25} className="text-sm text-brand-primary hover:underline disabled:text-gray-300">Next</button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
