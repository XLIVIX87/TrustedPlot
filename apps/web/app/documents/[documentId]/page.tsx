'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';

interface DocumentDetail {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string | null;
  mimeType: string | null;
  status: string;
  uploadedAt: string;
  listing: { id: string; title: string; city: string; district: string };
}

const DOC_TYPE_LABELS: Record<string, string> = {
  C_OF_O: 'Certificate of Occupancy',
  SURVEY_PLAN: 'Survey Plan',
  DEED_OF_ASSIGNMENT: 'Deed of Assignment',
  GOVERNORS_CONSENT: "Governor's Consent",
  BUILDING_APPROVAL: 'Building Approval',
  RECEIPT: 'Payment Receipt',
  OTHER: 'Other Document',
};

export default function DocumentViewerPage({ params }: { params: { documentId: string } }) {
  const { data: session } = useSession();
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    async function fetchDocument() {
      try {
        const res = await fetch(`/api/documents/${params.documentId}`);
        const data = await res.json();
        if (data.data) setDoc(data.data);
        else setError(data.error?.message || 'Document not found');
      } catch { setError('Failed to load document'); }
      finally { setLoading(false); }
    }
    fetchDocument();
  }, [params.documentId]);

  async function handleAiSummary() {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: params.documentId, type: 'document_summary' }),
      });
      const data = await res.json();
      if (data.data?.summary) setAiSummary(data.data.summary);
      else setAiSummary('AI summary is not yet configured for this environment.');
    } catch { setAiSummary('Failed to generate summary.'); }
    finally { setAiLoading(false); }
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });

  if (loading) return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-32 pb-20 px-8 max-w-6xl mx-auto animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 aspect-[3/4] bg-surface-container-low rounded-2xl" />
          <div className="space-y-6">
            <div className="h-48 bg-surface-container-low rounded-2xl" />
            <div className="h-48 bg-surface-container-low rounded-2xl" />
          </div>
        </div>
      </div>
    </main>
  );

  if (error || !doc) return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-32 px-8 max-w-6xl mx-auto text-center py-20">
        <span className="material-symbols-outlined text-5xl text-outline-variant mb-4 block">error</span>
        <p className="font-headline font-bold text-xl">{error || 'Document not found'}</p>
        <Link href="/dashboard" className="text-primary font-bold text-sm hover:underline mt-4 inline-block">Back to Dashboard</Link>
      </div>
    </main>
  );

  const isPdf = doc.mimeType?.includes('pdf') || doc.fileName?.endsWith('.pdf');
  const isImage = doc.mimeType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.fileName || '');

  return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-28 pb-20 px-4 md:px-8 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-6">
          <Link href={`/listings/${doc.listing.id}`} className="hover:text-primary transition-colors font-bold">{doc.listing.title}</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="font-medium">{DOC_TYPE_LABELS[doc.documentType] || doc.documentType}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Document viewer */}
          <div className="lg:col-span-2">
            <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-black/5 overflow-hidden">
              <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-fixed/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-sm">description</span>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold font-headline">{doc.fileName || 'Document'}</h2>
                    <p className="text-[10px] text-on-surface-variant">{DOC_TYPE_LABELS[doc.documentType] || doc.documentType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                    doc.status === 'VERIFIED' ? 'bg-tertiary-fixed/20 text-on-tertiary-fixed' :
                    doc.status === 'PENDING' ? 'bg-secondary-fixed/20 text-on-secondary-fixed' :
                    'bg-surface-container-high text-on-surface-variant'
                  }`}>{doc.status}</span>
                </div>
              </div>

              <div className="aspect-[3/4] bg-surface-container-low relative">
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] select-none">
                  <span className="text-8xl font-black font-headline text-on-surface rotate-[-30deg]">TRUSTEDPLOT</span>
                </div>

                {doc.fileUrl ? (
                  isPdf ? (
                    <iframe src={doc.fileUrl} className="w-full h-full border-0" title={doc.fileName || 'Document'} />
                  ) : isImage ? (
                    <img src={doc.fileUrl} alt={doc.fileName || 'Document'} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                      <span className="material-symbols-outlined text-6xl text-outline-variant">insert_drive_file</span>
                      <p className="text-on-surface-variant font-medium">Preview not available</p>
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="machined-gradient text-white px-6 py-2 rounded-lg font-bold text-sm">
                        Download File
                      </a>
                    </div>
                  )
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                    <span className="material-symbols-outlined text-6xl text-outline-variant">cloud_upload</span>
                    <p className="text-on-surface-variant font-medium">Document not yet uploaded</p>
                    <p className="text-xs text-on-surface-variant">File metadata exists but no file has been stored yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Document info */}
            <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-black/5 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Document Info</p>
              <dl className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs text-outline">category</span> Type
                  </dt>
                  <dd className="font-bold text-on-surface">{DOC_TYPE_LABELS[doc.documentType] || doc.documentType}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs text-outline">calendar_today</span> Uploaded
                  </dt>
                  <dd className="font-bold text-on-surface">{formatDate(doc.uploadedAt)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs text-outline">verified</span> Status
                  </dt>
                  <dd className={`font-bold ${doc.status === 'VERIFIED' ? 'text-tertiary-fixed' : 'text-on-surface'}`}>{doc.status}</dd>
                </div>
              </dl>
            </div>

            {/* Property link */}
            <Link href={`/listings/${doc.listing.id}`} className="block bg-surface-container-lowest rounded-2xl ring-1 ring-black/5 p-6 hover:ring-primary/30 transition-all">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Linked Property</p>
              <p className="font-bold font-headline">{doc.listing.title}</p>
              <p className="text-sm text-on-surface-variant mt-1">{doc.listing.city}, {doc.listing.district}</p>
            </Link>

            {/* AI Summary */}
            <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-black/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">AI Summary</p>
              </div>

              {aiSummary ? (
                <div className="text-sm text-on-surface leading-relaxed bg-surface-container-low p-4 rounded-lg">
                  {aiSummary}
                </div>
              ) : (
                <>
                  <p className="text-sm text-on-surface-variant mb-4">Get an AI-generated summary of this document&apos;s key details.</p>
                  <button onClick={handleAiSummary} disabled={aiLoading}
                    className="w-full machined-gradient text-white px-4 py-3 rounded-lg font-bold text-sm tracking-widest uppercase hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    {aiLoading ? 'Generating...' : 'Generate Summary'}
                  </button>
                </>
              )}

              <p className="text-[10px] text-on-surface-variant mt-3 leading-relaxed">
                AI summaries are for convenience only and do not replace legal verification.
              </p>
            </div>

            {/* Security notice */}
            <div className="bg-primary-container/30 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-sm text-primary">shield</span>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">Security Notice</p>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                This document is served through TrustedPlot&apos;s secure viewer. Screenshots and downloads are logged for audit purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
