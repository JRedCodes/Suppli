# Suppli — Order Review UI

## Purpose of This Document
This document defines the structure, behavior, and requirements of the **Order Review** experience—the most critical screen in Suppli.

The Order Review UI exists to:
- Build trust
- Prevent costly mistakes
- Make decisions understandable
- Allow fast, confident approval

If this screen fails, the product fails.

---

## Core Principles
1. **Review before risk** — no silent sending in early usage
2. **Explain before expect** — every quantity has a reason
3. **Edit without penalty** — user changes are first-class
4. **Confidence is visible** — uncertainty is never hidden
5. **One clear decision** — approve or revise

---

## Entry Points
The Order Review UI is accessed from:
- Orders list (“Needs review” status)
- Onboarding first-order preview
- Regenerated orders

Route:
- `/orders/:orderId`

---

## Page Layout (High-Level)

### Page Header
Required elements:
- Order title (e.g., “Weekly Order — Sep 12–18”)
- Order status badge (“Needs review”)
- Order mode (“Guided Mode” indicator)
- Primary action: **Approve Order**
- Secondary actions: Save Draft, Export/Send (disabled until approved)

---

### Order Summary Section
Purpose:
- Give a quick sense of scale and risk

Contents:
- Total number of items
- Number of vendors
- High-level confidence indicator
- Warnings (if any)

Examples:
- “3 items need review”
- “Limited sales data used”

---

## Vendor Breakdown

Orders are grouped by vendor.

### Vendor Section Header
For each vendor:
- Vendor name
- Ordering method icon (email, phone, portal, in-person)
- Vendor-specific warning (if applicable)

Actions:
- Expand / collapse
- Preview formatted output

---

### Order Line Table (Per Vendor)

Required columns:
- Product name
- Recommended quantity
- Final quantity (editable)
- Unit (case/unit)
- Confidence indicator
- Explanation (inline or expandable)

Rules:
- Editable quantity field affects `final_quantity`
- `recommended_quantity` remains visible and unchanged
- Inline edits update immediately

---

## Quantity Editing Behavior

### Editing Rules
- Quantity edits are allowed inline
- Edits update `final_quantity` only
- Large changes trigger inline warnings

Example:
> “This change is larger than usual.”

---

### Undo & Reset
- User can reset a line to recommended quantity
- Bulk reset allowed per vendor

---

## Confidence & Explanation UX

### Confidence Display
- Text label (“High confidence”, “Needs review”)
- Subtle color usage
- Icon optional

### Explanation Display
- Short, readable sentences
- Expandable for more detail

Examples:
- “Based on recent sales.”
- “Adjusted slightly due to promotion.”
- “Conservative estimate due to limited data.”

---

## Warnings & Risk Indicators

Warnings appear when:
- Data is limited
- Promotions conflict with sales trends
- Large quantity swings occur
- Vendor constraints may be violated

Rules:
- Warnings do not block edits
- Warnings do not auto-dismiss
- Language is calm and informative

---

## Approval Flow

### Approve Order Button
- Disabled until all required reviews are complete
- Label: “Approve Order”

### Approval Confirmation (Conditional)
Shown when:
- Order total exceeds a threshold
- Large changes from previous order

Confirmation copy:
> “You’re about to approve this order. You can still make changes later.”

---

### After Approval
- Status updates to “Approved”
- Export/Send actions unlock
- Order becomes read-only (except notes)

---

## Export / Send Actions

Available only after approval.

Behavior depends on vendor method:
- Email → Show email preview
- Phone → Show call script
- Portal → Show CSV / instructions
- In-person → Show printable sheet

Rules:
- Suppli does not auto-send in MVP
- User must initiate send/export

---

## History & Audit Trail

Accessible via “History” tab.

Shows:
- Generated time
- Edits (before/after)
- Approval
- Sending/exporting

Format:
> “Quantity changed from 10 → 12 by Jordan (Manager)”

---

## Empty & Edge States

### No Order Lines
- Explain why
- Suggest next step

### Partial Failures
- Flag affected items
- Allow rest of order to proceed

---

## Accessibility Requirements
- Table rows navigable by keyboard
- Inline inputs accessible
- Explanations readable by screen readers
- Focus returns predictably after actions

---

## MVP vs Later

### MVP
- Manual approval
- Inline quantity edits
- Conservative warnings
- Vendor-by-vendor breakdown

### Later
- Bulk approvals
- Auto-approval rules
- Keyboard shortcuts for power users
- Inline inventory context

---

## Success Criteria
- User understands why each quantity exists
- User feels safe approving the order
- Edits decrease over time
- No accidental sends

---

## Summary
The Order Review UI exists to:
- Make risk visible
- Keep users in control
- Build long-term trust

If users hesitate to approve orders here, the UI—not the user—is at fault.
