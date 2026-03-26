'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { VerificationBadge } from '@/components/ui/badge';

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
  squareMeters: number | null;
  status: string;
  badge: string;
  documentsAvailable: boolean;
  sellerProfile: { displayName: string; sellerType: string };
  media: { url: string; mediaType: string }[];
  _count?: { documents: number; inspections: number };
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

  const formatPrice = (p: string) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(p));

  async function handleAction(action: string) {
    setActionLoading(action);
    setActionMessage('');
    try {
      let res;
      if (action === 'unlock') {
        res = await fetch(`/api/listings/${params.listingId}/unlock`, { method: 'POST' });
      } else if (action === 'inspection') {
        res = await fetch('/api/inspections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listingId: params.listingId, slotAt: new Date(Date.now() + 3 * 86400000).toISOString() }),
        });
      } else if (action === 'escrow') {
        res = await fetch('/api/escrows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listingId: params.listingId, amount: Number(listing?.price) }),
        });
      }
      const data = await res!.json();
      if (res!.ok) setActionMessage(action === 'unlock' ? 'Documents unlocked!' : action === 'inspection' ? 'Inspection booked!' : `Escrow created: ${data.data?.escrowId}`);
      else setActionMessage(data.error?.message || 'Action failed');
    } catch { setActionMessage('Something went wrong'); }
    finally { setActionLoading(''); }
  }

  if (loading) return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-32 px-8 max-w-7xl mx-auto animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          <div className="lg:col-span-8 aspect-[16/9] bg-surface-container-low rounded-xl" />
          <div className="lg:col-span-4 space-y-4">
            <div className="aspect-square bg-surface-container-low rounded-xl" />
            <div className="aspect-square bg-surface-container-low rounded-xl" />
          </div>
        </div>
      </div>
    </main>
  );

  if (error || !listing) return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-32 px-8 max-w-7xl mx-auto text-center py-20">
        <span className="material-symbols-outlined text-5xl text-outline-variant mb-4 block">error</span>
        <p className="font-headline font-bold text-xl">{error || 'Listing not found'}</p>
        <Link href="/listings" className="text-primary font-bold text-sm hover:underline mt-4 inline-block">Back to listings</Link>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Gallery */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          <div className="lg:col-span-8 rounded-xl overflow-hidden aspect-[16/9] relative group shadow-sm bg-surface-container-low">
            {listing.media?.[0] ? (
              <img src={listing.media[0].url} alt={listing.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-outline-variant">landscape</span>
              </div>
            )}
            <div className="absolute top-6 left-6 flex gap-3">
              <VerificationBadge badge={listing.badge} />
            </div>
          </div>
          <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="rounded-xl overflow-hidden aspect-square lg:aspect-[4/3] bg-surface-container-low flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-outline-variant">image</span>
            </div>
            <div className="rounded-xl overflow-hidden aspect-square lg:aspect-[4/3] relative bg-surface-container-low flex items-center justify-center">
              <span className="text-on-surface-variant font-headline font-bold text-xl">+Photos</span>
            </div>
          </div>
        </section>

        {actionMessage && (
          <div className="mb-6 p-4 bg-primary-fixed rounded-xl border-l-4 border-primary">
            <p className="text-on-primary-fixed font-medium text-sm">{actionMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main */}
          <div className="lg:col-span-8 space-y-12">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-on-surface mb-2">{listing.title}</h1>
                  <div className="flex items-center gap-2 text-on-surface-variant font-medium">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    <span>{listing.city}, {listing.district}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-label uppercase tracking-widest text-on-surface-variant mb-1">Acquisition Price</p>
                  <p className="text-3xl font-headline font-black text-primary">{formatPrice(listing.price)}</p>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10">
                <h3 className="font-headline font-bold text-xl mb-4">Property Overview</h3>
                <p className="text-on-surface-variant leading-relaxed text-lg font-light italic border-l-4 border-secondary-fixed pl-6 whitespace-pre-wrap">
                  {listing.description}
                </p>
                <div className="grid grid-cols-3 gap-8 mt-8 pt-8 border-t border-outline-variant/10">
                  <div>
                    <span className="text-xs font-label uppercase text-on-surface-variant block mb-1">Property Type</span>
                    <span className="text-lg font-headline font-bold capitalize">{listing.propertyType.toLowerCase()}</span>
                  </div>
                  <div>
                    <span className="text-xs font-label uppercase text-on-surface-variant block mb-1">Listing Type</span>
                    <span className="text-lg font-headline font-bold capitalize">{listing.listingType.toLowerCase()}</span>
                  </div>
                  <div>
                    <span className="text-xs font-label uppercase text-on-surface-variant block mb-1">Bedrooms</span>
                    <span className="text-lg font-headline font-bold">{listing.bedrooms ?? '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents section */}
            {listing.documentsAvailable && (
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-headline font-bold tracking-tight">Verified Document Ledger</h2>
                  <span className="text-xs font-label text-on-tertiary-container bg-tertiary-fixed/20 px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                    AI Verified
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-surface-container-low p-6 rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-white rounded-lg shadow-sm">
                        <span className="material-symbols-outlined text-secondary">description</span>
                      </div>
                      <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">download</span>
                    </div>
                    <h4 className="font-headline font-bold">Property Documents</h4>
                    <p className="text-xs text-on-surface-variant mt-1 mb-3">{listing._count?.documents || 0} documents available</p>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="sticky top-28 space-y-6">
              <div className="bg-surface-container-lowest p-8 rounded-xl shadow-lg border border-outline-variant/10">
                {session ? (
                  <>
                    <button onClick={() => handleAction('inspection')} disabled={actionLoading === 'inspection'}
                      className="w-full py-4 machined-gradient text-white rounded-lg font-headline font-bold text-sm uppercase tracking-widest shadow-md hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 mb-4 disabled:opacity-50">
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                      {actionLoading === 'inspection' ? 'Booking...' : 'Book Inspection'}
                    </button>
                    <button onClick={() => handleAction('unlock')} disabled={actionLoading === 'unlock'}
                      className="w-full py-4 bg-surface-container-high text-on-surface font-headline font-bold text-sm uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 mb-4 hover:bg-surface-container-highest transition-all disabled:opacity-50">
                      <span className="material-symbols-outlined text-sm">lock_open</span>
                      {actionLoading === 'unlock' ? 'Unlocking...' : 'Unlock Documents'}
                    </button>
                    <button onClick={() => handleAction('escrow')} disabled={actionLoading === 'escrow'}
                      className="w-full py-4 bg-surface-container-high text-outline font-headline font-bold text-sm uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-all disabled:opacity-50">
                      <span className="material-symbols-outlined text-sm">payments</span>
                      {actionLoading === 'escrow' ? 'Creating...' : 'Proceed to Escrow'}
                    </button>
                  </>
                ) : (
                  <Link href="/auth/signin" className="w-full py-4 machined-gradient text-white rounded-lg font-headline font-bold text-sm uppercase tracking-widest shadow-md block text-center">
                    Sign In to Take Action
                  </Link>
                )}

                <div className="mt-8 space-y-4">
                  <div className="flex justify-between text-xs font-label">
                    <span className="text-on-surface-variant">Escrow Service Fee (1%)</span>
                    <span className="text-on-surface font-bold">{formatPrice(String(Number(listing.price) * 0.01))}</span>
                  </div>
                  <div className="flex justify-between text-xs font-label">
                    <span className="text-on-surface-variant">Legal Verification Fee</span>
                    <span className="text-on-surface font-bold">Included</span>
                  </div>
                </div>
              </div>

              {/* Seller */}
              <div className="bg-white p-6 rounded-xl border border-outline-variant/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold text-xs">
                  {listing.sellerProfile?.displayName?.slice(0, 2).toUpperCase() || '??'}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold">{listing.sellerProfile?.displayName || 'Unknown'}</h4>
                  <p className="text-[10px] text-on-surface-variant capitalize">{listing.sellerProfile?.sellerType?.toLowerCase() || 'Seller'}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </main>
  );
}
