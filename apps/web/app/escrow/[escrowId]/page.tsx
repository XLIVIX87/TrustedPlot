import Link from 'next/link';

export default function EscrowTimelinePage({ params }: { params: { escrowId: string } }) {
  const stages = [
    { label: 'Created', status: 'completed' },
    { label: 'Funded', status: 'current' },
    { label: 'Pending Resolution', status: 'upcoming' },
    { label: 'Resolved', status: 'upcoming' },
  ];

  return (
    <main className="min-h-screen bg-page">
      <header className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold text-brand-dark">TrustedPlot</Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link href="/dashboard" className="text-sm text-brand-primary hover:underline mb-4 inline-block">&larr; Back to Dashboard</Link>

        <h1 className="text-2xl font-bold text-brand-dark mb-8">Escrow Timeline</h1>

        {/* Timeline */}
        <div className="bg-white rounded-lg border border-border p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            {stages.map((stage, i) => (
              <div key={stage.label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    stage.status === 'completed' ? 'bg-status-success text-white' :
                    stage.status === 'current' ? 'bg-brand-primary text-white' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {i + 1}
                  </div>
                  <span className="text-xs mt-2 text-gray-600">{stage.label}</span>
                </div>
                {i < stages.length - 1 && (
                  <div className={`h-0.5 w-16 mx-2 ${
                    stage.status === 'completed' ? 'bg-status-success' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Escrow Details</h3>
            <dl className="space-y-3 text-sm">
              <div><dt className="text-gray-500">Escrow ID</dt><dd className="font-mono text-brand-dark">{params.escrowId}</dd></div>
              <div><dt className="text-gray-500">Amount</dt><dd className="font-medium text-brand-dark">&#8358;—</dd></div>
              <div><dt className="text-gray-500">Status</dt><dd className="font-medium text-brand-primary">—</dd></div>
            </dl>
          </div>
          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Actions</h3>
            <div className="space-y-3">
              <button className="w-full rounded-md bg-brand-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                Fund Escrow
              </button>
              <button className="w-full rounded-md border border-status-error px-4 py-2.5 text-sm font-medium text-status-error hover:bg-red-50">
                Open Dispute
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
