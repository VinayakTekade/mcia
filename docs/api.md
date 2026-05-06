# API Reference — MCIA (Microservice Change Impact Analyzer)

All requests go through the **API Gateway** at `http://localhost:3000`.  
The gateway validates the JWT on every route except `/api/auth/register` and `/api/auth/login`.

---

## Conventions

| Convention | Detail |
|---|---|
| Base URL | `http://localhost:3000` |
| Content-Type | `application/json` |
| Authentication | `Authorization: Bearer <token>` header on protected routes |
| IDs | UUID v4 strings |
| Timestamps | ISO 8601 — `2026-05-09T10:00:00.000Z` |
| Validation errors | HTTP `400` with Zod-structured `{ issues: [...] }` |
| Auth errors | HTTP `401 Unauthorized` / `403 Forbidden` |
| Not found | HTTP `404 { "error": "..." }` |
| Conflict | HTTP `409 { "error": "..." }` |

---

## Rate Limiting

The gateway limits every IP to **100 requests per 15-minute window**.  
Exceeding the limit returns:

```
HTTP 429 Too Many Requests
"Too many requests from this IP, please try again after 15 minutes"
```

---

## Health Checks

Every service exposes a health endpoint (unauthenticated, no gateway prefix).

| Service | URL |
|---|---|
| API Gateway | `GET http://localhost:3000/health` |
| Auth Service | `GET http://localhost:3001/health` |
| Service Registry | `GET http://localhost:3002/health` |
| Dependency Mapping | `GET http://localhost:3003/health` |
| Change Request | `GET http://localhost:3004/health` |
| Impact Analysis | `GET http://localhost:3005/health` |
| Notification | `GET http://localhost:3006/health` |

**Response `200 OK`:**
```json
{ "status": "UP", "service": "<service-name>" }
```

---

## 1. Auth Service — `/api/auth`

> **Public** — no JWT required for `register` and `login`.

---

### `POST /api/auth/register`

Create a new user account.

**Request Body:**

```json
{
  "email": "alice@example.com",
  "password": "secret123",
  "name": "Alice",
  "role": "DEVELOPER"
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `email` | string | ✅ | Valid email format |
| `password` | string | ✅ | Minimum 6 characters |
| `name` | string | ✅ | Minimum 2 characters |
| `role` | enum | ❌ | `DEVELOPER` · `ARCHITECT` · `RELEASE_MANAGER` · `ADMIN` (default: `DEVELOPER`) |

**Response `201 Created`:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "alice@example.com",
  "name": "Alice",
  "role": "DEVELOPER",
  "createdAt": "2026-05-09T10:00:00.000Z",
  "updatedAt": "2026-05-09T10:00:00.000Z"
}
```

> Password is **never** returned.

**Errors:**

| Status | Condition |
|---|---|
| `400` | Validation failed (invalid email, short password, etc.) |
| `409` | Email already in use |

---

### `POST /api/auth/login`

Authenticate and receive a JWT token.

**Request Body:**

```json
{
  "email": "alice@example.com",
  "password": "secret123"
}
```

| Field | Type | Required |
|---|---|---|
| `email` | string | ✅ |
| `password` | string | ✅ |

**Response `200 OK`:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "alice@example.com",
    "name": "Alice",
    "role": "DEVELOPER"
  }
}
```

> The `token` is a **HS256 JWT** valid for **24 hours**. Pass it as `Authorization: Bearer <token>` on all subsequent requests.

**Errors:**

| Status | Condition |
|---|---|
| `400` | Validation failed |
| `401` | Invalid email or password |

---

### `GET /api/auth/profile` 🔒

Return the authenticated user's profile.

**Response `200 OK`:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "alice@example.com",
  "name": "Alice",
  "role": "DEVELOPER",
  "createdAt": "2026-05-09T10:00:00.000Z",
  "updatedAt": "2026-05-09T10:00:00.000Z"
}
```

---

### `GET /api/auth/verify` 🔒

Verify that the supplied JWT is valid and return the decoded claims. Used internally by the gateway middleware.

**Response `200 OK`:**

```json
{
  "valid": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "alice@example.com",
    "name": "Alice",
    "role": "DEVELOPER"
  }
}
```

---

## 2. Service Registry — `/api/services` 🔒

CRUD for microservices registered in the platform.

---

### `GET /api/services`

List all registered microservices.

**Response `200 OK`:**

```json
[
  {
    "id": "abc123",
    "name": "payment-service",
    "ownerTeam": "Payments",
    "repositoryUrl": "https://github.com/org/payment-service",
    "currentVersion": "2.1.0",
    "communicationType": "REST",
    "criticalityLevel": "CRITICAL",
    "description": "Handles payment processing",
    "endpoints": [
      {
        "id": "ep1",
        "serviceId": "abc123",
        "method": "POST",
        "path": "/api/payments",
        "version": "v1",
        "visibility": "PUBLIC",
        "isDeprecated": false,
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "createdBy": "user-id",
    "updatedBy": null,
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

---

### `GET /api/services/:id`

Get a single microservice by its ID.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `id` | UUID | Service identifier |

**Response `200 OK`:** Single service object (same shape as list item above).

**Errors:**

| Status | Condition |
|---|---|
| `404` | Service not found |

---

### `POST /api/services`

Register a new microservice.

**Request Body:**

```json
{
  "name": "payment-service",
  "ownerTeam": "Payments",
  "repositoryUrl": "https://github.com/org/payment-service",
  "currentVersion": "2.1.0",
  "communicationType": "REST",
  "criticalityLevel": "CRITICAL",
  "description": "Handles payment processing",
  "endpoints": [
    {
      "method": "POST",
      "path": "/api/payments",
      "version": "v1",
      "visibility": "PUBLIC",
      "isDeprecated": false
    }
  ]
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `name` | string | ✅ | Min 2 chars; must be unique |
| `ownerTeam` | string | ✅ | Min 2 chars |
| `repositoryUrl` | string | ❌ | Valid URL |
| `currentVersion` | string | ❌ | Default `"1.0.0"` |
| `communicationType` | enum | ❌ | `REST` · `GRPC` · `GRAPHQL` · `ASYNC_EVENT` (default `REST`) |
| `criticalityLevel` | enum | ❌ | `LOW` · `MEDIUM` · `HIGH` · `CRITICAL` (default `MEDIUM`) |
| `description` | string | ❌ | Free text |
| `endpoints` | array | ❌ | Array of endpoint objects (see below) |

**Endpoint object fields:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `method` | string | ✅ | HTTP verb — auto-uppercased |
| `path` | string | ✅ | Must start with `/` |
| `version` | string | ❌ | Default `"v1"` |
| `visibility` | enum | ❌ | `INTERNAL` · `PUBLIC` (default `INTERNAL`) |
| `isDeprecated` | boolean | ❌ | Default `false` |

**Response `201 Created`:** Full service object.

**Errors:**

| Status | Condition |
|---|---|
| `400` | Validation failed |
| `409` | Service name already exists |

---

### `PUT /api/services/:id`

Fully or partially update a registered microservice (all fields optional — partial update accepted).

**Path Parameters:** `id` — UUID

**Request Body:** Any subset of the `POST` body fields.

**Response `200 OK`:** Updated service object.

**Errors:**

| Status | Condition |
|---|---|
| `400` | Validation failed |
| `404` | Service not found |

---

### `DELETE /api/services/:id`

Remove a microservice from the registry.

**Path Parameters:** `id` — UUID

**Response `200 OK`:**

```json
{ "message": "Service deleted" }
```

**Errors:**

| Status | Condition |
|---|---|
| `404` | Service not found |

---

## 3. Dependency Mapping — `/api/dependencies` 🔒

Manage directed dependency edges between services.

---

### `GET /api/dependencies`

List all dependency records.

**Response `200 OK`:**

```json
[
  {
    "id": "dep123",
    "sourceServiceId": "svc-a",
    "targetServiceId": "svc-b",
    "dependencyType": "REST",
    "description": "Calls payment service to charge users",
    "contractReference": "https://docs.org/payment-api",
    "isCritical": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

---

### `GET /api/dependencies/graph`

Return the full dependency graph in a node-edge format suitable for graph visualisation.

**Response `200 OK`:**

```json
{
  "nodes": [
    { "id": "svc-a", "name": "order-service", "criticalityLevel": "HIGH" },
    { "id": "svc-b", "name": "payment-service", "criticalityLevel": "CRITICAL" }
  ],
  "edges": [
    { "source": "svc-a", "target": "svc-b", "dependencyType": "REST", "isCritical": true }
  ]
}
```

---

### `GET /api/dependencies/:serviceId/upstream`

Get all services that the given service **calls** (i.e. its dependencies).

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `serviceId` | UUID | The service whose upstream deps to retrieve |

**Response `200 OK`:** Array of `Dependency` objects where `sourceServiceId === serviceId`.

---

### `GET /api/dependencies/:serviceId/downstream`

Get all services that **call** the given service (i.e. its consumers).

**Path Parameters:** `serviceId` — UUID

**Response `200 OK`:** Array of `Dependency` objects where `targetServiceId === serviceId`.

---

### `POST /api/dependencies`

Create a new dependency edge.

**Request Body:**

```json
{
  "sourceServiceId": "svc-a",
  "targetServiceId": "svc-b",
  "dependencyType": "REST",
  "description": "Calls payment service to charge users",
  "contractReference": "https://docs.org/payment-api",
  "isCritical": true
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `sourceServiceId` | UUID string | ✅ | Must differ from `targetServiceId` |
| `targetServiceId` | UUID string | ✅ | Must differ from `sourceServiceId` |
| `dependencyType` | enum | ❌ | `REST` · `GRPC` · `EVENT_DRIVEN` · `QUEUE_BASED` (default `REST`) |
| `description` | string | ❌ | Free text |
| `contractReference` | string | ❌ | Valid URL |
| `isCritical` | boolean | ❌ | Default `true` |

> **Validation rule:** `sourceServiceId` and `targetServiceId` must be different (a service cannot depend on itself).

**Response `201 Created`:** New `Dependency` object.

**Errors:**

| Status | Condition |
|---|---|
| `400` | Validation failed or self-dependency |
| `409` | Edge between these two services already exists |

---

### `DELETE /api/dependencies/:id`

Remove a dependency edge.

**Path Parameters:** `id` — UUID

**Response `200 OK`:**

```json
{ "message": "Dependency deleted" }
```

---

## 4. Change Request Service — `/api/changes` 🔒

Manage the full lifecycle of a change request.

**Change workflow states:**

```
DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED
                                 → REJECTED
                                 → NEEDS_REVISION → SUBMITTED (re-submitted)
```

---

### `GET /api/changes`

List change requests. Results are filtered by the caller's role:
- **DEVELOPER** — sees only their own requests
- **ARCHITECT / RELEASE_MANAGER / ADMIN** — sees all requests

**Response `200 OK`:**

```json
[
  {
    "id": "cr-uuid",
    "title": "Remove deprecated /v1/pay endpoint",
    "description": "The v1 payment endpoint is no longer needed...",
    "targetServiceId": "svc-payment",
    "changeType": "ENDPOINT_REMOVAL",
    "status": "SUBMITTED",
    "authorId": "user-uuid",
    "reviewerId": null,
    "blastRadius": null,
    "impactAnalysis": null,
    "comments": [],
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

---

### `GET /api/changes/:id`

Get a single change request with all its comments.

**Path Parameters:** `id` — UUID

**Response `200 OK`:** Full `ChangeRequest` object including `comments` array.

**Errors:**

| Status | Condition |
|---|---|
| `404` | Change request not found |

---

### `POST /api/changes/draft`

Create a new change request as a `DRAFT`.

**Request Body:**

```json
{
  "title": "Remove deprecated /v1/pay endpoint",
  "description": "The v1 payment endpoint is no longer needed after migration to v2.",
  "targetServiceId": "550e8400-e29b-41d4-a716-446655440001",
  "changeType": "ENDPOINT_REMOVAL"
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `title` | string | ✅ | Minimum 5 characters |
| `description` | string | ✅ | Minimum 10 characters |
| `targetServiceId` | UUID string | ✅ | Must reference an existing service |
| `changeType` | enum | ✅ | `ENDPOINT_REMOVAL` · `CONTRACT_CHANGE` · `SCHEMA_UPDATE` · `VERSION_BUMP` · `DEPENDENCY_REMOVAL` · `DEPENDENCY_ADDITION` |

**Response `201 Created`:** New `ChangeRequest` with `status: "DRAFT"`.

**Errors:**

| Status | Condition |
|---|---|
| `400` | Validation failed |

---

### `POST /api/changes/:id/submit`

Transition a `DRAFT` change request to `SUBMITTED` state. Also triggers an async event to the **Impact Analysis Service** via RabbitMQ.

**Path Parameters:** `id` — UUID

**Body:** None required.

**Response `200 OK`:** Updated `ChangeRequest` with `status: "SUBMITTED"`.

**Errors:**

| Status | Condition |
|---|---|
| `403` | Not the author of this change request |
| `404` | Change request not found |
| `409` | Change request is not in `DRAFT` status |

**Side effects:**
- Publishes `change.submitted` event to RabbitMQ
- Impact Analysis Service consumes the event and generates an `ImpactReport` asynchronously
- Notification Service consumes the event and notifies relevant stakeholders

---

### `POST /api/changes/:id/review`

Submit a review decision on a `SUBMITTED` or `UNDER_REVIEW` change request.

> **Role required:** `ARCHITECT`, `RELEASE_MANAGER`, or `ADMIN`

**Path Parameters:** `id` — UUID

**Request Body:**

```json
{
  "action": "APPROVE",
  "comment": "Looks good. Impact is acceptable for this sprint."
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `action` | enum | ✅ | `APPROVE` · `REJECT` · `NEEDS_REVISION` |
| `comment` | string | ✅ | Minimum 1 character |

**Response `200 OK`:** Updated `ChangeRequest` with new `status` and the `ReviewComment` appended.

| `action` value | Resulting `status` |
|---|---|
| `APPROVE` | `APPROVED` |
| `REJECT` | `REJECTED` |
| `NEEDS_REVISION` | `NEEDS_REVISION` |

**Errors:**

| Status | Condition |
|---|---|
| `400` | Validation failed |
| `403` | Caller does not have reviewer role |
| `404` | Change request not found |

---

## 5. Impact Analysis Service — `/api/impact` 🔒

Run and retrieve blast-radius reports for change requests.

---

### `POST /api/impact/generate`

Synchronously generate an impact report for a change request.  
> Normally called **automatically** by the Impact Service when it consumes a `change.submitted` RabbitMQ event. Can also be called manually for testing.

**Request Body:**

```json
{
  "changeRequestId": "cr-uuid",
  "targetServiceId": "svc-uuid",
  "changeType": "ENDPOINT_REMOVAL",
  "graphData": {
    "nodes": [],
    "edges": []
  }
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `changeRequestId` | UUID string | ✅ | Must be a valid UUID |
| `targetServiceId` | UUID string | ✅ | Min 1 character |
| `changeType` | enum | ✅ | See Change Types above |
| `graphData` | object | ❌ | Override for testing; fetched from Dependency Service if omitted |

**Response `201 Created`:**

```json
{
  "id": "report-uuid",
  "changeRequestId": "cr-uuid",
  "targetServiceId": "svc-uuid",
  "changeType": "ENDPOINT_REMOVAL",
  "directImpacts": ["svc-order", "svc-billing"],
  "indirectImpacts": ["svc-analytics"],
  "affectedServices": 3,
  "affectedContracts": 2,
  "blastRadius": 3,
  "riskScore": 90,
  "riskLevel": "HIGH",
  "explanation": [
    "2 direct downstream consumers affected (+40 risk)",
    "1 indirect downstream consumers affected (+10 risk)",
    "Target service is marked as CRITICAL (+50 risk)",
    "Change type 'ENDPOINT_REMOVAL' represents a potential breaking contract change (+50 risk)"
  ],
  "createdAt": "2026-05-09T10:00:00.000Z"
}
```

**Risk score calculation:**

| Factor | Points Added |
|---|---|
| Each direct consumer | +20 per service |
| Each indirect consumer | +10 per service |
| Target service criticality = `HIGH` | +30 |
| Target service criticality = `CRITICAL` | +50 |
| Target service has `PUBLIC` endpoints | +40 |
| `changeType` is `ENDPOINT_REMOVAL` or `CONTRACT_CHANGE` | +50 |

**Risk levels:**

| Score | Level |
|---|---|
| 0–29 | `LOW` |
| 30–59 | `MEDIUM` |
| 60–99 | `HIGH` |
| ≥ 100 | `CRITICAL` |

---

### `GET /api/impact/:changeRequestId`

Retrieve a previously generated impact report.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `changeRequestId` | UUID | The change request the report was generated for |

**Response `200 OK`:** Full `ImpactReport` object (same shape as generate response above).

**Errors:**

| Status | Condition |
|---|---|
| `404` | No report found for this change request ID |

---

## 6. Notification Service — `/api/notifications` 🔒

In-app notification inbox for authenticated users.

---

### `GET /api/notifications`

Return all notifications for the authenticated user, ordered by `createdAt` descending.

**Response `200 OK`:**

```json
[
  {
    "id": "notif-uuid",
    "userId": "user-uuid",
    "type": "IMPACT_REPORT_GENERATED",
    "title": "Impact report ready",
    "body": "The impact analysis for CR-123 is complete. Risk level: HIGH.",
    "resourceId": "cr-uuid",
    "isRead": false,
    "createdAt": "2026-05-09T10:05:00.000Z",
    "updatedAt": "2026-05-09T10:05:00.000Z"
  }
]
```

**Notification types:**

| Type | Trigger |
|---|---|
| `CHANGE_SUBMITTED` | A change request is submitted for review |
| `IMPACT_REPORT_GENERATED` | An impact report is available |
| `REVIEW_REQUESTED` | A reviewer is assigned |
| `CHANGE_APPROVED` | A change request is approved |
| `CHANGE_REJECTED` | A change request is rejected |

---

### `PATCH /api/notifications/:id/read`

Mark a notification as read.

**Path Parameters:** `id` — UUID

**Response `200 OK`:**

```json
{
  "id": "notif-uuid",
  "isRead": true,
  "updatedAt": "2026-05-09T10:10:00.000Z"
}
```

**Errors:**

| Status | Condition |
|---|---|
| `404` | Notification not found |

---

### `PATCH /api/notifications/:id/unread`

Mark a notification as unread.

**Path Parameters:** `id` — UUID

**Response `200 OK`:** Notification object with `isRead: false`.

---

## Error Response Format

All errors follow a consistent shape:

```json
{
  "error": "Human-readable message"
}
```

Zod validation errors return the full issue list:

```json
{
  "issues": [
    {
      "code": "too_small",
      "minimum": 6,
      "path": ["password"],
      "message": "String must contain at least 6 character(s)"
    }
  ]
}
```

---

## Authentication Flow (Summary)

```
1. POST /api/auth/register   → create account
2. POST /api/auth/login      → receive { token, user }
3. All subsequent requests:
   Authorization: Bearer <token>
4. Gateway middleware calls /api/auth/verify internally
5. Decoded { id, email, role, name } injected into req.user
   for downstream services
```

---

## Route Summary

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Register a new user |
| `POST` | `/api/auth/login` | ❌ | Login and get JWT |
| `GET` | `/api/auth/profile` | ✅ | Get current user profile |
| `GET` | `/api/auth/verify` | ✅ | Verify JWT validity |
| `GET` | `/api/services` | ✅ | List all microservices |
| `GET` | `/api/services/:id` | ✅ | Get service by ID |
| `POST` | `/api/services` | ✅ | Register a microservice |
| `PUT` | `/api/services/:id` | ✅ | Update a microservice |
| `DELETE` | `/api/services/:id` | ✅ | Delete a microservice |
| `GET` | `/api/dependencies` | ✅ | List all dependencies |
| `GET` | `/api/dependencies/graph` | ✅ | Full graph (nodes + edges) |
| `GET` | `/api/dependencies/:sid/upstream` | ✅ | Upstream deps of a service |
| `GET` | `/api/dependencies/:sid/downstream` | ✅ | Downstream deps of a service |
| `POST` | `/api/dependencies` | ✅ | Create dependency edge |
| `DELETE` | `/api/dependencies/:id` | ✅ | Delete dependency edge |
| `GET` | `/api/changes` | ✅ | List change requests |
| `GET` | `/api/changes/:id` | ✅ | Get change request by ID |
| `POST` | `/api/changes/draft` | ✅ | Create change request draft |
| `POST` | `/api/changes/:id/submit` | ✅ | Submit draft for review |
| `POST` | `/api/changes/:id/review` | ✅ (reviewer roles) | Approve / reject / revise |
| `POST` | `/api/impact/generate` | ✅ | Generate impact report |
| `GET` | `/api/impact/:changeRequestId` | ✅ | Get impact report |
| `GET` | `/api/notifications` | ✅ | List user notifications |
| `PATCH` | `/api/notifications/:id/read` | ✅ | Mark notification read |
| `PATCH` | `/api/notifications/:id/unread` | ✅ | Mark notification unread |
