/**
 * Confidence scoring logic for order generation
 */

import { ProductContext, ConfidenceLevel } from './types';

/**
 * Calculate confidence score (0-1) based on available data
 */
export function calculateConfidenceScore(context: ProductContext): number {
  let score = 0;

  // Base score from sales data availability
  if (context.salesData) {
    score += 0.4; // Sales data exists

    // Data recency (more recent = higher score)
    const recencyScore = Math.max(0, 1 - context.salesData.dataRecency / 30); // 30 days = 0
    score += recencyScore * 0.2;

    // Data consistency (less variance = higher score)
    score += context.salesData.dataConsistency * 0.2;
  }

  // Previous order data
  if (context.previousOrder?.wasApproved) {
    score += 0.2;
  }

  // Active promotion reduces confidence (uncertainty)
  if (context.activePromotion) {
    score -= 0.1;
  }

  // Waste-sensitive products need higher confidence
  if (context.wasteSensitive && score < 0.6) {
    score *= 0.8; // Penalize low confidence for waste-sensitive items
  }

  return Math.max(0, Math.min(1, score));
}

/**
 * Convert numeric confidence score to user-facing level
 */
export function scoreToConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= 0.7) {
    return 'high';
  } else if (score >= 0.4) {
    return 'moderate';
  } else {
    return 'needs_review';
  }
}

/**
 * Get confidence level for a product context
 */
export function getConfidenceLevel(context: ProductContext): ConfidenceLevel {
  const score = calculateConfidenceScore(context);
  return scoreToConfidenceLevel(score);
}
