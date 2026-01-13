# Suppli — Order Generation Rules

## Purpose of This Document
This document defines the rules, constraints, and guardrails used when Suppli generates order recommendations.

Its goal is to ensure that all generated orders are:
- Conservative by default
- Explainable
- Safe in low-data environments
- Gradually less restrictive as confidence increases

This document exists to prevent silent risk and unpredictable behavior.

---

## Core Philosophy
1. **Safety over optimization**
2. **Conservatism before confidence**
3. **No data → smaller changes, not no output**
4. **Explain every meaningful decision**
5. **Never surprise the user with money-impacting changes**

---

## Inputs Considered for Order Generation

Order generation may consider the following inputs, in descending priority:

1. Recent sales data (if available)
2. Previous approved orders
3. Active promotions
4. Vendor constraints (minimums, cutoffs)
5. Product attributes (waste sensitivity)
6. Manual overrides and edits
7. Conservative system defaults

Missing inputs reduce confidence, not functionality.

---

## Order Generation Modes

### Guided Mode (Default)
Triggered when:
- Limited or no sales data
- New business
- Low historical approval consistency

Rules:
- Conservative quantity caps
- No auto-sending
- “Needs review” status required
- Prominent explanations

---

### Full Auto Mode (Unlocked Later)
Triggered when:
- Sufficient sales data exists
- User demonstrates consistent approval behavior
- Explicit opt-in by user

Rules:
- Fewer confirmations
- Larger adjustments allowed
- Still reversible and auditable

---

### Simulation / Preview Mode
Triggered when:
- User wants to preview ordering logic
- No sending allowed

Rules:
- No approval or sending
- Clearly labeled as preview

---

## Quantity Calculation Rules

### Baseline Quantity
Baseline quantity may be derived from:
- Average recent sales
- Previous approved order quantities
- Manual baseline input

Baseline must:
- Be explainable
- Be traceable to a data source

---

### Conservative Adjustment Caps (Guided Mode)

Without strong sales data:
- Max increase: +10–20%
- Max decrease: −20%
- No bulk increases on waste-sensitive items

With partial data:
- Slightly higher caps allowed
- Still require review

Caps apply per item, not per order.

---

### Waste-Sensitive Products
Examples:
- Fresh produce
- Dairy
- Bakery items

Rules:
- Smaller upward adjustments
- Faster decay on old sales data
- Require stronger confidence signals

---

## Promotions & Uplift Rules

- Promotions may increase demand expectations
- Default uplift = Low
- High uplift requires either:
  - Strong sales history
  - Explicit user confirmation

Promotions:
- Never override safety caps
- Must be explained in the order review

---

## Confidence Scoring (Conceptual)

Confidence is evaluated per OrderLine using:
- Data recency
- Data consistency
- Manual overrides frequency
- Promo overlap

User-facing confidence levels:
- High confidence
- Moderate confidence
- Needs review

Numeric scores are internal only.

---

## Explanation Requirements

Every OrderLine must include:
- Primary reason for quantity
- Any adjustment explanation

Examples:
- “Based on recent sales.”
- “Adjusted slightly due to active promotion.”
- “Conservative estimate due to limited data.”

If no explanation can be generated, the change should not occur.

---

## Safety & Fallback Rules

### Missing Data
If critical data is missing:
- Fall back to previous approved order
- Or use manual baseline
- Or generate minimal placeholder quantities

Never:
- Generate zero without explanation
- Generate large guesses

---

### Conflicting Signals
If inputs conflict (e.g., sales down, promo active):
- Favor lower quantities
- Surface a warning
- Require review

---

## User Overrides

User edits:
- Always take precedence
- Are logged
- Feed learning loop

Overrides:
- Reduce future confidence caps if frequent
- Increase confidence if consistent

---

## Batch & Bulk Behavior

Rules:
- Large total order changes trigger warnings
- Multi-vendor orders evaluated independently
- One risky vendor order does not block others

---

## Failure Handling

If order generation fails:
- Generate partial draft
- Flag affected items
- Allow user to proceed safely

Never:
- Block the entire order
- Produce silent failures

---

## MVP vs Later

### MVP
- Deterministic logic
- Conservative caps
- Simple confidence tiers
- Manual review required

### Later
- Adaptive caps
- Seasonal modeling
- Vendor-specific forecasting
- Auto-approval rules

---

## Success Criteria
- No catastrophic over-ordering
- Users understand why quantities exist
- Users trust Suppli’s restraint
- Edits decrease over time

---

## Summary
Order generation rules exist to:
- Protect the business
- Build trust
- Enable learning without risk

If a rule improves accuracy but increases risk, it must be gated behind confidence.
