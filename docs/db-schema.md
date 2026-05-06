# Database Schema — MCIA (Microservice Change Impact Analyzer)

Each microservice owns an isolated **PostgreSQL** database. The databases are initialised by `init-dbs.sql` on first container start and schemas are managed by **Prisma ORM** inside each service.

---

## Overview

| Service | Database | Tables |
|---|---|---|
| auth-service | `auth_db` | `User` |
| service-registry-service | `registry_db` | `Microservice`, `EndpointMetadata` |
| dependency-mapping-service | `dependency_db` | `Dependency` |
| change-request-service | `change_db` | `ChangeRequest`, `ReviewComment` |
| impact-analysis-service | `impact_db` | `ImpactReport` |
| notification-service | `notification_db` | `Notification` |

---

## 1. `auth_db` — Auth Service

### `User`

Stores registered users and their role in the system.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `String (UUID)` | PK, default `uuid()` | Unique user identifier |
| `email` | `String` | UNIQUE, NOT NULL | User's login email |
| `password` | `String` | NOT NULL | Bcrypt-hashed password |
| `name` | `String` | NOT NULL | Display name |
| `role` | `Role` (enum) | NOT NULL, default `DEVELOPER` | Access role |
| `createdAt` | `DateTime` | NOT NULL, default `now()` | Record creation timestamp |
| `updatedAt` | `DateTime` | NOT NULL, auto-updated | Record last-update timestamp |

**`Role` enum values:** `DEVELOPER` · `ARCHITECT` · `RELEASE_MANAGER` · `ADMIN`

```prisma
enum Role {
  DEVELOPER
  ARCHITECT
  RELEASE_MANAGER
  ADMIN
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(DEVELOPER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 2. `registry_db` — Service Registry Service

### `Microservice`

Catalogue of all registered microservices in the organisation.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `String (UUID)` | PK, default `uuid()` | Unique service identifier |
| `name` | `String` | UNIQUE, NOT NULL | Service name |
| `ownerTeam` | `String` | NOT NULL | Owning team name |
| `repositoryUrl` | `String?` | optional | VCS repository link |
| `currentVersion` | `String` | NOT NULL, default `"1.0.0"` | Semver of the deployed service |
| `communicationType` | `CommType` (enum) | NOT NULL, default `REST` | Primary communication protocol |
| `criticalityLevel` | `Criticality` (enum) | NOT NULL, default `MEDIUM` | Business criticality rating |
| `description` | `String?` | optional | Human-readable description |
| `createdBy` | `String?` | optional | Audit — userId who created |
| `updatedBy` | `String?` | optional | Audit — userId of last updater |
| `createdAt` | `DateTime` | NOT NULL, default `now()` | Record creation timestamp |
| `updatedAt` | `DateTime` | NOT NULL, auto-updated | Record last-update timestamp |

**`CommType` enum values:** `REST` · `GRPC` · `GRAPHQL` · `ASYNC_EVENT`

**`Criticality` enum values:** `LOW` · `MEDIUM` · `HIGH` · `CRITICAL`

### `EndpointMetadata`

Stores individual HTTP endpoints exposed by each registered service.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `String (UUID)` | PK, default `uuid()` | Unique endpoint identifier |
| `serviceId` | `String` | FK → `Microservice.id`, CASCADE | Owning service |
| `method` | `String` | NOT NULL | HTTP verb (`GET`, `POST`, etc.) |
| `path` | `String` | NOT NULL | URL path template |
| `version` | `String` | NOT NULL, default `"v1"` | API version |
| `visibility` | `String` | NOT NULL, default `"INTERNAL"` | `INTERNAL` or `PUBLIC` |
| `isDeprecated` | `Boolean` | NOT NULL, default `false` | Deprecation flag |
| `createdAt` | `DateTime` | NOT NULL, default `now()` | Record creation timestamp |
| `updatedAt` | `DateTime` | NOT NULL, auto-updated | Record last-update timestamp |

**Unique constraint:** `(serviceId, method, path, version)`

```prisma
model Microservice {
  id                String             @id @default(uuid())
  name              String             @unique
  ownerTeam         String
  repositoryUrl     String?
  currentVersion    String             @default("1.0.0")
  communicationType CommType           @default(REST)
  criticalityLevel  Criticality        @default(MEDIUM)
  description       String?
  endpoints         EndpointMetadata[]
  createdBy         String?
  updatedBy         String?
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt
}

model EndpointMetadata {
  id           String       @id @default(uuid())
  serviceId    String
  service      Microservice @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  method       String
  path         String
  version      String       @default("v1")
  visibility   String       @default("INTERNAL")
  isDeprecated Boolean      @default(false)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  @@unique([serviceId, method, path, version])
}
```

---

## 3. `dependency_db` — Dependency Mapping Service

### `Dependency`

Directed edges in the service dependency graph.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `String (UUID)` | PK, default `uuid()` | Unique dependency identifier |
| `sourceServiceId` | `String` | NOT NULL | Service that **initiates** the call |
| `targetServiceId` | `String` | NOT NULL | Service that **receives** the call |
| `dependencyType` | `DependencyType` (enum) | NOT NULL, default `REST` | Communication protocol used |
| `description` | `String?` | optional | Human-readable relationship note |
| `contractReference` | `String?` | optional | URL/path to Swagger or AsyncAPI spec |
| `isCritical` | `Boolean` | NOT NULL, default `true` | Marks if link is mission-critical |
| `createdAt` | `DateTime` | NOT NULL, default `now()` | Record creation timestamp |
| `updatedAt` | `DateTime` | NOT NULL, auto-updated | Record last-update timestamp |

**Unique constraint:** `(sourceServiceId, targetServiceId)`

**`DependencyType` enum values:** `REST` · `GRPC` · `EVENT_DRIVEN` · `QUEUE_BASED`

```prisma
model Dependency {
  id                String         @id @default(uuid())
  sourceServiceId   String
  targetServiceId   String
  dependencyType    DependencyType @default(REST)
  description       String?
  contractReference String?
  isCritical        Boolean        @default(true)
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt

  @@unique([sourceServiceId, targetServiceId])
}
```

---

## 4. `change_db` — Change Request Service

### `ChangeRequest`

Lifecycle record for a proposed change to any microservice.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `String (UUID)` | PK, default `uuid()` | Unique change request identifier |
| `title` | `String` | NOT NULL | Short, descriptive title |
| `description` | `String` | NOT NULL | Full change description |
| `targetServiceId` | `String` | NOT NULL | Service being changed |
| `changeType` | `ChangeType` (enum) | NOT NULL | Nature of the change |
| `status` | `ChangeStatus` (enum) | NOT NULL, default `DRAFT` | Current workflow status |
| `authorId` | `String` | NOT NULL | `User.id` of the requestor |
| `reviewerId` | `String?` | optional | `User.id` of assigned reviewer |
| `blastRadius` | `Int?` | optional | Count of impacted services (set async) |
| `impactAnalysis` | `Json?` | optional | Full async impact report payload |
| `createdAt` | `DateTime` | NOT NULL, default `now()` | Record creation timestamp |
| `updatedAt` | `DateTime` | NOT NULL, auto-updated | Record last-update timestamp |

**`ChangeType` enum values:** `ENDPOINT_REMOVAL` · `CONTRACT_CHANGE` · `SCHEMA_UPDATE` · `VERSION_BUMP` · `DEPENDENCY_REMOVAL` · `DEPENDENCY_ADDITION`

**`ChangeStatus` enum values:** `DRAFT` → `SUBMITTED` → `UNDER_REVIEW` → `APPROVED` / `REJECTED` / `NEEDS_REVISION`

### `ReviewComment`

User comments attached to a change request during review.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `String (UUID)` | PK, default `uuid()` | Unique comment identifier |
| `changeRequestId` | `String` | FK → `ChangeRequest.id`, CASCADE | Parent change request |
| `authorId` | `String` | NOT NULL | `User.id` who posted the comment |
| `content` | `String` | NOT NULL | Comment body |
| `createdAt` | `DateTime` | NOT NULL, default `now()` | Record creation timestamp |

```prisma
model ChangeRequest {
  id              String          @id @default(uuid())
  title           String
  description     String
  targetServiceId String
  changeType      ChangeType
  status          ChangeStatus    @default(DRAFT)
  authorId        String
  reviewerId      String?
  comments        ReviewComment[]
  blastRadius     Int?
  impactAnalysis  Json?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

model ReviewComment {
  id              String        @id @default(uuid())
  changeRequestId String
  changeRequest   ChangeRequest @relation(fields: [changeRequestId], references: [id], onDelete: Cascade)
  authorId        String
  content         String
  createdAt       DateTime      @default(now())
}
```

---

## 5. `impact_db` — Impact Analysis Service

### `ImpactReport`

Persisted result of blast-radius analysis for a specific change request.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `String (UUID)` | PK, default `uuid()` | Unique report identifier |
| `changeRequestId` | `String` | UNIQUE | Linked change request (1-to-1) |
| `targetServiceId` | `String` | NOT NULL | Service that is changing |
| `changeType` | `String` | NOT NULL | Mirrors `ChangeType` value |
| `directImpacts` | `String[]` | NOT NULL | Array of directly affected service IDs |
| `indirectImpacts` | `String[]` | NOT NULL | Array of transitively affected service IDs |
| `affectedServices` | `Int` | NOT NULL | Total count of affected services |
| `affectedContracts` | `Int` | NOT NULL | Count of affected API contracts |
| `blastRadius` | `Int` | NOT NULL | Composite blast-radius score |
| `riskScore` | `Int` | NOT NULL | Numeric risk score (0–100) |
| `riskLevel` | `String` | NOT NULL | `LOW` · `MEDIUM` · `HIGH` · `CRITICAL` |
| `explanation` | `Json` | NOT NULL | Array of risk-factor objects |
| `createdAt` | `DateTime` | NOT NULL, default `now()` | Report generation timestamp |

```prisma
model ImpactReport {
  id                String   @id @default(uuid())
  changeRequestId   String   @unique
  targetServiceId   String
  changeType        String
  directImpacts     String[]
  indirectImpacts   String[]
  affectedServices  Int
  affectedContracts Int
  blastRadius       Int
  riskScore         Int
  riskLevel         String
  explanation       Json
  createdAt         DateTime @default(now())
}
```

---

## 6. `notification_db` — Notification Service

### `Notification`

In-app notification records delivered to users on workflow events.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `String (UUID)` | PK, default `uuid()` | Unique notification identifier |
| `userId` | `String` | NOT NULL | `User.id` of the recipient |
| `type` | `NotificationType` (enum) | NOT NULL | Notification event category |
| `title` | `String` | NOT NULL | Short notification heading |
| `body` | `String` | NOT NULL | Full notification message |
| `resourceId` | `String?` | optional | Related resource ID (e.g. `changeRequestId`) |
| `isRead` | `Boolean` | NOT NULL, default `false` | Read/unread state |
| `createdAt` | `DateTime` | NOT NULL, default `now()` | Record creation timestamp |
| `updatedAt` | `DateTime` | NOT NULL, auto-updated | Record last-update timestamp |

**`NotificationType` enum values:** `CHANGE_SUBMITTED` · `IMPACT_REPORT_GENERATED` · `REVIEW_REQUESTED` · `CHANGE_APPROVED` · `CHANGE_REJECTED`

```prisma
model Notification {
  id         String           @id @default(uuid())
  userId     String
  type       NotificationType
  title      String
  body       String
  resourceId String?
  isRead     Boolean          @default(false)
  createdAt  DateTime         @default(now())
  updatedAt  DateTime         @updatedAt
}
```

---

## Entity Relationship Overview

```
auth_db                         registry_db
┌──────────┐                   ┌──────────────────┐   1..* ┌──────────────────┐
│  User    │                   │  Microservice    │───────▶│ EndpointMetadata │
│  id (PK) │                   │  id (PK)         │        │  id (PK)         │
│  email   │                   │  name            │        │  serviceId (FK)  │
│  role    │                   │  ownerTeam       │        │  method          │
└──────────┘                   │  criticalityLevel│        │  path            │
                               └──────────────────┘        └──────────────────┘

dependency_db                   change_db
┌────────────────┐             ┌──────────────────┐  1..* ┌───────────────┐
│  Dependency    │             │  ChangeRequest   │──────▶│ ReviewComment │
│  id (PK)       │             │  id (PK)         │       │  id (PK)      │
│  sourceService │             │  targetServiceId │       │  changeReqId  │
│  targetService │             │  authorId        │       │  authorId     │
│  isCritical    │             │  status          │       │  content      │
└────────────────┘             │  impactAnalysis  │       └───────────────┘
                               └──────────────────┘

impact_db                       notification_db
┌──────────────┐               ┌──────────────┐
│ ImpactReport │               │ Notification │
│  id (PK)     │               │  id (PK)     │
│  changeReqId │               │  userId      │
│  riskScore   │               │  type        │
│  blastRadius │               │  isRead      │
└──────────────┘               └──────────────┘
```

> **Cross-database references** (e.g. `authorId` in `ChangeRequest` referencing `User.id`) are **logical** — enforced at the application layer, not via foreign-key constraints, because each service owns an isolated database.
