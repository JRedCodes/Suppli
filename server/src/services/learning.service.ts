/**
 * Learning service - Tracks user behavior and calculates learning adjustments
 */

import { supabaseAdmin } from '../lib/supabase';

/**
 * Calculate quantity bias from user edit history
 * Returns adjustment value (can be positive or negative)
 */
export async function calculateQuantityBias(
  businessId: string,
  productId: string
): Promise<number> {
  // Get recent order lines for this product that were edited
  // Look at order_lines where final_quantity differs from recommended_quantity
  const { data: orderLines } = await supabaseAdmin
    .from('order_lines')
    .select(
      `
      recommended_quantity,
      final_quantity,
      vendor_orders!inner(
        orders!inner(
          status,
          approved_at
        )
      )
    `
    )
    .eq('business_id', businessId)
    .eq('product_id', productId)
    .not('vendor_orders.orders.approved_at', 'is', null) // Only approved orders
    .order('created_at', { ascending: false })
    .limit(10); // Look at last 10 approved orders

  if (!orderLines || orderLines.length === 0) {
    return 0; // No learning data yet
  }

  // Calculate average adjustment direction
  let totalAdjustment = 0;
  let adjustmentCount = 0;

  for (const line of orderLines) {
    const recommended = Number(line.recommended_quantity);
    const final = Number(line.final_quantity);
    const adjustment = final - recommended;

    // Only count meaningful adjustments (> 5% change)
    const percentChange = Math.abs(adjustment) / Math.max(recommended, 1);
    if (percentChange > 0.05) {
      totalAdjustment += adjustment;
      adjustmentCount++;
    }
  }

  if (adjustmentCount === 0) {
    return 0;
  }

  // Calculate average adjustment (conservative: use 50% of average)
  const averageAdjustment = totalAdjustment / adjustmentCount;
  const conservativeBias = averageAdjustment * 0.5;

  // Cap the bias to prevent large swings
  const maxBias = 5; // Maximum adjustment of 5 units
  return Math.max(-maxBias, Math.min(maxBias, conservativeBias));
}

/**
 * Get or create learning adjustment for a product
 */
export async function getLearningAdjustment(
  businessId: string,
  productId: string
): Promise<number> {
  // Check for existing adjustment
  const { data: existing } = await supabaseAdmin
    .from('learning_adjustments')
    .select('adjustment_value')
    .eq('business_id', businessId)
    .eq('product_id', productId)
    .eq('adjustment_type', 'quantity_bias')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (existing) {
    return Number(existing.adjustment_value);
  }

  // Calculate new adjustment from history
  const bias = await calculateQuantityBias(businessId, productId);

  // Only store if there's a meaningful bias (>= 0.5 units)
  if (Math.abs(bias) >= 0.5) {
    await supabaseAdmin.from('learning_adjustments').insert({
      business_id: businessId,
      product_id: productId,
      adjustment_type: 'quantity_bias',
      adjustment_value: bias,
    });
  }

  return bias;
}

/**
 * Update learning adjustment based on new edit
 * Called when user edits an order line
 */
export async function updateLearningFromEdit(
  businessId: string,
  productId: string,
  _recommendedQuantity: number,
  _finalQuantity: number
): Promise<void> {
  // Calculate new bias from recent history (including this edit)
  // The edit is already in the database, so recalculating will include it
  const newBias = await calculateQuantityBias(businessId, productId);

  // Update or create learning adjustment
  const { data: existing } = await supabaseAdmin
    .from('learning_adjustments')
    .select('id')
    .eq('business_id', businessId)
    .eq('product_id', productId)
    .eq('adjustment_type', 'quantity_bias')
    .limit(1)
    .single();

  if (existing) {
    // Update existing adjustment
    await supabaseAdmin
      .from('learning_adjustments')
      .update({
        adjustment_value: newBias,
      })
      .eq('id', existing.id);
  } else if (Math.abs(newBias) >= 0.5) {
    // Create new adjustment if meaningful
    await supabaseAdmin.from('learning_adjustments').insert({
      business_id: businessId,
      product_id: productId,
      adjustment_type: 'quantity_bias',
      adjustment_value: newBias,
    });
  }
}

/**
 * Calculate confidence adjustment based on approval history
 * Returns multiplier (0.8 to 1.2) to adjust confidence score
 */
export async function calculateConfidenceAdjustment(
  businessId: string,
  productId: string
): Promise<number> {
  // Get recent approved orders for this product
  const { data: approvedOrders } = await supabaseAdmin
    .from('order_lines')
    .select(
      `
      recommended_quantity,
      final_quantity,
      vendor_orders!inner(
        orders!inner(
          status,
          approved_at
        )
      )
    `
    )
    .eq('business_id', businessId)
    .eq('product_id', productId)
    .eq('vendor_orders.orders.status', 'approved')
    .not('vendor_orders.orders.approved_at', 'is', null)
    .order('created_at', { ascending: false })
    .limit(5); // Look at last 5 approved orders

  if (!approvedOrders || approvedOrders.length === 0) {
    return 1.0; // No approval history, no adjustment
  }

  // Calculate edit frequency
  let editCount = 0;
  for (const line of approvedOrders) {
    const order = (line.vendor_orders as any)?.orders;
    if (order?.status === 'approved') {
      const recommended = Number(line.recommended_quantity);
      const final = Number(line.final_quantity);
      // Consider it edited if difference is > 5%
      if (Math.abs(final - recommended) / Math.max(recommended, 1) > 0.05) {
        editCount++;
      }
    }
  }

  const editFrequency = editCount / approvedOrders.length;

  // High edit frequency → lower confidence
  // Low edit frequency → higher confidence
  if (editFrequency > 0.5) {
    // More than 50% edited → reduce confidence
    return 0.8;
  } else if (editFrequency < 0.2) {
    // Less than 20% edited → increase confidence
    return 1.1;
  }

  return 1.0; // No adjustment
}
