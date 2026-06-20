# ARCHITECTURE.md

# Overview

Enterprise Operations Platform is a frontend-first enterprise application designed to simulate a realistic internal operations system used by medium and large organizations.

The architecture prioritizes:

* scalability
* maintainability
* modularity
* type safety
* predictable state management
* realistic business workflows

The application is intentionally structured to support long-term growth across many development iterations.

---

# Architectural Principles

## Modular by Domain

Organize features around business domains rather than technical layers.

Preferred:

features/users
features/workflows
features/reports

Avoid:

components/users
components/reports
components/forms

The domain should be the primary organizing principle.

---

## Separation of Concerns

Responsibilities should remain clearly separated.

Examples:

UI Components
→ presentation only

Hooks
→ reusable behavior

Stores
→ application state

Services
→ business operations

Queries
→ data access

Schemas
→ validation

---

## Scalability First

Every architectural decision should support future growth.

Avoid patterns that become difficult to maintain once the application exceeds:

* 100 components
* 50 routes
* dozens of business entities

---

# High-Level Architecture

```text
Presentation Layer
        │
        ▼
Feature Layer
        │
        ▼
Business Services
        │
        ▼
Data Access Layer
        │
        ▼
Mock Persistence Layer
```

Each layer should have a clearly defined responsibility.

---

# Technology Stack

## Core

* React
* TypeScript
* Vite

## Routing

* React Router

## State Management

* Zustand

## Data Synchronization

* TanStack Query

## Forms

* React Hook Form
* Zod

## Styling

* Tailwind CSS

---

# Project Structure

```text
src/

  app/
    providers/
    router/
    layouts/

  pages/

  features/

  shared/

  services/

  mocks/

  store/

  assets/

  types/

  utils/
```

Current foundation implementation:

```text
src/
  app/
    layouts/
      AppLayout.tsx
    providers/
      AppProviders.tsx
    router/
      router.tsx
  pages/
    OverviewPage.tsx
    ModuleOverviewPage.tsx
    SettingsPage.tsx
    RouteErrorPage.tsx
  shared/
    components/
      AppErrorBoundary.tsx
      Badge.tsx
      Button.tsx
      Card.tsx
      PageHeader.tsx
  store/
    uiStore.ts
```

Feature directories were introduced with the dashboard domain. Route pages
remain composition-focused and delegate business behavior to their owning
feature modules.

Current dashboard domain:

```text
src/
  features/
    dashboard/
      components/
      queries/
      schemas/
      services/
      utils/
  mocks/
    dashboardApi.ts
  services/
    persistence/
      browserStorage.ts
```

`OverviewPage` is now a route-level composition boundary that renders the
dashboard feature. Dashboard business types, query definitions, formatting,
and widgets remain owned by the dashboard domain.

Current department domain:

```text
src/
  features/
    departments/
      components/
      queries/
      schemas/
      services/
  mocks/
    departmentsApi.ts
  pages/
    DepartmentsPage.tsx
    DepartmentDetailPage.tsx
    DepartmentEditorPage.tsx
```

The department feature is the reference implementation for entity management.
Route pages remain thin, forms and business behavior stay inside the feature,
and the mock API owns durable collection reads and writes.

Current user domain:

```text
src/
  features/
    users/
      components/
      queries/
      schemas/
      services/
  mocks/
    usersApi.ts
  pages/
    UsersPage.tsx
    UserProfilePage.tsx
    UserEditorPage.tsx
```

The user feature extends the entity-management pattern with lifecycle
transitions, normalized manager relationships, department assignment, and
membership in a persisted team catalog.

Current access domain:

```text
src/
  app/
    session/
      currentSession.ts
  features/
    access/
      components/
      hooks/
      queries/
      schemas/
      services/
  mocks/
    accessApi.ts
  pages/
    AccessPage.tsx
    RoleDetailPage.tsx
    RoleEditorPage.tsx
```

The access feature owns the permission catalog, roles, assignments, effective
access evaluation, and reusable authorization UI boundaries.

Current workflow domain:

```text
src/
  features/
    workflows/
      components/
      queries/
      schemas/
      services/
  mocks/
    workflowsApi.ts
  pages/
    WorkflowsPage.tsx
    WorkflowDetailPage.tsx
    WorkflowEditorPage.tsx
```

The workflow feature owns versioned process definitions, graph validation,
templates, lifecycle transitions, and the process designer. Each persisted
record is one workflow version; records with the same stable `workflowKey`
form a version history.

Current approval domain:

```text
src/
  features/
    approvals/
      components/
      queries/
      schemas/
      services/
  mocks/
    approvalsApi.ts
  pages/
    ApprovalsPage.tsx
    ApprovalDetailPage.tsx
    ApprovalRequestEditorPage.tsx
```

The approval feature owns governed decision requests, sequential reviewer
steps, delegation, escalation, and append-only business history. Approval
records reference an immutable workflow version and retain a workflow identity
snapshot for durable display.

Current task domain:

```text
src/
  features/
    tasks/
      components/
      queries/
      schemas/
      services/
  mocks/
    tasksApi.ts
  pages/
    TasksPage.tsx
    TaskDetailPage.tsx
    TaskEditorPage.tsx
```

The task feature owns operational work records, accountable assignment,
lifecycle transitions, approval relationships, triage queues, and append-only
task activity. Tasks are retained after completion or cancellation rather than
deleted so operational history remains navigable.

---

# app/

Purpose:

Application bootstrap and global configuration.

Responsibilities:

* providers
* routing setup
* layouts
* global configuration

Examples:

```text
app/
  providers/
  router/
  layouts/
```

---

# pages/

Purpose:

Route-level composition.

Pages should primarily compose feature modules.

Avoid large business logic inside pages.

Example:

```text
pages/
  DashboardPage
  UsersPage
  ReportsPage
```

---

# features/

Purpose:

Business functionality.

Every significant domain receives its own feature module.

Example:

```text
features/
  dashboard/
  users/
  departments/
  workflows/
  reports/
```

A feature may contain:

```text
feature-name/

  components/
  hooks/
  queries/
  services/
  schemas/
  types/
  store/
```

---

# shared/

Purpose:

Reusable building blocks shared across multiple features.

Examples:

```text
shared/

  components/
  hooks/
  constants/
  validation/
  icons/
```

---

# services/

Purpose:

Cross-feature business services.

Examples:

```text
services/

  persistence/
  notifications/
  analytics/
  auditing/
```

---

# mocks/

Purpose:

Backend simulation layer.

Contains:

* mock APIs
* seed data
* fake latency
* error simulation

The rest of the application should interact with mocks as if they were real APIs.

---

# store/

Purpose:

Global application state.

Contains only state that truly needs global scope.

Examples:

```text
store/

  sessionStore
  uiStore
  preferencesStore
```

Avoid storing server-like data here.

The initial `uiStore` persists only the user's theme preference. Transient
mobile-navigation state is intentionally excluded from persistence.

---

# State Architecture

## Zustand

Used For

* UI state
* preferences
* temporary workflows
* session state

Examples:

```text
selectedSidebarItem
theme
filters
drawerState
```

---

## TanStack Query

Used For

* entities
* collections
* caching
* mutations
* synchronization

Examples:

```text
users
departments
workflows
reports
```

---

## Rule

If the data resembles backend data:

Use TanStack Query.

If the data resembles UI state:

Use Zustand.

---

# Routing Architecture

Expected route hierarchy:

```text
/

/dashboard

/users
/users/:id

/departments
/departments/:id

/workflows
/workflows/:id

/reports
/reports/:id

/settings
```

Future routes should remain consistent with this structure.

The browser router is configured centrally in `app/router/router.tsx`.
`AppLayout` owns the persistent workspace chrome and renders route content via
an outlet. Unknown routes receive a dedicated not-found experience, while
route failures use the same recovery surface.

Department management adds:

```text
/departments
/departments/new
/departments/:departmentId
/departments/:departmentId/edit
```

Static routes are declared alongside entity routes and React Router performs
route ranking. Successful create and edit operations navigate to the canonical
detail route; successful deletion returns to the collection.

User management adds:

```text
/users
/users/new
/users/:userId
/users/:userId/edit
```

Access management adds:

```text
/access
/access/roles/new
/access/roles/:roleId
/access/roles/:roleId/edit
```

The access route tree is wrapped by `AuthorizationBoundary` and requires
`security.manage`. Nested role pages inherit the same route authorization.

Workflow management adds:

```text
/workflows
/workflows/new
/workflows/:workflowId
/workflows/:workflowId/edit
```

The workflow route tree requires `workflows.view`. Management actions require
`workflows.manage`, while service rules independently protect published
versions from mutation.

Approval management adds:

```text
/approvals
/approvals/new
/approvals/:approvalId
```

The approval route tree requires `approvals.review`. The same route supports
assigned-review queues and approval intake for the current simulated session.
Decision and delegation eligibility is enforced again in the approval service.

Task management adds:

```text
/tasks
/tasks/new
/tasks/:taskId
/tasks/:taskId/edit
```

The task route tree requires `tasks.view`. Create and edit pages use
`AuthorizationBoundary` as a direct content boundary and require
`tasks.manage`; management actions use the same permission through
`PermissionGate`. `/operations` redirects to the task queue for backward
compatibility with the original shell route.

The dashboard, department, user, access, workflow, approval, and task route modules use React Router lazy route loading.
Domain code is fetched when its route is visited, keeping the application shell
and unrelated platform areas out of the feature bundle.

---

# Data Layer

The application currently operates without a real backend.

Data flow:

```text
Component
   ↓
Query
   ↓
Service
   ↓
Mock API
   ↓
Local Persistence
```

This architecture should allow future replacement of the mock layer with a real backend.

The dashboard establishes the first complete implementation of this flow:

```text
OperationalDashboard
   ↓
dashboardSnapshotOptions
   ↓
dashboardService
   ↓
dashboardApi
   ↓
browserStorage (acknowledged alert identifiers only)
```

Mock API responses are intentionally returned as `unknown` and validated with
Zod inside the feature service. This keeps the UI and query cache insulated
from malformed transport data and mirrors a future network boundary.

Query keys are defined by the owning feature. Reporting-period changes create
separate cache entries, while alert mutations invalidate the dashboard key
family so all active period snapshots remain consistent.

Department mutations follow the same feature-owned query pattern:

* collection and detail keys share a `departments` root
* successful writes seed the detail cache and invalidate the domain key family
* successful deletion removes the deleted detail cache before invalidation
* services enforce uniqueness, hierarchy integrity, and deletion rules before
  the mock API changes persistent state

User queries use a shared `users` key family for collection, detail, and team
catalog data. Lifecycle mutations update the detail cache and invalidate the
domain family using the same synchronization convention as entity edits.

The user service also reads the department service when validating assignments.
This is an intentional domain dependency: identities may reference departments,
while departments do not require users to remain valid because their embedded
owner snapshot is retained.

Access data uses three persisted resources:

* a fixed application permission catalog
* editable role definitions containing permission keys
* user-to-role assignment records

Effective access is derived, not stored. The access service selects assigned
roles and returns the de-duplicated union of their permission keys. Only active
users receive effective permissions; invited, suspended, and deactivated
identities evaluate to no access.

Workflow data is persisted as complete version records. Activation replaces
the collection atomically at the mock boundary so the selected draft becomes
active and any previous active version with the same workflow key becomes
retired. New versions clone state and transition identifiers to prevent
identity sharing between historical graphs.

Approval requests are complete aggregate records containing their reviewer
steps and event history. Mutations load the current aggregate, validate actor
and lifecycle rules, append an event, update affected steps, and persist the
replacement through the mock API. TanStack Query then synchronizes list and
detail caches.

New requests may reference only active workflow definitions. They snapshot the
definition identifier, workflow key, name, and version. Completed requests
retain that reference when the definition later becomes retired.

Tasks are persisted as complete aggregates containing current assignment,
schedule, lifecycle state, optional approval reference, and typed activity
events. Services validate cross-domain relationships before writes. Task
mutations update detail caches and invalidate the shared task key family.

Personal, department, list, and board queues are derived views over the same
cached collection. TanStack Query remains the source of server-like task data;
queue filters and view mode remain local UI state.

---

# Persistence Strategy

Initial persistence mechanisms may include:

* localStorage
* IndexedDB

Persistence must be abstracted behind services.

Application code should never directly access storage APIs.

Preferred:

```text
PersistenceService
```

Avoid:

```text
localStorage.getItem(...)
```

inside feature code.

`browserStorage` is the initial persistence adapter. It serializes JSON,
contains browser storage failures, falls back to session-memory behavior when
storage is unavailable, and exposes data as `unknown` so callers must validate
persisted values before use. The dashboard currently persists only
acknowledged alert identifiers.

The department mock API persists the complete validated collection under a
domain-specific storage key. Missing or invalid stored collections are replaced
with realistic seed data at the mock boundary.

The user mock API persists user identities and the team catalog under separate
domain keys. User records store normalized identifiers for department, manager,
and team relationships rather than nested copies.

The access mock API persists role definitions and assignment records under
separate keys. The permission catalog is code-owned because permission keys are
application capabilities that must remain synchronized with implementation.

The workflow mock API persists the version collection under a domain-specific
key. Templates remain code-owned because they are curated process-design
accelerators rather than mutable business records.

The approval mock API persists request aggregates under a domain-specific key.
History is stored inside each aggregate because mutations are currently
single-request operations. A future backend may normalize events into an
append-only audit or event table without changing the feature service contract.

The task mock API persists task aggregates under a domain-specific key. Missing
or invalid collections are replaced with realistic seeded work. Completed and
cancelled tasks remain in storage to preserve operational history.

The access mock synchronizes protected system roles with their code-owned seed
definitions when roles are read. This ensures newly introduced permission keys
reach system administrators without overwriting editable custom roles.

---

# Validation Strategy

All business input should be validated using Zod schemas.

Preferred:

```text
schema
→ form validation
→ service validation
```

Avoid duplicate validation logic.

Department forms use the same `departmentFormSchema` through React Hook Form's
Zod resolver and the department service. The service then normalizes fields
such as department codes and parent identifiers before applying cross-record
business rules.

Field validation remains schema-driven. Cross-entity constraints—duplicate
names, duplicate codes, circular reporting lines, and deletion with children—
remain service responsibilities because they require collection context.

User services apply the same rule: field validation is schema-driven, while
unique email and employee identifiers, manager cycles, department availability,
team existence, and lifecycle transition rules are enforced with current domain
context before persistence.

Access services validate unique role names, referenced users and roles,
protected system-role behavior, assigned-role deletion, and continuity of
security administration before persisting policy changes.

Workflow forms and services share a graph-aware Zod schema. It enforces exactly
one initial state, unique state keys, valid transition references, no self or
duplicate edges, no outgoing transitions from terminal states, onward paths
from every non-terminal state, and reachability from the initial state.
Lifecycle constraints remain service responsibilities because they depend on
the current version collection.

Approval schemas validate request fields, unique reviewer chains, step
lifecycle values, workflow snapshots, and discriminated history events.
Services enforce cross-domain and actor-sensitive rules: active requester and
reviewer identities, active workflow versions, requester-reviewer separation,
current-assignee decisions, delegation eligibility, and overdue escalation.

Task schemas validate task fields, lifecycle values, priorities, and
discriminated activity events. Services enforce active assignees, available
departments, valid approval references, active actors, and an explicit
transition map. Completed tasks may be reopened to in-progress; cancelled work
may return to backlog; blocked work must return to in-progress before
completion.

---

# Organization Relationships

Department ownership currently retains an embedded owner snapshot because it
predates managed identities. The UI resolves that snapshot to a user profile by
normalized email when a matching identity exists.

This transitional approach provides navigable identity relationships without
invalidating persisted department records. A future migration may add a direct
`ownerUserId` while preserving the snapshot for historical display.

---

# Error Handling

Errors should be categorized:

## User Errors

Examples:

* validation failures
* incorrect input

## System Errors

Examples:

* failed requests
* corrupted persistence

## Unexpected Errors

Examples:

* programming mistakes
* runtime exceptions

The application should handle each category appropriately.

The foundation uses two recovery layers:

* `AppErrorBoundary` catches unexpected render failures outside the router and
  offers a full workspace reload.
* `RouteErrorPage` handles router failures and unknown locations while
  preserving a route back to the overview.

Expected user and service errors should continue to be handled closer to their
feature boundary.

---

# Provider Composition

`AppProviders` is the application composition root. It owns:

* the shared TanStack Query client and default query behavior
* global theme synchronization
* browser router mounting
* the top-level application error boundary

Providers should be added here only when their concern is truly application
wide. Domain-specific providers belong inside their owning feature.

---

# Design System Foundation

Tailwind CSS is integrated through the Vite plugin. Brand tokens are declared
in `src/index.css`, while reusable interaction and surface patterns live in
`shared/components`.

Shared primitives remain intentionally small and typed. New variants should be
added when repeated product requirements emerge rather than speculatively.

---

# Accessibility Strategy

Minimum expectations:

* semantic HTML
* keyboard navigation
* visible focus states
* screen-reader support where relevant

Accessibility should be considered part of the architecture.

---

# Performance Strategy

Potential future optimizations:

* route-level code splitting
* virtualization
* memoization
* query optimization
* lazy loading

Optimization work should follow measurable need.

The operational dashboard uses lightweight SVG charts rather than introducing
a charting dependency for its initial KPI and workload visualizations. Every
chart has a textual or tabular equivalent for accessibility.

Route-level code splitting is active for the dashboard and department domains.
New substantial domains should use the same router `lazy` pattern.

---

# Security Assumptions

Current version:

* frontend-only
* simulated authentication
* policy-driven simulated authorization

The current session is represented by a stable seeded user identifier. Roles
and permissions govern route and action presentation inside the frontend, but
they are not a security boundary against a malicious client. A future backend
must repeat every authorization decision for protected data and mutations.

Reusable authorization surfaces:

* `AuthorizationBoundary` protects route subtrees and renders an access-denied
  recovery experience.
* `PermissionGate` conditionally exposes actions and administrative controls.
* `useAuthorization` provides effective permission checks for feature logic.

Future backend integration should not require major architectural changes.

---

# Future Architectural Directions

Potential additions:

* authentication layer
* permission engine
* feature flag system
* multi-tenant support
* offline synchronization
* plugin architecture

These should be introduced incrementally while preserving architectural consistency.

---

# Maintenance Rules

When introducing a new feature:

1. Determine appropriate domain.
2. Place code in the corresponding feature module.
3. Reuse shared abstractions when possible.
4. Avoid cross-feature coupling.
5. Update this document if architecture changes.

This document should always reflect the actual architecture of the codebase.
