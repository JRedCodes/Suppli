# Suppli

> Intelligent ordering system for small businesses that generates accurate, vendor-ready orders with conservative guardrails and continuous learning.

## Overview

Suppli helps small businesses generate accurate orders using sales signals and promotions, with guardrails that keep users in control while accuracy improves over time.

## Project Structure

```
Suppli/
├── CursorContext/          # Architecture and design documentation
│   ├── BackendArchitecture&Security/
│   ├── CoreDomainSpecs/
│   ├── Frontend/
│   ├── FutureExpansion/
│   ├── Invoice&FeedbackLoop/
│   ├── onboarding&dataimport/
│   ├── Ops&Quality/
│   ├── Payments&Subs/
│   └── Product&UX/
├── IMPLEMENTATION_GUIDE.md  # Master implementation plan (FOLLOW THIS)
├── server/                  # Backend (Express + TypeScript + Supabase)
└── frontend/                # Frontend (React + Vite + TypeScript)
```

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account (for payments)

### Setup Instructions
See `IMPLEMENTATION_GUIDE.md` for detailed setup instructions.

## Documentation

All architecture and design documentation is in `CursorContext/`:

- **Backend**: `BackendArchitecture&Security/`
- **Frontend**: `Frontend/`
- **Domain Logic**: `CoreDomainSpecs/`
- **Product Vision**: `Product&UX/`

## Implementation

**Follow `IMPLEMENTATION_GUIDE.md` religiously.** This guide includes:
- Phased development approach
- User testing checkpoints
- Refactoring phases
- Documentation requirements
- Git workflow

## Development Workflow

1. Read `IMPLEMENTATION_GUIDE.md`
2. Work through phases sequentially
3. Test at each checkpoint
4. Refactor regularly
5. Document everything

## Key Principles

1. **Trust first** — Conservative by default
2. **User control** — No surprises
3. **Progressive automation** — Earned through usage
4. **Minimal setup** — Ask only what's needed
5. **Explainability** — Every recommendation has a reason

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- Supabase (Postgres + Auth + Storage)
- Stripe (Payments)

### Frontend
- React + TypeScript
- Vite
- TanStack Query
- Tailwind CSS
- shadcn/ui

## Status

🚧 **In Development** — Following `IMPLEMENTATION_GUIDE.md`

**Current Phase:** Phase 5.4 - Orders Feature UI (In Progress)

**Completed:**
- ✅ Phases 0-4: Project setup, database, backend core, external services
- ✅ Phase 5.1-5.3: Frontend auth, UI components, data fetching
- ✅ Phase 5.4: Orders feature UI (draft system, delete functionality, order management)
- ✅ Phase 5.5: Vendors and Products management UI

**In Progress:**
- Order management refinements
- Testing and bug fixes

**Next:**
- Phase 5.6: Onboarding Flow

## License

[To be determined]
