import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth-guard';
import {
  apiSuccess,
  apiUnauthorized,
  apiForbidden,
  apiNotFound,
  apiInternalError,
} from '@/lib/api-response';

/**
 * GET /api/escrows/[escrowId]
 *
 * Returns full escrow detail including events, listing info, and parties.
 * Only accessible to the buyer, seller, or admin/legal_ops users.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { escrowId: string } }
) {
  try {
    const session = await requireAuth();
    const { escrowId } = params;
    const { user } = session;

    const escrow = await prisma.escrowCase.findUnique({
      where: { id: escrowId },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            city: true,
            district: true,
            propertyType: true,
            listingType: true,
            price: true,
            badge: true,
            status: true,
            media: { take: 1, orderBy: { position: 'asc' } },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        events: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            eventType: true,
            payload: true,
            createdByUserId: true,
            createdAt: true,
          },
        },
        disputes: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            reason: true,
            status: true,
            resolutionSummary: true,
            openedByUserId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!escrow) {
      return apiNotFound('Escrow case not found');
    }

    // Authorization: only buyer, seller, or admin/legal_ops can view
    const isBuyer = escrow.buyerUserId === user.id;
    const isSeller = escrow.sellerUserId === user.id;
    const isAdmin = user.role === 'ADMIN' || user.role === 'LEGAL_OPS';

    if (!isBuyer && !isSeller && !isAdmin) {
      return apiForbidden('You do not have access to this escrow case');
    }

    const serialized = {
      id: escrow.id,
      status: escrow.status,
      amount: escrow.amount.toString(),
      currency: escrow.currency,
      createdAt: escrow.createdAt,
      updatedAt: escrow.updatedAt,
      listing: {
        ...escrow.listing,
        price: escrow.listing.price.toString(),
        coverImage: escrow.listing.media[0] || null,
      },
      buyer: escrow.buyer,
      seller: escrow.seller,
      events: escrow.events,
      disputes: escrow.disputes,
      // Contextual flags for the frontend
      viewerRole: isBuyer ? 'BUYER' : isSeller ? 'SELLER' : 'ADMIN',
    };

    return apiSuccess(serialized);
  } catch (error: any) {
    if (error instanceof AuthError) {
      if (error.code === 'UNAUTHENTICATED') return apiUnauthorized(error.message);
      if (error.code === 'FORBIDDEN') return apiForbidden(error.message);
    }
    console.error('Escrow detail error:', error);
    return apiInternalError();
  }
}
