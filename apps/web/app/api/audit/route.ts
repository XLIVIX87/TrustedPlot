import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guard';
import { apiSuccess, apiForbidden, apiInternalError, apiValidationError } from '@/lib/api-response';
import { z } from 'zod';

const auditQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
  entityType: z.string().optional(),
  actionType: z.string().optional(),
  actorUserId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole('ADMIN');

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = auditQuerySchema.safeParse(searchParams);
    if (!parsed.success) {
      return apiValidationError('Invalid query parameters', { errors: parsed.error.flatten().fieldErrors });
    }

    const { page, pageSize, entityType, actionType, actorUserId } = parsed.data;
    const where: any = {};
    if (entityType) where.entityType = entityType;
    if (actionType) where.actionType = actionType;
    if (actorUserId) where.actorUserId = actorUserId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { actor: { select: { name: true, email: true, role: true } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return apiSuccess({ logs, pagination: { page, pageSize, total } });
  } catch (error: any) {
    if (error.code === 'UNAUTHENTICATED' || error.code === 'FORBIDDEN') return apiForbidden(error.message);
    console.error('Audit log error:', error);
    return apiInternalError();
  }
}
