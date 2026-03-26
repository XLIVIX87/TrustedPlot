import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth-guard';
import {
  apiSuccess,
  apiUnauthorized,
  apiForbidden,
  apiInternalError,
} from '@/lib/api-response';

/**
 * GET /api/dashboard/inspections
 *
 * Returns the authenticated user's inspection bookings.
 * - BUYER: inspections they booked
 * - INSPECTOR: inspections assigned to them
 * - SELLER/MANDATE: inspections on their listings
 * - ADMIN/LEGAL_OPS: directed to admin dashboard
 *
 * Supports pagination via ?page=1&pageSize=20
 * Supports status filter via ?status=REQUESTED
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { user } = session;

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
    const statusFilter = searchParams.get('status') || undefined;

    const where: any = {};

    if (user.role === 'BUYER') {
      where.buyerUserId = user.id;
    } else if (user.role === 'INSPECTOR') {
      where.inspectorUserId = user.id;
    } else if (user.role === 'SELLER' || user.role === 'MANDATE') {
      // Seller sees inspections on their own listings
      const sellerProfile = await prisma.sellerProfile.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
      if (!sellerProfile) {
        return apiSuccess({ inspections: [], pagination: { page, pageSize, total: 0 } });
      }
      where.listing = { sellerProfileId: sellerProfile.id };
    } else if (user.role === 'ADMIN' || user.role === 'LEGAL_OPS') {
      // No restriction -- admin sees all
      // But we leave where empty to return all inspections
    } else {
      return apiForbidden('Your role does not have an inspections dashboard');
    }

    if (statusFilter) {
      where.status = statusFilter;
    }

    const [inspections, total] = await Promise.all([
      prisma.inspectionBooking.findMany({
        where,
        select: {
          id: true,
          slotAt: true,
          status: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          listing: {
            select: {
              id: true,
              title: true,
              city: true,
              district: true,
              propertyType: true,
              badge: true,
            },
          },
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          inspector: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          report: {
            select: {
              id: true,
              createdAt: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { slotAt: 'desc' },
      }),
      prisma.inspectionBooking.count({ where }),
    ]);

    const serialized = inspections.map((i) => ({
      id: i.id,
      slotAt: i.slotAt,
      status: i.status,
      notes: i.notes,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
      listing: i.listing,
      buyer: i.buyer,
      inspector: i.inspector,
      hasReport: !!i.report,
      reportId: i.report?.id || null,
      reportCreatedAt: i.report?.createdAt || null,
    }));

    return apiSuccess({ inspections: serialized, pagination: { page, pageSize, total } });
  } catch (error: any) {
    if (error instanceof AuthError) {
      if (error.code === 'UNAUTHENTICATED') return apiUnauthorized(error.message);
      if (error.code === 'FORBIDDEN') return apiForbidden(error.message);
    }
    console.error('Dashboard inspections error:', error);
    return apiInternalError();
  }
}
