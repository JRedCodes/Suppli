/**
 * Orders service - Database operations for orders
 */

import { supabaseAdmin } from '../lib/supabase';
import { NotFoundError } from '../errors';
import { OrderGenerationResult } from '../domain/orders/types';
import { recordQuantityEdit } from './learning.service';

/**
 * Create order from generation result
 */
export async function createOrderFromGeneration(
  businessId: string,
  userId: string,
  orderPeriodStart: Date,
  orderPeriodEnd: Date,
  mode: 'guided' | 'full_auto' | 'simulation',
  generationResult: OrderGenerationResult
): Promise<string> {
  // Create main order
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      business_id: businessId,
      order_period_start: orderPeriodStart.toISOString().split('T')[0],
      order_period_end: orderPeriodEnd.toISOString().split('T')[0],
      status: mode === 'simulation' ? 'draft' : 'needs_review',
      mode,
    })
    .select('id')
    .single();

  if (orderError || !order) {
    throw new Error(`Failed to create order: ${orderError?.message}`);
  }

  const orderId = order.id;

  // Create order event
  await supabaseAdmin.from('order_events').insert({
    business_id: businessId,
    order_id: orderId,
    event_type: 'generated',
    actor_type: 'user',
    actor_id: userId,
    after_snapshot: { mode, status: mode === 'simulation' ? 'draft' : 'needs_review' },
  });

  // Create vendor orders and order lines
  for (const vendorOrder of generationResult.vendorOrders) {
    // Get vendor ordering method
    const { data: vendor } = await supabaseAdmin
      .from('vendors')
      .select('ordering_method')
      .eq('id', vendorOrder.vendorId)
      .single();

    const { data: vendorOrderRecord, error: voError } = await supabaseAdmin
      .from('vendor_orders')
      .insert({
        business_id: businessId,
        order_id: orderId,
        vendor_id: vendorOrder.vendorId,
        ordering_method: vendor?.ordering_method || 'email',
      })
      .select('id')
      .single();

    if (voError || !vendorOrderRecord) {
      console.error(`Failed to create vendor order for ${vendorOrder.vendorId}:`, voError);
      continue;
    }

    // Create order lines
    const orderLines = vendorOrder.orderLines.map((line) => ({
      business_id: businessId,
      vendor_order_id: vendorOrderRecord.id,
      product_id: line.productId,
      recommended_quantity: line.recommendedQuantity,
      final_quantity: line.finalQuantity,
      unit_type: line.unitType,
      confidence_level: line.confidenceLevel,
      explanation: line.explanation,
    }));

    const { error: linesError } = await supabaseAdmin.from('order_lines').insert(orderLines);

    if (linesError) {
      console.error(`Failed to create order lines for vendor ${vendorOrder.vendorId}:`, linesError);
    }
  }

  return orderId;
}

/**
 * Get order by ID
 */
export async function getOrderById(businessId: string, orderId: string) {
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select(
      `
      *,
      vendor_orders(
        *,
        vendors(*),
        order_lines(
          *,
          products(*)
        )
      )
    `
    )
    .eq('business_id', businessId)
    .eq('id', orderId)
    .single();

  if (error || !order) {
    throw new NotFoundError('Order not found');
  }

  return order;
}

/**
 * List orders with filters
 */
export async function listOrders(
  businessId: string,
  filters: {
    status?: string;
    vendorId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
  }
) {
  let query = supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact' })
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.dateFrom) {
    query = query.gte('order_period_start', filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte('order_period_end', filters.dateTo);
  }

  if (filters.vendorId) {
    query = query.eq('vendor_orders.vendor_id', filters.vendorId);
  }

  const page = filters.page || 1;
  const pageSize = filters.pageSize || 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  query = query.range(from, to);

  const { data: orders, error, count } = await query;

  if (error) {
    throw new Error(`Failed to list orders: ${error.message}`);
  }

  return {
    orders: orders || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

/**
 * Update order line quantity
 */
export async function updateOrderLineQuantity(
  businessId: string,
  orderId: string,
  lineId: string,
  finalQuantity: number,
  userId: string
) {
  // Verify order line exists and belongs to business/order
  const { data: orderLine, error: checkError } = await supabaseAdmin
    .from('order_lines')
    .select(
      `
      *,
      vendor_orders!inner(
        order_id,
        orders!inner(
          id,
          business_id,
          status
        )
      )
    `
    )
    .eq('id', lineId)
    .eq('business_id', businessId)
    .single();

  if (checkError || !orderLine) {
    throw new NotFoundError('Order line not found');
  }

  const order = (orderLine.vendor_orders as any)?.orders;
  if (!order || order.id !== orderId || order.business_id !== businessId) {
    throw new NotFoundError('Order line does not belong to this order');
  }

  if (order.status === 'sent' || order.status === 'cancelled') {
    throw new Error('Cannot update order line for sent or cancelled order');
  }

  // Get before snapshot
  const beforeSnapshot = {
    recommended_quantity: orderLine.recommended_quantity,
    final_quantity: orderLine.final_quantity,
  };

  // Update order line
  const { data: updated, error: updateError } = await supabaseAdmin
    .from('order_lines')
    .update({ final_quantity: finalQuantity })
    .eq('id', lineId)
    .select()
    .single();

  if (updateError || !updated) {
    throw new Error(`Failed to update order line: ${updateError?.message}`);
  }

  // Create order event
  await supabaseAdmin.from('order_events').insert({
    business_id: businessId,
    order_id: orderId,
    event_type: 'edited',
    actor_type: 'user',
    actor_id: userId,
    before_snapshot: beforeSnapshot,
    after_snapshot: {
      recommended_quantity: updated.recommended_quantity,
      final_quantity: updated.final_quantity,
    },
  });

  // Record learning from this edit (non-blocking)
  // Only learn if the quantity actually changed
  const recommendedQty = Number(orderLine.recommended_quantity);
  const finalQty = Number(finalQuantity);
  if (recommendedQty !== finalQty) {
    recordQuantityEdit(businessId, orderLine.product_id, recommendedQty, finalQty).catch(
      (error) => {
        // Log but don't fail the update if learning fails
        console.error('Failed to record learning adjustment:', error);
      }
    );
  }

  return updated;
}

/**
 * Approve order
 */
export async function approveOrder(businessId: string, orderId: string, userId: string) {
  // Get order
  const { data: order, error: getError } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('business_id', businessId)
    .eq('id', orderId)
    .single();

  if (getError || !order) {
    throw new NotFoundError('Order not found');
  }

  if (order.status !== 'needs_review' && order.status !== 'draft') {
    throw new Error(`Cannot approve order with status: ${order.status}`);
  }

  // Update order
  const { data: updated, error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: userId,
    })
    .eq('id', orderId)
    .select()
    .single();

  if (updateError || !updated) {
    throw new Error(`Failed to approve order: ${updateError?.message}`);
  }

  // Create order event
  await supabaseAdmin.from('order_events').insert({
    business_id: businessId,
    order_id: orderId,
    event_type: 'approved',
    actor_type: 'user',
    actor_id: userId,
    before_snapshot: { status: order.status },
    after_snapshot: { status: 'approved', approved_at: updated.approved_at },
  });

  return updated;
}

/**
 * Send order (marks as sent)
 */
export async function sendOrder(businessId: string, orderId: string, userId: string) {
  // Get order
  const { data: order, error: getError } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('business_id', businessId)
    .eq('id', orderId)
    .single();

  if (getError || !order) {
    throw new NotFoundError('Order not found');
  }

  if (order.status !== 'approved') {
    throw new Error(
      `Cannot send order with status: ${order.status}. Order must be approved first.`
    );
  }

  // Update order
  const { data: updated, error: updateError } = await supabaseAdmin
    .from('orders')
    .update({ status: 'sent' })
    .eq('id', orderId)
    .select()
    .single();

  if (updateError || !updated) {
    throw new Error(`Failed to send order: ${updateError?.message}`);
  }

  // Create order event
  await supabaseAdmin.from('order_events').insert({
    business_id: businessId,
    order_id: orderId,
    event_type: 'sent',
    actor_type: 'user',
    actor_id: userId,
    before_snapshot: { status: order.status },
    after_snapshot: { status: 'sent' },
  });

  return updated;
}
