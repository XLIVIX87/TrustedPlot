import Link from 'next/link';
import { VerificationBadge } from './badge';

interface ListingCardProps {
  id: string;
  title: string;
  city: string;
  district: string;
  price: string;
  propertyType: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  badge: string;
  thumbnailUrl?: string;
}

export function ListingCard({ id, title, city, district, price, propertyType, bedrooms, bathrooms, badge, thumbnailUrl }: ListingCardProps) {
  const formattedPrice = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Number(price));

  return (
    <Link href={`/listings/${id}`} className="group block">
      <div className="rounded-lg border border-border bg-white overflow-hidden transition-shadow hover:shadow-md">
        {/* Image */}
        <div className="aspect-[16/9] bg-gray-100 relative">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <VerificationBadge badge={badge} />
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-brand-dark line-clamp-2 group-hover:text-brand-primary">
            {title}
          </h3>
          <p className="text-xs text-gray-500 mt-1">{city}, {district}</p>
          <div className="flex items-center justify-between mt-3">
            <p className="text-sm font-bold text-brand-dark">{formattedPrice}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {bedrooms != null && <span>{bedrooms} bed</span>}
              {bathrooms != null && <span>{bathrooms} bath</span>}
              <span className="capitalize">{propertyType.toLowerCase()}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
