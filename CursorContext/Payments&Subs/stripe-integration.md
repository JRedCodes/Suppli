# Suppli — Stripe Integration

## Purpose of This Document
This document defines how Suppli integrates with Stripe for billing, subscriptions, and payment lifecycle management.
Stripe is the **source of truth for payments**. Suppli mirrors Stripe state to enforce access and display billing information.

Payments must be reliable, auditable, and never block access to existing user data.

---

## Core Principles
1. **Stripe is authoritative**
2. **Billing logic lives on the backend**
3. **Webhooks drive state changes**
4. **No payment logic in the frontend**
5. **Billing failures fail gracefully**

---

## Stripe Responsibilities
Stripe handles:
- Customer creation
- Subscription lifecycle
- Payment methods
- Invoices and receipts
- Proration and taxes

Suppli handles:
- Mapping Stripe customers to businesses
- Enforcing feature access based on subscription
- Displaying billing status
- Reacting to webhook events

---

## Customer Model

### Stripe Customer
- One Stripe Customer per Suppli business
- Created when:
  - Trial starts, or
  - First checkout is initiated

Stored fields (conceptual):
- stripe_customer_id
- business_id
- created_at

Never create multiple Stripe customers for one business.

---

## Subscription Model

### Stripe Subscription
- One active subscription per business
- Subscription tied to a pricing plan

Stored fields (conceptual):
- stripe_subscription_id
- business_id
- plan_id
- status (trialing, active, past_due, canceled)
- current_period_end

Suppli does not calculate billing dates manually.

---

## Checkout Flow

### Initiating Checkout
1. User clicks “Upgrade” in Suppli
2. Backend creates Stripe Checkout Session
3. User is redirected to Stripe-hosted checkout
4. Stripe processes payment
5. User redirected back to Suppli

Rules:
- Checkout session created server-side
- Plan ID validated before session creation
- Business ownership verified (Owner role only)

---

## Stripe Customer Portal

### Purpose
Allows users to:
- Update payment methods
- View invoices
- Cancel or update subscription

Rules:
- Portal sessions created server-side
- Access restricted to Owner role
- Suppli does not replicate Stripe UI

---

## Webhook Handling (Critical)

### Webhook Endpoint
POST /api/v1/webhooks/stripe

yaml
Copy code

### Verification
- Verify Stripe signature on every webhook
- Reject unverified requests

---

### Required Webhook Events (MVP)

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `checkout.session.completed`

---

### Webhook Processing Rules
- Idempotent handlers
- No side effects without verification
- Always log events
- Update local subscription state

If webhook processing fails:
- Retry safely
- Do not partially update state

---

## Subscription State Mapping

Stripe → Suppli mapping:

- trialing → Trial
- active → Active
- past_due → Past Due
- canceled → Canceled

Suppli enforces behavior based on mapped state.

---

## Feature Enforcement

Subscription state affects:
- Order generation limits
- Invoice verification availability
- Automation eligibility
- Data ingestion limits

Rules:
- Past due → grace period, then read-only
- Canceled → generation disabled, data preserved

---

## Security Considerations

- Never expose Stripe secret keys to frontend
- Webhook secret stored securely
- All billing endpoints rate-limited
- Billing actions logged via audit system

---

## Error Handling

### Checkout Errors
- Explain failure clearly
- Allow retry
- Do not lock account

### Webhook Errors
- Logged and retried
- No user-facing error unless access changes

---

## MVP vs Later

### MVP
- Stripe Checkout
- Stripe Customer Portal
- Subscription-based plans
- Manual plan definitions

### Later
- Usage-based pricing
- Add-ons
- Coupons and discounts
- Multi-subscription support (if needed)

---

## Success Criteria
- Billing state always matches Stripe
- No accidental access loss
- Users trust billing flow
- Failures are recoverable

---

## Summary
Stripe integration exists to:
- Handle payments reliably
- Reduce compliance burden
- Keep Suppli focused on product value

If billing logic becomes complex, defer to Stripe.
If a billing state is ambiguous, treat it conservatively.