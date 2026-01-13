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
    console.log('verifyJWT middleware called');
    const token = extractToken(req);

    if (!token) {
      console.log('No token found in request');
      throw new UnauthorizedError('Missing or invalid authorization token');
    }

    console.log('Token extracted, length:', token.length, 'prefix:', token.substring(0, 20));

    // Verify JWT using Supabase
    // Note: getUser() with a token verifies the JWT and returns the user
    const supabase = getSupabaseAdmin();
    console.log('Supabase client obtained, verifying token...');
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL?.substring(0, 30) + '...');
    console.log('Has service role key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    try {
      const result = await supabase.auth.getUser(token);
      console.log('getUser result:', { 
        hasUser: !!result.data?.user, 
        hasError: !!result.error,
        errorMessage: result.error?.message,
        errorStatus: result.error?.status,
        errorName: result.error?.name,
      });

      const { data: { user }, error } = result;

    if (error) {
      console.error('Token verification error:', {
        message: error.message,
        status: error.status,
        name: error.name,
        fullError: error,
      });
      throw new UnauthorizedError(`Invalid or expired token: ${error.message}`);
    }

      if (!user) {
        console.error('Token verification returned no user');
        throw new UnauthorizedError('Invalid or expired token: no user found');
      }

      console.log('Token verified successfully, user ID:', user.id);

      // Attach user ID and user object to request
      (req as AuthRequest).userId = user.id;
      (req as AuthRequest).user = user;

      next();
    } catch (getUserError) {
      console.error('Error in getUser call:', getUserError);
      throw getUserError;
    }
  } catch (error) {
    console.error('Error in verifyJWT:', error);
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      console.error('Unexpected error in verifyJWT:', error);
      next(new UnauthorizedError('Authentication failed'));
    }
  }
}
