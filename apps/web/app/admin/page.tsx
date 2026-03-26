import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-page">
      <header className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold text-brand-dark">TrustedPlot</Link>
          <nav className="flex items-center gap-6">
            <Link href="/admin" className="text-sm font-medium text-brand-primary">Admin</Link>
            <Link href="/verification" className="text-sm text-gray-600 hover:text-brand-primary">Verification</Link>
            <Link href="/admin/audit" className="text-sm text-gray-600 hover:text-brand-primary">Audit Log</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold text-brand-dark mb-8">Admin Dashboard</h1>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Users', value: '0', color: 'text-brand-dark' },
            { label: 'Total Listings', value: '0', color: 'text-brand-dark' },
            { label: 'Pending Verifications', value: '0', color: 'text-status-warning' },
            { label: 'Active Escrows', value: '0', color: 'text-brand-primary' },
            { label: 'Open Disputes', value: '0', color: 'text-status-error' },
          ].map((m) => (
            <div key={m.label} className="bg-white rounded-lg border border-border p-5">
              <p className="text-sm text-gray-500">{m.label}</p>
              <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-lg border border-border">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-brand-dark">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <p className="text-gray-500">No recent activity.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
