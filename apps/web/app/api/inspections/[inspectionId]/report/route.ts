import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guard';
import { apiSuccess, apiNotFound, apiForbidden, apiValidationError, apiConflict, apiInternalError } from '@/lib/api-response';
import { inspectionReportSchema } from '@/lib/validators/inspections';
import { createAuditLog } from '@/lib/audit';

export async function POST(
  request: NextRequest,
  { params }: { params: { inspectionId: string } }
) {
  try {
    const session = await requireRole('INSPECTOR');

    const booking = await prisma.inspectionBooking.findUnique({
      where: { id: params.inspectionId },
      include: { report: true },
    });

    if (!booking) return apiNotFound('Inspection booking not found');
    if (booking.inspectorUserId !== session.user.id) return apiForbidden('Not assigned to this inspection');
    if (booking.report) return apiConflict('Report already submitted');

    const body = await request.json();
    const parsed = inspectionReportSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError('Invalid report data', { errors: parsed.error.flatten().fieldErrors });
    }

    const [report] = await prisma.$transaction([
      prisma.inspectionReport.create({
        data: {
          inspectionBookingId: params.inspectionId,
          submittedByInspectorUserId: session.user.id,
          summary: parsed.data.summary,
          notes: parsed.data.notes,
          reportData: parsed.data.reportData ? JSON.parse(JSON.stringify(parsed.data.reportData)) : undefined,
        },
      }),
      prisma.inspectionBooking.update({
        where: { id: params.inspectionId },
        data: { status: 'COMPLETED' },
      }),
    ]);

    await createAuditLog({
      actorUserId: session.user.id,
      actionType: 'INSPECTION_REPORT_SUBMITTED',
      entityType: 'InspectionReport',
      entityId: report.id,
      metadata: { inspectionBookingId: params.inspectionId },
    });

    return apiSuccess({ inspectionId: params.inspectionId, status: 'REPORTED' }, 201);
  } catch (error: any) {
    if (error.code === 'UNAUTHENTICATED' || error.code === 'FORBIDDEN') return apiForbidden(error.message);
    console.error('Submit report error:', error);
    return apiInternalError();
  }
}
