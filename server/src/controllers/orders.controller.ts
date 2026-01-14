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
  deleteOrder,
} from '../services/orders.service';
import { supabaseAdmin } from '../lib/supabase';

/**
 * Generate order recommendations (simulation only - doesn't save to DB)
 * POST /api/v1/orders/generate
 * Returns order recommendations without persisting to database
 */
export async function generateOrderHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const { orderPeriodStart, orderPeriodEnd, vendorIds } = req.body;

    // Generate order recommendations (simulation mode - doesn't save to DB)
    const generationResult = await generateOrder({
      businessId: authReq.businessId!,
      orderPeriodStart: new Date(orderPeriodStart),
      orderPeriodEnd: new Date(orderPeriodEnd),
      mode: 'simulation', // Always use simulation mode for generation endpoint
      vendorIds,
    });

    // Return recommendations without saving to database
    // User must explicitly save as draft or approve to persist
    sendSuccess(
      res,
      {
        recommendations: generationResult,
        summary: generationResult.summary,
      },
      200
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
 * Save order as draft
 * POST /api/v1/orders/draft
 * Saves an order to the database with status 'draft'
 */
export async function saveDraftOrderHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const { orderPeriodStart, orderPeriodEnd, mode, vendorIds, orderId } = req.body;

    // If orderId is provided, update existing draft
    if (orderId) {
      // TODO: Implement update draft functionality
      // For now, we'll create a new draft
    }

    // Generate order recommendations
    const generationResult = await generateOrder({
      businessId: authReq.businessId!,
      orderPeriodStart: new Date(orderPeriodStart),
      orderPeriodEnd: new Date(orderPeriodEnd),
      mode: mode || 'guided',
      vendorIds,
    });

    // Create order in database with 'draft' status
    const savedOrderId = await createOrderFromGeneration(
      authReq.businessId!,
      authReq.userId!,
      new Date(orderPeriodStart),
      new Date(orderPeriodEnd),
      mode || 'guided',
      generationResult
    );

    // Update status to 'draft' explicitly
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ status: 'draft' })
      .eq('id', savedOrderId)
      .eq('business_id', authReq.businessId!);

    if (updateError) {
      throw new Error(`Failed to save draft: ${updateError.message}`);
    }

    sendSuccess(
      res,
      {
        orderId: savedOrderId,
        status: 'draft',
        summary: generationResult.summary,
      },
      201
    );
  } catch (error) {
    next(error);
  }
}

/**
 * List orders
 * GET /api/v1/orders
 */
export async function listOrdersHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
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
  } catch (error) {
    next(error);
  }
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
export async function updateOrderLineHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const lineId = Array.isArray(req.params.lineId) ? req.params.lineId[0] : req.params.lineId;
    const { finalQuantity, confidenceLevel } = req.body;

    const updated = await updateOrderLineQuantity(
      authReq.businessId!,
      id,
      lineId,
      finalQuantity,
      confidenceLevel,
      authReq.userId!
    );

    sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
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
 * Delete order
 * DELETE /api/v1/orders/:id
 */
export async function deleteOrderHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    await deleteOrder(authReq.businessId!, id, authReq.userId!);
    sendSuccess(res, null, 204);
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
