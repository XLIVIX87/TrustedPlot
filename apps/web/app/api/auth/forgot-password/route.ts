import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({ email: z.string().email() });

/**
 * Phase 1 stub: accepts a forgot-password request and logs an audit entry.
 * Real email-sending integration (e.g., Resend, AWS SES) is a Phase 2 task.
 *
 * Returns generic success response regardless of whether the email exists,
 * to prevent user-enumeration attacks.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });

    // Log audit entry only if user exists (but don't reveal that to caller)
    if (user) {
      await prisma.auditLog.create({
        data: {
          actorUserId: user.id,
          actionType: 'PASSWORD_RESET_REQUESTED',
          entityType: 'User',
          entityId: user.id,
          metadata: { email },
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null,
        },
      });
      // TODO Phase 2: generate one-time token, store in VerificationToken, send email with reset link
    }

    return NextResponse.json({ data: { message: 'If an account exists, a reset link has been sent.' } });
  } catch (e) {
    // Always return generic success to prevent enumeration
    return NextResponse.json({ data: { message: 'If an account exists, a reset link has been sent.' } });
  }
}
