import { z } from 'zod';

export const CHANGE_TYPES = [
  'ENDPOINT_REMOVAL',
  'CONTRACT_CHANGE',
  'SCHEMA_UPDATE',
  'VERSION_BUMP',
  'DEPENDENCY_REMOVAL',
  'DEPENDENCY_ADDITION',
] as const;

export const changeRequestSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  targetServiceId: z.string().min(1, 'Please select or enter a target service'),
  changeType: z.enum(CHANGE_TYPES, { errorMap: () => ({ message: 'Please select a change type' }) }),
  affectedEndpoints: z.string().optional(),
  versionChange: z.string().optional(),
});

export const reviewSchema = z.object({
  comment: z.string().min(1, 'Comment is required'),
  action: z.enum(['APPROVE', 'REJECT', 'NEEDS_REVISION']),
});

export type ChangeRequestFormValues = z.infer<typeof changeRequestSchema>;
export type ReviewFormValues = z.infer<typeof reviewSchema>;
