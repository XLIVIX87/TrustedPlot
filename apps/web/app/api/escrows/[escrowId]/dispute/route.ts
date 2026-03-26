import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { apiSuccess, apiNotFound, apiForbidden, apiValidationError, apiInternalError } from '@/lib/api-response';
import { disputeEscrowSchema } from '@/lib/validators/escrows';
import { createAuditLog } from '@/lib/audit';

export async function POST(
  request: NextRequest,
  { params }: { params: { escrowId: string } }
) {
  try {
    const session = await requireAuth();

    const body = await request.json();
    const parsed = disputeEscrowSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError('Invalid dispute data', { errors: parsed.error.flatten().fieldErrors });
    }

    const escrow = await prisma.escrowCase.findUnique({ where: { id: params.escrowId } });
    if (!escrow) return apiNotFound('Escrow not found');

    // Only buyer, seller, or admin can dispute
    const isParty = [escrow.buyerUserId, escrow.sellerUserId].includes(session.user.id);
    const isAdmin = (session.user as any).role === 'ADMIN';
    if (!isParty && !isAdmin) return apiForbidden('Not authorized to dispute this escrow');

    const dispute = await prisma.dispute.create({
      data: {
        escrowCaseId: params.escrowId,
        openedByUserId: session.user.id,
        reason: parsed.data.reason,
        status: 'OPEN',
      },
    });

    await prisma.$transaction([
      prisma.escrowCase.update({
        where: { id: params.escrowId },
        data: { status: 'DISPUTED' },
      }),
      prisma.escrowEvent.create({
        data: {
          escrowCaseId: params.escrowId,
          eventType: 'DISPUTE_OPENED',
          createdByUserId: session.user.id,
          payload: { disputeId: dispute.id, reason: parsed.data.reason },
        },
      }),
    ]);

    await createAuditLog({
      actorUserId: session.user.id,
      actionType: 'DISPUTE_OPENED',
      entityType: 'Dispute',
      entityId: dispute.id,
      metadata: { escrowCaseId: params.escrowId },
    });

    return apiSuccess({ disputeId: dispute.id, status: 'OPEN' }, 201);
  } catch (error: any) {
    if (error.code === 'UNAUTHENTICATED') return apiForbidden(error.message);
    console.error('Create dispute error:', error);
    return apiInternalError();
  }
}
