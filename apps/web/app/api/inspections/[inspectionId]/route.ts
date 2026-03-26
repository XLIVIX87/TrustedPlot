import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guard';
import { apiSuccess, apiNotFound, apiForbidden, apiInternalError } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: { inspectionId: string } }
) {
  try {
    const session = await requireRole('BUYER', 'INSPECTOR', 'ADMIN');

    const booking = await prisma.inspectionBooking.findUnique({
      where: { id: params.inspectionId },
      include: {
        listing: { select: { id: true, title: true, city: true, district: true, addressSummary: true } },
        buyer: { select: { name: true, email: true } },
        inspector: { select: { name: true, email: true } },
        report: true,
      },
    });

    if (!booking) return apiNotFound('Inspection not found');

    // Check access: buyer can see own, inspector can see assigned, admin sees all
    if (session.user.role === 'BUYER' && booking.buyerUserId !== session.user.id) {
      return apiForbidden('Access denied');
    }
    if (session.user.role === 'INSPECTOR' && booking.inspectorUserId !== session.user.id) {
      return apiForbidden('Access denied');
    }

    return apiSuccess(booking);
  } catch (error: any) {
    if (error.code === 'UNAUTHENTICATED' || error.code === 'FORBIDDEN') return apiForbidden(error.message);
    console.error('Get inspection error:', error);
    return apiInternalError();
  }
}
