'use client';

import { useState, useEffect } from 'react';
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

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [badge, setBadge] = useState('');

  async function fetchListings() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (city) params.set('city', city);
      if (propertyType) params.set('propertyType', propertyType);
      if (badge) params.set('badge', badge);
      const res = await fetch(`/api/listings?${params}`);
      const data = await res.json();
      if (data.data) setListings(data.data.listings || []);
    } catch { setError('Failed to load listings'); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchListings(); }, []);

  function handleSearch(e: React.FormEvent) { e.preventDefault(); fetchListings(); }

  return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-32 pb-20 px-8 max-w-[1440px] mx-auto">
        <section className="mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-primary mb-4">
            Property Discovery
          </h1>
          <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
            Browse verified listings across Lagos and Abuja with institutional-grade documentation.
          </p>
        </section>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-16">
          <div className="bg-surface-container-lowest p-2 rounded-xl shadow-sm flex flex-col md:flex-row items-center gap-2">
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-outline-variant/20">
              <div className="px-6 py-3 flex flex-col">
                <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Location</span>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">location_on</span>
                  <select value={city} onChange={e => setCity(e.target.value)} className="border-0 p-0 focus:ring-0 text-on-surface font-semibold bg-transparent w-full font-headline">
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
                  <select value={propertyType} onChange={e => setPropertyType(e.target.value)} className="border-0 p-0 focus:ring-0 text-on-surface font-semibold bg-transparent w-full font-headline">
                    <option value="">All Types</option>
                    <option value="APARTMENT">Apartment</option>
                    <option value="HOUSE">House</option>
                    <option value="LAND">Land</option>
                    <option value="COMMERCIAL">Commercial</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-3 flex flex-col">
                <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Verification</span>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary-container">verified_user</span>
                  <select value={badge} onChange={e => setBadge(e.target.value)} className="border-0 p-0 focus:ring-0 text-on-surface font-semibold bg-transparent w-full font-headline">
                    <option value="">All Status</option>
                    <option value="VERIFIED_GOLD">C of O Verified</option>
                    <option value="VERIFIED_GREEN">R of O Verified</option>
                  </select>
                </div>
              </div>
            </div>
            <button type="submit" className="machined-gradient text-white w-full md:w-auto px-10 py-5 rounded-lg font-bold flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">tune</span>
              Discovery
            </button>
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-surface-container rounded-xl mb-4" />
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
            <button onClick={fetchListings} className="text-sm text-primary font-bold hover:underline mt-2">Retry</button>
          </div>
        ) : listings.length === 0 ? (
          <EmptyState
            icon="search"
            title="No verified properties found"
            description="Adjust your filters or check back soon for new listings."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
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
