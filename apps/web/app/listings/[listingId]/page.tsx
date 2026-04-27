'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
  media: { url: string; mediaType: string; altText?: string | null }[];
  _count?: { documents: number; inspections: number };
}

export default function ListingDetailPage({ params }: { params: { listingId: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [activePhoto, setActivePhoto] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [inspectionDate, setInspectionDate] = useState(() => {
    const d = new Date(Date.now() + 3 * 86400000);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });

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
          body: JSON.stringify({ listingId: params.listingId, slotAt: new Date(inspectionDate).toISOString() }),
        });
      } else if (action === 'escrow') {
        res = await fetch('/api/escrows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listingId: params.listingId, amount: Number(listing?.price) }),
        });
      }
      if (!res) { setActionMessage('Something went wrong'); return; }
      const data = await res.json();
      if (res.ok) {
        if (action === 'unlock') setActionMessage('Documents unlocked!');
        else if (action === 'inspection') {
          setActionMessage('Inspection booked! Redirecting…');
          setShowDatePicker(false);
          setTimeout(() => router.push('/inspections'), 800);
        } else if (action === 'escrow' && data.data?.escrowId) {
          setActionMessage(`Escrow created. Redirecting…`);
          setTimeout(() => router.push(`/escrow/${data.data.escrowId}`), 600);
        }
      } else setActionMessage(data?.error?.message || 'Action failed');
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
        <section className="mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-3">
            {/* Main photo */}
            <div className="lg:col-span-8 rounded-2xl overflow-hidden aspect-[16/9] relative group shadow-sm bg-surface-container-low">
              {listing.media?.[activePhoto] ? (
                <img src={listing.media[activePhoto].url} alt={listing.media[activePhoto].altText || listing.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-outline-variant">landscape</span>
                </div>
              )}
              {/* Badge overlay */}
              <div className="absolute top-5 left-5">
                <VerificationBadge badge={listing.badge} />
              </div>
              {/* Photo counter */}
              {listing.media && listing.media.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-xs">photo_library</span>
                  {activePhoto + 1} / {listing.media.length}
                </div>
              )}
            </div>

            {/* Right thumbnails */}
            <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3">
              {listing.media && listing.media.length > 1 ? (
                listing.media.slice(1, 3).map((m, i) => {
                  const idx = i + 1;
                  const isLastVisible = i === 1 && listing.media.length > 3;
                  return (
                    <button key={idx} onClick={() => setActivePhoto(idx)}
                      className={`rounded-2xl overflow-hidden aspect-square lg:aspect-[4/3] relative group bg-surface-container-low transition-all ${activePhoto === idx ? 'ring-2 ring-primary' : 'hover:opacity-90'}`}>
                      <img src={m.url} alt={m.altText || ''} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      {isLastVisible && (
                        <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-1">
                          <span className="text-white font-headline font-black text-2xl">+{listing.media.length - 3}</span>
                          <span className="text-white/70 text-xs font-medium">more photos</span>
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                [0, 1].map(i => (
                  <div key={i} className="rounded-2xl overflow-hidden aspect-square lg:aspect-[4/3] bg-surface-container-low flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-outline-variant">image</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Thumbnail strip — shows if 4+ photos */}
          {listing.media && listing.media.length >= 4 && (
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {listing.media.map((m, i) => (
                <button key={i} onClick={() => setActivePhoto(i)}
                  className={`w-16 h-12 rounded-lg overflow-hidden shrink-0 transition-all ${activePhoto === i ? 'ring-2 ring-primary scale-105' : 'opacity-60 hover:opacity-100'}`}>
                  <img src={m.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>

        {actionMessage && (
          <div className="mb-6 p-4 bg-primary-fixed rounded-xl border-l-4 border-primary">
            <p className="text-on-primary-fixed font-medium text-sm">{actionMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main */}
          <div className="lg:col-span-8 space-y-10">
            <div className="space-y-4 animate-fade-in-up">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-on-surface mb-2">{listing.title}</h1>
                  <div className="flex items-center gap-2 text-on-surface-variant font-medium">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    <span>{listing.city}, {listing.district}</span>
                  </div>
                </div>
                <div className="sm:text-right shrink-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Asking Price</p>
                  <p className="text-2xl sm:text-3xl font-headline font-black text-primary">{formatPrice(listing.price)}</p>
                </div>
              </div>

              {/* Specs strip */}
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: 'category',       label: listing.propertyType.toLowerCase(),   title: 'Type' },
                  { icon: 'local_offer',    label: listing.listingType.toLowerCase(),    title: 'Sale type' },
                  listing.bedrooms !== null && { icon: 'bed',      label: `${listing.bedrooms} bed`,  title: 'Bedrooms' },
                  listing.bathrooms !== null && { icon: 'bathroom', label: `${listing.bathrooms} bath`, title: 'Bathrooms' },
                  listing.squareMeters !== null && { icon: 'square_foot', label: `${listing.squareMeters} m²`, title: 'Area' },
                ].filter(Boolean).map((spec: any) => (
                  <div key={spec.title} className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-xl text-sm font-bold text-on-surface capitalize">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">{spec.icon}</span>
                    {spec.label}
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/10">
                <h3 className="font-headline font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                  Property Overview
                </h3>
                <p className="text-on-surface-variant leading-relaxed text-base border-l-4 border-primary/20 pl-5 whitespace-pre-wrap">
                  {listing.description}
                </p>
              </div>
            </div>

            {/* Trust Chain */}
            <section className="animate-fade-in-up stagger-2">
              <div className="flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                <h2 className="text-lg font-bold font-headline tracking-tight">Verification Chain</h2>
              </div>
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-6">
                {/* Horizontal stepper */}
                <div className="relative grid grid-cols-4 gap-2">
                  {/* Connecting line behind the dots */}
                  <div className="hidden sm:block absolute top-5 left-[12.5%] right-[12.5%] h-0.5 bg-surface-container-high z-0" />
                  {[
                    {
                      icon: 'upload_file',
                      label: 'Docs Submitted',
                      desc: `${listing._count?.documents || 0} uploaded`,
                      done: (listing._count?.documents || 0) > 0,
                    },
                    {
                      icon: 'manage_search',
                      label: 'Legal Review',
                      desc: 'By legal ops team',
                      done: ['APPROVED', 'PUBLISHED'].includes(listing.status) || listing.badge !== 'NONE',
                    },
                    {
                      icon: 'verified',
                      label: 'Badge Issued',
                      desc: listing.badge === 'NONE' ? 'Pending' : listing.badge.replace('VERIFIED_', ''),
                      done: listing.badge !== 'NONE',
                    },
                    {
                      icon: 'home_search',
                      label: 'Inspections',
                      desc: `${listing._count?.inspections || 0} completed`,
                      done: (listing._count?.inspections || 0) > 0,
                    },
                  ].map(step => (
                    <div key={step.label} className="flex flex-col items-center text-center gap-2 relative z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        step.done
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'bg-white border-surface-container-high text-on-surface-variant/40'
                      }`}>
                        <span className="material-symbols-outlined text-base"
                          style={{ fontVariationSettings: step.done ? "'FILL' 1" : "'FILL' 0" }}>
                          {step.done ? 'check' : step.icon}
                        </span>
                      </div>
                      <div>
                        <p className={`text-[11px] font-bold leading-tight ${step.done ? 'text-on-surface' : 'text-on-surface-variant/50'}`}>
                          {step.label}
                        </p>
                        <p className={`text-[10px] mt-0.5 ${step.done ? 'text-on-surface-variant' : 'text-on-surface-variant/30'}`}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Documents section */}
            {listing.documentsAvailable && (
              <section className="space-y-5 animate-fade-in-up stagger-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>folder_open</span>
                    <h2 className="text-lg font-bold font-headline tracking-tight">Verified Document Vault</h2>
                  </div>
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                    AI Reviewed
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-surface-container-low p-6 rounded-2xl hover:bg-surface-container transition-colors cursor-pointer group border border-transparent hover:border-outline-variant/20">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-blue-600 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                      </div>
                      <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors text-sm">lock</span>
                    </div>
                    <h4 className="font-headline font-bold">Property Documents</h4>
                    <p className="text-xs text-on-surface-variant mt-1">{listing._count?.documents || 0} verified document{(listing._count?.documents || 0) !== 1 ? 's' : ''}</p>
                    <p className="text-xs text-primary font-bold mt-3 flex items-center gap-1 group-hover:underline">
                      Unlock to view <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-5">
            <div className="sticky top-28 space-y-4 animate-fade-in-up stagger-1">
              {/* CTA card */}
              <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
                {/* Price header */}
                <div className="bg-surface-container-low px-6 py-5 border-b border-outline-variant/10">
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Asking Price</p>
                  <p className="text-3xl font-black font-headline text-on-surface">{formatPrice(listing.price)}</p>
                </div>

                <div className="p-6 space-y-3">
                  {session ? (
                    <>
                      {showDatePicker ? (
                        <div className="bg-surface-container-low rounded-xl p-4 space-y-3 animate-scale-in">
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Select Date &amp; Time</label>
                          <input type="datetime-local" value={inspectionDate}
                            onChange={e => setInspectionDate(e.target.value)}
                            min={new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16)}
                            className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/20 bg-white text-sm font-bold outline-none focus:border-primary transition-colors" />
                          <div className="flex gap-2">
                            <button onClick={() => handleAction('inspection')} disabled={actionLoading === 'inspection'}
                              className="flex-1 py-3 machined-gradient text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
                              {actionLoading === 'inspection'
                                ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Booking…</>
                                : <><span className="material-symbols-outlined text-xs">check</span>Confirm</>}
                            </button>
                            <button onClick={() => setShowDatePicker(false)}
                              className="px-4 py-3 bg-surface-container-high rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-surface-container transition-all">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setShowDatePicker(true)}
                          className="w-full py-3.5 machined-gradient text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-sm hover:shadow-md hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_today</span>
                          Book Inspection
                        </button>
                      )}

                      <button onClick={() => handleAction('unlock')} disabled={actionLoading === 'unlock'}
                        className="w-full py-3.5 bg-surface-container-high text-on-surface font-bold text-sm uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-surface-container transition-all disabled:opacity-50">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>lock_open</span>
                        {actionLoading === 'unlock' ? 'Unlocking…' : 'Unlock Documents'}
                      </button>

                      <button onClick={() => handleAction('escrow')} disabled={actionLoading === 'escrow'}
                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 active:scale-[0.99] transition-all disabled:opacity-50">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
                        {actionLoading === 'escrow' ? 'Creating…' : 'Start Escrow'}
                      </button>
                    </>
                  ) : (
                    <Link href={`/auth/signin?callbackUrl=${encodeURIComponent(`/listings/${params.listingId}`)}`}
                      className="w-full py-4 machined-gradient text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-sm block text-center hover:opacity-95 transition-all">
                      Sign In to Take Action
                    </Link>
                  )}
                </div>

                {/* Fee breakdown */}
                <div className="px-6 pb-6 pt-0 space-y-2.5">
                  <div className="h-px bg-outline-variant/10 mb-4" />
                  {[
                    { label: 'Escrow Service Fee (1%)', value: formatPrice(String(Number(listing.price) * 0.01)) },
                    { label: 'Legal Verification Fee',  value: 'Included' },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center text-xs">
                      <span className="text-on-surface-variant">{row.label}</span>
                      <span className="font-bold text-on-surface">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seller card */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-full machined-gradient flex items-center justify-center text-white font-black font-headline text-base shrink-0">
                  {listing.sellerProfile?.displayName?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold truncate">{listing.sellerProfile?.displayName || 'Unknown'}</h4>
                  <p className="text-xs text-on-surface-variant capitalize flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-xs">verified_user</span>
                    {listing.sellerProfile?.sellerType?.toLowerCase() || 'Seller'} · TrustedPlot
                  </p>
                </div>
              </div>

              {/* Security note */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-emerald-600 text-base shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>shield_lock</span>
                <div>
                  <p className="text-xs font-bold text-emerald-800">Escrow Protected</p>
                  <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">Your funds are held securely until all conditions are met.</p>
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
