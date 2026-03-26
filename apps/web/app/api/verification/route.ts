import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guard';
import { apiSuccess, apiValidationError, apiForbidden, apiNotFound, apiConflict, apiInternalError } from '@/lib/api-response';
import { submitVerificationSchema } from '@/lib/validators/verification';
import { createAuditLog } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole('SELLER', 'MANDATE');

    const body = await request.json();
    const parsed = submitVerificationSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError('Invalid verification submission', { errors: parsed.error.flatten().fieldErrors });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: parsed.data.listingId },
      include: { sellerProfile: true, documents: true },
    });

    if (!listing) return apiNotFound('Listing not found');
    if (listing.sellerProfile.userId !== session.user.id) return apiForbidden('Not the listing owner');
    if (!['DRAFT', 'REJECTED'].includes(listing.status)) {
      return apiConflict('Listing is not in a submittable state');
    }
    if (listing.documents.length === 0) {
      return apiValidationError('At least one document is required for verification');
    }

    const slaHours = 48;
    const slaDueAt = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    const [verificationCase] = await prisma.$transaction([
      prisma.verificationCase.create({
        data: {
          listingId: parsed.data.listingId,
          submittedByUserId: session.user.id,
          status: 'PENDING',
          slaDueAt,
        },
      }),
      prisma.listing.update({
        where: { id: parsed.data.listingId },
        data: { status: 'SUBMITTED' },
      }),
    ]);

    await createAuditLog({
      actorUserId: session.user.id,
      actionType: 'VERIFICATION_SUBMITTED',
      entityType: 'VerificationCase',
      entityId: verificationCase.id,
      metadata: { listingId: parsed.data.listingId },
    });

    return apiSuccess({ verificationCaseId: verificationCase.id, status: 'PENDING' }, 201);
  } catch (error: any) {
    if (error.code === 'UNAUTHENTICATED' || error.code === 'FORBIDDEN') return apiForbidden(error.message);
    console.error('Submit verification error:', error);
    return apiInternalError();
  }
}
