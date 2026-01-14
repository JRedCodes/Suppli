import { Router } from 'express';
import {
  verifyJWT,
  resolveBusinessContext,
  requireManager,
  validateBody,
  validateQuery,
  validateParams,
} from '../middleware';
import {
  listProductsHandler,
  getProductHandler,
  createProductHandler,
  updateProductHandler,
  archiveProductHandler,
  listVendorProductsHandler,
  createVendorProductHandler,
  updateVendorProductHandler,
  deleteVendorProductHandler,
} from '../controllers/products.controller';
import {
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
  listProductsQuerySchema,
  createVendorProductSchema,
  updateVendorProductSchema,
  vendorProductIdParamSchema,
  listVendorProductsQuerySchema,
} from '../validators/products';

const router = Router();

/**
 * List products
 * GET /api/v1/products
 * Requires: Staff, Manager, or Owner
 */
router.get(
  '/',
  verifyJWT,
  resolveBusinessContext,
  validateQuery(listProductsQuerySchema),
  listProductsHandler
);

/**
 * Archive a product (must come before /:productId route)
 * PATCH /api/v1/products/:productId/archive
 * Requires: Manager or Owner
 */
router.patch(
  '/:productId/archive',
  verifyJWT,
  resolveBusinessContext,
  requireManager,
  validateParams(productIdParamSchema),
  archiveProductHandler
);

/**
 * Get a single product
 * GET /api/v1/products/:productId
 * Requires: Staff, Manager, or Owner
 */
router.get(
  '/:productId',
  verifyJWT,
  resolveBusinessContext,
  validateParams(productIdParamSchema),
  getProductHandler
);

/**
 * Create a new product
 * POST /api/v1/products
 * Requires: Manager or Owner
 */
router.post(
  '/',
  verifyJWT,
  resolveBusinessContext,
  requireManager,
  validateBody(createProductSchema),
  createProductHandler
);

/**
 * Update a product
 * PUT /api/v1/products/:productId
 * Requires: Manager or Owner
 */
router.put(
  '/:productId',
  verifyJWT,
  resolveBusinessContext,
  requireManager,
  validateParams(productIdParamSchema),
  validateBody(updateProductSchema),
  updateProductHandler
);

/**
 * List vendor products (links between vendors and products)
 * GET /api/v1/products/vendor-products
 * Query params: vendorId, productId (optional filters)
 * Requires: Staff, Manager, or Owner
 */
router.get(
  '/vendor-products',
  verifyJWT,
  resolveBusinessContext,
  validateQuery(listVendorProductsQuerySchema),
  listVendorProductsHandler
);

/**
 * Create a vendor product link
 * POST /api/v1/products/vendor-products
 * Requires: Manager or Owner
 */
router.post(
  '/vendor-products',
  verifyJWT,
  resolveBusinessContext,
  requireManager,
  validateBody(createVendorProductSchema),
  createVendorProductHandler
);

/**
 * Update a vendor product link
 * PUT /api/v1/products/vendor-products/:vendorProductId
 * Requires: Manager or Owner
 */
router.put(
  '/vendor-products/:vendorProductId',
  verifyJWT,
  resolveBusinessContext,
  requireManager,
  validateParams(vendorProductIdParamSchema),
  validateBody(updateVendorProductSchema),
  updateVendorProductHandler
);

/**
 * Delete a vendor product link
 * DELETE /api/v1/products/vendor-products/:vendorProductId
 * Requires: Manager or Owner
 */
router.delete(
  '/vendor-products/:vendorProductId',
  verifyJWT,
  resolveBusinessContext,
  requireManager,
  validateParams(vendorProductIdParamSchema),
  deleteVendorProductHandler
);

export default router;
