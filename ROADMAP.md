# ROADMAP.md

## Project Vision

Enterprise Operations Platform is a production-grade frontend application that simulates a realistic internal business platform used by large organizations.

The application should evolve into a sophisticated operational ecosystem containing workflows, approvals, reporting, administration, analytics, notifications, audit trails, collaboration features, and enterprise-grade user experience.

The roadmap is intentionally long-term and should be continuously updated as the project evolves.

---

# Current Phase

## Phase 2 — Core Operations

Status: ACTIVE

Active Milestone: M9 — Notifications Center

Objective:

Establish a cross-platform notification inbox with event-driven messages,
read state, preferences, and subscriptions to operational activity.

Success Criteria:

* Notifications are explicit persisted entities addressed to managed users
* Domain events can produce actionable notifications
* Read and unread state is synchronized across notification surfaces
* Users can manage event and delivery preferences
* Notifications link back to the originating business record

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

Status: Next

Features:

* Notification inbox
* Notification preferences
* Event subscriptions
* Read/unread tracking

Deliverables:

* Cross-platform communication layer

---

## M10 — Audit Logging

Status: Planned

Features:

* Entity history
* Change tracking
* Activity feed
* Audit viewer

Deliverables:

* Enterprise traceability

---

## M11 — Reporting System

Status: Planned

Features:

* Report builder
* Report templates
* Saved reports
* Export workflows

Deliverables:

* Business intelligence foundation

---

## M12 — Analytics Platform

Status: Planned

Features:

* Advanced dashboards
* Trend analysis
* Operational metrics
* Data visualization

Deliverables:

* Executive analytics experience

---

## M13 — Global Search

Status: Planned

Features:

* Cross-entity search
* Saved searches
* Search filters
* Search history

Deliverables:

* Enterprise discovery layer

---

## M14 — Collaboration

Status: Planned

Features:

* Comments
* Mentions
* Discussions
* Activity streams

Deliverables:

* Team collaboration capabilities

---

## M15 — Document Management

Status: Planned

Features:

* Attachments
* Document metadata
* Versioning
* Linking

Deliverables:

* Content management foundation

---

## M16 — Settings Platform

Status: Planned

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
