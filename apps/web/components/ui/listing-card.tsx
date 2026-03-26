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
    <Link href={`/listings/${id}`} className="group cursor-pointer block">
      <div className="relative overflow-hidden rounded-xl bg-surface-container mb-4 aspect-[4/3]">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-container-low">
            <span className="material-symbols-outlined text-5xl text-outline-variant">landscape</span>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <VerificationBadge badge={badge} />
        </div>
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-primary font-label">
          ID: {id.slice(0, 8).toUpperCase()}
        </div>
      </div>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-headline font-bold text-on-surface mb-1 group-hover:underline decoration-2 underline-offset-4">
            {title}
          </h3>
          <p className="text-on-surface-variant text-sm flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">location_on</span>
            {city}, {district}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-headline font-black text-primary">{formattedPrice}</p>
          {badge !== 'NONE' && (
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">Escrow Protected</p>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-6 border-t border-outline-variant/20 pt-4">
        {bedrooms != null && (
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <span className="material-symbols-outlined text-lg">bed</span>
            <span className="text-xs font-semibold">{bedrooms} Beds</span>
          </div>
        )}
        {bathrooms != null && (
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <span className="material-symbols-outlined text-lg">bathtub</span>
            <span className="text-xs font-semibold">{bathrooms} Baths</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-on-surface-variant">
          <span className="material-symbols-outlined text-lg">apartment</span>
          <span className="text-xs font-semibold capitalize">{propertyType.toLowerCase()}</span>
        </div>
      </div>
    </Link>
  );
}
