import Stripe from 'stripe';
import { config } from '../config';

/**
 * Stripe client configured with the secret key from environment variables.
 * The API version defaults to your account setting to avoid hard-coding a preview version.
 */
export const stripe = new Stripe(config.stripe.secretKey || '', {});
