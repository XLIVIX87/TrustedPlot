import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guard';
import { apiSuccess, apiValidationError, apiForbidden, apiNotFound, apiConflict, apiInternalError } from '@/lib/api-response';
import { createInspectionSchema } from '@/lib/validators/inspections';
import { createAuditLog } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole('BUYER');

    const body = await request.json();
    const parsed = createInspectionSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError('Invalid inspection data', { errors: parsed.error.flatten().fieldErrors });
    }

    const listing = await prisma.listing.findUnique({ where: { id: parsed.data.listingId } });
    if (!listing) return apiNotFound('Listing not found');

    // Check for duplicate booking
    const existing = await prisma.inspectionBooking.findFirst({
      where: {
        listingId: parsed.data.listingId,
        buyerUserId: session.user.id,
        status: { in: ['REQUESTED', 'CONFIRMED', 'ASSIGNED'] },
      },
    });
    if (existing) return apiConflict('You already have an active inspection booking for this listing');

    const booking = await prisma.inspectionBooking.create({
      data: {
        listingId: parsed.data.listingId,
        buyerUserId: session.user.id,
        slotAt: new Date(parsed.data.slotAt),
        status: 'REQUESTED',
        notes: parsed.data.notes,
      },
    });

    await createAuditLog({
      actorUserId: session.user.id,
      actionType: 'INSPECTION_BOOKED',
      entityType: 'InspectionBooking',
      entityId: booking.id,
      metadata: { listingId: parsed.data.listingId },
    });

    return apiSuccess({ inspectionId: booking.id, status: 'REQUESTED' }, 201);
  } catch (error: any) {
    if (error.code === 'UNAUTHENTICATED' || error.code === 'FORBIDDEN') return apiForbidden(error.message);
    console.error('Create inspection error:', error);
    return apiInternalError();
  }
}
