import { z } from 'zod';

export const createDependencySchema = z.object({
  sourceServiceId: z.string().min(1),
  targetServiceId: z.string().min(1),
  dependencyType: z.enum(['REST', 'GRPC', 'EVENT_DRIVEN', 'QUEUE_BASED']).optional(),
  description: z.string().optional(),
  contractReference: z.string().url().optional(),
  isCritical: z.boolean().optional()
}).refine(data => data.sourceServiceId !== data.targetServiceId, {
  message: "Service cannot depend on itself",
  path: ["targetServiceId"],
});
