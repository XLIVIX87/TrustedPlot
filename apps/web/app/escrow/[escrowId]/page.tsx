import Link from 'next/link';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';

export default function EscrowTimelinePage({ params }: { params: { escrowId: string } }) {
  const stages = [
    { label: 'Created', status: 'completed', icon: 'check_circle' },
    { label: 'Funded', status: 'current', icon: 'hourglass_empty' },
    { label: 'Pending Resolution', status: 'upcoming', icon: 'description' },
    { label: 'Resolved', status: 'upcoming', icon: 'payments' },
  ];

  function dotColor(status: string) {
    if (status === 'completed') return 'bg-tertiary-fixed text-on-tertiary-fixed';
    if (status === 'current') return 'bg-secondary-fixed text-on-secondary-fixed';
    return 'bg-surface-container-high text-on-surface-variant';
  }

  function lineColor(status: string) {
    if (status === 'completed') return 'bg-tertiary-fixed';
    return 'bg-surface-container-high';
  }

  return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-32 pb-20 px-8 max-w-[1000px] mx-auto">
        {/* Back link */}
        <Link href="/dashboard" className="text-sm font-bold text-primary border-b border-primary/20 pb-0.5 hover:border-primary transition-all inline-flex items-center gap-1 mb-8">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Dashboard
        </Link>

        {/* Page header */}
        <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-on-surface mb-10">
          Escrow Timeline
        </h1>

        {/* Vertical timeline */}
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-black/5 p-8 md:p-10 mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-8">Transaction Progress</p>

          <div className="relative ml-6">
            {stages.map((stage, i) => (
              <div key={stage.label} className="relative flex items-start gap-5 pb-10 last:pb-0">
                {/* Vertical line */}
                {i < stages.length - 1 && (
                  <div className={`absolute left-5 top-10 w-0.5 h-full -ml-[1px] ${lineColor(stage.status)}`} />
                )}
                {/* Dot */}
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${dotColor(stage.status)}`}>
                  <span className="material-symbols-outlined text-xl">{stage.icon}</span>
                </div>
                {/* Content */}
                <div className="pt-1.5">
                  <p className={`font-bold font-headline text-lg leading-tight ${
                    stage.status === 'completed' ? 'text-on-surface' :
                    stage.status === 'current' ? 'text-on-surface' :
                    'text-on-surface-variant/60'
                  }`}>
                    {stage.label}
                  </p>
                  <p className="text-xs text-on-surface-variant/60 mt-0.5">
                    {stage.status === 'completed' ? 'Completed' : stage.status === 'current' ? 'In progress' : 'Pending'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Details bento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Escrow details card */}
          <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-black/5 p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6">Escrow Details</p>
            <dl className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <dt className="text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-outline">tag</span>
                  Escrow ID
                </dt>
                <dd className="font-mono font-bold text-on-surface">{params.escrowId}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-outline">payments</span>
                  Amount
                </dt>
                <dd className="font-bold font-headline text-on-surface">&#8358;&mdash;</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-outline">info</span>
                  Status
                </dt>
                <dd className="font-bold text-primary">&mdash;</dd>
              </div>
            </dl>
          </div>

          {/* Property summary placeholder */}
          <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-black/5 overflow-hidden flex flex-col">
            <div className="h-36 bg-surface-container-low flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-outline-variant">landscape</span>
            </div>
            <div className="p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Property</p>
              <p className="font-bold font-headline text-on-surface">Linked property details will appear here.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 bg-surface-container-lowest rounded-2xl ring-1 ring-black/5 p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6">Actions</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="machined-gradient text-white px-8 py-3 rounded-lg font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
              Fund Escrow
            </button>
            <button className="px-8 py-3 rounded-lg font-bold text-sm tracking-widest uppercase border-2 border-error text-error hover:bg-error/5 active:scale-95 transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">gavel</span>
              Open Dispute
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
