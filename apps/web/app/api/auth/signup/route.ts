import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiValidationError, apiConflict, apiInternalError } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const signUpSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(['BUYER', 'SELLER', 'MANDATE']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
      return apiValidationError('Invalid registration data', {
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (existing) {
      return apiConflict('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name,
        passwordHash,
        role: parsed.data.role,
        status: 'ACTIVE',
      },
    });

    // If seller or mandate, create seller profile
    if (parsed.data.role === 'SELLER' || parsed.data.role === 'MANDATE') {
      await prisma.sellerProfile.create({
        data: {
          userId: user.id,
          sellerType: parsed.data.role === 'MANDATE' ? 'MANDATE' : 'INDIVIDUAL',
          displayName: parsed.data.name,
          isMandate: parsed.data.role === 'MANDATE',
        },
      });
    }

    await createAuditLog({
      actorUserId: user.id,
      actionType: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user.id,
      metadata: { role: parsed.data.role },
    });

    return apiSuccess({ id: user.id, email: user.email, role: user.role }, 201);
  } catch (error) {
    console.error('Sign up error:', error);
    return apiInternalError();
  }
}
