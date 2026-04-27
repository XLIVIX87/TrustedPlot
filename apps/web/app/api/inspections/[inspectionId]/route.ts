import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guard';
import { apiSuccess, apiNotFound, apiForbidden, apiValidationError, apiInternalError } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit';
import { z } from 'zod';

/**
 * GET /api/inspections/[inspectionId]
 *
 * Returns full inspection detail.
 * - BUYER: can view own bookings
 * - INSPECTOR: can view assigned bookings
 * - ADMIN / LEGAL_OPS: can view all
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { inspectionId: string } }
) {
  try {
    const session = await requireRole('BUYER', 'INSPECTOR', 'ADMIN', 'LEGAL_OPS');

    const booking = await prisma.inspectionBooking.findUnique({
      where: { id: params.inspectionId },
      include: {
        listing: { select: { id: true, title: true, city: true, district: true, addressSummary: true } },
        buyer: { select: { id: true, name: true, email: true } },
        inspector: { select: { id: true, name: true, email: true } },
        report: true,
      },
    });

    if (!booking) return apiNotFound('Inspection not found');

    if (session.user.role === 'BUYER' && booking.buyerUserId !== session.user.id) {
      return apiForbidden('Access denied');
    }
    if (session.user.role === 'INSPECTOR' && booking.inspectorUserId !== session.user.id) {
      return apiForbidden('Access denied');
    }

    return apiSuccess(booking);
  } catch (error: any) {
    if (error.code === 'UNAUTHENTICATED' || error.code === 'FORBIDDEN') return apiForbidden(error.message);
    console.error('Get inspection error:', error);
    return apiInternalError();
  }
}

const patchSchema = z.object({
  status: z.enum(['CONFIRMED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  inspectorUserId: z.string().cuid().optional(),
  notes: z.string().max(2000).optional(),
});

/**
 * PATCH /api/inspections/[inspectionId]
 *
 * ADMIN / LEGAL_OPS:
 *   - REQUESTED → CONFIRMED, ASSIGNED, CANCELLED
 *   - CONFIRMED → ASSIGNED (requires inspectorUserId), CANCELLED
 *   - ASSIGNED  → COMPLETED, CANCELLED
 *
 * INSPECTOR (own booking only):
 *   - ASSIGNED → IN_PROGRESS
 *   - IN_PROGRESS → COMPLETED
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { inspectionId: string } }
) {
  try {
    const session = await requireRole('ADMIN', 'LEGAL_OPS', 'INSPECTOR');

    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError('Invalid update data', { errors: parsed.error.flatten().fieldErrors });
    }

    const { status: newStatus, inspectorUserId, notes } = parsed.data;

    const booking = await prisma.inspectionBooking.findUnique({
      where: { id: params.inspectionId },
    });
    if (!booking) return apiNotFound('Inspection not found');

    const role = session.user.role;

    // Inspector can only act on their own assigned inspections
    if (role === 'INSPECTOR') {
      if (booking.inspectorUserId !== session.user.id) return apiForbidden('Not your inspection');
      if (newStatus && !['IN_PROGRESS', 'COMPLETED'].includes(newStatus)) {
        return apiForbidden('Inspectors can only mark IN_PROGRESS or COMPLETED');
      }
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      REQUESTED:   ['CONFIRMED', 'ASSIGNED', 'CANCELLED'],
      CONFIRMED:   ['ASSIGNED', 'CANCELLED'],
      ASSIGNED:    ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
    };

    if (newStatus) {
      const allowed = validTransitions[booking.status] ?? [];
      if (!allowed.includes(newStatus)) {
        return apiValidationError(
          `Cannot move from ${booking.status} to ${newStatus}`,
          { currentStatus: booking.status, allowedTransitions: allowed }
        );
      }
    }

    // Validate inspector if being set
    if (inspectorUserId) {
      const inspector = await prisma.user.findUnique({
        where: { id: inspectorUserId },
        select: { role: true },
      });
      if (!inspector || inspector.role !== 'INSPECTOR') {
        return apiValidationError('User not found or not an INSPECTOR');
      }
    }

    const updateData: any = {};
    if (newStatus) updateData.status = newStatus;
    if (inspectorUserId) {
      updateData.inspectorUserId = inspectorUserId;
      // Auto-promote to ASSIGNED if no explicit status given
      if (!newStatus) {
        const allowed = validTransitions[booking.status] ?? [];
        if (allowed.includes('ASSIGNED')) updateData.status = 'ASSIGNED';
      }
    }
    if (notes !== undefined) updateData.notes = notes;

    const updated = await prisma.inspectionBooking.update({
      where: { id: params.inspectionId },
      data: updateData,
      include: {
        listing:   { select: { id: true, title: true } },
        buyer:     { select: { id: true, name: true, email: true } },
        inspector: { select: { id: true, name: true, email: true } },
      },
    });

    await createAuditLog({
      actorUserId: session.user.id,
      actionType: 'INSPECTION_UPDATED',
      entityType: 'InspectionBooking',
      entityId: booking.id,
      metadata: {
        previousStatus: booking.status,
        newStatus: updateData.status ?? booking.status,
        inspectorAssigned: !!inspectorUserId,
      },
    });

    return apiSuccess(updated);
  } catch (error: any) {
    if (error.code === 'UNAUTHENTICATED' || error.code === 'FORBIDDEN') return apiForbidden(error.message);
    console.error('Patch inspection error:', error);
    return apiInternalError();
  }
}
