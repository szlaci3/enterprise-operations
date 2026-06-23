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

# ADR-020

## Title

Permission-Aware Transient Search Index with Deterministic Ranking

## Status

Accepted

---

### Context

The platform now contains many navigable business entities across independent
domains. Users need one discovery surface, but persisting a duplicated search
index in the frontend would introduce synchronization and migration concerns.

Search must also avoid exposing entities from modules the current user cannot
view.

---

### Decision

Build global search from source-specific adapters over current domain services.

Each adapter produces a common transient search document containing:

* entity type and stable identifier
* title and description
* normalized searchable body
* status and display metadata
* updated timestamp
* canonical application URL

The index includes departments, users, workflows, tasks, approvals, and saved
reports. Before loading a domain, the search service maps its entity type to a
required permission and checks the current effective-access snapshot.

Use deterministic weighted ranking:

* exact normalized title
* title prefix
* title containment
* description containment
* searchable-body containment
* per-token title-prefix and body matches

Sort equal scores by most recently updated. Group results by typed entity in
the UI.

Do not persist source documents or results. Persist only per-user recent
queries and named saved searches with their filters. Recent queries are
case-insensitively de-duplicated and bounded.

Provide Ctrl/Cmd+K as the global entry point. Keep the always-mounted launcher
lightweight and lazy-load the route, search service, and authorized domains.

---

### Alternatives Considered

#### Persist a Browser Search Index

Rejected because every domain mutation would need index synchronization,
corruption recovery, and schema migration.

#### Search Only Currently Cached Query Data

Rejected because results would depend on which routes the user happened to
visit and would be incomplete.

#### Use One Large Concatenated String without Ranking

Rejected because identifier and body matches could outrank exact entity names,
making results unpredictable.

#### Load Every Domain and Filter Results Afterwards

Rejected because unauthorized entity data would enter memory before filtering
and unnecessary domain bundles would load.

#### Add a Fuzzy-Search Dependency

Deferred because deterministic token and prefix scoring is sufficient for the
current dataset and easier to explain. Fuzzy matching can be introduced when
scale or typo tolerance creates a concrete requirement.

---

### Consequences

Positive:

* results always reflect current source data
* permission checks apply before source domains are loaded
* ranking is deterministic and explainable
* canonical links provide direct navigation
* saved and recent searches improve repeated discovery
* new entity types can join through explicit adapters

Negative:

* every uncached search reads multiple authorized collections
* ranking is lexical and does not yet tolerate substantial misspellings
* source adapters require maintenance as domain display fields evolve
* large future datasets will require backend indexing or incremental search

These trade-offs are accepted for a coherent frontend discovery foundation.

---

# ADR-021

## Title

Entity-Scoped Collaboration with Merged Operational Activity

## Status

Accepted

---

### Context

Operational collaboration needs durable context. A detached chat surface would
force users to reconstruct which task or approval a decision concerned, while
embedding comments directly into every source entity would duplicate schemas,
mutation rules, and notification behavior.

The platform also already has authoritative task and approval event histories.
Collaboration should enrich those histories without copying or replacing them.

---

### Decision

Create a dedicated collaboration domain whose comments reference an entity by
typed `entityType` and stable `entityId`.

Comments contain actor attribution, body, mention identities, creation and edit
timestamps, an optional top-level parent, and a soft-deletion timestamp.
Replies are limited to one level so discussions remain readable and lifecycle
rules remain predictable.

Use explicit capabilities:

* `collaboration.view`
* `collaboration.contribute`
* `collaboration.moderate`

Authors may edit or remove their own comments. Moderators may act on any
comment. Removal preserves a tombstone and reply relationships rather than
deleting history.

Mentions select active managed-user identifiers rather than relying on
unvalidated free-text handles. Notification reconciliation projects one
recipient-addressed message per mentioned user and retains the source entity's
canonical URL.

Use one reusable entity collaboration panel. Source detail pages provide typed
business-event summaries; the panel merges them with collaboration records by
timestamp. Authoritative source events remain in their owning domains.

---

### Alternatives Considered

#### Add a Standalone Team Chat

Rejected because conversations would lose operational context and introduce a
separate navigation and retention model.

#### Embed Comments in Tasks and Approvals

Rejected because each source domain would repeat comment schemas, mention
validation, permissions, persistence, and notification integration.

#### Copy Business Events into Collaboration Storage

Rejected because duplicated event records would require synchronization and
could disagree with authoritative task or approval history.

#### Parse Free-Text `@handles`

Deferred because display names are not stable identifiers and ambiguous text
parsing can notify the wrong person. The current mention picker stores managed
user IDs while allowing comment prose to remain unrestricted.

#### Permanently Delete Comments

Rejected because removing records would break discussion context and weaken
the operational history expected from enterprise software.

---

### Consequences

Positive:

* discussions remain attached to operational records
* one service enforces mention and lifecycle rules consistently
* merged timelines show decisions and conversation in chronological context
* notification links return users to the exact source record
* soft deletion preserves thread integrity
* additional entity types can adopt the shared panel and reference contract

Negative:

* merged activity is assembled client-side from two sources
* reply depth is intentionally limited
* mention selection is explicit rather than inline autocomplete
* a future backend must enforce the same permissions and entity visibility
* high-volume discussions will eventually require pagination

These trade-offs are accepted for a coherent contextual collaboration
foundation.

---

# ADR-022

## Title

Versioned Document Aggregates with Bounded Browser Attachment Storage

## Status

Accepted

---

### Context

Operational work needs controlled supporting content with durable metadata,
version history, attribution, and links to tasks or approvals. Embedding files
inside source entities would duplicate document rules and make future content
storage migration difficult.

The application remains frontend-only, so attachment behavior must be useful
without implying that browser local storage has the capacity or security of an
enterprise object store.

---

### Decision

Represent each document as a complete aggregate containing:

* ownership, department, classification, retention, and lifecycle metadata
* typed links to task and approval identifiers
* an append-only array of immutable content versions

Each version retains its file name, MIME type, size, data URL content,
SHA-256 identity, author, timestamp, sequence number, and change summary.
Existing versions are never replaced when new content is uploaded.

Allow PDF, PNG, JPEG, CSV, and plain-text content. Limit each version to 750 KB
and the accumulated content of one document to 3 MB. These constraints are
service-enforced and presented in the intake experience.

Keep operational links normalized. Validate each referenced task or approval
through its owning service before persisting the relationship. Source entities
do not embed document data.

Use separate `documents.view`, `documents.manage`, and `documents.download`
permissions. Keep the document route lazy-loaded and expose linked documents
through one reusable task and approval panel.

---

### Alternatives Considered

#### Store Attachments Directly on Tasks and Approvals

Rejected because versioning, lifecycle, classification, and storage policy
would be duplicated across source domains.

#### Persist Only Attachment Metadata

Rejected because the frontend simulation would not provide functional
downloads or demonstrate actual version preservation.

#### Use IndexedDB or an Additional Storage Dependency Immediately

Deferred because bounded data URLs fit the current seeded and demonstration
scale while preserving a service boundary that can later target IndexedDB or
backend object storage.

#### Allow Arbitrary File Types and Sizes

Rejected because browser storage is constrained, arbitrary active content is
unsafe, and a governed platform should make attachment policy explicit.

#### Replace Prior Content When Uploading a Revision

Rejected because it would destroy evidence, attribution, and historical
traceability.

---

### Consequences

Positive:

* document governance is centralized in one domain
* prior content and attribution remain available
* task and approval aggregates stay independent of file storage
* attachment policy and capacity are explicit
* permission boundaries distinguish discovery, mutation, and download
* a future object-storage backend can replace data URLs behind the service

Negative:

* localStorage capacity varies by browser and remains unsuitable for large files
* base64 data URLs add storage overhead
* frontend-only permissions do not secure downloaded content from a malicious client
* cross-domain link validation loads source services in the current simulation
* document audit projection and full-text indexing are deferred

These trade-offs are accepted for a functional content-management foundation
with a clear backend migration path.

---

# ADR-023

## Title

Explicit Personal and Administrative Ownership in a Unified Settings Domain

## Status

Accepted

---

### Context

Theme preference originally lived in persisted Zustand state while
notification preferences used a validated service and query boundary. As the
platform adds organization policy and feature configuration, continuing to
scatter settings by presentation location would make ownership, authorization,
migration, and future backend integration unclear.

The application shell also needs a small set of settings at runtime without
eagerly loading the complete administration experience.

---

### Decision

Create a dedicated settings domain with one validated persisted store
containing:

* managed-user-owned workspace preferences
* organization-owned policy and branding
* organization-wide feature rollout configuration
* append-only administrative change records

Personal settings contain theme, information density, time zone, date format,
and reduced-motion preference. Users may update only the record addressed to
their current managed identity.

Organization settings contain name, support contact, default time zone, week
start, fiscal year start, and retention policy. Feature configuration uses
explicit enabled, pilot, and disabled states. Organization and feature changes
require `settings.manage` in the product surface and append field-level history.

Use TanStack Query for settings snapshots and mutations because settings are
server-like records. Retain Zustand only for transient shell interaction state.
Migrate the former Zustand theme value into the first settings store.

Let the shell consume settings query definitions for branding, theme, density,
reduced motion, and feature navigation. Load the settings service dynamically
and keep the administration workspace route-lazy.

Feature-disabled modules are removed from navigation and protected by a direct
route availability boundary. Embedded collaboration and document surfaces use
the same rollout snapshot.

---

### Alternatives Considered

#### Keep Theme in Zustand and Add Administrative Settings Separately

Rejected because durable preferences would have inconsistent ownership,
validation, caching, and migration semantics.

#### Store Every Preference in One Global UI Store

Rejected because organization policy and feature rollout are server-like
shared records, not local interface state.

#### Merge Notification Preferences into the Settings Store

Rejected because notification subscriptions are delivery policy consumed by
the notification projector and remain cohesive in that domain. The settings
workspace composes the existing feature-owned form.

#### Use Boolean Feature Flags

Rejected because a pilot state communicates controlled rollout without
inventing user targeting before a concrete cohort model exists.

#### Record No Administrative History

Rejected because organization-wide policy changes need actor, time, field, and
before/after traceability.

---

### Consequences

Positive:

* personal and administrative ownership is explicit
* shell behavior reflects persisted managed-user settings
* organization branding and policy have one validated source
* rollout controls affect navigation, routes, and embedded feature surfaces
* administrative changes retain field-level history
* notification preference ownership remains cohesive
* a backend settings API can replace the mock service without UI redesign

Negative:

* the application shell performs one settings snapshot query at startup
* feature availability and RBAC remain separate checks
* pilot state is descriptive and does not yet target cohorts
* date and time preferences are not yet applied to every legacy formatter
* frontend-only administration is not a security boundary

These trade-offs are accepted for coherent platform configuration and a clear
path to centralized backend policy.

---

# ADR-024

## Title

Code-Owned Permission-Aware Command Registry with Lazy Entity Discovery

## Status

Accepted

---

### Context

The global Ctrl/Cmd+K shortcut originally navigated directly to the search
route. As the platform gained more modules and create workflows, power users
needed a single keyboard surface for navigation, actions, and record discovery.

A command palette is mounted in the application shell, so importing every
feature service or duplicating search indexing there would create bundle and
maintenance problems.

---

### Decision

Use a code-owned typed command registry. Every command declares:

* stable identifier, label, description, keywords, and category
* canonical destination route
* optional required permission
* optional required feature rollout
* an icon vocabulary owned by the command presentation

Filter commands against the current effective-access and settings snapshots
before matching. Rank static commands deterministically by exact label, label
prefix, label containment, keyword containment, and description containment.

After the palette is open and the user enters at least two characters,
dynamically import the existing search service and request permission-aware
entity results. Map those results into the same selectable presentation
contract as commands. Always offer a handoff to the full search route with the
query retained.

Ctrl/Cmd+K now belongs to the command palette, superseding only the shortcut
ownership portion of ADR-020. The `/search` route and its search architecture
remain unchanged.

Implement the palette with native React and browser interaction primitives:

* modal dialog and combobox semantics
* arrow-key selection and Enter execution
* Escape dismissal
* focus placement and focus trapping
* outside-click dismissal

Do not add a command-menu dependency while the required behavior remains
small and maintainable.

---

### Alternatives Considered

#### Continue Navigating Ctrl/Cmd+K to Global Search

Rejected because search cannot efficiently expose create actions, settings,
or module navigation.

#### Build Commands from the Sidebar DOM

Rejected because actions not present in navigation would be omitted, and
presentation markup is not a stable registry or authorization contract.

#### Persist Commands as User-Editable Data

Rejected because commands represent implemented routes and capabilities.
Persisted arbitrary commands could target unsupported or unauthorized actions.

#### Eagerly Load Entity Collections in the Shell

Rejected because it would pull source domains into the initial bundle and
perform unnecessary reads before the palette is used.

#### Add a Third-Party Command Palette Library

Deferred because the current interaction model is compact, accessible, and
does not justify another dependency. This can be reconsidered if nested
commands, richer composition, or plugin-provided actions emerge.

---

### Consequences

Positive:

* one keyboard surface covers navigation, creation, and discovery
* unavailable commands are filtered before presentation
* the registry is explicit, typed, and easy to extend
* entity discovery reuses existing authorization and ranking behavior
* cross-domain search remains outside the initial shell bundle
* no additional runtime dependency is introduced

Negative:

* new route actions require a command registry entry to become discoverable
* command keywords are curated manually
* entity results begin only after two characters
* the palette does not yet support nested parameters or inline mutations
* browser-level keyboard conventions may vary outside Ctrl/Cmd+K

These trade-offs are accepted for a focused productivity layer with controlled
bundle ownership and a clear extension point.

---

# ADR-025

## Title

Persisted Intent Queue with Optimistic Projection and Version-Based Conflict Resolution

## Status

Accepted

---

### Context

Operational users need to record task progress during temporary connectivity
loss. TanStack Query's default offline behavior can pause mutations, but a
production-like system also needs durable intent, visible synchronization
state, optimistic reads after reload, and explicit handling when the
authoritative record changes elsewhere.

Replaying several task transitions independently would compare each operation
against timestamps that only exist locally and could turn a valid local chain
into false conflicts.

---

### Decision

Introduce a dedicated offline domain and begin with task status transitions.

Persist one queued intent per task containing:

* the authoritative task `updatedAt` observed before offline work
* all locally created status transition events
* the latest optimistic task aggregate
* actor, creation, retry, failure, and conflict metadata
* an optional current authoritative task when conflict occurs

Further offline transitions for the same task update the existing optimistic
aggregate and append events to that operation. They do not create independent
replay records.

Task list and detail queries read authoritative task persistence and overlay
queued optimistic aggregates. Source-domain services used by audit,
notifications, reporting, and search continue to read authoritative data so
unsynchronized events do not escape into secondary projections.

On reconnect, compare the current authoritative `updatedAt` with the queued
base timestamp:

* when equal, persist the optimistic aggregate and remove the queue item
* when different, retain both local intent and the remote aggregate as a
  conflict

Conflict resolution is explicit:

* "Use remote" discards the queued local intent
* "Keep mine" rebases local transition events over the latest remote task,
  updates the expected base timestamp, and synchronizes again

Observe browser online/offline events and provide a non-persisted work-offline
override for deterministic testing. Show pending, failed, and conflict state in
the application shell and on affected task details.

Configure read queries with `networkMode: always` because the current mock
services read validated browser persistence. Configure task transitions and
offline queue mutations the same way so application logic owns deferral and
replay.

---

### Alternatives Considered

#### Let TanStack Query Pause and Resume Mutations

Rejected because paused mutations alone do not provide durable domain intent,
optimistic projection after reload, conflict records, or user-directed
resolution.

#### Queue Every Transition as an Independent Mutation

Rejected because later transitions would reference local intermediate
timestamps that the authoritative store never observed.

#### Persist Optimistic Tasks Directly in the Task Repository

Rejected because unsynchronized work would become indistinguishable from
authoritative records and could feed audit, notifications, reports, and search.

#### Last Write Wins

Rejected because silently replacing remote work would lose concurrent changes
and undermine operational accountability.

#### Apply Offline Support to Every Mutation Immediately

Deferred because each domain needs explicit conflict and optimistic semantics.
Task status transitions provide a complete reusable pattern before expanding
coverage.

---

### Consequences

Positive:

* task progress can be recorded and recovered across offline reloads
* optimistic state is visible without contaminating authoritative persistence
* synchronization and failure state is explicit
* concurrent updates are detected instead of silently overwritten
* local intent and remote state remain available during resolution
* the queue contract maps to a future service worker or backend sync API

Negative:

* initial offline writes cover task status transitions only
* keeping local status can intentionally override a remote lifecycle outcome
* queued aggregates consume additional browser storage
* browser connectivity is an imperfect proxy for backend reachability
* frontend-only replay cannot provide transactional multi-user guarantees

These trade-offs are accepted for a complete resilience pattern that can be
extended domain by domain.

---

# ADR-026

## Title

Measured Rendering Windows and Stable Dependency Chunk Ownership

## Status

Accepted

---

### Context

The platform had extensive route-level lazy loading, but the production build
still produced an application-owned entry chunk of approximately 356 KB
uncompressed. High-volume tables and feeds also rendered every matching record,
making DOM work grow linearly with data volume.

Different collection surfaces have different semantic and layout needs. A
single table abstraction or virtualization library would add complexity where
simple bounded rendering is sufficient.

---

### Decision

Use measured, surface-specific rendering strategies:

* virtualize the managed-user table because rows have a stable height
* render audit history in bounded batches because record height varies
* paginate report results because semantic tables and predictable navigation
  are more valuable than continuous scroll

Implement a small reusable `useVirtualRows` hook that calculates start index,
end index, overscan, and spacer heights. Keep row rendering and table semantics
inside the owning feature. Expose total row count and absolute row indexes for
assistive technology.

Keep report CSV export independent from visible pagination and retain the
previous validated result during background refresh.

Create stable Vite manual chunks for React/router, TanStack Query, forms,
validation, state, icons, and remaining vendor code. Load command,
notification, and synchronization shell utilities through React lazy
boundaries.

Use explicit longer stale and garbage-collection windows for stable identity,
team, and report execution queries. Business mutations continue to invalidate
their owning key families.

Do not introduce a virtualization or data-grid dependency for the current
requirements.

---

### Alternatives Considered

#### Add a Full Data-Grid Library

Rejected because current tables do not require column pinning, aggregation,
editable cells, or complex selection. The dependency and abstraction cost
would exceed the demonstrated need.

#### Virtualize Every Collection

Rejected because variable-height audit records and semantic report tables are
clearer with bounded disclosure and pagination.

#### Rely Only on Route-Level Lazy Loading

Rejected because always-mounted shell utilities and vendor dependencies still
left a large application entry chunk with unstable cache ownership.

#### Put Every Dependency in One Vendor Chunk

Rejected because unrelated dependency updates would invalidate the entire
vendor cache and obscure ownership in build output.

#### Use Infinite Query APIs for Local Mock Collections

Deferred because source services currently return complete validated
collections. Pagination at presentation boundaries provides proportional DOM
work without pretending the transport is paginated.

---

### Consequences

Positive:

* visible DOM work is bounded for the largest collection surfaces
* semantic tables and accessibility metadata are preserved
* the application-owned entry chunk fell from roughly 356 KB to 33 KB
* vendor chunks have stable, understandable ownership
* report refreshes avoid clearing useful current data
* no additional runtime dependency is introduced

Negative:

* fixed-row virtualization depends on a maintained row-height contract
* audit batch size and report page size are code-owned
* the large React/router vendor chunk still loads for the application runtime
* manual chunk groups require maintenance when foundational dependencies change
* true transport pagination remains future backend work

These trade-offs are accepted for measurable improvements with limited
architectural complexity.

---

# ADR-027

## Title

Sanitized Local Diagnostics with Permission-Separated Recovery Controls

## Status

Accepted

---

### Context

The platform had global and route recovery screens, but unexpected errors were
only written to the developer console. Administrators could not inspect
persistence availability, synchronization state, query health, or recent
runtime failures without browser developer tools.

Diagnostics must be useful without copying sensitive business payloads into a
second store or offering broad destructive reset actions.

---

### Decision

Create a diagnostics domain that derives a validated health snapshot from:

* sanitized runtime incidents
* browser persistence availability and per-key byte size
* offline queue pending, retry, and conflict state
* browser-reported connectivity
* query-cache and mutation summaries supplied by the diagnostics UI

Capture four incident sources:

* global React error boundary
* route error boundary
* unhandled browser errors
* unhandled promise rejections

Retain at most 100 incidents in browser persistence. Store only bounded error
name, message, stack, route, source, and timestamp. Do not store component
props, query data, form values, or business entity payloads.

Extend the shared persistence adapter with a diagnostic write probe and
metadata-only inspection. Expose enterprise storage key names and byte sizes,
never values.

Provide a downloadable JSON support bundle containing the health snapshot,
query summary, and basic browser runtime metadata.

Separate authorization:

* `diagnostics.view` permits health inspection and export
* `diagnostics.manage` permits recovery actions

Recovery controls are intentionally reversible or secondary-state-only:

* invalidate and refetch queries
* retry queued offline operations
* clear retained incident history
* clear the in-memory query cache and reload

No diagnostic action deletes persisted business records.

Catch diagnostics recording failures and report them only as console warnings
to prevent telemetry recursion.

---

### Alternatives Considered

#### Persist Complete Application State with Incidents

Rejected because it would duplicate sensitive business data and increase
storage and privacy risk.

#### Keep Diagnostics in the Browser Console

Rejected because operational administrators need an accessible product
surface and support export without developer tooling.

#### Add a Reset-All-Data Recovery Action

Rejected because a broad destructive control is unsafe and unnecessary for
the diagnosed failure modes.

#### Use Audit Records as Runtime Diagnostics

Rejected because audit records represent authoritative business events, while
runtime failures and infrastructure health are operational telemetry.

#### Add an External Monitoring SDK

Deferred because the project is frontend-only and has no configured telemetry
backend or privacy policy. The incident contract can later feed an external
collector.

---

### Consequences

Positive:

* administrators can inspect platform health without developer tools
* runtime failures survive reload and include recovery context
* persistence usage is visible without exposing values
* recovery authority is narrower than diagnostic visibility
* support bundles are portable and structured
* telemetry failures cannot recursively destabilize the application

Negative:

* incidents remain local to one browser profile
* browser connectivity does not prove backend reachability
* stack traces may be minified in production builds
* query summaries are point-in-time diagnostics rather than continuous metrics
* external alerting and centralized retention remain future work

These trade-offs are accepted for a safe production-like operational tooling
foundation.

---

# ADR-028

## Title

Versioned Persistence Envelopes with Ordered In-Place Migrations

## Status

Accepted

---

### Context

After M1–M20, durable browser state was validated by each mock API but stored
as raw domain payloads. Schema changes were handled through local conditionals,
boolean migration marker keys, or fallback to seed data.

This was workable while domain contracts were young, but Phase 2 will add
tenant ownership, shared saved views, service commitments, incidents,
compliance evidence, and broader audit context. Those changes require data
models to evolve without silently discarding user-created records.

The existing behavior also made it difficult for diagnostics to distinguish a
current store from an old but still valid payload.

---

### Decision

Persist every durable domain store in a common envelope:

```text
{
  schemaVersion,
  updatedAt,
  data
}
```

Create stores through a typed `createVersionedStore` factory that owns:

* schema validation on every read and write
* seed initialization only when the storage key is absent
* automatic wrapping of raw M1–M20 payloads that satisfy the current schema
* optional legacy transformation for known historical payload shapes
* ordered migrations from each stored version to the next version
* final validation before an upgraded envelope is written
* removal through the same store abstraction

Treat raw payloads as legacy version-zero data rather than inventing envelope
version zero. The first envelope version is version one.

Do not overwrite invalid data, skip missing migration steps, or downgrade an
envelope produced by a newer application version. Raise a dedicated
`PersistenceMigrationError` and preserve the original value for recovery.

Keep `browserStorage` as the low-level failure-containing adapter. Extend its
metadata-only diagnostics to identify versioned entries and schema versions
without exposing payload values.

Replace access-control migration marker keys with deterministic preparation of
raw seeded roles followed by normal code-owned system-role synchronization.

---

### Alternatives Considered

#### Continue Validating Raw Payloads in Each Mock API

Rejected because every domain would continue inventing migration, fallback,
and error semantics independently.

#### Silently Reseed Invalid Stores

Rejected because schema evolution or partial corruption could erase valid
user-created business records with no recovery signal.

#### Store One Global Application Schema Version

Rejected because domains evolve independently. A global version would couple
unrelated migrations and make partial loading harder.

#### Migrate Immediately to IndexedDB

Deferred because the primary problem is schema ownership and migration
semantics, not storage capacity or transaction APIs. The versioned store
contract can later sit over an IndexedDB adapter.

#### Retain Boolean Migration Marker Keys

Rejected because marker state can drift from the payload it describes and does
not encode ordering, validation, or the current store schema.

---

### Consequences

Positive:

* Phase 2 domain models can evolve through explicit, reviewable migrations
* existing valid browser data upgrades in place without destructive reset
* writes cannot bypass current domain validation
* unsupported and future-version data is preserved instead of downgraded
* diagnostics expose migration posture without exposing business payloads
* every durable domain uses one persistence lifecycle
* the contract remains replaceable by a future backend or IndexedDB adapter

Negative:

* the first read of each legacy store performs an additional envelope write
* migration failures can block an affected feature until recovery occurs
* migrations require long-term maintenance and regression tests
* update timestamps describe persistence writes, not authoritative business
  event time
* browser-local persistence still cannot provide transactional multi-user
  guarantees

These trade-offs are accepted because explicit failure is safer than silent
data loss and because Phase 2 requires durable model evolution.

---

# ADR-029

## Title

Code-Owned Platform Module Registry and URL-Addressable Collection State

## Status

Accepted

---

### Context

After M1–M22, platform metadata was repeated across sidebar arrays, command
definitions, router boundaries, icon maps, permissions, and feature checks.
Department and user routes also had weaker direct-route protection than later
modules.

The task, approval, user, and department directories independently implemented
loading, error, search, select, tab, summary, and empty-result behavior.
Their filter state was component-local, so filtered workspaces could not be
bookmarked, shared, or restored through browser navigation.

Moving every list into a generic data-grid or every platform concern into one
large configuration object would erase useful domain differences and risk
pulling feature code into the application shell.

---

### Decision

Create a typed code-owned platform module registry containing only stable
cross-platform metadata:

* module key, canonical route, label, icon, navigation group, and keywords
* optional feature rollout key
* optional view permission
* optional create route, label, keywords, and permission

Derive sidebar entries and command-palette navigate/create commands from this
registry. Keep icons in one platform icon vocabulary.

Introduce `PlatformModuleBoundary` to compose authorization and feature
availability using registry metadata. Lazy-load the boundary from route
definitions so access and settings implementation details do not become eager
router dependencies.

Do not eagerly query effective access from the application shell solely to
hide sidebar items. Direct routes and management actions remain protected, and
the command palette remains permission-aware when opened. This preserves the
M19 bundle boundary.

Create small semantic collection primitives for loading, retry, empty results,
summary metrics, filters, search, select controls, and segmented controls.
Features retain ownership of rows, tables, boards, virtualization, joins, and
business filtering.

Store collection interaction state in URL search parameters through a typed
`useUrlState` hook. Omit defaults and use replace navigation. Do not copy
server-like collections into URL state or Zustand.

---

### Alternatives Considered

#### Keep Navigation, Commands, and Routes Independently Defined

Rejected because adding a module required synchronized edits across unrelated
files and allowed permissions or feature requirements to drift.

#### Generate the React Router Tree Entirely from the Registry

Rejected because route-level lazy imports and domain-specific nested pages are
implementation details that do not belong in platform metadata.

#### Permission-Filter Sidebar Items with an Eager Access Query

Rejected because it increased the always-loaded application entry bundle.
Route and action boundaries provide the authoritative control.

#### Adopt a Full Data-Grid Abstraction

Rejected because tasks have list and board views, users use fixed-row
virtualization, and department and approval records have different semantics.
A shared grid would add indirection without a shared behavioral requirement.

#### Keep Filters in Component State

Rejected because refresh, bookmarking, sharing, and browser history would lose
the user's operational context.

#### Persist Filters in Zustand

Rejected because URL state is the canonical representation for navigable view
context and avoids a second synchronization path.

---

### Consequences

Positive:

* module discovery metadata has one typed source
* navigation and commands stay aligned as the platform grows
* direct-route authorization is consistent across core domains
* feature availability composes uniformly with permissions
* filtered collection views are bookmarkable and shareable
* repeated accessibility and recovery behavior is centralized
* domain-specific rendering and query ownership remain intact
* the shell avoids an eager RBAC dependency

Negative:

* route lazy imports still require explicit router entries
* sidebar links may remain visible to users who cannot enter the route
* registry create metadata currently models one primary create action
* URL changes occur while users type, although replace navigation avoids
  history pollution
* additional shared primitives require demonstrated semantic reuse

These trade-offs are accepted for platform consistency without introducing a
monolithic configuration or data-grid layer.

---

# ADR-030

## Title

Tenant Context as Repository Namespace and Query-Key Root

## Status

Accepted

---

### Context

M1–M22 assumed one Northstar organization. Durable browser keys, TanStack Query
keys, organization settings, access assignments, feature rollout, audit,
notifications, and offline state had no workspace ownership boundary.

Phase 2 requires realistic multi-tenancy, but adding `tenantId` manually to
every aggregate, service call, and component would create invasive coupling
and still allow cache or repository mistakes. Existing browser data also had
to become Northstar-owned without a destructive reset.

The frontend simulation cannot provide a genuine security boundary, but it
must model the ownership and isolation contracts expected from a backend.

---

### Decision

Model a global tenant catalog and explicit user-to-tenant memberships. Persist
one active tenant for the device session and expose it synchronously through a
tenant context plus a reactive Zustand workspace store.

Make tenant identity the repository namespace:

```text
enterprise-operations-tenant-{tenantId}-{domainKey}
```

`createVersionedStore` uses tenant scope by default and resolves the key for
every operation. Global stores must opt out explicitly. Treat repository
namespace as the tenant ownership of frontend aggregates rather than adding a
duplicated field to each record.

For Northstar only, when a scoped key is absent, inspect the historical
unscoped key. Validate and migrate it through the normal store contract, write
the scoped envelope, and remove the source only after success.

Make tenant identity the first segment of every feature query-key root:

```text
['tenant', tenantId, domain, ...segments]
```

On workspace switch, cancel active queries, update the tenant context, clear
the QueryClient, and navigate to the overview. Tenant-prefixed keys remain a
second isolation layer against late or stale results.

Keep the simulated user identity stable across workspaces, but give each
workspace its own user record, organization model, roles, assignments,
settings, and business data.

Extend feature rollout configuration with:

* all-member or administrator pilot audiences
* tenant-owned prerequisite keys
* one recursive availability evaluator used by navigation, routes, embedded
  gates, and commands

Do not represent this frontend isolation as authorization. A real backend must
derive tenant scope from authenticated membership and enforce it server-side.

---

### Alternatives Considered

#### Add `tenantId` to Every Domain Aggregate

Rejected for the frontend simulation because repository ownership already
provides the boundary, while duplicated tenant fields would require broad
schema and form churn. A backend may still include tenant columns internally.

#### Keep Shared Persistence and Filter Collections by Tenant

Rejected because one missed filter would leak records and large shared stores
would complicate migration, deletion, and diagnostics.

#### Use Separate QueryClient Instances per Tenant

Rejected because tenant-prefixed keys plus cancellation and cache clearing are
sufficient, easier to inspect, and map directly to future request cache keys.

#### Reload the Entire Application on Switch

Rejected because the platform can safely switch context in place and preserve
shell behavior without a disruptive hard reload.

#### Copy Legacy Data and Retain Unscoped Keys

Rejected because duplicate authoritative payloads would drift. The source is
removed only after a successful scoped write.

#### Treat Boolean Feature State as Sufficient

Rejected because realistic pilots need a target cohort and dependencies must
not expose a feature whose required capability is unavailable.

---

### Consequences

Positive:

* every durable domain has an explicit tenant ownership strategy
* cache and persistence identity use the same tenant context
* existing Northstar data upgrades without reset
* migration failure cannot destroy the legacy source
* Atlas provides an observable isolation test with distinct seed data
* settings, access, audit, notifications, offline work, and diagnostics are
  isolated automatically
* feature pilots and prerequisites behave consistently across entry points
* a future backend can replace repositories without redesigning the UI domain
  models

Negative:

* the active tenant is process-global for the current browser tab
* all repository operations must occur under the intended active context
* frontend-only isolation is not secure against browser manipulation
* stable user IDs across tenants are a simulation convenience
* workspace switching clears useful cached data from the previous workspace
* a multi-tab workspace model would require explicit synchronization policy

These trade-offs are accepted for a clear backend-compatible ownership model
with safe migration and strong local isolation.

---

# ADR-031

## Title

Resource-Neutral Saved Views with Canonical URL State

## Status

Accepted

---

### Context

Operational collections had begun to converge on URL-backed filtering, but
only global search supported named saved state. Tasks, approvals, users,
documents, and audit each owned different filters and rendering behavior.

Phase 2 requires reusable personal and shared views without introducing a
monolithic data-grid abstraction, duplicating query results in persistence, or
allowing a shared view to become an authorization mechanism.

---

### Decision

Represent a saved view as a tenant-owned, resource-neutral definition:

```text
resource
    + Record<string, string> canonical state
    + columns and density
    + owner, visibility, and default metadata
```

Keep filter and sort state canonical in React Router search parameters.
Features declare their own supported keys, defaults, columns, and semantics,
then use the shared view layer only to capture and reapply state.

Persist saved views in one versioned tenant-scoped store and root their query
keys in the active tenant. Permit personal and shared visibility. Defaults are
owner-specific even when a view is shared. Require `views.share` to create a
shared view or remove another owner's shared view. Applying a view continues
to execute the source domain's normal permission-aware query.

Use the same foundation for global search. Extend search requests with
multi-select entity types, status, update-window filtering, facets, and
relevance or recency sorting. Migrate prior named saved searches into personal
search views while retaining recent-query history separately.

---

### Alternatives Considered

#### Build One Generic Enterprise Data Grid

Rejected because the current collections have materially different semantic
rows, mobile behavior, virtualization needs, boards, timelines, and business
filters. Shared state capture does not require shared rendering.

#### Persist Filter State Separately in Every Feature

Rejected because ownership, visibility, defaults, migration, permissions, and
tenant isolation would drift across implementations.

#### Persist Materialized Result Sets

Rejected because saved results become stale, increase local storage pressure,
and risk exposing records after permissions change. Views persist intent only
and always execute current authorized services.

#### Store All View State Only in Local Component State

Rejected because views would not be bookmarkable, reliably shareable, or
compatible with browser navigation.

#### Make Shared Defaults Apply to Every User

Rejected because default workspace behavior is a personal preference. Shared
views are discoverable templates; each user chooses their own default.

---

### Consequences

Positive:

* six operational surfaces use one ownership and persistence model
* URLs remain the inspectable source of truth for filtering and sorting
* shared views cannot carry or reveal cached result records
* source services retain authorization and domain semantics
* incident and compliance queues can adopt the same contract incrementally
* legacy saved searches upgrade without a destructive reset

Negative:

* saved state uses string serialization and each feature must parse its keys
* renamed or removed filter keys will require saved-view migrations
* shared views currently use workspace-wide visibility rather than cohorts
* configurable columns are adopted only where the feature has meaningful
  optional fields
* the frontend simulation cannot enforce sharing policy against a malicious
  client; a backend must repeat tenant and permission checks

These trade-offs are accepted to gain consistent operational discovery without
flattening distinct business interfaces into a premature grid framework.

---

# Future Decisions

The following topics will likely require future ADRs:

* Authentication architecture
* Backend-enforced tenant and authorization context
* Multi-tab workspace synchronization
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
