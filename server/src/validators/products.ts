import { z } from 'zod';
import { uuidSchema } from './common';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255, 'Product name is too long'),
  category: z.string().max(255, 'Category is too long').optional().or(z.literal('')),
  waste_sensitive: z.boolean().default(false),
  max_stock_amount: z.number().positive('Max stock amount must be positive').optional().nullable(),
});

export const updateProductSchema = createProductSchema.partial();

export const productIdParamSchema = z.object({
  productId: uuidSchema,
});

export const listProductsQuerySchema = z.object({
  archived: z
    .preprocess(
      (val) => {
        if (val === undefined || val === null) return undefined;
        const str = String(val).toLowerCase();
        if (str === 'true') return true;
        if (str === 'false') return false;
        return undefined;
      },
      z.boolean().optional()
    )
    .optional(),
  category: z.string().optional(),
  page: z.preprocess((val) => parseInt(String(val), 10), z.number().int().positive()).optional(),
  pageSize: z.preprocess((val) => parseInt(String(val), 10), z.number().int().positive()).optional(),
});

export const createVendorProductSchema = z.object({
  vendor_id: uuidSchema,
  product_id: uuidSchema,
  sku: z.string().optional().or(z.literal('')),
  unit_type: z.enum(['case', 'unit']).default('unit'),
});

export const updateVendorProductSchema = z.object({
  sku: z.string().optional().or(z.literal('')),
  unit_type: z.enum(['case', 'unit']).optional(),
});

export const vendorProductIdParamSchema = z.object({
  vendorProductId: uuidSchema,
});

export const listVendorProductsQuerySchema = z.object({
  vendorId: z
    .preprocess(
      (val) => {
        if (val === undefined || val === null || val === '') return undefined;
        return val;
      },
      uuidSchema.optional()
    )
    .optional(),
  productId: z
    .preprocess(
      (val) => {
        if (val === undefined || val === null || val === '') return undefined;
        return val;
      },
      uuidSchema.optional()
    )
    .optional(),
});
