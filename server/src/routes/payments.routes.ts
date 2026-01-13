import { Router } from 'express';
import { verifyJWT, resolveBusinessContext, validateBody } from '../middleware';
import {
  createBillingPortalSession,
  createCheckoutSession,
} from '../controllers/payments.controller';
import { z } from 'zod';

const router = Router();

// Create checkout session for subscriptions
router.post(
  '/checkout-session',
  verifyJWT,
  resolveBusinessContext,
  validateBody(
    z.object({
      lookupKey: z.string().min(1, 'Price lookup key is required'),
      successUrl: z.string().url().optional(),
      cancelUrl: z.string().url().optional(),
      customerEmail: z.string().email().optional(),
    })
  ),
  createCheckoutSession
);

// Create billing portal session
router.post(
  '/billing-portal',
  verifyJWT,
  resolveBusinessContext,
  validateBody(
    z.object({
      sessionId: z.string().min(1, 'Checkout sessionId is required'),
      returnUrl: z.string().url().optional(),
    })
  ),
  createBillingPortalSession
);

export default router;
