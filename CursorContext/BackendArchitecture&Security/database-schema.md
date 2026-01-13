# Suppli — Database Schema

## Purpose of This Document
This document defines Suppli’s core database schema, table responsibilities, and relationships.
It is designed for Supabase (Postgres) with Row Level Security (RLS) enforced at all times.

The schema prioritizes:
- Multi-tenant safety
- Auditability
- Expandability
- Predictable querying

---

## Core Design Principles
1. **Every table is tenant-scoped**
2. **No shared mutable state across businesses**
3. **Immutable records where possible**
4. **Audit over overwrite**
5. **Explicit relationships over inferred ones**

---

## Tenant Model

### businesses
Represents a single business entity.

Fields:
- id (uuid, pk)
- name
- business_type
- timezone
- currency
- created_at

Rules:
- Every other table references `businesses.id`
- No cross-business joins allowed

---

### users
Represents an authenticated user.

Fields:
- id (uuid, pk, from Supabase Auth)
- email
- created_at

Note:
- User identity is global
- Permissions are business-scoped

---

### business_users
Join table for users ↔ businesses.

Fields:
- id (uuid, pk)
- business_id (fk)
- user_id (fk)
- role (owner | manager | staff)
- created_at

Rules:
- A user may belong to multiple businesses
- Role determines permissions

---

## Vendor & Product Tables

### vendors
Fields:
- id (uuid, pk)
- business_id (fk)
- name
- ordering_method (email | phone | portal | in_person)
- contact_email (nullable)
- contact_phone (nullable)
- portal_url (nullable)
- created_at
- archived_at (nullable)

---

### products
Fields:
- id (uuid, pk)
- business_id (fk)
- name
- category (nullable)
- waste_sensitive (boolean)
- created_at
- archived_at (nullable)

Products are business-specific.

---

### vendor_products (optional MVP-light)
Maps products to vendors.

Fields:
- id (uuid, pk)
- business_id (fk)
- vendor_id (fk)
- product_id (fk)
- sku (nullable)
- unit_type (case | unit)
- created_at

---

## Orders Domain Tables

### orders
Fields:
- id (uuid, pk)
- business_id (fk)
- order_period_start
- order_period_end
- status (draft | needs_review | approved | sent | cancelled)
- mode (guided | full_auto | simulation)
- created_at
- approved_at (nullable)
- approved_by (nullable, fk → users)

---

### vendor_orders
Fields:
- id (uuid, pk)
- business_id (fk)
- order_id (fk)
- vendor_id (fk)
- ordering_method
- created_at

---

### order_lines
Fields:
- id (uuid, pk)
- business_id (fk)
- vendor_order_id (fk)
- product_id (fk)
- recommended_quantity
- final_quantity
- unit_type
- confidence_level (high | moderate | needs_review)
- explanation
- created_at

Rules:
- `recommended_quantity` is immutable
- `final_quantity` is user-editable

---

## Order Audit & Events

### order_events
Fields:
- id (uuid, pk)
- business_id (fk)
- order_id (fk)
- event_type (generated | edited | approved | sent | cancelled)
- actor_type (system | user)
- actor_id (nullable)
- before_snapshot (jsonb, nullable)
- after_snapshot (jsonb, nullable)
- created_at

Used for:
- Auditing
- Debugging
- Trust & transparency

---

## Sales & Promotions

### sales_events
Fields:
- id (uuid, pk)
- business_id (fk)
- product_id (fk)
- date
- quantity
- source (pos | upload | manual)
- created_at

Sales data is append-only.

---

### promotions
Fields:
- id (uuid, pk)
- business_id (fk)
- name
- start_date
- end_date
- uplift_level (low | medium | high)
- created_at
- archived_at (nullable)

---

### promotion_products
Fields:
- id (uuid, pk)
- business_id (fk)
- promotion_id (fk)
- product_id (fk)

---

## Invoice Verification

### invoices
Fields:
- id (uuid, pk)
- business_id (fk)
- vendor_id (fk)
- order_id (nullable fk)
- file_path
- status (pending | matched | mismatch)
- created_at

---

### invoice_lines
Fields:
- id (uuid, pk)
- business_id (fk)
- invoice_id (fk)
- product_name
- product_id (nullable fk)
- quantity
- unit
- price (nullable)
- created_at

---

### invoice_mismatches
Fields:
- id (uuid, pk)
- business_id (fk)
- invoice_id (fk)
- order_line_id (nullable)
- mismatch_type (missing | extra | quantity | price)
- notes (nullable)
- resolved (boolean)
- created_at

---

## Files & Uploads

### files
Fields:
- id (uuid, pk)
- business_id (fk)
- file_type (sales | promo | invoice)
- storage_path
- uploaded_by (fk → users)
- created_at

---

## Learning & Confidence (MVP-light)

### learning_adjustments
Fields:
- id (uuid, pk)
- business_id (fk)
- product_id (fk)
- adjustment_type (quantity_bias)
- adjustment_value
- created_at

Used to store conservative learning signals.

---

## Indexing Strategy
Indexes should exist on:
- business_id (all tables)
- order_id (order-related tables)
- vendor_id (vendor_orders, invoices)
- product_id (order_lines, sales_events)

---

## RLS Expectations
- All tables enforce `business_id` isolation
- Reads/writes allowed only via business membership
- Service role used only for background jobs

---

## MVP vs Later

### MVP
- Core tables only
- Minimal joins
- Manual migrations

### Later
- Partitioning for large tables
- Read replicas
- Materialized views for insights

---

## Summary
This schema exists to:
- Prevent data leaks
- Support auditing
- Enable confident automation
- Scale without rewrites

If a table cannot be safely tenant-scoped, it should not exist.
