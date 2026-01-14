# Suppli — Billing & Plans

## Purpose of This Document
This document defines Suppli’s billing model, subscription plans, and feature-gating rules.
Billing must be simple, predictable, and tightly aligned with value delivered—never surprising or punitive.

Billing logic is enforced server-side and reflected clearly in the UI.

---

## Core Principles
1. **Billing reflects value, not usage anxiety**
2. **No hidden limits**
3. **Feature gating is explicit**
4. **Billing never blocks access to existing data**
5. **Upgrades are easy; downgrades are safe**

---

## Subscription Model

### Billing Provider
- Stripe is the source of truth for billing
- Suppli stores subscription state for enforcement only

---

## Plan Structure (Conceptual)

### Free / Trial
Purpose:
- Evaluate Suppli safely
- Generate preview or limited orders

Features:
- Limited number of orders
- Guided Mode only
- Manual review required
- No auto-send
- Limited invoice verification

Restrictions:
- Soft limits only
- No data deletion on limit reached

---

### Starter
Target:
- Single-location small businesses

Features:
- Unlimited order generation
- Vendor formatting & exports
- Sales data uploads
- Promotions support
- Invoice verification (basic)
- Guided Mode + Full Auto unlock potential

---

### Growth (Later)
Target:
- Growing or multi-location businesses

Features:
- Advanced learning
- Vendor reliability insights
- Multi-store support
- Priority processing
- Advanced invoice checks

---

## Feature Gating Strategy

Feature gating must be enforced at:
1. **Backend (authoritative)**
2. **Frontend (UX clarity)**

Never rely on frontend gating alone.

---

## Gating Rules (Examples)

### Orders
- Free: limited active orders
- Paid: unlimited

### Sales Data
- Free: limited uploads
- Paid: unlimited uploads & integrations

### Invoice Verification
- Free: upload + view only
- Paid: mismatch detection & learning

### Automation
- Free: Guided Mode only
- Paid: Full Auto Mode eligibility

---

## Graceful Limit Handling

When limits are reached:
- Do not block access to existing data
- Do not delete or hide records
- Clearly explain the limit
- Offer upgrade path

Example copy:
> “You’ve reached your plan’s order limit. Upgrade to generate more orders.”

---

## Billing States

Suppli recognizes these states:
- Trialing
- Active
- Past due
- Canceled

Behavior:
- Past due → read-only after grace period
- Canceled → data retained, generation disabled

---

## Trial Rules

- Trial length defined in Stripe
- No credit card required initially (recommended)
- Trial expiration clearly communicated

At trial end:
- User prompted to upgrade
- Existing data remains accessible

---

## Plan Changes

### Upgrades
- Take effect immediately
- Prorated via Stripe

### Downgrades
- Take effect at next billing cycle
- No immediate feature removal mid-cycle

---

## Permissions & Billing Access

Who can manage billing:
- Owner only

Other roles:
- Can view plan (optional)
- Cannot modify billing

---

## UI Requirements

Billing UI must show:
- Current plan
- Included features
- Usage (if applicable)
- Next billing date
- Upgrade / manage button

Stripe-hosted portal preferred for payment details.

---

## Security Considerations
- Billing status never trusted from client
- Stripe webhooks are verified
- All billing transitions logged

---

## MVP vs Later

### MVP
- Simple plans
- Stripe Checkout
- Stripe Customer Portal
- Manual feature gating

### Later
- Usage-based pricing
- Add-ons
- Team-based pricing
- Invoicing

---

## Success Criteria
- Users understand what they’re paying for
- No surprise lockouts
- Billing never erodes trust

---

## Summary
Billing exists to:
- Sustain Suppli
- Reflect delivered value
- Stay out of the user’s way

If billing logic becomes complex or confusing, it must be simplified.