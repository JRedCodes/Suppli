/**
 * Onboarding controller
 */

import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth';
import { sendSuccess } from '../lib/response';
import { initializeUser, getUserBusinesses } from '../services/onboarding.service';

/**
 * Initialize a new user (create business and membership)
 * POST /api/v1/onboarding/initialize
 */
export async function initializeUserHandler(req: Request, res: Response): Promise<void> {
  const authReq = req as AuthRequest;
  const { businessName, businessType, timezone, currency } = req.body;

  if (!authReq.userId) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'User ID not found',
      },
    });
    return;
  }

  if (!businessName || typeof businessName !== 'string' || businessName.trim().length === 0) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Business name is required',
      },
    });
    return;
  }

  // Get user email from JWT or request
  const userEmail = authReq.user?.email || req.body.email || '';

  const result = await initializeUser(authReq.userId, userEmail, {
    businessName: businessName.trim(),
    businessType,
    timezone,
    currency,
  });

  sendSuccess(res, result, 201);
}

/**
 * Get user's businesses
 * GET /api/v1/onboarding/businesses
 */
export async function getUserBusinessesHandler(req: Request, res: Response): Promise<void> {
  const authReq = req as AuthRequest;

  if (!authReq.userId) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'User ID not found',
      },
    });
    return;
  }

  const businesses = await getUserBusinesses(authReq.userId);
  sendSuccess(res, businesses);
}
