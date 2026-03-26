import { z } from 'zod';

export const submitVerificationSchema = z.object({
  listingId: z.string().min(1),
});

export const verificationDecisionSchema = z.object({
  decision: z.enum(['APPROVED', 'CONDITIONAL', 'REJECTED']),
  reason: z.string().min(10).max(2000),
  badge: z.enum(['VERIFIED_GOLD', 'VERIFIED_GREEN', 'CONDITIONAL', 'NONE']).nullable().optional(),
});

export type SubmitVerificationInput = z.infer<typeof submitVerificationSchema>;
export type VerificationDecisionInput = z.infer<typeof verificationDecisionSchema>;
