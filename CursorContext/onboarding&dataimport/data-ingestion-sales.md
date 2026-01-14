# Suppli — Sales Data Ingestion

## Purpose of This Document
This document defines how Suppli ingests, validates, stores, and uses sales data.  
The goal is to improve ordering accuracy while keeping ingestion optional, low-friction, and safe.

Sales data is a **quality multiplier**, not a hard requirement.

---

## Core Principles
1. **Optional, not required**
2. **Partial data is better than no data**
3. **Never block ordering due to missing data**
4. **Validate aggressively, fail gracefully**
5. **Sales data improves confidence, not authority**

---

## Supported Ingestion Methods (MVP)

### 1. POS Integration (Preferred)
- OAuth-style connection where possible
- Read-only access
- Pull item-level sales by date

Examples:
- Square
- Clover
- Toast (future)

Behavior:
- Scheduled sync (daily)
- Manual refresh available
- Sync failures do not block ordering

---

### 2. File Upload (CSV / Excel)
Supported formats:
- `.csv`
- `.xlsx`

Expected minimum columns:
- Date (or timestamp)
- Item identifier (SKU or name)
- Quantity sold

Optional columns:
- Revenue
- Category
- Unit size
- Vendor

Rules:
- Column names do not need to match exactly
- AI-assisted column mapping is allowed
- User must confirm mapping before import

---

### 3. Manual Baseline (Fallback)
Used when no integration or files are available.

Required inputs:
- Top selling items (up to 20)
- Typical weekly order size (bucketed)
- Waste-sensitive items (optional)

Purpose:
- Prevent catastrophic over/under-ordering
- Establish conservative starting bounds

---

## Upload Flow (File-Based)

### Step 1: Upload
- Drag-and-drop or file picker
- Validate file type and size
- Immediate feedback on invalid files

### Step 2: Column Mapping
- Show detected columns
- Allow user to map:
  - Date
  - Item
  - Quantity
- Highlight missing required fields
- Save mapping for future uploads

### Step 3: Validation Preview
- Show sample rows
- Detect:
  - Invalid dates
  - Negative quantities
  - Missing items
- Allow user to fix or continue with warnings

### Step 4: Import & Confirmation
- Import runs asynchronously
- User sees success or partial-success message
- Failures are logged, not silent

---

## Data Validation Rules

### Required
- Dates must be parseable
- Quantities must be numeric and ≥ 0
- Item identifier must exist or be creatable

### Warnings (Non-blocking)
- Sparse data
- Gaps in date ranges
- Unusually large quantities
- Duplicate rows

### Blocking Errors
- No date column
- No quantity column
- File unreadable or empty

---

## Storage Model (Conceptual)
Sales data is stored as immutable events.

Each record includes:
- business_id
- item_id (or temporary identifier)
- date
- quantity
- source (POS, upload, manual)
- ingestion_timestamp

Edits:
- Never overwrite raw sales data
- Corrections are stored as adjustment records

---

## How Sales Data Is Used (MVP)

Sales data influences:
- Demand baselines
- Trend detection (up/down)
- Conservative quantity caps
- Confidence scoring

Sales data does NOT:
- Auto-send orders
- Override manual edits
- Force large quantity changes

---

## Time Windows
Default windows:
- Minimum useful data: 7 days
- Recommended: 30–90 days
- Older data weighted less heavily

Gaps are allowed and expected.

---

## Confidence Impact
Sales data increases confidence gradually.

Examples:
- No data → Guided Mode, low confidence
- Partial data → Moderate confidence
- Consistent data → Higher confidence, fewer guards

Confidence must always be communicated to the user.

---

## Error Handling & Recovery

### Upload Failure
- Clear explanation
- Offer retry
- Provide template download

### Mapping Errors
- Inline warnings
- Allow remapping
- Save user choices

### Integration Failure
- Notify user
- Fall back to last known data
- Never block order generation

---

## User Messaging Standards
Use supportive language:

Good:
> “Sales data helps Suppli avoid over-ordering.”

Bad:
> “Sales data required for accuracy.”

Never imply blame or punishment for missing data.

---

## Security & Privacy
- Read-only access for integrations
- Business-level isolation (RLS)
- Files scanned and validated
- No sharing across tenants

---

## MVP vs Later

### MVP
- CSV/XLS upload
- Manual baseline
- One-time or manual refresh
- Simple trend usage

### Later
- Automatic POS sync
- Incremental updates
- Category-level aggregation
- Multi-location data handling

---

## Success Criteria
- User can upload sales data in under 3 minutes
- Partial data improves recommendations without risk
- Missing data does not block ordering
- Errors are understandable and recoverable

---

## Summary
Sales data ingestion exists to:
- Improve accuracy safely
- Reduce early conservative limits
- Build trust over time

If ingestion creates friction or fear, it should be simplified.
