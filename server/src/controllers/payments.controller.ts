import { Request, Response } from 'express';
import Stripe from 'stripe';
import { z } from 'zod';
import { getStripeClient } from '../lib/stripe';
import { config } from '../config';
import { AuthRequest } from '../types/auth';

const DEFAULT_SUCCESS_URL = process.env.FRONTEND_URL || 'http://localhost:5173/payment-success';
const DEFAULT_CANCEL_URL = process.env.FRONTEND_URL || 'http://localhost:5173/payment-cancelled';

/**
 * Create a Stripe Checkout Session for subscriptions.
 * Expects a Stripe Price lookup key. Uses subscription mode with quantity 1.
 */
export async function createCheckoutSession(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    lookupKey: z.string().min(1, 'Price lookup key is required'),
    successUrl: z.string().url().optional(),
    cancelUrl: z.string().url().optional(),
    customerEmail: z.string().email().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: { code: 'INVALID_INPUT', message: parsed.error.message } });
    return;
  }

  const { lookupKey, successUrl, cancelUrl, customerEmail } = parsed.data;

  try {
    const prices = await stripe.prices.list({
      lookup_keys: [lookupKey],
      expand: ['data.product'],
      limit: 1,
    });

    if (!prices.data.length) {
      res.status(400).json({ error: { code: 'PRICE_NOT_FOUND', message: 'Price not found for lookup key' } });
      return;
    }

    const authReq = req as AuthRequest;
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'auto',
      mode: 'subscription',
      line_items: [
        {
          price: prices.data[0].id,
          quantity: 1,
        },
      ],
      success_url: `${successUrl || DEFAULT_SUCCESS_URL}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${cancelUrl || DEFAULT_CANCEL_URL}?canceled=true`,
      customer_email: customerEmail,
      metadata: {
        business_id: authReq.businessId || '',
        user_id: authReq.userId || '',
      },
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    res.status(500).json({ error: { code: 'CHECKOUT_SESSION_ERROR', message: 'Failed to create checkout session' } });
  }
}

/**
 * Create a Stripe Billing Portal session so customers can manage subscriptions.
 * Requires a checkout session id to look up the customer.
 */
export async function createBillingPortalSession(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    sessionId: z.string().min(1, 'Checkout sessionId is required'),
    returnUrl: z.string().url().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: { code: 'INVALID_INPUT', message: parsed.error.message } });
    return;
  }

  const { sessionId, returnUrl } = parsed.data;

  try {
    const stripe = getStripeClient();
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    if (!checkoutSession.customer) {
      res.status(400).json({ error: { code: 'CUSTOMER_NOT_FOUND', message: 'No customer on session' } });
      return;
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: checkoutSession.customer.toString(),
      return_url: returnUrl || DEFAULT_SUCCESS_URL,
    });

    res.status(200).json({ url: portalSession.url });
  } catch (error) {
    console.error('Stripe portal session error:', error);
    res.status(500).json({ error: { code: 'PORTAL_SESSION_ERROR', message: 'Failed to create portal session' } });
  }
}

/**
 * Stripe webhook handler. Uses raw body (configured in app.ts) for signature verification.
 */
export async function handleStripeWebhook(req: Request, res: Response): Promise<void> {
  const sig = req.headers['stripe-signature'];
  if (!sig || Array.isArray(sig)) {
    res.status(400).send('Missing Stripe signature');
    return;
  }

  const webhookSecret = config.stripe.webhookSecret;
  if (!webhookSecret) {
    res.status(500).send('Stripe webhook secret not configured');
    return;
  }

  let event;
  const stripe = getStripeClient();
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Stripe webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription ${subscription.id} status: ${subscription.status}`);
        // TODO: Persist subscription status to Supabase (phase 4.2+)
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Error handling Stripe webhook:', err);
    res.status(500).send('Webhook handler error');
  }
}
