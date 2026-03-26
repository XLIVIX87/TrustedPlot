export default function NewListingPage() {
  return (
    <main className="min-h-screen bg-page">
      <header className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <a href="/dashboard" className="text-sm text-brand-primary hover:underline">&larr; Back to Dashboard</a>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-brand-dark mb-8">Create New Listing</h1>

        <form className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-brand-dark mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" className="w-full rounded-md border border-border px-3 py-2 text-sm" placeholder="e.g. 3 Bedroom Apartment in Lekki Phase 1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={4} className="w-full rounded-md border border-border px-3 py-2 text-sm" placeholder="Describe the property..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                  <select className="w-full rounded-md border border-border px-3 py-2 text-sm">
                    <option value="APARTMENT">Apartment</option>
                    <option value="HOUSE">House</option>
                    <option value="LAND">Land</option>
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Listing Type</label>
                  <select className="w-full rounded-md border border-border px-3 py-2 text-sm">
                    <option value="SALE">For Sale</option>
                    <option value="RENT">For Rent</option>
                    <option value="JV">Joint Venture</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-brand-dark mb-4">Location</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <select className="w-full rounded-md border border-border px-3 py-2 text-sm">
                  <option value="Lagos">Lagos</option>
                  <option value="Abuja">Abuja</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <input type="text" className="w-full rounded-md border border-border px-3 py-2 text-sm" placeholder="e.g. Lekki Phase 1" />
              </div>
            </div>
          </div>

          {/* Pricing & Details */}
          <div className="bg-white rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-brand-dark mb-4">Pricing & Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (NGN)</label>
                <input type="number" className="w-full rounded-md border border-border px-3 py-2 text-sm" placeholder="e.g. 120000000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <input type="number" className="w-full rounded-md border border-border px-3 py-2 text-sm" min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <input type="number" className="w-full rounded-md border border-border px-3 py-2 text-sm" min="0" />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-brand-dark mb-4">Documents</h2>
            <p className="text-sm text-gray-500 mb-4">Upload property documents for verification. Supported types: C of O, R of O, Deed of Assignment, Survey Plan, etc.</p>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <p className="text-gray-400 text-sm">Drag and drop documents here, or click to browse</p>
              <button type="button" className="mt-3 rounded-md border border-border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                Choose Files
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button type="submit" className="rounded-md bg-brand-primary px-6 py-3 text-sm font-medium text-white hover:bg-blue-700">
              Save as Draft
            </button>
            <button type="button" className="rounded-md border border-border px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
