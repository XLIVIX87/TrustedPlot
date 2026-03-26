import Link from 'next/link';

export default function ListingsPage() {
  return (
    <main className="min-h-screen bg-page">
      <header className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold text-brand-dark">TrustedPlot</Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-brand-primary">Dashboard</Link>
            <Link href="/auth/signin" className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Sign In</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">Browse Properties</h1>

        {/* Filters */}
        <div className="rounded-lg border border-border bg-white p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <select className="w-full rounded-md border border-border px-3 py-2 text-sm">
                <option value="">All Cities</option>
                <option value="lagos">Lagos</option>
                <option value="abuja">Abuja</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select className="w-full rounded-md border border-border px-3 py-2 text-sm">
                <option value="">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="land">Land</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
              <select className="w-full rounded-md border border-border px-3 py-2 text-sm">
                <option value="">Any Status</option>
                <option value="verified_gold">Verified Gold</option>
                <option value="verified_green">Verified Green</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
              <select className="w-full rounded-md border border-border px-3 py-2 text-sm">
                <option value="">Any Price</option>
                <option value="0-50m">Under 50M</option>
                <option value="50m-100m">50M - 100M</option>
                <option value="100m+">100M+</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Search</button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="col-span-full text-center py-16">
            <div className="text-gray-400 mb-2">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <p className="text-gray-500 font-medium">No verified properties found</p>
            <p className="text-sm text-gray-400 mt-1">Adjust your filters or check back soon.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
