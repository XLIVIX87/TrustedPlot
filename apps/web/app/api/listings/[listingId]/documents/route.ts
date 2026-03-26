import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/auth-guard';
import { apiSuccess, apiNotFound, apiForbidden, apiValidationError, apiInternalError } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit';
import { z } from 'zod';

const uploadDocumentSchema = z.object({
  documentType: z.enum([
    'CERTIFICATE_OF_OCCUPANCY', 'RIGHT_OF_OCCUPANCY', 'GOVERNORS_CONSENT',
    'DEED_OF_ASSIGNMENT', 'SURVEY_PLAN', 'OWNER_CONSENT',
    'POWER_OF_ATTORNEY', 'LAND_RECEIPT', 'OTHER',
  ]),
  storageKey: z.string().min(1),
  originalFilename: z.string().min(1).max(500),
  mimeType: z.string().min(1),
  fileSize: z.number().int().positive().max(50 * 1024 * 1024), // 50MB max
});

export async function GET(
  request: NextRequest,
  { params }: { params: { listingId: string } }
) {
  try {
    const session = await requireAuth();

    const documents = await prisma.listingDocument.findMany({
      where: { listingId: params.listingId },
      select: {
        id: true,
        documentType: true,
        originalFilename: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiSuccess(documents);
  } catch (error: any) {
    if (error.code === 'UNAUTHENTICATED') return apiForbidden(error.message);
    console.error('Get documents error:', error);
    return apiInternalError();
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { listingId: string } }
) {
  try {
    const session = await requireRole('SELLER', 'MANDATE');

    const listing = await prisma.listing.findUnique({
      where: { id: params.listingId },
      include: { sellerProfile: true },
    });

    if (!listing) return apiNotFound('Listing not found');
    if (listing.sellerProfile.userId !== session.user.id) return apiForbidden('Not the listing owner');

    const body = await request.json();
    const parsed = uploadDocumentSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError('Invalid document data', { errors: parsed.error.flatten().fieldErrors });
    }

    const document = await prisma.listingDocument.create({
      data: {
        ...parsed.data,
        listingId: params.listingId,
        uploadedByUserId: session.user.id,
        status: 'UPLOADED',
      },
    });

    await createAuditLog({
      actorUserId: session.user.id,
      actionType: 'DOCUMENT_UPLOADED',
      entityType: 'ListingDocument',
      entityId: document.id,
      metadata: { listingId: params.listingId, documentType: parsed.data.documentType },
    });

    return apiSuccess({ documentId: document.id, type: document.documentType, status: document.status }, 201);
  } catch (error: any) {
    if (error.code === 'UNAUTHENTICATED' || error.code === 'FORBIDDEN') return apiForbidden(error.message);
    console.error('Upload document error:', error);
    return apiInternalError();
  }
}
