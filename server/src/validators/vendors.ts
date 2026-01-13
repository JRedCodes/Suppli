/**
 * Vendor validation schemas
 */

import { z } from 'zod';
import { uuidSchema } from './common';

export const createVendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required').max(255, 'Vendor name is too long'),
  ordering_method: z.enum(['email', 'phone', 'portal', 'in_person']),
  contact_email: z.string().email('Invalid email format').optional().or(z.literal('')),
  contact_phone: z.string().max(50, 'Phone number is too long').optional().or(z.literal('')),
  notes: z.string().max(1000, 'Notes are too long').optional().or(z.literal('')),
});

export const updateVendorSchema = createVendorSchema.partial();

export const vendorIdParamSchema = z.object({
  vendorId: uuidSchema,
});

export const listVendorsQuerySchema = z.object({
  archived: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().int().min(1).optional()),
  pageSize: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().int().min(1).max(100).optional()),
});
