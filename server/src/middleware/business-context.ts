/**
 * Business context resolution middleware
 * Resolves and validates business membership for authenticated users
 */

import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { UnauthorizedError, ForbiddenError } from '../errors';
import { AuthRequest, BusinessMembership } from '../types/auth';

/**
 * Extracts business_id from request
 * Checks in order: header (X-Business-Id), query param, body
 */
function extractBusinessId(req: Request): string | null {
  // Check header first (preferred)
  const headerBusinessId = req.headers['x-business-id'] as string;
  if (headerBusinessId) {
    return headerBusinessId;
  }

  // Check query parameter
  const queryBusinessId = req.query.business_id as string;
  if (queryBusinessId) {
    return queryBusinessId;
  }

  // Check body (for POST/PUT requests)
  const bodyBusinessId = (req.body as { business_id?: string })?.business_id;
  if (bodyBusinessId) {
    return bodyBusinessId;
  }

  return null;
}

/**
 * Middleware to resolve business context and validate membership
 * Requires verifyJWT middleware to run first
 * Attaches businessId and role to request object
 */
export async function resolveBusinessContext(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;

    // Ensure user is authenticated
    if (!authReq.userId) {
      throw new UnauthorizedError('User must be authenticated');
    }

    // Extract business_id from request
    const businessId = extractBusinessId(req);

    if (!businessId) {
      throw new UnauthorizedError(
        'Business context required (X-Business-Id header, business_id query param, or business_id in body)'
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(businessId)) {
      throw new UnauthorizedError('Invalid business_id format');
    }

    // Query business_users to verify membership and get role
    const { data: membership, error } = await supabaseAdmin
      .from('business_users')
      .select('business_id, role, created_at')
      .eq('user_id', authReq.userId)
      .eq('business_id', businessId)
      .single();

    if (error || !membership) {
      throw new ForbiddenError('User is not a member of this business');
    }

    // Attach business context to request
    authReq.businessId = membership.business_id;
    authReq.role = membership.role as BusinessMembership['role'];

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      next(error);
    } else {
      next(new ForbiddenError('Failed to resolve business context'));
    }
  }
}
