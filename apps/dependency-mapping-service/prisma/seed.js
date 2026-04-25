'use strict';
// Compiled seed script for dependency-mapping-service
// Generated from prisma/seed.ts — runs in Node.js without ts-node

const { PrismaClient } = require('../node_modules/@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const dependencies = [
    {
      sourceServiceId: 'api-gateway',
      targetServiceId: 'auth-service',
      dependencyType: 'REST',
      description: 'Proxies auth requests and validates JWTs',
      isCritical: true,
    },
    {
      sourceServiceId: 'api-gateway',
      targetServiceId: 'service-registry-service',
      dependencyType: 'REST',
      description: 'Proxies registry requests',
      isCritical: true,
    },
    {
      sourceServiceId: 'api-gateway',
      targetServiceId: 'dependency-mapping-service',
      dependencyType: 'REST',
      description: 'Proxies graph requests',
      isCritical: true,
    },
    {
      sourceServiceId: 'impact-analysis-service',
      targetServiceId: 'dependency-mapping-service',
      dependencyType: 'REST',
      description: 'Fetches the full dependency graph to calculate blast radius',
      isCritical: true,
    },
    {
      sourceServiceId: 'change-request-service',
      targetServiceId: 'impact-analysis-service',
      dependencyType: 'EVENT_DRIVEN',
      description: 'Fires event to start impact calculation',
      contractReference: 'https://schema.mcia.local/events/change-submitted.json',
      isCritical: false,
    },
  ];

  console.log('Seeding dependencies...');
  for (const d of dependencies) {
    const created = await prisma.dependency.upsert({
      where: {
        sourceServiceId_targetServiceId: {
          sourceServiceId: d.sourceServiceId,
          targetServiceId: d.targetServiceId,
        },
      },
      update: {},
      create: d,
    });
    console.log(`Created dependency: ${created.sourceServiceId} -> ${created.targetServiceId}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
