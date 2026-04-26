'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';

interface InspectionDetail {
  id: string;
  status: string;
  slotAt: string;
  listing: { id: string; title: string; city: string; district: string; addressSummary: string | null };
  buyer: { name: string | null; email: string };
  report: { summary: string; createdAt: string } | null;
}

const CONDITION_OPTIONS = [
  { value: 'excellent', label: 'Excellent', color: 'tertiary' },
  { value: 'good', label: 'Good', color: 'primary' },
  { value: 'fair', label: 'Fair', color: 'secondary' },
  { value: 'poor', label: 'Poor', color: 'error' },
];

const RECOMMENDATION_OPTIONS = [
  { value: 'proceed', label: 'Recommend Proceed' },
  { value: 'conditional', label: 'Proceed with Conditions' },
  { value: 'do_not_proceed', label: 'Do Not Proceed' },
];

export default function InspectionReportPage({ params }: { params: { inspectionId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [inspection, setInspection] = useState<InspectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [summary, setSummary] = useState('');
  const [notes, setNotes] = useState('');
  const [condition, setCondition] = useState('good');
  const [recommendation, setRecommendation] = useState('proceed');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) { router.push(`/auth/signin?callbackUrl=/inspections/${params.inspectionId}/report`); return; }
    const role = (session.user as any)?.role;
    if (role !== 'INSPECTOR' && role !== 'ADMIN') {
      setError('Only inspectors can submit reports.');
      setLoading(false);
      return;
    }
    async function load() {
      try {
        const res = await fetch(`/api/inspections/${params.inspectionId}`);
        const data = await res.json();
        if (data.data) setInspection(data.data);
        else setError(data?.error?.message || 'Inspection not found');
      } catch { setError('Failed to load inspection'); }
      finally { setLoading(false); }
    }
    load();
  }, [params.inspectionId, session, status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/inspections/${params.inspectionId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary,
          notes: notes || undefined,
          reportData: { condition, recommendation },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push('/inspections');
      } else {
        setError(data?.error?.message || 'Failed to submit report');
      }
    } catch { setError('Something went wrong'); }
    finally { setSubmitting(false); }
  }

  if (loading) return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-32 px-8 max-w-4xl mx-auto animate-pulse">
        <div className="h-8 bg-surface-container-low rounded w-1/2 mb-6" />
        <div className="h-64 bg-surface-container-low rounded mb-6" />
        <div className="h-40 bg-surface-container-low rounded" />
      </div>
    </main>
  );

  if (error && !inspection) return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-32 px-8 max-w-4xl mx-auto text-center py-20">
        <span className="material-symbols-outlined text-5xl text-outline-variant mb-4 block">error</span>
        <p className="font-headline font-bold text-xl">{error}</p>
        <Link href="/inspections" className="text-primary font-bold text-sm hover:underline mt-4 inline-block">Back to inspections</Link>
      </div>
    </main>
  );

  if (!inspection) return null;

  const slotDate = new Date(inspection.slotAt);
  const reportAlreadySubmitted = !!inspection.report;

  return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-24 pb-16 px-4 md:px-8 max-w-4xl mx-auto">
        <Link href="/inspections" className="text-sm text-on-surface-variant hover:text-primary mb-4 inline-flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back to inspections
        </Link>

        <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tight mb-2">Submit Inspection Report</h1>
        <p className="text-on-surface-variant mb-8">Provide a thorough on-site evaluation. Your report becomes part of the property&apos;s permanent ledger.</p>

        {/* Inspection summary */}
        <div className="bg-surface-container-lowest rounded-xl p-6 mb-8 border border-outline-variant/10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <Link href={`/listings/${inspection.listing.id}`} className="font-headline font-bold text-lg hover:text-primary">
                {inspection.listing.title}
              </Link>
              <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {inspection.listing.city}, {inspection.listing.district}
                {inspection.listing.addressSummary && <span className="text-xs"> · {inspection.listing.addressSummary}</span>}
              </p>
              <p className="text-sm text-on-surface-variant mt-1">
                Buyer: <strong>{inspection.buyer.name || inspection.buyer.email}</strong>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-on-surface-variant font-label">Scheduled</p>
              <p className="font-headline font-bold">{slotDate.toLocaleDateString('en-NG', { dateStyle: 'medium' })}</p>
              <p className="text-sm text-on-surface-variant">{slotDate.toLocaleTimeString('en-NG', { timeStyle: 'short' })}</p>
            </div>
          </div>
        </div>

        {reportAlreadySubmitted ? (
          <div className="bg-tertiary-fixed/20 rounded-xl p-6 border-l-4 border-tertiary">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-tertiary">check_circle</span>
              <div>
                <h3 className="font-headline font-bold mb-2">Report already submitted</h3>
                <p className="text-sm text-on-surface-variant mb-3">This inspection was reported on {new Date(inspection.report!.createdAt).toLocaleDateString('en-NG', { dateStyle: 'long' })}.</p>
                <details className="text-sm">
                  <summary className="cursor-pointer text-primary font-medium">View summary</summary>
                  <p className="mt-3 text-on-surface-variant whitespace-pre-wrap leading-relaxed">{inspection.report!.summary}</p>
                </details>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-error-container rounded-lg border-l-4 border-error p-4">
                <p className="text-sm text-on-error-container font-medium">{error}</p>
              </div>
            )}

            {/* Property condition */}
            <fieldset className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10">
              <legend className="px-2 font-headline font-bold">Property Condition</legend>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {CONDITION_OPTIONS.map(o => (
                  <button key={o.value} type="button" onClick={() => setCondition(o.value)}
                    className={`py-3 px-4 rounded-lg border-2 transition-all font-headline font-bold text-sm ${condition === o.value ? 'border-primary bg-primary text-white' : 'border-outline-variant bg-surface-container-low hover:border-primary'}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Recommendation */}
            <fieldset className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10">
              <legend className="px-2 font-headline font-bold">Recommendation</legend>
              <div className="space-y-2 mt-4">
                {RECOMMENDATION_OPTIONS.map(o => (
                  <label key={o.value} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${recommendation === o.value ? 'bg-primary-fixed border-2 border-primary' : 'bg-surface-container-low border-2 border-transparent hover:border-outline-variant'}`}>
                    <input type="radio" name="rec" value={o.value} checked={recommendation === o.value} onChange={e => setRecommendation(e.target.value)} className="accent-primary" />
                    <span className="font-medium">{o.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Summary */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">
                Inspection Summary <span className="text-error">*</span>
              </label>
              <p className="text-xs text-on-surface-variant mb-2">Minimum 20 characters. Describe the property&apos;s overall condition, key findings, and any concerns.</p>
              <textarea value={summary} onChange={e => setSummary(e.target.value)} required minLength={20} maxLength={5000} rows={6}
                className="w-full px-4 py-3 bg-surface-container-low rounded-lg border border-outline-variant focus:border-primary focus:ring-0 text-sm font-medium leading-relaxed resize-y"
                placeholder="On arrival, the property was found to be in excellent condition. The structural integrity is sound, all utilities functional, and the security infrastructure operational..." />
              <p className="text-xs text-on-surface-variant mt-1">{summary.length} / 5000 characters</p>
            </div>

            {/* Notes */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">
                Internal Notes <span className="text-on-surface-variant normal-case">(optional)</span>
              </label>
              <p className="text-xs text-on-surface-variant mb-2">Notes for legal ops & admin. Not shown to buyer.</p>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} maxLength={5000} rows={4}
                className="w-full px-4 py-3 bg-surface-container-low rounded-lg border border-outline-variant focus:border-primary focus:ring-0 text-sm font-medium leading-relaxed resize-y"
                placeholder="Any concerns or observations to flag..." />
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={submitting || summary.length < 20}
                className="px-8 py-4 machined-gradient text-white rounded-lg font-headline font-bold text-sm uppercase tracking-widest shadow-md hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {submitting ? (
                  <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> Submitting…</>
                ) : (
                  <><span className="material-symbols-outlined text-sm">task_alt</span> Submit Report</>
                )}
              </button>
              <Link href="/inspections" className="px-6 py-4 bg-surface-container-high text-on-surface rounded-lg font-headline font-bold text-sm uppercase tracking-widest">
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
      <Footer />
    </main>
  );
}
