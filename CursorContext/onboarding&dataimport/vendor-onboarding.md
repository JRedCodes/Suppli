# Suppli — Vendor Onboarding

## Purpose of This Document
This document defines how vendors are added, configured, and standardized in Suppli.
Vendors are foundational: ordering cannot function correctly without clear vendor context.

Vendor onboarding must be **fast, forgiving, and extensible**.

---

## Core Principles
1. **A vendor can be added in under 2 minutes**
2. **Only collect what’s needed to place an order**
3. **Vendor complexity scales over time**
4. **Formatting rules must be explicit**
5. **Vendors never block order generation**

---

## Vendor Definition (Conceptual)
A vendor represents any external party that fulfills product orders.

Examples:
- Food distributor
- Beverage supplier
- Local wholesaler
- Specialty vendor

Each vendor has:
- Identity
- Ordering method
- Formatting rules
- Optional constraints

---

## Minimum Vendor Requirements (MVP)

Required fields:
- Vendor name
- Ordering method:
  - Email
  - Phone
  - Portal
  - In-person
- Contact detail based on method:
  - Email address
  - Phone number
  - Portal URL (optional)
- Default currency (inherits from business if not set)

These are the **minimum required to generate a vendor-ready order**.

---

## Optional Vendor Fields (Progressive)

Optional fields may be added later without breaking functionality:
- Order cutoff time
- Minimum order value
- Delivery days
- Lead time (days)
- Notes (free text)

These fields influence ordering safety but are never mandatory.

---

## Vendor Onboarding Flow

### Entry Points
- During onboarding (required to add at least one vendor)
- From Vendors list page
- From Order Review (suggestion to add missing vendor)

### Flow Structure
1. Basic info
2. Ordering method
3. Optional rules
4. Save

Vendor creation should:
- Use a modal for MVP
- Allow saving with only required fields
- Avoid multi-step wizards unless complexity demands it

---

## Ordering Methods & Behavior

### Email
- Suppli generates:
  - Email subject
  - Email body with formatted order
- User sends manually (MVP)
- Later: optional send via connected inbox

Required:
- Email address

---

### Phone
- Suppli generates:
  - Clear phone script
  - Item list grouped logically
- No automated calling in MVP

Required:
- Phone number

---

### Portal
- Suppli generates:
  - CSV or copyable format
  - Portal-friendly SKU list

Required:
- Portal URL (optional but recommended)

---

### In-Person
- Suppli generates:
  - Printable order sheet
  - Clear formatting

Required:
- None beyond vendor name

---

## Vendor Formatting Rules

Formatting rules define how orders appear.

Examples:
- Group by category
- Show case vs unit quantities
- Use SKU vs product name
- Include prices or not

Rules:
- Formatting is vendor-specific
- Defaults are conservative
- User can override later

---

## Product / SKU Association (MVP-Light)

Initial approach:
- Products may exist without SKU mapping
- SKU mapping is optional in MVP
- Suppli can use product names initially

Later:
- Vendor-specific SKU catalogs
- Price lists
- Unit conversion rules

---

## Error Handling & Validation

### Required Field Errors
- Clear inline errors
- No blocking beyond missing essentials

### Formatting Conflicts
- Default to safe formatting
- Surface warnings, not errors

Example:
> “This vendor prefers SKUs, but none are set yet.”

---

## Editing Vendors

Allowed:
- Change contact info
- Change ordering method
- Update formatting rules

Rules:
- Changes do not retroactively alter past orders
- All changes are logged

---

## Deleting Vendors

Rules:
- Vendor cannot be deleted if linked to active orders
- Soft-delete preferred
- Confirmation required

---

## Permissions

Who can:
- Add vendors: Owner, Manager
- Edit vendors: Owner, Manager
- View vendors: All roles
- Delete vendors: Owner only (recommended)

---

## MVP vs Later

### MVP
- Basic vendor profiles
- Manual sending
- Simple formatting
- Minimal constraints

### Later
- Vendor portals integrations
- Price list ingestion
- Automated sending
- Vendor accuracy scoring

---

## Success Criteria
- Vendor added quickly without friction
- Orders can be generated immediately after adding
- Vendor-specific formatting prevents confusion

---

## Summary
Vendor onboarding exists to:
- Enable ordering
- Reduce formatting chaos
- Support real-world vendor diversity

If vendor setup feels heavy, it should be simplified.
If vendor setup feels risky, add guardrails—not fields.
