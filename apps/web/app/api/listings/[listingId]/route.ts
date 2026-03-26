import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession, requireRole } from '@/lib/auth-guard';
import { apiSuccess, apiNotFound, apiForbidden, apiValidationError, apiConflict, apiInternalError } from '@/lib/api-response';
import { updateListingSchema } from '@/lib/validators/listings';
import { createAuditLog } from '@/lib/audit';

export async function GET(
  request: NextRequest,
  { params }: { params: { listingId: string } }
) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.listingId },
      include: {
        media: { orderBy: { position: 'asc' } },
        sellerProfile: {
          select: { displayName: true, sellerType: true, kycStatus: true },
        },
        _count: { select: { documents: true, inspections: true } },
      },
    });

    if (!listing) return apiNotFound('Listing not found');

    return apiSuccess({
      ...listing,
      price: listing.price.toString(),
      documentsAvailable: listing._count.documents > 0,
      inspectionAvailable: true,
    });
  } catch (error) {
    console.error('Get listing error:', error);
    return apiInternalError();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { listingId: string } }
) {
  try {
    const session = await requireRole('SELLER', 'MANDATE');

    const listing = await prisma.listing.findUnique({
      where: { id: params.listingId },
      include: { sellerProfile: true },
    });

    if (!listing) return apiNotFound('Listing not found');
    if (listing.sellerProfile.userId !== session.user.id) return apiForbidden('Not the listing owner');
    if (!['DRAFT', 'REJECTED'].includes(listing.status)) {
      return apiConflict('Listing cannot be edited in current state');
    }

    const body = await request.json();
    const parsed = updateListingSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError('Invalid update data', { errors: parsed.error.flatten().fieldErrors });
    }

    const updateData: any = { ...parsed.data };
    if (parsed.data.price) updateData.price = BigInt(parsed.data.price);

    const updated = await prisma.listing.update({
      where: { id: params.listingId },
      data: updateData,
    });

    await createAuditLog({
      actorUserId: session.user.id,
      actionType: 'LISTING_UPDATED',
      entityType: 'Listing',
      entityId: listing.id,
    });

    return apiSuccess({ id: updated.id, status: updated.status });
  } catch (error: any) {
    if (error.code === 'UNAUTHENTICATED' || error.code === 'FORBIDDEN') return apiForbidden(error.message);
    console.error('Update listing error:', error);
    return apiInternalError();
  }
}
