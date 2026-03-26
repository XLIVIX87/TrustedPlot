import Link from 'next/link';

export default function InspectionsPage() {
  return (
    <main className="min-h-screen bg-page">
      <header className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold text-brand-dark">TrustedPlot</Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-brand-primary">Dashboard</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">My Inspections</h1>

        <div className="bg-white rounded-lg border border-border">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-brand-dark">Upcoming & Past Inspections</h2>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <p className="text-gray-500">No inspections booked yet.</p>
              <Link href="/listings" className="text-brand-primary text-sm hover:underline mt-2 inline-block">
                Browse listings to book an inspection
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
