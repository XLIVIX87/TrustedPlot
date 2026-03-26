import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guard';
import { apiSuccess, apiForbidden, apiInternalError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole('LEGAL_OPS', 'ADMIN');

    const cases = await prisma.verificationCase.findMany({
      where: { status: { in: ['PENDING', 'IN_REVIEW'] } },
      include: {
        listing: { select: { id: true, title: true, city: true, district: true } },
        submittedBy: { select: { name: true, email: true } },
      },
      orderBy: { slaDueAt: 'asc' },
    });

    return apiSuccess(cases);
  } catch (error: any) {
    if (error.code === 'UNAUTHENTICATED' || error.code === 'FORBIDDEN') return apiForbidden(error.message);
    console.error('Verification queue error:', error);
    return apiInternalError();
  }
}
