import { z } from 'zod';

export const createListingSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  propertyType: z.enum(['APARTMENT', 'HOUSE', 'LAND', 'COMMERCIAL', 'OTHER']),
  listingType: z.enum(['SALE', 'RENT', 'JV']),
  city: z.string().min(2).max(100),
  district: z.string().min(2).max(100),
  addressSummary: z.string().max(500).optional(),
  price: z.number().int().positive(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  squareMeters: z.number().positive().optional(),
});

export const updateListingSchema = createListingSchema.partial();

export const listingSearchSchema = z.object({
  query: z.string().max(200).optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  propertyType: z.enum(['APARTMENT', 'HOUSE', 'LAND', 'COMMERCIAL', 'OTHER']).optional(),
  listingType: z.enum(['SALE', 'RENT', 'JV']).optional(),
  badge: z.enum(['VERIFIED_GOLD', 'VERIFIED_GREEN', 'CONDITIONAL', 'NONE']).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type ListingSearchInput = z.infer<typeof listingSearchSchema>;
