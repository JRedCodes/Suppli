/**
 * Orders routes
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
  generateOrderHandler,
  listOrdersHandler,
  getOrderHandler,
  updateOrderLineHandler,
  approveOrderHandler,
  sendOrderHandler,
  addOrderLineHandler,
  removeOrderLineHandler,
} from '../controllers/orders.controller';
import {
  generateOrderSchema,
  listOrdersQuerySchema,
  updateOrderLineSchema,
  orderIdParamSchema,
  orderLineIdParamSchema,
  addOrderLineSchema,
} from '../validators/orders';

const router = Router();

/**
 * Generate new order
 * POST /api/v1/orders/generate
 * Requires: Manager or Owner
 */
router.post(
  '/generate',
  verifyJWT,
  resolveBusinessContext,
  requireManager,
  validateBody(generateOrderSchema),
  generateOrderHandler
);

/**
 * List orders
 * GET /api/v1/orders
 * Requires: Staff, Manager, or Owner
 */
router.get(
  '/',
  verifyJWT,
  resolveBusinessContext,
  validateQuery(listOrdersQuerySchema),
  listOrdersHandler
);

/**
 * Get order by ID
 * GET /api/v1/orders/:id
 * Requires: Staff, Manager, or Owner
 */
router.get(
  '/:id',
  verifyJWT,
  resolveBusinessContext,
  validateParams(orderIdParamSchema),
  getOrderHandler
);

/**
 * Add order line
 * POST /api/v1/orders/:id/lines
 * Requires: Staff, Manager, or Owner
 */
router.post(
  '/:id/lines',
  verifyJWT,
  resolveBusinessContext,
  validateParams(orderIdParamSchema),
  validateBody(addOrderLineSchema),
  addOrderLineHandler
);

/**
 * Update order line quantity
 * PATCH /api/v1/orders/:id/lines/:lineId
 * Requires: Staff, Manager, or Owner
 */
router.patch(
  '/:id/lines/:lineId',
  verifyJWT,
  resolveBusinessContext,
  validateParams(orderLineIdParamSchema),
  validateBody(updateOrderLineSchema),
  updateOrderLineHandler
);

/**
 * Remove order line
 * DELETE /api/v1/orders/:id/lines/:lineId
 * Requires: Staff, Manager, or Owner
 */
router.delete(
  '/:id/lines/:lineId',
  verifyJWT,
  resolveBusinessContext,
  validateParams(orderLineIdParamSchema),
  removeOrderLineHandler
);

/**
 * Approve order
 * POST /api/v1/orders/:id/approve
 * Requires: Manager or Owner
 */
router.post(
  '/:id/approve',
  verifyJWT,
  resolveBusinessContext,
  requireManager,
  validateParams(orderIdParamSchema),
  approveOrderHandler
);

/**
 * Send order
 * POST /api/v1/orders/:id/send
 * Requires: Manager or Owner
 */
router.post(
  '/:id/send',
  verifyJWT,
  resolveBusinessContext,
  requireManager,
  validateParams(orderIdParamSchema),
  sendOrderHandler
);

export default router;
