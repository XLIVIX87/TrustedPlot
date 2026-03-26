import Link from 'next/link';

export default function VerificationQueuePage() {
  return (
    <main className="min-h-screen bg-page">
      <header className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold text-brand-dark">TrustedPlot</Link>
          <nav className="flex items-center gap-6">
            <Link href="/verification" className="text-sm font-medium text-brand-primary">Verification Queue</Link>
            <Link href="/admin" className="text-sm text-gray-600 hover:text-brand-primary">Admin</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">Verification Queue</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-border p-5">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-status-warning mt-1">0</p>
          </div>
          <div className="bg-white rounded-lg border border-border p-5">
            <p className="text-sm text-gray-500">In Review</p>
            <p className="text-2xl font-bold text-brand-primary mt-1">0</p>
          </div>
          <div className="bg-white rounded-lg border border-border p-5">
            <p className="text-sm text-gray-500">Decided Today</p>
            <p className="text-2xl font-bold text-status-success mt-1">0</p>
          </div>
        </div>

        {/* Queue table */}
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Listing</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">SLA Due</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No pending verifications
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
