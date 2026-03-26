import Link from 'next/link';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-page">
      <header className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold text-brand-dark">TrustedPlot</Link>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-brand-primary">Dashboard</Link>
            <Link href="/dashboard/listings/new" className="text-sm text-gray-600 hover:text-brand-primary">New Listing</Link>
            <Link href="/listings" className="text-sm text-gray-600 hover:text-brand-primary">Browse</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-brand-dark">Seller Dashboard</h1>
          <Link href="/dashboard/listings/new" className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            + New Listing
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Listings', value: '0' },
            { label: 'Verified', value: '0' },
            { label: 'Pending Verification', value: '0' },
            { label: 'Inspections', value: '0' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg border border-border p-5">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-brand-dark mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Listings table */}
        <div className="bg-white rounded-lg border border-border">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-brand-dark">My Listings</h2>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <p className="text-gray-500">No listings yet.</p>
              <Link href="/dashboard/listings/new" className="text-brand-primary text-sm hover:underline mt-2 inline-block">
                Create your first listing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
