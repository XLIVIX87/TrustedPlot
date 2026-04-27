'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { ListingCard } from '@/components/ui/listing-card';
import { EmptyState } from '@/components/ui/empty-state';

interface Listing {
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

const PROPERTY_TYPES = [
  { value: 'APARTMENT', label: 'Apartment', icon: 'apartment' },
  { value: 'HOUSE',     label: 'House',     icon: 'cottage' },
  { value: 'LAND',      label: 'Land Plot', icon: 'landscape' },
  { value: 'COMMERCIAL',label: 'Commercial',icon: 'business' },
];

const BADGE_OPTIONS = [
  { value: 'VERIFIED_GOLD',  label: 'Gold — C of O',   icon: 'workspace_premium', color: 'text-amber-600'   },
  { value: 'VERIFIED_GREEN', label: 'Green — R of O',  icon: 'verified',          color: 'text-emerald-600' },
  { value: 'CONDITIONAL',   label: 'Conditional',     icon: 'pending',           color: 'text-slate-500'   },
];

const CITIES = ['Lagos', 'Abuja'];

function FilterSidebar({
  city, setCity,
  propertyType, setPropertyType,
  badge, setBadge,
  query, setQuery,
  onApply, onClear, hasFilters,
}: {
  city: string; setCity: (v: string) => void;
  propertyType: string; setPropertyType: (v: string) => void;
  badge: string; setBadge: (v: string) => void;
  query: string; setQuery: (v: string) => void;
  onApply: () => void; onClear: () => void;
  hasFilters: boolean;
}) {
  return (
    <aside className="w-full lg:w-72 shrink-0">
      <div className="sticky top-24 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden shadow-[0_4px_20px_rgba(11,31,51,0.04)]">
        {/* Sidebar header */}
        <div className="px-5 py-4 border-b border-outline-variant/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-on-surface-variant">tune</span>
            <span className="text-sm font-bold text-on-surface">Filters</span>
          </div>
          {hasFilters && (
            <button onClick={onClear}
              className="text-xs font-bold text-primary hover:underline">
              Clear all
            </button>
          )}
        </div>

        <div className="p-5 space-y-6">
          {/* Search */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">
              Search
            </label>
            <div className="flex items-center gap-2 bg-surface-container-low rounded-xl px-3 py-2.5 border border-outline-variant/20">
              <span className="material-symbols-outlined text-sm text-on-surface-variant/60">search</span>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onApply()}
                placeholder="Search listings…"
                className="border-0 p-0 bg-transparent text-sm focus:ring-0 w-full text-on-surface placeholder:text-on-surface-variant/40 font-medium"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-3">
              Location
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="city"
                  value=""
                  checked={city === ''}
                  onChange={() => setCity('')}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">All Nigeria</span>
              </label>
              {CITIES.map(c => (
                <label key={c} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="city"
                    value={c}
                    checked={city === c}
                    onChange={() => setCity(c)}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">{c}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-outline-variant/10" />

          {/* Property Type */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-3">
              Property Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="propertyType"
                  value=""
                  checked={propertyType === ''}
                  onChange={() => setPropertyType('')}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">All Types</span>
              </label>
              {PROPERTY_TYPES.map(pt => (
                <label key={pt.value} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="propertyType"
                    value={pt.value}
                    checked={propertyType === pt.value}
                    onChange={() => setPropertyType(pt.value)}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="flex items-center gap-2 text-sm font-medium text-on-surface group-hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-xs text-on-surface-variant/60">{pt.icon}</span>
                    {pt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-outline-variant/10" />

          {/* Verification Tier */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-3">
              Verification Tier
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="badge"
                  value=""
                  checked={badge === ''}
                  onChange={() => setBadge('')}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">All Levels</span>
              </label>
              {BADGE_OPTIONS.map(opt => (
                <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="badge"
                    value={opt.value}
                    checked={badge === opt.value}
                    onChange={() => setBadge(opt.value)}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className={`flex items-center gap-2 text-sm font-medium text-on-surface group-hover:text-primary transition-colors`}>
                    <span className={`material-symbols-outlined text-xs ${opt.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{opt.icon}</span>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Apply button */}
          <button
            onClick={onApply}
            className="w-full machined-gradient text-white py-3 rounded-xl font-bold text-sm tracking-widest uppercase hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">search</span>
            Apply Filters
          </button>
        </div>
      </div>
    </aside>
  );
}

function ListingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [listings, setListings]   = useState<Listing[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [city, setCity]           = useState(searchParams.get('city') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || '');
  const [badge, setBadge]         = useState(searchParams.get('badge') || '');
  const [query, setQuery]         = useState(searchParams.get('query') || '');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function fetchListings(overrides?: Partial<{ city: string; propertyType: string; badge: string; query: string }>) {
    setLoading(true);
    setError('');
    const c = overrides?.city ?? city;
    const p = overrides?.propertyType ?? propertyType;
    const b = overrides?.badge ?? badge;
    const q = overrides?.query ?? query;
    try {
      const params = new URLSearchParams();
      if (c) params.set('city', c);
      if (p) params.set('propertyType', p);
      if (b) params.set('badge', b);
      if (q) params.set('query', q);
      const res = await fetch(`/api/listings?${params}`);
      const data = await res.json();
      if (data.data) {
        setListings(data.data.listings || []);
      }
    } catch { setError('Failed to load listings'); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchListings(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  function handleApply() {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (propertyType) params.set('propertyType', propertyType);
    if (badge) params.set('badge', badge);
    if (query) params.set('query', query);
    router.replace(`/listings?${params.toString()}`, { scroll: false });
    fetchListings();
    setSidebarOpen(false);
  }

  function handleClear() {
    setCity(''); setPropertyType(''); setBadge(''); setQuery('');
    router.replace('/listings', { scroll: false });
    fetchListings({ city: '', propertyType: '', badge: '', query: '' });
  }

  const hasFilters = !!(city || propertyType || badge || query);

  // Active filter chips for display
  const activeChips = [
    city && { label: city, key: 'city' },
    propertyType && { label: propertyType.charAt(0) + propertyType.slice(1).toLowerCase(), key: 'propertyType' },
    badge && { label: badge.replace('_', ' '), key: 'badge' },
    query && { label: `"${query}"`, key: 'query' },
  ].filter(Boolean) as { label: string; key: string }[];

  const sidebarProps = { city, setCity, propertyType, setPropertyType, badge, setBadge, query, setQuery, onApply: handleApply, onClear: handleClear, hasFilters };

  return (
    <main className="min-h-screen bg-surface">
      <Navbar />

      <div className="pt-28 pb-20 px-4 md:px-8 max-w-[1440px] mx-auto">
        {/* Page header */}
        <section className="mb-8 animate-fade-in-up">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Browse</p>
              <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-on-surface mb-2">
                Property Discovery
              </h1>
              <p className="text-on-surface-variant max-w-xl text-sm leading-relaxed">
                Verified listings across Lagos and Abuja with institutional-grade documentation and escrow-ready transactions.
              </p>
            </div>
            {/* Mobile filter toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden flex items-center gap-2 px-5 py-2.5 bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-sm font-bold">
              <span className="material-symbols-outlined text-sm">tune</span>
              Filters
              {hasFilters && (
                <span className="w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeChips.length}
                </span>
              )}
            </button>
          </div>

          {/* Active chips */}
          {hasFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {activeChips.map(chip => (
                <span key={chip.key} className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  {chip.label}
                </span>
              ))}
              <button onClick={handleClear} className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors px-2 py-1">
                Clear all
              </button>
            </div>
          )}
        </section>

        {/* Two-column layout */}
        <div className="flex gap-8 items-start">
          {/* Sidebar — desktop always visible, mobile conditionally */}
          <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-full lg:w-72 shrink-0`}>
            <FilterSidebar {...sidebarProps} />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Results count */}
            {!loading && !error && (
              <p className="text-sm text-on-surface-variant mb-5">
                <strong className="text-on-surface">{listings.length}</strong>{' '}
                {hasFilters ? 'results found' : 'verified properties'}
              </p>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i}>
                    <div className="aspect-[4/3] bg-surface-container-low rounded-2xl mb-4" />
                    <div className="h-5 bg-surface-container-high rounded w-3/4 mb-2" />
                    <div className="h-4 bg-surface-container-high rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-6 bg-error-container rounded-xl border-l-4 border-error">
                <p className="text-on-error-container font-medium">{error}</p>
                <button onClick={() => fetchListings()} className="text-sm text-primary font-bold hover:underline mt-2">
                  Retry
                </button>
              </div>
            ) : listings.length === 0 ? (
              <EmptyState
                icon="search"
                title={hasFilters ? 'No results match your filters' : 'No verified properties found'}
                description={hasFilters ? 'Try adjusting or clearing your filters.' : 'Verified listings will appear here as they are approved.'}
                action={hasFilters ? (
                  <button onClick={handleClear}
                    className="machined-gradient text-white px-8 py-3 rounded-xl font-bold text-sm tracking-widest uppercase">
                    Clear Filters
                  </button>
                ) : undefined}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map((listing, i) => (
                  <div key={listing.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
                    <ListingCard
                      id={listing.id}
                      title={listing.title}
                      city={listing.city}
                      district={listing.district}
                      price={listing.price}
                      propertyType={listing.propertyType}
                      bedrooms={listing.bedrooms}
                      bathrooms={listing.bathrooms}
                      badge={listing.badge}
                      thumbnailUrl={listing.media?.[0]?.url}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-surface">
        <div className="pt-32 px-8 max-w-[1440px] mx-auto animate-pulse">
          <div className="h-10 bg-surface-container-low rounded w-1/3 mb-4" />
          <div className="h-5 bg-surface-container-low rounded w-1/2 mb-12" />
          <div className="flex gap-8">
            <div className="w-72 shrink-0 h-96 bg-surface-container-low rounded-2xl" />
            <div className="flex-1 grid grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="aspect-[4/3] bg-surface-container-low rounded-2xl" />)}
            </div>
          </div>
        </div>
      </main>
    }>
      <ListingsContent />
    </Suspense>
  );
}
