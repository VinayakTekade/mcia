import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  const users = [
    { email: 'dev@mcia.local', name: 'Dev User', role: Role.DEVELOPER, password },
    { email: 'architect@mcia.local', name: 'Architect User', role: Role.ARCHITECT, password },
    { email: 'release@mcia.local', name: 'Release Manager', role: Role.RELEASE_MANAGER, password },
    { email: 'admin@mcia.local', name: 'Admin User', role: Role.ADMIN, password }
  ];

  console.log('Start seeding...');
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
    console.log(`Created user with id: ${user.id} and role: ${user.role}`);
  }
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
