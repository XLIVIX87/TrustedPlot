'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
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

  const pendingCount = cases.filter(c => c.status === 'PENDING').length;
  const reviewCount = cases.filter(c => c.status === 'IN_REVIEW').length;

  return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-32 pb-20 px-8 max-w-[1440px] mx-auto">
        {/* Page header */}
        <section className="mb-12">
          <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-on-surface mb-2">
            Verification Queue
          </h1>
          <p className="text-on-surface-variant max-w-2xl">
            Review submitted property listings for trust verification and assign compliance badges.
          </p>
        </section>

        {/* Stat cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: 'pending_actions', label: 'Pending', value: pendingCount, tag: 'QUEUE', tagColor: 'bg-secondary-fixed text-on-secondary-fixed' },
            { icon: 'rate_review', label: 'In Review', value: reviewCount, tag: 'ACTIVE', tagColor: 'bg-tertiary-fixed text-on-tertiary-fixed' },
            { icon: 'assignment', label: 'Total in Queue', value: cases.length, tag: 'ALL', tagColor: 'bg-surface-container-high text-on-surface-variant' },
          ].map(s => (
            <div key={s.label} className="bg-surface-container-lowest p-8 rounded-xl flex flex-col gap-4 border-b-2 border-transparent hover:border-primary transition-all group">
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">{s.icon}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-widest ${s.tagColor}`}>{s.tag}</span>
              </div>
              <div>
                <p className="text-3xl font-black font-headline">{s.value}</p>
                <p className="text-sm text-on-surface-variant font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Error alert */}
        {error && (
          <div className="mb-6 rounded-xl bg-error-container p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-on-error-container">error</span>
            <p className="text-sm text-on-error-container font-medium">{error}</p>
          </div>
        )}

        {/* Queue list */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-2xl font-bold font-headline tracking-tight">Case Queue</h3>
          </div>

          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-surface-container-lowest rounded-xl h-28">
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-surface-container-high rounded w-3/4" />
                    <div className="h-4 bg-surface-container-high rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : cases.length === 0 ? (
            <EmptyState
              icon="verified"
              title="No pending verifications"
              description="All caught up! There are no cases awaiting review."
            />
          ) : (
            <div className="space-y-4">
              {cases.map(c => (
                <div
                  key={c.id}
                  className={`bg-surface-container-lowest rounded-xl p-6 transition-all ${
                    decidingId === c.id
                      ? 'border-l-4 border-primary ring-1 ring-primary/10'
                      : 'border-l-4 border-transparent hover:border-primary'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <span className="material-symbols-outlined text-primary mt-0.5">description</span>
                      <div>
                        <h4 className="text-lg font-bold font-headline leading-tight">{c.listing.title}</h4>
                        <p className="text-sm text-on-surface-variant">{c.listing.city}, {c.listing.district}</p>
                        <p className="text-xs text-on-surface-variant/60 mt-1">
                          Submitted by {c.submittedBy.name} ({c.submittedBy.email})
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <StatusBadge status={c.status} />
                      <p className={`text-xs mt-1 ${isOverdue(c.slaDueAt) ? 'text-error font-bold' : 'text-on-surface-variant/60'}`}>
                        SLA: {formatDate(c.slaDueAt)} {isOverdue(c.slaDueAt) && '(OVERDUE)'}
                      </p>
                    </div>
                  </div>

                  {decidingId === c.id ? (
                    <div className="mt-6 bg-surface-container-low rounded-xl p-6 space-y-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Decision Form</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Decision</label>
                          <select
                            value={decisionForm.decision}
                            onChange={e => setDecisionForm(f => ({ ...f, decision: e.target.value }))}
                            className="w-full bg-surface-container-lowest rounded-lg border-b-2 border-outline-variant focus:border-primary px-4 py-3 text-sm text-on-surface outline-none transition-colors"
                          >
                            <option value="APPROVED">Approve</option>
                            <option value="CONDITIONAL">Conditional</option>
                            <option value="REJECTED">Reject</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Badge</label>
                          <select
                            value={decisionForm.badge}
                            onChange={e => setDecisionForm(f => ({ ...f, badge: e.target.value }))}
                            className="w-full bg-surface-container-lowest rounded-lg border-b-2 border-outline-variant focus:border-primary px-4 py-3 text-sm text-on-surface outline-none transition-colors"
                          >
                            <option value="VERIFIED_GOLD">Verified Gold</option>
                            <option value="VERIFIED_GREEN">Verified Green</option>
                            <option value="CONDITIONAL">Conditional</option>
                            <option value="NONE">None</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Reason *</label>
                        <textarea
                          value={decisionForm.reason}
                          onChange={e => setDecisionForm(f => ({ ...f, reason: e.target.value }))}
                          required
                          minLength={10}
                          rows={3}
                          className="w-full bg-surface-container-lowest rounded-lg border-b-2 border-outline-variant focus:border-primary px-4 py-3 text-sm text-on-surface outline-none transition-colors resize-none"
                          placeholder="Explain your decision..."
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => submitDecision(c.id)}
                          disabled={decisionForm.reason.length < 10}
                          className="machined-gradient text-white px-8 py-3 rounded-lg font-bold text-sm tracking-widest uppercase hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Submit Decision
                        </button>
                        <button
                          onClick={() => setDecidingId(null)}
                          className="px-6 py-3 rounded-lg text-sm font-bold text-on-surface-variant border border-outline-variant hover:bg-surface-container-low transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <button
                        onClick={() => setDecidingId(c.id)}
                        className="text-sm font-bold text-primary border-b border-primary/20 pb-0.5 hover:border-primary transition-all flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">gavel</span>
                        Review &amp; Decide
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </main>
  );
}
