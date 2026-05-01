# Notification Service

Consumes system events from RabbitMQ and stores notification history per user.

## Database
Uses PostgreSQL via Prisma (`notification_db`).

## Event Payload Expectations

The consumer listens to the `mcia_events` topic exchange for the following routing keys:

### `change.submitted`
```json
{ "id": "cr-uuid", "title": "Change title", "targetServiceId": "auth-service", "authorId": "dev-uuid" }
```

### `change.impact_generated`
```json
{ "changeRequestId": "cr-uuid", "riskLevel": "CRITICAL", "blastRadius": 5 }
```

### `change.under_review`
```json
{ "id": "cr-uuid", "title": "Change title", "reviewerId": "arch-uuid" }
```

### `change.approved`
```json
{ "id": "cr-uuid", "title": "Change title", "authorId": "dev-uuid" }
```

### `change.rejected`
```json
{ "id": "cr-uuid", "title": "Change title", "authorId": "dev-uuid" }
```

## REST Endpoints
* `GET /api/notifications?userId=<id>` — List user notifications
* `PATCH /api/notifications/:id/read` — Mark notification as read
* `PATCH /api/notifications/:id/unread` — Mark notification as unread
* `GET /health`
