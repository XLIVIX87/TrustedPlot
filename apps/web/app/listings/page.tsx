'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/ui/navbar';
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

  async function fetchListings() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (city) params.set('city', city);
      if (propertyType) params.set('propertyType', propertyType);

      const res = await fetch(`/api/listings?${params}`);
      const data = await res.json();

      if (data.data) {
        setListings(data.data.listings || []);
      }
    } catch {
      setError('Failed to load listings');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchListings();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchListings();
  }

  return (
    <main className="min-h-screen bg-page">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">Browse Properties</h1>

        {/* Filters */}
        <form onSubmit={handleSearch} className="rounded-lg border border-border bg-white p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-md border border-border px-3 py-2 text-sm">
                <option value="">All Cities</option>
                <option value="Lagos">Lagos</option>
                <option value="Abuja">Abuja</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="w-full rounded-md border border-border px-3 py-2 text-sm">
                <option value="">All Types</option>
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">House</option>
                <option value="LAND">Land</option>
                <option value="COMMERCIAL">Commercial</option>
              </select>
            </div>
            <div className="md:col-span-2 flex items-end">
              <button type="submit" className="rounded-md bg-brand-primary px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Search
              </button>
            </div>
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-border bg-white overflow-hidden animate-pulse">
                <div className="aspect-[16/9] bg-gray-100" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-status-error">{error}</p>
            <button onClick={fetchListings} className="text-sm text-brand-primary hover:underline mt-2">Retry</button>
          </div>
        ) : listings.length === 0 ? (
          <EmptyState
            title="No verified properties found"
            description="Adjust your filters or check back soon."
            icon={
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
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
    </main>
  );
}
