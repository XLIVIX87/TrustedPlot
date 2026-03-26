'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';

export default function NewListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', propertyType: 'APARTMENT', listingType: 'SALE',
    city: 'Lagos', district: '', price: '', bedrooms: '', bathrooms: '',
  });

  function updateField(field: string, value: string) { setForm(prev => ({ ...prev, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form, price: parseInt(form.price),
          bedrooms: form.bedrooms ? parseInt(form.bedrooms) : undefined,
          bathrooms: form.bathrooms ? parseInt(form.bathrooms) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error?.message || 'Failed to create listing'); return; }
      router.push('/dashboard');
    } catch { setError('Something went wrong'); }
    finally { setLoading(false); }
  }

  return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black font-headline tracking-tighter text-primary">New Listing</h1>
            <p className="text-on-surface-variant font-medium mt-1">Begin the verification process for your property.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Step 01 of 02</span>
          </div>
        </div>

        {/* Stepper */}
        <div className="grid grid-cols-4 gap-4 mb-16">
          <div className="h-1.5 rounded-full bg-primary relative">
            <span className="absolute -bottom-6 left-0 text-[10px] font-bold uppercase tracking-widest text-primary">Details</span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-container-highest relative">
            <span className="absolute -bottom-6 left-0 text-[10px] font-bold uppercase tracking-widest text-outline">Documents</span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-container-highest relative">
            <span className="absolute -bottom-6 left-0 text-[10px] font-bold uppercase tracking-widest text-outline">Confirmation</span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-container-highest relative">
            <span className="absolute -bottom-6 left-0 text-[10px] font-bold uppercase tracking-widest text-outline">Review</span>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-error-container rounded-lg border-l-4 border-error">
            <p className="text-sm text-on-error-container font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-16">
          <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-12">
            {/* Property Specs */}
            <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">landscape</span>
                </div>
                <h2 className="text-xl font-bold font-headline tracking-tight">Property Specifications</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Property Title</label>
                  <input type="text" value={form.title} onChange={e => updateField('title', e.target.value)} required minLength={5}
                    className="w-full px-4 py-4 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all font-headline font-bold text-lg"
                    placeholder="e.g. 3 Bedroom Apartment in Lekki Phase 1" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Description</label>
                  <textarea rows={4} value={form.description} onChange={e => updateField('description', e.target.value)} required minLength={20}
                    className="w-full px-4 py-4 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all font-body"
                    placeholder="Describe the property, features, and surroundings..." />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Listing Price (NGN)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">&#8358;</span>
                    <input type="number" value={form.price} onChange={e => updateField('price', e.target.value)} required min={1}
                      className="w-full pl-10 pr-4 py-4 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all font-headline font-bold text-lg"
                      placeholder="50,000,000" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Property Type</label>
                  <select value={form.propertyType} onChange={e => updateField('propertyType', e.target.value)}
                    className="w-full px-4 py-4 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all font-headline font-bold text-lg">
                    <option value="APARTMENT">Apartment</option>
                    <option value="HOUSE">House</option>
                    <option value="LAND">Land</option>
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Listing Type</label>
                  <select value={form.listingType} onChange={e => updateField('listingType', e.target.value)}
                    className="w-full px-4 py-4 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all font-headline font-bold text-lg">
                    <option value="SALE">For Sale</option>
                    <option value="RENT">For Rent</option>
                    <option value="JV">Joint Venture</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">City</label>
                  <select value={form.city} onChange={e => updateField('city', e.target.value)}
                    className="w-full px-4 py-4 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all font-headline font-bold text-lg">
                    <option value="Lagos">Lagos</option>
                    <option value="Abuja">Abuja</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Full Physical Address / District</label>
                  <input type="text" value={form.district} onChange={e => updateField('district', e.target.value)} required
                    className="w-full px-4 py-4 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all font-headline font-bold text-lg"
                    placeholder="Plot 14, Admiralty Way, Lekki Phase 1" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Bedrooms</label>
                  <input type="number" value={form.bedrooms} onChange={e => updateField('bedrooms', e.target.value)} min={0}
                    className="w-full px-4 py-4 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all font-headline font-bold text-lg" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Bathrooms</label>
                  <input type="number" value={form.bathrooms} onChange={e => updateField('bathrooms', e.target.value)} min={0}
                    className="w-full px-4 py-4 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all font-headline font-bold text-lg" />
                </div>
              </div>
            </section>

            {/* Document Upload */}
            <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">verified_user</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold font-headline tracking-tight">Digital Architect Ledger</h2>
                  <p className="text-xs text-on-surface-variant font-medium">Upload high-resolution legal certificates</p>
                </div>
              </div>
              <div className="group relative border-2 border-dashed border-outline-variant rounded-xl p-8 text-center hover:border-primary hover:bg-surface-container-low transition-all cursor-pointer">
                <div className="flex flex-col items-center">
                  <span className="material-symbols-outlined text-4xl text-outline mb-2 group-hover:text-primary">cloud_upload</span>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold">Certificate of Occupancy (C of O)</span>
                    <span className="bg-secondary-fixed text-on-secondary-fixed text-[10px] font-black px-2 py-0.5 rounded uppercase">Required</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">Drag and drop or click to browse (PDF, JPEG, PNG)</p>
                </div>
              </div>
            </section>

            {/* Actions */}
            <div className="flex items-center justify-between pt-8">
              <Link href="/dashboard" className="flex items-center gap-2 text-on-surface-variant font-bold hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to Dashboard
              </Link>
              <button type="submit" disabled={loading}
                className="machined-gradient text-on-primary px-10 py-4 rounded-lg font-bold tracking-widest uppercase hover:opacity-95 transition-all shadow-lg disabled:opacity-50">
                {loading ? 'Submitting...' : 'Save as Draft'}
              </button>
            </div>
          </form>

          {/* Side Panel */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-primary-container text-on-primary-container p-8 rounded-xl space-y-6">
              <h3 className="text-lg font-black font-headline text-white tracking-tight">Trust Guidelines</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <span className="material-symbols-outlined text-secondary-fixed shrink-0">visibility</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">Visual Clarity</h4>
                    <p className="text-xs mt-1 text-on-primary-container/80 leading-relaxed">Ensure all stamps and signatures on your C of O are clearly visible.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="material-symbols-outlined text-secondary-fixed shrink-0">verified</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">Metadata Match</h4>
                    <p className="text-xs mt-1 text-on-primary-container/80 leading-relaxed">The address entered must match the registered survey plan exactly.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="material-symbols-outlined text-secondary-fixed shrink-0">lock_reset</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">Escrow Protocol</h4>
                    <p className="text-xs mt-1 text-on-primary-container/80 leading-relaxed">TrustedPlot holds all listing fees in a secure ledger until verification is complete.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-high p-6 rounded-xl border border-outline-variant/20">
              <p className="text-xs font-bold text-on-surface-variant mb-3 uppercase tracking-widest">Need Assistance?</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-primary">support_agent</span>
                </div>
                <div>
                  <p className="text-sm font-bold">Talk to a Notary</p>
                  <p className="text-xs text-on-surface-variant">Available 24/7 for premium members</p>
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
