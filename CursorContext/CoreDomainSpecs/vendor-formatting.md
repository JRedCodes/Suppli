# Suppli — Vendor Formatting

## Purpose of This Document
This document defines how Suppli formats orders for different vendor ordering methods (email, phone, portal, in-person).
Vendor formatting exists to reduce friction, match real-world workflows, and ensure vendors receive orders in formats they can use without confusion.

Formatting must be **predictable, clear, and vendor-specific**.

---

## Core Principles
1. **Match vendor expectations**
2. **Clear over clever**
3. **Previewable before sending**
4. **No assumptions about vendor systems**
5. **Formatting never changes order data**

---

## Ordering Methods & Output Formats

### 1. Email Ordering

#### Output
- Plain text email body
- Structured order list
- Clear subject line

#### Email Structure
- Subject: "Order for [Business Name] - [Date]"
- Body:
  - Greeting
  - Order date/period
  - Itemized list
  - Closing

#### Item Format
- Product name
- Quantity
- Unit (case/unit)
- Optional: SKU if available

Rules:
- Clear numbering
- Simple phrasing
- No optional data unless requested

---

### 2. Phone Ordering

#### Output
- Phone script
- Itemized list
- Grouped logically (by category if applicable)

#### Script Structure
- Opening: "Hi, I'd like to place an order for [Business Name]"
- Date/period reference
- Item list (readable over phone)
- Closing: "That's everything, thank you"

Rules:
- Clear numbering
- Simple phrasing
- No optional data unless requested

---

### 3. Portal Ordering

#### Output
- CSV file
- Copyable table

Default CSV Columns:
- SKU (if available)
- Product Name
- Quantity
- Unit

Rules:
- No assumptions about portal format
- Allow user to download and upload manually
- Column order configurable per vendor (later)

---

### 4. In-Person Ordering

#### Output
- Printable order sheet

Structure:
- Business header
- Vendor name
- Order date
- Item table

Rules:
- Designed for printing
- No hidden fields
- Large, readable text

---

## Formatting Rules & Conventions

### Quantities
- Always explicit
- No ranges
- Units always shown

### Product Naming
- Default to product name
- SKU shown if available and required
- Avoid truncation

---

## Vendor-Specific Overrides

Optional per vendor:
- Group by category
- Show SKU instead of name
- Include prices (if known)
- Custom headers/footers

Overrides must:
- Be previewable
- Not affect internal order data

---

## Preview & Review

Before sending/exporting:
- User sees a preview of the exact output
- Output is read-only
- User can return to edit order if needed

---

## Error Handling

### Missing Data
If required vendor info is missing:
- Block formatting
- Explain what’s missing
- Provide direct link to fix vendor

Example:
> “Email address missing for this vendor.”

---

## Audit Logging
Every formatting/export action logs:
- Vendor
- Output type
- Timestamp
- User

No content changes are logged here—only actions.

---

## MVP vs Later

### MVP
- Plain text outputs
- Manual sending
- Fixed templates
- Simple CSV exports

### Later
- HTML emails
- Direct sending
- Portal integrations
- Vendor template library

---

## Success Criteria
- Vendors can read orders without clarification
- Users trust that outputs match approvals
- No formatting-related order mistakes

---

## Summary
Vendor formatting exists to:
- Reduce friction
- Match real-world workflows
- Make Suppli feel dependable

If formatting causes confusion, it must be simplified—not expanded.
