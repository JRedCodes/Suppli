# Suppli — Stripe Integration Documentation

## Overview

Suppli uses Stripe for subscription management. This document describes the integration, API endpoints, webhook handling, and how to test the integration.

## Architecture

### Components

1. **Stripe Client** (`server/src/lib/stripe.ts`)
   - Lazy-loaded Stripe client instance
   - Uses `STRIPE_SECRET_KEY` from environment variables
   - Handles API version configuration

2. **Payments Controller** (`server/src/controllers/payments.controller.ts`)
   - Creates checkout sessions for subscriptions
   - Creates billing portal sessions
   - Handles Stripe webhook events

3. **Payments Routes** (`server/src/routes/payments.routes.ts`)
   - `/api/v1/payments/checkout-session` - Create checkout session
   - `/api/v1/payments/billing-portal` - Create billing portal session
   - `/api/v1/webhooks/stripe` - Webhook endpoint

## API Endpoints

### Create Checkout Session

**POST** `/api/v1/payments/checkout-session`

Creates a Stripe Checkout session for subscription signup.

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "lookupKey": "starter-plan",  // Stripe Price lookup key (required)
  "successUrl": "http://localhost:5173/payment-success",  // Optional
  "cancelUrl": "http://localhost:5173/payment-cancelled",  // Optional
  "customerEmail": "customer@example.com"  // Optional
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/api/v1/payments/checkout-session \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lookupKey": "starter-plan"
  }'
```

### Create Billing Portal Session

**POST** `/api/v1/payments/billing-portal`

Creates a Stripe Billing Portal session so customers can manage their subscriptions.

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "sessionId": "cs_test_...",  // Checkout session ID (required)
  "returnUrl": "http://localhost:5173/settings"  // Optional
}
```

**Response:**
```json
{
  "url": "https://billing.stripe.com/p/session/..."
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/api/v1/payments/billing-portal \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "cs_test_..."
  }'
```

### Webhook Endpoint

**POST** `/api/v1/webhooks/stripe`

Handles Stripe webhook events. This endpoint uses raw body parsing for signature verification.

**Authentication:** None (uses Stripe signature verification)

**Webhook Events Handled:**
- `customer.subscription.created` - New subscription created
- `customer.subscription.updated` - Subscription updated
- `customer.subscription.deleted` - Subscription cancelled
- `customer.subscription.trial_will_end` - Trial ending soon

**Note:** Currently logs events. Future implementation will persist subscription status to Supabase.

## Setup

### Environment Variables

Required in `server/.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

See `docs/ENVIRONMENT_VARIABLES.md` for detailed setup instructions.

### Stripe Dashboard Setup

1. **Create Products and Prices**
   - Go to Stripe Dashboard → Products
   - Create a product (e.g., "Starter Plan")
   - Add a recurring price
   - Note the Price lookup key (or create one)

2. **Configure Webhooks (for local development)**
   - Use Stripe CLI: `stripe listen --forward-to localhost:3001/api/v1/webhooks/stripe`
   - Copy the webhook signing secret shown
   - Add to `STRIPE_WEBHOOK_SECRET` in `.env.local`

3. **Configure Webhooks (for production)**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-api.com/api/v1/webhooks/stripe`
   - Select events: `customer.subscription.*`
   - Copy signing secret to `STRIPE_WEBHOOK_SECRET`

## Testing

### Local Development with Stripe CLI

1. **Install Stripe CLI:**
   ```bash
   brew install stripe/stripe-cli/stripe  # macOS
   ```

2. **Login:**
   ```bash
   stripe login
   ```

3. **Forward webhooks:**
   ```bash
   stripe listen --forward-to localhost:3001/api/v1/webhooks/stripe
   ```

4. **Test checkout:**
   - Start your backend server
   - Create a checkout session via API
   - Complete checkout in Stripe test mode
   - Verify webhook events are received

### Test Cards

Use Stripe test cards for testing:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

See [Stripe Test Cards](https://stripe.com/docs/testing) for more.

## Webhook Event Handling

### Current Implementation

Webhooks are received and logged. Events are verified using Stripe signature verification.

### Future Implementation

Planned enhancements:
- Persist subscription status to Supabase `businesses` table
- Map subscription plans to feature capabilities
- Implement feature gating based on subscription status
- Send notifications for subscription events

## Security

### Webhook Signature Verification

All webhook requests are verified using Stripe's signature verification:
- Raw body is required (configured in `app.ts`)
- Signature is checked against `STRIPE_WEBHOOK_SECRET`
- Invalid signatures return 400 error

### API Key Security

- `STRIPE_SECRET_KEY` is server-side only
- Never expose in frontend code
- Use environment variables, never commit to git
- Rotate keys if exposed

## Troubleshooting

### "Stripe client not initialized"

- Check `STRIPE_SECRET_KEY` is set in `.env.local`
- Verify key starts with `sk_test_` (test mode) or `sk_live_` (live mode)
- Restart server after adding environment variables

### "Webhook signature verification failed"

- Verify `STRIPE_WEBHOOK_SECRET` matches the secret from Stripe CLI or Dashboard
- Ensure webhook endpoint uses raw body (configured in `app.ts`)
- Check webhook is forwarding to correct URL

### "Price not found for lookup key"

- Verify lookup key exists in Stripe Dashboard
- Check lookup key spelling (case-sensitive)
- Ensure price is active

### Webhooks not received

- For local: Ensure Stripe CLI is running and forwarding
- For production: Verify webhook endpoint is publicly accessible
- Check webhook events are selected in Stripe Dashboard
- Verify endpoint URL is correct

## Next Steps

1. **Subscription Persistence**
   - Store subscription status in Supabase
   - Link subscriptions to businesses
   - Track subscription history

2. **Feature Gating**
   - Map plans to capabilities
   - Implement middleware for feature checks
   - Add subscription status to business context

3. **Customer Portal Integration**
   - Add UI for managing subscriptions
   - Show current plan and usage
   - Allow plan upgrades/downgrades

## References

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Billing Portal](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)
