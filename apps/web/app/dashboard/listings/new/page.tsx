'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Navbar } from '@/components/ui/navbar';

export default function NewListingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    propertyType: 'APARTMENT',
    listingType: 'SALE',
    city: 'Lagos',
    district: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
  });

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseInt(form.price),
          bedrooms: form.bedrooms ? parseInt(form.bedrooms) : undefined,
          bathrooms: form.bathrooms ? parseInt(form.bathrooms) : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || 'Failed to create listing');
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-page">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/dashboard" className="text-sm text-brand-primary hover:underline mb-4 inline-block">&larr; Back to Dashboard</Link>
        <h1 className="text-2xl font-bold text-brand-dark mb-8">Create New Listing</h1>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-status-error">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-brand-dark mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" value={form.title} onChange={(e) => updateField('title', e.target.value)} required minLength={5} className="w-full rounded-md border border-border px-3 py-2 text-sm" placeholder="e.g. 3 Bedroom Apartment in Lekki Phase 1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea rows={4} value={form.description} onChange={(e) => updateField('description', e.target.value)} required minLength={20} className="w-full rounded-md border border-border px-3 py-2 text-sm" placeholder="Describe the property..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                  <select value={form.propertyType} onChange={(e) => updateField('propertyType', e.target.value)} className="w-full rounded-md border border-border px-3 py-2 text-sm">
                    <option value="APARTMENT">Apartment</option>
                    <option value="HOUSE">House</option>
                    <option value="LAND">Land</option>
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Listing Type</label>
                  <select value={form.listingType} onChange={(e) => updateField('listingType', e.target.value)} className="w-full rounded-md border border-border px-3 py-2 text-sm">
                    <option value="SALE">For Sale</option>
                    <option value="RENT">For Rent</option>
                    <option value="JV">Joint Venture</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-brand-dark mb-4">Location</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <select value={form.city} onChange={(e) => updateField('city', e.target.value)} className="w-full rounded-md border border-border px-3 py-2 text-sm">
                  <option value="Lagos">Lagos</option>
                  <option value="Abuja">Abuja</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                <input type="text" value={form.district} onChange={(e) => updateField('district', e.target.value)} required className="w-full rounded-md border border-border px-3 py-2 text-sm" placeholder="e.g. Lekki Phase 1" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-brand-dark mb-4">Pricing & Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (NGN) *</label>
                <input type="number" value={form.price} onChange={(e) => updateField('price', e.target.value)} required min={1} className="w-full rounded-md border border-border px-3 py-2 text-sm" placeholder="e.g. 120000000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <input type="number" value={form.bedrooms} onChange={(e) => updateField('bedrooms', e.target.value)} min={0} className="w-full rounded-md border border-border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <input type="number" value={form.bathrooms} onChange={(e) => updateField('bathrooms', e.target.value)} min={0} className="w-full rounded-md border border-border px-3 py-2 text-sm" />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={loading} className="rounded-md bg-brand-primary px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Creating...' : 'Save as Draft'}
            </button>
            <Link href="/dashboard" className="rounded-md border border-border px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
