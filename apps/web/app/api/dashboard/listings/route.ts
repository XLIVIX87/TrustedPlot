import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth-guard';
import {
  apiSuccess,
  apiValidationError,
  apiForbidden,
  apiUnauthorized,
  apiInternalError,
} from '@/lib/api-response';

const LISTING_SELECT = {
  id: true, title: true, city: true, district: true, propertyType: true,
  listingType: true, price: true, bedrooms: true, bathrooms: true,
  status: true, visibility: true, badge: true, createdAt: true, updatedAt: true,
  media: { take: 1, orderBy: { position: 'asc' as const } },
  _count: { select: { documents: true, inspections: true, escrowCases: true } },
};

function serializeListings(listings: any[]) {
  return listings.map(l => ({
    ...l, price: l.price.toString(),
    coverImage: l.media?.[0] || null,
    documentCount: l._count?.documents || 0,
    inspectionCount: l._count?.inspections || 0,
    escrowCount: l._count?.escrowCases || 0,
  }));
}

async function getEscrows(userId: string, role: 'buyer' | 'seller') {
  const where = role === 'buyer' ? { buyerUserId: userId } : { sellerUserId: userId };
  const rawEscrows = await prisma.escrowCase.findMany({
    where,
    select: {
      id: true, status: true, amount: true, createdAt: true,
      listing: { select: { title: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  return rawEscrows.map(e => ({
    id: e.id, status: e.status, amount: e.amount.toString(),
    listingTitle: e.listing.title, createdAt: e.createdAt.toISOString(),
  }));
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { user } = session;

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
    const statusFilter = searchParams.get('status') || undefined;

    if (user.role === 'ADMIN' || user.role === 'LEGAL_OPS') {
      return apiValidationError('Admin and Legal Ops users should use /api/admin/dashboard');
    }

    if (user.role === 'SELLER' || user.role === 'MANDATE') {
      const sellerProfile = await prisma.sellerProfile.findUnique({
        where: { userId: user.id }, select: { id: true },
      });
      if (!sellerProfile) {
        return apiSuccess({ listings: [], escrows: [], pagination: { page, pageSize, total: 0 } });
      }

      const where: any = { sellerProfileId: sellerProfile.id };
      if (statusFilter) where.status = statusFilter;

      const [listings, total, escrows] = await Promise.all([
        prisma.listing.findMany({
          where, select: LISTING_SELECT,
          skip: (page - 1) * pageSize, take: pageSize, orderBy: { updatedAt: 'desc' },
        }),
        prisma.listing.count({ where }),
        getEscrows(user.id, 'seller'),
      ]);

      return apiSuccess({ listings: serializeListings(listings), escrows, pagination: { page, pageSize, total } });
    }

    if (user.role === 'BUYER') {
      const [escrowListingIds, inspectionListingIds, escrows] = await Promise.all([
        prisma.escrowCase.findMany({
          where: { buyerUserId: user.id }, select: { listingId: true }, distinct: ['listingId'],
        }),
        prisma.inspectionBooking.findMany({
          where: { buyerUserId: user.id }, select: { listingId: true }, distinct: ['listingId'],
        }),
        getEscrows(user.id, 'buyer'),
      ]);

      const allListingIds = [...new Set([
        ...escrowListingIds.map(e => e.listingId),
        ...inspectionListingIds.map(i => i.listingId),
      ])];

      if (allListingIds.length === 0) {
        return apiSuccess({ listings: [], escrows, pagination: { page, pageSize, total: 0 } });
      }

      const where: any = { id: { in: allListingIds } };
      if (statusFilter) where.status = statusFilter;

      const [listings, total] = await Promise.all([
        prisma.listing.findMany({
          where, select: LISTING_SELECT,
          skip: (page - 1) * pageSize, take: pageSize, orderBy: { updatedAt: 'desc' },
        }),
        prisma.listing.count({ where }),
      ]);

      return apiSuccess({ listings: serializeListings(listings), escrows, pagination: { page, pageSize, total } });
    }

    if (user.role === 'INSPECTOR') {
      const inspectorBookings = await prisma.inspectionBooking.findMany({
        where: { inspectorUserId: user.id }, select: { listingId: true }, distinct: ['listingId'],
      });
      const listingIds = inspectorBookings.map(b => b.listingId);

      if (listingIds.length === 0) {
        return apiSuccess({ listings: [], escrows: [], pagination: { page, pageSize, total: 0 } });
      }

      const where: any = { id: { in: listingIds } };
      if (statusFilter) where.status = statusFilter;

      const [listings, total] = await Promise.all([
        prisma.listing.findMany({
          where, select: LISTING_SELECT,
          skip: (page - 1) * pageSize, take: pageSize, orderBy: { updatedAt: 'desc' },
        }),
        prisma.listing.count({ where }),
      ]);

      return apiSuccess({ listings: serializeListings(listings), escrows: [], pagination: { page, pageSize, total } });
    }

    return apiForbidden('Your role does not have a listings dashboard');
  } catch (error: any) {
    if (error instanceof AuthError) {
      if (error.code === 'UNAUTHENTICATED') return apiUnauthorized(error.message);
      if (error.code === 'FORBIDDEN') return apiForbidden(error.message);
    }
    console.error('Dashboard listings error:', error);
    return apiInternalError();
  }
}
