/**
 * Quantity calculation logic for order generation
 */

import { ProductContext, OrderMode, OrderLineRecommendation } from './types';
import { calculateConfidenceScore, scoreToConfidenceLevel } from './confidence';

/**
 * Calculate baseline quantity from available data sources
 */
function calculateBaselineQuantity(context: ProductContext): number {
  // Priority 1: Recent sales data
  if (context.salesData?.averageQuantity) {
    return context.salesData.averageQuantity;
  }

  // Priority 2: Previous approved order
  if (context.previousOrder?.wasApproved) {
    return context.previousOrder.quantity;
  }

  // Priority 3: Conservative default (minimal quantity)
  return 1;
}

/**
 * Apply promotion uplift to quantity
 */
function applyPromotionUplift(
  quantity: number,
  promotion?: ProductContext['activePromotion']
): number {
  if (!promotion) {
    return quantity;
  }

  const upliftMultipliers = {
    low: 1.1, // +10%
    medium: 1.2, // +20%
    high: 1.3, // +30%
  };

  return quantity * upliftMultipliers[promotion.uplift];
}

/**
 * Apply conservative adjustment caps based on mode and confidence
 */
function applyAdjustmentCaps(
  quantity: number,
  baseline: number,
  mode: OrderMode,
  confidenceScore: number,
  wasteSensitive: boolean
): number {
  // Simulation mode: no caps
  if (mode === 'simulation') {
    return quantity;
  }

  // Full auto mode: looser caps
  if (mode === 'full_auto' && confidenceScore >= 0.7) {
    const maxIncrease = wasteSensitive ? 1.15 : 1.25; // +15% or +25%
    const maxDecrease = 0.7; // -30%
    return Math.max(baseline * maxDecrease, Math.min(quantity, baseline * maxIncrease));
  }

  // Guided mode (default): conservative caps
  const maxIncrease = wasteSensitive ? 1.1 : 1.2; // +10% or +20%
  const maxDecrease = 0.8; // -20%

  return Math.max(baseline * maxDecrease, Math.min(quantity, baseline * maxIncrease));
}

/**
 * Generate explanation for quantity recommendation
 */
function generateExplanation(
  context: ProductContext,
  recommendedQuantity: number,
  baseline: number,
  confidenceLevel: string
): string {
  const parts: string[] = [];

  // Primary data source
  if (context.salesData) {
    parts.push('Based on recent sales data');
  } else if (context.previousOrder) {
    parts.push('Based on previous approved order');
  } else {
    parts.push('Conservative estimate due to limited data');
  }

  // Adjustment explanation
  if (recommendedQuantity !== baseline) {
    const diff = recommendedQuantity - baseline;
    const percentChange = ((diff / baseline) * 100).toFixed(0);

    if (diff > 0) {
      parts.push(`increased by ${percentChange}%`);
    } else {
      parts.push(`decreased by ${Math.abs(Number(percentChange))}%`);
    }

    if (context.activePromotion) {
      parts.push('due to active promotion');
    }

    if (context.learningAdjustment && Math.abs(context.learningAdjustment) >= 0.5) {
      parts.push('adjusted based on past approvals');
    }
  }

  // Confidence note
  if (confidenceLevel === 'needs_review') {
    parts.push('(needs review)');
  }

  return parts.join('. ') + '.';
}

/**
 * Calculate recommended quantity for a product
 */
export function calculateRecommendedQuantity(
  context: ProductContext,
  mode: OrderMode
): OrderLineRecommendation {
  // Calculate baseline
  const baseline = calculateBaselineQuantity(context);
  let confidenceScore = calculateConfidenceScore(context);

  // Apply learning-based confidence adjustment
  if (context.confidenceAdjustment) {
    confidenceScore = Math.max(0, Math.min(1, confidenceScore * context.confidenceAdjustment));
  }

  const confidenceLevel = scoreToConfidenceLevel(confidenceScore);

  // Apply promotion uplift
  let quantity = applyPromotionUplift(baseline, context.activePromotion);

  // Apply learning adjustment (quantity bias)
  if (context.learningAdjustment) {
    quantity += context.learningAdjustment;
  }

  // Apply adjustment caps
  quantity = applyAdjustmentCaps(quantity, baseline, mode, confidenceScore, context.wasteSensitive);

  // Round to 2 decimal places
  quantity = Math.round(quantity * 100) / 100;

  // Generate explanation
  const explanation = generateExplanation(context, quantity, baseline, confidenceLevel);

  // Determine adjustment reason if applicable
  let adjustmentReason: string | undefined;
  if (context.activePromotion) {
    adjustmentReason = `Promotion uplift: ${context.activePromotion.uplift}`;
  }
  if (context.learningAdjustment && Math.abs(context.learningAdjustment) >= 0.5) {
    const learningNote =
      context.learningAdjustment > 0
        ? `Learned adjustment: +${context.learningAdjustment.toFixed(1)}`
        : `Learned adjustment: ${context.learningAdjustment.toFixed(1)}`;
    adjustmentReason = adjustmentReason ? `${adjustmentReason}; ${learningNote}` : learningNote;
  }

  return {
    productId: context.productId,
    recommendedQuantity: quantity,
    finalQuantity: quantity, // Initially same as recommended
    unitType: context.unitType,
    confidenceLevel,
    confidenceScore,
    explanation,
    adjustmentReason,
  };
}
