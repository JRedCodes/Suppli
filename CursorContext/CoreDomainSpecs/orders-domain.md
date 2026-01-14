# Suppli — Orders Domain

## Purpose of This Document
This document defines the core domain model for ordering in Suppli.  
It establishes the canonical concepts, entities, states, and relationships that power all ordering workflows.

This is the **backbone** of the system. All features that touch ordering must align with this model.

---

## Domain Principles
1. **Orders are central** — everything exists to support accurate orders.
2. **Orders are explicit** — no hidden or automatic sending.
3. **Orders are reviewable** — every order can be inspected and edited.
4. **Orders are auditable** — all changes are tracked.
5. **Orders improve over time** — feedback loops refine future orders.

---

## High-Level Domain Model

Core entities:
- Order
- OrderLine
- VendorOrder
- Product
- Vendor
- Confidence
- OrderEvent (audit)

Relationships:
- One Order → many VendorOrders
- One VendorOrder → many OrderLines
- One OrderLine → one Product
- One Product → optional Vendor-specific metadata

---

## Order

### Definition
An **Order** represents a single ordering cycle generated for a business at a point in time.

Examples:
- Weekly grocery order
- Daily fresh goods order
- Promo-driven restock order

### Core Attributes
- order_id
- business_id
- created_at
- order_period (date range)
- status
- mode (Guided, Full Auto, Simulation)
- generated_by (system)
- approved_by (user, nullable)
- approved_at (nullable)

---

## Order Statuses

### Draft
- Order has been generated
- Not yet reviewed
- Editable

### Needs Review (Default in Guided Mode)
- Order requires explicit user review
- Sending/exporting is blocked until approval

### Approved
- User has approved the order
- Ready to send/export

### Sent / Exported
- Order has been formatted and sent or exported
- Immutable except for notes

### Cancelled
- Order discarded
- Retained for audit purposes

---

## VendorOrder

### Definition
A **VendorOrder** is the subset of an Order intended for a single vendor.

Each vendor receives a separate VendorOrder, formatted to their preferences.

### Core Attributes
- vendor_order_id
- order_id
- vendor_id
- ordering_method
- status (inherits from parent order)
- formatted_output (email body, CSV, printable, etc.)

Rules:
- VendorOrders cannot exist without a parent Order
- VendorOrders inherit approval state from Order

---

## OrderLine

### Definition
An **OrderLine** represents a single product and quantity within a VendorOrder.

### Core Attributes
- order_line_id
- vendor_order_id
- product_id
- recommended_quantity
- final_quantity
- unit_type (case, unit, etc.)
- confidence_level
- explanation

Rules:
- `final_quantity` defaults to `recommended_quantity`
- Edits update `final_quantity` only
- `recommended_quantity` is never overwritten

---

## Product

### Definition
A **Product** represents a sellable item in the business.

Attributes (conceptual):
- product_id
- name
- category
- unit_size
- waste_sensitive (boolean)

Products may exist without:
- SKU
- Vendor association (early MVP)

---

## Confidence Model

### Definition
Confidence represents how reliable a recommendation is.

Levels (user-facing):
- High confidence
- Moderate confidence
- Needs review

Confidence is:
- Calculated per OrderLine
- Aggregated at Order level
- Communicated clearly to users

Confidence affects:
- Required user review
- Quantity caps
- Messaging

---

## Order Generation Inputs

Order recommendations may consider:
- Sales data (if available)
- Promotions
- Previous orders
- Manual overrides
- Vendor constraints
- Conservative defaults

Order generation must:
- Be deterministic given the same inputs
- Log which inputs were used
- Never exceed safety limits without review

---

## Editing Rules

### Allowed Edits
- Quantity changes
- Removing line items
- Adding notes

### Disallowed Edits (MVP)
- Editing recommended quantity directly
- Editing historical orders
- Editing sent orders

All edits:
- Update `final_quantity`
- Generate audit events
- Feed the learning loop

---

## Approval Rules

- Approval is explicit
- Approval is required before sending/exporting (unless explicitly unlocked later)
- Approval records:
  - User
  - Timestamp
  - Mode

High-impact orders may require additional confirmation.

---

## Audit & Events

Every meaningful action creates an OrderEvent:
- Generated
- Edited
- Approved
- Sent
- Cancelled

Event attributes:
- event_type
- actor (system or user)
- timestamp
- before / after snapshot (where applicable)

Audit data is immutable.

---

## Failure & Safety Rules

- Orders must never auto-send in Guided Mode
- Missing data reduces confidence, not functionality
- Errors during generation produce partial drafts, not failures

---

## MVP vs Later

### MVP
- Single-order generation
- Manual approval
- Simple confidence levels
- Vendor-level formatting

### Later
- Recurring order schedules
- Auto-approval rules
- Cross-order optimization
- Multi-location rollups

---

## Success Criteria
- Orders are understandable
- Orders are editable
- Orders are safe
- Orders improve with use

---

## Summary
The Orders Domain defines Suppli’s core value.

If a feature does not:
- Create better orders
- Make orders safer
- Or make orders easier to review

…it does not belong in the core domain.
