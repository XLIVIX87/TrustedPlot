'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { StatusBadge } from '@/components/ui/status-badge';
import { VerificationBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';

interface DashboardListing {
  id: string;
  title: string;
  city: string;
  district: string;
  price: string;
  status: string;
  badge: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [listings, setListings] = useState<DashboardListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyListings() {
      try {
        const res = await fetch('/api/listings?pageSize=50');
        const data = await res.json();
        if (data.data) setListings(data.data.listings || []);
      } catch {} finally { setLoading(false); }
    }
    fetchMyListings();
  }, []);

  const formatPrice = (p: string) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(p));

  return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-32 pb-20 px-8 max-w-[1440px] mx-auto">
        <section className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-4xl font-extrabold font-headline tracking-tighter text-on-surface mb-2">Portfolio Overview</h2>
            <p className="text-on-surface-variant max-w-2xl">Manage your verified real estate assets and monitor acquisition inquiries in real-time within the secure digital ledger.</p>
          </div>
          <Link href="/dashboard/listings/new" className="machined-gradient text-white px-8 py-3 rounded-lg font-bold text-sm tracking-widest uppercase flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-sm">add</span>
            New Listing
          </Link>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: 'inventory_2', label: 'Total Listings', value: listings.length.toString(), tag: 'ACTIVE', tagColor: 'bg-tertiary-fixed text-on-tertiary-fixed' },
            { icon: 'verified', label: 'Verified', value: listings.filter(l => l.badge !== 'NONE').length.toString(), tag: 'TRUSTED', tagColor: 'bg-secondary-fixed text-on-secondary-fixed' },
            { icon: 'pending', label: 'Pending Review', value: listings.filter(l => ['SUBMITTED', 'UNDER_VERIFICATION'].includes(l.status)).length.toString(), tag: 'QUEUE', tagColor: 'bg-surface-container-high text-on-surface-variant' },
          ].map(s => (
            <div key={s.label} className="bg-surface-container-lowest p-8 rounded-xl flex flex-col gap-4 border-b-2 border-transparent hover:border-primary transition-all group">
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">{s.icon}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${s.tagColor}`}>{s.tag}</span>
              </div>
              <div>
                <p className="text-3xl font-black font-headline">{s.value}</p>
                <p className="text-sm text-on-surface-variant font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Listings */}
        <div className="space-y-8">
          <div className="flex justify-between items-end">
            <h3 className="text-2xl font-bold font-headline tracking-tight">Active Inventory</h3>
            <Link href="/listings" className="text-sm font-bold text-primary border-b border-primary/20 pb-0.5 hover:border-primary transition-all">View Ledger</Link>
          </div>

          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-surface-container-lowest rounded-xl h-32 flex overflow-hidden">
                  <div className="w-48 bg-surface-container" />
                  <div className="flex-1 p-6 space-y-3">
                    <div className="h-5 bg-surface-container-high rounded w-3/4" />
                    <div className="h-4 bg-surface-container-high rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <EmptyState
              icon="add_home"
              title="No listings yet"
              description="Create your first listing to begin the verification process."
              action={
                <Link href="/dashboard/listings/new" className="machined-gradient text-white px-8 py-3 rounded-lg font-bold text-sm tracking-widest uppercase inline-block">
                  Create First Listing
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {listings.map(listing => (
                <Link key={listing.id} href={`/listings/${listing.id}`} className="bg-surface-container-lowest rounded-xl overflow-hidden flex flex-col sm:flex-row group border border-transparent hover:border-outline-variant transition-all">
                  <div className="sm:w-48 h-32 bg-surface-container-low flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-4xl text-outline-variant">landscape</span>
                  </div>
                  <div className="p-6 flex-1 flex justify-between items-center">
                    <div>
                      <h4 className="text-lg font-bold font-headline leading-tight group-hover:underline decoration-2 underline-offset-4">{listing.title}</h4>
                      <p className="text-sm text-on-surface-variant">{listing.city}, {listing.district}</p>
                      <div className="flex gap-3 mt-2">
                        <VerificationBadge badge={listing.badge} />
                        <StatusBadge status={listing.status} />
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <span className="text-lg font-black font-headline">{formatPrice(listing.price)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
