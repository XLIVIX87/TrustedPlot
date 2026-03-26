import Link from 'next/link';

export default function AuditLogPage() {
  return (
    <main className="min-h-screen bg-page">
      <header className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold text-brand-dark">TrustedPlot</Link>
          <nav className="flex items-center gap-6">
            <Link href="/admin" className="text-sm text-gray-600 hover:text-brand-primary">Admin</Link>
            <Link href="/admin/audit" className="text-sm font-medium text-brand-primary">Audit Log</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">Audit Log</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
              <select className="w-full rounded-md border border-border px-3 py-2 text-sm">
                <option value="">All Actions</option>
                <option value="LISTING_CREATED">Listing Created</option>
                <option value="VERIFICATION_DECISION">Verification Decision</option>
                <option value="ESCROW_CREATED">Escrow Created</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
              <select className="w-full rounded-md border border-border px-3 py-2 text-sm">
                <option value="">All Entities</option>
                <option value="Listing">Listing</option>
                <option value="VerificationCase">Verification</option>
                <option value="EscrowCase">Escrow</option>
              </select>
            </div>
            <div className="md:col-span-2 flex items-end">
              <button className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Filter</button>
            </div>
          </div>
        </div>

        {/* Log table */}
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actor</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No audit logs found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
