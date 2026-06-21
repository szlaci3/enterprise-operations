# ROADMAP.md

## Project Vision

Enterprise Operations Platform is a production-grade frontend application that simulates a realistic internal business platform used by large organizations.

The application should evolve into a sophisticated operational ecosystem containing workflows, approvals, reporting, administration, analytics, notifications, audit trails, collaboration features, and enterprise-grade user experience.

The roadmap is intentionally long-term and should be continuously updated as the project evolves.

---

# Current Phase

## Phase 2 — Core Operations

Status: ACTIVE

Active Milestone: M16 – Settings Platform

Objective:

Consolidate user preferences, organization settings, feature configuration,
and administrative controls into a governed settings platform.

Success Criteria:

* Personal and organization settings have explicit ownership
* Administrative changes use typed validation and permissions
* Configuration remains compatible with future backend persistence
* Settings surfaces are coherent, searchable, and accessible

Previous Phase:

* Phase 1 — Foundation completed June 20, 2026
* Application shell, query layer, domain structure, mock API infrastructure,
  local persistence, and the first business-facing dashboard are operational

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

Status: Next

Features:

* User preferences
* Organization settings
* Feature configuration
* Administrative settings

Deliverables:

* Platform administration

---

## M17 — Command Palette

Status: Planned

Features:

* Global actions
* Keyboard navigation
* Quick search
* Power-user workflows

Deliverables:

* Productivity layer

---

## M18 — Offline Support

Status: Planned

Features:

* Cached experiences
* Synchronization queues
* Conflict handling

Deliverables:

* Resilience improvements

---

## M19 — Advanced Performance

Status: Planned

Features:

* Virtualized tables
* Advanced caching
* Lazy loading
* Optimized rendering

Deliverables:

* Enterprise-scale performance

---

## M20 — Production Hardening

Status: Planned

Features:

* Error recovery
* Monitoring views
* System diagnostics
* Operational tooling

Deliverables:

* Mature platform experience

---

# Cross-Cutting Initiatives

These may occur throughout multiple milestones.

## Design System

Potential Enhancements:

* Component library
* Consistent spacing
* Typography system
* Accessibility improvements

---

## Developer Experience

Potential Enhancements:

* Shared utilities
* Testing infrastructure
* Code generation
* Development tooling

---

## Data Modeling

Potential Enhancements:

* Richer entity relationships
* Derived data
* Aggregations
* Simulated backend behaviors

---

# Backlog

Future opportunities not yet prioritized:

* Feature flags
* Multi-tenancy
* Localization
* Dark mode
* Notification channels
* Advanced exports
* Bulk operations
* Workflow templates marketplace
* Organizational hierarchy visualization
* Calendar integrations
* Operational scheduling
* SLA tracking
* Incident management
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
