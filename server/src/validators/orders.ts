/**
 * Order validation schemas
 */

import { z } from 'zod';
import { dateSchema, uuidSchema } from './common';

/**
 * Generate order request schema
 */
export const generateOrderSchema = z
  .object({
    orderPeriodStart: dateSchema,
    orderPeriodEnd: dateSchema,
    mode: z.enum(['guided', 'full_auto', 'simulation']).default('guided'),
    vendorIds: z.array(uuidSchema).optional(),
  })
  .refine((data) => new Date(data.orderPeriodStart) <= new Date(data.orderPeriodEnd), {
    message: 'orderPeriodStart must be before or equal to orderPeriodEnd',
    path: ['orderPeriodEnd'],
  });

/**
 * List orders query schema
 */
export const listOrdersQuerySchema = z.object({
  status: z.enum(['draft', 'needs_review', 'approved', 'sent', 'cancelled']).optional(),
  vendorId: uuidSchema.optional(),
  dateFrom: dateSchema.optional(),
  dateTo: dateSchema.optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).default(25).optional(),
});

/**
 * Update order line quantity schema
 */
export const updateOrderLineSchema = z.object({
  finalQuantity: z.number().positive('Quantity must be greater than 0'),
});

/**
 * Send order request schema
 */
export const sendOrderSchema = z.object({
  vendorId: uuidSchema.optional(), // If not provided, sends all vendor orders
  method: z.enum(['email', 'phone', 'portal', 'in_person']).optional(),
});

/**
 * Order ID param schema
 */
export const orderIdParamSchema = z.object({
  id: uuidSchema,
});

/**
 * Order line ID param schema
 */
export const orderLineIdParamSchema = z.object({
  id: uuidSchema,
  lineId: uuidSchema,
});

/**
 * Add order line schema
 */
export const addOrderLineSchema = z.object({
  vendorOrderId: uuidSchema,
  productId: uuidSchema.nullable().optional(), // null if creating new product
  productName: z.string().min(1, 'Product name is required').max(255),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unitType: z.enum(['case', 'unit']).default('unit'),
});

/**
 * Remove order line schema (no body needed, just params)
 */
