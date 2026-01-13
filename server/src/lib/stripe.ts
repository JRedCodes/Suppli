import Stripe from 'stripe';
import { config } from '../config';

let stripeClient: Stripe | null = null;

/**
 * Lazily instantiate and cache the Stripe client.
 * Throws if the secret key is missing.
 */
export function getStripeClient(): Stripe {
  if (stripeClient) {
    return stripeClient;
  }

  if (!config.stripe.secretKey) {
    throw new Error('Stripe secret key is not configured');
  }

  stripeClient = new Stripe(config.stripe.secretKey, {});
  return stripeClient;
}
