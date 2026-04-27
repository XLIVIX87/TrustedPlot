'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';

interface EscrowDetail {
  id: string;
  status: string;
  amount: string;
  createdAt: string;
  updatedAt: string;
  listing: { id: string; title: string; city: string; district: string; price: string };
  buyer:   { name: string; email: string };
  seller:  { name: string; email: string };
  events:  { id: string; eventType: string; createdAt: string; createdByUserId: string; payload: any }[];
  disputes?: { id: string; reason: string; status: string; resolutionSummary: string | null }[];
}

const STAGE_META: Record<string, { icon: string; label: string; desc: string }> = {
  CREATED:            { icon: 'add_circle',            label: 'Escrow Created',       desc: 'Terms agreed, escrow opened' },
  FUNDING_PENDING:    { icon: 'hourglass_empty',        label: 'Awaiting Funding',     desc: 'Buyer to transfer funds' },
  FUNDED:             { icon: 'account_balance_wallet', label: 'Funds Secured',        desc: 'Funds held in secure escrow' },
  PENDING_RESOLUTION: { icon: 'description',            label: 'Pending Resolution',   desc: 'Awaiting final sign-off' },
  RELEASED:           { icon: 'payments',               label: 'Funds Released',       desc: 'Transaction complete' },
  DISPUTED:           { icon: 'gavel',                  label: 'Under Dispute',        desc: 'Dispute raised, review in progress' },
  REFUNDED:           { icon: 'undo',                   label: 'Refunded',             desc: 'Funds returned to buyer' },
};

const STATUS_PILL: Record<string, string> = {
  FUNDED:             'bg-emerald-100 text-emerald-800 border border-emerald-200',
  RELEASED:           'bg-teal-100 text-teal-800 border border-teal-200',
  DISPUTED:           'bg-red-100 text-red-700 border border-red-200',
  REFUNDED:           'bg-slate-100 text-slate-600 border border-slate-200',
  FUNDING_PENDING:    'bg-amber-100 text-amber-800 border border-amber-200',
  CREATED:            'bg-blue-100 text-blue-800 border border-blue-200',
  PENDING_RESOLUTION: 'bg-violet-100 text-violet-800 border border-violet-200',
};

function StageTimeline({ stages, escrowStatus, events }: {
  stages: string[];
  escrowStatus: string;
  events: EscrowDetail['events'];
}) {
  const currentIdx = stages.indexOf(escrowStatus);

  function dotStyle(i: number) {
    if (i < currentIdx)  return 'bg-emerald-500 text-white ring-4 ring-emerald-100';
    if (i === currentIdx) {
      if (escrowStatus === 'DISPUTED') return 'bg-red-500 text-white ring-4 ring-red-100';
      if (escrowStatus === 'REFUNDED') return 'bg-slate-500 text-white ring-4 ring-slate-100';
      return 'bg-primary text-white ring-4 ring-primary/20';
    }
    return 'bg-surface-container-high text-on-surface-variant/40';
  }

  function lineStyle(i: number) {
    return i < currentIdx ? 'bg-emerald-400' : 'bg-surface-container-high';
  }

  return (
    <div className="relative ml-5">
      {stages.map((stage, i) => {
        const meta  = STAGE_META[stage];
        const event = events.find(e => e.eventType === stage || e.eventType === `ESCROW_${stage}`);
        const isLast = i === stages.length - 1;
        const status = i < currentIdx ? 'completed' : i === currentIdx ? 'current' : 'upcoming';

        return (
          <div key={stage} className="relative flex items-start gap-5 pb-8 last:pb-0">
            {/* Connector line */}
            {!isLast && (
              <div className={`absolute left-5 top-10 w-0.5 bottom-0 -ml-px ${lineStyle(i)}`} />
            )}

            {/* Dot */}
            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${dotStyle(i)}`}>
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: status === 'completed' ? "'FILL' 1" : "'FILL' 0" }}>
                {status === 'completed' ? 'check_circle' : meta?.icon || 'circle'}
              </span>
            </div>

            {/* Label */}
            <div className="pt-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className={`font-bold font-headline text-base leading-tight ${status === 'upcoming' ? 'text-on-surface-variant/40' : 'text-on-surface'}`}>
                  {meta?.label || stage}
                </p>
                {status === 'current' && (
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary text-white">Current</span>
                )}
              </div>
              <p className={`text-xs mt-0.5 ${status === 'upcoming' ? 'text-on-surface-variant/30' : 'text-on-surface-variant'}`}>
                {event
                  ? new Date(event.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : meta?.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function EscrowTimelinePage({ params }: { params: { escrowId: string } }) {
  const { data: session } = useSession();
  const [escrow, setEscrow]                 = useState<EscrowDetail | null>(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');
  const [actionLoading, setActionLoading]   = useState('');
  const [actionMessage, setActionMessage]   = useState('');
  const [disputeReason, setDisputeReason]   = useState('');
  const [showDisputeForm, setShowDisputeForm] = useState(false);

  async function loadEscrow() {
    try {
      const res  = await fetch(`/api/escrows/${params.escrowId}`);
      const data = await res.json();
      if (data.data) setEscrow(data.data);
      else setError(data.error?.message || 'Escrow not found');
    } catch { setError('Failed to load escrow'); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadEscrow(); }, [params.escrowId]);

  const fmt  = (p: string) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(p));
  const fmtD = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  async function handleFund() {
    setActionLoading('fund');
    setActionMessage('');
    try {
      const res = await fetch(`/api/escrows/${params.escrowId}/fund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idempotencyKey: `fund-${params.escrowId}-${Date.now()}` }),
      });
      const data = await res.json();
      setActionMessage(res.ok ? 'Escrow funded successfully!' : (data.error?.message || 'Funding failed'));
      if (res.ok) await loadEscrow();
    } catch { setActionMessage('Something went wrong'); }
    finally { setActionLoading(''); }
  }

  async function handleDispute() {
    if (!disputeReason.trim()) return;
    setActionLoading('dispute');
    setActionMessage('');
    try {
      const res = await fetch(`/api/escrows/${params.escrowId}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: disputeReason }),
      });
      const data = await res.json();
      setActionMessage(res.ok ? 'Dispute opened successfully' : (data.error?.message || 'Failed to open dispute'));
      if (res.ok) { setShowDisputeForm(false); setDisputeReason(''); await loadEscrow(); }
    } catch { setActionMessage('Something went wrong'); }
    finally { setActionLoading(''); }
  }

  const visibleStages = escrow?.status === 'DISPUTED'
    ? ['CREATED', 'FUNDED', 'DISPUTED']
    : escrow?.status === 'REFUNDED'
    ? ['CREATED', 'FUNDED', 'REFUNDED']
    : ['CREATED', 'FUNDING_PENDING', 'FUNDED', 'PENDING_RESOLUTION', 'RELEASED'];

  if (loading) return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-32 pb-20 px-8 max-w-[1000px] mx-auto animate-pulse space-y-6">
        <div className="h-5 bg-surface-container-low rounded w-24" />
        <div className="h-10 bg-surface-container-low rounded w-1/3" />
        <div className="bg-surface-container-lowest rounded-2xl h-80" />
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-surface-container-lowest rounded-2xl h-52" />
          <div className="bg-surface-container-lowest rounded-2xl h-52" />
        </div>
      </div>
    </main>
  );

  if (error || !escrow) return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-32 px-8 max-w-[1000px] mx-auto text-center py-20">
        <div className="w-16 h-16 bg-error-container/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-3xl text-error">error</span>
        </div>
        <p className="font-headline font-bold text-xl mb-2">{error || 'Escrow not found'}</p>
        <Link href="/dashboard" className="text-primary font-bold text-sm hover:underline mt-2 inline-block">← Back to Dashboard</Link>
      </div>
    </main>
  );

  const statusPill = STATUS_PILL[escrow.status] || 'bg-surface-container-high text-on-surface-variant';

  return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-32 pb-20 px-6 md:px-8 max-w-[1000px] mx-auto">

        {/* Breadcrumb */}
        <Link href="/dashboard" className="text-sm font-bold text-on-surface-variant flex items-center gap-1 mb-8 hover:text-primary transition-colors w-fit">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 animate-fade-in-up">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Secure Transaction</p>
            <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-on-surface">Escrow Timeline</h1>
          </div>
          <span className={`text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest ${statusPill}`}>
            {escrow.status.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Horizontal progress stepper */}
        {!['DISPUTED', 'REFUNDED'].includes(escrow.status) && (
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-6 mb-6 animate-fade-in-up shadow-[0_4px_20px_rgba(11,31,51,0.04)]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-5">Transaction Progress</p>
            <div className="relative grid grid-cols-5 gap-1">
              {/* Connecting line */}
              <div className="hidden sm:block absolute top-5 left-[10%] right-[10%] h-0.5 bg-surface-container-high z-0" />
              {(['CREATED', 'FUNDING_PENDING', 'FUNDED', 'PENDING_RESOLUTION', 'RELEASED'] as const).map((stage, i) => {
                const stageOrder = ['CREATED', 'FUNDING_PENDING', 'FUNDED', 'PENDING_RESOLUTION', 'RELEASED'];
                const currentOrder = stageOrder.indexOf(escrow.status);
                const isDone    = i < currentOrder;
                const isCurrent = i === currentOrder;
                const meta = STAGE_META[stage];
                return (
                  <div key={stage} className="flex flex-col items-center text-center gap-2 relative z-10 px-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isDone    ? 'bg-emerald-500 border-emerald-500 text-white'
                      : isCurrent ? 'bg-primary border-primary text-white'
                      :             'bg-white border-surface-container-high text-on-surface-variant/30'
                    }`}>
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: (isDone || isCurrent) ? "'FILL' 1" : "'FILL' 0" }}>
                        {isDone ? 'check' : meta?.icon || 'circle'}
                      </span>
                    </div>
                    <div>
                      <p className={`text-[10px] font-bold leading-tight ${isDone || isCurrent ? 'text-on-surface' : 'text-on-surface-variant/40'}`}>
                        {meta?.label || stage}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action message */}
        {actionMessage && (
          <div className={`mb-6 p-4 rounded-xl border-l-4 flex items-center gap-3 animate-scale-in ${
            actionMessage.toLowerCase().includes('success')
              ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
              : 'bg-error-container border-error text-on-error-container'
          }`}>
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              {actionMessage.toLowerCase().includes('success') ? 'check_circle' : 'error'}
            </span>
            <p className="text-sm font-medium">{actionMessage}</p>
            <button onClick={() => setActionMessage('')} className="ml-auto opacity-60 hover:opacity-100">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 mb-6">

          {/* Timeline card */}
          <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-black/5 p-8 animate-fade-in-up stagger-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-8">Transaction Progress</p>
            <StageTimeline stages={visibleStages} escrowStatus={escrow.status} events={escrow.events} />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Escrow details */}
            <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-black/5 p-6 animate-fade-in-up stagger-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-5">Escrow Details</p>
              <dl className="space-y-3.5 text-sm">
                {[
                  { icon: 'tag',              label: 'ID',      value: escrow.id.slice(0, 14) + '…', mono: true },
                  { icon: 'payments',         label: 'Amount',  value: fmt(escrow.amount),           headline: true },
                  { icon: 'calendar_today',   label: 'Created', value: fmtD(escrow.createdAt) },
                  { icon: 'person',           label: 'Buyer',   value: escrow.buyer.name },
                  { icon: 'storefront',       label: 'Seller',  value: escrow.seller.name },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between gap-2">
                    <dt className="text-on-surface-variant flex items-center gap-1.5 shrink-0">
                      <span className="material-symbols-outlined text-sm text-outline">{row.icon}</span>
                      {row.label}
                    </dt>
                    <dd className={`text-right truncate max-w-[60%] ${row.mono ? 'font-mono text-xs' : row.headline ? 'font-black font-headline text-on-surface' : 'font-bold text-on-surface'}`}>
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Property card */}
            <Link href={`/listings/${escrow.listing.id}`}
              className="bg-surface-container-lowest rounded-2xl ring-1 ring-black/5 overflow-hidden flex flex-col hover:ring-primary/30 hover:-translate-y-0.5 transition-all animate-fade-in-up stagger-3">
              <div className="h-28 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
                <span className="material-symbols-outlined text-5xl text-slate-400">landscape</span>
                <span className="absolute top-2 right-2 text-[10px] font-bold bg-white/80 text-slate-600 px-2 py-0.5 rounded-full">Property</span>
              </div>
              <div className="p-5">
                <p className="font-bold font-headline text-on-surface leading-tight">{escrow.listing.title}</p>
                <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">location_on</span>
                  {escrow.listing.city}, {escrow.listing.district}
                </p>
                <p className="text-lg font-black font-headline text-primary mt-2">{fmt(escrow.listing.price)}</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Event log */}
        {escrow.events.length > 0 && (
          <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-black/5 p-8 mb-6 animate-fade-in-up stagger-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-5">Event Log</p>
            <div className="space-y-1">
              {escrow.events.map((event, i) => (
                <div key={event.id} className={`flex items-center gap-4 py-2.5 ${i < escrow.events.length - 1 ? 'border-b border-outline-variant/10' : ''}`}>
                  <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-xs">schedule</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-on-surface">{event.eventType.replace(/_/g, ' ')}</span>
                  </div>
                  <span className="text-xs text-on-surface-variant shrink-0">{fmtD(event.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dispute details */}
        {escrow.disputes && escrow.disputes.length > 0 && (
          <div className="bg-red-50 rounded-2xl border border-red-200 p-6 mb-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
              </div>
              <p className="text-sm font-black uppercase tracking-widest text-red-700">Active Dispute</p>
            </div>
            <p className="text-sm text-red-800">{escrow.disputes[0].reason}</p>
            <p className="text-xs text-red-600 mt-2 font-medium">Status: {escrow.disputes[0].status}</p>
          </div>
        )}

        {/* Actions */}
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-black/5 p-8 animate-fade-in-up stagger-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-6">Actions</p>

          {showDisputeForm ? (
            <div className="space-y-4 animate-scale-in">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-xs font-bold text-red-700 uppercase tracking-widest mb-1">⚠ Raise a Dispute</p>
                <p className="text-xs text-red-600">This will flag the transaction and notify our legal team for review.</p>
              </div>
              <textarea
                value={disputeReason}
                onChange={e => setDisputeReason(e.target.value)}
                placeholder="Describe the issue clearly. Include dates, amounts, and any relevant context..."
                rows={4}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/20 focus:border-red-400 focus:ring-0 transition-colors font-body rounded-xl outline-none resize-none text-sm"
              />
              <div className="flex gap-3">
                <button onClick={handleDispute} disabled={actionLoading === 'dispute' || !disputeReason.trim()}
                  className="px-6 py-3 rounded-xl font-bold text-sm tracking-wide bg-red-600 hover:bg-red-700 text-white active:scale-95 transition-all disabled:opacity-40 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
                  {actionLoading === 'dispute' ? 'Submitting…' : 'Confirm Dispute'}
                </button>
                <button onClick={() => setShowDisputeForm(false)}
                  className="px-5 py-3 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-container-high transition-all">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              {['CREATED', 'FUNDING_PENDING'].includes(escrow.status) && (
                <button onClick={handleFund} disabled={actionLoading === 'fund'}
                  className="machined-gradient text-white px-8 py-3 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
                  {actionLoading === 'fund' ? 'Processing…' : 'Fund Escrow'}
                </button>
              )}
              {!['DISPUTED', 'RELEASED', 'REFUNDED'].includes(escrow.status) && (
                <button onClick={() => setShowDisputeForm(true)}
                  className="px-8 py-3 rounded-xl font-bold text-sm tracking-wide border-2 border-red-300 text-red-600 hover:bg-red-50 active:scale-95 transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">gavel</span>
                  Open Dispute
                </button>
              )}
              {escrow.status === 'RELEASED' && (
                <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="material-symbols-outlined text-emerald-600 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <p className="text-sm text-emerald-800 font-bold">Transaction complete — funds released.</p>
                </div>
              )}
              {escrow.status === 'REFUNDED' && (
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="material-symbols-outlined text-slate-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>undo</span>
                  <p className="text-sm text-slate-700 font-bold">Transaction cancelled — funds refunded.</p>
                </div>
              )}
              {!['CREATED', 'FUNDING_PENDING'].includes(escrow.status) && ['DISPUTED', 'RELEASED', 'REFUNDED'].includes(escrow.status) === false && (
                <p className="text-xs text-on-surface-variant self-center">No available actions at this stage.</p>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
