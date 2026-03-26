'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';

interface UploadedDoc {
  file: File;
  documentType: string;
  uploading: boolean;
  uploaded: boolean;
  error: string;
  documentId?: string;
}

const DOC_TYPES = [
  { value: 'CERTIFICATE_OF_OCCUPANCY', label: 'Certificate of Occupancy (C of O)', required: true },
  { value: 'SURVEY_PLAN', label: 'Survey Plan', required: false },
  { value: 'DEED_OF_ASSIGNMENT', label: 'Deed of Assignment', required: false },
  { value: 'GOVERNORS_CONSENT', label: "Governor's Consent", required: false },
  { value: 'RIGHT_OF_OCCUPANCY', label: 'Right of Occupancy', required: false },
  { value: 'LAND_RECEIPT', label: 'Payment Receipt', required: false },
  { value: 'OTHER', label: 'Other Document', required: false },
];

export default function NewListingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [listingId, setListingId] = useState('');
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [selectedDocType, setSelectedDocType] = useState('CERTIFICATE_OF_OCCUPANCY');
  const [form, setForm] = useState({
    title: '', description: '', propertyType: 'APARTMENT', listingType: 'SALE',
    city: 'Lagos', district: '', price: '', bedrooms: '', bathrooms: '',
  });

  function updateField(field: string, value: string) { setForm(prev => ({ ...prev, [field]: value })); }

  async function handleCreateListing(e: React.FormEvent) {
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
      setListingId(data.data.id);
      setStep(2);
    } catch { setError('Something went wrong'); }
    finally { setLoading(false); }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    const file = files[0];
    const newDoc: UploadedDoc = {
      file,
      documentType: selectedDocType,
      uploading: false,
      uploaded: false,
      error: '',
    };
    setDocuments(prev => [...prev, newDoc]);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function uploadDocument(index: number) {
    const doc = documents[index];
    if (!listingId || doc.uploading || doc.uploaded) return;

    setDocuments(prev => prev.map((d, i) => i === index ? { ...d, uploading: true, error: '' } : d));

    try {
      const formData = new FormData();
      formData.append('file', doc.file);
      formData.append('documentType', doc.documentType);

      const res = await fetch(`/api/listings/${listingId}/documents`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setDocuments(prev => prev.map((d, i) => i === index ? { ...d, uploading: false, error: data.error?.message || 'Upload failed' } : d));
        return;
      }

      setDocuments(prev => prev.map((d, i) => i === index ? { ...d, uploading: false, uploaded: true, documentId: data.data.documentId } : d));
    } catch {
      setDocuments(prev => prev.map((d, i) => i === index ? { ...d, uploading: false, error: 'Upload failed' } : d));
    }
  }

  async function uploadAllDocuments() {
    const pending = documents.filter((d, i) => !d.uploaded && !d.uploading);
    for (let i = 0; i < documents.length; i++) {
      if (!documents[i].uploaded && !documents[i].uploading) {
        await uploadDocument(i);
      }
    }
  }

  async function handleSubmitForVerification() {
    if (!listingId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error?.message || 'Failed to submit for verification'); return; }
      setStep(4);
    } catch { setError('Something went wrong'); }
    finally { setLoading(false); }
  }

  function removeDocument(index: number) {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  }

  const allUploaded = documents.length > 0 && documents.every(d => d.uploaded);
  const hasRequired = documents.some(d => d.documentType === 'CERTIFICATE_OF_OCCUPANCY');
  const stepProgress = step === 1 ? 25 : step === 2 ? 50 : step === 3 ? 75 : 100;

  return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black font-headline tracking-tighter text-primary">New Listing</h1>
            <p className="text-on-surface-variant font-medium mt-1">
              {step === 1 ? 'Enter property details.' : step === 2 ? 'Upload verification documents.' : step === 3 ? 'Review and submit for verification.' : 'Listing submitted!'}
            </p>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Step {String(step).padStart(2, '0')} of 04</span>
        </div>

        {/* Stepper */}
        <div className="grid grid-cols-4 gap-4 mb-16">
          {['Details', 'Documents', 'Review', 'Submitted'].map((label, i) => (
            <div key={label} className="relative">
              <div className={`h-1.5 rounded-full ${i + 1 <= step ? 'bg-primary' : 'bg-surface-container-highest'}`} />
              <span className={`absolute -bottom-6 left-0 text-[10px] font-bold uppercase tracking-widest ${i + 1 <= step ? 'text-primary' : 'text-outline'}`}>{label}</span>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-8 p-4 bg-error-container rounded-lg border-l-4 border-error">
            <p className="text-sm text-on-error-container font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-16">
          <div className="lg:col-span-8">
            {/* Step 1: Property Details */}
            {step === 1 && (
              <form onSubmit={handleCreateListing} className="space-y-12">
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
                          className="w-full pl-10 pr-4 py-4 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all font-headline font-bold text-lg" />
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

                <div className="flex items-center justify-between pt-8">
                  <Link href="/dashboard" className="flex items-center gap-2 text-on-surface-variant font-bold hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Dashboard
                  </Link>
                  <button type="submit" disabled={loading}
                    className="machined-gradient text-on-primary px-10 py-4 rounded-lg font-bold tracking-widest uppercase hover:opacity-95 transition-all shadow-lg disabled:opacity-50">
                    {loading ? 'Creating...' : 'Continue to Documents'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Document Upload */}
            {step === 2 && (
              <div className="space-y-8">
                <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">verified_user</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold font-headline tracking-tight">Upload Verification Documents</h2>
                      <p className="text-xs text-on-surface-variant font-medium">Upload legal certificates for property verification</p>
                    </div>
                  </div>

                  {/* Document type selector + file input */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <select value={selectedDocType} onChange={e => setSelectedDocType(e.target.value)}
                      className="flex-1 px-4 py-3 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all font-bold text-sm">
                      {DOC_TYPES.map(dt => (
                        <option key={dt.value} value={dt.value}>{dt.label}{dt.required ? ' *' : ''}</option>
                      ))}
                    </select>
                    <label className="machined-gradient text-white px-6 py-3 rounded-lg font-bold text-sm tracking-widest uppercase cursor-pointer hover:opacity-90 active:scale-95 transition-all flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">cloud_upload</span>
                      Choose File
                      <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={handleFileSelect} />
                    </label>
                  </div>

                  {/* Uploaded documents list */}
                  {documents.length > 0 && (
                    <div className="space-y-3 mb-6">
                      {documents.map((doc, i) => (
                        <div key={i} className={`flex items-center gap-4 p-4 rounded-lg border ${doc.uploaded ? 'bg-tertiary-fixed/5 border-tertiary-fixed/20' : doc.error ? 'bg-error-container/30 border-error/20' : 'bg-surface-container-low border-outline-variant/10'}`}>
                          <span className="material-symbols-outlined text-sm shrink-0">
                            {doc.uploaded ? 'check_circle' : doc.uploading ? 'hourglass_empty' : doc.error ? 'error' : 'description'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{doc.file.name}</p>
                            <p className="text-[10px] text-on-surface-variant">
                              {DOC_TYPES.find(dt => dt.value === doc.documentType)?.label} — {(doc.file.size / 1024).toFixed(0)}KB
                            </p>
                            {doc.error && <p className="text-[10px] text-error mt-1">{doc.error}</p>}
                          </div>
                          {!doc.uploaded && !doc.uploading && (
                            <button onClick={() => removeDocument(i)} className="text-on-surface-variant hover:text-error transition-colors">
                              <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                          )}
                          {doc.uploaded && <span className="text-[10px] font-bold text-tertiary-fixed">Uploaded</span>}
                          {doc.uploading && <span className="text-[10px] font-bold text-on-surface-variant animate-pulse">Uploading...</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {documents.length === 0 && (
                    <div className="group relative border-2 border-dashed border-outline-variant rounded-xl p-8 text-center cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}>
                      <span className="material-symbols-outlined text-4xl text-outline mb-2">cloud_upload</span>
                      <p className="text-sm font-bold">Click to select documents</p>
                      <p className="text-xs text-on-surface-variant mt-1">PDF, JPEG, PNG — Max 10MB per file</p>
                    </div>
                  )}

                  {!hasRequired && documents.length > 0 && (
                    <p className="text-xs text-secondary font-bold mt-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">info</span>
                      Certificate of Occupancy is required for verification
                    </p>
                  )}
                </section>

                <div className="flex items-center justify-between pt-8">
                  <button onClick={() => setStep(1)} className="flex items-center gap-2 text-on-surface-variant font-bold hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Details
                  </button>
                  <div className="flex gap-3">
                    {documents.length > 0 && !allUploaded && (
                      <button onClick={uploadAllDocuments} disabled={loading}
                        className="bg-surface-container-high text-on-surface px-6 py-4 rounded-lg font-bold tracking-widest uppercase text-sm hover:bg-surface-container-highest transition-all disabled:opacity-50">
                        Upload All
                      </button>
                    )}
                    <button onClick={() => setStep(3)} disabled={!allUploaded}
                      className="machined-gradient text-on-primary px-10 py-4 rounded-lg font-bold tracking-widest uppercase hover:opacity-95 transition-all shadow-lg disabled:opacity-50">
                      Continue to Review
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-8">
                <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10">
                  <h2 className="text-xl font-bold font-headline tracking-tight mb-6">Review Your Listing</h2>
                  <dl className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-outline-variant/10">
                      <dt className="text-on-surface-variant text-sm">Title</dt>
                      <dd className="font-bold text-sm">{form.title}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-outline-variant/10">
                      <dt className="text-on-surface-variant text-sm">Price</dt>
                      <dd className="font-bold text-sm font-headline">&#8358;{parseInt(form.price).toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-outline-variant/10">
                      <dt className="text-on-surface-variant text-sm">Location</dt>
                      <dd className="font-bold text-sm">{form.city}, {form.district}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-outline-variant/10">
                      <dt className="text-on-surface-variant text-sm">Type</dt>
                      <dd className="font-bold text-sm capitalize">{form.propertyType.toLowerCase()} — {form.listingType.toLowerCase()}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-outline-variant/10">
                      <dt className="text-on-surface-variant text-sm">Documents</dt>
                      <dd className="font-bold text-sm">{documents.filter(d => d.uploaded).length} uploaded</dd>
                    </div>
                  </dl>
                </section>

                <div className="bg-secondary-fixed/10 rounded-xl p-6 border border-secondary-fixed/20">
                  <p className="text-sm font-bold text-on-secondary-fixed mb-2">Ready to submit for verification?</p>
                  <p className="text-xs text-on-surface-variant">Your listing and documents will be reviewed by our legal verification team within 48 hours.</p>
                </div>

                <div className="flex items-center justify-between pt-8">
                  <button onClick={() => setStep(2)} className="flex items-center gap-2 text-on-surface-variant font-bold hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Documents
                  </button>
                  <div className="flex gap-3">
                    <button onClick={() => router.push('/dashboard')}
                      className="bg-surface-container-high text-on-surface px-6 py-4 rounded-lg font-bold tracking-widest uppercase text-sm hover:bg-surface-container-highest transition-all">
                      Save as Draft
                    </button>
                    <button onClick={handleSubmitForVerification} disabled={loading}
                      className="machined-gradient text-on-primary px-10 py-4 rounded-lg font-bold tracking-widest uppercase hover:opacity-95 transition-all shadow-lg disabled:opacity-50">
                      {loading ? 'Submitting...' : 'Submit for Verification'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-tertiary-fixed/20 flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-4xl text-tertiary-fixed">check_circle</span>
                </div>
                <h2 className="text-3xl font-black font-headline tracking-tight mb-3">Listing Submitted!</h2>
                <p className="text-on-surface-variant max-w-md mx-auto mb-8">
                  Your listing has been submitted for legal verification. Our team will review your documents within 48 hours.
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href="/dashboard" className="machined-gradient text-white px-8 py-3 rounded-lg font-bold text-sm tracking-widest uppercase">
                    Go to Dashboard
                  </Link>
                  <Link href={`/listings/${listingId}`} className="bg-surface-container-high text-on-surface px-8 py-3 rounded-lg font-bold text-sm tracking-widest uppercase">
                    View Listing
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Side Panel */}
          {step < 4 && (
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
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
