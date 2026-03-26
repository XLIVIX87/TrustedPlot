import Link from 'next/link';
import { Navbar } from '@/components/ui/navbar';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />

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
            <Link
              href="/auth/signup"
              className="rounded-md border border-border px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              List Your Property
            </Link>
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-lg border border-border bg-white p-6">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-status-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-brand-dark">Verified Listings</h3>
            <p className="text-sm text-gray-500 mt-2">Every property goes through document verification and badge assignment before buyers see it.</p>
          </div>
          <div className="rounded-lg border border-border bg-white p-6">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-brand-dark">Structured Inspections</h3>
            <p className="text-sm text-gray-500 mt-2">Book inspections with qualified inspectors. Receive standardized reports you can trust.</p>
          </div>
          <div className="rounded-lg border border-border bg-white p-6">
            <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-status-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-brand-dark">Secure Escrow</h3>
            <p className="text-sm text-gray-500 mt-2">Funds are held safely until all conditions are met. Track every step of your transaction.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
