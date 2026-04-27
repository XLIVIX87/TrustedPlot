'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { ListingCard } from '@/components/ui/listing-card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface FeaturedListing {
  id: string;
  title: string;
  city: string;
  district: string;
  price: string;
  propertyType: string;
  bedrooms: number | null;
  bathrooms: number | null;
  badge: string;
  thumbnailUrl: string | null;
}

const TRUST_PILLARS = [
  {
    icon: 'verified_user',
    title: 'Legal Verification',
    desc: 'Every listing passes a multi-step document review by our in-house legal ops team — C of O, survey plans, deed of assignment.',
  },
  {
    icon: 'search',
    title: 'On-Site Inspection',
    desc: 'Trained inspectors physically visit each property and submit a signed digital report attached permanently to the ledger.',
  },
  {
    icon: 'lock',
    title: 'Escrow Protection',
    desc: 'Funds are held in structured escrow until all conditions are met. No direct transfers, no exposure to fraud.',
  },
  {
    icon: 'history_edu',
    title: 'Immutable Ledger',
    desc: 'Every action — verification, inspection, payment, dispute — is permanently recorded in the audit trail.',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [listings, setListings] = useState<FeaturedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [badge, setBadge] = useState('');

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch('/api/listings?pageSize=6&page=1');
        const data = await res.json();
        if (data.data?.listings) setListings(data.data.listings);
      } catch {/* ignore */} finally { setLoading(false); }
    }
    fetchFeatured();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (propertyType) params.set('propertyType', propertyType);
    if (badge) params.set('badge', badge);
    router.push(`/listings?${params.toString()}`);
  }

  return (
    <main className="min-h-screen bg-surface font-body text-on-surface">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 md:px-8 max-w-[1440px] mx-auto">
        <div className="mb-4 flex items-center gap-2">
          <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
            Nigeria&apos;s Trust Infrastructure
          </span>
        </div>
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-headline font-extrabold tracking-tight text-on-surface mb-6 max-w-4xl leading-[1.05]">
          Verified Land &amp;<br />
          <span className="text-primary">Secured Transactions.</span>
        </h1>
        <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed mb-10">
          Browse properties with legally verified titles, on-site inspections, and escrow-protected transactions.
          Every listing on TrustedPlot has passed a multi-step trust chain.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="bg-surface-container-lowest p-2 rounded-xl shadow-sm flex flex-col md:flex-row items-center gap-2 max-w-4xl">
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-outline-variant/20">
            <div className="px-5 py-3 flex flex-col">
              <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Location</span>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-sm">location_on</span>
                <select value={city} onChange={e => setCity(e.target.value)}
                  className="border-0 p-0 focus:ring-0 text-on-surface font-semibold bg-transparent w-full font-headline text-sm">
                  <option value="">All Nigeria</option>
                  <option value="Lagos">Lagos</option>
                  <option value="Abuja">Abuja</option>
                </select>
              </div>
            </div>
            <div className="px-5 py-3 flex flex-col">
              <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Asset Type</span>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">landscape</span>
                <select value={propertyType} onChange={e => setPropertyType(e.target.value)}
                  className="border-0 p-0 focus:ring-0 text-on-surface font-semibold bg-transparent w-full font-headline text-sm">
                  <option value="">All Types</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOUSE">House</option>
                  <option value="LAND">Land Plot</option>
                  <option value="COMMERCIAL">Commercial</option>
                </select>
              </div>
            </div>
            <div className="px-5 py-3 flex flex-col">
              <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Verification</span>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-sm">verified_user</span>
                <select value={badge} onChange={e => setBadge(e.target.value)}
                  className="border-0 p-0 focus:ring-0 text-on-surface font-semibold bg-transparent w-full font-headline text-sm">
                  <option value="">All Levels</option>
                  <option value="VERIFIED_GOLD">C of O Verified (Gold)</option>
                  <option value="VERIFIED_GREEN">R of O Verified (Green)</option>
                  <option value="CONDITIONAL">Conditional</option>
                </select>
              </div>
            </div>
          </div>
          <button type="submit"
            className="machined-gradient text-white w-full md:w-auto px-10 py-4 rounded-lg font-bold flex items-center justify-center gap-2 text-sm tracking-wide shrink-0">
            <span className="material-symbols-outlined text-sm">search</span>
            Search
          </button>
        </form>

        {/* Quick filters */}
        <div className="mt-6 flex flex-wrap gap-3">
          {[
            { label: 'Gold Verified', params: '?badge=VERIFIED_GOLD' },
            { label: 'Green Verified', params: '?badge=VERIFIED_GREEN' },
            { label: 'Lagos', params: '?city=Lagos' },
            { label: 'Abuja', params: '?city=Abuja' },
            { label: 'Land Plots', params: '?propertyType=LAND' },
            { label: 'Apartments', params: '?propertyType=APARTMENT' },
          ].map(f => (
            <Link key={f.label} href={`/listings${f.params}`}
              className="bg-surface-container-high text-on-surface px-5 py-2 rounded-full text-xs font-bold tracking-wide hover:bg-surface-variant transition-colors">
              {f.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured listings */}
      <section className="pb-20 px-4 md:px-8 max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-headline font-extrabold tracking-tight">Featured Listings</h2>
            <p className="text-sm text-on-surface-variant mt-1">Verified properties, ready for inspection and escrow.</p>
          </div>
          <Link href="/listings" className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
            View all <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="space-y-3">
                <div className="aspect-[4/3] rounded-xl bg-surface-container-low" />
                <div className="h-5 bg-surface-container-low rounded w-3/4" />
                <div className="h-4 bg-surface-container-low rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map(l => (
              <ListingCard key={l.id} id={l.id} title={l.title} city={l.city} district={l.district}
                price={l.price} propertyType={l.propertyType} bedrooms={l.bedrooms} bathrooms={l.bathrooms}
                badge={l.badge} thumbnailUrl={l.thumbnailUrl || undefined} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-outline-variant mb-4 block">search</span>
            <p className="font-headline font-bold text-lg">No verified listings yet</p>
            <Link href="/listings" className="inline-block mt-4 machined-gradient text-white px-8 py-3 rounded-lg font-bold text-sm tracking-widest uppercase">
              Browse All Listings
            </Link>
          </div>
        )}
      </section>

      {/* Trust pillars */}
      <section className="pb-20 px-4 md:px-8 max-w-[1440px] mx-auto">
        <div className="mb-10">
          <h2 className="text-2xl font-headline font-extrabold tracking-tight mb-2">How TrustedPlot Works</h2>
          <p className="text-sm text-on-surface-variant max-w-xl">Four layers of trust infrastructure built into every transaction.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_PILLARS.map((p, i) => (
            <div key={p.title} className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary">{p.icon}</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">Step {i + 1}</span>
              <h3 className="font-headline font-bold mb-2">{p.title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 px-4 md:px-8 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          <div className="md:col-span-7 bg-primary-container p-12 rounded-2xl flex flex-col justify-center">
            <h2 className="text-4xl font-headline font-black text-white mb-4 leading-tight">
              Secure Your Legacy with The Digital Ledger.
            </h2>
            <p className="text-white/70 text-base mb-8 max-w-lg leading-relaxed">
              Every plot on TrustedPlot undergoes a 4-step verification process ensuring zero risk of litigation or land disputes.
              Your funds never move without legal clearance.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/auth/signup"
                className="bg-white text-primary px-8 py-3 rounded-lg font-bold text-sm tracking-widest uppercase hover:bg-slate-100 transition-all">
                Create Account
              </Link>
              <Link href="/listings"
                className="border border-white/20 text-white px-8 py-3 rounded-lg font-bold text-sm tracking-widest uppercase hover:bg-white/5 transition-all">
                Browse Listings
              </Link>
            </div>
          </div>
          <div className="md:col-span-5 relative overflow-hidden rounded-2xl min-h-[360px] bg-surface-container">
            <img
              src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80&auto=format&fit=crop"
              alt="Property"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <span className="bg-secondary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-3 inline-block">
                Escrow Protected
              </span>
              <p className="text-xl font-headline font-extrabold leading-tight">Inspect Before You Commit.<br />Pay Only When You&apos;re Sure.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
