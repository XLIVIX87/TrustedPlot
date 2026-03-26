import { z } from 'zod';

export const createInspectionSchema = z.object({
  listingId: z.string().min(1),
  slotAt: z.string().datetime(),
  notes: z.string().max(1000).optional(),
});

export const inspectionReportSchema = z.object({
  summary: z.string().min(20).max(5000),
  notes: z.string().max(5000).optional(),
  reportData: z.record(z.unknown()).optional(),
});

export type CreateInspectionInput = z.infer<typeof createInspectionSchema>;
export type InspectionReportInput = z.infer<typeof inspectionReportSchema>;
