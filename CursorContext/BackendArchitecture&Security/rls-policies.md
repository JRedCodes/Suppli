# Suppli — Row Level Security (RLS) Policies

## Purpose of This Document
This document defines the Row Level Security (RLS) strategy for Suppli’s database.
RLS is the **primary enforcement layer** for multi-tenant data isolation and must be enabled on every tenant-scoped table.

RLS is not optional. If a table does not have RLS, it is considered unsafe.

---

## Core RLS Principles
1. **Deny by default**
2. **Every row belongs to exactly one business**
3. **Users only access businesses they belong to**
4. **Service roles are tightly scoped**
5. **RLS enforces correctness even if the API fails**

---

## Tenant Model Assumptions

### Business Membership
- Users belong to businesses via the `business_users` table
- Permissions are derived from role within that table

### Required JWT Claims
RLS policies assume access to:
- `auth.uid()` → authenticated user ID

---

## Global RLS Rules

### All Tenant-Scoped Tables Must:
- Include `business_id`
- Enable RLS
- Restrict access using `business_users`

Example base condition:
```sql
business_id IN (
  SELECT business_id
  FROM business_users
  WHERE user_id = auth.uid()
)
Table-Specific Policy Patterns
businesses
Users may only see businesses they belong to.

sql
Copy code
CREATE POLICY "businesses_select"
ON businesses
FOR SELECT
USING (
  id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
  )
);
Insert/update/delete:

Restricted to owners (recommended)

Often managed server-side only

business_users
Controls membership and roles.

Select
Users may view memberships for businesses they belong to.

sql
Copy code
CREATE POLICY "business_users_select"
ON business_users
FOR SELECT
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
  )
);
Insert / Update / Delete
Typically restricted to Owner role

Often handled via server-side service role

Core Domain Tables
Applies to:

vendors

products

orders

vendor_orders

order_lines

order_events

sales_events

promotions

promotion_products

invoices

invoice_lines

invoice_mismatches

files

learning_adjustments

Select Policy (Standard)
sql
Copy code
CREATE POLICY "tenant_select"
ON <table>
FOR SELECT
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
  )
);
Insert Policy (Standard)
sql
Copy code
CREATE POLICY "tenant_insert"
ON <table>
FOR INSERT
WITH CHECK (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
  )
);
Update Policy (Standard)
sql
Copy code
CREATE POLICY "tenant_update"
ON <table>
FOR UPDATE
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
  )
);
Delete Policy (Standard)
sql
Copy code
CREATE POLICY "tenant_delete"
ON <table>
FOR DELETE
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
  )
);
Role-Based Restrictions (Optional MVP+)
For sensitive tables or actions, role checks may be added.

Example (Owner-only update):

sql
Copy code
AND EXISTS (
  SELECT 1
  FROM business_users
  WHERE user_id = auth.uid()
    AND business_id = <table>.business_id
    AND role = 'owner'
)
Used for:

Billing

User management

Business deletion

Vendor deletion

Service Role Usage
Service Role Permissions
Bypasses RLS

Used only for:

Background jobs

Invoice parsing

Scheduled tasks

Admin operations

Rules:

Never exposed to client

Never used for normal API requests

Logged aggressively

File Storage RLS
Supabase Storage buckets must:

Be scoped by business_id in path

Enforce read/write policies

Example path:

bash
Copy code
businesses/{business_id}/invoices/{file_id}.pdf
Access policy:

User must belong to the business matching the path

Common Failure Modes to Avoid
Forgetting to enable RLS on a new table

Allowing SELECT * without tenant scoping

Trusting API-layer filtering instead of RLS

Using service role unnecessarily

Storing shared/global data without explicit rules

Testing & Validation
RLS must be tested by:

Creating two businesses

Creating users in each

Verifying zero cross-access

Attempting malicious queries

RLS should be validated before any production deployment.

MVP vs Later
MVP
Basic tenant isolation

Minimal role differentiation

Service role for background tasks only

Later
Fine-grained role policies

Read-only roles

Vendor-scoped access

Audit-focused RLS rules

Success Criteria
Zero cross-tenant data exposure

Safe defaults for all tables

Backend bugs cannot bypass isolation

Summary
RLS is Suppli’s strongest security guarantee.

If RLS is misconfigured:

The system is unsafe

The feature is incomplete

Every new table must ship with RLS or not ship at all.