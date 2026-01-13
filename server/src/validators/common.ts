/**
 * Common Zod schemas for API validation
 */

import { z } from 'zod';

/**
 * UUID validation schema
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Date string validation (YYYY-MM-DD)
 */
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

/**
 * Pagination query parameters
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).default(25).optional(),
});

/**
 * Standard pagination metadata
 */
export const paginationMetaSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});

/**
 * Positive number (greater than 0)
 */
export const positiveNumberSchema = z.number().positive('Must be greater than 0');

/**
 * Non-negative number (0 or greater)
 */
export const nonNegativeNumberSchema = z.number().min(0, 'Must be greater than or equal to 0');

/**
 * Email validation
 */
export const emailSchema = z.string().email('Invalid email format');

/**
 * Phone number (basic validation)
 */
export const phoneSchema = z.string().min(10, 'Phone number must be at least 10 characters');

/**
 * Business ID from request (header, query, or body)
 */
export const businessIdSchema = uuidSchema;
