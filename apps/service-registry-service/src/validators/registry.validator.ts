import { z } from 'zod';

export const createEndpointSchema = z.object({
  method: z.string().toUpperCase(),
  path: z.string().startsWith('/'),
  version: z.string().optional(),
  visibility: z.enum(['INTERNAL', 'PUBLIC']).optional(),
  isDeprecated: z.boolean().optional(),
});

export const createServiceSchema = z.object({
  name: z.string().min(2),
  ownerTeam: z.string().min(2),
  repositoryUrl: z.string().url().optional(),
  currentVersion: z.string().optional(),
  communicationType: z.enum(['REST', 'GRPC', 'GRAPHQL', 'ASYNC_EVENT']).optional(),
  criticalityLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  description: z.string().optional(),
  endpoints: z.array(createEndpointSchema).optional(),
});

export const updateServiceSchema = createServiceSchema.partial();
