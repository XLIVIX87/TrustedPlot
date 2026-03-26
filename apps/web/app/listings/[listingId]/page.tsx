'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Navbar } from '@/components/ui/navbar';
import { VerificationBadge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';

interface ListingDetail {
  id: string;
  title: string;
  description: string;
  city: string;
  district: string;
  price: string;
  propertyType: string;
  listingType: string;
  bedrooms: number | null;
  bathrooms: number | null;
  status: string;
  badge: string;
  addressSummary: string | null;
  documentsAvailable: boolean;
  sellerProfile: { displayName: string; sellerType: string };
  media: { url: string; mediaType: string }[];
}

export default function ListingDetailPage({ params }: { params: { listingId: string } }) {
  const { data: session } = useSession();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    async function fetchListing() {
      try {
        const res = await fetch(`/api/listings/${params.listingId}`);
        const data = await res.json();
        if (data.data) setListing(data.data);
        else setError('Listing not found');
      } catch { setError('Failed to load listing'); }
      finally { setLoading(false); }
    }
    fetchListing();
  }, [params.listingId]);

  const formatPrice = (price: string) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(price));

  async function handleUnlock() {
    setActionLoading('unlock');
    try {
      const res = await fetch(`/api/listings/${params.listingId}/unlock`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) setActionMessage('Documents unlocked successfully!');
      else setActionMessage(data.error?.message || 'Failed to unlock');
    } catch { setActionMessage('Something went wrong'); }
    finally { setActionLoading(''); }
  }

  async function handleBookInspection() {
    setActionLoading('inspection');
    try {
      const slotAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      const res = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: params.listingId, slotAt }),
      });
      const data = await res.json();
      if (res.ok) setActionMessage('Inspection booked! Check your inspections page.');
      else setActionMessage(data.error?.message || 'Failed to book');
    } catch { setActionMessage('Something went wrong'); }
    finally { setActionLoading(''); }
  }

  async function handleStartEscrow() {
    if (!listing) return;
    setActionLoading('escrow');
    try {
      const res = await fetch('/api/escrows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: params.listingId, amount: Number(listing.price) }),
      });
      const data = await res.json();
      if (res.ok) setActionMessage(`Escrow created! ID: ${data.data.escrowId}`);
      else setActionMessage(data.error?.message || 'Failed to create escrow');
    } catch { setActionMessage('Something went wrong'); }
    finally { setActionLoading(''); }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-page">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-8 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="aspect-video bg-gray-100 rounded-lg" />
              <div className="bg-white rounded-lg border border-border p-6 space-y-4">
                <div className="h-8 bg-gray-100 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="h-20 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-border p-6 h-48" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !listing) {
    return (
      <main className="min-h-screen bg-page">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <p className="text-gray-500">{error || 'Listing not found'}</p>
          <Link href="/listings" className="text-brand-primary text-sm hover:underline mt-4 inline-block">Back to listings</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-page">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Link href="/listings" className="text-sm text-brand-primary hover:underline mb-4 inline-block">&larr; Back to listings</Link>

        {actionMessage && (
          <div className="mb-4 rounded-md bg-blue-50 border border-blue-200 p-3">
            <p className="text-sm text-brand-primary">{actionMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video bg-gray-100 rounded-lg border border-border flex items-center justify-center">
              {listing.media?.length > 0 ? (
                <img src={listing.media[0].url} alt={listing.title} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <span className="text-gray-400">Property Images</span>
              )}
            </div>

            <div className="bg-white rounded-lg border border-border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-brand-dark">{listing.title}</h1>
                  <p className="text-gray-500 mt-1">{listing.city}, {listing.district}</p>
                </div>
                <div className="flex items-center gap-2">
                  <VerificationBadge badge={listing.badge} />
                  <StatusBadge status={listing.status} />
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <h2 className="text-lg font-semibold text-brand-dark mb-2">Description</h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{listing.description}</p>
              </div>
              <div className="border-t border-border pt-4 mt-4">
                <h2 className="text-lg font-semibold text-brand-dark mb-3">Details</h2>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div><dt className="text-gray-500">Property Type</dt><dd className="font-medium capitalize">{listing.propertyType.toLowerCase()}</dd></div>
                  <div><dt className="text-gray-500">Listing Type</dt><dd className="font-medium capitalize">{listing.listingType.toLowerCase()}</dd></div>
                  {listing.bedrooms != null && <div><dt className="text-gray-500">Bedrooms</dt><dd className="font-medium">{listing.bedrooms}</dd></div>}
                  {listing.bathrooms != null && <div><dt className="text-gray-500">Bathrooms</dt><dd className="font-medium">{listing.bathrooms}</dd></div>}
                </dl>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-border p-6">
              <p className="text-3xl font-bold text-brand-dark">{formatPrice(listing.price)}</p>
              <p className="text-sm text-gray-500 mt-1">{listing.listingType === 'RENT' ? 'per year' : ''}</p>
              {session && (
                <div className="mt-6 space-y-3">
                  <button onClick={handleUnlock} disabled={actionLoading === 'unlock'} className="w-full rounded-md bg-brand-primary px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                    {actionLoading === 'unlock' ? 'Unlocking...' : 'Unlock Documents'}
                  </button>
                  <button onClick={handleBookInspection} disabled={actionLoading === 'inspection'} className="w-full rounded-md border border-brand-primary px-4 py-3 text-sm font-medium text-brand-primary hover:bg-blue-50 disabled:opacity-50">
                    {actionLoading === 'inspection' ? 'Booking...' : 'Book Inspection'}
                  </button>
                  <button onClick={handleStartEscrow} disabled={actionLoading === 'escrow'} className="w-full rounded-md border border-border px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                    {actionLoading === 'escrow' ? 'Creating...' : 'Start Escrow'}
                  </button>
                </div>
              )}
              {!session && (
                <div className="mt-6">
                  <Link href="/auth/signin" className="w-full block text-center rounded-md bg-brand-primary px-4 py-3 text-sm font-medium text-white hover:bg-blue-700">
                    Sign in to take action
                  </Link>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg border border-border p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Seller</h3>
              <p className="font-medium text-brand-dark">{listing.sellerProfile?.displayName || 'Unknown'}</p>
              <p className="text-sm text-gray-500 capitalize">{listing.sellerProfile?.sellerType?.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
