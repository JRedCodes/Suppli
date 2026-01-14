/**
 * Utilities for handling draft orders in localStorage
 */

import type { Order, OrderGenerationResult, GenerateOrderRequest } from '../services/orders.service';

export interface DraftOrderData {
  recommendations: OrderGenerationResult;
  formData: GenerateOrderRequest;
  timestamp: number;
}

/**
 * Load draft order from localStorage
 */
export function loadDraftOrder(businessId: string, draftKey: string): DraftOrderData | null {
  try {
    const stored = localStorage.getItem(`draft_order_${businessId}_${draftKey}`);
    if (!stored) return null;
    return JSON.parse(stored) as DraftOrderData;
  } catch (error) {
    console.error('Failed to load draft order from localStorage:', error);
    return null;
  }
}

/**
 * Save draft order to localStorage
 */
export function saveDraftOrder(businessId: string, draftKey: string, data: DraftOrderData): void {
  try {
    localStorage.setItem(`draft_order_${businessId}_${draftKey}`, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save draft order to localStorage:', error);
  }
}

/**
 * Delete draft order from localStorage
 */
export function deleteDraftOrder(businessId: string, draftKey: string): void {
  try {
    localStorage.removeItem(`draft_order_${businessId}_${draftKey}`);
  } catch (error) {
    console.error('Failed to delete draft order from localStorage:', error);
  }
}

/**
 * Convert OrderGenerationResult to Order format for display
 */
export function convertDraftToOrder(
  recommendations: OrderGenerationResult,
  formData: GenerateOrderRequest,
  draftKey: string,
  businessId: string
): Order {
  // Convert vendor orders format
  const vendorOrders = recommendations.vendorOrders.map((vo, voIndex) => ({
    id: `draft-vo-${draftKey}-${voIndex}`, // Temporary ID for draft
    vendor_id: vo.vendorId,
    vendors: {
      name: vo.vendorName,
    },
    order_lines: vo.orderLines.map((line, lineIndex) => ({
      id: `draft-line-${draftKey}-${voIndex}-${lineIndex}`, // Temporary ID for draft
      product_id: line.productId,
      recommended_quantity: line.recommendedQuantity,
      final_quantity: line.finalQuantity,
      unit_type: line.unitType,
      confidence_level: line.confidenceLevel,
      explanation: line.explanation,
      products: {
        name: '', // Will be fetched from products if needed
      },
    })),
  }));

  return {
    id: `draft-${draftKey}`,
    business_id: businessId,
    order_period_start: formData.orderPeriodStart,
    order_period_end: formData.orderPeriodEnd,
    status: 'draft',
    mode: formData.mode || 'guided',
    created_at: new Date().toISOString(),
    vendor_orders: vendorOrders,
  };
}

/**
 * Update draft order line quantity
 */
export function updateDraftOrderLine(
  businessId: string,
  draftKey: string,
  vendorOrderIndex: number,
  lineIndex: number,
  updates: { finalQuantity?: number; confidenceLevel?: 'high' | 'moderate' | 'needs_review' }
): DraftOrderData | null {
  const draft = loadDraftOrder(businessId, draftKey);
  if (!draft) return null;

  const vendorOrder = draft.recommendations.vendorOrders[vendorOrderIndex];
  if (!vendorOrder) return null;

  const line = vendorOrder.orderLines[lineIndex];
  if (!line) return null;

  // Update the line
  if (updates.finalQuantity !== undefined) {
    line.finalQuantity = updates.finalQuantity;
  }
  if (updates.confidenceLevel !== undefined) {
    line.confidenceLevel = updates.confidenceLevel;
  }

  // Save back to localStorage
  saveDraftOrder(businessId, draftKey, draft);
  return draft;
}

/**
 * Add line to draft order
 */
export function addDraftOrderLine(
  businessId: string,
  draftKey: string,
  vendorId: string,
  line: {
    productId: string;
    productName: string;
    quantity: number;
    unitType: 'case' | 'unit';
  }
): DraftOrderData | null {
  const draft = loadDraftOrder(businessId, draftKey);
  if (!draft) return null;

  // Find or create vendor order
  let vendorOrder = draft.recommendations.vendorOrders.find((vo) => vo.vendorId === vendorId);
  if (!vendorOrder) {
    // Need vendor name - this is a limitation, we'd need to fetch it
    // For now, create with placeholder
    vendorOrder = {
      vendorId,
      vendorName: 'Unknown Vendor', // TODO: Fetch vendor name
      orderLines: [],
    };
    draft.recommendations.vendorOrders.push(vendorOrder);
  }

  // Add the line
  vendorOrder.orderLines.push({
    productId: line.productId,
    recommendedQuantity: line.quantity,
    finalQuantity: line.quantity,
    unitType: line.unitType,
    confidenceLevel: 'needs_review',
    confidenceScore: 0.5,
    explanation: 'Manually added to order',
  });

  // Update summary
  draft.recommendations.summary.totalProducts = draft.recommendations.vendorOrders.reduce(
    (sum, vo) => sum + vo.orderLines.length,
    0
  );
  draft.recommendations.summary.needsReview += 1;

  // Save back to localStorage
  saveDraftOrder(businessId, draftKey, draft);
  return draft;
}

/**
 * Remove line from draft order
 */
export function removeDraftOrderLine(
  businessId: string,
  draftKey: string,
  vendorOrderIndex: number,
  lineIndex: number
): DraftOrderData | null {
  const draft = loadDraftOrder(businessId, draftKey);
  if (!draft) return null;

  const vendorOrder = draft.recommendations.vendorOrders[vendorOrderIndex];
  if (!vendorOrder) return null;

  const removedLine = vendorOrder.orderLines[lineIndex];
  if (!removedLine) return null;

  // Remove the line
  vendorOrder.orderLines.splice(lineIndex, 1);

  // Update summary
  draft.recommendations.summary.totalProducts = draft.recommendations.vendorOrders.reduce(
    (sum, vo) => sum + vo.orderLines.length,
    0
  );
  if (removedLine.confidenceLevel === 'needs_review') {
    draft.recommendations.summary.needsReview = Math.max(0, draft.recommendations.summary.needsReview - 1);
  }

  // Remove vendor order if empty
  if (vendorOrder.orderLines.length === 0) {
    draft.recommendations.vendorOrders.splice(vendorOrderIndex, 1);
  }

  // Save back to localStorage
  saveDraftOrder(businessId, draftKey, draft);
  return draft;
}
