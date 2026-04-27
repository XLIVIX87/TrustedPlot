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

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string; icon: string }> = {
  REQUESTED: { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400',   label: 'Requested',  icon: 'pending_actions' },
  CONFIRMED: { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500',    label: 'Confirmed',  icon: 'event_available' },
  COMPLETED: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Completed',  icon: 'task_alt' },
  CANCELLED: { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-400',     label: 'Cancelled',  icon: 'event_busy' },
};

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_SHORT   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function CalendarDateCard({ date, status }: { date: string; status: string }) {
  const d     = new Date(date);
  const cfg   = STATUS_CONFIG[status] || STATUS_CONFIG.REQUESTED;
  const isPast = d < new Date();

  return (
    <div className={`w-20 shrink-0 flex flex-col items-center justify-center py-4 px-2 rounded-2xl ${
      isPast && status !== 'COMPLETED' ? 'bg-surface-container-high' : cfg.bg
    }`}>
      <span className={`text-[10px] font-bold uppercase tracking-widest ${isPast && status !== 'COMPLETED' ? 'text-on-surface-variant/50' : cfg.text}`}>
        {DAY_SHORT[d.getDay()]}
      </span>
      <span className={`text-3xl font-black font-headline leading-tight mt-0.5 ${isPast && status !== 'COMPLETED' ? 'text-on-surface-variant/40' : cfg.text}`}>
        {d.getDate()}
      </span>
      <span className={`text-[10px] font-bold uppercase ${isPast && status !== 'COMPLETED' ? 'text-on-surface-variant/40' : cfg.text}`}>
        {MONTH_SHORT[d.getMonth()]}
      </span>
      <div className={`w-1.5 h-1.5 rounded-full mt-2 ${cfg.dot}`} />
    </div>
  );
}

function UpcomingCalendarStrip({ inspections }: { inspections: Inspection[] }) {
  const upcoming = inspections
    .filter(i => ['REQUESTED', 'CONFIRMED'].includes(i.status) && new Date(i.slotAt) >= new Date())
    .sort((a, b) => new Date(a.slotAt).getTime() - new Date(b.slotAt).getTime())
    .slice(0, 5);

  if (upcoming.length === 0) return null;

  return (
    <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-black/5 p-6 mb-8 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>event</span>
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Upcoming Inspections</p>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar">
        {upcoming.map(insp => {
          const d = new Date(insp.slotAt);
          return (
            <Link key={insp.id} href={`/listings/${insp.listing.id}`}
              className="flex-shrink-0 flex flex-col items-center p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all group w-24 text-center">
              <span className="text-[10px] font-bold uppercase text-on-surface-variant/70">{DAY_SHORT[d.getDay()]}</span>
              <span className="text-2xl font-black font-headline text-on-surface my-0.5">{d.getDate()}</span>
              <span className="text-[10px] text-on-surface-variant">{MONTH_SHORT[d.getMonth()]}</span>
              <span className="text-[10px] text-primary font-bold mt-1.5 group-hover:underline truncate w-full text-center">
                {insp.listing.city}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function InspectionsPage() {
  const { data: session } = useSession();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState<'all' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    async function fetchInspections() {
      try {
        const res  = await fetch('/api/dashboard/inspections');
        const data = await res.json();
        if (data.data) setInspections(data.data.inspections || []);
      } catch {} finally { setLoading(false); }
    }
    if (session) fetchInspections();
    else setLoading(false);
  }, [session]);

  const filtered = inspections.filter(i => {
    if (filter === 'upcoming')  return ['REQUESTED', 'CONFIRMED'].includes(i.status);
    if (filter === 'completed') return i.status === 'COMPLETED';
    return true;
  });

  const upcomingCount  = inspections.filter(i => ['REQUESTED', 'CONFIRMED'].includes(i.status)).length;
  const completedCount = inspections.filter(i => i.status === 'COMPLETED').length;

  const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });

  return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-32 pb-20 px-6 md:px-8 max-w-[1200px] mx-auto">

        {/* Header */}
        <section className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 animate-fade-in-up">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Property Inspections</p>
            <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-on-surface mb-2">My Inspections</h1>
            <p className="text-on-surface-variant max-w-xl text-sm leading-relaxed">
              Track upcoming and completed on-site property visits across your portfolio.
            </p>
          </div>
          <Link href="/listings"
            className="machined-gradient text-white px-6 py-3 rounded-xl font-bold text-sm tracking-widest uppercase flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-sm">search</span>
            Book Inspection
          </Link>
        </section>

        {!session ? (
          <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-black/5 p-12 text-center animate-fade-in">
            <div className="w-16 h-16 bg-surface-container-high rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>lock</span>
            </div>
            <p className="text-lg font-bold font-headline mb-2">Sign in to view inspections</p>
            <p className="text-sm text-on-surface-variant mb-6">Access your inspection schedule and reports.</p>
            <Link href="/auth/signin" className="machined-gradient text-white px-8 py-3 rounded-xl font-bold text-sm tracking-widest uppercase inline-block">
              Sign In
            </Link>
          </div>
        ) : loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-surface-container-lowest rounded-2xl h-28 flex overflow-hidden">
                <div className="w-20 bg-surface-container" />
                <div className="flex-1 p-6 space-y-3">
                  <div className="h-5 bg-surface-container-high rounded w-3/4" />
                  <div className="h-4 bg-surface-container-high rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Upcoming calendar strip — only shows for all/upcoming filter */}
            {filter !== 'completed' && <UpcomingCalendarStrip inspections={inspections} />}

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Total',     value: inspections.length, bg: 'bg-slate-100',   color: 'text-slate-600' },
                { label: 'Upcoming',  value: upcomingCount,      bg: 'bg-blue-100',    color: 'text-blue-600'  },
                { label: 'Completed', value: completedCount,     bg: 'bg-emerald-100', color: 'text-emerald-700' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
                  <p className={`text-2xl font-black font-headline ${s.color}`}>{s.value}</p>
                  <p className={`text-xs font-bold ${s.color} opacity-70 uppercase tracking-wide`}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-6 border-b border-outline-variant/15 pb-0">
              {([
                { key: 'all',       label: `All (${inspections.length})` },
                { key: 'upcoming',  label: `Upcoming (${upcomingCount})` },
                { key: 'completed', label: `Completed (${completedCount})` },
              ] as const).map(tab => (
                <button key={tab.key} onClick={() => setFilter(tab.key)}
                  className={`px-5 py-3 text-sm font-bold border-b-2 -mb-px transition-all ${
                    filter === tab.key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-on-surface-variant hover:text-on-surface'
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* List */}
            {filtered.length === 0 ? (
              <EmptyState
                icon="event_busy"
                title={filter === 'all' ? 'No inspections booked yet' : `No ${filter} inspections`}
                description="Browse verified listings to schedule your first on-site inspection."
                action={
                  <Link href="/listings" className="machined-gradient text-white px-8 py-3 rounded-xl font-bold text-sm tracking-widest uppercase inline-block">
                    Browse Listings
                  </Link>
                }
              />
            ) : (
              <div className="space-y-3">
                {filtered.map(inspection => {
                  const cfg     = STATUS_CONFIG[inspection.status] || STATUS_CONFIG.REQUESTED;
                  const isRole  = (session?.user as any)?.role;
                  const canFile = isRole === 'INSPECTOR' && !inspection.hasReport && ['CONFIRMED', 'IN_PROGRESS', 'ASSIGNED'].includes(inspection.status);

                  return (
                    <div key={inspection.id}
                      className="bg-surface-container-lowest rounded-2xl overflow-hidden flex flex-col sm:flex-row group border border-transparent hover:border-outline-variant/30 hover:shadow-sm transition-all animate-fade-in">
                      {/* Date card */}
                      <div className="sm:w-20 p-0 flex-shrink-0">
                        <CalendarDateCard date={inspection.slotAt} status={inspection.status} />
                      </div>

                      {/* Details */}
                      <div className="flex-1 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="min-w-0">
                          <Link href={`/listings/${inspection.listing.id}`}
                            className="text-base font-bold font-headline leading-tight hover:underline decoration-2 underline-offset-4 block truncate">
                            {inspection.listing.title}
                          </Link>
                          <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-xs">location_on</span>
                            {inspection.listing.city}, {inspection.listing.district}
                          </p>
                          <p className="text-xs text-on-surface-variant/60 flex items-center gap-1 mt-1">
                            <span className="material-symbols-outlined text-xs">schedule</span>
                            {formatTime(inspection.slotAt)}
                          </p>
                          {inspection.hasReport && (
                            <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1.5 font-medium">
                              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>task_alt</span>
                              Inspection report available
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 flex-wrap shrink-0">
                          {/* Status badge */}
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 ${cfg.bg} ${cfg.text}`}>
                            <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>{cfg.icon}</span>
                            {cfg.label}
                          </span>

                          {/* Inspector action */}
                          {canFile && (
                            <Link href={`/inspections/${inspection.id}/report`}
                              className="text-xs font-bold text-white machined-gradient px-3 py-1.5 rounded-full hover:opacity-90 flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">edit_note</span>
                              File Report
                            </Link>
                          )}

                          <Link href={`/listings/${inspection.listing.id}`}
                            className="text-primary font-bold text-sm flex items-center gap-0.5 hover:underline">
                            View <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}
