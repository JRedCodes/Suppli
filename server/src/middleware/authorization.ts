/**
 * Authorization middleware
 * Enforces role-based access control
 */

import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors';
import { AuthRequest, UserRole } from '../types/auth';

/**
 * Middleware factory to require specific roles
 * @param allowedRoles - Array of roles that are allowed to access the route
 * @returns Middleware function
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;

    // Ensure business context is resolved
    if (!authReq.role) {
      return next(new ForbiddenError('Business context required'));
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(authReq.role)) {
      return next(
        new ForbiddenError(
          `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${authReq.role}`
        )
      );
    }

    next();
  };
}

/**
 * Convenience middleware for Owner-only routes
 */
export const requireOwner = requireRole('owner');

/**
 * Convenience middleware for Owner or Manager routes
 */
export const requireManager = requireRole('owner', 'manager');

/**
 * Convenience middleware for any authenticated user with business context
 * (Owner, Manager, or Staff)
 */
export const requireStaff = requireRole('owner', 'manager', 'staff');
