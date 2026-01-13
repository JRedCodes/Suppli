/**
 * Vendor validation schemas
 */

import { z } from 'zod';
import { uuidSchema, emailSchema, phoneSchema } from './common';

/**
 * Create vendor request schema
 */
export const createVendorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  ordering_method: z.enum(['email', 'phone', 'portal', 'in_person']),
  contact_email: emailSchema.optional().or(z.literal('')),
  contact_phone: phoneSchema.optional().or(z.literal('')),
  portal_url: z.string().url('Invalid URL format').optional().or(z.literal('')),
});

/**
 * Update vendor request schema
 */
export const updateVendorSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(255, 'Name is too long').optional(),
    ordering_method: z.enum(['email', 'phone', 'portal', 'in_person']).optional(),
    contact_email: emailSchema.optional().or(z.literal('')).nullable(),
    contact_phone: phoneSchema.optional().or(z.literal('')).nullable(),
    portal_url: z.string().url('Invalid URL format').optional().or(z.literal('')).nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

/**
 * Vendor ID param schema
 */
export const vendorIdParamSchema = z.object({
  id: uuidSchema,
});

/**
 * List vendors query schema
 */
export const listVendorsQuerySchema = z.object({
  includeArchived: z.coerce.boolean().default(false).optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).default(25).optional(),
});
