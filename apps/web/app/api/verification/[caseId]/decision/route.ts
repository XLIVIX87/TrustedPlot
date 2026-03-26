import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guard';
import { apiSuccess, apiNotFound, apiForbidden, apiValidationError, apiConflict, apiInternalError } from '@/lib/api-response';
import { verificationDecisionSchema } from '@/lib/validators/verification';
import { createAuditLog } from '@/lib/audit';
import { ListingStatus, BadgeType } from '@prisma/client';

export async function POST(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const session = await requireRole('LEGAL_OPS', 'ADMIN');

    const body = await request.json();
    const parsed = verificationDecisionSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError('Invalid decision data', { errors: parsed.error.flatten().fieldErrors });
    }

    const verificationCase = await prisma.verificationCase.findUnique({
      where: { id: params.caseId },
      include: { listing: true },
    });

    if (!verificationCase) return apiNotFound('Verification case not found');
    if (!['PENDING', 'IN_REVIEW'].includes(verificationCase.status)) {
      return apiConflict('Case is not in a decidable state');
    }

    const decisionToStatus: Record<string, string> = {
      APPROVED: 'APPROVED',
      CONDITIONAL: 'CONDITIONAL',
      REJECTED: 'REJECTED',
    };

    const listingStatusMap: Record<string, ListingStatus> = {
      APPROVED: 'VERIFIED',
      CONDITIONAL: 'CONDITIONAL',
      REJECTED: 'REJECTED',
    };

    const badgeMap: Record<string, BadgeType> = {
      APPROVED: (parsed.data.badge as BadgeType) || 'VERIFIED_GREEN',
      CONDITIONAL: 'CONDITIONAL',
      REJECTED: 'NONE',
    };

    await prisma.$transaction([
      prisma.verificationDecision.create({
        data: {
          verificationCaseId: params.caseId,
          reviewerUserId: session.user.id,
          decision: parsed.data.decision,
          badgeType: badgeMap[parsed.data.decision],
          reason: parsed.data.reason,
        },
      }),
      prisma.verificationCase.update({
        where: { id: params.caseId },
        data: { status: decisionToStatus[parsed.data.decision] as any },
      }),
      prisma.listing.update({
        where: { id: verificationCase.listingId },
        data: {
          status: listingStatusMap[parsed.data.decision],
          badge: badgeMap[parsed.data.decision],
          visibility: parsed.data.decision === 'APPROVED' ? 'PUBLIC' : undefined,
        },
      }),
    ]);

    await createAuditLog({
      actorUserId: session.user.id,
      actionType: 'VERIFICATION_DECISION',
      entityType: 'VerificationCase',
      entityId: params.caseId,
      metadata: { decision: parsed.data.decision, listingId: verificationCase.listingId },
    });

    return apiSuccess({
      caseId: params.caseId,
      status: decisionToStatus[parsed.data.decision],
      badge: badgeMap[parsed.data.decision],
    });
  } catch (error: any) {
    if (error.code === 'UNAUTHENTICATED' || error.code === 'FORBIDDEN') return apiForbidden(error.message);
    console.error('Verification decision error:', error);
    return apiInternalError();
  }
}
