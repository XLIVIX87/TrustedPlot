import { z } from 'zod';

export const createEscrowSchema = z.object({
  listingId: z.string().min(1),
  amount: z.number().int().positive(),
});

export const fundEscrowSchema = z.object({
  paymentMethod: z.enum(['TRANSFER', 'CARD']).optional().default('TRANSFER'),
  idempotencyKey: z.string().min(1).optional(),
});

export const disputeEscrowSchema = z.object({
  reason: z.string().min(10).max(2000),
});

export type CreateEscrowInput = z.infer<typeof createEscrowSchema>;
export type FundEscrowInput = z.infer<typeof fundEscrowSchema>;
export type DisputeEscrowInput = z.infer<typeof disputeEscrowSchema>;
