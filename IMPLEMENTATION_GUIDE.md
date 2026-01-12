# Suppli — Implementation Guide

## Purpose of This Document
This is the **master implementation plan** that will be followed religiously. It includes:
- Phased development with user testing checkpoints
- Dedicated refactoring/optimization phases
- Documentation requirements throughout
- Git workflow and branching strategy
- Clear handoff points for user involvement

**This guide is a living document** — it will be updated as we progress.

---

## Implementation Philosophy

### Core Principles
1. **User involvement at every phase** — You test and provide feedback before moving forward
2. **Refactoring is not optional** — Dedicated phases for code quality
3. **Documentation as we go** — Never leave undocumented code
4. **Small, testable chunks** — Each phase delivers working functionality
5. **Git discipline** — Clean commits, meaningful branches, regular pushes

---

## Git Workflow & Branching Strategy

### Branch Naming Convention
- `main` — Production-ready code only
- `feature/<name>` — New features
- `refactor/<name>` — Refactoring work
- `docs/<name>` — Documentation updates
- `fix/<name>` — Bug fixes
- `test/<name>` — Testing infrastructure

### Commit Message Format
```
<type>(<scope>): <subject>

<body (optional)>

<footer (optional)>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation
- `test`: Tests
- `chore`: Maintenance

Examples:
```
feat(orders): add order generation endpoint
refactor(domain): extract quantity calculation logic
docs(api): document orders endpoints
fix(auth): resolve business context resolution bug
```

### Push Strategy
- **Never push broken code to main**
- Push feature branches when stable and tested
- Merge to main only after user approval
- Tag releases: `v0.1.0`, `v0.2.0`, etc.

---

## Phase 0 — Project Initialization & Setup

### 0.1 Repository Setup
**Branch:** `chore/initial-setup`

**Tasks:**
- [ ] Initialize git repository
- [ ] Create comprehensive `.gitignore` (Node, Vite, env files, IDE files)
- [ ] Create root `README.md` with project overview
- [ ] Create `IMPLEMENTATION_GUIDE.md` (this file)
- [ ] Set up folder structure skeleton

**Documentation:**
- [ ] Document project structure in README
- [ ] Document setup instructions

**Commit:**
```
chore: initialize repository and project structure
```

**User Checkpoint:** ✅
- Review project structure
- Confirm `.gitignore` is comprehensive
- Approve before proceeding

---

### 0.2 GitHub Remote Setup
**Branch:** `chore/github-setup`

**Tasks:**
- [ ] Create GitHub repository (you do this)
- [ ] Add remote origin
- [ ] Push initial commit

**Instructions for You:**
1. Go to GitHub and create a new **private** repository named `suppli`
2. **Do NOT** initialize with README (we have local files)
3. Copy the repository URL

**Then I will:**
- Add remote: `git remote add origin <your-repo-url>`
- Push: `git push -u origin main`

**Authentication Setup (You Do This Once):**

**Option A: SSH (Recommended)**
```bash
# Generate SSH key if you don't have one
ssh-keygen -t ed25519 -C "your-email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub: Settings → SSH and GPG keys → New SSH key
```

**Option B: HTTPS with Personal Access Token**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Use token as password when pushing

**User Checkpoint:** ✅
- Confirm GitHub repo created
- Confirm authentication works (I'll test with a push)
- Approve before proceeding

---

### 0.3 Environment Configuration Template
**Branch:** `chore/env-templates`

**Tasks:**
- [ ] Create `.env.example` files for backend and frontend
- [ ] Document required environment variables
- [ ] Create setup instructions

**Documentation:**
- [ ] `docs/SETUP.md` with environment variable guide
- [ ] List all required keys and where to get them

**Commit:**
```
docs: add environment configuration templates and setup guide
```

**User Checkpoint:** ✅
- Review environment variable requirements
- Prepare to provide keys when needed (Phase 4)

---

## Phase 1 — Project Scaffolding

### 1.1 Backend Skeleton
**Branch:** `feature/backend-skeleton`

**Tasks:**
- [ ] Initialize Node.js project in `server/`
- [ ] Install core dependencies:
  - Express
  - TypeScript
  - Zod
  - dotenv
  - @supabase/supabase-js
  - cors, helmet, express-rate-limit
- [ ] Set up folder structure per `backend-architecture.md`:
  ```
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
      errors/
      lib/
  ```
- [ ] Create basic Express app with health check endpoint
- [ ] Set up TypeScript configuration
- [ ] Add basic error handling middleware

**Documentation:**
- [ ] Document folder structure
- [ ] Document API conventions
- [ ] Add JSDoc comments to key files

**Testing:**
- [ ] Manual test: `GET /health` returns 200
- [ ] Verify server starts without errors

**Commits:**
```
feat(backend): scaffold express application structure
feat(backend): add health check endpoint
docs(backend): document folder structure and conventions
```

**User Checkpoint:** ✅
- Test: Start server, hit `/health` endpoint
- Review code structure
- Provide feedback before proceeding

---

### 1.2 Frontend Skeleton
**Branch:** `feature/frontend-skeleton`

**Tasks:**
- [ ] Initialize Vite + React + TypeScript project in `frontend/`
- [ ] Install core dependencies:
  - React Router (or TanStack Router)
  - TanStack Query
  - Tailwind CSS
  - shadcn/ui base
  - React Hook Form + Zod
  - @supabase/supabase-js
- [ ] Set up folder structure per `frontend-architecture.md`:
  ```
  frontend/
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
  ```
- [ ] Create base layout components
- [ ] Set up routing structure
- [ ] Configure Tailwind and design tokens

**Documentation:**
- [ ] Document component organization
- [ ] Document routing strategy
- [ ] Document design system setup

**Testing:**
- [ ] Verify app builds and runs
- [ ] Verify routing works
- [ ] Verify Tailwind styles apply

**Commits:**
```
feat(frontend): scaffold vite react application
feat(frontend): set up routing and base layout
feat(frontend): configure tailwind and design system
docs(frontend): document component and routing structure
```

**User Checkpoint:** ✅
- Test: Build and run frontend
- Review UI structure
- Provide feedback before proceeding

---

### 1.3 Shared Tooling & Configuration
**Branch:** `chore/tooling-config`

**Tasks:**
- [ ] Set up ESLint for both projects
- [ ] Set up Prettier with shared config
- [ ] Add pre-commit hooks (optional: husky)
- [ ] Create shared TypeScript configs
- [ ] Add npm scripts for common tasks
- [ ] Set up basic CI/CD config (GitHub Actions)

**Documentation:**
- [ ] Document development workflow
- [ ] Document linting/formatting rules
- [ ] Document available npm scripts

**Commits:**
```
chore: add eslint and prettier configuration
chore: add shared typescript configs
chore: add github actions ci workflow
docs: document development workflow
```

**User Checkpoint:** ✅
- Review tooling setup
- Test: Run linting and formatting
- Approve before proceeding

---

## Phase 2 — Database & Supabase Setup

### 2.1 Supabase Project Setup
**Branch:** `feature/supabase-setup`

**Tasks:**
- [ ] Create Supabase project (you do this)
- [ ] Document Supabase project details
- [ ] Set up local Supabase CLI (optional)

**Instructions for You:**
1. Go to https://supabase.com
2. Create a new project
3. Note down:
   - Project URL
   - Anon/public key
   - Service role key (Settings → API)

**I will:**
- Create `docs/SUPABASE_SETUP.md` with connection details (redacted)
- Set up environment variable placeholders

**Documentation:**
- [ ] `docs/SUPABASE_SETUP.md` with setup instructions
- [ ] Document how to access Supabase dashboard

**User Checkpoint:** ✅
- Provide Supabase credentials (I'll add to `.env` files)
- Confirm connection test works
- Approve before proceeding

---

### 2.2 Database Schema Implementation
**Branch:** `feature/db-schema-core`

**Tasks:**
- [ ] Create migration files for core tables:
  - `businesses`, `users`, `business_users`
  - `vendors`, `products`, `vendor_products`
  - `orders`, `vendor_orders`, `order_lines`
  - `order_events`
- [ ] Apply migrations to Supabase
- [ ] Verify table creation

**Documentation:**
- [ ] Document each table's purpose
- [ ] Document relationships
- [ ] Create ER diagram (optional)

**Testing:**
- [ ] Verify all tables exist
- [ ] Verify foreign keys work
- [ ] Test basic inserts

**Commits:**
```
feat(db): add core tenant and user tables
feat(db): add vendors and products tables
feat(db): add orders domain tables
docs(db): document database schema
```

**User Checkpoint:** ✅
- Review database schema in Supabase dashboard
- Confirm tables match expectations
- Approve before proceeding

---

### 2.3 Row Level Security (RLS)
**Branch:** `feature/db-rls-policies`

**Tasks:**
- [ ] Enable RLS on all tenant-scoped tables
- [ ] Create RLS policies per `rls-policies.md`:
  - Standard tenant isolation policies
  - Business and membership policies
  - Role-based restrictions where needed
- [ ] Test RLS policies with different users

**Documentation:**
- [ ] Document RLS policy strategy
- [ ] Document testing approach

**Testing:**
- [ ] Create test users in different businesses
- [ ] Verify cross-tenant access is blocked
- [ ] Verify role-based access works

**Commits:**
```
feat(db): enable rls on all tenant tables
feat(db): add tenant isolation policies
feat(db): add role-based access policies
test(db): add rls policy tests
docs(db): document rls strategy
```

**User Checkpoint:** ✅
- Review RLS policies
- Test: Try to access another business's data (should fail)
- Approve before proceeding

---

### 2.4 Additional Schema Tables
**Branch:** `feature/db-schema-extended`

**Tasks:**
- [ ] Create remaining tables:
  - `sales_events`, `promotions`, `promotion_products`
  - `invoices`, `invoice_lines`, `invoice_mismatches`
  - `files`, `learning_adjustments`
- [ ] Apply migrations
- [ ] Add RLS policies

**Commits:**
```
feat(db): add sales and promotions tables
feat(db): add invoices and verification tables
feat(db): add files and learning tables
```

**User Checkpoint:** ✅
- Review complete schema
- Approve before proceeding

---

## Phase 3 — Backend Core Implementation

### 3.1 Authentication & Authorization Middleware
**Branch:** `feature/auth-middleware`

**Tasks:**
- [ ] Implement JWT verification middleware
- [ ] Implement business context resolution
- [ ] Implement role checking middleware
- [ ] Add error handling for auth failures

**Documentation:**
- [ ] Document auth flow
- [ ] Document middleware usage
- [ ] Document role requirements per endpoint

**Testing:**
- [ ] Test with valid JWT
- [ ] Test with invalid JWT
- [ ] Test with missing business context
- [ ] Test role enforcement

**Commits:**
```
feat(auth): add jwt verification middleware
feat(auth): implement business context resolution
feat(auth): add role-based authorization middleware
docs(auth): document authentication flow
test(auth): add auth middleware tests
```

**User Checkpoint:** ✅
- Test: Try accessing protected endpoints
- Verify auth errors are clear
- Approve before proceeding

---

### 3.2 API Contracts & Validation
**Branch:** `feature/api-contracts`

**Tasks:**
- [ ] Implement Zod schemas for all API inputs
- [ ] Create standard error response shape
- [ ] Implement validation middleware
- [ ] Set up API versioning (`/api/v1`)

**Documentation:**
- [ ] Document all API endpoints
- [ ] Document request/response shapes
- [ ] Document error codes

**Testing:**
- [ ] Test valid requests
- [ ] Test invalid requests (validation errors)
- [ ] Verify error format

**Commits:**
```
feat(api): add zod validation schemas
feat(api): implement standard error response
feat(api): add validation middleware
docs(api): document api contracts
```

**User Checkpoint:** ✅
- Review API documentation
- Test: Send valid and invalid requests
- Approve before proceeding

---

### 3.3 Orders Domain Logic
**Branch:** `feature/orders-domain`

**Tasks:**
- [ ] Implement order generation engine per `order-generation-rules.md`
- [ ] Implement confidence scoring
- [ ] Implement Guided/Full Auto/Simulation modes
- [ ] Implement quantity calculation logic
- [ ] Add explanations generation

**Documentation:**
- [ ] Document order generation algorithm
- [ ] Document confidence calculation
- [ ] Document mode differences

**Testing:**
- [ ] Test with no sales data (conservative)
- [ ] Test with sales data
- [ ] Test with promotions
- [ ] Verify confidence levels

**Commits:**
```
feat(domain): implement order generation engine
feat(domain): add confidence scoring logic
feat(domain): implement generation modes
docs(domain): document order generation rules
test(domain): add order generation tests
```

**User Checkpoint:** ✅
- Test: Generate test orders
- Review generated quantities and explanations
- Provide feedback on logic
- Approve before proceeding

---

### 3.4 Orders API Endpoints
**Branch:** `feature/orders-api`

**Tasks:**
- [ ] Implement `/api/v1/orders` endpoints:
  - `GET /orders` (list)
  - `GET /orders/:id` (detail)
  - `POST /orders/generate`
  - `PATCH /orders/:id/lines/:lineId` (update quantity)
  - `POST /orders/:id/approve`
  - `POST /orders/:id/send`
- [ ] Wire domain logic to endpoints
- [ ] Add authorization checks

**Documentation:**
- [ ] Update API documentation
- [ ] Document order state transitions

**Testing:**
- [ ] Test all endpoints
- [ ] Test authorization
- [ ] Test state transitions

**Commits:**
```
feat(api): implement orders list and detail endpoints
feat(api): add order generation endpoint
feat(api): add order approval and sending endpoints
docs(api): document orders api
```

**User Checkpoint:** ✅
- Test: Use API to generate, review, approve orders
- Verify all endpoints work
- Approve before proceeding

---

### 3.5 Vendors API
**Branch:** `feature/vendors-api`

**Tasks:**
- [ ] Implement `/api/v1/vendors` endpoints (CRUD)
- [ ] Add vendor validation
- [ ] Add authorization checks

**Commits:**
```
feat(api): implement vendors crud endpoints
test(api): add vendors api tests
```

**User Checkpoint:** ✅
- Test: Create, read, update vendors
- Approve before proceeding

---

### 3.6 Learning Loop Implementation
**Branch:** `feature/learning-loop`

**Tasks:**
- [ ] Implement learning adjustments per `learning-loop.md`
- [ ] Track user edits and approvals
- [ ] Update confidence based on history
- [ ] Store learning adjustments

**Documentation:**
- [ ] Document learning algorithm
- [ ] Document what gets learned

**Testing:**
- [ ] Test learning from edits
- [ ] Test learning from approvals
- [ ] Verify adjustments are conservative

**Commits:**
```
feat(domain): implement learning loop logic
feat(api): track edits and approvals for learning
docs(domain): document learning mechanism
```

**User Checkpoint:** ✅
- Test: Make edits, verify learning
- Review learning adjustments
- Approve before proceeding

---

## Phase 4 — Configuration & External Services

### 4.1 Environment Variables & Secrets
**Branch:** `chore/env-setup`

**Tasks:**
- [ ] Set up `.env.local` files (you provide values)
- [ ] Document all required variables
- [ ] Verify environment loading works

**Required Variables:**

**Backend (`server/.env.local`):**
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
NODE_ENV=development
PORT=3001
```

**Frontend (`frontend/.env.local`):**
```
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Instructions for You:**

**Supabase Keys:**
- Already have from Phase 2.1

**Stripe Keys:**
1. Go to https://stripe.com
2. Create account or log in
3. Go to Developers → API keys
4. Copy:
   - Secret key (starts with `sk_`)
   - Publishable key (for frontend, if needed)
5. Go to Developers → Webhooks
6. Add endpoint: `http://localhost:3001/api/v1/webhooks/stripe`
7. Copy webhook signing secret (starts with `whsec_`)

**User Checkpoint:** ✅
- Provide all environment variables
- I'll add them to `.env.local` files (never committed)
- Test: Verify both apps can read env vars
- Approve before proceeding

---

### 4.2 Stripe Integration
**Branch:** `feature/stripe-integration`

**Tasks:**
- [ ] Implement Stripe webhook handler
- [ ] Implement customer creation
- [ ] Implement subscription management
- [ ] Implement plan-to-capabilities mapping
- [ ] Add feature gating logic

**Documentation:**
- [ ] Document Stripe integration
- [ ] Document webhook events handled
- [ ] Document plan capabilities

**Testing:**
- [ ] Test webhook handling
- [ ] Test subscription creation
- [ ] Test feature gating

**Commits:**
```
feat(payments): add stripe webhook handler
feat(payments): implement subscription management
feat(payments): add plan-based feature gating
docs(payments): document stripe integration
```

**User Checkpoint:** ✅
- Test: Create test subscription in Stripe
- Verify webhook receives events
- Verify feature gating works
- Approve before proceeding

---

## Phase 5 — Frontend Implementation

### 5.1 Authentication & App Shell
**Branch:** `feature/frontend-auth-shell`

**Tasks:**
- [ ] Implement Supabase auth provider
- [ ] Implement protected routes
- [ ] Create main app layout (sidebar + top bar)
- [ ] Implement business selector
- [ ] Set up routing structure

**Documentation:**
- [ ] Document auth flow
- [ ] Document routing structure

**Testing:**
- [ ] Test login/logout
- [ ] Test protected routes
- [ ] Test business switching

**Commits:**
```
feat(frontend): add supabase auth provider
feat(frontend): implement protected routes
feat(frontend): create main app layout
docs(frontend): document auth and routing
```

**User Checkpoint:** ✅
- Test: Login, navigate, switch businesses
- Review UI layout
- Provide feedback
- Approve before proceeding

---

### 5.2 Core UI Components
**Branch:** `feature/ui-components`

**Tasks:**
- [ ] Implement core components per `component-library.md`:
  - Button (all variants)
  - Input (all types)
  - Table
  - Modal/Dialog
  - Badge
  - Alert
  - Tabs
  - Dropdown Menu
  - Loading states
  - Empty states
- [ ] Ensure accessibility per `accessibility-checklist.md`

**Documentation:**
- [ ] Document component API
- [ ] Document usage examples
- [ ] Create component storybook (optional)

**Testing:**
- [ ] Test all component variants
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility

**Commits:**
```
feat(ui): add core button and input components
feat(ui): add table, modal, and alert components
feat(ui): add loading and empty state components
test(ui): add component tests
docs(ui): document component library
```

**User Checkpoint:** ✅
- Test: Use all components
- Verify accessibility
- Review design consistency
- Approve before proceeding

---

### 5.3 Data Fetching Infrastructure
**Branch:** `feature/data-fetching`

**Tasks:**
- [ ] Set up TanStack Query
- [ ] Create API service layer
- [ ] Implement query hooks per `data-fetching-strategy.md`
- [ ] Implement mutation hooks
- [ ] Add error handling

**Documentation:**
- [ ] Document data fetching patterns
- [ ] Document hook usage

**Testing:**
- [ ] Test query hooks
- [ ] Test mutation hooks
- [ ] Test error handling
- [ ] Test loading states

**Commits:**
```
feat(frontend): set up tanstack query
feat(frontend): create api service layer
feat(frontend): implement query and mutation hooks
docs(frontend): document data fetching patterns
```

**User Checkpoint:** ✅
- Test: Verify data loads correctly
- Test: Verify mutations work
- Approve before proceeding

---

### 5.4 Orders Feature UI
**Branch:** `feature/ui-orders`

**Tasks:**
- [ ] Implement orders list page
- [ ] Implement order detail/review page per `order-review-ui.md`
- [ ] Implement order generation flow
- [ ] Add confidence indicators
- [ ] Add explanations display
- [ ] Implement inline quantity editing

**Documentation:**
- [ ] Document order review flow
- [ ] Document user interactions

**Testing:**
- [ ] Test order generation
- [ ] Test order review
- [ ] Test quantity editing
- [ ] Test approval flow

**Commits:**
```
feat(orders): implement orders list page
feat(orders): implement order review ui
feat(orders): add confidence indicators and explanations
feat(orders): implement inline quantity editing
docs(orders): document order review flow
```

**User Checkpoint:** ✅
- **CRITICAL TESTING POINT**
- Test: Generate order, review, edit quantities, approve
- Verify explanations are clear
- Verify confidence indicators work
- Provide detailed feedback
- Approve before proceeding

---

### 5.5 Vendors Feature UI
**Branch:** `feature/ui-vendors`

**Tasks:**
- [ ] Implement vendors list page
- [ ] Implement vendor detail page
- [ ] Implement vendor creation/editing
- [ ] Add vendor formatting preview

**Commits:**
```
feat(vendors): implement vendors list and detail pages
feat(vendors): add vendor creation and editing
```

**User Checkpoint:** ✅
- Test: Create, view, edit vendors
- Approve before proceeding

---

### 5.6 Onboarding Flow
**Branch:** `feature/ui-onboarding`

**Tasks:**
- [ ] Implement onboarding flow per `onboarding-flow.md`
- [ ] Add progress indicator
- [ ] Implement step-by-step wizard
- [ ] Add first order preview

**Commits:**
```
feat(onboarding): implement onboarding wizard
feat(onboarding): add first order preview
docs(onboarding): document onboarding flow
```

**User Checkpoint:** ✅
- **CRITICAL TESTING POINT**
- Test: Complete onboarding flow
- Verify first order preview works
- Provide feedback on UX
- Approve before proceeding

---

### 5.7 Invoices Feature UI
**Branch:** `feature/ui-invoices`

**Tasks:**
- [ ] Implement invoice upload
- [ ] Implement invoice comparison view
- [ ] Implement mismatch highlighting
- [ ] Add resolution workflow

**Commits:**
```
feat(invoices): implement invoice upload
feat(invoices): add invoice comparison ui
feat(invoices): implement mismatch resolution
```

**User Checkpoint:** ✅
- Test: Upload invoice, view comparison
- Approve before proceeding

---

## Phase 6 — Refactoring & Optimization

### 6.1 Code Quality Refactoring
**Branch:** `refactor/code-quality`

**Tasks:**
- [ ] Review code for:
  - Duplication
  - Complex functions (extract smaller functions)
  - Poor naming
  - Missing error handling
  - Inconsistent patterns
- [ ] Refactor identified issues
- [ ] Improve type safety
- [ ] Add missing JSDoc comments

**Documentation:**
- [ ] Document refactoring decisions
- [ ] Update any affected documentation

**Testing:**
- [ ] Ensure all tests still pass
- [ ] Add tests for refactored code

**Commits:**
```
refactor(backend): extract common validation logic
refactor(domain): simplify order generation function
refactor(frontend): consolidate component patterns
docs: document refactoring decisions
```

**User Checkpoint:** ✅
- Review refactored code
- Test: Verify functionality still works
- Approve before proceeding

---

### 6.2 Performance Optimization
**Branch:** `refactor/performance`

**Tasks:**
- [ ] Identify performance bottlenecks:
  - Slow API endpoints
  - Heavy database queries
  - Frontend bundle size
  - Unnecessary re-renders
- [ ] Optimize database queries (add indexes, optimize joins)
- [ ] Optimize API responses (pagination, field selection)
- [ ] Optimize frontend (code splitting, lazy loading)
- [ ] Add caching where appropriate

**Documentation:**
- [ ] Document performance improvements
- [ ] Document performance budgets

**Testing:**
- [ ] Measure before/after performance
- [ ] Verify optimizations don't break functionality

**Commits:**
```
perf(db): add indexes for common queries
perf(api): optimize order list endpoint
perf(frontend): implement code splitting
docs: document performance optimizations
```

**User Checkpoint:** ✅
- Test: Verify performance improvements
- Review metrics
- Approve before proceeding

---

### 6.3 Architecture Refactoring
**Branch:** `refactor/architecture`

**Tasks:**
- [ ] Review architecture against docs
- [ ] Identify architectural improvements:
  - Better separation of concerns
  - Improved error handling patterns
  - Better service layer organization
- [ ] Refactor to align with architecture docs

**Documentation:**
- [ ] Update architecture documentation
- [ ] Document architectural decisions

**Commits:**
```
refactor(backend): improve service layer organization
refactor(frontend): better feature organization
docs: update architecture documentation
```

**User Checkpoint:** ✅
- Review architectural changes
- Test: Verify everything still works
- Approve before proceeding

---

## Phase 7 — Testing & Quality Assurance

### 7.1 Unit Testing
**Branch:** `test/unit-tests`

**Tasks:**
- [ ] Set up testing infrastructure (Vitest)
- [ ] Write unit tests for:
  - Domain logic (order generation, learning)
  - Utility functions
  - Validation logic
  - Component logic
- [ ] Achieve 80%+ coverage on critical paths

**Documentation:**
- [ ] Document testing approach
- [ ] Document how to run tests

**Commits:**
```
test: add unit tests for order generation
test: add unit tests for learning logic
test: add component unit tests
docs: document testing strategy
```

**User Checkpoint:** ✅
- Review test coverage
- Run tests, verify they pass
- Approve before proceeding

---

### 7.2 Integration Testing
**Branch:** `test/integration-tests`

**Tasks:**
- [ ] Write integration tests for:
  - API endpoints
  - Database interactions
  - RLS policies
  - Auth flows
- [ ] Set up test database

**Commits:**
```
test: add api integration tests
test: add database integration tests
test: add rls policy tests
```

**User Checkpoint:** ✅
- Review integration tests
- Run tests, verify they pass
- Approve before proceeding

---

### 7.3 End-to-End Testing
**Branch:** `test/e2e-tests`

**Tasks:**
- [ ] Set up E2E testing (Playwright)
- [ ] Write E2E tests for critical flows:
  - User onboarding
  - Order generation and approval
  - Invoice upload
- [ ] Set up CI/CD to run E2E tests

**Commits:**
```
test: add e2e test infrastructure
test: add e2e tests for critical flows
ci: add e2e tests to github actions
```

**User Checkpoint:** ✅
- Review E2E tests
- Run E2E tests, verify they pass
- Approve before proceeding

---

### 7.4 Accessibility Testing
**Branch:** `test/a11y-tests`

**Tasks:**
- [ ] Run accessibility audits (axe, Lighthouse)
- [ ] Fix identified issues
- [ ] Test with screen readers
- [ ] Test keyboard navigation

**Commits:**
```
test: add accessibility tests
fix(a11y): fix identified accessibility issues
docs: document accessibility compliance
```

**User Checkpoint:** ✅
- Test: Use keyboard navigation
- Test: Use screen reader
- Verify accessibility
- Approve before proceeding

---

## Phase 8 — Documentation & Polish

### 8.1 API Documentation
**Branch:** `docs/api-documentation`

**Tasks:**
- [ ] Complete API documentation
- [ ] Add request/response examples
- [ ] Document error codes
- [ ] Create Postman collection (optional)

**Commits:**
```
docs: complete api documentation
docs: add api examples
```

**User Checkpoint:** ✅
- Review API documentation
- Test: Use API docs to make requests
- Approve before proceeding

---

### 8.2 User Documentation
**Branch:** `docs/user-documentation`

**Tasks:**
- [ ] Create user guide
- [ ] Document common workflows
- [ ] Create video tutorials (optional)
- [ ] Add in-app help tooltips

**Commits:**
```
docs: add user guide
docs: document common workflows
```

**User Checkpoint:** ✅
- Review user documentation
- Test: Follow guide to complete tasks
- Approve before proceeding

---

### 8.3 Developer Documentation
**Branch:** `docs/developer-docs`

**Tasks:**
- [ ] Complete README files
- [ ] Document setup process
- [ ] Document deployment process
- [ ] Document contribution guidelines

**Commits:**
```
docs: complete developer documentation
docs: add deployment guide
```

**User Checkpoint:** ✅
- Review developer docs
- Test: Follow setup guide
- Approve before proceeding

---

## Phase 9 — Deployment Preparation

### 9.1 Production Configuration
**Branch:** `chore/production-config`

**Tasks:**
- [ ] Set up production environment variables
- [ ] Configure production database
- [ ] Set up production Supabase project
- [ ] Configure production Stripe account

**Documentation:**
- [ ] Document production setup
- [ ] Document environment differences

**User Checkpoint:** ✅
- Review production configuration
- Provide production credentials
- Approve before proceeding

---

### 9.2 CI/CD Pipeline
**Branch:** `chore/cicd-pipeline`

**Tasks:**
- [ ] Set up GitHub Actions for:
  - Automated testing
  - Automated deployment
  - Security scanning
- [ ] Configure deployment to staging
- [ ] Configure deployment to production (manual approval)

**Documentation:**
- [ ] Document CI/CD process
- [ ] Document deployment process

**Commits:**
```
ci: add github actions workflow
ci: add automated testing
ci: add deployment pipeline
docs: document cicd process
```

**User Checkpoint:** ✅
- Review CI/CD configuration
- Test: Trigger pipeline
- Approve before proceeding

---

### 9.3 Monitoring & Observability
**Branch:** `feature/observability`

**Tasks:**
- [ ] Set up error tracking (Sentry)
- [ ] Set up logging aggregation
- [ ] Set up basic metrics
- [ ] Configure alerts

**Documentation:**
- [ ] Document monitoring setup
- [ ] Document alert procedures

**Commits:**
```
feat(ops): add error tracking
feat(ops): set up logging
feat(ops): configure monitoring
docs: document observability setup
```

**User Checkpoint:** ✅
- Review monitoring setup
- Test: Trigger test error, verify tracking
- Approve before proceeding

---

## Phase 10 — Final Testing & Launch

### 10.1 User Acceptance Testing
**Branch:** `test/uat`

**Tasks:**
- [ ] Create UAT test plan
- [ ] Execute UAT with you
- [ ] Fix identified issues
- [ ] Document test results

**User Checkpoint:** ✅
- **COMPREHENSIVE TESTING**
- Test all major flows
- Report all issues
- Approve for production

---

### 10.2 Production Deployment
**Branch:** `chore/production-deploy`

**Tasks:**
- [ ] Deploy to production
- [ ] Verify deployment
- [ ] Run smoke tests
- [ ] Monitor for issues

**User Checkpoint:** ✅
- Test: Verify production deployment
- Monitor for issues
- Approve launch

---

## Ongoing Maintenance

### After Launch
- Regular refactoring cycles
- Performance monitoring
- User feedback integration
- Feature additions per roadmap

---

## How We'll Work Together

### Communication Protocol
1. **I complete a phase/chunk** → I notify you
2. **You test and provide feedback** → You test thoroughly
3. **I address feedback** → I fix issues or make improvements
4. **You approve** → We move to next phase
5. **Repeat**

### Git Workflow
- I create feature branches
- I make small, logical commits
- I push when stable
- You review before merge to main
- Main is always deployable

### Documentation
- I document as I go
- You review documentation
- We update docs together

---

## Success Criteria

### MVP Launch
- [ ] All core features working
- [ ] Tests passing
- [ ] Documentation complete
- [ ] Deployed to production
- [ ] You can use it successfully

---

## Notes

- This guide is **living** — we'll update it as we learn
- **User involvement is critical** — no phase proceeds without your approval
- **Refactoring is mandatory** — not optional
- **Documentation is required** — not nice-to-have
- **Quality over speed** — we build it right

Let's build Suppli together! 🚀
