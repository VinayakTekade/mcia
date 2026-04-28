import 'dotenv/config';
import { PrismaClient, ChangeType, ChangeStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const changes = [
    {
      title: 'Update Auth API',
      description: 'Deprecate old v1 endpoints',
      targetServiceId: 'auth-service',
      changeType: ChangeType.ENDPOINT_REMOVAL,
      status: ChangeStatus.DRAFT,
      authorId: 'developer-uuid-1',
    }
  ];

  console.log('Seeding change requests...');
  for (const c of changes) {
    const created = await prisma.changeRequest.create({
      data: c,
    });
    console.log(`Created draft change request: ${created.title}`);
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
