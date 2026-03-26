'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { EmptyState } from '@/components/ui/empty-state';

interface Inspection {
  id: string;
  status: string;
  slotAt: string;
  createdAt: string;
  listing: { id: string; title: string; city: string; district: string; badge: string };
  hasReport: boolean;
  reportId: string | null;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  REQUESTED: { bg: 'bg-secondary-fixed/20', text: 'text-on-secondary-fixed', label: 'Requested' },
  CONFIRMED: { bg: 'bg-primary-fixed/20', text: 'text-primary', label: 'Confirmed' },
  COMPLETED: { bg: 'bg-tertiary-fixed/20', text: 'text-on-tertiary-fixed', label: 'Completed' },
  CANCELLED: { bg: 'bg-error-container', text: 'text-on-error-container', label: 'Cancelled' },
};

export default function InspectionsPage() {
  const { data: session } = useSession();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    async function fetchInspections() {
      try {
        const res = await fetch('/api/dashboard/inspections');
        const data = await res.json();
        if (data.data) setInspections(data.data.inspections || []);
      } catch {} finally { setLoading(false); }
    }
    if (session) fetchInspections();
    else setLoading(false);
  }, [session]);

  const filtered = inspections.filter(i => {
    if (filter === 'upcoming') return ['REQUESTED', 'CONFIRMED'].includes(i.status);
    if (filter === 'completed') return i.status === 'COMPLETED';
    return true;
  });

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });

  return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-32 pb-20 px-6 md:px-8 max-w-[1440px] mx-auto">
        <section className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-on-surface mb-2">My Inspections</h1>
            <p className="text-on-surface-variant max-w-2xl">Track upcoming and completed property inspections across your portfolio.</p>
          </div>
          <Link href="/listings" className="machined-gradient text-white px-6 py-3 rounded-lg font-bold text-sm tracking-widest uppercase flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-sm">search</span>
            Browse Listings
          </Link>
        </section>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-8">
          {(['all', 'upcoming', 'completed'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold capitalize transition-all ${
                filter === f ? 'machined-gradient text-white shadow-md' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
              }`}>
              {f === 'all' ? `All (${inspections.length})` : f === 'upcoming' ? `Upcoming (${inspections.filter(i => ['REQUESTED', 'CONFIRMED'].includes(i.status)).length})` : `Completed (${inspections.filter(i => i.status === 'COMPLETED').length})`}
            </button>
          ))}
        </div>

        {!session ? (
          <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-black/5 p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-outline-variant mb-4 block">lock</span>
            <p className="text-lg font-bold font-headline mb-2">Sign in to view inspections</p>
            <Link href="/auth/signin" className="machined-gradient text-white px-8 py-3 rounded-lg font-bold text-sm tracking-widest uppercase inline-block mt-4">Sign In</Link>
          </div>
        ) : loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-surface-container-lowest rounded-xl h-28 flex overflow-hidden">
                <div className="w-32 bg-surface-container" />
                <div className="flex-1 p-6 space-y-3">
                  <div className="h-5 bg-surface-container-high rounded w-3/4" />
                  <div className="h-4 bg-surface-container-high rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="event_busy"
            title={filter === 'all' ? 'No inspections booked yet' : `No ${filter} inspections`}
            description="Browse verified listings to schedule your first on-site inspection with a trusted agent."
            action={
              <Link href="/listings" className="machined-gradient text-white px-8 py-3 rounded-lg font-bold text-sm tracking-widest uppercase inline-block">
                Browse Listings
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {filtered.map(inspection => {
              const style = STATUS_STYLES[inspection.status] || STATUS_STYLES.REQUESTED;
              return (
                <div key={inspection.id} className="bg-surface-container-lowest rounded-xl overflow-hidden flex flex-col sm:flex-row group border border-transparent hover:border-outline-variant transition-all">
                  {/* Date card */}
                  <div className="sm:w-32 bg-primary-container flex flex-col items-center justify-center p-4 shrink-0">
                    <span className="text-3xl font-black font-headline text-white">{new Date(inspection.slotAt).getDate()}</span>
                    <span className="text-xs font-bold text-white/80 uppercase">{new Date(inspection.slotAt).toLocaleDateString('en-NG', { month: 'short' })}</span>
                    <span className="text-[10px] text-white/60 mt-1">{formatTime(inspection.slotAt)}</span>
                  </div>
                  {/* Details */}
                  <div className="p-6 flex-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <Link href={`/listings/${inspection.listing.id}`} className="text-lg font-bold font-headline leading-tight hover:underline decoration-2 underline-offset-4">
                        {inspection.listing.title}
                      </Link>
                      <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-xs">location_on</span>
                        {inspection.listing.city}, {inspection.listing.district}
                      </p>
                      {inspection.hasReport && (
                        <p className="text-xs text-on-surface-variant mt-2 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-tertiary-fixed">description</span>
                          Inspection report available
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${style.bg} ${style.text}`}>{style.label}</span>
                      <Link href={`/listings/${inspection.listing.id}`} className="text-primary hover:underline text-sm font-bold flex items-center gap-1">
                        View <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
