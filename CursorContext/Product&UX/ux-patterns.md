# Suppli — UX Patterns

## Purpose of This Document
This document defines standardized UX interaction patterns used throughout Suppli.  
Its goal is to ensure consistency, predictability, and accessibility across all flows while preventing ad-hoc UI decisions that cause fragmentation.

If a new feature does not fit an existing pattern, the pattern should be extended deliberately—not bypassed.

---

## Core UX Principles
1. **Predictability beats novelty**
2. **Low confidence → more user control**
3. **High confidence → reduced friction**
4. **Every screen answers: “What should I do next?”**
5. **Mistakes should be hard; recovery should be easy**

---

## Global Interaction Patterns

### Primary Action Pattern
Each page or major section has **one primary action**.

Examples:
- Orders list → “Generate Orders”
- Vendors list → “Add Vendor”
- Order detail → “Approve Order”

Rules:
- Only one primary action per view
- Primary action is visually emphasized
- Secondary actions are neutral or tucked into menus

---

### Secondary & Destructive Actions
- Secondary actions are visually quieter
- Destructive actions:
  - Must be labeled clearly
  - Require confirmation
  - Are never styled as primary

Examples:
- “Delete Vendor”
- “Discard Draft Order”

---

## List → Detail Pattern (Foundational)

### List Pages
Used for:
- Orders
- Vendors
- Promotions
- Invoices

Characteristics:
- Table-based
- Filterable
- Sortable
- Paginated

Required elements:
- Clear empty state
- Bulk actions only when safe
- Row-level actions via menus

### Detail Pages
Used for:
- Single order
- Vendor
- Invoice
- Promotion

Characteristics:
- Clear header with entity name
- Tabs for secondary content
- Primary action always visible

---

## Tabs Pattern
Tabs are used to separate **related but non-sequential content**.

Rules:
- No more than 5 tabs
- Tab labels are nouns (“Overview”, “History”)
- Tabs should not hide critical actions

Bad use:
- Step-by-step workflows
- Conditional logic

---

## Wizard / Guided Flow Pattern

Used for:
- Onboarding
- Sales data import
- Vendor setup (advanced cases)

Characteristics:
- Clear step indicator
- Ability to skip optional steps
- Save progress automatically

Rules:
- Never trap users
- Always explain why a step matters
- Avoid more than 5 steps in MVP

---

## Order Generation & Review Pattern (Critical)

### Generation
- User initiates generation manually (MVP)
- System clearly states:
  - Data used
  - Confidence level
  - Known limitations

### Review
Order review screen must:
- Default to “Needs Review” in Guided Mode
- Highlight changes vs previous order
- Explain *why* quantities were chosen
- Allow inline edits

### Approval
Approval is explicit:
- Button label: “Approve Order”
- Confirmation only if high financial impact

---

## Confidence & Risk Communication Pattern

Confidence is always communicated visually and verbally.

Examples:
- “High confidence”
- “Learning”
- “Needs review”

Rules:
- Confidence labels must be understandable without tooltips
- Color is secondary to text
- Low confidence increases required confirmation

---

## Empty State Pattern

Empty states must:
- Explain *why* the state is empty
- Tell the user what to do next
- Never feel like an error

Example:
> “No vendors yet. Add your first vendor to generate orders.”

Never:
- Blame the user
- Show raw errors

---

## Loading & Async States

### Loading
- Skeletons preferred over spinners for tables
- Inline loaders for small actions
- Global loading indicators avoided

### Async Feedback
- Optimistic updates where safe
- Clear rollback messaging on failure

---

## Error Handling Pattern

Errors should be:
- Calm
- Specific
- Actionable

Structure:
1. What happened
2. Why it matters (if relevant)
3. What to do next

Avoid:
- Stack traces
- Technical jargon
- Generic “Something went wrong”

---

## Notifications & Toasts

Used for:
- Confirmation of actions
- Non-blocking alerts

Rules:
- Auto-dismiss after short duration
- Not used for critical errors
- Not stacked excessively

Critical issues belong inline or in modals.

---

## Modals & Dialogs

### Use Modals For
- Confirmations
- Small edits
- Quick creates

### Avoid Modals For
- Long forms
- Multi-step flows
- Data-heavy views

Accessibility:
- Focus trapped
- ESC closes non-destructive modals
- Clear primary action

---

## Forms & Input Patterns

Rules:
- One column by default
- Group related fields
- Inline validation preferred
- Errors shown near inputs

Do not:
- Validate only on submit
- Hide required fields behind toggles

---

## Permissions & Access Pattern

When users lack permission:
- Show the feature disabled
- Explain why access is restricted
- Provide next step (“Contact admin”)

Never:
- Hide features without explanation
- Show cryptic authorization errors

---

## Audit & History Pattern

Used for:
- Orders
- Invoices
- Vendor changes

Rules:
- Read-only
- Chronological
- Clear actor attribution

Example:
> “Quantity edited from 10 → 12 by Alex (Manager)”

---

## Progressive Disclosure Pattern

Advanced options:
- Hidden by default
- Revealed via “Advanced” toggles
- Remember user preference where possible

Avoid overwhelming first-time users.

---

## MVP vs Later

### MVP
- Conservative flows
- Explicit confirmations
- Manual approvals
- Clear explanations everywhere

### Later
- More automation
- Fewer confirmations
- Background processing
- Power-user shortcuts

---

## Summary
UX patterns in Suppli exist to:
- Build trust
- Prevent costly mistakes
- Reduce cognitive load
- Scale without redesign

If a new interaction breaks an established pattern, it must be reviewed and justified.
