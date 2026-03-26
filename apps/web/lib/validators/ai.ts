import { z } from 'zod';

export const aiSummarizeSchema = z.object({
  documentId: z.string().min(1),
});

export type AISummarizeInput = z.infer<typeof aiSummarizeSchema>;
