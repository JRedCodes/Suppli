# Suppli — Backend Architecture

## Purpose of This Document
This document defines Suppli’s backend architecture, service boundaries, and technical responsibilities.
The backend is designed to be secure, predictable, scalable, and resistant to misuse as features expand.

Clarity and correctness are prioritized over abstraction and cleverness.

---

## Architectural Principles
1. Single source of truth — Supabase (Postgres) is authoritative  
2. Stateless API layer — Express handles requests, not business state  
3. Explicit validation — no trusting client input  
4. Separation of concerns — routing, domain logic, persistence, side effects  
5. Fail safely — partial success over total failure  
6. Multi-tenant by default — all data scoped to a business  

---

## High-Level System Overview

### Core Components
- Frontend: React + Vite  
- API Layer: Express (Node.js)  
- Database: Supabase (Postgres + Row Level Security)  
- Authentication: Supabase Auth  
- File Storage: Supabase Storage  
- Payments: Stripe  
- Background Processing (later): Edge Functions or job workers  
- Observability: Logging + error tracking  

---

## API Layer (Express)

### Responsibilities
- Request validation
- Authentication verification
- Authorization enforcement
- Domain orchestration
- Response shaping
- Error handling

### Non-Responsibilities
- UI state management
- Persistent business state
- Data modeling logic
- Long-running background tasks

---

## Suggested Server Folder Structure

server/
src/
app.ts
server.ts
config/
routes/
controllers/
services/
domain/
validators/
middleware/
jobs/
errors/
lib/

yaml
Copy code

### Folder Responsibilities
- routes: HTTP route definitions only  
- controllers: Request/response handling  
- services: Side effects and orchestration  
- domain: Core business logic (orders, learning, formatting)  
- validators: Zod schemas  
- middleware: Auth, tenant scoping, rate limiting  
- jobs: Background and async work  
- errors: Centralized error definitions  
- lib: Utilities and integrations  

---

## Domain Layer

The domain layer contains:
- Order generation logic  
- Confidence evaluation  
- Learning loop updates  
- Vendor formatting rules  

Rules:
- Domain logic must be deterministic  
- Domain functions accept explicit inputs  
- Domain code never accesses HTTP or database clients directly  

---

## Database Access Strategy
- Supabase client used as the data access layer  
- Explicit SQL or query builder usage  
- No implicit ORM behavior  

Rules:
- Every query includes business_id  
- RLS enforces tenant isolation  
- All data access wrapped with error handling  

---

## Multi-Tenancy Model

### Tenant Identifier
- business_id is the primary tenant boundary  

### Enforcement Layers
- Supabase Row Level Security  
- API middleware verifies business membership  
- Domain logic assumes tenant correctness  

Cross-tenant queries are never allowed.

---

## Authentication & Authorization

### Authentication
- Managed by Supabase Auth  
- JWT attached to every API request  
- Tokens validated on each request  

### Authorization
Role-based access control:
- Owner  
- Manager  
- Staff  

Authorization checks occur in:
- API middleware  
- Domain logic when required  

---

## Validation Strategy

### Input Validation
- All inputs validated using Zod  
- Validation occurs before domain execution  
- Validation errors are user-readable  

### Output Validation
- Domain outputs are shaped explicitly  
- Prevents leaking internal structures  

---

## Error Handling

### Error Categories
- Validation errors  
- Authorization errors  
- Domain rule violations  
- External service failures  

### Standard Error Shape
{
"error": {
"code": "ORDER_INVALID_STATE",
"message": "This order must be reviewed before approval."
}
}

yaml
Copy code

Rules:
- No stack traces in responses  
- Errors logged internally  
- Messages remain human-readable  

---

## Background & Async Processing

Used for:
- Invoice parsing  
- Large file imports  
- Scheduled order generation (later)  

Rules:
- Jobs must be idempotent  
- Failures must be retryable  
- User-visible state changes are explicit  

---

## File Handling

Used for:
- Sales data uploads  
- Promotion uploads  
- Invoice uploads  

Rules:
- Validate file type and size  
- Store files in Supabase Storage  
- Store metadata in Postgres  
- Files are always business-scoped  

---

## Payments (Stripe)

- Stripe manages subscriptions and billing  
- Suppli stores subscription state only  
- Feature gating enforced server-side  

Stripe webhooks:
- Verified signatures  
- Idempotent handlers  
- Logged outcomes  

---

## Observability & Monitoring

### Logging
- Request lifecycle logs  
- Domain events  
- Error logs  

### Error Tracking
- Centralized (e.g., Sentry)  
- Tagged by business_id  

### Metrics (Later)
- Order generation success rate  
- Edit frequency  
- Invoice mismatch rates  

---

## MVP vs Later

### MVP
- Single API service  
- Manual background execution  
- Basic logging  

### Later
- Job queues  
- Horizontal scaling  
- Caching layers  
- Read replicas  

---

## Success Criteria
- No cross-tenant data leaks  
- Predictable API behavior  
- Clear debugging paths  
- Easy expansion without rewrites  

---

## Summary
Suppli’s backend exists to:
- Enforce rules  
- Protect data  
- Enable safe automation  
- Scale without architectural rewrites  

If a shortcut compromises safety or clarity, it should not be taken.