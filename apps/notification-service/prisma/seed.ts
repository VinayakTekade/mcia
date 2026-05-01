import 'dotenv/config';
import { PrismaClient, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const notifications = [
    {
      userId: 'developer-uuid-1',
      type: NotificationType.CHANGE_SUBMITTED,
      title: 'Change Request Submitted',
      body: 'Your change request "Update Auth API" has been submitted for review.',
      resourceId: 'sample-cr-id-1',
    },
    {
      userId: 'architect-uuid-1',
      type: NotificationType.REVIEW_REQUESTED,
      title: 'Review Requested',
      body: 'A change request requires your review.',
      resourceId: 'sample-cr-id-1',
    }
  ];

  console.log('Seeding notifications...');
  for (const n of notifications) {
    const created = await prisma.notification.create({ data: n });
    console.log(`Created notification: [${created.type}] for user ${created.userId}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
