import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guard';
import { apiSuccess, apiNotFound, apiForbidden, apiValidationError, apiConflict, apiInternalError } from '@/lib/api-response';
import { fundEscrowSchema } from '@/lib/validators/escrows';
import { createAuditLog } from '@/lib/audit';

export async function POST(
  request: NextRequest,
  { params }: { params: { escrowId: string } }
) {
  try {
    const session = await requireRole('BUYER');

    const body = await request.json();
    const parsed = fundEscrowSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError('Invalid funding data', { errors: parsed.error.flatten().fieldErrors });
    }

    const escrow = await prisma.escrowCase.findUnique({ where: { id: params.escrowId } });
    if (!escrow) return apiNotFound('Escrow not found');
    if (escrow.buyerUserId !== session.user.id) return apiForbidden('Not the escrow buyer');
    if (escrow.status !== 'CREATED') return apiConflict('Escrow is not in a fundable state');

    // Idempotency check
    if (parsed.data.idempotencyKey) {
      const existing = await prisma.escrowCase.findUnique({
        where: { idempotencyKey: parsed.data.idempotencyKey },
      });
      if (existing) return apiSuccess({ escrowId: existing.id, status: existing.status });
    }

    await prisma.$transaction([
      prisma.escrowCase.update({
        where: { id: params.escrowId },
        data: {
          status: 'FUNDING_PENDING',
          idempotencyKey: parsed.data.idempotencyKey,
        },
      }),
      prisma.escrowEvent.create({
        data: {
          escrowCaseId: params.escrowId,
          eventType: 'FUND_ATTEMPTED',
          createdByUserId: session.user.id,
          payload: { paymentMethod: parsed.data.paymentMethod },
        },
      }),
    ]);

    // TODO: Integrate with actual payment provider
    // For Phase 1, simulate successful funding
    await prisma.$transaction([
      prisma.escrowCase.update({
        where: { id: params.escrowId },
        data: { status: 'FUNDED' },
      }),
      prisma.escrowEvent.create({
        data: {
          escrowCaseId: params.escrowId,
          eventType: 'FUNDED',
          createdByUserId: session.user.id,
        },
      }),
    ]);

    await createAuditLog({
      actorUserId: session.user.id,
      actionType: 'ESCROW_FUNDED',
      entityType: 'EscrowCase',
      entityId: params.escrowId,
    });

    return apiSuccess({ escrowId: params.escrowId, status: 'FUNDED' });
  } catch (error: any) {
    if (error.code === 'UNAUTHENTICATED' || error.code === 'FORBIDDEN') return apiForbidden(error.message);
    console.error('Fund escrow error:', error);
    return apiInternalError();
  }
}
