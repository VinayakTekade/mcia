# Microservice Change Impact Analyzer (MCIA)

> A production-style full-stack platform that helps engineering teams predict the downstream impact of changing a microservice before deployment.

---

## Architecture

```
Browser → [Frontend :80] → [API Gateway :3000] → [Microservices :3001-3006]
                                                       ↓
                                              [PostgreSQL :5432]
                                              [RabbitMQ   :5672]
```

| Service | Port | Description |
|---|---|---|
| Frontend (nginx) | `80` | React + Vite dashboard |
| API Gateway | `3000` | Central entry point with JWT auth |
| Auth Service | `3001` | Registration, login, JWT issuance |
| Service Registry | `3002` | Microservice catalog |
| Dependency Mapping | `3003` | Service graph + dependency storage |
| Change Request | `3004` | Change lifecycle + RabbitMQ publisher |
| Impact Analysis | `3005` | Risk scoring + RabbitMQ consumer |
| Notification | `3006` | Notification store + RabbitMQ consumer |
| PostgreSQL | `5432` | Persistent data (6 logical databases) |
| RabbitMQ | `5672` / `15672` | Async messaging + Management UI |

---

## Quick Start Runbook

### Prerequisites
- Docker Desktop ≥ 24
- Node.js ≥ 20 (for local development only)
- npm ≥ 10

---

### 1. Install

```bash
# Clone the repository and install all workspace dependencies
git clone <repo-url>
cd FSADAssignment
npm install
```

---

### 2. Start (Docker — Full Stack)

```bash
# Start everything (infrastructure + all services + frontend)
docker compose up --build -d

# Tail logs from all services
docker compose logs -f

# Tail a single service
docker compose logs -f api-gateway
```

**Startup order is automatic:**
1. `postgres` + `rabbitmq` (health-checked)
2. `auth-service`, `service-registry-service` (wait for postgres)
3. `dependency-mapping-service`
4. `change-request-service`, `impact-analysis-service`, `notification-service` (wait for rabbitmq)
5. `api-gateway` (waits for all services)
6. `frontend` (waits for api-gateway)

**Access the platform:**
- 🌐 Frontend → http://localhost
- 🔌 API Gateway → http://localhost:3000
- 🐰 RabbitMQ UI → http://localhost:15672 (guest/guest)

---

### 3. Start (Local Development — Services Only)

```bash
# Start only infrastructure (PostgreSQL + RabbitMQ)
docker compose up postgres rabbitmq -d

# Run each service in a separate terminal:
npm run dev:auth         # :3001
npm run dev:registry     # :3002
npm run dev:mapping      # :3003
npm run dev:changes      # :3004
npm run dev:impact       # :3005
npm run dev:notifications # :3006
npm run dev:gateway      # :3000
npm run dev:frontend     # :5173
```

---

### 4. Database Setup & Seed

```bash
# Push schemas to all databases (first time only)
npm run db:push --workspace=@mcia/auth-service
npm run db:push --workspace=@mcia/service-registry-service
npm run db:push --workspace=@mcia/dependency-mapping-service
npm run db:push --workspace=@mcia/change-request-service
npm run db:push --workspace=@mcia/impact-analysis-service
npm run db:push --workspace=@mcia/notification-service

# Seed sample data
npm run db:seed --workspace=@mcia/auth-service
npm run db:seed --workspace=@mcia/service-registry-service
npm run db:seed --workspace=@mcia/dependency-mapping-service
npm run db:seed --workspace=@mcia/change-request-service
npm run db:seed --workspace=@mcia/notification-service
```

---

### 5. Test

```bash
# Run all tests across the monorepo
npm run test:all

# Run individual service tests
npm test --workspace=@mcia/auth-service
npm test --workspace=@mcia/service-registry-service
npm test --workspace=@mcia/dependency-mapping-service
npm test --workspace=@mcia/change-request-service
npm test --workspace=@mcia/impact-analysis-service
npm test --workspace=@mcia/notification-service
```

---

### 6. Stop

```bash
# Stop all containers (keeps volumes)
docker compose down

# Stop and wipe all data (destructive!)
docker compose down -v
```

---

## Demo Accounts

After seeding, log in with these credentials (password: `password123`):

| Email | Role |
|---|---|
| `dev@mcia.local` | DEVELOPER |
| `architect@mcia.local` | ARCHITECT |
| `release@mcia.local` | RELEASE_MANAGER |
| `admin@mcia.local` | ADMIN |

---

## Environment Variables

Each service reads from its own `.env` file (based on `.env.example`).  
For Docker, all environment variables are defined directly in `docker-compose.yml`.

**Key variables:**

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `RABBITMQ_URL` | AMQP connection string |
| `JWT_SECRET` | Shared secret for JWT signing |
| `*_SERVICE_URL` | Internal service-to-service URLs |

---

## Folder Structure

```
FSADAssignment/
├── apps/
│   ├── frontend/                  # React + Vite + TypeScript
│   ├── api-gateway/               # Express, JWT proxy
│   ├── auth-service/              # Prisma, bcrypt, JWT
│   ├── service-registry-service/  # Prisma, CRUD catalog
│   ├── dependency-mapping-service/# Prisma, graph API
│   ├── change-request-service/    # Prisma, RabbitMQ publisher
│   ├── impact-analysis-service/   # Prisma, RabbitMQ consumer, scoring
│   └── notification-service/      # Prisma, RabbitMQ consumer
├── init-dbs.sql                   # Creates all 6 PostgreSQL databases
├── docker-compose.yml             # Full stack orchestration
└── package.json                   # npm workspace root
```
