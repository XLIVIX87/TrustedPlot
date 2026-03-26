import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guard';
import { apiSuccess, apiValidationError, apiForbidden, apiNotFound, apiConflict, apiInternalError } from '@/lib/api-response';
import { createEscrowSchema } from '@/lib/validators/escrows';
import { createAuditLog } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole('BUYER');

    const body = await request.json();
    const parsed = createEscrowSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError('Invalid escrow data', { errors: parsed.error.flatten().fieldErrors });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: parsed.data.listingId },
      include: { sellerProfile: { include: { user: true } } },
    });

    if (!listing) return apiNotFound('Listing not found');

    // Check for duplicate
    const existing = await prisma.escrowCase.findFirst({
      where: {
        listingId: parsed.data.listingId,
        buyerUserId: session.user.id,
        status: { in: ['CREATED', 'FUNDING_PENDING', 'FUNDED'] },
      },
    });
    if (existing) return apiConflict('Active escrow already exists for this listing');

    const escrow = await prisma.escrowCase.create({
      data: {
        listingId: parsed.data.listingId,
        buyerUserId: session.user.id,
        sellerUserId: listing.sellerProfile.userId,
        amount: BigInt(parsed.data.amount),
        status: 'CREATED',
      },
    });

    await prisma.escrowEvent.create({
      data: {
        escrowCaseId: escrow.id,
        eventType: 'CREATED',
        createdByUserId: session.user.id,
      },
    });

    await createAuditLog({
      actorUserId: session.user.id,
      actionType: 'ESCROW_CREATED',
      entityType: 'EscrowCase',
      entityId: escrow.id,
      metadata: { listingId: parsed.data.listingId, amount: parsed.data.amount },
    });

    return apiSuccess({ escrowId: escrow.id, status: 'CREATED' }, 201);
  } catch (error: any) {
    if (error.code === 'UNAUTHENTICATED' || error.code === 'FORBIDDEN') return apiForbidden(error.message);
    console.error('Create escrow error:', error);
    return apiInternalError();
  }
}
