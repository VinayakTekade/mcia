"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const services = [
        {
            name: 'auth-service',
            ownerTeam: 'Platform Security',
            repositoryUrl: 'https://github.com/company/auth-service',
            currentVersion: '1.2.0',
            communicationType: client_1.CommType.REST,
            criticalityLevel: client_1.Criticality.CRITICAL,
            description: 'Handles user authentication and JWT issuance',
            endpoints: {
                create: [
                    { method: 'POST', path: '/api/auth/login', visibility: 'PUBLIC' },
                    { method: 'POST', path: '/api/auth/register', visibility: 'PUBLIC' },
                    { method: 'GET', path: '/api/auth/verify', visibility: 'INTERNAL' }
                ]
            }
        },
        {
            name: 'service-registry-service',
            ownerTeam: 'Platform Architecture',
            repositoryUrl: 'https://github.com/company/registry-service',
            currentVersion: '1.0.0',
            communicationType: client_1.CommType.REST,
            criticalityLevel: client_1.Criticality.HIGH,
            description: 'Maintains catalog of microservices',
            endpoints: {
                create: [
                    { method: 'GET', path: '/api/services', visibility: 'INTERNAL' },
                    { method: 'POST', path: '/api/services', visibility: 'INTERNAL' }
                ]
            }
        },
        {
            name: 'dependency-mapping-service',
            ownerTeam: 'Platform Architecture',
            repositoryUrl: 'https://github.com/company/dep-mapping-service',
            currentVersion: '1.0.0',
            communicationType: client_1.CommType.REST,
            criticalityLevel: client_1.Criticality.MEDIUM,
            description: 'Maps dependencies between services',
            endpoints: {
                create: [
                    { method: 'GET', path: '/api/dependencies', visibility: 'INTERNAL' }
                ]
            }
        },
        {
            name: 'change-request-service',
            ownerTeam: 'Release Engineering',
            repositoryUrl: 'https://github.com/company/change-service',
            currentVersion: '2.0.1',
            communicationType: client_1.CommType.REST,
            criticalityLevel: client_1.Criticality.HIGH,
            description: 'Manages change request lifecycles and triggers analysis',
            endpoints: {
                create: [
                    { method: 'POST', path: '/api/changes', visibility: 'INTERNAL' }
                ]
            }
        },
        {
            name: 'impact-analysis-service',
            ownerTeam: 'Release Engineering',
            repositoryUrl: 'https://github.com/company/impact-service',
            currentVersion: '1.0.0',
            communicationType: client_1.CommType.ASYNC_EVENT,
            criticalityLevel: client_1.Criticality.HIGH,
            description: 'Calculates blast radius of changes',
            endpoints: { create: [] }
        }
    ];
    console.log('Seeding microservices...');
    for (const s of services) {
        const created = await prisma.microservice.upsert({
            where: { name: s.name },
            update: {},
            create: s,
        });
        console.log(`Created service: ${created.name}`);
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
