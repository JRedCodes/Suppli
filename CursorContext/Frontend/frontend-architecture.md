# Suppli — Frontend Architecture

## Purpose of This Document
This document defines Suppli’s frontend architecture, structure, and engineering conventions.
The goal is to ensure the frontend is **predictable, accessible, scalable, and easy for Cursor (and humans) to reason about** as the product grows.

The frontend reflects system state — it does not invent it.

---

## Core Principles
1. **Clarity over cleverness**
2. **Server is the source of truth**
3. **Composition over complexity**
4. **Accessibility by default**
5. **Consistency across all pages**

---

## Tech Stack (Confirmed)

- React (with TypeScript)
- Vite
- React Router (or TanStack Router)
- TanStack Query (data fetching & caching)
- Tailwind CSS
- shadcn/ui (Radix primitives)
- React Hook Form + Zod
- Supabase client (auth + storage only)

No global state manager (Redux, Zustand) in MVP unless clearly justified.

---

## Application Structure

### High-Level Folder Structure

```text
src/
  app/
  components/
  features/
  layouts/
  pages/
  hooks/
  lib/
  services/
  styles/
  types/
Folder Responsibilities
app/
App bootstrap

Router setup

Query client

Auth provider

Global error boundaries

components/
Reusable, feature-agnostic UI components.

Examples:

Button

Input

Table

Modal

Badge

Alert

Rules:

No business logic

No data fetching

Pure presentation + accessibility

features/
Feature-scoped logic and UI.

Examples:

orders/

vendors/

invoices/

onboarding/

Each feature may contain:

text
Copy code
components/
hooks/
services/
types.ts
Rules:

Feature logic lives here

Feature code may call API services

Features do not depend on each other directly

pages/
Route-level components.

Rules:

One page = one route

Pages compose features and layouts

Minimal logic

layouts/
Structural UI wrappers.

Examples:

AppLayout (sidebar + top bar)

OnboardingLayout

AuthLayout

Layouts handle:

Navigation

Page scaffolding

Role-based UI visibility

hooks/
Shared hooks.

Examples:

useAuth

useBusiness

useCapabilities

useDebounce

Rules:

Hooks may compose other hooks

Hooks do not render UI

services/
API clients and integrations.

Examples:

apiClient.ts

ordersService.ts

vendorsService.ts

Rules:

All API calls centralized

No fetch logic inside components

Typed request/response contracts

lib/
Utilities and helpers.

Examples:

date formatting

number formatting

feature flag helpers

styles/
Global styles

Tailwind config

CSS variables / tokens

types/
Global shared TypeScript types.

Rules:

Domain-aligned

Avoid duplicating backend types when possible

Prefer API-derived types

Routing Strategy
Routes defined centrally

Protected routes require auth + business context

Onboarding routes use separate layout

Example:

text
Copy code
/orders
/orders/:orderId
/vendors
/invoices
/settings
Data Fetching Strategy
TanStack Query Rules
Query keys are explicit and stable

Mutations invalidate relevant queries

Optimistic updates only when safe

Rules:

No data fetching in components without Query

Errors handled centrally

Auth & Business Context
Auth
Supabase handles auth state

JWT refreshed automatically

Auth provider wraps app

Business Context
User explicitly selects active business

business_id stored in context

Passed to API via headers

No implicit business inference.

Feature Gating & Capabilities
Frontend consumes capabilities object from backend.

Rules:

UI disables gated actions

Explanations always shown

Frontend never assumes access

Forms & Validation
React Hook Form for state

Zod schemas shared with backend where possible

Inline validation errors

Rules:

Never submit invalid forms

Never rely on backend errors for UX

Accessibility Requirements
Keyboard navigation everywhere

Proper semantic HTML

ARIA only when needed

Focus management for modals and dialogs

Respect prefers-reduced-motion

Accessibility is not optional.

Error Handling
UI Errors
Inline errors for forms

Page-level errors for blocking issues

Toasts for non-blocking confirmations

Global Errors
Error boundary at app root

Friendly fallback UI

Retry guidance when possible

Performance Guidelines
Lazy-load routes where appropriate

Avoid unnecessary re-renders

Memoize expensive components cautiously

Keep tables virtualized if large

MVP vs Later
MVP
Single app bundle

Simple routing

Minimal code-splitting

Later
Advanced code-splitting

Offline support

PWA enhancements

Success Criteria
Frontend is easy to reason about

New features slot into existing patterns

Accessibility issues are rare

UI never contradicts backend state

Summary
Suppli’s frontend architecture exists to:

Reflect backend truth

Enable fast, safe iteration

Maintain accessibility and trust

If frontend logic becomes complex, it likely belongs on the server.
If UI behavior surprises users, architecture must be revisited.