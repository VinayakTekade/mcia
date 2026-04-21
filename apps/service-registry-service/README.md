# Service Registry Service

Manages the microservice catalog, owners, descriptions, and endpoint metadata.

## Database
Uses PostgreSQL via Prisma (`registry_db`).
Commands:
* `npm run db:generate`: Generates Prisma client.
* `npm run db:push`: Pushes schema to the DB.
* `npm run db:seed`: Seeds sample services.

## Endpoints
* `GET /api/services` (Supports `?page=1&limit=10&search=auth`)
* `GET /api/services/:id`
* `POST /api/services`
* `PUT /api/services/:id`
* `DELETE /api/services/:id`
