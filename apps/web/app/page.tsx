import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-surface font-body text-on-surface">
      <Navbar />

      <div className="pt-24 md:pt-32 pb-20 px-4 md:px-8 max-w-[1440px] mx-auto">
        {/* Discovery Header */}
        <section className="mb-12">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-headline font-extrabold tracking-tight text-primary mb-4">
            Verified Land <br />
            <span className="text-on-surface-variant">Architecture.</span>
          </h1>
          <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
            The institutional ledger for high-value real estate. Browse land plots with verified legal chains of custody and digital architectural blueprints.
          </p>
        </section>

        {/* Search & Filter Bar */}
        <section className="mb-16">
          <div className="bg-surface-container-lowest p-2 rounded-xl shadow-sm flex flex-col md:flex-row items-center gap-2">
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-outline-variant/20">
              <div className="px-6 py-3 flex flex-col">
                <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Location</span>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">location_on</span>
                  <select className="border-0 p-0 focus:ring-0 text-on-surface font-semibold bg-transparent w-full font-headline">
                    <option value="">All Nigeria</option>
                    <option value="Lagos">Lagos</option>
                    <option value="Abuja">Abuja</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-3 flex flex-col">
                <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Asset Type</span>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">landscape</span>
                  <select className="border-0 p-0 focus:ring-0 text-on-surface font-semibold bg-transparent w-full font-headline">
                    <option value="">All Types</option>
                    <option value="APARTMENT">Residential</option>
                    <option value="HOUSE">House</option>
                    <option value="LAND">Land Plot</option>
                    <option value="COMMERCIAL">Commercial</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-3 flex flex-col">
                <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Status</span>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary-container">verified_user</span>
                  <select className="border-0 p-0 focus:ring-0 text-on-surface font-semibold bg-transparent w-full font-headline">
                    <option value="">All Status</option>
                    <option value="VERIFIED_GOLD">C of O Verified</option>
                    <option value="VERIFIED_GREEN">R of O Verified</option>
                    <option value="">Escrow Ready</option>
                  </select>
                </div>
              </div>
            </div>
            <Link
              href="/listings"
              className="machined-gradient text-white w-full md:w-auto px-10 py-5 rounded-lg font-bold flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">tune</span>
              Discovery
            </Link>
          </div>

          {/* Filter Chips */}
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="bg-primary text-white px-5 py-2 rounded-full text-xs font-bold tracking-wide flex items-center gap-2">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              Highly Verified
            </button>
            <button className="bg-surface-container-high text-on-surface px-5 py-2 rounded-full text-xs font-bold tracking-wide hover:bg-surface-variant transition-colors">
              Escrow Ready
            </button>
            <button className="bg-surface-container-high text-on-surface px-5 py-2 rounded-full text-xs font-bold tracking-wide hover:bg-surface-variant transition-colors">
              Immediate Allocation
            </button>
            <button className="bg-surface-container-high text-on-surface px-5 py-2 rounded-full text-xs font-bold tracking-wide hover:bg-surface-variant transition-colors">
              Architectural Plans Included
            </button>
          </div>
        </section>

        {/* Placeholder Listings */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-32">
          {/* These will be populated dynamically on /listings page */}
          <div className="col-span-full text-center py-16">
            <span className="material-symbols-outlined text-5xl text-outline-variant mb-4 block">search</span>
            <p className="font-headline font-bold text-lg text-on-surface">Discover Verified Properties</p>
            <p className="text-on-surface-variant text-sm mt-2">Use the search bar above or browse all listings.</p>
            <Link
              href="/listings"
              className="inline-block mt-6 machined-gradient text-white px-8 py-3 rounded-lg font-bold text-sm tracking-widest uppercase"
            >
              Browse All Listings
            </Link>
          </div>
        </section>

        {/* CTA Section (Asymmetric Bento) */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          <div className="md:col-span-7 bg-primary-container p-12 rounded-2xl flex flex-col justify-center">
            <h2 className="text-4xl font-headline font-black text-white mb-6 leading-tight">
              Secure Your Legacy with The Digital Ledger.
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-lg">
              Every plot on TrustedPlot undergoes a 4-step verification process, ensuring zero risk of litigation or land disputes.
            </p>
            <div className="flex gap-4">
              <Link
                href="/auth/signup"
                className="bg-white text-primary px-8 py-3 rounded-lg font-bold text-sm tracking-widest uppercase hover:bg-slate-100 transition-all"
              >
                Start Acquisition
              </Link>
              <Link
                href="/listings"
                className="border border-white/20 text-white px-8 py-3 rounded-lg font-bold text-sm tracking-widest uppercase hover:bg-white/5 transition-all"
              >
                Learn About Escrow
              </Link>
            </div>
          </div>
          <div className="md:col-span-5 relative overflow-hidden rounded-2xl min-h-[400px] bg-surface-container-high">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <span className="bg-secondary text-on-secondary-fixed px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">
                Featured Partnership
              </span>
              <p className="text-lg font-headline font-bold">Verified Architect Guild</p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
