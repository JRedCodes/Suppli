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
  listVendorsHandler,
  getVendorHandler,
  createVendorHandler,
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
 * List vendors
 * GET /api/v1/vendors
 * Requires: Staff, Manager, or Owner
 */
router.get('/', verifyJWT, resolveBusinessContext, validateQuery(listVendorsQuerySchema), listVendorsHandler);

/**
 * Get a single vendor
 * GET /api/v1/vendors/:vendorId
 * Requires: Staff, Manager, or Owner
 */
router.get(
  '/:vendorId',
  verifyJWT,
  resolveBusinessContext,
  validateParams(vendorIdParamSchema),
  getVendorHandler
);

/**
 * Create a new vendor
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
 * Update a vendor
 * PUT /api/v1/vendors/:vendorId
 * Requires: Manager or Owner
 */
router.put(
  '/:vendorId',
  verifyJWT,
  resolveBusinessContext,
  requireManager,
  validateParams(vendorIdParamSchema),
  validateBody(updateVendorSchema),
  updateVendorHandler
);

/**
 * Archive a vendor
 * PATCH /api/v1/vendors/:vendorId/archive
 * Requires: Manager or Owner
 */
router.patch(
  '/:vendorId/archive',
  verifyJWT,
  resolveBusinessContext,
  requireManager,
  validateParams(vendorIdParamSchema),
  archiveVendorHandler
);

export default router;
