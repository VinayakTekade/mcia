# Microservice Change Impact Analyzer - Implementation Plan

## 1. Project Summary
The Microservice Change Impact Analyzer is a full-stack platform designed to help engineering teams predict and evaluate the downstream impact of changing a microservice before the change is deployed. By registering services, mapping dependencies, and analyzing change requests in a simulated environment, the system calculates a "blast radius" to prevent contract breakages and workflow disruptions. The solution employs a microservices architecture using Node.js, TypeScript, React, PostgreSQL, and RabbitMQ.

---

## 2. Microservices Table

| Service Name | Description | Tech Stack | Type |
| :--- | :--- | :--- | :--- |
| **Frontend** | SPA providing the UI for Developers, Architects, Release Managers, and Admins. | React, Vite, TS | UI |
| **API Gateway** | Central entry point for all frontend requests, routing them to the appropriate backend service. | Node.js, Express | Gateway |
| **Auth Service** | Manages users, roles, and issues JWTs for authentication and authorization. | Node.js, Express, Prisma | Sync REST |
| **Service Registry Service**| Maintains the catalog of microservices and their owners. | Node.js, Express, Prisma | Sync REST |
| **Dependency Mapping Service**| Manages the graph of upstream/downstream service relationships. | Node.js, Express, Prisma | Sync REST |
| **Change Request Service**| Manages the lifecycle of a change request and triggers impact analysis events. | Node.js, Express, Prisma | Sync REST + Pub |
| **Impact Analysis Service** | Consumes change events, calculates blast radius, and updates risk scores. | Node.js, RabbitMQ, Axios | Async Consumer |
| **Notification Service** | Consumes events and dispatches notifications (e.g., Slack, Email) for change updates. | Node.js, RabbitMQ | Async Consumer |

---

## 3. Repo/Folder Structure

The project will use an `npm` workspaces monorepo to organize services and share common libraries.

```text
/
├── docker-compose.yml       # Defines PostgreSQL, RabbitMQ, and custom microservices
├── init-dbs.sql             # SQL script to provision logical databases per service
├── package.json             # Root workspace configuration
├── tsconfig.base.json       # Base TS config
├── README.md                # Project documentation
├── PLAN.md                  # Implementation plan
├── apps/
│   ├── frontend/                # React Vite app
│   ├── api-gateway/             # Express API Gateway
│   ├── auth-service/            # Express service + Prisma schema
│   ├── service-registry-service/# Express service + Prisma schema
│   ├── dependency-mapping/      # Express service + Prisma schema
│   ├── change-request-service/  # Express service + Prisma schema
│   ├── impact-analysis-service/ # Express service + RabbitMQ Consumer
│   └── notification-service/    # Express service + RabbitMQ Consumer
    └── notification-service/    # Express service + RabbitMQ Consumer
```

---

## 4. API Gateway Responsibilities
- **Single Entry Point**: Serves as the sole entry point for the React Frontend. The frontend never communicates directly with backend services.
- **Request Routing**: Proxies requests (using tools like `http-proxy-middleware`) to the correct internal microservice based on the URL path (e.g., `/api/auth` -> Auth Service).
- **CORS Management**: Handles Cross-Origin Resource Sharing for the entire API suite.
- **Request Logging**: Acts as the first point of logging for incoming requests to trace system usage.

---

## 5. Database Ownership by Service
To maintain strict service boundaries, each service owns its data. For local development, a single PostgreSQL instance is used, but data is logically separated into isolated databases.

*   **Auth Service** -> `auth_db` (Owns `User` tables)
*   **Service Registry Service** -> `registry_db` (Owns `Service` tables)
*   **Dependency Mapping Service** -> `mapping_db` (Owns `Dependency` tables)
*   **Change Request Service** -> `changes_db` (Owns `ChangeRequest` tables)
*   **Impact Analysis Service** -> *Stateless / Cache* (Fetches dependency graph via API, does not own core entity tables)
*   **Notification Service** -> *Stateless* (Does not require database storage)

---

## 6. Build Phases from Phase 1 to Phase 8

*   **Phase 1: Foundation Setup**
    *   Initialize monorepo structure using `npm` workspaces.
    *   Create root `tsconfig.base.json` and `package.json`.
    *   Write `docker-compose.yml` for PostgreSQL and RabbitMQ.
    *   Create `init-dbs.sql` to initialize all isolated databases.
*   **Phase 2: Core Registry & Gateway**
    *   Implement `auth-service` and its Prisma schema.
    *   Implement `service-registry-service` and its Prisma schema.
    *   Implement the `api-gateway` to proxy routes to these two services.
*   **Phase 4: Dependency Mapping**
    *   Implement `dependency-mapping-service` to track upstream/downstream mappings.
    *   Update `api-gateway` routes.
*   **Phase 5: Change Management**
    *   Implement `change-request-service` allowing users to submit change drafts.
    *   Integrate with `api-gateway` routes.
*   **Phase 6: Async Event Processing**
    *   Add RabbitMQ publisher to `change-request-service` on change creation.
    *   Implement `impact-analysis-service` to consume events, fetch dependencies, calculate blast radius, and update the change request asynchronously.
    *   Implement `notification-service` to log simulated notifications upon analysis completion.
*   **Phase 7: Frontend Development**
    *   Initialize the Vite + React frontend.
    *   Implement the API Axios client.
    *   Build the UI Modules: Dashboard (Service Catalog), Graph Views, and Change Request submission forms.
*   **Phase 8: Finalization & Testing**
    *   Containerize all Node.js and React services via Dockerfiles.
    *   Update `docker-compose.yml` to orchestrate the entire platform.
    *   Write end-to-end instructions in `README.md`.
    *   Verify request flows, async event flows, and local development setup.

---

## 7. Top Risks and Mitigation

1.  **Risk:** *Data Inconsistency / Stale Dependency Graphs*
    *   **Mitigation:** The Impact Analysis service will query the Dependency Mapping service directly at the time of the event (or via Gateway) to ensure the graph is fresh when calculating the blast radius.
2.  **Risk:** *RabbitMQ Event Loss*
    *   **Mitigation:** Use durable exchanges and queues. Ensure messages are explicitly acknowledged (`channel.ack()`) only after processing succeeds. Implement Dead Letter Exchanges (DLX) for failed messages in production.
3.  **Risk:** *API Gateway Bottleneck*
    *   The Gateway is kept extremely lightweight (only routing and logging, no heavy processing). JWT validation is handled by the downstream services.
4.  **Risk:** *Complex Local Development Setup*
    *   **Mitigation:** Rely heavily on Docker Compose to spin up the entire infrastructure with a single command (`docker-compose up`). Use standard `npm run dev --workspace=apps/...` scripts for hot-reloading individual microservices during development.
