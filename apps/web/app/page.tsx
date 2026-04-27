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
  media: { url: string }[];
}

const VERIFICATION_TIERS = [
  {
    badge: 'CONDITIONAL',
    icon: 'pending',
    name: 'Conditional',
    tagline: 'Under Review',
    desc: 'Documents submitted and under active review. Survey plans or consent letter pending legal confirmation.',
    features: ['Document submission', 'Basic title check', 'Inspection scheduled'],
    bg: 'bg-slate-50',
    iconColor: 'text-slate-500',
    border: 'border-slate-200',
    dotColor: 'bg-slate-300',
  },
  {
    badge: 'VERIFIED_GREEN',
    icon: 'verified',
    name: 'Green Verified',
    tagline: "R of O Confirmed",
    desc: "Governor's Consent or Right of Occupancy verified. Full legal compliance confirmed by our ops team.",
    features: ["Governor's Consent verified", 'Survey plan cleared', 'On-site inspection done'],
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    border: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
  },
  {
    badge: 'VERIFIED_GOLD',
    icon: 'workspace_premium',
    name: 'Gold Verified',
    tagline: 'C of O Certified',
    desc: 'Certificate of Occupancy confirmed and recorded. Highest tier of legal verification on TrustedPlot.',
    features: ['Certificate of Occupancy', 'Deed of Assignment verified', 'Escrow-ready'],
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    border: 'border-amber-200',
    dotColor: 'bg-amber-500',
  },
];

const PROCESS_STEPS = [
  {
    icon: 'upload_file',
    step: '01',
    title: 'Document Submission',
    desc: 'Sellers upload all title documents — C of O, survey plans, deed of assignment — to the secure portal.',
  },
  {
    icon: 'gavel',
    step: '02',
    title: 'Legal Review',
    desc: 'Our in-house legal ops team manually verifies every document against government records.',
  },
  {
    icon: 'search',
    step: '03',
    title: 'On-Site Inspection',
    desc: 'Certified inspectors physically visit the property and file a signed digital report.',
  },
  {
    icon: 'lock',
    step: '04',
    title: 'Escrow Protection',
    desc: 'Funds are held in structured escrow until all conditions are met and transfer is complete.',
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

      {/* ── Hero — Full Bleed ─────────────────────────────── */}
      <section className="relative min-h-[90vh] flex flex-col justify-end overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1800&q=85&auto=format&fit=crop"
            alt="Premium Nigerian property"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b1f33]/50 via-[#0b1f33]/50 to-[#0b1f33]/92" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b1f33]/30 to-transparent" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 px-6 md:px-12 pb-24 pt-40 max-w-[1440px] mx-auto w-full">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="mb-7 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-2 rounded-full">
              <span className="material-symbols-outlined text-[#fed65b] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <span className="text-white/85 text-[11px] font-bold uppercase tracking-[0.14em]">
                Nigeria&apos;s Trust Infrastructure
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-[76px] font-headline font-black tracking-tight text-white mb-6 leading-[1.0]">
              Verified Land &amp;<br />
              <span style={{ color: '#fed65b' }}>Secured Transactions.</span>
            </h1>

            <p className="text-white/65 text-lg max-w-xl mb-10 leading-relaxed">
              Browse properties with legally verified titles, on-site inspections, and escrow-protected transactions.
            </p>

            {/* Search form */}
            <form onSubmit={handleSearch}
              className="bg-white/10 backdrop-blur-md border border-white/15 p-2 rounded-2xl flex flex-col md:flex-row items-stretch gap-2 max-w-2xl">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
                {[
                  {
                    label: 'Location', icon: 'location_on',
                    el: (
                      <select value={city} onChange={e => setCity(e.target.value)}
                        className="border-0 p-0 focus:ring-0 bg-transparent text-white font-bold w-full text-sm">
                        <option value="" className="text-black bg-white">All Nigeria</option>
                        <option value="Lagos" className="text-black bg-white">Lagos</option>
                        <option value="Abuja" className="text-black bg-white">Abuja</option>
                      </select>
                    ),
                  },
                  {
                    label: 'Asset Type', icon: 'landscape',
                    el: (
                      <select value={propertyType} onChange={e => setPropertyType(e.target.value)}
                        className="border-0 p-0 focus:ring-0 bg-transparent text-white font-bold w-full text-sm">
                        <option value="" className="text-black bg-white">All Types</option>
                        <option value="APARTMENT" className="text-black bg-white">Apartment</option>
                        <option value="HOUSE" className="text-black bg-white">House</option>
                        <option value="LAND" className="text-black bg-white">Land Plot</option>
                        <option value="COMMERCIAL" className="text-black bg-white">Commercial</option>
                      </select>
                    ),
                  },
                  {
                    label: 'Verification', icon: 'workspace_premium',
                    el: (
                      <select value={badge} onChange={e => setBadge(e.target.value)}
                        className="border-0 p-0 focus:ring-0 bg-transparent text-white font-bold w-full text-sm">
                        <option value="" className="text-black bg-white">All Levels</option>
                        <option value="VERIFIED_GOLD" className="text-black bg-white">C of O Gold</option>
                        <option value="VERIFIED_GREEN" className="text-black bg-white">R of O Green</option>
                        <option value="CONDITIONAL" className="text-black bg-white">Conditional</option>
                      </select>
                    ),
                  },
                ].map(field => (
                  <div key={field.label} className="px-5 py-3 flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/45">{field.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-white/50 text-sm shrink-0">{field.icon}</span>
                      {field.el}
                    </div>
                  </div>
                ))}
              </div>
              <button type="submit"
                className="machined-gradient text-white px-8 py-4 rounded-xl font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 shrink-0 hover:opacity-90 active:scale-[0.98] transition-all">
                <span className="material-symbols-outlined text-sm">search</span>
                Search
              </button>
            </form>

            {/* Quick filter chips */}
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { label: 'Gold Verified', href: '/listings?badge=VERIFIED_GOLD', icon: 'workspace_premium' },
                { label: 'Green Verified', href: '/listings?badge=VERIFIED_GREEN', icon: 'verified' },
                { label: 'Lagos', href: '/listings?city=Lagos', icon: 'location_on' },
                { label: 'Abuja', href: '/listings?city=Abuja', icon: 'location_on' },
              ].map(f => (
                <Link key={f.label} href={f.href}
                  className="bg-white/10 backdrop-blur-sm border border-white/15 hover:bg-white/20 text-white/80 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                  {f.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Floating Stats Bar ────────────────────────────── */}
      <div className="px-6 md:px-12 max-w-[1440px] mx-auto">
        <div className="bg-white -mt-8 relative z-20 rounded-2xl shadow-[0_20px_60px_rgba(11,31,51,0.12)] px-8 py-6 flex flex-wrap items-center justify-between gap-6 border border-outline-variant/10 animate-fade-in-up">
          {[
            { icon: 'verified_user', label: 'Verified Listings', value: '11+', color: 'text-amber-500' },
            { icon: 'location_on',   label: 'Active Markets',    value: '2 Cities', color: 'text-emerald-600' },
            { icon: 'gavel',         label: 'Legal Reviews',     value: '100%', color: 'text-blue-600' },
            { icon: 'lock',          label: 'Escrow Protected',  value: 'Always', color: 'text-violet-600' },
            { icon: 'history_edu',   label: 'Audit Trail',       value: 'Immutable', color: 'text-primary' },
          ].map((s, i) => (
            <div key={s.label} className="flex items-center gap-3">
              {i > 0 && <div className="hidden md:block w-px h-10 bg-outline-variant/25 -mr-3" />}
              <span className={`material-symbols-outlined text-2xl ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
              <div>
                <p className="text-xl font-black font-headline text-on-surface leading-none">{s.value}</p>
                <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Verification Tiers ────────────────────────────── */}
      <section className="py-24 px-6 md:px-12 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Label + heading */}
          <div className="lg:col-span-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-3">Verification System</span>
            <h2 className="text-3xl md:text-4xl font-headline font-black tracking-tight mb-4 leading-tight">
              Three Tiers<br />of Trust
            </h2>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
              Every listing on TrustedPlot is assigned a tier based on the depth of legal review completed.
            </p>
            <Link href="/listings"
              className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
              Browse by tier
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          {/* Tier cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {VERIFICATION_TIERS.map((tier, i) => (
              <div key={tier.badge}
                className={`${tier.bg} border ${tier.border} rounded-2xl p-6 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(11,31,51,0.09)] transition-all duration-300 animate-fade-in-up`}
                style={{ animationDelay: `${i * 80}ms` }}>
                <div className={`w-11 h-11 rounded-xl ${tier.bg} border ${tier.border} flex items-center justify-center mb-5 shadow-sm`}>
                  <span className={`material-symbols-outlined text-xl ${tier.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>{tier.icon}</span>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${tier.iconColor} block mb-1`}>{tier.tagline}</span>
                <h3 className="text-base font-headline font-black mb-3">{tier.name}</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-5">{tier.desc}</p>
                <ul className="space-y-1.5">
                  {tier.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs font-medium">
                      <span className={`material-symbols-outlined text-xs mt-0.5 shrink-0 ${tier.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dark Process Section ──────────────────────────── */}
      <section className="bg-primary-container">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-24">
          <div className="mb-16 max-w-2xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-3">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-headline font-black tracking-tight text-white mb-4">
              The TrustedPlot Difference
            </h2>
            <p className="text-white/55 text-sm leading-relaxed">
              Four mandatory steps before any property can be listed or transacted on our platform.
            </p>
          </div>

          {/* Steps grid */}
          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Dashed connector (desktop) */}
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px border-t-2 border-dashed border-white/12 z-0" />

            {PROCESS_STEPS.map((step, i) => (
              <div key={step.step}
                className="relative z-10 flex flex-col items-center text-center px-2 animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center mb-5">
                  <span className="material-symbols-outlined text-2xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>{step.icon}</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35 mb-2">{step.step}</span>
                <h3 className="text-sm font-headline font-bold text-white mb-3">{step.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 flex flex-wrap gap-4">
            <Link href="/auth/signup"
              className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-slate-50 active:scale-[0.98] transition-all">
              Create Account
            </Link>
            <Link href="/listings"
              className="border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-white/8 transition-all">
              Browse Listings
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured Listings ─────────────────────────────── */}
      <section className="py-24 px-6 md:px-12 max-w-[1440px] mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Available Now</span>
            <h2 className="text-3xl font-headline font-black tracking-tight">Featured Listings</h2>
            <p className="text-on-surface-variant text-sm mt-1">Verified properties, ready for inspection and escrow.</p>
          </div>
          <Link href="/listings"
            className="text-primary font-bold text-sm hover:underline flex items-center gap-1 shrink-0">
            View all <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i}>
                <div className="aspect-[4/3] rounded-2xl bg-surface-container-low mb-4" />
                <div className="h-5 bg-surface-container-low rounded w-3/4 mb-2" />
                <div className="h-4 bg-surface-container-low rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.slice(0, 6).map(l => (
              <ListingCard key={l.id} id={l.id} title={l.title} city={l.city} district={l.district}
                price={l.price} propertyType={l.propertyType} bedrooms={l.bedrooms} bathrooms={l.bathrooms}
                badge={l.badge} thumbnailUrl={l.media?.[0]?.url || undefined} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
            <span className="material-symbols-outlined text-5xl text-outline-variant mb-4 block">search</span>
            <p className="font-headline font-bold text-lg mb-2">No verified listings yet</p>
            <p className="text-on-surface-variant text-sm mb-6">Listings will appear here once verified by our legal team.</p>
            <Link href="/listings"
              className="inline-block machined-gradient text-white px-8 py-3 rounded-xl font-bold text-sm tracking-widest uppercase">
              Browse All Listings
            </Link>
          </div>
        )}
      </section>

      {/* ── CTA banner ───────────────────────────────────── */}
      <section className="pb-24 px-6 md:px-12 max-w-[1440px] mx-auto">
        <div className="relative overflow-hidden bg-primary-container rounded-3xl px-10 py-16 md:px-16 flex flex-col md:flex-row items-center justify-between gap-10">
          {/* Background decoration */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/4 pointer-events-none" />
          <div className="absolute -right-8 -bottom-16 w-56 h-56 rounded-full bg-white/3 pointer-events-none" />

          <div className="max-w-xl relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Start Today</p>
            <h2 className="text-3xl md:text-4xl font-headline font-black text-white mb-4 leading-tight">
              Secure Your Legacy with<br />the Digital Ledger.
            </h2>
            <p className="text-white/55 text-sm leading-relaxed">
              Every plot on TrustedPlot undergoes a 4-step verification process ensuring zero risk of litigation or land disputes. Your funds never move without legal clearance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 relative z-10 shrink-0">
            <Link href="/auth/signup"
              className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-slate-50 active:scale-[0.98] transition-all text-center">
              Create Account
            </Link>
            <Link href="/listings"
              className="border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-white/8 transition-all text-center">
              Browse Listings
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
