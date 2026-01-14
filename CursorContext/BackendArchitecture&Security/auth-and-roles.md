# Suppli — Authentication & Roles

## Purpose of This Document
This document defines Suppli’s authentication model, user roles, and authorization rules.
It ensures that access is predictable, secure, and aligned with real-world business workflows.

Authentication answers **who you are**.  
Authorization answers **what you are allowed to do**.

---

## Authentication Model

### Authentication Provider
- Supabase Auth is the single authentication provider
- Supports email/password and magic links (MVP)
- JWT-based authentication for API access

Suppli does not manage passwords directly.

---

## Auth Flow (High Level)

1. User signs up or logs in via Supabase Auth
2. Supabase issues a JWT
3. JWT is sent with every API request
4. API verifies token validity
5. API resolves business context and role
6. RLS enforces data-level access

---

## User Identity

### users Table
Represents a global identity.

Key characteristics:
- One user may belong to multiple businesses
- Identity is not business-specific
- Permissions are never stored here

---

## Business Membership

### business_users Table
This table defines:
- Which businesses a user belongs to
- What role they have in each business

Fields (conceptual):
- user_id
- business_id
- role
- created_at

All authorization decisions depend on this table.

---

## Role Definitions (MVP)

### Owner
Highest level of access.

Can:
- Manage billing and subscription
- Invite and remove users
- Change user roles
- Create, edit, and delete vendors
- Approve and send orders
- Access all settings

Typically:
- Business owner
- Primary administrator

---

### Manager
Operational authority.

Can:
- Create and edit vendors
- Generate and approve orders
- Upload sales data and promotions
- Review invoices
- View most settings

Cannot:
- Manage billing
- Delete the business
- Remove the Owner

---

### Staff
Limited operational access.

Can:
- View orders
- Edit order quantities (if permitted)
- Upload invoices (optional)
- View vendors and products

Cannot:
- Approve or send orders (default)
- Manage users
- Access billing or integrations

Staff permissions may be configurable later.

---

## Authorization Strategy

Authorization is enforced at three layers:

1. **UI Layer**
   - Disable or hide actions user cannot perform
   - Provide explanations when access is restricted

2. **API Layer**
   - Middleware verifies role before executing actions
   - Never trust the client

3. **Database Layer (RLS)**
   - Final enforcement
   - Prevents privilege escalation

All three layers must agree.

---

## Common Authorization Rules

### Orders
- Generate order: Manager, Owner
- Edit quantities: Staff (optional), Manager, Owner
- Approve order: Manager, Owner
- Send/export order: Manager, Owner

### Vendors
- Add/edit vendor: Manager, Owner
- Delete vendor: Owner only (recommended)

### Sales Data & Promotions
- Upload data: Manager, Owner
- View data: All roles

### Invoices
- Upload invoice: Staff, Manager, Owner
- Resolve mismatches: Manager, Owner

### Settings
- Business settings: Owner
- Users & roles: Owner
- Billing: Owner
- Integrations: Owner (Manager later if needed)

---

## Invitation Flow

1. Owner invites user via email
2. Invitation creates a pending business_users record
3. User accepts invite via Supabase Auth
4. Membership becomes active

Rules:
- Invitations expire
- Role is defined at invite time
- Only Owners can invite/remove users

---

## Business Context Resolution

Every authenticated request must resolve:
- user_id (from JWT)
- business_id (from request or session)
- role (from business_users)

Requests without valid business context are rejected.

---

## API Middleware Responsibilities

Auth middleware must:
- Validate JWT
- Extract user_id
- Resolve business membership
- Attach role to request context
- Fail early on missing access

No controller should re-implement auth logic.

---

## Edge Cases & Safety

### Multiple Businesses
- User explicitly selects active business
- Business context is never inferred silently

### Role Changes
- Role changes take effect immediately
- Active sessions respect updated permissions

### Removed Users
- Access revoked instantly
- Existing sessions invalidated where possible

---

## MVP vs Later

### MVP
- Email-based auth
- Three roles
- Manual role assignment
- No custom permissions

### Later
- Fine-grained permissions
- Temporary roles
- Read-only audit users
- Vendor-limited access

---

## Success Criteria
- Users only see what they’re allowed to see
- No accidental over-permissioning
- Role model matches real-world expectations

---

## Summary
Suppli’s auth and roles system exists to:
- Protect sensitive operations
- Enable collaboration
- Prevent costly mistakes

If a role feels ambiguous, it should be clarified or split.
If a permission feels risky, it should default to Owner-only.
