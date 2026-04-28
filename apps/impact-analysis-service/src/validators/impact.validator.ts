import { z } from 'zod';

export const generateImpactSchema = z.object({
  changeRequestId: z.string().uuid(),
  targetServiceId: z.string().min(1),
  changeType: z.enum([
    'ENDPOINT_REMOVAL',
    'CONTRACT_CHANGE',
    'SCHEMA_UPDATE',
    'VERSION_BUMP',
    'DEPENDENCY_REMOVAL',
    'DEPENDENCY_ADDITION'
  ]),
  // Optional override for testing/mocking
  graphData: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any())
  }).optional()
});
