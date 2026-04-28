import { z } from 'zod';

export const createDraftSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  targetServiceId: z.string().min(1),
  changeType: z.enum([
    'ENDPOINT_REMOVAL',
    'CONTRACT_CHANGE',
    'SCHEMA_UPDATE',
    'VERSION_BUMP',
    'DEPENDENCY_REMOVAL',
    'DEPENDENCY_ADDITION'
  ])
});

export const updateDraftSchema = createDraftSchema.partial();

export const reviewSchema = z.object({
  comment: z.string().min(1),
  action: z.enum(['APPROVE', 'REJECT', 'NEEDS_REVISION'])
});
