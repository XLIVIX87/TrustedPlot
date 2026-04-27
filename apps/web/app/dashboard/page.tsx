'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  coverImage?: { url: string } | null;
  _count?: { documents: number; inspections: number };
}

interface DashboardInspection {
  id: string;
  status: string;
  slotAt: string;
  hasReport: boolean;
  listing: { id: string; title: string; city: string; district: string };
}

interface DashboardEscrow {
  id: string;
  status: string;
  amount: string;
  listingTitle: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [listings, setListings] = useState<DashboardListing[]>([]);
  const [inspections, setInspections] = useState<DashboardInspection[]>([]);
  const [escrows, setEscrows] = useState<DashboardEscrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'inspections' | 'escrows'>('listings');

  const role = (session?.user as any)?.role;
  const isSeller = role === 'SELLER' || role === 'MANDATE';
  const isBuyer = role === 'BUYER';
  const isAdmin = role === 'ADMIN';
  const isLegal = role === 'LEGAL_OPS';
  const isInspector = role === 'INSPECTOR';

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [listingsRes, inspectionsRes] = await Promise.all([
          fetch('/api/dashboard/listings'),
          fetch('/api/dashboard/inspections'),
        ]);
        const listingsData = await listingsRes.json();
        const inspectionsData = await inspectionsRes.json();

        if (listingsData.data) {
          setListings(listingsData.data.listings || []);
          setEscrows(listingsData.data.escrows || []);
        }
        if (inspectionsData.data) setInspections(inspectionsData.data.inspections || []);
      } catch {} finally { setLoading(false); }
    }
    if (session) fetchDashboard();
    else setLoading(false);
  }, [session]);

  // Redirect admin/legal to their specific dashboards
  useEffect(() => {
    if (isAdmin) router.push('/admin');
    if (isLegal) router.push('/verification');
  }, [isAdmin, isLegal, router]);

  const formatPrice = (p: string) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(p));
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });

  if (!session) return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-32 pb-20 px-8 max-w-7xl mx-auto text-center py-20">
        <span className="material-symbols-outlined text-5xl text-outline-variant mb-4 block">lock</span>
        <p className="font-headline font-bold text-xl mb-4">Sign in to access your dashboard</p>
        <Link href="/auth/signin" className="machined-gradient text-white px-8 py-3 rounded-lg font-bold text-sm tracking-widest uppercase inline-block">Sign In</Link>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-32 pb-20 px-6 md:px-8 max-w-[1440px] mx-auto">
        <section className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-4xl font-extrabold font-headline tracking-tighter text-on-surface mb-2">
              {isSeller ? 'Portfolio Overview' : isInspector ? 'Inspector Dashboard' : 'My Dashboard'}
            </h2>
            <p className="text-on-surface-variant max-w-2xl">
              {isSeller ? 'Manage your verified real estate assets and monitor acquisition inquiries.' :
               isBuyer ? 'Track your property inspections, escrows, and saved listings.' :
               isInspector ? 'View assigned inspections and submit reports.' :
               'Your TrustedPlot activity overview.'}
            </p>
          </div>
          {isSeller && (
            <Link href="/dashboard/listings/new" className="machined-gradient text-white px-8 py-3 rounded-lg font-bold text-sm tracking-widest uppercase flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-sm">add</span>
              New Listing
            </Link>
          )}
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: 'inventory_2', label: isSeller ? 'My Listings' : 'Listings', value: listings.length.toString(), iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
            { icon: 'verified',    label: 'Verified',     value: listings.filter(l => l.badge !== 'NONE').length.toString(), iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
            { icon: 'calendar_today', label: 'Inspections', value: inspections.length.toString(), iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
            { icon: 'payments',   label: 'Escrows',      value: escrows.length.toString(), iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
          ].map(s => (
            <div key={s.label} className="bg-surface-container-lowest p-5 rounded-2xl flex flex-col gap-4 hover:shadow-md transition-all group border border-outline-variant/10">
              <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined ${s.iconColor}`} style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>{s.icon}</span>
              </div>
              <div>
                <p className="text-3xl font-black font-headline text-on-surface">{s.value}</p>
                <p className="text-xs text-on-surface-variant font-medium mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-outline-variant/20">
          {[
            { key: 'listings' as const, label: isSeller ? 'My Listings' : 'Listings', icon: 'home', count: listings.length },
            { key: 'inspections' as const, label: 'Inspections', icon: 'calendar_today', count: inspections.length },
            { key: 'escrows' as const, label: 'Escrows', icon: 'payments', count: escrows.length },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 -mb-px transition-all ${
                activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}>
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              {tab.label}
              <span className="text-[10px] bg-surface-container-high px-1.5 py-0.5 rounded-full">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-surface-container-lowest rounded-xl h-28 flex overflow-hidden">
                <div className="w-40 bg-surface-container" />
                <div className="flex-1 p-6 space-y-3">
                  <div className="h-5 bg-surface-container-high rounded w-3/4" />
                  <div className="h-4 bg-surface-container-high rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'listings' ? (
          listings.length === 0 ? (
            <EmptyState icon="add_home" title={isSeller ? 'No listings yet' : 'No listings found'}
              description={isSeller ? 'Create your first listing to begin the verification process.' : 'Properties linked to your inspections or escrows will appear here.'}
              action={isSeller ? (
                <Link href="/dashboard/listings/new" className="machined-gradient text-white px-8 py-3 rounded-lg font-bold text-sm tracking-widest uppercase inline-block">Create First Listing</Link>
              ) : (
                <Link href="/listings" className="machined-gradient text-white px-8 py-3 rounded-lg font-bold text-sm tracking-widest uppercase inline-block">Browse Listings</Link>
              )} />
          ) : (
            <div className="space-y-3">
              {listings.map(listing => (
                <Link key={listing.id} href={`/listings/${listing.id}`} className="bg-surface-container-lowest rounded-xl overflow-hidden flex flex-col sm:flex-row group border border-transparent hover:border-outline-variant transition-all">
                  <div className="sm:w-40 h-28 bg-surface-container-low flex items-center justify-center shrink-0 overflow-hidden">
                    {listing.coverImage?.url ? (
                      <img src={listing.coverImage.url} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-4xl text-outline-variant">landscape</span>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex justify-between items-center">
                    <div>
                      <h4 className="text-base font-bold font-headline leading-tight group-hover:underline decoration-2 underline-offset-4">{listing.title}</h4>
                      <p className="text-sm text-on-surface-variant">{listing.city}, {listing.district}</p>
                      <div className="flex gap-2 mt-2">
                        <VerificationBadge badge={listing.badge} />
                        <StatusBadge status={listing.status} />
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="text-lg font-black font-headline">{formatPrice(listing.price)}</span>
                      <span className="text-[10px] text-on-surface-variant">{formatDate(listing.createdAt)}</span>
                      {isSeller && listing.status === 'DRAFT' && (
                        <Link href={`/listings/${listing.id}`} onClick={e => e.stopPropagation()}
                          className="text-[10px] font-bold text-primary bg-primary-fixed/20 px-2 py-0.5 rounded mt-1">
                          Submit for Verification
                        </Link>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : activeTab === 'inspections' ? (
          inspections.length === 0 ? (
            <EmptyState icon="event_busy" title="No inspections yet"
              description="Book an inspection from a listing detail page."
              action={<Link href="/listings" className="machined-gradient text-white px-8 py-3 rounded-lg font-bold text-sm tracking-widest uppercase inline-block">Browse Listings</Link>} />
          ) : (
            <div className="space-y-3">
              {inspections.map(insp => (
                <div key={insp.id} className="bg-surface-container-lowest rounded-xl p-5 flex items-center gap-4 border border-transparent hover:border-outline-variant transition-all">
                  <div className="w-14 h-14 bg-primary-container rounded-lg flex flex-col items-center justify-center shrink-0">
                    <span className="text-lg font-black text-white">{new Date(insp.slotAt).getDate()}</span>
                    <span className="text-[9px] font-bold text-white/70 uppercase">{new Date(insp.slotAt).toLocaleDateString('en-NG', { month: 'short' })}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/listings/${insp.listing.id}`} className="font-bold font-headline hover:underline block truncate">{insp.listing.title}</Link>
                    <p className="text-xs text-on-surface-variant">{insp.listing.city}, {insp.listing.district} · {new Date(insp.slotAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      insp.status === 'COMPLETED' ? 'bg-tertiary-fixed/20 text-on-tertiary-fixed' :
                      insp.status === 'CONFIRMED' ? 'bg-primary-fixed/20 text-primary' :
                      'bg-secondary-fixed/20 text-on-secondary-fixed'
                    }`}>{insp.status}</span>
                    {isInspector && !insp.hasReport && insp.status === 'CONFIRMED' && (
                      <Link href={`/inspections/${insp.id}/report`}
                        className="text-[10px] font-bold machined-gradient text-white px-2 py-1 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">edit_note</span> Report
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          escrows.length === 0 ? (
            <EmptyState icon="payments" title="No escrows yet"
              description="Start an escrow from a listing to begin a secure transaction."
              action={<Link href="/listings" className="machined-gradient text-white px-8 py-3 rounded-lg font-bold text-sm tracking-widest uppercase inline-block">Browse Listings</Link>} />
          ) : (
            <div className="space-y-3">
              {escrows.map(esc => (
                <Link key={esc.id} href={`/escrow/${esc.id}`}
                  className="bg-surface-container-lowest rounded-xl p-5 flex items-center justify-between group border border-transparent hover:border-outline-variant transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-surface-container-high rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">payments</span>
                    </div>
                    <div>
                      <h4 className="font-bold font-headline group-hover:underline">{esc.listingTitle}</h4>
                      <p className="text-xs text-on-surface-variant">{formatDate(esc.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <span className="text-lg font-black font-headline">{formatPrice(esc.amount)}</span>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      esc.status === 'FUNDED' ? 'bg-tertiary-fixed/20 text-on-tertiary-fixed' :
                      esc.status === 'DISPUTED' ? 'bg-error-container text-on-error-container' :
                      'bg-secondary-fixed/20 text-on-secondary-fixed'
                    }`}>{esc.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </div>
      <Footer />
    </main>
  );
}
