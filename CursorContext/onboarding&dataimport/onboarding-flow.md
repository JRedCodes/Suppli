# Suppli — Onboarding Flow

## Purpose of This Document
This document defines Suppli’s onboarding experience from first login to first successful order.  
The goal is to minimize setup friction, prevent early trust-breaking mistakes, and clearly communicate that accuracy improves over time.

Onboarding is not a checklist to “complete.” It is a **guided path to a safe first order**.

---

## Onboarding Principles
1. **Conservative by default** — prevent costly mistakes early.
2. **Progressive disclosure** — ask only what’s necessary now.
3. **Optional, not blocking** — sales data improves accuracy but is not required.
4. **Explain value, not mechanics** — why a step matters, not how AI works.
5. **Clear exit points** — users can skip optional steps and continue.

---

## High-Level Flow
1. Account created / first login
2. Business context
3. Vendor setup (minimum one)
4. Sales data (optional but encouraged)
5. First order preview
6. Finish + next steps

---

## Entry Point
**Route:** `/onboarding`

Conditions:
- Triggered for new businesses
- Re-enterable if onboarding is incomplete
- Sidebar hidden or limited during onboarding

UI:
- Progress indicator (steps, not percentages)
- Clear “Skip for now” where applicable

---

## Step 1: Welcome & Expectations

**Route:** `/onboarding/welcome`

Purpose:
- Set expectations
- Reduce anxiety around automation and accuracy

Key Copy:
> “Suppli starts conservative and improves as it learns your store.  
> You’re always in control.”

What We Communicate:
- Orders are reviewed before sending
- Accuracy improves naturally with usage
- Sales data is helpful but optional

Primary Action:
- “Get Started”

---

## Step 2: Business Context

**Route:** `/onboarding/business`

Purpose:
- Collect minimal context to prevent obviously bad orders

Required Fields:
- Business name
- Business type (select)
- Location (city/state or region)
- Timezone

Optional Fields:
- Approximate weekly sales range (bucketed, not exact)
- Primary category (if multi-category business)

Rules:
- No long forms
- No financial details
- No inventory counts

Why This Matters (helper text):
> “This helps Suppli avoid unrealistic order sizes.”

Primary Action:
- “Continue”

---

## Step 3: Vendor Setup (Required)

**Route:** `/onboarding/vendors`

Purpose:
- Orders cannot exist without vendors
- This is the minimum viable setup

Required:
- Add at least one vendor

Vendor Fields (MVP):
- Vendor name
- Ordering method:
  - Email
  - Phone
  - Portal
  - In-person
- Contact info (based on method)

Optional (can be skipped):
- Cutoff times
- Minimum order amounts
- SKU list upload

UX Rules:
- “Add vendor” opens a modal
- Allow adding vendors later
- Keep it fast (1–2 minutes)

Primary Action:
- “Add Vendor”
- Then: “Continue”

---

## Step 4: Sales Data (Optional but Strongly Encouraged)

**Route:** `/onboarding/sales-data`

Purpose:
- Improve early accuracy
- Reduce conservative limits faster

Messaging (Important):
> “Sales data helps Suppli avoid over-ordering.  
> You can skip this and add it later.”

Options:
1. Connect POS (if available)
2. Upload CSV / Excel
3. Skip for now

Rules:
- Never block progression
- Never shame skipping
- Show benefit clearly

Visual:
- “Accuracy improves with data” indicator
- Simple comparison: With data vs Without data

Primary Action:
- “Upload Sales Data” or “Skip for Now”

---

## Step 5: First Order Preview (Critical)

**Route:** `/onboarding/first-order`

Purpose:
- Show immediate value
- Set expectations for Guided Mode

Behavior:
- Generate a **preview order**
- Clearly label it as:
  - “Preview”
  - “Needs review”
  - “Learning”

UI Requirements:
- Show confidence indicators
- Show explanations per item
- No auto-send

Key Copy:
> “Review this order before sending. Suppli will learn from any changes you make.”

Primary Actions:
- “Review Order”
- “Finish Setup”

---

## Step 6: Finish & Next Steps

**Route:** `/onboarding/finish`

Purpose:
- Transition user into normal app flow

Content:
- Confirmation that setup is complete
- What to expect next:
  - Orders require review
  - Accuracy improves over time
  - Sales data can be added anytime

Suggested CTAs:
- “Go to Orders”
- “Add Another Vendor”
- “Upload Sales Data”

---

## Guided Mode (Default State)

### Definition
All new businesses start in **Guided Mode**.

Guided Mode Behavior:
- Orders default to “Needs review”
- Conservative quantity caps
- Clear explanations required
- No auto-sending

Exit Criteria (Future):
- Sales data connected OR sufficient history
- Consistent approval behavior

---

## Skip Logic & Re-Entry
- Users can skip sales data and advanced vendor setup
- Skipped steps are surfaced later as suggestions, not blocks
- Onboarding can be resumed if interrupted

---

## Failure States & Recovery

### If vendor setup fails:
- Explain what’s missing
- Keep user in onboarding
- Do not throw generic errors

### If sales data upload fails:
- Allow retry
- Offer template download
- Allow skipping

---

## Accessibility Requirements
- Keyboard navigable
- Screen-reader friendly step announcements
- Clear focus management between steps
- No time-based pressure

---

## MVP vs Later

### MVP
- Linear onboarding
- Manual order preview
- Guided Mode only

### Later
- Conditional onboarding paths
- Smart skipping based on integrations
- Onboarding progress analytics

---

## Success Criteria
- User completes onboarding without confusion
- User generates and reviews first order
- User understands that Suppli improves over time
- No orders are sent without review in early usage

---

## Summary
Onboarding exists to:
- Prevent bad first orders
- Build trust
- Deliver value quickly
- Encourage, not force, better data

If onboarding feels heavy, it should be simplified.
If onboarding feels risky, it should slow down.
