'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { EmptyState } from '@/components/ui/empty-state';

interface VerificationCase {
  id: string;
  listingId: string;
  status: string;
  slaDueAt: string;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    city: string;
    district: string;
    badge: string;
    media?: { url: string }[];
    _count?: { documents: number };
  };
  submittedBy: { name: string; email: string };
}

type Decision = 'APPROVED' | 'CONDITIONAL' | 'REJECTED';

function getSlaState(d: string): 'overdue' | 'warning' | 'ok' {
  const now  = new Date();
  const due  = new Date(d);
  const diff = due.getTime() - now.getTime();
  if (diff < 0) return 'overdue';
  if (diff < 2 * 60 * 60 * 1000) return 'warning';
  return 'ok';
}

function getSlaLabel(d: string): string {
  const now  = new Date();
  const due  = new Date(d);
  const diff = due.getTime() - now.getTime();
  if (diff < 0) {
    const h = Math.floor(Math.abs(diff) / 3600000);
    return h > 24 ? `${Math.floor(h/24)}d overdue` : `${h}h overdue`;
  }
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `${h}h left`;
  return `${Math.floor(h / 24)}d left`;
}

const DECISION_CONFIG: Record<Decision, { label: string; icon: string; btnClass: string; badgeOptions: string[] }> = {
  APPROVED:    { label: 'Approve',     icon: 'check_circle', btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white', badgeOptions: ['VERIFIED_GOLD', 'VERIFIED_GREEN'] },
  CONDITIONAL: { label: 'Conditional', icon: 'pending',      btnClass: 'bg-amber-500 hover:bg-amber-600 text-white',    badgeOptions: ['CONDITIONAL'] },
  REJECTED:    { label: 'Reject',      icon: 'cancel',       btnClass: 'bg-red-600 hover:bg-red-700 text-white',        badgeOptions: ['NONE'] },
};

const BADGE_LABELS: Record<string, string> = {
  VERIFIED_GOLD:  'C of O Gold',
  VERIFIED_GREEN: 'R of O Green',
  CONDITIONAL:    'Conditional',
  NONE:           'No Badge',
};

function StatusPill({ status }: { status: string }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    PENDING:   { label: 'Pending',   cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    IN_REVIEW: { label: 'In Review', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
    APPROVED:  { label: 'Approved',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    REJECTED:  { label: 'Rejected',  cls: 'bg-red-50 text-red-700 border-red-200' },
    CONDITIONAL: { label: 'Conditional', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  };
  const c = cfg[status] || { label: status, cls: 'bg-slate-50 text-slate-600 border-slate-200' };
  return (
    <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full border ${c.cls}`}>
      {c.label}
    </span>
  );
}

function SlaPill({ dueAt }: { dueAt: string }) {
  const state = getSlaState(dueAt);
  const label = getSlaLabel(dueAt);
  if (state === 'overdue') return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-lg">
      <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>alarm_off</span>
      {label}
    </span>
  );
  if (state === 'warning') return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg animate-pulse-soft">
      <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
      {label}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs text-on-surface-variant/70 px-2 py-1">
      <span className="material-symbols-outlined text-xs">schedule</span>
      {label}
    </span>
  );
}

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
    setDecidingId(prev => prev === caseId ? null : caseId);
    setDecision('APPROVED');
    setBadge('VERIFIED_GREEN');
    setReason('');
    setError('');
  }

  function handleDecisionChange(d: Decision) {
    setDecision(d);
    setBadge(DECISION_CONFIG[d].badgeOptions[0]);
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

  const pendingCount  = cases.filter(c => c.status === 'PENDING').length;
  const reviewCount   = cases.filter(c => c.status === 'IN_REVIEW').length;
  const overdueCount  = cases.filter(c => getSlaState(c.slaDueAt) === 'overdue').length;
  const dcfg          = DECISION_CONFIG[decision];

  return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-28 pb-20 px-4 md:px-8 max-w-[1440px] mx-auto">

        {/* Page header */}
        <section className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 animate-fade-in-up">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Legal Operations</p>
            <h1 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tighter text-on-surface mb-2">
              Verification Queue
            </h1>
            <p className="text-on-surface-variant max-w-xl text-sm leading-relaxed">
              Review submitted property listings, assess documentation, and assign compliance badges.
            </p>
          </div>
          <button onClick={fetchQueue}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-sm font-bold hover:bg-surface-container transition-all">
            <span className="material-symbols-outlined text-sm">refresh</span>
            Refresh
          </button>
        </section>

        {/* Stat cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: 'pending_actions', label: 'Pending',        value: pendingCount,  bg: 'bg-blue-100',    color: 'text-blue-600'   },
            { icon: 'rate_review',     label: 'In Review',      value: reviewCount,   bg: 'bg-violet-100',  color: 'text-violet-600' },
            { icon: 'assignment',      label: 'Total in Queue', value: cases.length,  bg: 'bg-slate-100',   color: 'text-slate-600'  },
            { icon: 'alarm_off',       label: 'Overdue',        value: overdueCount,  bg: overdueCount > 0 ? 'bg-red-100' : 'bg-slate-100', color: overdueCount > 0 ? 'text-red-600' : 'text-slate-400' },
          ].map((s, i) => (
            <div key={s.label}
              className="bg-surface-container-lowest p-5 rounded-2xl flex flex-col gap-3 border border-outline-variant/10 hover:shadow-md transition-all animate-fade-in-up shadow-[0_4px_20px_rgba(11,31,51,0.04)]"
              style={{ animationDelay: `${i * 60}ms` }}>
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

        {/* Compliance reminder */}
        {overdueCount > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-scale-in">
            <span className="material-symbols-outlined text-red-600 shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            <div>
              <p className="text-sm font-bold text-red-700">SLA Compliance Alert</p>
              <p className="text-xs text-red-600/80 mt-0.5">
                {overdueCount} {overdueCount === 1 ? 'case is' : 'cases are'} past their SLA deadline.
                Review and action required immediately.
              </p>
            </div>
          </div>
        )}

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

        {/* Queue table */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold font-headline tracking-tight">
              Case Queue
              {cases.length > 0 && (
                <span className="ml-2 text-xs font-normal text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                  {cases.length}
                </span>
              )}
            </h3>
          </div>

          {loading ? (
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden animate-pulse">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-outline-variant/10">
                  <div className="w-14 h-14 bg-surface-container rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-surface-container-high rounded w-2/3" />
                    <div className="h-3 bg-surface-container-high rounded w-1/3" />
                  </div>
                  <div className="w-20 h-6 bg-surface-container-high rounded-full" />
                  <div className="w-24 h-8 bg-surface-container-high rounded-xl" />
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
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden shadow-[0_4px_20px_rgba(11,31,51,0.04)]">
              {/* Table header */}
              <div className="hidden md:grid grid-cols-[1fr_160px_120px_120px_80px_100px_140px] gap-4 px-6 py-3 bg-surface-container-low border-b border-outline-variant/10">
                {['Property', 'Seller', 'Submitted', 'SLA', 'Docs', 'Status', 'Action'].map(col => (
                  <span key={col} className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{col}</span>
                ))}
              </div>

              {/* Table rows */}
              <div className="divide-y divide-outline-variant/10">
                {cases.map(c => {
                  const slaState  = getSlaState(c.slaDueAt);
                  const isDeciding = decidingId === c.id;
                  const submittedLabel = new Date(c.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
                  const docsCount = c.listing._count?.documents ?? '–';
                  const thumbnail = c.listing.media?.[0]?.url;

                  return (
                    <div key={c.id} className="animate-fade-in">
                      {/* Row */}
                      <div className={`flex flex-col md:grid md:grid-cols-[1fr_160px_120px_120px_80px_100px_140px] gap-4 px-6 py-4 items-start md:items-center hover:bg-surface-container-low/40 transition-colors ${
                        isDeciding ? 'bg-surface-container-low' : ''
                      } ${slaState === 'overdue' ? 'border-l-4 border-red-500' : slaState === 'warning' ? 'border-l-4 border-amber-400' : ''}`}>

                        {/* Property col */}
                        <div className="flex items-center gap-3 min-w-0">
                          {thumbnail ? (
                            <img src={thumbnail} alt={c.listing.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-xl text-on-surface-variant/30">landscape</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-on-surface leading-snug truncate">{c.listing.title}</p>
                            <p className="text-xs text-on-surface-variant flex items-center gap-0.5 mt-0.5">
                              <span className="material-symbols-outlined text-xs">location_on</span>
                              {c.listing.city}, {c.listing.district}
                            </p>
                          </div>
                        </div>

                        {/* Seller */}
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-on-surface truncate">{c.submittedBy.name}</span>
                          <span className="text-[10px] text-on-surface-variant/60 truncate">{c.submittedBy.email}</span>
                        </div>

                        {/* Submitted */}
                        <span className="text-xs text-on-surface-variant">{submittedLabel}</span>

                        {/* SLA */}
                        <SlaPill dueAt={c.slaDueAt} />

                        {/* Docs */}
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-on-surface-variant/60">description</span>
                          <span className="text-xs font-bold text-on-surface-variant">{docsCount}</span>
                        </div>

                        {/* Status */}
                        <StatusPill status={c.status} />

                        {/* Action */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openDecision(c.id)}
                            className={`text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 transition-all active:scale-95 ${
                              isDeciding
                                ? 'bg-surface-container text-on-surface-variant border border-outline-variant/20'
                                : 'machined-gradient text-white hover:opacity-90'
                            }`}
                          >
                            <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                              {isDeciding ? 'expand_less' : 'gavel'}
                            </span>
                            {isDeciding ? 'Close' : 'Decide'}
                          </button>
                          <Link href={`/listings/${c.listing.id}`} target="_blank"
                            className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-xs">open_in_new</span>
                          </Link>
                        </div>
                      </div>

                      {/* Expanded decision panel */}
                      {isDeciding && (
                        <div className="border-t border-outline-variant/10 bg-surface-container-low px-6 py-5 space-y-5 animate-fade-in">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
                            Decision Panel — {c.listing.title}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {/* Decision selector */}
                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Decision</label>
                              <div className="flex flex-col gap-2">
                                {(Object.keys(DECISION_CONFIG) as Decision[]).map(d => {
                                  const cfg = DECISION_CONFIG[d];
                                  const isSelected = decision === d;
                                  return (
                                    <button key={d} type="button" onClick={() => handleDecisionChange(d)}
                                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all text-left ${
                                        isSelected
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

                            {/* Badge + Reason */}
                            <div className="md:col-span-2 space-y-4">
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
                                  placeholder="Provide a clear rationale for this decision (min 10 characters)…"
                                  className="w-full bg-surface-container-lowest rounded-xl border border-outline-variant/20 focus:border-primary focus:ring-0 px-4 py-3 text-sm text-on-surface outline-none transition-colors resize-none"
                                />
                                {reason.length > 0 && reason.length < 10 && (
                                  <p className="text-xs text-amber-600 mt-1">{10 - reason.length} more characters needed</p>
                                )}
                              </div>

                              {/* Action row */}
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => submitDecision(c.id)}
                                  disabled={submitting || reason.trim().length < 10}
                                  className={`${dcfg.btnClass} px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide flex items-center gap-2 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed`}>
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
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
      <Footer />
    </main>
  );
}
