/**
 * Validation middleware using Zod
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '../errors';

/**
 * Validation middleware factory
 * Validates request body, query, or params against a Zod schema
 */
export function validate(schema: {
  body?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
}) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      // Validate body if schema provided
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      // Validate query if schema provided
      if (schema.query) {
        const parsed = schema.query.parse(req.query);
        // Replace req.query with parsed values to ensure types are correct
        // Clear existing query params and assign parsed ones
        Object.keys(req.query).forEach((key) => delete req.query[key]);
        Object.assign(req.query, parsed);
      }

      // Validate params if schema provided
      if (schema.params) {
        const parsed = schema.params.parse(req.params);
        // Type assertion needed because Express types are loose
        Object.assign(req.params, parsed);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format Zod errors into user-friendly messages
        const messages = error.issues.map((issue) => {
          const path = issue.path.join('.');
          return path ? `${path}: ${issue.message}` : issue.message;
        });

        const message =
          messages.length === 1 ? messages[0] : `Validation failed: ${messages.join('; ')}`;

        next(new ValidationError(message));
      } else {
        next(new ValidationError('Invalid request data'));
      }
    }
  };
}

/**
 * Convenience function to validate only request body
 */
export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return validate({ body: schema });
}

/**
 * Convenience function to validate only query parameters
 */
export function validateQuery<T extends z.ZodTypeAny>(schema: T) {
  return validate({ query: schema });
}

/**
 * Convenience function to validate only route parameters
 */
export function validateParams<T extends z.ZodTypeAny>(schema: T) {
  return validate({ params: schema });
}
