import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { apiSuccess, apiNotFound, apiForbidden, apiInternalError } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit';

export async function POST(
  request: NextRequest,
  { params }: { params: { listingId: string } }
) {
  try {
    const session = await requireAuth();

    const listing = await prisma.listing.findUnique({
      where: { id: params.listingId },
    });

    if (!listing) return apiNotFound('Listing not found');

    // TODO: Implement actual unlock/payment logic
    // For Phase 1, this is a placeholder that grants access

    await createAuditLog({
      actorUserId: session.user.id,
      actionType: 'DOCUMENT_UNLOCKED',
      entityType: 'Listing',
      entityId: params.listingId,
    });

    return apiSuccess({ listingId: params.listingId, unlocked: true });
  } catch (error: any) {
    if (error.code === 'UNAUTHENTICATED') return apiForbidden(error.message);
    console.error('Unlock error:', error);
    return apiInternalError();
  }
}
