import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guard';
import {
  apiSuccess,
  apiForbidden,
  apiNotFound,
  apiValidationError,
  apiConflict,
  apiInternalError,
} from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit';
import { z } from 'zod';

/**
 * GET /api/admin/users/[userId]
 *
 * Returns full user profile with activity summary for admin review.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await requireRole('ADMIN');

    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        image: true,
        sellerProfile: {
          select: {
            id: true,
            displayName: true,
            sellerType: true,
            kycStatus: true,
            _count: { select: { listings: true } },
          },
        },
        _count: {
          select: {
            inspectionBookings: true,
            escrowsAsBuyer: true,
            uploadedDocuments: true,
          },
        },
      },
    });

    if (!user) return apiNotFound('User not found');

    // Most recent audit events for this user (as actor)
    const recentActivity = await prisma.auditLog.findMany({
      where: { actorUserId: params.userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, actionType: true, entityType: true, createdAt: true },
    });

    return apiSuccess({ user, recentActivity });
  } catch (error: any) {
    if (error.code === 'UNAUTHENTICATED' || error.code === 'FORBIDDEN') return apiForbidden(error.message);
    console.error('Get admin user error:', error);
    return apiInternalError();
  }
}

const patchSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'DEACTIVATED']).optional(),
  role: z.enum(['BUYER', 'SELLER', 'MANDATE', 'INSPECTOR', 'LEGAL_OPS', 'ADMIN']).optional(),
  name: z.string().min(1).max(200).optional(),
});

/**
 * PATCH /api/admin/users/[userId]
 *
 * Admin can:
 *   - Change user status: ACTIVE / SUSPENDED / DEACTIVATED
 *   - Change user role
 *   - Update user name
 *
 * Admins cannot change their own role or status.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await requireRole('ADMIN');

    if (session.user.id === params.userId) {
      return apiForbidden('Admins cannot modify their own account via this endpoint');
    }

    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError('Invalid data', { errors: parsed.error.flatten().fieldErrors });
    }

    const { status, role, name } = parsed.data;
    if (!status && !role && !name) {
      return apiValidationError('At least one field (status, role, or name) must be provided');
    }

    const existing = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { id: true, role: true, status: true, name: true },
    });
    if (!existing) return apiNotFound('User not found');

    const updateData: any = {};
    if (status) updateData.status = status;
    if (role) updateData.role = role;
    if (name) updateData.name = name;

    const updated = await prisma.user.update({
      where: { id: params.userId },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, status: true },
    });

    await createAuditLog({
      actorUserId: session.user.id,
      actionType: 'USER_UPDATED',
      entityType: 'User',
      entityId: params.userId,
      metadata: {
        changes: updateData,
        previous: {
          status: existing.status,
          role: existing.role,
          name: existing.name,
        },
      },
    });

    return apiSuccess(updated);
  } catch (error: any) {
    if (error.code === 'UNAUTHENTICATED' || error.code === 'FORBIDDEN') return apiForbidden(error.message);
    console.error('Patch admin user error:', error);
    return apiInternalError();
  }
}
