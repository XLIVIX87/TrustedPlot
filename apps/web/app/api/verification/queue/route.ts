import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guard';
import { apiSuccess, apiForbidden, apiInternalError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole('LEGAL_OPS', 'ADMIN');

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '20')));

    const [cases, total] = await Promise.all([
      prisma.verificationCase.findMany({
        where: { status: { in: ['PENDING', 'IN_REVIEW'] } },
        include: {
          listing: { select: { id: true, title: true, city: true, district: true } },
          submittedBy: { select: { name: true, email: true } },
        },
        orderBy: { slaDueAt: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.verificationCase.count({
        where: { status: { in: ['PENDING', 'IN_REVIEW'] } },
      }),
    ]);

    return apiSuccess({ cases, total, page, pageSize });
  } catch (error: any) {
    if (error.code === 'UNAUTHENTICATED' || error.code === 'FORBIDDEN') return apiForbidden(error.message);
    console.error('Verification queue error:', error);
    return apiInternalError();
  }
}
