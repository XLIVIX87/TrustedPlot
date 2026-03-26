import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth-guard';
import { apiNotFound, apiForbidden, apiUnauthorized, apiInternalError } from '@/lib/api-response';
import { getUploadPath } from '@/lib/upload';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
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
            sellerProfile: { select: { userId: true } },
          },
        },
      },
    });

    if (!document) return apiNotFound('Document not found');

    // Access control
    const isOwner = document.listing.sellerProfile.userId === session.user.id;
    const isPrivileged = ['ADMIN', 'LEGAL_OPS'].includes(session.user.role);
    if (!isOwner && !isPrivileged) {
      return apiForbidden('You do not have access to this file');
    }

    const filePath = getUploadPath(document.storageKey);
    if (!existsSync(filePath)) {
      return apiNotFound('File not found on disk');
    }

    const fileBuffer = await readFile(filePath);

    await createAuditLog({
      actorUserId: session.user.id,
      actionType: 'DOCUMENT_DOWNLOADED',
      entityType: 'ListingDocument',
      entityId: document.id,
    });

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': document.mimeType,
        'Content-Disposition': `inline; filename="${document.originalFilename}"`,
        'Cache-Control': 'private, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: any) {
    if (error instanceof AuthError) {
      if (error.code === 'UNAUTHENTICATED') return apiUnauthorized(error.message);
      if (error.code === 'FORBIDDEN') return apiForbidden(error.message);
    }
    console.error('File serve error:', error);
    return apiInternalError();
  }
}
