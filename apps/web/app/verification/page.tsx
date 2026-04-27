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

type Decision = 'APPROVED' | 'CONDITIONAL' | 'REJECTED';

function getSlaState(d: string): 'overdue' | 'warning' | 'ok' {
  const now  = new Date();
  const due  = new Date(d);
  const diff = due.getTime() - now.getTime();
  if (diff < 0) return 'overdue';
  if (diff < 2 * 60 * 60 * 1000) return 'warning'; // < 2 hours
  return 'ok';
}

function SlaTimer({ dueAt }: { dueAt: string }) {
  const state = getSlaState(dueAt);
  const label = new Date(dueAt).toLocaleDateString('en-NG', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  if (state === 'overdue') return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-lg">
      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>alarm_off</span>
      OVERDUE · {label}
    </span>
  );
  if (state === 'warning') return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg animate-pulse-soft">
      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
      DUE SOON · {label}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs text-on-surface-variant/60 px-2 py-1">
      <span className="material-symbols-outlined text-xs">schedule</span>
      SLA: {label}
    </span>
  );
}

const DECISION_CONFIG: Record<Decision, { label: string; icon: string; btnClass: string; badgeOptions: string[] }> = {
  APPROVED: {
    label: 'Approve',
    icon: 'check_circle',
    btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    badgeOptions: ['VERIFIED_GOLD', 'VERIFIED_GREEN'],
  },
  CONDITIONAL: {
    label: 'Conditional',
    icon: 'pending',
    btnClass: 'bg-amber-500 hover:bg-amber-600 text-white',
    badgeOptions: ['CONDITIONAL'],
  },
  REJECTED: {
    label: 'Reject',
    icon: 'cancel',
    btnClass: 'bg-red-600 hover:bg-red-700 text-white',
    badgeOptions: ['NONE'],
  },
};

const BADGE_LABELS: Record<string, string> = {
  VERIFIED_GOLD:  'C of O Gold',
  VERIFIED_GREEN: 'R of O Green',
  CONDITIONAL:    'Conditional',
  NONE:           'No Badge',
};

export default function VerificationQueuePage() {
  const { data: session } = useSession();
  const [cases, setCases]           = useState<VerificationCase[]>([]);
  const [loading, setLoading]       = useState(true);
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [decision, setDecision]     = useState<Decision>('APPROVED');
  const [badge, setBadge]           = useState('VERIFIED_GREEN');
  const [reason, setReason]         = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  async function fetchQueue() {
    try {
      const res  = await fetch('/api/verification/queue');
      const data = await res.json();
      if (data.data?.cases) setCases(data.data.cases);
      else if (Array.isArray(data.data)) setCases(data.data);
    } catch {} finally { setLoading(false); }
  }

  useEffect(() => { fetchQueue(); }, []);

  function openDecision(caseId: string) {
    setDecidingId(caseId);
    setDecision('APPROVED');
    setBadge('VERIFIED_GREEN');
    setReason('');
    setError('');
  }

  function handleDecisionChange(d: Decision) {
    setDecision(d);
    // Auto-select sensible default badge for chosen decision
    const opts = DECISION_CONFIG[d].badgeOptions;
    setBadge(opts[0]);
  }

  async function submitDecision(caseId: string) {
    if (reason.trim().length < 10) { setError('Reason must be at least 10 characters.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`/api/verification/${caseId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, reason, badge }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error?.message || 'Decision failed'); return; }
      setDecidingId(null);
      fetchQueue();
    } catch { setError('Failed to submit decision'); }
    finally { setSubmitting(false); }
  }

  const pendingCount = cases.filter(c => c.status === 'PENDING').length;
  const reviewCount  = cases.filter(c => c.status === 'IN_REVIEW').length;
  const overdueCount = cases.filter(c => getSlaState(c.slaDueAt) === 'overdue').length;

  return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-32 pb-20 px-8 max-w-[1440px] mx-auto">

        {/* Page header */}
        <section className="mb-10 animate-fade-in-up">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Legal Operations</p>
          <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-on-surface mb-2">
            Verification Queue
          </h1>
          <p className="text-on-surface-variant max-w-xl text-sm leading-relaxed">
            Review submitted property listings, assess documentation, and assign compliance badges.
          </p>
        </section>

        {/* Stat cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: 'pending_actions', label: 'Pending',        value: pendingCount,  bg: 'bg-blue-100',   color: 'text-blue-600'  },
            { icon: 'rate_review',     label: 'In Review',      value: reviewCount,   bg: 'bg-violet-100', color: 'text-violet-600' },
            { icon: 'assignment',      label: 'Total in Queue', value: cases.length,  bg: 'bg-slate-100',  color: 'text-slate-600'  },
            { icon: 'alarm_off',       label: 'Overdue',        value: overdueCount,  bg: overdueCount > 0 ? 'bg-red-100' : 'bg-slate-100', color: overdueCount > 0 ? 'text-red-600' : 'text-slate-400' },
          ].map(s => (
            <div key={s.label} className="bg-surface-container-lowest p-5 rounded-2xl flex flex-col gap-4 hover:shadow-md transition-all border border-outline-variant/10 animate-fade-in-up">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
              </div>
              <div>
                <p className="text-3xl font-black font-headline text-on-surface">{s.value}</p>
                <p className="text-xs text-on-surface-variant font-medium mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Error alert */}
        {error && (
          <div className="mb-6 rounded-xl bg-error-container p-4 flex items-center gap-3 animate-scale-in">
            <span className="material-symbols-outlined text-on-error-container">error</span>
            <p className="text-sm text-on-error-container font-medium">{error}</p>
            <button onClick={() => setError('')} className="ml-auto text-on-error-container hover:opacity-70">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        {/* Queue */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold font-headline tracking-tight">
              Case Queue
              {cases.length > 0 && <span className="ml-2 text-sm font-normal text-on-surface-variant">({cases.length})</span>}
            </h3>
            <button onClick={fetchQueue} className="text-xs font-bold text-on-surface-variant flex items-center gap-1 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-sm">refresh</span> Refresh
            </button>
          </div>

          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-surface-container-lowest rounded-2xl h-28">
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
              title="All caught up!"
              description="There are no cases awaiting review. New submissions will appear here."
            />
          ) : (
            <div className="space-y-3">
              {cases.map(c => {
                const slaState = getSlaState(c.slaDueAt);
                const isDeciding = decidingId === c.id;
                const dcfg = DECISION_CONFIG[decision];

                return (
                  <div key={c.id}
                    className={`bg-surface-container-lowest rounded-2xl overflow-hidden transition-all animate-fade-in-up ${
                      isDeciding
                        ? 'ring-2 ring-primary/20 shadow-md'
                        : slaState === 'overdue'
                        ? 'border-l-4 border-red-500'
                        : slaState === 'warning'
                        ? 'border-l-4 border-amber-400'
                        : 'border-l-4 border-transparent hover:border-primary/30'
                    }`}
                  >
                    {/* Case header */}
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            slaState === 'overdue' ? 'bg-red-100' : slaState === 'warning' ? 'bg-amber-100' : 'bg-surface-container-high'
                          }`}>
                            <span className={`material-symbols-outlined text-lg ${
                              slaState === 'overdue' ? 'text-red-600' : slaState === 'warning' ? 'text-amber-600' : 'text-primary'
                            }`} style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-base font-bold font-headline leading-tight truncate">{c.listing.title}</h4>
                            <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                              <span className="material-symbols-outlined text-xs">location_on</span>
                              {c.listing.city}, {c.listing.district}
                            </p>
                            <p className="text-xs text-on-surface-variant/60 mt-1">
                              Submitted by {c.submittedBy.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <StatusBadge status={c.status} />
                          <SlaTimer dueAt={c.slaDueAt} />
                        </div>
                      </div>

                      {!isDeciding && (
                        <div className="mt-4 pt-4 border-t border-outline-variant/10 flex items-center gap-3">
                          <button onClick={() => openDecision(c.id)}
                            className="machined-gradient text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all">
                            <span className="material-symbols-outlined text-sm">gavel</span>
                            Review &amp; Decide
                          </button>
                          <a href={`/listings/${c.listing.id}`} target="_blank" rel="noreferrer"
                            className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                            View Listing
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Decision panel */}
                    {isDeciding && (
                      <div className="border-t border-outline-variant/15 bg-surface-container-low px-6 pb-6 pt-5 space-y-5 animate-fade-in">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Decision Panel</p>

                        {/* Decision selector */}
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Decision</label>
                          <div className="grid grid-cols-3 gap-2">
                            {(Object.keys(DECISION_CONFIG) as Decision[]).map(d => {
                              const cfg = DECISION_CONFIG[d];
                              return (
                                <button key={d} type="button" onClick={() => handleDecisionChange(d)}
                                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                                    decision === d
                                      ? d === 'APPROVED'    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                      : d === 'CONDITIONAL' ? 'border-amber-400 bg-amber-50 text-amber-700'
                                                            : 'border-red-500 bg-red-50 text-red-700'
                                      : 'border-outline-variant/20 text-on-surface-variant hover:border-outline-variant bg-surface-container-lowest'
                                  }`}>
                                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
                                  {cfg.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Badge selector */}
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Badge to Assign</label>
                          <div className="flex gap-2 flex-wrap">
                            {dcfg.badgeOptions.map(b => (
                              <button key={b} type="button" onClick={() => setBadge(b)}
                                className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                                  badge === b
                                    ? 'border-primary bg-primary text-white'
                                    : 'border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary bg-surface-container-lowest'
                                }`}>
                                {BADGE_LABELS[b] || b}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Reason */}
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">
                            Reason <span className="text-error">*</span>
                          </label>
                          <textarea
                            value={reason}
                            onChange={e => { setReason(e.target.value); setError(''); }}
                            rows={3}
                            placeholder="Provide a clear rationale for this decision (min 10 characters)..."
                            className="w-full bg-surface-container-lowest rounded-xl border border-outline-variant/20 focus:border-primary focus:ring-0 px-4 py-3 text-sm text-on-surface outline-none transition-colors resize-none"
                          />
                          {reason.length > 0 && reason.length < 10 && (
                            <p className="text-xs text-amber-600 mt-1">{10 - reason.length} more characters needed</p>
                          )}
                        </div>

                        {error && (
                          <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">error</span>{error}
                          </p>
                        )}

                        <div className="flex items-center gap-3 pt-1">
                          <button
                            onClick={() => submitDecision(c.id)}
                            disabled={submitting || reason.trim().length < 10}
                            className={`${dcfg.btnClass} px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide flex items-center gap-2 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
                          >
                            {submitting ? (
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{dcfg.icon}</span>
                            )}
                            {submitting ? 'Submitting…' : `Submit: ${dcfg.label}`}
                          </button>
                          <button onClick={() => setDecidingId(null)}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-on-surface-variant border border-outline-variant/20 hover:bg-surface-container transition-all">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </main>
  );
}
