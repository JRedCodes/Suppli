# Suppli — Invoice Verification

## Purpose of This Document
This document defines how Suppli ingests vendor invoices, parses their contents, and compares them against approved orders.

Invoice verification closes the loop between **what was ordered** and **what was delivered**, enabling trust, accountability, and continuous learning.

---

## Core Principles
1. **Invoices are evidence, not truth**
2. **Verification is assistive, not accusatory**
3. **User always has final judgment**
4. **Mismatches are surfaced clearly**
5. **Verification improves future orders**

---

## What Counts as an Invoice
An invoice may be:
- Paper invoice (photo)
- PDF invoice
- Digital invoice export

Invoices may contain:
- Line items
- Quantities
- Prices
- Fees
- Substitutions
- Notes

Suppli does not assume invoices are standardized or clean.

---

## Supported Ingestion Methods (MVP)

### 1. Photo Upload (Primary)
- Mobile or desktop camera
- JPG / PNG formats

### 2. PDF Upload
- Single or multi-page PDFs

### 3. Manual Entry (Fallback)
- Used only if parsing fails
- Minimal required fields

---

## Invoice Upload Flow

### Step 1: Upload
- Drag-and-drop or camera capture
- Validate file type and size
- Immediate preview

### Step 2: Parsing
Suppli attempts to extract:
- Vendor name
- Invoice date
- Line items
- Quantities
- Prices (if available)

Parsing runs asynchronously.

---

### Step 3: Order Matching
Suppli attempts to link the invoice to:
- The most recent approved order
- Matching vendor
- Matching date range

If multiple matches exist:
- User selects the correct order

---

## Comparison Logic

Invoice line items are compared against approved OrderLines.

Comparison dimensions:
- Product match (name or SKU)
- Quantity ordered vs delivered
- Unit consistency
- Price differences (if known)

Matches are classified as:
- Exact match
- Partial match
- Mismatch
- Unmatched item

---

## Mismatch Types

### Quantity Mismatch
- Delivered quantity ≠ approved quantity

### Missing Item
- Ordered item not present on invoice

### Extra Item
- Item present on invoice but not ordered

### Price Discrepancy (Later MVP+)
- Unit price differs from expected

---

## UI Presentation

### Invoice Detail View
Displays:
- Original invoice image/PDF
- Parsed line items
- Side-by-side comparison with order
- Highlighted mismatches

Visual rules:
- Use icons + text
- Avoid alarming colors
- Group mismatches by type

---

## User Actions

For each mismatch, user can:
- Mark as acceptable
- Flag for follow-up
- Add a note

Suppli may suggest:
- “Contact vendor”
- “Adjust future orders”

---

## Learning Loop Integration

Invoice results feed back into:
- Vendor reliability signals
- Quantity confidence adjustments
- Promo uplift accuracy

Rules:
- No automatic penalties
- Trends matter more than single events

---

## Error Handling

### Parsing Failure
- Explain what couldn’t be read
- Allow manual correction
- Never silently fail

### Ambiguous Matches
- Ask user to resolve
- Do not auto-assume

---

## Messaging Standards

Tone:
- Neutral
- Non-accusatory

Good:
> “This item quantity differs from the approved order.”

Bad:
> “Vendor delivered incorrect quantity.”

---

## Security & Privacy
- Invoice files are business-scoped
- Secure storage
- No cross-tenant access
- Files can be deleted by authorized users

---

## MVP vs Later

### MVP
- Photo/PDF upload
- Basic OCR
- Quantity comparison
- Manual review

### Later
- Price verification
- Automated vendor follow-up drafts
- Accuracy scoring
- Invoice ingestion from email

---

## Success Criteria
- Users can quickly spot mismatches
- Users trust Suppli’s comparison
- Invoice insights improve ordering accuracy

---

## Summary
Invoice verification exists to:
- Protect the business
- Close the feedback loop
- Improve future orders

If verification feels accusatory or confusing, it should be simplified.
