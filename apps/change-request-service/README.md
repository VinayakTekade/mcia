# Change Request Service

Manages the lifecycle of microservice change proposals and integrates tightly with RabbitMQ for event-driven workflows.

## Database
Uses PostgreSQL via Prisma (`change_db`).
Commands:
* `npm run db:generate`: Generates Prisma client.
* `npm run db:push`: Pushes schema to the DB.

## Event Broadcasting
Publishes the following routing keys to the `mcia_events` RabbitMQ exchange:
* `change.draft_created`
* `change.submitted` (Triggers downstream impact analysis)
* `change.approved`
* `change.rejected`
* `change.needs_revision`

## Endpoints
* `POST /api/changes/draft`
* `POST /api/changes/:id/submit`
* `POST /api/changes/:id/review` (Expects `APPROVE`, `REJECT`, `NEEDS_REVISION`)
* `GET /api/changes`
* `GET /api/changes/:id`
