import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guard';
import { apiSuccess, apiForbidden, apiInternalError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole('ADMIN');

    const [
      totalUsers,
      totalListings,
      pendingVerifications,
      activeEscrows,
      openDisputes,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.verificationCase.count({ where: { status: { in: ['PENDING', 'IN_REVIEW'] } } }),
      prisma.escrowCase.count({ where: { status: { in: ['CREATED', 'FUNDING_PENDING', 'FUNDED'] } } }),
      prisma.dispute.count({ where: { status: { in: ['OPEN', 'IN_REVIEW'] } } }),
      prisma.auditLog.findMany({ take: 20, orderBy: { createdAt: 'desc' }, include: { actor: { select: { name: true, email: true } } } }),
    ]);

    return apiSuccess({
      metrics: {
        totalUsers,
        totalListings,
        pendingVerifications,
        activeEscrows,
        openDisputes,
      },
      recentActivity: recentAuditLogs,
    });
  } catch (error: any) {
    if (error.code === 'UNAUTHENTICATED' || error.code === 'FORBIDDEN') return apiForbidden(error.message);
    console.error('Admin dashboard error:', error);
    return apiInternalError();
  }
}
