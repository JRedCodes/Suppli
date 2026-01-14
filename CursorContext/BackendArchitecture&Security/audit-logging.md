# Suppli — Audit Logging

## Purpose of This Document
This document defines Suppli’s audit logging strategy.
Audit logs provide transparency, accountability, and safety for all actions that affect money, data, or system behavior.

Audit logging is **read-only, append-only, and never optional**.

---

## Core Principles
1. **Every meaningful action is logged**
2. **Logs are immutable**
3. **Logs are human-readable**
4. **Logs are tenant-scoped**
5. **Logs support trust and debugging**

---

## What Is an Audit Event
An audit event represents a **meaningful state change or decision** in the system.

Audit events are not debug logs.
They are intentional records of user or system actions.

---

## Actions That MUST Be Logged (MVP)

### Orders
- Order generated
- Order edited (quantity changes)
- Order approved
- Order sent / exported
- Order cancelled

---

### Vendors
- Vendor created
- Vendor updated
- Vendor archived / deleted

---

### Sales & Promotions
- Sales data uploaded
- Promotion created
- Promotion edited
- Promotion archived

---

### Invoices
- Invoice uploaded
- Invoice matched to order
- Invoice mismatch resolved

---

### Users & Security
- User invited
- User role changed
- User removed from business
- Business settings updated

---

## Audit Event Structure

Each audit event contains:

- id (uuid)
- business_id
- entity_type (order, vendor, invoice, user, etc.)
- entity_id
- action (generated, edited, approved, etc.)
- actor_type (user | system)
- actor_id (nullable)
- before_state (jsonb, nullable)
- after_state (jsonb, nullable)
- created_at

---

## Before & After States

### Purpose
Before/after snapshots allow:
- Change inspection
- Trust verification
- Debugging incorrect behavior

### Rules
- Snapshots are partial, not full records
- Only fields relevant to the action are included
- Sensitive fields are excluded

Example:
```json
{
  "before": { "final_quantity": 10 },
  "after": { "final_quantity": 12 }
}
Actor Attribution
User Actions
actor_type = user

actor_id = user_id

System Actions
actor_type = system

actor_id = null

System actions must still be logged

Audit Log Visibility
Who Can View Logs
Owner: full access

Manager: order-related logs

Staff: limited or no access (recommended)

Audit logs are read-only for all roles.

UI Presentation
Audit logs should be:

Chronological

Filterable by entity and action

Easy to scan

Example:

“Order approved by Alex (Manager)”

Avoid:

Raw JSON dumps

Technical jargon

Storage Rules
Stored in Postgres

Indexed by business_id and entity_id

Never deleted

Never updated

Retention:

Indefinite by default (subject to plan limits later)

Error Handling
If audit logging fails:

Primary action must fail safely

No silent logging failures allowed

Audit logging failures are critical errors.

Performance Considerations
Writes are lightweight

Reads are paginated

Large snapshots avoided

Audit logging must not slow core workflows.

MVP vs Later
MVP
Core entity logging

Manual inspection

Basic UI view

Later
Advanced filters

Exporting logs

Compliance tooling

Alerting on suspicious activity

Success Criteria
Users trust system actions

Developers can trace decisions

No destructive action is untraceable

Summary
Audit logging exists to:

Build trust

Provide accountability

Support debugging and learning

If an action cannot be explained later, it must be logged now.