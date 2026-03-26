import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAuthSession, requireAuth, requireRole, AuthError } from '@/lib/auth-guard';
import { auth } from '@/lib/auth';

const mockAuth = vi.mocked(auth);

describe('Auth Guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAuthSession', () => {
    it('returns null when no session exists', async () => {
      mockAuth.mockResolvedValue(null as any);
      const session = await getAuthSession();
      expect(session).toBeNull();
    });

    it('returns session when authenticated', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user1', email: 'test@example.com', name: 'Test', role: 'BUYER' },
      } as any);
      const session = await getAuthSession();
      expect(session).not.toBeNull();
      expect(session!.user.email).toBe('test@example.com');
    });
  });

  describe('requireAuth', () => {
    it('throws AuthError when no session exists', async () => {
      mockAuth.mockResolvedValue(null as any);
      await expect(requireAuth()).rejects.toThrow(AuthError);
      await expect(requireAuth()).rejects.toThrow('Authentication required');
    });

    it('returns session when authenticated', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user1', email: 'test@example.com', name: 'Test', role: 'SELLER' },
      } as any);
      const session = await requireAuth();
      expect(session.user.id).toBe('user1');
    });
  });

  describe('requireRole', () => {
    it('throws AuthError when user lacks required role', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user1', email: 'test@example.com', name: 'Test', role: 'BUYER' },
      } as any);
      await expect(requireRole('ADMIN')).rejects.toThrow(AuthError);
      await expect(requireRole('ADMIN')).rejects.toThrow('Insufficient permissions');
    });

    it('returns session when user has one of the required roles', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user1', email: 'test@example.com', name: 'Test', role: 'LEGAL_OPS' },
      } as any);
      const session = await requireRole('LEGAL_OPS', 'ADMIN');
      expect(session.user.role).toBe('LEGAL_OPS');
    });

    it('throws for BUYER trying to access SELLER routes', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user1', email: 'buyer@example.com', name: 'Buyer', role: 'BUYER' },
      } as any);
      await expect(requireRole('SELLER', 'MANDATE')).rejects.toThrow('Insufficient permissions');
    });

    it('ADMIN can access ADMIN routes', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'admin1', email: 'admin@example.com', name: 'Admin', role: 'ADMIN' },
      } as any);
      const session = await requireRole('ADMIN');
      expect(session.user.role).toBe('ADMIN');
    });
  });

  describe('AuthError', () => {
    it('has correct code and message', () => {
      const error = new AuthError('FORBIDDEN', 'No access');
      expect(error.code).toBe('FORBIDDEN');
      expect(error.message).toBe('No access');
      expect(error).toBeInstanceOf(Error);
    });
  });
});
