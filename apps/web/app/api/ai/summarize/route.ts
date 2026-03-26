import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { apiSuccess, apiForbidden, apiNotFound, apiValidationError, apiRateLimited, apiInternalError } from '@/lib/api-response';
import { aiSummarizeSchema } from '@/lib/validators/ai';
import { createAuditLog } from '@/lib/audit';

const RATE_LIMIT_PER_HOUR = parseInt(process.env.AI_SUMMARY_RATE_LIMIT_PER_HOUR || '5');

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    const body = await request.json();
    const parsed = aiSummarizeSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError('Invalid request', { errors: parsed.error.flatten().fieldErrors });
    }

    // Rate limit check
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentUsage = await prisma.aIUsageLog.count({
      where: {
        userId: session.user.id,
        featureType: 'DOCUMENT_SUMMARY',
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentUsage >= RATE_LIMIT_PER_HOUR) {
      await prisma.aIUsageLog.create({
        data: {
          userId: session.user.id,
          featureType: 'DOCUMENT_SUMMARY',
          documentId: parsed.data.documentId,
          status: 'RATE_LIMITED',
        },
      });
      return apiRateLimited('AI summary rate limit exceeded. Try again later.');
    }

    // Verify document exists and user has access
    const document = await prisma.listingDocument.findUnique({
      where: { id: parsed.data.documentId },
      include: { listing: { include: { sellerProfile: true } } },
    });
    if (!document) return apiNotFound('Document not found');

    // Only allow access if user is the seller, admin, or legal ops
    const isOwner = document.listing.sellerProfile.userId === session.user.id;
    const isPrivileged = ['ADMIN', 'LEGAL_OPS'].includes((session.user as any).role);
    if (!isOwner && !isPrivileged) {
      return apiForbidden('You do not have access to this document');
    }

    const startTime = Date.now();

    // TODO: Replace with actual AI provider call
    const summary = {
      documentTypeGuess: document.documentType,
      summary: `This appears to be a ${document.documentType.replace(/_/g, ' ').toLowerCase()} document. Full AI summarization will be available when the AI provider is configured.`,
      keyFields: [],
      uncertainties: ['AI provider not yet configured'],
      disclaimer: 'This summary is AI-generated for convenience only and does not replace legal verification.',
    };

    const latencyMs = Date.now() - startTime;

    await prisma.aIUsageLog.create({
      data: {
        userId: session.user.id,
        featureType: 'DOCUMENT_SUMMARY',
        documentId: parsed.data.documentId,
        status: 'SUCCESS',
        latencyMs,
      },
    });

    return apiSuccess(summary);
  } catch (error: any) {
    if (error.code === 'UNAUTHENTICATED') return apiForbidden(error.message);
    console.error('AI summarize error:', error);
    return apiInternalError();
  }
}
