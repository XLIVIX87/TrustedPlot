import Link from 'next/link';

export default function DocumentViewerPage({ params }: { params: { documentId: string } }) {
  return (
    <main className="min-h-screen bg-page">
      <header className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold text-brand-dark">TrustedPlot</Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document viewer */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-semibold text-brand-dark">Document Viewer</h2>
                <span className="text-xs text-gray-400 font-mono">{params.documentId}</span>
              </div>
              <div className="aspect-[3/4] bg-gray-50 flex items-center justify-center relative">
                {/* Watermark overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                  <span className="text-6xl font-bold text-brand-dark rotate-[-30deg]">TRUSTEDPLOT</span>
                </div>
                <p className="text-gray-400">Document preview area</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Document info */}
            <div className="bg-white rounded-lg border border-border p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Document Info</h3>
              <dl className="space-y-3 text-sm">
                <div><dt className="text-gray-500">Type</dt><dd className="font-medium">—</dd></div>
                <div><dt className="text-gray-500">Uploaded</dt><dd className="font-medium">—</dd></div>
                <div><dt className="text-gray-500">Status</dt><dd className="font-medium">—</dd></div>
              </dl>
            </div>

            {/* AI Summary */}
            <div className="bg-white rounded-lg border border-border p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">AI Summary</h3>
              <p className="text-sm text-gray-500 mb-4">Get an AI-generated summary of this document.</p>
              <button className="w-full rounded-md bg-brand-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                Generate Summary
              </button>
              <p className="text-xs text-gray-400 mt-3">
                AI summaries are for convenience only and do not replace legal verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
