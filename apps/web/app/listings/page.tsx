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

function ListingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || '');
  const [badge, setBadge] = useState(searchParams.get('badge') || '');
  const [query, setQuery] = useState(searchParams.get('query') || '');

  async function fetchListings(overrides?: { city?: string; propertyType?: string; badge?: string; query?: string }) {
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
        setTotal(data.data.total || data.data.listings?.length || 0);
      }
    } catch { setError('Failed to load listings'); }
    finally { setLoading(false); }
  }

  // Initialize from URL params and fetch
  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    // Update URL to reflect filters
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (propertyType) params.set('propertyType', propertyType);
    if (badge) params.set('badge', badge);
    if (query) params.set('query', query);
    router.replace(`/listings?${params.toString()}`, { scroll: false });
    fetchListings();
  }

  function clearFilters() {
    setCity(''); setPropertyType(''); setBadge(''); setQuery('');
    router.replace('/listings', { scroll: false });
    fetchListings({ city: '', propertyType: '', badge: '', query: '' });
  }

  const hasFilters = city || propertyType || badge || query;

  return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-32 pb-20 px-4 md:px-8 max-w-[1440px] mx-auto">
        <section className="mb-10">
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-on-surface mb-3">
            Property Discovery
          </h1>
          <p className="text-on-surface-variant max-w-2xl text-base leading-relaxed">
            Browse verified listings across Lagos and Abuja with institutional-grade documentation and escrow-ready transactions.
          </p>
        </section>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="bg-surface-container-lowest p-2 rounded-xl shadow-sm flex flex-col md:flex-row items-center gap-2 border border-outline-variant/10">
            {/* Text search */}
            <div className="px-5 py-3 flex items-center gap-2 flex-1 min-w-0">
              <span className="material-symbols-outlined text-outline text-sm shrink-0">search</span>
              <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search by name or description..."
                className="border-0 p-0 focus:ring-0 text-on-surface font-medium bg-transparent w-full text-sm" />
            </div>
            <div className="w-px h-10 bg-outline-variant/20 hidden md:block" />
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
                    <option value="LAND">Land</option>
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
                    <option value="VERIFIED_GOLD">C of O Gold</option>
                    <option value="VERIFIED_GREEN">R of O Green</option>
                    <option value="CONDITIONAL">Conditional</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              {hasFilters && (
                <button type="button" onClick={clearFilters}
                  className="px-4 py-4 bg-surface-container-high text-on-surface-variant rounded-lg font-bold text-sm hover:bg-surface-variant transition-all">
                  Clear
                </button>
              )}
              <button type="submit"
                className="flex-1 md:flex-none machined-gradient text-white px-8 py-4 rounded-lg font-bold flex items-center justify-center gap-2 text-sm tracking-wide">
                <span className="material-symbols-outlined text-sm">tune</span>
                Filter
              </button>
            </div>
          </div>
        </form>

        {/* Results meta */}
        {!loading && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-on-surface-variant">
              {hasFilters
                ? <><strong>{listings.length}</strong> {listings.length === 1 ? 'result' : 'results'} found</>
                : <><strong>{listings.length}</strong> verified {listings.length === 1 ? 'property' : 'properties'}</>
              }
            </p>
            {hasFilters && (
              <div className="flex gap-2 flex-wrap">
                {city && <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">{city}</span>}
                {propertyType && <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full capitalize">{propertyType.toLowerCase()}</span>}
                {badge && <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">{badge.replace('_', ' ')}</span>}
                {query && <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">&ldquo;{query}&rdquo;</span>}
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i}>
                <div className="aspect-[4/3] bg-surface-container-low rounded-xl mb-4" />
                <div className="space-y-3">
                  <div className="h-5 bg-surface-container-high rounded w-3/4" />
                  <div className="h-4 bg-surface-container-high rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 bg-error-container rounded-xl border-l-4 border-error">
            <p className="text-on-error-container font-medium">{error}</p>
            <button onClick={() => fetchListings()} className="text-sm text-primary font-bold hover:underline mt-2">Retry</button>
          </div>
        ) : listings.length === 0 ? (
          <EmptyState
            icon="search"
            title={hasFilters ? 'No results match your filters' : 'No verified properties found'}
            description={hasFilters ? 'Try adjusting or clearing your filters.' : 'Verified listings will appear here as they are approved.'}
            action={hasFilters ? (
              <button onClick={clearFilters}
                className="machined-gradient text-white px-8 py-3 rounded-lg font-bold text-sm tracking-widest uppercase">
                Clear Filters
              </button>
            ) : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map(listing => (
              <ListingCard
                key={listing.id}
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
            ))}
          </div>
        )}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1,2,3].map(i => <div key={i} className="aspect-[4/3] bg-surface-container-low rounded-xl" />)}
          </div>
        </div>
      </main>
    }>
      <ListingsContent />
    </Suspense>
  );
}
