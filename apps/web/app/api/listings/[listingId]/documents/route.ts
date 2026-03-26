import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/auth-guard';
import { apiSuccess, apiNotFound, apiForbidden, apiValidationError, apiInternalError } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit';
import { saveUploadedFile, UploadError } from '@/lib/upload';

const VALID_DOC_TYPES = [
  'CERTIFICATE_OF_OCCUPANCY', 'RIGHT_OF_OCCUPANCY', 'GOVERNORS_CONSENT',
  'DEED_OF_ASSIGNMENT', 'SURVEY_PLAN', 'OWNER_CONSENT',
  'POWER_OF_ATTORNEY', 'LAND_RECEIPT', 'OTHER',
];

export async function GET(
  request: NextRequest,
  { params }: { params: { listingId: string } }
) {
  try {
    await requireAuth();

    const documents = await prisma.listingDocument.findMany({
      where: { listingId: params.listingId },
      select: {
        id: true,
        documentType: true,
        originalFilename: true,
        mimeType: true,
        fileSize: true,
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

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // Handle actual file upload
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const documentType = formData.get('documentType') as string | null;

      if (!file) return apiValidationError('No file provided');
      if (!documentType || !VALID_DOC_TYPES.includes(documentType)) {
        return apiValidationError('Invalid document type', { validTypes: VALID_DOC_TYPES });
      }

      const uploadResult = await saveUploadedFile(file);

      const document = await prisma.listingDocument.create({
        data: {
          listingId: params.listingId,
          documentType: documentType as any,
          storageKey: uploadResult.storageKey,
          originalFilename: uploadResult.originalFilename,
          mimeType: uploadResult.mimeType,
          fileSize: uploadResult.fileSize,
          checksum: uploadResult.checksum,
          uploadedByUserId: session.user.id,
          status: 'UPLOADED',
        },
      });

      await createAuditLog({
        actorUserId: session.user.id,
        actionType: 'DOCUMENT_UPLOADED',
        entityType: 'ListingDocument',
        entityId: document.id,
        metadata: { listingId: params.listingId, documentType, fileName: uploadResult.originalFilename },
      });

      return apiSuccess({
        documentId: document.id,
        type: document.documentType,
        fileName: uploadResult.originalFilename,
        status: document.status,
      }, 201);
    } else {
      // Handle JSON metadata-only upload (backward compatible)
      const body = await request.json();
      const { documentType, storageKey, originalFilename, mimeType, fileSize } = body;

      if (!documentType || !VALID_DOC_TYPES.includes(documentType)) {
        return apiValidationError('Invalid document type');
      }
      if (!storageKey || !originalFilename || !mimeType) {
        return apiValidationError('Missing required fields: storageKey, originalFilename, mimeType');
      }

      const document = await prisma.listingDocument.create({
        data: {
          listingId: params.listingId,
          documentType: documentType as any,
          storageKey,
          originalFilename,
          mimeType,
          fileSize: fileSize || 0,
          uploadedByUserId: session.user.id,
          status: 'UPLOADED',
        },
      });

      await createAuditLog({
        actorUserId: session.user.id,
        actionType: 'DOCUMENT_UPLOADED',
        entityType: 'ListingDocument',
        entityId: document.id,
        metadata: { listingId: params.listingId, documentType },
      });

      return apiSuccess({ documentId: document.id, type: document.documentType, status: document.status }, 201);
    }
  } catch (error: any) {
    if (error instanceof UploadError) {
      return apiValidationError(error.message);
    }
    if (error.code === 'UNAUTHENTICATED' || error.code === 'FORBIDDEN') return apiForbidden(error.message);
    console.error('Upload document error:', error);
    return apiInternalError();
  }
}
