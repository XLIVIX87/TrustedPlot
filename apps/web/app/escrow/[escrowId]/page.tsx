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
  buyer: { name: string; email: string };
  seller: { name: string; email: string };
  events: { id: string; eventType: string; createdAt: string; createdByUserId: string; payload: any }[];
  disputes?: { id: string; reason: string; status: string; resolutionSummary: string | null }[];
}

const ESCROW_STAGES = ['CREATED', 'FUNDING_PENDING', 'FUNDED', 'PENDING_RESOLUTION', 'RELEASED', 'DISPUTED', 'REFUNDED'];

const STAGE_META: Record<string, { icon: string; label: string }> = {
  CREATED: { icon: 'add_circle', label: 'Escrow Created' },
  FUNDING_PENDING: { icon: 'hourglass_empty', label: 'Awaiting Funding' },
  FUNDED: { icon: 'account_balance_wallet', label: 'Funds Secured' },
  PENDING_RESOLUTION: { icon: 'description', label: 'Pending Resolution' },
  RELEASED: { icon: 'payments', label: 'Funds Released' },
  DISPUTED: { icon: 'gavel', label: 'Under Dispute' },
  REFUNDED: { icon: 'undo', label: 'Refunded' },
};

export default function EscrowTimelinePage({ params }: { params: { escrowId: string } }) {
  const { data: session } = useSession();
  const [escrow, setEscrow] = useState<EscrowDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [showDisputeForm, setShowDisputeForm] = useState(false);

  useEffect(() => {
    async function fetchEscrow() {
      try {
        const res = await fetch(`/api/escrows/${params.escrowId}`);
        const data = await res.json();
        if (data.data) setEscrow(data.data);
        else setError(data.error?.message || 'Escrow not found');
      } catch { setError('Failed to load escrow'); }
      finally { setLoading(false); }
    }
    fetchEscrow();
  }, [params.escrowId]);

  const formatPrice = (p: string) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(p));
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

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
      if (res.ok) {
        setActionMessage('Escrow funded successfully!');
        // Refresh
        const res2 = await fetch(`/api/escrows/${params.escrowId}`);
        const data2 = await res2.json();
        if (data2.data) setEscrow(data2.data);
      } else {
        setActionMessage(data.error?.message || 'Funding failed');
      }
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
      if (res.ok) {
        setActionMessage('Dispute opened successfully');
        setShowDisputeForm(false);
        setDisputeReason('');
        const res2 = await fetch(`/api/escrows/${params.escrowId}`);
        const data2 = await res2.json();
        if (data2.data) setEscrow(data2.data);
      } else {
        setActionMessage(data.error?.message || 'Failed to open dispute');
      }
    } catch { setActionMessage('Something went wrong'); }
    finally { setActionLoading(''); }
  }

  function getStageStatus(stage: string) {
    if (!escrow) return 'upcoming';
    const currentIdx = ESCROW_STAGES.indexOf(escrow.status);
    const stageIdx = ESCROW_STAGES.indexOf(stage);
    if (escrow.status === 'DISPUTED' && stage === 'DISPUTED') return 'current';
    if (escrow.status === 'REFUNDED' && stage === 'REFUNDED') return 'current';
    if (stageIdx < currentIdx) return 'completed';
    if (stageIdx === currentIdx) return 'current';
    return 'upcoming';
  }

  function dotColor(status: string) {
    if (status === 'completed') return 'bg-tertiary-fixed text-on-tertiary-fixed';
    if (status === 'current') return 'bg-secondary-fixed text-on-secondary-fixed';
    return 'bg-surface-container-high text-on-surface-variant';
  }

  function lineColor(status: string) {
    return status === 'completed' ? 'bg-tertiary-fixed' : 'bg-surface-container-high';
  }

  // Only show relevant stages
  const visibleStages = escrow?.status === 'DISPUTED'
    ? ['CREATED', 'FUNDED', 'DISPUTED']
    : escrow?.status === 'REFUNDED'
    ? ['CREATED', 'FUNDED', 'REFUNDED']
    : ['CREATED', 'FUNDING_PENDING', 'FUNDED', 'PENDING_RESOLUTION', 'RELEASED'];

  if (loading) return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-32 pb-20 px-8 max-w-[1000px] mx-auto animate-pulse">
        <div className="h-8 bg-surface-container-high rounded w-1/3 mb-8" />
        <div className="bg-surface-container-lowest rounded-2xl h-80 mb-8" />
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-surface-container-lowest rounded-2xl h-48" />
          <div className="bg-surface-container-lowest rounded-2xl h-48" />
        </div>
      </div>
    </main>
  );

  if (error || !escrow) return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-32 px-8 max-w-[1000px] mx-auto text-center py-20">
        <span className="material-symbols-outlined text-5xl text-outline-variant mb-4 block">error</span>
        <p className="font-headline font-bold text-xl">{error || 'Escrow not found'}</p>
        <Link href="/dashboard" className="text-primary font-bold text-sm hover:underline mt-4 inline-block">Back to Dashboard</Link>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-32 pb-20 px-6 md:px-8 max-w-[1000px] mx-auto">
        <Link href="/dashboard" className="text-sm font-bold text-primary border-b border-primary/20 pb-0.5 hover:border-primary transition-all inline-flex items-center gap-1 mb-8">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-on-surface">Escrow Timeline</h1>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
            escrow.status === 'FUNDED' ? 'bg-tertiary-fixed/20 text-on-tertiary-fixed' :
            escrow.status === 'DISPUTED' ? 'bg-error-container text-on-error-container' :
            'bg-secondary-fixed/20 text-on-secondary-fixed'
          }`}>{escrow.status.replace('_', ' ')}</span>
        </div>

        {actionMessage && (
          <div className={`mb-6 p-4 rounded-xl border-l-4 ${actionMessage.includes('successfully') || actionMessage.includes('Success') ? 'bg-tertiary-fixed/10 border-tertiary-fixed' : 'bg-error-container border-error'}`}>
            <p className="text-sm font-medium">{actionMessage}</p>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-black/5 p-8 md:p-10 mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-8">Transaction Progress</p>
          <div className="relative ml-6">
            {visibleStages.map((stage, i) => {
              const status = getStageStatus(stage);
              const meta = STAGE_META[stage];
              const event = escrow.events.find(e => e.eventType === stage || e.eventType === `ESCROW_${stage}`);
              return (
                <div key={stage} className="relative flex items-start gap-5 pb-10 last:pb-0">
                  {i < visibleStages.length - 1 && (
                    <div className={`absolute left-5 top-10 w-0.5 h-full -ml-[1px] ${lineColor(status)}`} />
                  )}
                  <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${dotColor(status)}`}>
                    <span className="material-symbols-outlined text-xl">{status === 'completed' ? 'check_circle' : meta?.icon || 'circle'}</span>
                  </div>
                  <div className="pt-1.5 flex-1">
                    <p className={`font-bold font-headline text-lg leading-tight ${status === 'upcoming' ? 'text-on-surface-variant/60' : 'text-on-surface'}`}>
                      {meta?.label || stage}
                    </p>
                    <p className="text-xs text-on-surface-variant/60 mt-0.5">
                      {event ? formatDate(event.createdAt) : status === 'completed' ? 'Completed' : status === 'current' ? 'In progress' : 'Pending'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-black/5 p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6">Escrow Details</p>
            <dl className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <dt className="text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-outline">tag</span> Escrow ID
                </dt>
                <dd className="font-mono font-bold text-on-surface text-xs">{escrow.id.slice(0, 12)}...</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-outline">payments</span> Amount
                </dt>
                <dd className="font-bold font-headline text-on-surface">{formatPrice(escrow.amount)}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-outline">calendar_today</span> Created
                </dt>
                <dd className="font-bold text-on-surface">{formatDate(escrow.createdAt)}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-outline">person</span> Buyer
                </dt>
                <dd className="font-bold text-on-surface">{escrow.buyer.name}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-outline">storefront</span> Seller
                </dt>
                <dd className="font-bold text-on-surface">{escrow.seller.name}</dd>
              </div>
            </dl>
          </div>

          <Link href={`/listings/${escrow.listing.id}`} className="bg-surface-container-lowest rounded-2xl ring-1 ring-black/5 overflow-hidden flex flex-col hover:ring-primary/30 transition-all">
            <div className="h-36 bg-surface-container-low flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-outline-variant">landscape</span>
            </div>
            <div className="p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Property</p>
              <p className="font-bold font-headline text-on-surface">{escrow.listing.title}</p>
              <p className="text-sm text-on-surface-variant mt-1">{escrow.listing.city}, {escrow.listing.district}</p>
              <p className="text-lg font-black font-headline text-primary mt-2">{formatPrice(escrow.listing.price)}</p>
            </div>
          </Link>
        </div>

        {/* Event log */}
        {escrow.events.length > 0 && (
          <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-black/5 p-8 mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6">Event Log</p>
            <div className="space-y-3">
              {escrow.events.map(event => (
                <div key={event.id} className="flex items-center gap-4 py-2 border-b border-outline-variant/10 last:border-0">
                  <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                  <div className="flex-1">
                    <span className="text-sm font-bold">{event.eventType.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-on-surface-variant ml-3">{formatDate(event.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dispute info */}
        {escrow.disputes && escrow.disputes.length > 0 && (
          <div className="bg-error-container/30 rounded-2xl ring-1 ring-error/20 p-8 mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-error mb-4">Active Dispute</p>
            <p className="text-sm text-on-surface">{escrow.disputes[0].reason}</p>
            <p className="text-xs text-on-surface-variant mt-2">Status: {escrow.disputes[0].status}</p>
          </div>
        )}

        {/* Actions */}
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-black/5 p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6">Actions</p>

          {showDisputeForm ? (
            <div className="space-y-4">
              <textarea
                value={disputeReason}
                onChange={e => setDisputeReason(e.target.value)}
                placeholder="Describe the reason for the dispute..."
                rows={3}
                className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-outline-variant focus:border-error focus:ring-0 transition-all font-body rounded-lg"
              />
              <div className="flex gap-3">
                <button onClick={handleDispute} disabled={actionLoading === 'dispute' || !disputeReason.trim()}
                  className="px-6 py-3 rounded-lg font-bold text-sm tracking-widest uppercase bg-error text-on-error hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">gavel</span>
                  {actionLoading === 'dispute' ? 'Submitting...' : 'Confirm Dispute'}
                </button>
                <button onClick={() => setShowDisputeForm(false)} className="px-6 py-3 rounded-lg font-bold text-sm text-on-surface-variant hover:bg-surface-container-high transition-all">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              {['CREATED', 'FUNDING_PENDING'].includes(escrow.status) && (
                <button onClick={handleFund} disabled={actionLoading === 'fund'}
                  className="machined-gradient text-white px-8 py-3 rounded-lg font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                  <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
                  {actionLoading === 'fund' ? 'Processing...' : 'Fund Escrow'}
                </button>
              )}
              {!['DISPUTED', 'RELEASED', 'REFUNDED'].includes(escrow.status) && (
                <button onClick={() => setShowDisputeForm(true)}
                  className="px-8 py-3 rounded-lg font-bold text-sm tracking-widest uppercase border-2 border-error text-error hover:bg-error/5 active:scale-95 transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">gavel</span>
                  Open Dispute
                </button>
              )}
              {escrow.status === 'RELEASED' && (
                <p className="text-sm text-tertiary-fixed font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Transaction complete — funds have been released.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
