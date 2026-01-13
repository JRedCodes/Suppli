/**
 * Orders controller
 */

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth';
import { sendSuccess, sendPaginated } from '../lib/response';
import { sendError } from '../lib/response';
import { generateOrder } from '../services/order-generation.service';
import {
  createOrderFromGeneration,
  getOrderById,
  listOrders,
  updateOrderLineQuantity,
  approveOrder,
  sendOrder,
  addOrderLine,
  removeOrderLine,
} from '../services/orders.service';

/**
 * Generate a new order
 * POST /api/v1/orders/generate
 */
export async function generateOrderHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const { orderPeriodStart, orderPeriodEnd, mode, vendorIds } = req.body;

    // Generate order recommendations
    const generationResult = await generateOrder({
      businessId: authReq.businessId!,
      orderPeriodStart: new Date(orderPeriodStart),
      orderPeriodEnd: new Date(orderPeriodEnd),
      mode: mode || 'guided',
      vendorIds,
    });

    // Create order in database
    const orderId = await createOrderFromGeneration(
      authReq.businessId!,
      authReq.userId!,
      new Date(orderPeriodStart),
      new Date(orderPeriodEnd),
      mode || 'guided',
      generationResult
    );

    sendSuccess(
      res,
      {
        orderId,
        status: mode === 'simulation' ? 'draft' : 'needs_review',
        summary: generationResult.summary,
      },
      201
    );
  } catch (error) {
    // Provide helpful error messages for common issues
    if (error instanceof Error) {
      if (error.message.includes('No products found')) {
        sendError(res, 'NO_PRODUCTS', error.message, 400);
        return;
      }
      if (error.message.includes('No vendors found')) {
        sendError(res, 'NO_VENDORS', error.message, 400);
        return;
      }
    }
    next(error);
  }
}

/**
 * List orders
 * GET /api/v1/orders
 */
export async function listOrdersHandler(req: Request, res: Response): Promise<void> {
  const authReq = req as AuthRequest;
  const { status, vendorId, dateFrom, dateTo, page, pageSize } = req.query;

  const result = await listOrders(authReq.businessId!, {
    status: status as string | undefined,
    vendorId: vendorId as string | undefined,
    dateFrom: dateFrom as string | undefined,
    dateTo: dateTo as string | undefined,
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined,
  });

  sendPaginated(res, result.orders, {
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
    totalPages: result.totalPages,
  });
}

/**
 * Get order by ID
 * GET /api/v1/orders/:id
 */
export async function getOrderHandler(req: Request, res: Response): Promise<void> {
  const authReq = req as AuthRequest;
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const order = await getOrderById(authReq.businessId!, id);
  sendSuccess(res, order);
}

/**
 * Update order line quantity
 * PATCH /api/v1/orders/:id/lines/:lineId
 */
export async function updateOrderLineHandler(req: Request, res: Response): Promise<void> {
  const authReq = req as AuthRequest;
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const lineId = Array.isArray(req.params.lineId) ? req.params.lineId[0] : req.params.lineId;
  const { finalQuantity } = req.body;

  const updated = await updateOrderLineQuantity(
    authReq.businessId!,
    id,
    lineId,
    finalQuantity,
    authReq.userId!
  );

  sendSuccess(res, updated);
}

/**
 * Approve order
 * POST /api/v1/orders/:id/approve
 */
export async function approveOrderHandler(req: Request, res: Response): Promise<void> {
  const authReq = req as AuthRequest;
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const order = await approveOrder(authReq.businessId!, id, authReq.userId!);
  sendSuccess(res, order);
}

/**
 * Send order
 * POST /api/v1/orders/:id/send
 */
export async function sendOrderHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const order = await sendOrder(authReq.businessId!, id, authReq.userId!);
    sendSuccess(res, order);
  } catch (error) {
    next(error);
  }
}

/**
 * Add order line
 * POST /api/v1/orders/:id/lines
 */
export async function addOrderLineHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { vendorOrderId, productId, productName, quantity, unitType } = req.body;

    const newLine = await addOrderLine(
      authReq.businessId!,
      id,
      vendorOrderId,
      productId || null,
      productName,
      quantity,
      unitType || 'unit',
      authReq.userId!
    );
    sendSuccess(res, newLine, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Remove order line
 * DELETE /api/v1/orders/:id/lines/:lineId
 */
export async function removeOrderLineHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const lineId = Array.isArray(req.params.lineId) ? req.params.lineId[0] : req.params.lineId;

    await removeOrderLine(authReq.businessId!, id, lineId, authReq.userId!);
    sendSuccess(res, null, 204);
  } catch (error) {
    next(error);
  }
}
