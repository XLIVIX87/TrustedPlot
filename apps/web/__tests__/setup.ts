import { vi } from 'vitest';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn(), count: vi.fn() },
    listing: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), count: vi.fn() },
    listingDocument: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    sellerProfile: { findUnique: vi.fn(), create: vi.fn() },
    verificationCase: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), count: vi.fn() },
    verificationDecision: { create: vi.fn() },
    inspectionBooking: { findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
    inspectionReport: { create: vi.fn() },
    escrowCase: { findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    escrowEvent: { create: vi.fn() },
    dispute: { findFirst: vi.fn(), create: vi.fn() },
    auditLog: { create: vi.fn(), findMany: vi.fn(), count: vi.fn() },
    aIUsageLog: { create: vi.fn(), count: vi.fn() },
    $transaction: vi.fn(),
    $queryRaw: vi.fn(),
  },
}));

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
}));

// Mock audit logger
vi.mock('@/lib/audit', () => ({
  createAuditLog: vi.fn(),
}));
