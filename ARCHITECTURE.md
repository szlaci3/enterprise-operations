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
      versionedStore.ts
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

Current notification domain:

```text
src/
  features/
    notifications/
      components/
      queries/
      schemas/
      services/
  mocks/
    notificationsApi.ts
  pages/
    NotificationsPage.tsx
```

The notification feature owns recipient-addressed messages, read state,
subscription preferences, and projection checkpoints. It consumes typed,
append-only approval and task events through service boundaries rather than
being called directly from domain mutations.

Current audit domain:

```text
src/
  features/
    audit/
      components/
      queries/
      schemas/
      services/
  mocks/
    auditApi.ts
  pages/
    AuditPage.tsx
```

The audit feature owns normalized immutable records, projection checkpoints,
the cross-domain administrative viewer, and reusable entity history panels.
It projects from authoritative approval and task event histories rather than
intercepting domain writes.

Current reporting domain:

```text
src/
  features/
    reports/
      components/
      queries/
      schemas/
      services/
  mocks/
    reportsApi.ts
  pages/
    ReportsPage.tsx
    ReportDetailPage.tsx
    ReportEditorPage.tsx
```

The reporting feature owns saved report definitions, code-owned templates,
source-specific column catalogs, execution adapters, uniform tabular results,
and CSV serialization.

Current analytics domain:

```text
src/
  features/
    analytics/
      components/
      queries/
      schemas/
      services/
  pages/
    AnalyticsPage.tsx
```

The analytics feature owns validated metric snapshots, time-window and
department segmentation, trend aggregation, operational distributions, and
reusable accessible visualization components.

Current search domain:

```text
src/
  features/
    search/
      components/
      queries/
      schemas/
      services/
  mocks/
    searchApi.ts
  pages/
    SearchPage.tsx
```

The search feature owns cross-domain document normalization, permission-aware
index composition, deterministic ranking, result filtering, saved searches,
recent-query history, and the global keyboard launcher.

Current collaboration domain:

```text
src/
  features/
    collaboration/
      components/
      queries/
      schemas/
      services/
  mocks/
    collaborationApi.ts
```

The collaboration feature owns entity-addressed comments, one-level reply
threads, managed-user mentions, author and moderator lifecycle rules, and the
reusable activity panel. Task and approval detail surfaces provide their typed
business events to the panel, which merges them with persisted collaboration
events without duplicating source-domain records.

Current document domain:

```text
src/
  features/
    documents/
      components/
      queries/
      schemas/
      services/
  mocks/
    documentsApi.ts
  pages/
    DocumentsPage.tsx
    DocumentDetailPage.tsx
    DocumentEditorPage.tsx
```

The document feature owns controlled metadata, lifecycle, immutable content
versions, attachment policy, and typed links to operational records. Tasks and
approvals consume a reusable linked-document panel without embedding document
content or ownership logic in their aggregates.

Current settings domain:

```text
src/
  features/
    settings/
      components/
      queries/
      schemas/
      services/
  mocks/
    settingsApi.ts
  pages/
    SettingsPage.tsx
```

The settings feature owns per-user workspace preferences, organization policy,
feature rollout state, and administrative change history. The application
shell consumes its lightweight query contract for theme, reduced motion,
density, organization branding, and feature-aware navigation.

Current command domain:

```text
src/
  features/
    commands/
      components/
      queries/
      schemas/
      services/
```

The command feature owns the global keyboard launcher, code-owned command
registry, permission and feature filtering, deterministic command matching,
dialog focus behavior, and lazy cross-entity discovery. Commands contain
canonical routes rather than importing destination feature components.

Current offline domain:

```text
src/
  features/
    offline/
      components/
      queries/
      schemas/
      services/
      store/
  mocks/
    offlineApi.ts
```

The offline feature owns connectivity state, persisted mutation intents,
optimistic task projection, reconnect replay, synchronization status, and
explicit conflict resolution. Initial write coverage is intentionally focused
on task status transitions, the platform's most frequent operational mutation.

Current diagnostics domain:

```text
src/
  features/
    diagnostics/
      components/
      queries/
      schemas/
      services/
  mocks/
    diagnosticsApi.ts
  pages/
    DiagnosticsPage.tsx
```

The diagnostics feature owns sanitized runtime incident capture, health checks,
browser-persistence inspection, query-runtime presentation, support export, and
safe recovery controls. It consumes offline health through the offline service
and storage metadata through the shared persistence adapter.

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

The `uiStore` owns transient mobile-navigation state only. Durable workspace
preferences moved to the settings domain so they have managed-user ownership,
runtime validation, and a future backend-compatible service boundary.

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

Platform route metadata is code-owned in
`app/platform/platformRegistry.ts`. Each module definition may declare:

* canonical route, label, icon, keywords, and navigation group
* required view permission
* optional feature rollout dependency
* optional create route and create permission

The application shell derives its primary and platform navigation groups from
this registry. The command registry derives navigate and create commands from
the same definitions, preventing route labels, icons, permissions, and feature
requirements from drifting between entry points.

`PlatformModuleBoundary` resolves a module definition and composes
`AuthorizationBoundary` with `FeatureAvailabilityBoundary`. Collection and
detail routes use the view requirement; create and edit pages use the module's
create permission. This replaces route-specific boundary construction and
gives department and user routes the same direct-route guarantees as later
domains.

The registry remains code-owned because its entries represent implemented
routes and capabilities. Feature configuration controls availability but
cannot invent routes.

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

Notification management adds:

```text
/notifications
```

The notification center is personal to the current simulated session. A global
header bell links to the inbox and displays unread count. Notification
preferences are composed into `/settings`.

Audit management adds:

```text
/audit
```

The route requires `audit.view`. Approval and task detail pages conditionally
render entity audit panels for users with the same permission. The broader
`/administration` entry now redirects to system diagnostics.

Reporting adds:

```text
/reports
/reports/new
/reports/:reportId
/reports/:reportId/edit
```

The route tree requires `reports.view`. Create and edit routes require
`reports.manage`. CSV export is independently exposed only to users with
`reports.export`.

Document management adds:

```text
/documents
/documents/new
/documents/:documentId
```

The route tree requires `documents.view`. Intake, versioning, lifecycle, and
link management require `documents.manage`; version downloads independently
require `documents.download`.

Settings uses:

```text
/settings
```

The route requires `settings.view`. Every user with access may update their own
workspace and notification preferences. Organization policy, feature rollout,
and administrative change history require `settings.manage`.

Diagnostics adds:

```text
/diagnostics
```

The route requires `diagnostics.view`. Query refresh, queued-change retry,
incident cleanup, and cache-reload controls require `diagnostics.manage`.
`/administration` redirects to diagnostics as the platform control-plane entry.

Analytics adds:

```text
/analytics
```

The route requires `analytics.view`. Analytics appears alongside the executive
overview while remaining a separately loaded domain and permission.

Global search adds:

```text
/search
```

Search remains available at `/search`. Ctrl/Cmd+K now opens the command
palette, which can hand off a query to full search or navigate directly to one
of its permission-aware entity results.
Authorization is enforced at index composition: only entity types backed by a
permission in the current effective-access snapshot are loaded and returned.

The dashboard, department, user, access, workflow, approval, task,
notification, audit, reporting, analytics, search, document, and settings route
modules use React Router lazy route loading.
Domain code is fetched when its route is visited, keeping the application shell
and unrelated platform areas out of the feature bundle.

The module boundary is itself lazy-loaded by the router. The sidebar does not
eagerly import access queries merely to hide navigation items: action and route
authorization remain authoritative, while the command palette performs
permission-aware discovery after it is opened. This preserves shell bundle
ownership established in M19.

---

# Platform Experience Patterns

High-volume collection workspaces share semantic components for:

* loading and retry states
* empty results
* summary metrics
* filter layout
* search inputs and select filters
* pressed-state segmented controls

These patterns are presentation and interaction contracts, not data-grid
abstractions. Domain features continue to own row content, board behavior,
virtualization, joins, sorting, and business filter semantics.

`useUrlState` stores collection state in React Router search parameters.
Default values are omitted, changes use replace navigation, and constrained
values reject unknown URL input. Tasks retain queue, status, query, and
list/board mode; approvals retain queue, status, and query; users retain
department, lifecycle, and query; departments retain lifecycle and query.

This makes operational views bookmarkable without duplicating server-like
collections into Zustand or component-local persistence.

## Saved Views and Operational Discovery

Saved views are resource-neutral definitions rather than copies of result
collections:

```text
resource + canonical URL state + presentation preferences
    + owner + visibility + default
    -> tenant-owned saved view
```

The shared contract supports tasks, approvals, users, documents, audit, and
global search. Each feature declares its own allowed URL keys, defaults, sort
values, columns, and filtering semantics. The saved-view layer only captures
and reapplies that state; it does not interpret domain predicates or own row
rendering.

Filter and sort state remains canonical in React Router search parameters.
Columns and density are presentation preferences stored with the view and
applied through feature-owned rendering. This keeps views bookmarkable and
shareable while avoiding a second competing state model.

Saved-view persistence is versioned and tenant-scoped. Query keys use the
active tenant as their root. Shared views are visible to workspace members,
but only owners can choose a personal default. Creating shared views and
administering another owner's shared view requires `views.share`; applying a
view never bypasses the authorization already enforced by its source service.

Global search uses the same saved-view controls and extends its transient
adapter index with:

* multi-select entity-type refinement
* status facets
* 7, 30, and 90 day update windows
* relevance and most-recent sorting

Existing named saved searches are migrated once into personal search views,
then removed from the legacy preference collection. Recent query history
remains a user search preference because it is activity history rather than a
reusable operational view.

Mobile navigation is treated as a modal dialog on small screens. Opening moves
focus into the dialog, Tab remains contained, Escape and the backdrop dismiss
it, background scrolling is disabled, and focus returns to the launcher.

Shared abstractions are introduced only for repeated semantics. Forms,
timelines, detail sections, tables, and pagination remain feature-owned until
at least two consumers require the same behavior; visual similarity alone is
not sufficient.

---

# Data Layer

The application currently operates without a real backend.

## Tenant and Workspace Boundary

The simulated session has one stable identity and one active tenant context.
Tenancy is modeled independently from managed-user records:

```text
Tenant catalog
    + user-to-tenant membership and tenant role
    + persisted active tenant
    -> workspace snapshot
```

The tenancy catalog is a global versioned store because it determines which
tenant repositories may be selected. The current user has an owner membership
in Northstar Group and an administrator membership in Atlas Services.

The active tenant is synchronously available through `tenantContext` so query
keys and repositories can resolve ownership outside React. A Zustand workspace
store exposes the same value to presentation components and persists changes
through the context. The active-tenant record uses a versioned global envelope.

Switching workspaces follows this order:

```text
cancel active queries
    -> change active tenant
    -> clear the QueryClient
    -> navigate to /overview
    -> render tenant-prefixed queries and repositories
```

Every feature query-key root is created through `tenantQueryKey`:

```text
['tenant', tenantId, domain, ...domainSegments]
```

This means a late result from an old workspace cannot satisfy a query in the
new workspace even if both domains use the same entity identifier.

Durable business entities do not duplicate `tenantId` on every frontend
aggregate. Their repository namespace is the ownership boundary:

```text
enterprise-operations-tenant-{tenantId}-{domainKey}
```

This mirrors a backend repository or database partition while preserving the
existing backend-ready domain shapes. A future network API would carry tenant
context through authentication and request routing rather than trusting a
client-supplied aggregate field.

Global persistence is deliberately limited to:

* tenant catalog and memberships
* active tenant selection
* device-level shell state

Organization settings, access policy, notifications, search preferences,
offline operations, diagnostics incidents, and every business aggregate are
tenant-owned.

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

Notifications use a projection model:

```text
Approval and task events
        ↓
Notification projector
        ↓
Preference evaluation + event checkpoint
        ↓
Persisted recipient notification
```

The projector derives emissions from domain event history, de-duplicates them
with stable source event keys, checks active identity and subscription
preferences, and persists resulting notifications. Every event is checkpointed
whether delivered or suppressed, so later preference changes do not replay old
activity.

Notification queries poll at a modest interval while active. Read mutations
invalidate or update the current user's notification cache so the header badge
and inbox remain synchronized.

Audit records use a second projection model over the same source event
histories:

```text
Approval and task events
        ↓
Audit normalizer
        ↓
Stable source-event checkpoint
        ↓
Immutable normalized audit record
```

Unlike notifications, audit projection has no recipient or preference filter.
Every supported source event produces one normalized record containing actor,
entity, action, timestamp, summary, and structured field changes. Global and
entity audit queries read the same projection store.

Reporting separates definition from execution:

```text
Saved report definition
        ↓
Source-specific execution adapter
        ↓
Validated uniform tabular result
        ↓
Table presentation or CSV serialization
```

Definitions persist source, ordered columns, filters, template provenance, and
ownership. Executions always read current source services. Task, approval, and
audit adapters own their source joins and filter semantics, then map into one
string-valued row contract for presentation and export.

Analytics uses current domain services through a purpose-built aggregation
adapter. It applies a shared period and optional department segment before
deriving:

* headline metrics with previous-period comparisons
* weekly task and approval movement
* task lifecycle distribution
* approval outcome distribution
* open workload by department

Reporting and analytics both read current source services and validate their
outputs, but use different contracts: reporting produces row-oriented results,
while analytics produces metric- and series-oriented snapshots.

Search uses an adapter-based transient index:

```text
Authorized domain services
        ↓
Search document adapters
        ↓
Normalized title, description, body, metadata, status, and canonical URL
        ↓
Deterministic relevance scoring and filters
        ↓
Grouped typed results
```

No search index is persisted. Every query reads current domain collections.
Exact title, title prefix, title containment, description containment, body
containment, and token prefix matches receive descending score weights.
Updated timestamps break equal-score ties.

The command palette composes two result sources:

```text
Typed command registry
    -> permission + feature filtering
    -> deterministic local matching

Typed search request
    -> lazy search service import
    -> permission-aware entity results

Both
    -> one keyboard-selectable palette result model
```

Registry commands remain code-owned because each entry corresponds to a real
route and implemented capability. Cross-entity results reuse the authoritative
search service rather than introducing a second index or ranking engine.

Documents are persisted as complete aggregates containing metadata, links,
and immutable versions:

```text
Document metadata
        + typed task/approval links
        + append-only content versions
        -> validated document aggregate
        -> mock document API
        -> browser storage
```

Version creation appends content and attribution without modifying prior
versions. Links reference operational entity identifiers and are validated
through source-domain services before persistence.

Settings use one validated store with explicitly separated ownership:

```text
Managed user
    -> personal workspace preferences

Organization administrator
    -> organization policy
    -> feature rollout configuration
    -> append-only settings change records
```

Personal mutations replace only the current user's preference record.
Administrative mutations append field-level change records and replace the
organization or selected feature configuration atomically.

Offline task transitions use a persisted intent projection:

```text
Authoritative task + expected updatedAt
        + local transition events
        -> optimistic task projection
        -> persisted offline operation
        -> task list/detail query overlay

Reconnect
        -> compare authoritative updatedAt
        -> match: persist optimistic aggregate and remove operation
        -> mismatch: preserve local intent + remote task as conflict
```

Multiple transitions for the same task update one queued operation while
retaining all local transition events. This avoids replaying an invalid chain
against intermediate server timestamps.

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

`browserStorage` is the low-level persistence adapter. It serializes JSON,
contains browser storage failures, falls back to session-memory behavior when
storage is unavailable, and exposes data as `unknown`.

All durable domain stores are created through `createVersionedStore`:

```text
Domain schema + seed + current schema version
    → createVersionedStore
    → { schemaVersion, updatedAt, data }
    → browserStorage
```

The versioned store boundary validates every write and read. Existing M1–M20
raw payloads are treated as legacy version-zero data: if they satisfy the
current schema, they are wrapped in place on first read. Store-specific legacy
transformers handle historical shapes that require normalization.

Future changes declare ordered migrations keyed by their source version. A
stored envelope is migrated one version at a time and validated against the
current domain schema before the upgraded envelope replaces it.

Missing storage initializes from a validated seed. Invalid payloads,
unsupported migration gaps, and envelopes written by a newer application
version raise `PersistenceMigrationError`; the original value remains intact.
This intentionally replaces the former behavior where a schema mismatch could
silently overwrite persisted user data with seeds.

The versioned store resolves tenant scope at read and write time rather than
construction time, so module-cached repository objects follow workspace
changes. Global stores opt out explicitly with `scope: 'global'`.

For the default Northstar tenant, a missing scoped store checks the historical
unscoped key. If present, the payload is validated and migrated normally,
written to the Northstar namespace, and only then removed from the legacy key.
Migration failure preserves the source value. Other tenants never inspect
unscoped storage.

The department mock API persists the complete validated collection under a
domain-specific versioned storage key. A genuinely missing collection is
initialized with realistic seed data.

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

The notification mock API persists a projection store containing notifications
and processed source-event keys. User preferences are persisted separately so
delivery policy can evolve without rewriting notification history. Email
digests are preference metadata only; external delivery remains simulated.

The audit mock API persists records and processed source-event keys together.
The service only appends records for unseen event keys. No audit delete or
update operation exists. A future backend can replace this adapter with an
append-only audit table or event consumer.

The report mock API persists saved definitions only. Execution results are
ephemeral TanStack Query data because they represent current snapshots rather
than durable business entities. Templates and source column catalogs remain
code-owned to match implemented execution capabilities.

Analytics snapshots are not persisted. They are derived current-state data and
live only in TanStack Query caches keyed by period and department segment.

Search preferences are persisted per user under a dedicated storage key and
contain recent query strings. Historical named saved searches are accepted for
migration into the shared saved-view store. Source documents and search
results remain ephemeral.

Saved views are persisted as validated, tenant-owned definitions under a
dedicated versioned store. They contain resource identity, canonical string
state, presentation preferences, ownership, visibility, and default metadata;
they never persist result records.

The document mock API persists complete validated aggregates. Attachment
content is stored as a data URL to keep the frontend-only simulation
downloadable and durable. Policy limits each version to 750 KB and each
document to 3 MB so local browser storage remains bounded. A future backend may
replace content data URLs with object-storage references without changing the
document metadata, version, or link contracts.

The settings mock API persists organization policy, feature rollout,
administrative history, and per-user preferences in one validated versioned
store. Seed initialization can preserve the theme from the former
Zustand-persisted UI record. Notification preferences retain a dedicated
legacy transformer that adds later subscription keys while preserving existing
choices.

Settings schema version two adds tenant-level rollout audience and prerequisite
policy. Enabled features are available to all members. Pilot features can
target all members or tenant administrators. A feature is unavailable when any
declared prerequisite is unavailable. Availability is evaluated consistently
by shell navigation, direct-route boundaries, embedded gates, and commands.

The offline mock API persists validated operations under a dedicated storage
key. Each task operation stores its authoritative base timestamp, optimistic
aggregate, transition events, retry state, and optional conflicting remote
aggregate. Queue reads and writes remain independent from task persistence.

The diagnostics mock API persists up to 100 sanitized runtime incidents.
Incident records contain error name, bounded message, bounded stack, route,
source, and timestamp. Health snapshots are derived and not persisted.

`browserStorage.diagnose()` performs a temporary write probe and returns only
enterprise storage key names, byte sizes, persistence format, and schema
version. It does not expose stored values to the diagnostics presentation
layer. The diagnostics workspace reports the number of versioned and remaining
legacy entries and labels the schema version of large stores.

The access mock prepares raw legacy seeded roles once when they are wrapped,
adding capabilities introduced after those roles were first persisted. It also
synchronizes protected system roles with code-owned definitions on read. After
wrapping, editable non-system roles are no longer subject to one-off marker-key
migrations.

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

Notification schemas validate categories, severity, subscription types,
recipient identity, action links, read timestamps, preferences, and projection
checkpoints. The notification service validates all persisted resources and
only delivers events to active managed identities.

Audit schemas validate supported entity types and actions, actor attribution,
source-event identity, timestamps, summaries, and structured before/after
changes. Source domain schemas remain responsible for event validity; the audit
normalizer is responsible for the cross-domain record contract.

Report schemas validate sources, allowed column keys, filter shape, persisted
definitions, templates, and uniform result tables. The report service performs
source-aware column validation and unique-name enforcement before persistence.

Analytics schemas validate periods, filters, metric formats and trend
semantics, weekly series, distributions, and complete snapshots before data
enters the query cache.

Search schemas validate entity types, requests, recency and status filters,
sort policy, facets, ranked results, legacy saved searches, and per-user
preference collections. Search adapters remain responsible for mapping
source-specific fields into the common document vocabulary.

Saved-view schemas validate supported resources, canonical string state,
presentation density and columns, ownership, visibility, and default metadata.
The service enforces owner-scoped names and defaults plus permission-aware
shared-view creation and administration.

Collaboration schemas validate supported entity types, actor attribution,
parent relationships, comment lifecycle timestamps, mention identities, and
form limits. The collaboration service enforces active-user mentions,
top-level-only reply targets, view and contribution capabilities, and
author-or-moderator mutation rules before persistence.

Document schemas validate governance metadata, lifecycle values, typed links,
and immutable version records. The service validates active owners and actors,
available departments, supported MIME types, attachment size, aggregate
storage allowance, unique titles, source entity existence, and allowed
lifecycle transitions before persistence.

Settings schemas validate personal preferences, organization policy, feature
states, and administrative change records. Services verify active actors,
normalize typed form input, preserve per-user ownership, and produce append-only
field changes for organization and feature mutations.

Offline schemas validate queued operation state, authoritative version
identity, optimistic task aggregates, transition events, retry metadata, and
conflicting remote values. Task lifecycle validation still occurs in the task
service before an operation is queued.

Diagnostics schemas validate incident sources, bounded runtime records, health
status, persistence metadata, and complete support snapshots before entering
the query cache.

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

Both recovery layers now record sanitized incidents through a dynamically
loaded diagnostics service. A global runtime synchronizer also captures
unhandled browser errors and promise rejections. Diagnostics recording catches
its own failures so monitoring cannot recursively create incidents.

Expected user and service errors should continue to be handled closer to their
feature boundary.

---

# Provider Composition

`AppProviders` is the application composition root. It owns:

* the shared TanStack Query client and default query behavior
* global theme synchronization
* browser router mounting
* the top-level application error boundary
* synchronization of server-like workspace preferences into document-root
  theme and reduced-motion behavior
* browser connectivity observation and reconnect queue synchronization
* global unhandled runtime incident observation

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

The M19 production build introduced stable dependency chunk groups:

* React, React DOM, and React Router
* TanStack Query
* React Hook Form and resolver integration
* Zod validation
* Zustand state
* Lucide icons
* remaining third-party dependencies

Application shell utilities for commands, notifications, and synchronization
are loaded through React lazy boundaries. This reduced the application-owned
entry chunk from approximately 356 KB to 33 KB uncompressed while retaining
route-level domain chunks.

Large collection rendering uses the smallest strategy appropriate to the
surface:

* fixed-height identity rows use a reusable virtual window with overscan
* audit records use bounded incremental disclosure because record height varies
* report result tables use semantic pagination with 50 rows per page

Virtualized tables preserve total row count and absolute row indexes for
assistive technology. Report CSV export continues to operate on the complete
validated result rather than the visible page.

Stable identity and team catalogs use longer stale and garbage-collection
windows. Report execution retains its previous result during refresh and uses
a bounded cache lifetime. Mutation invalidation remains authoritative.

The operational dashboard uses lightweight SVG charts rather than introducing
a charting dependency for its initial KPI and workload visualizations. Every
chart has a textual or tabular equivalent for accessibility.

Route-level code splitting is active for the dashboard and department domains.
New substantial domains should use the same router `lazy` pattern.

The always-mounted header bell statically imports only its lightweight
component and query definitions. Notification persistence and cross-domain
projection services are dynamically imported when queries execute. Source
approval, task, and user services remain behind additional dynamic boundaries,
preventing notification reconciliation from pulling those domains into the
application shell bundle.

Audit query definitions also dynamically import their projection service.
Entity history panels add only lightweight audit UI and schemas to business
detail chunks; source services and persistence load when audit queries execute.

Report routes are lazy-loaded. Execution adapters dynamically import task,
approval, audit, user, and department services only when a report is run,
keeping unrelated report sources out of the report library bundle.

Analytics queries dynamically import the aggregation service. The aggregation
service then dynamically loads task, approval, and department services only
when an analytics snapshot is requested.

The always-mounted search launcher contains only navigation and keyboard
handling. The search route and service load lazily, and the service dynamically
imports only authorized source domains while building a query index.

The reusable collaboration panel is included only in lazy task and approval
detail chunks. Notification reconciliation dynamically imports collaboration
records with its other event sources, so the application shell does not load
discussion persistence or mutation logic.

Document routes are lazy-loaded. Task and approval detail chunks share the
linked-document panel and query contract; document persistence and cross-domain
relationship validation load only when those queries execute.

The application shell imports only settings query definitions and schemas.
Settings persistence and business services load dynamically when the snapshot
query executes. Full settings administration UI remains route-lazy.

The always-mounted command launcher contains the small command registry,
keyboard interaction, and permission/settings query consumers. The search
service is dynamically imported only after the palette is open and a query has
at least two characters. Full search remains route-lazy, and its service
dynamically imports only authorized source domains while building an index.

The always-mounted synchronization indicator reads only the lightweight
offline queue and connectivity store. Task queries overlay queued optimistic
aggregates on authoritative browser-persisted data. General queries use
`networkMode: always` so validated local mock reads remain available when the
browser reports offline; task transition mutations use the same mode so the
platform queue, rather than TanStack Query, owns deferral behavior.

The shared `useVirtualRows` hook performs only scroll-position arithmetic and
does not own entity rendering, selection, or business behavior. This keeps
virtualization reusable without introducing a generic table framework.

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

Diagnostics separates read access from recovery authority:

* `diagnostics.view` exposes health state and support export
* `diagnostics.manage` exposes cache, retry, and incident-history controls

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
