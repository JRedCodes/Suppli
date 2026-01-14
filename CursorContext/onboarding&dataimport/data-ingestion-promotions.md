# Suppli — Promotions & Ads Data Ingestion

## Purpose of This Document
This document defines how Suppli ingests, interprets, and applies promotions and advertisements (promos) to improve ordering decisions.

Promotions are **contextual signals**, not strict instructions.  
They influence demand expectations but never force unsafe orders.

---

## Core Principles
1. **Low effort for users**
2. **Promos enhance, never override, sales signals**
3. **Partial promo info is acceptable**
4. **Explicit time bounds**
5. **Always explain promo impact on orders**

---

## What Counts as a Promotion
A promotion is any time-bound event expected to influence demand, including:
- Sales flyers
- Discounts
- Bundles
- Vendor-funded promotions
- In-store signage
- Holiday or seasonal pushes

Promotions may originate from:
- The business
- Vendors
- Email campaigns
- Physical flyers

---

## Supported Ingestion Methods (MVP)

### 1. File Upload (Preferred)
Supported formats:
- PDF
- Image (JPG, PNG)
- DOCX (optional later)

Behavior:
- User uploads promo material
- Suppli extracts:
  - Dates (start/end)
  - Mentioned products
  - Discount indicators (e.g., “20% off”)
- User reviews and confirms extracted data

---

### 2. Manual Entry (Lightweight)
Manual promo entry should be fast and optional.

Required fields:
- Promotion name
- Date range

Optional fields:
- Affected products
- Expected demand increase (low / medium / high)
- Notes

Example helper text:
> “If you’re not sure, Suppli will estimate conservatively.”

---

### 3. Email-Based Intake (Later)
- Connect inbox
- Detect promo emails
- Suggest promos for review
- Never auto-apply without confirmation

---

## Upload Flow (File-Based)

### Step 1: Upload
- Drag-and-drop or picker
- Immediate validation
- Show preview of document/image

### Step 2: Extraction Preview
Suppli attempts to extract:
- Dates
- Product names
- Discount language

User actions:
- Accept
- Edit
- Remove incorrect data

No extraction is applied without review.

---

### Step 3: Confirmation
- Promo saved as “Active” or “Scheduled”
- Visible in Promotions list
- Immediately influences future order previews

---

## Data Validation Rules

### Required
- Start date
- End date

### Warnings (Non-blocking)
- No products detected
- Overlapping promos
- Long-running promos (>30 days)

### Blocking Errors
- Invalid or missing date range
- Unsupported file type

---

## How Promotions Affect Ordering (MVP)

Promotions influence:
- Demand uplift estimation
- Confidence messaging
- Conservative quantity buffers

Promotions do NOT:
- Force large quantity increases
- Override sales trends
- Auto-add new products without review

---

## Demand Uplift Modeling (Conceptual)

Initial uplift categories:
- Low
- Medium
- High

Rules:
- Default to Low when uncertain
- Increase cautiously
- Require user review for High uplift

Example explanation:
> “This item was increased slightly due to an active promotion.”

---

## Time Awareness
- Promotions are strictly time-bound
- Orders generated outside the promo window are unaffected
- Expired promos are archived automatically

---

## User Messaging Standards
- Use neutral, supportive language
- Avoid marketing jargon

Good:
> “This promotion may increase demand.”

Bad:
> “This promotion will boost sales significantly.”

---

## Visibility in UI
Promotions should be visible:
- On order review screens (as context)
- In product-level explanations
- In a dedicated Promotions section

Users should always understand *why* a promo mattered.

---

## Error Handling & Recovery

### Failed Upload
- Explain why
- Allow retry
- Allow manual entry instead

### Bad Extraction
- User can fully override AI guesses
- No hidden assumptions

---

## Security & Privacy
- Uploaded files are scoped to the business
- No cross-tenant access
- Files are stored securely and scanned

---

## MVP vs Later

### MVP
- File upload
- Manual entry
- Conservative uplift logic
- Explicit confirmation

### Later
- Email inbox parsing
- Vendor-fed promos
- Automatic promo suggestions
- Historical promo performance tracking

---

## Success Criteria
- Promo can be added in under 2 minutes
- Promo impact is visible but not risky
- Users trust that promos won’t cause over-ordering

---

## Summary
Promotion ingestion exists to:
- Capture real-world context
- Improve ordering accuracy
- Reduce missed opportunities

If promotions introduce risk or complexity, they should be simplified or ignored.
