import { auth } from './auth';
import { UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';

export type AuthSession = {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
  };
};

export async function getAuthSession(): Promise<AuthSession | null> {
  const session = await auth();
  if (!session?.user) return null;
  return session as unknown as AuthSession;
}

export async function requireAuth(): Promise<AuthSession> {
  const session = await getAuthSession();
  if (!session) {
    throw new AuthError('UNAUTHENTICATED', 'Authentication required');
  }
  return session;
}

export async function requireRole(...roles: UserRole[]): Promise<AuthSession> {
  const session = await requireAuth();
  if (!roles.includes(session.user.role)) {
    throw new AuthError('FORBIDDEN', 'Insufficient permissions');
  }
  return session;
}

export class AuthError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}
