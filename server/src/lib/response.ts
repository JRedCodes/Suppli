/**
 * Standard response utilities
 * Ensures consistent API response format
 */

import { Response } from 'express';
import { z } from 'zod';
import { paginationMetaSchema } from '../validators';

/**
 * Standard success response with data
 */
export function sendSuccess<T>(res: Response, data: T, statusCode: number = 200): void {
  res.status(statusCode).json({
    data,
  });
}

/**
 * Standard paginated response
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  meta: z.infer<typeof paginationMetaSchema>,
  statusCode: number = 200
): void {
  res.status(statusCode).json({
    data,
    meta,
  });
}

/**
 * Standard error response (used by error handler middleware)
 * This is for consistency - errors are typically handled by the error handler
 */
export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode: number = 500
): void {
  res.status(statusCode).json({
    error: {
      code,
      message,
    },
  });
}
