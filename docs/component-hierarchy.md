# Component Hierarchy — MCIA Frontend

The frontend is a **React 18 + Vite** single-page application written in TypeScript, styled with TailwindCSS, and state-managed via TanStack Query (server state) and Zustand (client auth state).

---

## 1. Application Entry Point

```
main.tsx
└── <App />               — Root component; sets up QueryClient + Router
    ├── QueryClientProvider
    └── BrowserRouter
        └── Routes
            ├── /login                    → <LoginPage />         (public)
            └── <ProtectedRoute />        (redirects to /login if unauthenticated)
                └── <AppLayout />
                    ├── <Sidebar />
                    ├── <TopBar />
                    └── <Outlet />        (page rendered here)
                        ├── /dashboard              → <DashboardPage />
                        ├── /services               → <ServiceRegistryPage />
                        ├── /dependencies           → <DependencyMapPage />
                        ├── /changes                → <ChangeRequestsPage />
                        ├── /changes/new            → <CreateChangeRequestPage />
                        ├── /changes/:id            → <ChangeRequestDetailPage />
                        ├── /impact/:id             → <ImpactReportPage />
                        ├── /notifications          → <NotificationsPage />
                        ├── /review                 → <ReviewQueuePage />
                        └── <ProtectedRoute allowedRoles={['ADMIN']} />
                            └── /admin              → <AdminSettingsPage />
```

---

## 2. Component Tree

### 2.1 Layout Shell

```
components/layout/
├── AppLayout.tsx         — Root layout wrapper; renders Sidebar + TopBar + <Outlet>
├── Sidebar.tsx           — Left navigation panel with route links
└── TopBar.tsx            — Top header bar; displays user info & notification bell
```

### 2.2 Auth Components

```
components/auth/
└── ProtectedRoute.tsx    — Route guard; checks auth token + optional role allowlist
```

### 2.3 Shared UI Components

```
components/ui/
├── LoadingSpinner.tsx     — Reusable loading indicator
├── EmptyState.tsx         — Placeholder for empty lists/pages
└── RiskBadge.tsx          — Coloured badge for risk level (LOW / MEDIUM / HIGH / CRITICAL)
```

---

## 3. Pages

| Page | Route | Description |
|---|---|---|
| `LoginPage` | `/login` | Email + password login form; stores JWT in Zustand |
| `DashboardPage` | `/dashboard` | Summary stats, recent change requests, quick-action cards |
| `ServiceRegistryPage` | `/services` | Searchable list of all registered microservices |
| `DependencyMapPage` | `/dependencies` | Interactive force-directed graph of service dependencies |
| `ChangeRequestsPage` | `/changes` | Paginated list of change requests with filters |
| `CreateChangeRequestPage` | `/changes/new` | Multi-step form to author a new change request |
| `ChangeRequestDetailPage` | `/changes/:id` | Full detail view; impact summary, comments, approval actions |
| `ImpactReportPage` | `/impact/:id` | Detailed blast-radius report for a specific change |
| `ReviewQueuePage` | `/review` | Reviewer-role queue of submissions awaiting decision |
| `NotificationsPage` | `/notifications` | In-app notification inbox with read/unread state |
| `AdminSettingsPage` | `/admin` | Admin-only settings panel (role: `ADMIN`) |

---

## 4. Feature Modules

Self-contained feature folders that bundle domain logic together with their sub-components and hooks.

### 4.1 `features/change-request/`

```
features/change-request/
├── types.ts              — TypeScript interfaces (ChangeRequest, ReviewComment, etc.)
├── schema.ts             — Zod validation schemas for form inputs
├── hooks.ts              — TanStack Query hooks (useChangeRequests, useSubmitChange, etc.)
├── StatusBadge.tsx       — Coloured status chip (DRAFT / SUBMITTED / APPROVED / …)
├── ApprovalActionBar.tsx — Approve / Reject / Request-revision action buttons (reviewer only)
├── CommentsPanel.tsx     — Threaded comment list + add-comment form
└── ImpactSummaryCard.tsx — Inline blast-radius summary card embedded in detail page
```

### 4.2 `features/dependency-map/`

```
features/dependency-map/
├── types.ts              — Graph node and edge type definitions
├── hooks.ts              — TanStack Query hooks (useDependencies, useServices)
├── graphUtils.ts         — Force-directed graph layout helpers (node positioning, edge routing)
├── FilterPanel.tsx       — Sidebar filters: dependency type, criticality, search
└── ServiceDrawer.tsx     — Slide-in detail drawer for a selected service node
```

---

## 5. API Integration Layer

```
api/
└── client.ts             — Axios instance; base URL = API Gateway, attaches Bearer JWT header
                            Exposes typed functions for each domain:
                            · auth: login(), register()
                            · services: getServices(), createService(), ...
                            · dependencies: getDependencies(), createDependency(), ...
                            · changes: getChanges(), getChange(), createDraft(), submit(), review()
                            · impact: getImpactReport()
                            · notifications: getNotifications(), markRead()
```

---

## 6. State Management

| Store | Location | Purpose |
|---|---|---|
| **Auth store** | `store/authStore.ts` | Zustand store — holds `user` object + JWT token; exposes `login()` / `logout()` actions |
| **Server state** | TanStack Query (per hook) | Caches, refetches, and synchronises all API data |

---

## 7. Component Hierarchy Diagram

```
<App>
│
├── <QueryClientProvider>
│
└── <BrowserRouter>
    │
    └── <Routes>
        │
        ├── [/login] ─────────────────── <LoginPage>
        │
        └── <ProtectedRoute>             ← checks authStore token
            │
            └── <AppLayout>
                │
                ├── <Sidebar>            ← nav links, active route highlight
                ├── <TopBar>             ← user avatar, notification bell
                │
                └── <Outlet>            ← page slot
                    │
                    ├── <DashboardPage>
                    │     └── summary widgets
                    │
                    ├── <ServiceRegistryPage>
                    │     └── search · service cards
                    │
                    ├── <DependencyMapPage>
                    │     ├── <FilterPanel>
                    │     ├── force-graph canvas (react-force-graph)
                    │     └── <ServiceDrawer>
                    │
                    ├── <ChangeRequestsPage>
                    │     └── filter bar · <StatusBadge> · list
                    │
                    ├── <CreateChangeRequestPage>
                    │     └── multi-step form (Zod + react-hook-form)
                    │
                    ├── <ChangeRequestDetailPage>
                    │     ├── <StatusBadge>
                    │     ├── <ImpactSummaryCard>
                    │     ├── <CommentsPanel>
                    │     └── <ApprovalActionBar>
                    │
                    ├── <ImpactReportPage>
                    │     ├── <RiskBadge>
                    │     └── affected service list
                    │
                    ├── <ReviewQueuePage>
                    │     └── pending submissions · <ApprovalActionBar>
                    │
                    ├── <NotificationsPage>
                    │     └── notification list · mark-read
                    │
                    └── <ProtectedRoute allowedRoles={['ADMIN']}>
                          └── <AdminSettingsPage>
```

---

## 8. Data Flow Summary

```
User Action
    │
    ▼
Page / Feature Component
    │ calls hook (e.g. useChangeRequests)
    ▼
TanStack Query
    │ calls api/client.ts function
    ▼
Axios (attaches Bearer token from authStore)
    │
    ▼
API Gateway :3000
    │ proxies request
    ▼
Downstream Microservice
    │ returns JSON
    ▼
TanStack Query cache updated
    │
    ▼
Component re-renders with new data
```
