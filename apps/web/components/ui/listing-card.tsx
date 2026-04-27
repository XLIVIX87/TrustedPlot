import Link from 'next/link';
import { VerificationBadge } from './badge';

const PROPERTY_TYPE_CONFIG: Record<string, { icon: string; label: string }> = {
  APARTMENT: { icon: 'apartment', label: 'Apartment' },
  HOUSE:     { icon: 'cottage',   label: 'House' },
  LAND:      { icon: 'landscape', label: 'Land' },
  COMMERCIAL:{ icon: 'business',  label: 'Commercial' },
};

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

  const typeConfig = PROPERTY_TYPE_CONFIG[propertyType] ?? { icon: 'home', label: propertyType };

  return (
    <Link href={`/listings/${id}`} className="group cursor-pointer block">
      {/* Photo */}
      <div className="relative overflow-hidden rounded-2xl aspect-[4/3] mb-4 shadow-sm group-hover:shadow-xl transition-shadow duration-500">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined text-6xl text-slate-300">{typeConfig.icon}</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Photo</span>
          </div>
        )}

        {/* Gradient overlay — darkens bottom for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Verification badge — top left */}
        <div className="absolute top-3 left-3">
          <VerificationBadge badge={badge} />
        </div>

        {/* Escrow pill — top right */}
        {badge !== 'NONE' && (
          <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm border border-white/20 text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-widest uppercase flex items-center gap-1">
            <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
            Escrow
          </div>
        )}

        {/* Price + location — bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-2xl font-headline font-black text-white leading-none mb-1">
            {formattedPrice}
          </p>
          <p className="text-white/80 text-xs font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">location_on</span>
            {city}, {district}
          </p>
        </div>
      </div>

      {/* Title + specs */}
      <div>
        <h3 className="text-base font-headline font-bold text-on-surface mb-1 group-hover:text-primary transition-colors leading-snug line-clamp-2">
          {title}
        </h3>
        <div className="flex items-center gap-4 text-xs text-on-surface-variant mt-2">
          {bedrooms != null && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">bed</span>
              {bedrooms} bd
            </span>
          )}
          {bathrooms != null && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">bathtub</span>
              {bathrooms} ba
            </span>
          )}
          <span className="ml-auto flex items-center gap-1 font-semibold capitalize">
            <span className="material-symbols-outlined text-sm">{typeConfig.icon}</span>
            {typeConfig.label}
          </span>
        </div>
      </div>
    </Link>
  );
}
