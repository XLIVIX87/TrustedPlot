import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold text-brand-dark">
            TrustedPlot
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/listings" className="text-sm text-gray-600 hover:text-brand-primary">
              Browse
            </Link>
            <Link
              href="/auth/signin"
              className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-brand-dark">
            Trust-first real estate in Nigeria
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Verified listings, structured inspections, and secure transactions.
            Every property is checked before you commit.
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              href="/listings"
              className="rounded-md bg-brand-primary px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              Browse Verified Properties
            </Link>
          </div>
        </div>
      </section>

      {/* Search/Filter Section */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="rounded-lg border border-border bg-white p-6">
          <h2 className="text-lg font-semibold text-brand-dark mb-4">Find Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <select className="w-full rounded-md border border-border px-3 py-2 text-sm">
                <option value="">All Cities</option>
                <option value="lagos">Lagos</option>
                <option value="abuja">Abuja</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <select className="w-full rounded-md border border-border px-3 py-2 text-sm">
                <option value="">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="land">Land</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
              <select className="w-full rounded-md border border-border px-3 py-2 text-sm">
                <option value="">Any Price</option>
                <option value="0-50m">Under 50M</option>
                <option value="50m-100m">50M - 100M</option>
                <option value="100m-500m">100M - 500M</option>
                <option value="500m+">500M+</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Listing Grid Placeholder */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Empty state */}
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No verified properties found. Adjust your filters or check back soon.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
