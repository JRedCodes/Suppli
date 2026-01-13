import { z } from 'zod';
import { uuidSchema } from './common';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.string().optional().or(z.literal('')),
  waste_sensitive: z.boolean().default(false),
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
