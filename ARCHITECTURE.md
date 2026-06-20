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

Feature directories will be introduced with the first domain milestone. Route
pages remain composition-focused and should delegate business behavior to those
feature modules as they are added.

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

---

# Security Assumptions

Current version:

* frontend-only
* simulated authentication
* simulated authorization

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
