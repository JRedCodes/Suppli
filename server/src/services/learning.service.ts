/**
 * Learning service - Tracks user behavior and calculates learning adjustments
 *
 * This service implements a conservative, rule-based learning loop that:
 * - Tracks user edits to order line quantities
 * - Calculates quantity biases based on consistent edit patterns
 * - Stores adjustments that can be applied to future order generation
 * - Never auto-approves or makes large changes without review
 */

import { supabaseAdmin } from '../lib/supabase';

/**
 * Calculate quantity bias from user edit
 * Returns a multiplier (e.g., 0.95 for -5%, 1.1 for +10%)
 */
function calculateQuantityBias(recommendedQuantity: number, finalQuantity: number): number {
  if (recommendedQuantity === 0) {
    return 1.0; // No adjustment if no baseline
  }

  // Calculate the ratio of final to recommended
  const ratio = finalQuantity / recommendedQuantity;

  // Cap adjustments to prevent extreme values
  // Conservative range: 0.8 to 1.2 (20% decrease to 20% increase)
  const cappedRatio = Math.max(0.8, Math.min(1.2, ratio));

  return cappedRatio;
}

/**
 * Get existing quantity bias for a product
 * Returns the most recent adjustment value, or null if none exists
 */
async function getExistingQuantityBias(
  businessId: string,
  productId: string
): Promise<number | null> {
  const { data, error } = await supabaseAdmin
    .from('learning_adjustments')
    .select('adjustment_value')
    .eq('business_id', businessId)
    .eq('product_id', productId)
    .eq('adjustment_type', 'quantity_bias')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return Number(data.adjustment_value);
}

/**
 * Calculate new quantity bias by averaging with existing bias
 * Uses exponential moving average for conservative updates
 */
function calculateNewBias(existingBias: number | null, newBias: number): number {
  // If no existing bias, use the new one directly
  if (existingBias === null) {
    return newBias;
  }

  // Exponential moving average with alpha = 0.3 (conservative)
  // This means new data has 30% weight, existing has 70% weight
  const alpha = 0.3;
  const updatedBias = existingBias * (1 - alpha) + newBias * alpha;

  // Ensure the result stays within reasonable bounds
  return Math.max(0.8, Math.min(1.2, updatedBias));
}

/**
 * Record a learning adjustment from a user edit
 * This is called when a user edits an order line quantity
 */
export async function recordQuantityEdit(
  businessId: string,
  productId: string,
  recommendedQuantity: number,
  finalQuantity: number
): Promise<void> {
  // Only learn if there's a meaningful difference (at least 5% or 0.5 units)
  const absoluteDiff = Math.abs(finalQuantity - recommendedQuantity);
  const percentDiff =
    recommendedQuantity > 0
      ? Math.abs((finalQuantity - recommendedQuantity) / recommendedQuantity)
      : 0;

  if (absoluteDiff < 0.5 && percentDiff < 0.05) {
    // Change is too small to learn from
    return;
  }

  // Calculate the bias from this edit
  const editBias = calculateQuantityBias(recommendedQuantity, finalQuantity);

  // Get existing bias if any
  const existingBias = await getExistingQuantityBias(businessId, productId);

  // Calculate new bias using conservative averaging
  const newBias = calculateNewBias(existingBias, editBias);

  // Only store if the new bias is meaningfully different from existing
  // (at least 1% difference)
  if (existingBias !== null) {
    const biasDiff = Math.abs(newBias - existingBias);
    if (biasDiff < 0.01) {
      // Not enough change to warrant a new record
      return;
    }
  }

  // Store the new adjustment
  const { error } = await supabaseAdmin.from('learning_adjustments').insert({
    business_id: businessId,
    product_id: productId,
    adjustment_type: 'quantity_bias',
    adjustment_value: newBias,
  });

  if (error) {
    // Log error but don't throw - learning failures shouldn't break order flow
    console.error('Failed to record learning adjustment:', error);
  }
}

/**
 * Record learning from order approval
 * When an order is approved without edits, we can slightly increase confidence
 * This is tracked implicitly through the absence of edits rather than explicit adjustments
 */
export async function recordOrderApproval(businessId: string, orderId: string): Promise<void> {
  // For MVP, approval without edits is tracked via order_events
  // Future: Could calculate confidence adjustments here
  // For now, we just ensure the event is logged (handled by orders service)
}

/**
 * Get quantity bias adjustment for a product
 * Returns a multiplier to apply to recommended quantities (default: 1.0)
 */
export async function getQuantityBias(businessId: string, productId: string): Promise<number> {
  const bias = await getExistingQuantityBias(businessId, productId);
  return bias ?? 1.0; // Default to no adjustment
}

/**
 * Get quantity bias adjustments for multiple products
 * Returns a Map of productId -> bias multiplier
 */
export async function getQuantityBiases(
  businessId: string,
  productIds: string[]
): Promise<Map<string, number>> {
  if (productIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabaseAdmin
    .from('learning_adjustments')
    .select('product_id, adjustment_value')
    .eq('business_id', businessId)
    .eq('adjustment_type', 'quantity_bias')
    .in('product_id', productIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch quantity biases:', error);
    return new Map();
  }

  // Group by product_id and take the most recent for each
  const biasMap = new Map<string, number>();
  const seenProducts = new Set<string>();

  // Process in reverse order (most recent first) to get latest per product
  for (let i = data.length - 1; i >= 0; i--) {
    const row = data[i];
    if (!seenProducts.has(row.product_id)) {
      biasMap.set(row.product_id, Number(row.adjustment_value));
      seenProducts.add(row.product_id);
    }
  }

  return biasMap;
}
