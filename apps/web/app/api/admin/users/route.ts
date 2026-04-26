import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guard';
import { apiSuccess, apiForbidden, apiInternalError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    await requireRole('ADMIN');

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const pageSize = 25;

    const where: any = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, email: true, name: true, role: true, status: true,
          createdAt: true, image: true,
          _count: {
            select: {
              inspectionBookings: true,
              escrowsAsBuyer: true,
              uploadedDocuments: true,
            },
          },
          sellerProfile: { select: { id: true, displayName: true, kycStatus: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    return apiSuccess({
      users,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error: any) {
    if (error.code === 'UNAUTHENTICATED' || error.code === 'FORBIDDEN') return apiForbidden(error.message);
    console.error('List users error:', error);
    return apiInternalError();
  }
}
