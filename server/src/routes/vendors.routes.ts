/**
 * Vendors routes
 */

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
  createVendorHandler,
  listVendorsHandler,
  getVendorHandler,
  updateVendorHandler,
  archiveVendorHandler,
} from '../controllers/vendors.controller';
import {
  createVendorSchema,
  updateVendorSchema,
  vendorIdParamSchema,
  listVendorsQuerySchema,
} from '../validators/vendors';

const router = Router();

/**
 * Create vendor
 * POST /api/v1/vendors
 * Requires: Manager or Owner
 */
router.post(
  '/',
  verifyJWT,
  resolveBusinessContext,
  requireManager,
  validateBody(createVendorSchema),
  createVendorHandler
);

/**
 * List vendors
 * GET /api/v1/vendors
 * Requires: Staff, Manager, or Owner
 */
router.get(
  '/',
  verifyJWT,
  resolveBusinessContext,
  validateQuery(listVendorsQuerySchema),
  listVendorsHandler
);

/**
 * Get vendor by ID
 * GET /api/v1/vendors/:id
 * Requires: Staff, Manager, or Owner
 */
router.get(
  '/:id',
  verifyJWT,
  resolveBusinessContext,
  validateParams(vendorIdParamSchema),
  getVendorHandler
);

/**
 * Update vendor
 * PATCH /api/v1/vendors/:id
 * Requires: Manager or Owner
 */
router.patch(
  '/:id',
  verifyJWT,
  resolveBusinessContext,
  requireManager,
  validateParams(vendorIdParamSchema),
  validateBody(updateVendorSchema),
  updateVendorHandler
);

/**
 * Archive vendor (soft delete)
 * DELETE /api/v1/vendors/:id
 * Requires: Manager or Owner
 */
router.delete(
  '/:id',
  verifyJWT,
  resolveBusinessContext,
  requireManager,
  validateParams(vendorIdParamSchema),
  archiveVendorHandler
);

export default router;
