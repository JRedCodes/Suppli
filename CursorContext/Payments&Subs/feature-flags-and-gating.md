# Suppli — Feature Flags & Gating

## Purpose of This Document
This document defines how Suppli controls access to features using feature flags and plan-based gating.
Feature flags and gating exist to enable safe rollouts, protect system integrity, and align functionality with billing plans—without creating brittle logic or hidden behavior.

Feature access must always be **explicit, explainable, and enforced server-side**.

---

## Core Principles
1. **Backend is the source of truth**
2. **Frontend reflects, never decides**
3. **Flags are explicit, not inferred**
4. **Gating is transparent to users**
5. **No feature silently degrades**

---

## Types of Feature Control

Suppli uses three distinct mechanisms:

1. **Plan-based gating**  
2. **Capability-based gating (feature flags)**  
3. **Confidence-based gating (ordering-specific)**  

Each serves a different purpose and must not be conflated.

---

## 1. Plan-Based Gating

### Definition
Plan-based gating restricts access to features based on the business’s subscription plan.

Examples:
- Number of active orders
- Invoice mismatch detection
- Full Auto Mode eligibility
- Advanced learning features

### Enforcement Rules
- Enforced **server-side**
- Reflected in API responses
- UI uses backend-provided capability flags

Never:
- Hardcode plan logic in the frontend
- Infer plan from usage

---

### Plan Capability Model (Conceptual)

Each business has a resolved set of capabilities:

```json
{
  "canGenerateOrders": true,
  "canUseFullAuto": false,
  "canVerifyInvoices": true,
  "maxActiveOrders": 5
}
The frontend renders based on these capabilities.

2. Feature Flags (Operational Control)
Definition
Feature flags allow Suppli to:

Roll out features gradually

Enable internal testing

Disable risky features quickly

Feature flags are orthogonal to billing.

Flag Characteristics
Boolean or simple enum

Resolved server-side

Scoped by:

Environment

Business

User (rare, internal only)

Example Flags
enable_invoice_ocr

enable_promo_parsing

enable_order_preview_mode

enable_new_order_review_ui

Flag Resolution Priority
Emergency override (off)

Environment defaults

Business-specific overrides

User-specific overrides (internal only)

3. Confidence-Based Gating (Ordering Safety)
Definition
Confidence-based gating restricts actions based on system confidence—not billing.

Examples:

Auto-send disabled in low confidence

Large quantity changes blocked

Auto-approval unavailable

Rules:

Confidence gating is always conservative

Cannot be overridden by plan

Must be explained to the user

Example message:

“Auto-send is unavailable because this order needs review.”

Backend Enforcement Strategy
Capability Resolution
On each request (or session initialization), backend resolves:

Subscription plan

Feature flags

Confidence constraints

This resolves into a single capabilities object returned to the frontend.

Enforcement Points
API route guards

Domain logic checks

Background job eligibility

If backend denies access:

Operation must fail safely

Error must be user-readable

Frontend Responsibilities
Frontend must:

Render UI based on capabilities

Disable unavailable actions

Explain why a feature is unavailable

Never attempt restricted operations

Frontend must not:

Guess feature availability

Hide features without explanation

Bypass gating via client logic

User Messaging Standards
When a feature is gated, the UI must explain why.

Examples:

“Upgrade to enable invoice verification.”

“This feature is unavailable during the trial.”

“This action requires review due to limited data.”

Avoid:

“Not allowed”

“Access denied”

Silent disabling

Emergency Kill Switches
Some flags act as kill switches.

Rules:

Can disable feature globally

Take effect immediately

Logged when toggled

Used for:

Security issues

Costly failures

Data corruption risks

Data Model (Conceptual)
Feature flags stored as:

Global defaults

Optional business overrides

Plan entitlements stored as:

Subscription tier

Derived capabilities

Frontend consumes capabilities, not raw flags.

MVP vs Later
MVP
Plan-based gating

Simple boolean feature flags

Manual overrides

Later
Percentage rollouts

User cohort flags

A/B testing

Admin flag dashboard

Failure Modes to Avoid
Feature works for some users without explanation

Frontend and backend disagree on access

Plan logic duplicated across layers

Silent downgrades

Success Criteria
No gated feature is accidentally accessible

Users always understand why something is unavailable

Features can be disabled instantly without deploys

Summary
Feature flags and gating exist to:

Protect users

Protect the system

Enable safe iteration

If access logic is unclear, it should be centralized.
If a feature is risky, it should be gateable.
If a feature is gated, the reason must be visible.