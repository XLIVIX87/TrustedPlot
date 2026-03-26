'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/ui/navbar';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';

interface VerificationCase {
  id: string;
  listingId: string;
  status: string;
  slaDueAt: string;
  createdAt: string;
  listing: { id: string; title: string; city: string; district: string };
  submittedBy: { name: string; email: string };
}

export default function VerificationQueuePage() {
  const { data: session } = useSession();
  const [cases, setCases] = useState<VerificationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [decisionForm, setDecisionForm] = useState({ decision: 'APPROVED', reason: '', badge: 'VERIFIED_GREEN' });
  const [error, setError] = useState('');

  async function fetchQueue() {
    try {
      const res = await fetch('/api/verification/queue');
      const data = await res.json();
      if (data.data) setCases(data.data);
    } catch {} finally { setLoading(false); }
  }

  useEffect(() => { fetchQueue(); }, []);

  async function submitDecision(caseId: string) {
    setError('');
    try {
      const res = await fetch(`/api/verification/${caseId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(decisionForm),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error?.message || 'Decision failed'); return; }
      setDecidingId(null);
      setDecisionForm({ decision: 'APPROVED', reason: '', badge: 'VERIFIED_GREEN' });
      fetchQueue();
    } catch { setError('Failed to submit decision'); }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function isOverdue(d: string) { return new Date(d) < new Date(); }

  return (
    <main className="min-h-screen bg-page">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">Verification Queue</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-border p-5">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-status-warning mt-1">{cases.filter(c => c.status === 'PENDING').length}</p>
          </div>
          <div className="bg-white rounded-lg border border-border p-5">
            <p className="text-sm text-gray-500">In Review</p>
            <p className="text-2xl font-bold text-brand-primary mt-1">{cases.filter(c => c.status === 'IN_REVIEW').length}</p>
          </div>
          <div className="bg-white rounded-lg border border-border p-5">
            <p className="text-sm text-gray-500">Total in Queue</p>
            <p className="text-2xl font-bold text-brand-dark mt-1">{cases.length}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-status-error">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg border border-border overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3 animate-pulse">
              {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-100 rounded" />)}
            </div>
          ) : cases.length === 0 ? (
            <div className="p-6">
              <EmptyState title="No pending verifications" description="All caught up!" />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {cases.map(c => (
                <div key={c.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-brand-dark">{c.listing.title}</h3>
                      <p className="text-sm text-gray-500">{c.listing.city}, {c.listing.district}</p>
                      <p className="text-xs text-gray-400 mt-1">Submitted by {c.submittedBy.name} ({c.submittedBy.email})</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={c.status} />
                      <p className={`text-xs mt-1 ${isOverdue(c.slaDueAt) ? 'text-status-error font-medium' : 'text-gray-400'}`}>
                        SLA: {formatDate(c.slaDueAt)} {isOverdue(c.slaDueAt) && '(OVERDUE)'}
                      </p>
                    </div>
                  </div>

                  {decidingId === c.id ? (
                    <div className="mt-4 p-4 bg-muted rounded-lg space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Decision</label>
                          <select value={decisionForm.decision} onChange={e => setDecisionForm(f => ({ ...f, decision: e.target.value }))} className="w-full rounded-md border border-border px-3 py-2 text-sm">
                            <option value="APPROVED">Approve</option>
                            <option value="CONDITIONAL">Conditional</option>
                            <option value="REJECTED">Reject</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
                          <select value={decisionForm.badge} onChange={e => setDecisionForm(f => ({ ...f, badge: e.target.value }))} className="w-full rounded-md border border-border px-3 py-2 text-sm">
                            <option value="VERIFIED_GOLD">Verified Gold</option>
                            <option value="VERIFIED_GREEN">Verified Green</option>
                            <option value="CONDITIONAL">Conditional</option>
                            <option value="NONE">None</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                        <textarea value={decisionForm.reason} onChange={e => setDecisionForm(f => ({ ...f, reason: e.target.value }))} required minLength={10} rows={3} className="w-full rounded-md border border-border px-3 py-2 text-sm" placeholder="Explain your decision..." />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => submitDecision(c.id)} disabled={decisionForm.reason.length < 10} className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">Submit Decision</button>
                        <button onClick={() => setDecidingId(null)} className="rounded-md border border-border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <button onClick={() => setDecidingId(c.id)} className="text-sm text-brand-primary hover:underline">Review &amp; Decide</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
