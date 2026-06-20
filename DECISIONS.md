# DECISIONS.md

# Purpose

This document records significant architectural and technical decisions made throughout the life of the project.

Its purpose is to:

* preserve rationale
* prevent accidental regressions
* avoid repeatedly revisiting solved problems
* provide context for future contributors
* improve continuity across autonomous development iterations

Whenever a significant decision is made, add a new entry.

---

# Decision Template

Use the following format for all future entries.

```text
Decision ID:
Date:
Status:

Context:
...

Decision:
...

Alternatives Considered:
...

Consequences:
...
```

Status values:

* Accepted
* Superseded
* Deprecated
* Rejected

---

# ADR-001

## Title

Frontend-Only Enterprise Platform

## Status

Accepted

---

### Context

The project is intended to evolve through many autonomous iterations.

A real backend would introduce:

* deployment requirements
* infrastructure complexity
* authentication concerns
* environment management

These concerns would slow down iterative frontend development.

---

### Decision

The application will initially operate as a frontend-only system.

Backend behavior will be simulated using:

* mock APIs
* persistence services
* local storage mechanisms
* realistic latency
* realistic failure scenarios

---

### Alternatives Considered

#### Alternative A

Build a full backend immediately.

Rejected because:

* increases complexity too early
* slows feature development
* reduces iteration speed

---

#### Alternative B

No persistence at all.

Rejected because:

* unrealistic user experience
* limits workflow complexity
* reduces enterprise realism

---

### Consequences

Positive:

* rapid development
* simpler architecture
* realistic user experience

Negative:

* simulated security
* simulated synchronization
* simulated multi-user behavior

---

# ADR-002

## Title

Domain-Oriented Project Structure

## Status

Accepted

---

### Context

The project is expected to become large.

Layer-oriented structures often become difficult to navigate as complexity grows.

---

### Decision

Features will be organized around business domains.

Example:

```text
features/
  users/
  workflows/
  reports/
```

instead of:

```text
components/
services/
hooks/
```

as the primary structure.

---

### Alternatives Considered

#### Layer-Oriented Structure

Rejected because:

* business functionality becomes fragmented
* navigation becomes harder
* ownership becomes unclear

---

### Consequences

Positive:

* scalable organization
* easier feature ownership
* easier future expansion

Negative:

* occasional duplication between domains

Accepted trade-off.

---

# ADR-003

## Title

Zustand for Application State

## Status

Accepted

---

### Context

The application requires predictable state management.

The state model should remain lightweight while supporting future growth.

---

### Decision

Use Zustand for application state.

Examples:

* UI preferences
* session state
* navigation state
* temporary workflow state

---

### Alternatives Considered

#### Redux Toolkit

Rejected because:

* additional complexity
* additional boilerplate
* unnecessary for current requirements

#### React Context

Rejected because:

* poor scalability for growing state needs

---

### Consequences

Positive:

* simple API
* low boilerplate
* good scalability

Negative:

* fewer enterprise conventions compared to Redux

Accepted.

---

# ADR-004

## Title

TanStack Query for Server State

## Status

Accepted

---

### Context

The application requires realistic data-fetching behavior.

Caching and synchronization should not be manually implemented.

---

### Decision

TanStack Query manages:

* collections
* entities
* caching
* mutations
* invalidation

---

### Alternatives Considered

#### Zustand Only

Rejected because:

* encourages mixing server and UI state

#### Custom Data Layer

Rejected because:

* reinvents existing solutions

---

### Consequences

Positive:

* mature caching
* mutation support
* scalable architecture

Negative:

* additional dependency

Accepted.

---

# ADR-005

## Title

Tailwind CSS as Styling System

## Status

Accepted

---

### Context

The application requires fast iteration while maintaining visual consistency.

---

### Decision

Use Tailwind CSS as the primary styling approach.

---

### Alternatives Considered

#### CSS Modules

Rejected because:

* slower development
* more context switching

#### Styled Components

Rejected because:

* runtime overhead
* unnecessary abstraction

---

### Consequences

Positive:

* rapid UI development
* predictable styling
* excellent component composition

Negative:

* longer class lists

Accepted.

---

# ADR-006

## Title

Service-Based Persistence Layer

## Status

Accepted

---

### Context

Persistence technology may change in the future.

Business code should remain storage-agnostic.

---

### Decision

All persistence must go through dedicated services.

Examples:

```text
PersistenceService
UserRepository
WorkflowRepository
```

Feature code must never access storage APIs directly.

---

### Alternatives Considered

#### Direct localStorage Usage

Rejected because:

* difficult future migration
* scattered persistence logic

---

### Consequences

Positive:

* easier backend migration
* centralized persistence behavior

Negative:

* additional abstraction layer

Accepted.

---

# ADR-007

## Title

Documentation-Driven Autonomous Development

## Status

Accepted

---

### Context

The project is expected to evolve through many autonomous iterations.

Future development may occur with minimal human guidance.

---

### Decision

The following documents are considered authoritative:

* AGENTS.md
* ROADMAP.md
* ARCHITECTURE.md
* DECISIONS.md

At the end of major iterations, these documents must be reviewed and updated.

---

### Alternatives Considered

#### Conversation-Only Memory

Rejected because:

* context becomes fragmented
* decisions are forgotten
* architectural drift increases

---

### Consequences

Positive:

* improved continuity
* preserved rationale
* better long-term coherence

Negative:

* documentation maintenance effort

Accepted.

---

# ADR-008

## Title

Centralized Application Composition and Recovery

## Status

Accepted

---

### Context

The application foundation requires a stable location for global providers,
routing, visual preferences, and unrecoverable error handling. Distributing
these concerns through route pages would make future domains harder to compose
and test.

---

### Decision

Use `AppProviders` as the application composition root. It creates the shared
TanStack Query client, synchronizes persisted theme preference, mounts the
browser router, and sits inside a global React error boundary.

Routing is declared centrally and rendered inside a persistent `AppLayout`.
Route errors and global render errors use separate recovery boundaries because
they have different recovery options.

Theme and transient shell state are managed by a persisted Zustand store, with
only durable preferences included in storage.

---

### Alternatives Considered

#### Providers Declared Directly in `main.tsx`

Rejected because it makes the entry point harder to test and allows bootstrap
concerns to accumulate without a clear composition boundary.

#### Route-Local Query Clients

Rejected because caches would be fragmented and cross-domain invalidation would
become unreliable.

#### A Single Error Screen for All Failures

Rejected because route failures can usually preserve the application shell,
while failures above the router require a full workspace recovery.

---

### Consequences

Positive:

* one predictable application composition root
* consistent query defaults across future domains
* durable preferences without persisting transient UI state
* recovery behavior proportional to the failure boundary

Negative:

* global providers can become crowded if ownership rules are ignored
* browser-router configuration assumes server fallback support in deployment

The provider ownership rule and future deployment configuration must preserve
these boundaries.

---

# ADR-009

## Title

Validated Feature-Owned Data Contracts

## Status

Accepted

---

### Context

The operational dashboard is the first feature to consume server-like data.
Although the current API is simulated, future network responses and persisted
browser values cannot be assumed to match TypeScript types at runtime.

The project also needs a repeatable ownership model for queries, services,
transport mocks, and business schemas before additional domains are added.

---

### Decision

Each domain owns its runtime schemas, inferred TypeScript types, query keys,
query options, service boundary, and presentation components.

Mock APIs return `unknown`. Feature services validate responses with Zod before
the data enters TanStack Query. Persisted values are also exposed as `unknown`
by the shared storage adapter and validated by the consuming domain.

TanStack Query owns dashboard snapshots and mutation synchronization. The
dashboard service owns business-facing data operations, while the mock API owns
latency and transport-shaped seed data.

---

### Alternatives Considered

#### Trust TypeScript Types in the Mock API

Rejected because compile-time types do not protect against corrupted storage,
future network responses, or accidental fixture drift.

#### Validate Inside React Components

Rejected because it duplicates validation, couples presentation to transport
concerns, and allows invalid data into the query cache.

#### Store Dashboard Data in Zustand

Rejected because dashboard snapshots are server-like cached data and belong in
TanStack Query.

#### Add a Charting Library

Deferred because the current KPI and workload visualizations are small,
accessible, and maintainable with typed SVG components. A charting dependency
can be reconsidered when M12 requires richer interactions.

---

### Consequences

Positive:

* runtime-safe boundaries for mock, persisted, and future network data
* clear domain ownership and repeatable feature structure
* query caches contain validated business objects
* backend replacement can occur behind feature services

Negative:

* schemas add some duplication to fixture construction
* transport validation has a small runtime cost
* feature modules contain more files than page-local implementations

These trade-offs are accepted for reliability and long-term domain scalability.

---

# ADR-010

## Title

Service-Enforced Entity Integrity

## Status

Accepted

---

### Context

Department management introduces the first persisted CRUD workflow and the
first domain with relationships between records. Field schemas alone cannot
enforce collection-level requirements such as unique codes, unique names,
acyclic parent relationships, or safe deletion.

The same workflow must remain valid whether changes originate from the current
form, future bulk operations, or a real backend adapter.

---

### Decision

Entity forms use shared Zod schemas for field-level validation. Feature
services validate the same input again, normalize it, load the current
collection, and enforce cross-record business rules before invoking a write on
the mock API.

Department hierarchy is represented with a nullable `parentDepartmentId`.
Services reject self-parenting, descendant-parent cycles, references to missing
parents, and deletion while child departments still reference the record.

The mock API is responsible only for latency-shaped collection persistence.
TanStack Query owns cached collection and detail state, with mutation hooks
responsible for seeding, invalidating, or removing relevant cache entries.

---

### Alternatives Considered

#### Enforce Rules Only in the Form

Rejected because non-form callers could bypass integrity checks and UI state can
be stale relative to persisted state.

#### Store Nested Department Trees

Rejected because moving a subtree would require rewriting nested records and
entity lookup would become more difficult. Parent identifiers provide a
normalized model suitable for a future relational backend.

#### Cascade Delete Child Departments

Rejected because implicit deletion is unsafe for enterprise organization data.
Children must be deliberately reassigned or removed first.

#### Put Business Rules in the Mock API

Rejected because replacing the mock transport would also remove domain
behavior. The feature service is the stable business boundary.

---

### Consequences

Positive:

* one reusable pattern for future entity-management domains
* integrity rules apply to every feature caller
* normalized hierarchy maps cleanly to future backend storage
* query cache behavior is explicit after every mutation

Negative:

* writes require a current collection read in the frontend simulation
* client-side checks cannot provide true multi-user transaction guarantees
* services carry more responsibility than simple transport wrappers

These limitations are acceptable until a backend provides transactional
enforcement.

---

# ADR-011

## Title

Lifecycle-Preserving Managed Identities

## Status

Accepted

---

### Context

User management introduces identities that will later receive roles,
permissions, assignments, approval responsibilities, and audit history.
Permanently deleting identities would break those future relationships and
remove important organizational context.

Users also have relationships to departments, managers, teams, and existing
department owner snapshots.

---

### Decision

Managed users use explicit lifecycle states: `invited`, `active`, `suspended`,
and `deactivated`. The application does not delete user records.

Allowed lifecycle transitions are enforced by the user service. Deactivation is
blocked while active direct reports still reference the user. Manager
relationships use nullable user identifiers and must remain acyclic.

Department and team assignments are normalized identifiers validated against
their owning domains. Department owner snapshots remain embedded for
resilience and are resolved to managed user profiles by normalized email when
possible.

---

### Alternatives Considered

#### Permanently Delete Users

Rejected because workflows, approvals, reports, and audit history will require
stable actor references after a person leaves the organization.

#### Store Manager and Team Objects Inside Each User

Rejected because copied records would become stale and make reassignment
expensive. Identifier relationships preserve a normalized organization model.

#### Immediately Rewrite Department Owners to User IDs

Rejected because persisted departments may reference people who are not yet
managed users. The snapshot-plus-resolution approach is backward compatible
and supports incremental migration.

#### Allow Any Lifecycle Transition

Rejected because states have operational meaning. For example, an invited user
must become active before suspension, and a manager with active reports cannot
be deactivated without reassignment.

---

### Consequences

Positive:

* stable identity references for future authorization and auditing
* realistic joiner, access suspension, reactivation, and leaver behavior
* normalized reporting and team relationships
* incremental migration path for department ownership

Negative:

* inactive identities accumulate and require filtering
* lifecycle rules add service complexity
* email-based owner resolution is transitional rather than referentially exact

These trade-offs are accepted to preserve organizational history and prepare
for M5 authorization.

---

# ADR-012

## Title

Additive Role-Based Access Control

## Status

Accepted

---

### Context

The platform now has managed identities and administrative workflows that need
a consistent authorization vocabulary. Future workflows, approvals, reports,
and settings must be able to ask the same question: whether the current user
has a specific capability.

Authorization remains frontend-simulated until a backend exists, but the domain
model should transfer cleanly to server enforcement.

---

### Decision

Use additive role-based access control.

The application owns a fixed catalog of typed permission keys. Editable roles
contain sets of those keys, and separate assignment records connect users to
roles. Effective access is the de-duplicated union of all permissions granted by
assigned roles.

Only active users receive effective permissions. System roles are immutable,
assigned roles cannot be deleted, and assignment changes must preserve at least
one active user with `security.manage`.

Routes use `AuthorizationBoundary`; actions use `PermissionGate` or
`useAuthorization`. The same effective-access query powers every surface.

---

### Alternatives Considered

#### Store Permissions Directly on Users

Rejected because duplicated permission sets are difficult to govern, compare,
and update consistently across many identities.

#### Deny Rules and Role Precedence

Deferred because precedence rules substantially increase policy complexity.
The current model is intentionally additive and understandable. Explicit deny
policies can be introduced later if a concrete enterprise requirement appears.

#### Persist the Permission Catalog

Rejected because permission keys correspond to implemented application
capabilities. Allowing arbitrary persisted permissions would create policies
the application cannot enforce.

#### Treat Frontend Authorization as Security Enforcement

Rejected because client code and storage can be modified by the user. The
frontend model controls product behavior and prepares contracts for future
backend enforcement; it does not secure data by itself.

---

### Consequences

Positive:

* one typed authorization vocabulary across routes and actions
* reusable roles reduce assignment and governance effort
* effective access is deterministic and easy to explain
* safeguards prevent accidental administrative lockout
* the model maps naturally to future server-side RBAC

Negative:

* additive roles cannot express explicit denials
* permission checks require current role and assignment data
* frontend-only enforcement remains simulated security
* protected system roles require code changes to evolve

These trade-offs are accepted for a clear and scalable authorization
foundation.

---

# Future Decisions

The following topics will likely require future ADRs:

* Authentication architecture
* Authorization model
* Notification architecture
* Offline support strategy
* Audit logging implementation
* Search architecture
* Feature flag system
* Multi-tenancy
* Reporting engine
* Analytics architecture
* Plugin system
* Testing strategy
* Deployment strategy

---

# Update Rules

Create a new ADR when:

* architecture changes
* a new foundational technology is introduced
* a major trade-off is accepted
* a previously accepted decision is reversed

Do not modify historical decisions except to:

* supersede them
* deprecate them
* add clarifications

The goal is to preserve historical context, not rewrite it.

This document should explain not only what the project looks like, but why it looks that way.
