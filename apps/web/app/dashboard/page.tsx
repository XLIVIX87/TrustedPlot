'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Navbar } from '@/components/ui/navbar';
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
        // For now, use the public search API — will add owner filter later
        const res = await fetch('/api/listings?pageSize=50');
        const data = await res.json();
        if (data.data) {
          setListings(data.data.listings || []);
        }
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    }
    fetchMyListings();
  }, []);

  const formatPrice = (price: string) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(price));

  return (
    <main className="min-h-screen bg-page">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-brand-dark">Dashboard</h1>
          <Link href="/dashboard/listings/new" className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            + New Listing
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Listings', value: listings.length.toString() },
            { label: 'Verified', value: listings.filter((l) => l.badge !== 'NONE').length.toString() },
            { label: 'Pending', value: listings.filter((l) => ['SUBMITTED', 'UNDER_VERIFICATION'].includes(l.status)).length.toString() },
            { label: 'Draft', value: listings.filter((l) => l.status === 'DRAFT').length.toString() },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg border border-border p-5">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-brand-dark mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Listings table */}
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-brand-dark">My Listings</h2>
          </div>
          {loading ? (
            <div className="p-6 space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No listings yet"
                description="Create your first listing to get started."
                action={
                  <Link href="/dashboard/listings/new" className="text-brand-primary text-sm hover:underline">
                    Create your first listing
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Badge</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {listings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-brand-dark">{listing.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{listing.city}, {listing.district}</td>
                      <td className="px-6 py-4 text-sm font-medium">{formatPrice(listing.price)}</td>
                      <td className="px-6 py-4"><StatusBadge status={listing.status} /></td>
                      <td className="px-6 py-4"><VerificationBadge badge={listing.badge} /></td>
                      <td className="px-6 py-4">
                        <Link href={`/listings/${listing.id}`} className="text-sm text-brand-primary hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
