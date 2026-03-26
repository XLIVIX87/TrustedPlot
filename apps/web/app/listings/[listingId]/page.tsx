import Link from 'next/link';

export default function ListingDetailPage({ params }: { params: { listingId: string } }) {
  return (
    <main className="min-h-screen bg-page">
      <header className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold text-brand-dark">TrustedPlot</Link>
          <nav className="flex items-center gap-4">
            <Link href="/listings" className="text-sm text-gray-600 hover:text-brand-primary">Browse</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Back link */}
        <Link href="/listings" className="text-sm text-brand-primary hover:underline mb-4 inline-block">&larr; Back to listings</Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image placeholder */}
            <div className="aspect-video bg-gray-100 rounded-lg border border-border flex items-center justify-center">
              <span className="text-gray-400">Property Images</span>
            </div>

            {/* Details */}
            <div className="bg-white rounded-lg border border-border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-brand-dark">Loading...</h1>
                  <p className="text-gray-500 mt-1">Lagos, Lekki</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  Unverified
                </span>
              </div>
              <div className="border-t border-border pt-4">
                <h2 className="text-lg font-semibold text-brand-dark mb-2">Description</h2>
                <p className="text-gray-600 text-sm leading-relaxed">Property description will appear here.</p>
              </div>
              <div className="border-t border-border pt-4 mt-4">
                <h2 className="text-lg font-semibold text-brand-dark mb-3">Details</h2>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div><dt className="text-gray-500">Property Type</dt><dd className="font-medium">—</dd></div>
                  <div><dt className="text-gray-500">Listing Type</dt><dd className="font-medium">—</dd></div>
                  <div><dt className="text-gray-500">Bedrooms</dt><dd className="font-medium">—</dd></div>
                  <div><dt className="text-gray-500">Bathrooms</dt><dd className="font-medium">—</dd></div>
                </dl>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-border p-6">
              <p className="text-3xl font-bold text-brand-dark">&#8358;—</p>
              <p className="text-sm text-gray-500 mt-1">Price</p>
              <div className="mt-6 space-y-3">
                <button className="w-full rounded-md bg-brand-primary px-4 py-3 text-sm font-medium text-white hover:bg-blue-700">
                  Unlock Documents
                </button>
                <button className="w-full rounded-md border border-brand-primary px-4 py-3 text-sm font-medium text-brand-primary hover:bg-blue-50">
                  Book Inspection
                </button>
                <button className="w-full rounded-md border border-border px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Start Escrow
                </button>
              </div>
            </div>

            {/* Seller info */}
            <div className="bg-white rounded-lg border border-border p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Seller</h3>
              <p className="font-medium text-brand-dark">—</p>
              <p className="text-sm text-gray-500">Seller type</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
