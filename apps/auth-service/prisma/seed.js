"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const password = await bcrypt_1.default.hash('password123', 10);
    const users = [
        { email: 'dev@mcia.local', name: 'Dev User', role: client_1.Role.DEVELOPER, password },
        { email: 'architect@mcia.local', name: 'Architect User', role: client_1.Role.ARCHITECT, password },
        { email: 'release@mcia.local', name: 'Release Manager', role: client_1.Role.RELEASE_MANAGER, password },
        { email: 'admin@mcia.local', name: 'Admin User', role: client_1.Role.ADMIN, password }
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
