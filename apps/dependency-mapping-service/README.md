# Dependency Mapping Service

Stores and computes the relationships between microservices.

## Database
Uses PostgreSQL via Prisma (`dependency_db`).
Commands:
* `npm run db:generate`: Generates Prisma client.
* `npm run db:push`: Pushes schema to the DB.
* `npm run db:seed`: Seeds sample interconnected graph dependencies.

## Endpoints
* `POST /api/dependencies`
* `GET /api/dependencies`
* `GET /api/dependencies/graph`
* `GET /api/dependencies/:serviceId/upstream`
* `GET /api/dependencies/:serviceId/downstream`
