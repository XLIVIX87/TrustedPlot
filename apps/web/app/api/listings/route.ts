import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession, requireRole } from '@/lib/auth-guard';
import { apiSuccess, apiValidationError, apiForbidden, apiInternalError } from '@/lib/api-response';
import { listingSearchSchema, createListingSchema } from '@/lib/validators/listings';
import { createAuditLog } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = listingSearchSchema.safeParse(searchParams);

    if (!parsed.success) {
      return apiValidationError('Invalid search parameters', { errors: parsed.error.flatten().fieldErrors });
    }

    const { query, city, district, propertyType, listingType, badge, minPrice, maxPrice, page, pageSize } = parsed.data;

    const where: any = {
      status: { in: ['VERIFIED', 'CONDITIONAL'] },
      visibility: 'PUBLIC',
    };

    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (district) where.district = { contains: district, mode: 'insensitive' };
    if (propertyType) where.propertyType = propertyType;
    if (listingType) where.listingType = listingType;
    if (badge) where.badge = badge;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = BigInt(minPrice);
      if (maxPrice) where.price.lte = BigInt(maxPrice);
    }
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        select: {
          id: true,
          title: true,
          city: true,
          district: true,
          propertyType: true,
          listingType: true,
          price: true,
          bedrooms: true,
          bathrooms: true,
          badge: true,
          createdAt: true,
          media: { take: 1, orderBy: { position: 'asc' } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.listing.count({ where }),
    ]);

    const serialized = listings.map(l => ({
      ...l,
      price: l.price.toString(),
    }));

    return apiSuccess({
      listings: serialized,
      pagination: { page, pageSize, total },
    });
  } catch (error) {
    console.error('Listing search error:', error);
    return apiInternalError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole('SELLER', 'MANDATE');

    const body = await request.json();
    const parsed = createListingSchema.safeParse(body);

    if (!parsed.success) {
      return apiValidationError('Invalid listing data', { errors: parsed.error.flatten().fieldErrors });
    }

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!sellerProfile) {
      return apiForbidden('Seller profile required to create listings');
    }

    const listing = await prisma.listing.create({
      data: {
        ...parsed.data,
        price: BigInt(parsed.data.price),
        sellerProfileId: sellerProfile.id,
        status: 'DRAFT',
        visibility: 'PRIVATE',
      },
    });

    await createAuditLog({
      actorUserId: session.user.id,
      actionType: 'LISTING_CREATED',
      entityType: 'Listing',
      entityId: listing.id,
    });

    return apiSuccess({ id: listing.id, status: listing.status }, 201);
  } catch (error: any) {
    if (error.code === 'UNAUTHENTICATED') return apiValidationError(error.message);
    if (error.code === 'FORBIDDEN') return apiForbidden(error.message);
    console.error('Create listing error:', error);
    return apiInternalError();
  }
}
