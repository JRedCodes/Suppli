# Suppli — Learning Loop

## Purpose of This Document
This document defines how Suppli improves ordering accuracy over time using real user behavior and real-world outcomes—without introducing unsafe automation.

The learning loop is **incremental, conservative, and reversible**.

Suppli does not “self-optimize” in ways users cannot see or control.

---

## Core Principles
1. **Learning is gradual**
2. **User intent outweighs system inference**
3. **Trends matter more than single events**
4. **Nothing learns silently**
5. **Learning never bypasses safety rules**

---

## Sources of Learning Signals

Suppli learns from **explicit signals** and **implicit signals**.

### Explicit Signals (Highest Trust)
- Quantity edits during order review
- Approval or rejection of orders
- Manual overrides
- Notes added by users
- Invoice mismatch confirmations

### Implicit Signals (Lower Trust)
- Repeated approval without edits
- Stable ordering cycles
- Consistent vendor behavior
- Promo outcomes over time

Explicit signals always take precedence.

---

## What Suppli Learns (MVP Scope)

Suppli may learn:
- Preferred quantity adjustments per product
- Typical order cadence
- Vendor reliability patterns
- Conservative uplift ranges for promotions
- Confidence calibration

Suppli does NOT learn:
- Pricing strategies
- Inventory policies
- Staffing behavior
- Financial thresholds (unless explicitly set)

---

## Learning Granularity

Learning occurs at multiple levels:

### Product-Level
- Typical quantity adjustments
- Waste sensitivity confirmation
- Promo responsiveness

### Vendor-Level
- Fulfillment reliability
- Frequency of mismatches
- Lead time consistency

### Order-Level
- Approval speed
- Edit frequency
- High-risk change patterns

---

## Learning Mechanisms (Conceptual)

### Quantity Adjustment Memory
When a user consistently edits a product in the same direction:
- Suppli narrows future recommendations toward that value
- Changes remain conservative

Example:
> User consistently reduces bread by 1 unit → Suppli recommends 1 unit less next time.

---

### Confidence Calibration
- Frequent edits → lower confidence
- Frequent approvals → higher confidence
- Invoice mismatches → reduce confidence

Confidence increases unlock:
- Wider adjustment caps
- Fewer warnings
- Optional automation (later)

---

### Vendor Reliability Tracking
- Track mismatch frequency per vendor
- Track delivery consistency
- Use trends, not single incidents

Vendor reliability affects:
- Warning visibility
- Buffer recommendations
- Messaging

---

## What Learning NEVER Does (Hard Rules)
- Never auto-approve orders
- Never auto-send orders
- Never introduce large changes without review
- Never hide explanations
- Never override user edits

---

## User Visibility & Control

Users should always be able to:
- See that Suppli is “learning”
- Understand what influenced a recommendation
- Override any suggestion

Suggested UI language:
> “Suppli adjusted this based on past approvals.”

---

## Reset & Correction

Users must be able to:
- Reset learned adjustments per product
- Disable learning temporarily (later)
- Revert to conservative defaults

Learning resets should:
- Be explicit
- Not erase historical data
- Be logged

---

## Failure & Drift Prevention

### Drift Detection
Suppli should detect:
- Increasing edit frequency
- Large divergence between recommendations and approvals

Response:
- Reduce confidence
- Increase warnings
- Revert to conservative bounds

---

## MVP vs Later

### MVP
- Rule-based learning
- Simple memory of edits
- Manual confidence calibration

### Later
- Seasonal learning
- Promo performance history
- Multi-store learning (opt-in)
- Advanced vendor trend modeling

---

## Success Criteria
- Fewer edits over time
- Higher approval confidence
- No catastrophic failures
- Users trust the system’s restraint

---

## Summary
The learning loop exists to:
- Improve accuracy safely
- Respect user intent
- Reduce effort over time

If learning creates surprise or confusion, it has failed.
