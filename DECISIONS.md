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

# ADR-013

## Title

Versioned Workflow Graphs with Immutable Published History

## Status

Accepted

---

### Context

Approvals, tasks, audit history, and reporting will need to reference a stable
business process even after administrators change that process. Updating one
workflow record in place would make historical work appear to have followed
rules that did not exist when it was executed.

Workflow configuration also forms a directed graph, so ordinary field
validation is insufficient to protect process integrity.

---

### Decision

Persist each workflow version as a complete definition record. Records share a
stable `workflowKey` and have an increasing version number.

Draft versions are editable and deletable. Active and retired versions are
read-only. Activating a draft retires the previous active version with the same
workflow key. Creating a new version clones the graph with fresh state and
transition identifiers.

The shared workflow schema validates the graph before service writes. It
requires exactly one initial state, reachable states, valid and unique
transitions, terminal-state integrity, and an onward path from each
non-terminal state.

Reusable templates are code-owned starting configurations. They accelerate
authoring but do not remain linked as mutable inheritance.

---

### Alternatives Considered

#### Update Active Workflows in Place

Rejected because running approvals and historical records would lose the exact
process definition they were created against.

#### Store Only Differences Between Versions

Rejected because reconstructing a historical graph would require replaying a
change chain and would complicate future auditing and migration.

#### Validate Graphs Only in the Editor

Rejected because future imports, bulk operations, and backend adapters could
bypass UI validation.

#### Persist Editable Templates

Deferred because template governance, ownership, and compatibility would add a
separate lifecycle before a concrete requirement exists.

---

### Consequences

Positive:

* approvals can reference an immutable workflow version
* published process history remains explainable
* graph integrity is enforced for every write path
* activation has a clear and auditable lifecycle
* templates accelerate creation without coupling definitions to future edits

Negative:

* complete graph copies consume more browser storage
* correcting a published definition requires a new version
* atomic activation is simulated at the mock collection boundary and will
  require a backend transaction later

These trade-offs are accepted to establish a trustworthy process foundation.

---

# ADR-014

## Title

Aggregate-Based Sequential Approvals with Append-Only History

## Status

Accepted

---

### Context

Enterprise approvals need to explain who was responsible, which process rules
applied, what decision was made, and how responsibility changed over time.
Storing only the current approval status would lose delegation, escalation,
comments, and reviewer accountability.

Approvals must also remain historically understandable after workflow
administrators publish a newer process version.

---

### Decision

Represent an approval request as an aggregate containing:

* a reference and display snapshot for one active workflow version
* an ordered sequence of reviewer steps
* current request and process state
* an append-only array of typed business events

Reviewer chains execute sequentially. One step is pending while later steps
wait. Approval unlocks the next step; rejection completes the request
immediately. Only the currently assigned reviewer may decide or delegate.

Delegation changes the active assignee but preserves the original assignee and
records a typed event. Overdue steps may escalate to their configured target,
also through a typed event. Decision comments are required.

The aggregate is loaded, validated, changed, and replaced through the approval
service and mock API. The service remains the transaction boundary until a
backend can provide database transactions.

---

### Alternatives Considered

#### Store Only Current Status

Rejected because it cannot explain reviewer order, comments, reassignment, or
the sequence of decisions.

#### Parallel Approval by Default

Deferred because quorum, veto, and partial-completion semantics create
substantially more policy complexity. Sequential chains provide a clear first
execution model.

#### Reference the Latest Workflow Dynamically

Rejected because historical requests could appear to follow a process version
that did not exist when they were submitted.

#### Store History Only as Free-Text Messages

Rejected because typed events are safer to render, query, audit, and migrate.

#### Normalize Steps and Events into Separate Persisted Collections

Deferred until backend or reporting requirements require independent querying.
The aggregate model keeps browser persistence updates coherent today.

---

### Consequences

Positive:

* every approval remains tied to its governing workflow version
* reviewer accountability and reassignment remain explainable
* typed history supports future audit and notification integrations
* service rules protect decisions from stale or unauthorized callers
* one aggregate write keeps the frontend simulation coherent

Negative:

* large event histories increase aggregate size
* concurrent browser writers do not receive true transaction isolation
* parallel, quorum, and conditional approval policies are not yet represented
* normalized analytics will require projection or future backend tables

These trade-offs are accepted for a trustworthy sequential approval
foundation.

---

# ADR-015

## Title

Durable Operational Tasks with Explicit Lifecycle and Activity History

## Status

Accepted

---

### Context

Day-to-day enterprise work needs more than a mutable title and checkbox.
Operational teams must understand accountable ownership, urgency, deadlines,
blockers, completion, reassignment, and the governed decision that may have
authorized the work.

Deleting or silently overwriting task state would make delivery history and
future audit integration unreliable.

---

### Decision

Represent tasks as durable aggregates containing:

* creator, assignee, and accountable department identifiers
* priority, due date, current lifecycle state, and completion timestamp
* an optional approval request relationship
* an append-only array of typed activity events

Use the lifecycle states `backlog`, `in-progress`, `blocked`, `completed`, and
`cancelled`. A service-owned transition map defines permitted changes. Every
actual status change requires a note and appends a typed event. Reassignment
and general edits also append events.

Tasks are not deleted. Completed work may reopen to in-progress, cancelled work
may return to backlog, and blocked work returns to in-progress before it can be
completed.

Personal, department, list, and board queues are derived from the same
TanStack Query collection. The board is a presentation of lifecycle state, not
a separate persisted model.

Introduce `tasks.view` and `tasks.manage` permissions. Protected system roles
are synchronized with code-owned definitions when read so new application
capabilities reach existing persisted installations without replacing custom
role policy.

---

### Alternatives Considered

#### Boolean Completion Only

Rejected because it cannot represent queued, active, blocked, or cancelled
work and provides no safe transition rules.

#### Hard Delete Completed or Cancelled Tasks

Rejected because approvals, reports, audit history, and operational review need
stable work references.

#### Persist Separate Kanban Columns

Rejected because columns would duplicate lifecycle state and create
synchronization risk. Board columns are derived from task status.

#### Store Activity as Free Text

Rejected because typed events are safer for future notifications, auditing,
reporting, and migration.

#### Automatically Add New Permissions to Every Persisted Role

Rejected because that would silently broaden editable custom roles. Only
protected system roles are synchronized from code.

---

### Consequences

Positive:

* operational ownership and delivery state remain explicit
* lifecycle changes are explainable and service-enforced
* approval decisions can lead to durable follow-through work
* one cached collection supports multiple efficient queue experiences
* typed events prepare the domain for notifications and audit logging
* permission evolution does not accidentally expand custom roles

Negative:

* task aggregates grow as activity accumulates
* no hard deletion means archives will eventually need stronger filtering
* the initial lifecycle does not include subtasks or dependency graphs
* frontend persistence cannot guarantee multi-user transaction isolation

These trade-offs are accepted for a coherent operational work foundation.

---

# ADR-016

## Title

Checkpointed Notification Projection from Domain Event History

## Status

Accepted

---

### Context

Approvals and tasks already preserve typed, append-only activity events.
Notifications need to react to that activity without embedding communication
concerns inside every business mutation or making notification delivery part
of the transaction that changes the business entity.

User preferences must apply to future activity, and toggling a subscription
must not cause old suppressed events to appear later.

---

### Decision

Build notifications as a persisted projection over approval and task event
history.

The notification service derives typed emissions with stable source event
keys. It loads recipient preferences, verifies that the recipient is an active
managed identity, creates an in-app notification when subscribed, and records
the source event key as processed.

Every observed event is checkpointed whether it is delivered or suppressed.
Preferences therefore govern processing-time delivery and never replay
historical activity after being re-enabled.

Persist notification records and processed event keys together as one
projection store. Persist user preferences separately. Read state belongs to
the notification record and is synchronized through the notification query
family.

Domain services do not call notification services directly. Projection occurs
when notification queries synchronize and at a modest polling interval while
the header indicator is active.

Because the header bell is part of the application shell, notification
persistence and source-domain services are loaded through dynamic imports.

---

### Alternatives Considered

#### Call Notification APIs from Every Domain Mutation

Rejected because notification failures would become coupled to business
transactions and every domain would gain a communication dependency.

#### Derive Notifications Without Persistence

Rejected because read state, delivery preference decisions, and stable message
identity would be lost on every refresh.

#### Re-Evaluate All Historical Events on Every Preference Change

Rejected because enabling a subscription could unexpectedly deliver stale
activity. Processed checkpoints give preferences forward-only semantics.

#### Poll Each Source Domain Independently in the Header

Rejected because the shell would own cross-domain rules and duplicate
projection logic.

#### Eagerly Import the Projector into the Application Shell

Rejected because it would pull persistence, task, approval, and user code into
the initial bundle.

---

### Consequences

Positive:

* business domains remain independent from notification delivery
* typed source events produce deterministic actionable messages
* duplicate delivery and historical replay are prevented
* read state and preferences persist independently
* the model maps naturally to a future event consumer or background worker
* shell bundle ownership remains controlled

Negative:

* notifications are eventually consistent rather than transactionally instant
* projection currently scans frontend event history
* suppressed events cannot be recovered through later preference changes
* external email delivery is represented only as preference metadata

These trade-offs are accepted for a decoupled communication foundation.

---

# ADR-017

## Title

Normalized Append-Only Audit Projection over Authoritative Domain Events

## Status

Accepted

---

### Context

Approval and task aggregates preserve rich typed event histories, but those
events use domain-specific contracts. Enterprise traceability needs a common
record model that can be searched across domains, displayed consistently, and
migrated to a future centralized audit store.

Adding audit writes directly to every mutation would couple business
transactions to a secondary persistence concern and risk disagreement between
entity history and audit history.

---

### Decision

Build audit logging as a normalized projection over authoritative append-only
domain events.

Each supported source event maps to one immutable audit record containing:

* stable source event key
* entity type, identifier, and display name
* actor user identifier
* normalized action
* timestamp and human-readable summary
* structured field changes with before and after values

Persist records with processed event keys. Synchronization appends records only
for unseen keys. The audit service exposes no update or delete operation.

The initial projector covers approval and task domains because they already
provide actor-attributed event streams. Additional domains should join audit
projection when they expose equally trustworthy mutation histories.

Global and entity-level views use the same projection store. Access requires
the code-owned `audit.view` permission.

Audit projection services are dynamically imported from query definitions to
preserve route and shell bundle boundaries.

---

### Alternatives Considered

#### Write Audit Records Inside Every Mutation

Rejected because audit persistence failure could affect business operations,
domains would gain an infrastructure dependency, and duplicate write paths
could drift.

#### Display Raw Domain Events Directly

Rejected because cross-domain search, action filtering, structured changes,
and future backend storage require a stable common contract.

#### Audit Snapshot `updatedAt` Values

Rejected because timestamps alone do not identify the actor, reason, or actual
field transition and can create misleading records.

#### Permit Audit Record Correction or Deletion

Rejected because mutable audit history undermines traceability. Corrections
should eventually be represented as additional records.

#### Project Domains Without Actor-Attributed Events

Deferred until those domains expose reliable mutation history. Guessing actors
would be worse than explicitly limiting coverage.

---

### Consequences

Positive:

* entity history and global audit views share one normalized source
* audit records retain actor and structured change context
* duplicate records are prevented with stable checkpoints
* business mutations remain independent from audit infrastructure
* the adapter maps naturally to a future append-only backend store
* coverage can expand incrementally as domains mature

Negative:

* audit records are eventually consistent rather than transactional
* initial coverage is limited to approval and task domains
* projection scans frontend domain history in the current simulation
* source event corrections would require explicit compensating records

These trade-offs are accepted for reliable and extensible enterprise
traceability.

---

# ADR-018

## Title

Persisted Report Definitions with Source-Specific Execution Adapters

## Status

Accepted

---

### Context

The platform needs reusable business reporting without introducing a free-form
query language, duplicating source data, or coupling presentation tables
directly to task, approval, and audit entity shapes.

Saved configurations must remain durable while report results should reflect
current operational data whenever executed.

---

### Decision

Persist report definitions containing:

* name, description, owner, and template provenance
* one supported source: tasks, approvals, or audit
* an ordered set of typed column keys
* a validated common filter shape interpreted by the selected source

Keep report templates and source column catalogs code-owned because they
correspond to implemented execution capabilities.

Execute reports through source-specific adapters. Each adapter loads current
domain data, performs required identity and entity joins, applies source
filters, and maps records into a uniform validated tabular result:

* ordered column metadata
* string-valued rows
* report identifier and execution timestamp

Persist definitions but not execution results. TanStack Query caches recent
executions as server-like snapshots.

CSV export serializes the validated result in stable column order with quoting
and escaping. `reports.view`, `reports.manage`, and `reports.export` remain
separate permissions.

Source services are dynamically imported during execution to preserve route
bundle boundaries.

---

### Alternatives Considered

#### Free-Form Query Builder

Deferred because arbitrary joins, expressions, permissions, validation, and
query planning would add major complexity before concrete requirements exist.

#### Persist Report Results

Rejected because results would become stale copies of operational data and
would require refresh, retention, and version semantics.

#### One Generic Adapter over Raw Objects

Rejected because source joins and filter meanings differ. Explicit adapters
keep contracts understandable and type-safe.

#### Let Users Enter Arbitrary Column Keys

Rejected because definitions could reference fields the application cannot
execute or export.

#### Use a Third-Party Export Library

Deferred because the current CSV contract requires only stable ordering,
quoting, and escaping. Additional formats can justify a dependency later.

---

### Consequences

Positive:

* saved reports remain reusable while executions stay current
* one result contract supports tables and exports
* source complexity remains isolated behind explicit adapters
* templates accelerate common operational reporting
* permissions distinguish viewing, definition management, and export
* the model can move behind a backend reporting API without UI redesign

Negative:

* supported sources, columns, and filters require code changes
* the common filter shape contains fields irrelevant to some sources
* executions perform frontend joins in the current simulation
* advanced grouping, aggregation, scheduling, and formulas are deferred

These trade-offs are accepted for a reliable reporting foundation.

---

# ADR-019

## Title

Validated Current-State Analytics with Shared Segmentation

## Status

Accepted

---

### Context

The platform has operational data and a row-oriented reporting engine, but
executive analysis needs derived metrics, comparable periods, trends, and
distributions rather than saved tables alone.

Analytics should use the same trustworthy domain sources as reporting without
persisting duplicate metric snapshots or introducing a chart dependency before
the interaction requirements justify one.

---

### Decision

Derive analytics snapshots from current task, approval, and department
services.

Every snapshot applies one shared filter contract:

* reporting period of 30, 90, or 180 days
* optional department identifier

The aggregation service returns a validated analytics contract containing:

* headline metrics with format and favorable trend semantics
* previous-period comparisons
* weekly task-created, task-completed, and approval-decided series
* task lifecycle, approval outcome, and department workload distributions
* generation timestamp and applied filters

Do not persist analytics snapshots. TanStack Query caches them by period and
department segment.

Build lightweight SVG and CSS visualizations with semantic summaries and
screen-reader tables. Reconsider a charting dependency when richer interaction,
larger series, or specialized chart types create concrete need.

Use a separate `analytics.view` permission and route. Dynamically load the
aggregation service and its source domains when an analytics query executes.

---

### Alternatives Considered

#### Reuse Report Results Directly

Rejected because report rows do not encode metric definitions, trend semantics,
or efficient distribution series. Both systems share sources, not output shape.

#### Persist Analytics Snapshots

Rejected because snapshots would become stale copies requiring refresh,
retention, and version policy.

#### Introduce a Charting Library Immediately

Deferred because the current line and distribution visuals are small,
accessible, and maintainable with native SVG and CSS.

#### Use Independent Filters per Widget

Rejected because executives could unknowingly compare widgets using different
time windows or organization segments.

#### Put Aggregations in React Components

Rejected because computation would be duplicated, difficult to validate, and
coupled to presentation.

---

### Consequences

Positive:

* one validated snapshot keeps dashboard widgets internally consistent
* period comparisons have explicit favorable-direction meaning
* reporting and analytics share authoritative sources without duplicate data
* visualizations remain accessible and dependency-light
* new metric and distribution components can be composed into future dashboards

Negative:

* current frontend aggregation scans complete source collections
* sparse seed data can produce empty periods or flat trends
* historical state reconstruction is limited to available timestamps and events
* advanced drill-down, forecasting, and custom metrics are deferred

These trade-offs are accepted for a coherent analytics foundation.

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
