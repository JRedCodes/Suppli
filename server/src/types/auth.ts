/**
 * Authentication and authorization types
 */

export type UserRole = 'owner' | 'manager' | 'staff';

/**
 * Extended Express Request with authentication context
 */
export interface AuthRequest extends Express.Request {
  /**
   * Authenticated user ID from JWT
   */
  userId?: string;

  /**
   * Current business context (from request header or query param)
   */
  businessId?: string;

  /**
   * User's role in the current business context
   */
  role?: UserRole;
}

/**
 * Business membership information
 */
export interface BusinessMembership {
  business_id: string;
  role: UserRole;
  created_at: string;
}
