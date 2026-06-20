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
