/**
 * Authentication middleware
 * Verifies JWT tokens and extracts user information
 */

import { Request, Response, NextFunction } from 'express';
import { getSupabaseAdmin } from '../lib/supabase';
import { UnauthorizedError } from '../errors';
import { AuthRequest } from '../types/auth';

/**
 * Extracts JWT token from Authorization header
 * Expected format: "Bearer <token>"
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Middleware to verify JWT token and extract user ID
 * Attaches userId to request object
 */
export async function verifyJWT(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new UnauthorizedError('Missing or invalid authorization token');
    }

    // Verify JWT using Supabase
    const {
      data: { user },
      error,
    } = await getSupabaseAdmin().auth.getUser(token);

    if (error) {
      console.error('Token verification error:', {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      throw new UnauthorizedError(`Invalid or expired token: ${error.message}`);
    }

    if (!user) {
      console.error('Token verification returned no user');
      throw new UnauthorizedError('Invalid or expired token: no user found');
    }

    // Attach user ID and user object to request
    (req as AuthRequest).userId = user.id;
    (req as AuthRequest).user = user;

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      console.error('Unexpected error in verifyJWT:', error);
      next(new UnauthorizedError('Authentication failed'));
    }
  }
}
