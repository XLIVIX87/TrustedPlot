import Link from 'next/link';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';

export default function InspectionsPage() {
  return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-32 pb-20 px-8 max-w-[1440px] mx-auto">
        {/* Page header */}
        <section className="mb-12">
          <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-on-surface mb-2">
            My Inspections
          </h1>
          <p className="text-on-surface-variant max-w-2xl">
            Track upcoming and completed property inspections across your portfolio.
          </p>
        </section>

        {/* Inspections card */}
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-black/5 overflow-hidden">
          <div className="px-8 py-5 border-b border-outline-variant/30 flex items-center justify-between">
            <h2 className="text-lg font-bold font-headline tracking-tight text-on-surface">Upcoming &amp; Past Inspections</h2>
          </div>

          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant">event_busy</span>
            </div>
            <p className="text-lg font-bold font-headline text-on-surface mb-2">No inspections booked yet</p>
            <p className="text-sm text-on-surface-variant mb-6 max-w-md">
              Browse verified listings to schedule your first on-site inspection with a trusted agent.
            </p>
            <Link
              href="/listings"
              className="machined-gradient text-white px-8 py-3 rounded-lg font-bold text-sm tracking-widest uppercase inline-flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-sm">search</span>
              Browse Listings
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
