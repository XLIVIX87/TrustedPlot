import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth-guard';
import { apiSuccess, apiNotFound, apiForbidden, apiUnauthorized, apiInternalError } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit';

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await requireAuth();

    const document = await prisma.listingDocument.findUnique({
      where: { id: params.documentId },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            city: true,
            district: true,
            sellerProfileId: true,
            sellerProfile: { select: { userId: true } },
          },
        },
      },
    });

    if (!document) {
      return apiNotFound('Document not found');
    }

    // Access control: owner, admin, legal_ops, or buyer who has unlocked
    const isOwner = document.listing.sellerProfile.userId === session.user.id;
    const isPrivileged = ['ADMIN', 'LEGAL_OPS'].includes(session.user.role);

    if (!isOwner && !isPrivileged) {
      // For now, allow any authenticated user to view document metadata
      // but fileUrl is only returned for owner/privileged users
      // TODO: implement document unlock tracking
    }

    await createAuditLog({
      actorUserId: session.user.id,
      actionType: 'DOCUMENT_VIEWED',
      entityType: 'ListingDocument',
      entityId: document.id,
    });

    // Build file URL from storageKey if it exists
    const fileUrl = document.storageKey ? `/api/documents/${document.id}/file` : null;

    return apiSuccess({
      id: document.id,
      documentType: document.documentType,
      fileName: document.originalFilename,
      fileUrl: (isOwner || isPrivileged) ? fileUrl : null,
      mimeType: document.mimeType,
      status: document.status,
      uploadedAt: document.createdAt.toISOString(),
      listing: {
        id: document.listing.id,
        title: document.listing.title,
        city: document.listing.city,
        district: document.listing.district,
      },
    });
  } catch (error: any) {
    if (error instanceof AuthError) {
      if (error.code === 'UNAUTHENTICATED') return apiUnauthorized(error.message);
      if (error.code === 'FORBIDDEN') return apiForbidden(error.message);
    }
    console.error('Document detail error:', error);
    return apiInternalError();
  }
}
