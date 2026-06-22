# ROADMAP.md

## Project Vision

Enterprise Operations Platform is a production-grade frontend application that simulates a realistic internal business platform used by large organizations.

The application should evolve into a sophisticated operational ecosystem containing workflows, approvals, reporting, administration, analytics, notifications, audit trails, collaboration features, and enterprise-grade user experience.

The roadmap is intentionally long-term and should be continuously updated as the project evolves.

---

# Product and Architecture Audit

Audit completed June 22, 2026 after M1–M20.

## What Is Working Well

* Domain-oriented feature boundaries keep schemas, services, queries, and
  presentation ownership clear.
* Zod-validated transport boundaries, strict TypeScript, React Hook Form, and
  service-level business rules provide a credible backend-ready shape.
* Tasks, approvals, workflows, documents, collaboration, notifications, audit,
  reporting, analytics, offline synchronization, and diagnostics have meaningful
  behavior rather than placeholder screens.
* Permission gates, route-level lazy loading, bounded rendering, accessible
  chart alternatives, error boundaries, and runtime diagnostics establish a
  strong production-oriented foundation.
* The application builds and lints cleanly, and the initial application-owned
  bundle remains small after milestone M19.

## Highest-Value Gaps

* Product breadth is ahead of workflow coherence. Several modules are useful in
  isolation, but the platform lacks a small number of deep operating loops that
  connect intake, commitments, response, evidence, review, and learning.
* Organization and session assumptions are single-tenant and code-owned.
  Organization identity, data ownership, query isolation, rollout targeting,
  and workspace switching are not yet modeled.
* Shared UI primitives are too narrow for the number of management surfaces.
  Filters, empty states, form fields, tables, bulk actions, timelines, and
  detail-page sections repeat local patterns and can drift.
* Feature configuration supports only three modules and organization-wide
  enabled/pilot/disabled states. It has no cohorts, prerequisites, or consistent
  module registry shared by routing, navigation, commands, and administration.
* Saved searches exist, but operational lists do not share a saved-view model
  for filters, sorting, columns, density, ownership, and defaults.
* Audit coverage is projection-specific rather than platform-wide. Settings
  changes, documents, collaboration, identity, access, and future operational
  domains need one richer evidence model with correlation and change context.
* Browser persistence was unversioned and schema mismatch could silently reseed
  a store. M21 resolves this prerequisite before Phase 2 changes domain models.
* There is no automated test runner or regression suite. The current build and
  lint checks cannot protect business invariants, migrations, or critical
  cross-domain workflows.
* Accessibility has good foundations but lacks systematic focus, announcement,
  keyboard, contrast, and reduced-motion verification across repeated patterns.
* Performance work is strong at the bundle and DOM layers, but full-collection
  mock reads and cross-domain joins will need indexed/paginated service
  contracts as data volume and tenant scope grow.

## Phase 2 Product Direction

Phase 2 will deepen the platform around governed operational lifecycles:

```text
Demand or control obligation
    → owned work and service commitment
    → SLA monitoring and escalation
    → incident or exception response
    → evidence and audit history
    → review, reporting, and improvement
```

New breadth is accepted only when it strengthens this operating loop or the
platform foundations required to support it.

---

# Current Phase

## Phase 2 – Enterprise Operations at Scale

Status: ACTIVE

Active Milestone: M24 – Saved Views and Advanced Operational Search

Objective:

Turn the broad M1–M20 capability set into a coherent, evolvable enterprise
platform with consistent interaction patterns, tenant-aware boundaries, deep
operational workflows, governed evidence, and regression protection.

Previous Phase:

* Phase 1 – Foundation and Core Operations completed June 21, 2026
* M1–M20 delivered the shell, organization and access model, workflows,
  approvals, tasks, communication, audit, reporting, analytics, search,
  collaboration, documents, settings, productivity, offline resilience,
  performance hardening, and diagnostics

---

# Milestones

## M1 — Application Foundation

Status: Completed (June 20, 2026)

Features:

* Application shell
* Routing
* Navigation
* Layout structure
* Theme foundation
* Error boundaries
* Project architecture

Deliverables:

* Fully running application
* Base navigation experience
* Shared UI primitives

Delivered:

* Responsive application shell with desktop and mobile navigation
* Route hierarchy with module overview, settings, not-found, and recovery experiences
* TanStack Query, Zustand, React Router, and Tailwind provider foundations
* Persisted light, dark, and system theme preferences
* Shared button, badge, card, and page-header primitives
* Global and route-level error boundaries

---

## M2 — Operational Dashboard

Status: Completed (June 20, 2026)

Features:

* Executive dashboard
* KPI cards
* Activity widgets
* Recent actions
* Alerts panel
* Operational summaries

Deliverables:

* First business-facing experience
* Dashboard architecture
* Analytics foundation

Delivered:

* Typed and schema-validated operational dashboard snapshot
* Period-based KPI cards with trends and accessible sparklines
* Work intake and completion analytics with accessible chart data
* Service throughput, open-work, SLA, and health summaries
* Persisted alert acknowledgement workflow
* Recent cross-functional activity feed
* Query loading, refresh, validation, and recovery states

---

## M3 — Department Management

Status: Completed (June 20, 2026)

Features:

* Department list
* Department details
* Department creation
* Department editing
* Ownership structure

Deliverables:

* First complete CRUD workflow
* Shared entity management patterns

Delivered:

* Searchable and filterable department directory
* Department detail views with ownership, metadata, and reporting units
* React Hook Form and Zod create/edit workflows
* Persisted department repository with seeded enterprise data
* Unique name/code and circular hierarchy safeguards
* Guarded deletion that protects parent departments
* Query cache synchronization across list and detail routes

---

## M4 — User Management

Status: Completed (June 20, 2026)

Features:

* User directory
* User profiles
* User lifecycle management
* User assignment
* Team membership

Deliverables:

* Organization model
* Identity management foundation

Delivered:

* Searchable and filterable managed user directory
* User profiles with department, manager, direct-report, and team context
* React Hook Form and Zod create/edit workflows
* Explicit invited, active, suspended, and deactivated lifecycle states
* Guarded lifecycle transitions that protect active reporting relationships
* Unique business email and employee ID enforcement
* Persisted team catalog and cross-functional team membership
* Department ownership resolution to managed identities with snapshot fallback

---

## M5 — Roles & Permissions

Status: Completed (June 20, 2026)

Features:

* Roles
* Permissions
* Access policies
* Permission matrix

Deliverables:

* Security model
* Authorization foundation

Delivered:

* Fixed, typed permission catalog grouped by platform module
* Persisted custom and protected system roles
* Role create, edit, detail, assignment, and guarded deletion workflows
* Cross-role permission comparison matrix
* Additive effective-access calculation for managed identities
* User-profile role assignment management
* Reusable route authorization boundary and action permission gate
* Last-security-administrator and protected-system-role safeguards

---

## M6 — Workflow Engine

Status: Completed (June 20, 2026)

Features:

* Workflow definitions
* Workflow states
* Workflow transitions
* Workflow templates

Deliverables:

* Core business process framework

Delivered:

* Explicit workflow definitions grouped by stable process keys and versions
* Draft, active, and retired lifecycle with read-only published history
* Activation that retires the previous active process version
* Validated state graphs with initial, terminal, transition, and reachability rules
* Reusable approval and remediation templates
* Persisted workflow collection behind a validated mock API and feature service
* Workflow directory, process graph detail, version history, and draft editor
* Permission-protected workflow routes and management actions

---

## M7 — Approval System

Status: Completed (June 20, 2026)

Features:

* Approval chains
* Escalation paths
* Delegation
* Approval history

Deliverables:

* Realistic enterprise workflow behavior

Delivered:

* Persisted approval requests bound to a specific active workflow version
* Sequential reviewer chains with waiting, pending, approved, and rejected steps
* Request intake with priority, category, deadline, workflow, and reviewer order
* Reviewer decisions with required business comments and timestamps
* Controlled delegation that preserves original step ownership
* Overdue escalation to configured management targets
* Append-only submitted, decision, delegation, and escalation history
* Assigned, submitted, and organization-wide approval queues
* Approval detail experience with process state, chain, actions, and timeline
* Permission-protected approval routes and server-like query synchronization

---

## M8 — Task Management

Status: Completed (June 21, 2026)

Features:

* Operational tasks
* Assignments
* Priorities
* Due dates
* Status tracking

Deliverables:

* Day-to-day operations functionality

Delivered:

* Persisted operational tasks with explicit assignee and department ownership
* Backlog, in-progress, blocked, completed, and cancelled lifecycle
* Guarded lifecycle transitions with required operational notes
* Priority, due-date, completion, and overdue tracking
* Optional durable relationships to governed approval requests
* Append-only creation, update, reassignment, and status activity history
* Personal, department, and organization-wide work queues
* Search, filtering, list view, and status board over one query model
* Task create, edit, detail, reassignment, and status progression workflows
* Typed task permissions and direct-route authorization for management pages
* System-role capability synchronization for evolving code-owned permissions

---

## M9 — Notifications Center

Status: Completed (June 21, 2026)

Features:

* Notification inbox
* Notification preferences
* Event subscriptions
* Read/unread tracking

Deliverables:

* Cross-platform communication layer

Delivered:

* Persisted user-addressed notifications with actionable entity links
* Event projection from append-only approval and task activity
* Processed-event checkpoints that prevent duplicate or resurrected messages
* Approval assignment, decision, delegation, and escalation subscriptions
* Task assignment, reassignment, and lifecycle subscriptions
* Read, unread, and mark-all-read synchronization
* Header notification indicator with polling for new domain activity
* Filterable notification inbox with severity and category presentation
* In-app enablement, event subscriptions, and simulated digest preferences
* Processing-time preference evaluation for future event delivery
* Lazy notification reconciliation and route loading to protect shell bundles

---

## M10 — Audit Logging

Status: Completed (June 21, 2026)

Features:

* Entity history
* Change tracking
* Activity feed
* Audit viewer

Deliverables:

* Enterprise traceability

Delivered:

* Normalized immutable audit records projected from approval and task events
* Stable source-event checkpoints that prevent duplicate audit entries
* Actor, entity, action, timestamp, summary, and structured change attribution
* Protected cross-domain audit viewer with search and multi-dimensional filters
* Actor, entity type, action, and date-range filtering
* Deep links from audit records to originating business entities
* Reusable entity audit panels on approval and task detail experiences
* Polling-based eventual synchronization for newly appended domain events
* Typed `audit.view` permission and protected administrative route
* Lazy audit projection services that preserve route-level bundle ownership

---

## M11 — Reporting System

Status: Completed (June 21, 2026)

Features:

* Report builder
* Report templates
* Saved reports
* Export workflows

Deliverables:

* Business intelligence foundation

Delivered:

* Persisted saved report definitions with source, columns, filters, and ownership
* Code-owned task, approval, and audit report templates
* Validated source-specific column catalogs and reusable report builder
* Current-data execution adapters for tasks, approvals, and normalized audit
* Cross-domain identity, department, workflow, and approval display joins
* Searchable saved-report library and report detail execution experience
* Validated uniform tabular result contract across all supported sources
* Refreshable report runs with empty-result and loading states
* Permission-controlled CSV export with stable column ordering and escaping
* Separate `reports.view`, `reports.manage`, and `reports.export` capabilities
* Protected create/edit routes and guarded destructive report controls

---

## M12 — Analytics Platform

Status: Completed (June 21, 2026)

Features:

* Advanced dashboards
* Trend analysis
* Operational metrics
* Data visualization

Deliverables:

* Executive analytics experience

Delivered:

* Validated analytics filters, metrics, trends, and distribution contracts
* 30, 90, and 180-day operational analysis windows
* Department-level segmentation across task and approval activity
* Active work, overdue risk, completion, and approval cycle metrics
* Previous-period metric comparisons with favorable-direction semantics
* Weekly task intake, completion, and approval-decision trend series
* Task lifecycle, approval outcome, and department workload distributions
* Reusable accessible metric, line-chart, and distribution components
* Screen-reader tables and textual equivalents for every visualization
* Typed `analytics.view` capability and protected analytics route
* Lazy source aggregation that preserves domain and route bundle boundaries

---

## M13 — Global Search

Status: Completed (June 21, 2026)

Features:

* Cross-entity search
* Saved searches
* Search filters
* Search history

Deliverables:

* Enterprise discovery layer

Delivered:

* Permission-aware cross-domain index for departments, users, workflows,
  tasks, approvals, and saved reports
* Stable source adapters producing one validated typed result contract
* Deterministic relevance ranking for exact, prefix, title, description, and
  token matches
* Grouped results with status, metadata, and canonical entity links
* Entity-type and status filters with URL-addressable search state
* Persisted per-user recent searches with case-insensitive de-duplication
* Persisted named saved searches retaining query and filters
* Global Ctrl/Cmd+K keyboard entry point and responsive header launcher
* Keyboard-focus-friendly search form and result navigation
* Lazy source loading that keeps indexed domains out of the application shell

---

## M14 — Collaboration

Status: Completed (June 21, 2026)

Features:

* Comments
* Mentions
* Discussions
* Activity streams

Deliverables:

* Team collaboration capabilities

Delivered:

* Durable actor-attributed comments attached to tasks and approvals
* Top-level comments and one-level replies forming contextual discussions
* Active managed-user mention selection with recipient validation
* In-app mention notifications retaining canonical entity links
* Unified activity timelines combining business lifecycle events and comments
* Author-or-moderator edit and soft-delete lifecycle rules
* Explicit view, contribute, and moderate collaboration permissions
* One-time permission and notification-preference migrations
* Reusable validated collaboration schemas, query hooks, service, and mock API
* Seeded realistic discussions demonstrating mentions and replies

---

## M15 – Document Management

Status: Completed (June 21, 2026)

Features:

* Attachments
* Document metadata
* Versioning
* Linking

Deliverables:

* Content management foundation

Delivered:

* Persisted document aggregates with durable ownership, department,
  classification, retention category, and lifecycle metadata
* Draft, published, and archived lifecycle with guarded transitions
* Immutable attachment versions retaining file metadata, attribution, change
  summary, timestamps, content, and SHA-256 identity
* Explicit PDF, image, CSV, and text attachment allowlist
* 750 KB per-version and 3 MB per-document browser storage constraints
* Validated links between documents and task or approval records
* Reusable linked-document panels on task and approval detail experiences
* Searchable document library, governed intake, version history, downloads,
  lifecycle controls, and relationship management
* Separate view, manage, and download permissions with system-role migration
* Lazy-loaded document routes and runtime-validated persistence boundaries

---

## M16 – Settings Platform

Status: Completed (June 21, 2026)

Features:

* User preferences
* Organization settings
* Feature configuration
* Administrative settings

Deliverables:

* Platform administration

Delivered:

* Validated per-user workspace preferences for theme, density, time zone, date
  format, and reduced motion
* Migration of the legacy persisted theme into the new user-owned settings
  record
* Governed organization policy for branding, support contact, calendar
  defaults, fiscal year, and records retention
* Organization-wide enabled, pilot, and disabled feature rollout states
* Runtime feature availability applied to navigation, direct routes, and
  embedded collaboration and document surfaces
* Application-shell consumption of organization branding, workspace density,
  theme, and reduced-motion preferences
* Append-only organization and feature configuration change history
* Separate settings view and administration permissions with role migration
* Responsive personal and administrative settings workspace
* Runtime-validated mock persistence and TanStack Query synchronization

---

## M17 – Command Palette

Status: Completed (June 21, 2026)

Features:

* Global actions
* Keyboard navigation
* Quick search
* Power-user workflows

Deliverables:

* Productivity layer

Delivered:

* Global Ctrl/Cmd+K command palette replacing the former search-only shortcut
* Typed code-owned registry for navigation and high-frequency create actions
* Permission filtering before commands are presented or executable
* Feature-rollout filtering for analytics and document commands
* Deterministic command matching across labels, descriptions, and keywords
* Lazy permission-aware entity search after a meaningful query is entered
* Direct entity navigation plus a full-search handoff retaining query context
* Arrow-key navigation, Enter execution, Escape dismissal, and focus trapping
* Accessible dialog, combobox, active-descendant, and listbox semantics
* Responsive header launcher with keyboard guidance and no new dependency
* Search service retained behind a dynamic chunk outside the shell bundle

---

## M18 – Offline Support

Status: Completed (June 21, 2026)

Features:

* Cached experiences
* Synchronization queues
* Conflict handling

Deliverables:

* Resilience improvements

Delivered:

* Browser connectivity tracking with automatic online and offline events
* Explicit work-offline control for deterministic resilience testing
* Persisted validated mutation queue for task status transitions
* Immediate optimistic projection of queued transitions into task list and
  detail queries
* Multiple offline task transitions compacted into one intent chain per task
* Automatic reconnect replay and manual synchronization controls
* Pending, retry, conflict, and synchronized status in the application shell
* Optimistic task badges and conflict-aware status controls
* Version-based conflict detection using the authoritative `updatedAt` value
* Explicit use-remote and keep-local conflict resolution
* Local-intent rebasing over the latest remote task when keeping local changes
* Browser-persisted task reads remain available while disconnected
* TanStack Query network behavior delegated to the platform offline layer

---

## M19 – Advanced Performance

Status: Completed (June 21, 2026)

Features:

* Virtualized tables
* Advanced caching
* Lazy loading
* Optimized rendering

Deliverables:

* Enterprise-scale performance

Delivered:

* Reusable fixed-row virtualization hook with overscan and scroll clamping
* Virtualized managed-user directory rendering only the visible row window
* Sticky accessible table headers and complete row-count/index semantics
* Bounded 50-record audit rendering with incremental disclosure
* Paginated 50-row report presentation while preserving full CSV export
* Previous report result retained during background refresh
* Explicit longer stale and garbage-collection windows for stable identity,
  team, and report execution data
* Async shell chunks for command palette, notifications, and synchronization
* Stable manual vendor chunks for React/router, query, forms, validation,
  state, icons, and remaining third-party code
* Application-owned entry chunk reduced from approximately 356 KB to 33 KB
  uncompressed in the production build
* No virtualization or table dependency added

---

## M20 – Production Hardening

Status: Completed (June 21, 2026)

Features:

* Error recovery
* Monitoring views
* System diagnostics
* Operational tooling

Deliverables:

* Mature platform experience

Delivered:

* Protected system diagnostics workspace with dedicated view and recovery
  permissions
* Sanitized browser-local incident capture for global render, route,
  unhandled error, and unhandled rejection failures
* Bounded 100-record runtime incident retention with route and stack context
* Runtime stability, persistence, synchronization, and connectivity health
  checks
* Browser persistence availability probe and per-store footprint inspection
  without exposing stored business payloads
* Query cache, active, stale, fetching, mutation, and error summaries
* Downloadable JSON support bundle with runtime and health metadata
* Safe refresh, queued-change retry, incident cleanup, and cache-reload controls
* Recovery controls independently protected by `diagnostics.manage`
* Diagnostics-aware global and route error recovery boundaries
* Telemetry failure containment preventing recursive unhandled incidents

---

## M21 – Versioned Persistence and Migration Foundation

Status: Completed (June 22, 2026)

Objective:

Make local data evolution explicit and safe before Phase 2 introduces richer
domain models and tenant boundaries.

Delivered:

* Reusable typed versioned-store abstraction over the browser persistence
  adapter
* Schema-version envelopes with update timestamps for every durable domain
  store
* Automatic in-place wrapping of valid M1–M20 legacy payloads without data loss
* Ordered migration hooks for future schema versions
* Dedicated legacy transformation support for historical notification
  preferences, settings theme state, and seeded role capability additions
* Strict handling of unsupported, invalid, or newer persisted schemas without
  silently overwriting the original payload
* Seed initialization only for genuinely missing stores
* Validated writes at the persistence boundary
* Diagnostics metadata showing versioned versus legacy stores and schema
  versions
* Removal of one-off permission migration marker behavior in favor of
  deterministic legacy preparation and code-owned system-role synchronization

---

## M22 – Platform Experience System

Status: Completed (June 22, 2026)

Objective:

Establish shared, accessible patterns for dense enterprise workspaces before
adding more operational domains.

Delivered:

* Typed code-owned platform module registry containing canonical route, label,
  icon, navigation group, search keywords, feature dependency, view permission,
  and optional create action
* Sidebar navigation and command-palette commands derived from the same module
  definitions
* Shared platform icon vocabulary used by shell navigation and commands
* Reusable module boundary composing route authorization and feature
  availability from registry metadata
* Consistent view and management boundaries across overview, analytics, tasks,
  departments, users, access, workflows, approvals, reports, documents, audit,
  diagnostics, and settings routes
* Direct-route protection for department, user, workflow, task, report, and
  document create/edit pages
* Permission-aware department and user management actions in list and detail
  experiences
* Shared collection loading, retry, empty-state, filter-bar, search-field,
  select-filter, segmented-control, and summary-metric patterns
* Task, approval, user, and department workspaces migrated to the shared
  collection patterns
* URL-addressable search, queue, status, department, and view-mode state using
  replace navigation so filtered workspaces can be bookmarked and shared
* Accessible pressed-state semantics for queue controls and live status
  semantics for empty and error states
* Mobile navigation dialog semantics, initial focus, focus trapping, Escape
  dismissal, scroll containment, and focus restoration
* Route and collection consolidation removed substantially more duplicated code
  than it introduced

Deferred Deliberately:

* Generic form-field, timeline, detail-section, table, and pagination wrappers
  will be introduced only when multiple consumers share the same semantic
  behavior; current domain-specific implementations remain clearer than a
  styling-only abstraction
* Sidebar items remain feature-aware but are not permission-filtered at startup,
  avoiding an eager access-domain dependency in the application shell; direct
  routes and actions remain protected, and command discovery is permission-aware

---

## M23 – Tenant and Workspace Boundaries

Status: Completed (June 22, 2026)

Objective:

Model organization membership and isolate all server-like data by active
workspace without pretending frontend controls are a security boundary.

Delivered:

* Validated tenant, membership, role, active-workspace, tenancy-store, and
  workspace-snapshot contracts
* Global tenancy catalog with Northstar Group and Atlas Services memberships
  for the simulated current identity
* Persisted active-workspace selection with legacy string upgrade to a
  versioned global envelope
* Accessible workspace switcher in desktop and mobile navigation
* Switch workflow that cancels in-flight queries, changes active context,
  clears cached server-like state, and returns to the canonical overview
* Dynamic tenant persistence namespace applied by the versioned-store boundary
  to every durable domain store
* Automatic first-read migration of existing unscoped M1–M22 stores into the
  Northstar namespace, with source removal only after successful validation and
  write
* Global-scope exception reserved for the tenancy catalog; transient UI state
  remains intentionally device-global
* Tenant-prefixed TanStack Query roots across dashboard, organization, access,
  workflows, approvals, tasks, communication, audit, reporting, analytics,
  search, documents, settings, offline synchronization, diagnostics, and
  command discovery
* Tenant-aware organization settings, personal preferences, roles,
  assignments, audit projections, notifications, search preferences, offline
  operations, diagnostics incidents, and acknowledged alerts
* Distinct Atlas organization, identities, department, access assignments,
  dashboard snapshot, and empty operational stores proving namespace isolation
* Generic organization identifiers replacing the former Northstar literal
* Feature rollout policy with enabled, pilot, and disabled states, pilot
  audiences for all members or administrators, and recursive feature
  prerequisites
* Shared feature availability evaluation across shell navigation, routes,
  embedded feature gates, and command discovery
* Settings schema migration from feature configuration version one to version
  two without resetting existing Northstar policy
* Diagnostics metadata identifying global and tenant-owned persistence entries

Ownership Strategy:

* Business aggregates retain backend-ready domain shapes and inherit tenant
  ownership from their repository namespace
* TanStack Query keys carry the same tenant identity as persistence
* Global data is limited to tenant membership/catalog context and device-level
  shell state
* Frontend isolation models backend boundaries but is not represented as a
  security boundary

---

## M24 – Saved Views and Advanced Operational Search

Status: Active

Objective:

Create one reusable discovery model for repeated operational work.

Planned Scope:

* Shared filter and sort expression contracts
* Personal and shared saved views with ownership, defaults, and visibility
* Configurable columns and density for high-volume queues
* Faceted search, recent filters, and cross-domain result refinement
* Permission-aware view sharing and canonical URL state

Exit Criteria:

* Tasks, approvals, audit, users, documents, and future incident queues consume
  the same saved-view foundation
* Saved views survive reload and can be shared without exposing unauthorized
  records

---

## M25 – Service Catalog and SLA Commitments

Status: Planned

Objective:

Give operational work explicit service ownership, targets, calendars, and
breach semantics.

Planned Scope:

* Service catalog, owners, support tiers, and operating calendars
* Response and resolution targets by priority and request type
* SLA clocks with pause/resume rules and warning thresholds
* Breach escalation and reason capture
* Task and approval linkage, dashboards, saved views, audit, and reporting

Exit Criteria:

* SLA state is derived consistently from governed service policy and lifecycle
  events
* Breaches and exceptions are explainable, attributable, and reportable

---

## M26 – Incident Management and Response

Status: Planned

Objective:

Deliver a complete incident lifecycle built on service commitments rather than
an isolated incident list.

Planned Scope:

* Incident intake, severity, affected services, impact, and commander ownership
* Triage, investigation, mitigation, monitoring, resolution, and closure states
* Response team roles, tasks, communications, and evidence
* SLA-aware acknowledgements and escalation
* Actor-attributed incident timeline and stakeholder updates
* Post-incident review with actions linked to operational tasks

Exit Criteria:

* One incident can be followed from declaration through review and remediation
* Incident outcomes feed audit, search, notifications, analytics, and reporting

---

## M27 – Compliance Review Cycles

Status: Planned

Objective:

Model recurring control reviews as evidence-backed operational workflows.

Planned Scope:

* Control catalog, owners, review frequency, and applicability
* Review-cycle generation and assignment
* Evidence requests linked to governed documents and operational records
* Findings, remediation tasks, exceptions, and approval
* Due, overdue, and escalation policy
* Reviewer attestation and immutable cycle history

Exit Criteria:

* A review cycle preserves obligation, evidence, decisions, findings, and
  remediation in one traceable lifecycle

---

## M28 – Unified Audit and Evidence Graph

Status: Planned

Objective:

Evolve audit from selected event projections into a platform-wide evidence
model.

Planned Scope:

* Correlation, causation, tenant, actor, entity, and request context
* Field-level before/after changes for mutable aggregates
* Coverage for identity, access, documents, collaboration, settings, SLA,
  incidents, and compliance
* Evidence links connecting records, documents, approvals, and review outcomes
* Retention policy execution and export manifests

Exit Criteria:

* Critical mutations across all governed domains produce a normalized audit
  record
* Investigators can reconstruct a business outcome without reading unrelated
  storage structures

---

## M29 – Automated Testing and Reliability Strategy

Status: Planned

Objective:

Protect business invariants and Phase 2 workflows with a proportionate test
pyramid.

Planned Scope:

* Vitest and Testing Library foundation
* Unit tests for schemas, migrations, state transitions, SLA clocks, and
  permission evaluation
* Service-level integration tests using deterministic persistence and time
* Critical user-flow tests for approvals, incidents, compliance, and tenant
  switching
* Accessibility assertions for shared platform components
* CI-quality build, lint, test, and focused coverage thresholds

Exit Criteria:

* Critical business workflows and all persistence migrations have automated
  regression protection
* Tests run deterministically without relying on production seed side effects

---

## M30 – Scale, Accessibility, and Production Readiness

Status: Planned

Objective:

Harden the completed Phase 2 operating loops for larger data volumes and
broader enterprise use.

Planned Scope:

* Paginated/indexed mock API contracts and query cancellation
* Performance budgets and route-level bundle monitoring
* Systematic WCAG-focused keyboard, focus, announcement, contrast, and motion
  review
* Localization-ready formatting and time-zone-safe SLA calculations
* Data export/import recovery, migration observability, and support runbooks
* Failure injection for latency, authorization, storage, and synchronization

Exit Criteria:

* Core workflows remain usable under high record counts, degraded conditions,
  keyboard-only operation, and reduced-motion preferences
* Phase 2 has documented operational and recovery expectations

---

# Cross-Cutting Initiatives

These may occur throughout multiple milestones.

## Design System

Phase 2 Direction:

* Shared patterns are introduced through M22 and adopted incrementally
* New primitives require semantic and keyboard contracts, not visual styling
  alone
* Domain-specific presentation remains inside features when abstraction would
  erase meaningful workflow differences

---

## Developer Experience

Phase 2 Direction:

* Testing infrastructure is delivered in M29 after persistence and shared UI
  seams are stable
* Build and lint remain mandatory on every milestone
* Code generation is introduced only where a stable repeated contract exists

---

## Data Modeling

Phase 2 Direction:

* Tenant ownership and service policy become explicit
* Lifecycle events remain append-only where attribution matters
* Derived SLA, analytics, search, notification, and audit views do not become
  competing sources of truth

---

# Backlog

Future opportunities intentionally deferred beyond Phase 2:

* Localization
* External notification channels
* Advanced exports
* Bulk operations
* Workflow templates marketplace
* Organizational hierarchy visualization
* Calendar integrations
* Operational scheduling
* Knowledge base
* AI-assisted workflows

---

# Update Rules

After each iteration:

1. Mark completed milestones.
2. Update active milestone.
3. Add newly discovered work.
4. Remove obsolete work.
5. Maintain realistic priorities.

This roadmap must always represent the current intended direction of the project.
