/**
 * Order generation domain types
 */

export type OrderMode = 'guided' | 'full_auto' | 'simulation';
export type OrderStatus = 'draft' | 'approved' | 'sent' | 'cancelled';
export type ConfidenceLevel = 'high' | 'moderate' | 'needs_review';
export type UnitType = 'case' | 'unit';

/**
 * Order generation input
 */
export interface OrderGenerationInput {
  businessId: string;
  orderPeriodStart: Date;
  orderPeriodEnd: Date;
  mode: OrderMode;
  vendorIds?: string[]; // If not provided, generate for all active vendors
}

/**
 * Sales data for a product
 */
export interface ProductSalesData {
  productId: string;
  averageQuantity: number;
  recentSales: Array<{
    date: Date;
    quantity: number;
  }>;
  dataRecency: number; // Days since most recent sale
  dataConsistency: number; // 0-1 score based on variance
}

/**
 * Previous order data
 */
export interface PreviousOrderData {
  productId: string;
  quantity: number;
  orderDate: Date;
  wasApproved: boolean;
}

/**
 * Promotion data
 */
export interface PromotionData {
  productId: string;
  uplift: 'low' | 'medium' | 'high';
  startDate: Date;
  endDate: Date;
}

/**
 * Product context for order generation
 */
export interface ProductContext {
  productId: string;
  productName: string;
  wasteSensitive: boolean;
  unitType: UnitType;
  maxStockAmount?: number | null; // Optional upper limit safeguard
  salesData?: ProductSalesData;
  previousOrder?: PreviousOrderData;
  activePromotion?: PromotionData;
  learningAdjustment?: number; // Quantity bias multiplier from learning loop (e.g., 0.95 for -5%, 1.1 for +10%)
}

/**
 * Calculated order line recommendation
 */
export interface OrderLineRecommendation {
  productId: string;
  recommendedQuantity: number;
  finalQuantity: number; // Same as recommended initially, can be edited
  unitType: UnitType;
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number; // 0-1 internal score
  explanation: string;
  adjustmentReason?: string;
}

/**
 * Order generation result
 */
export interface OrderGenerationResult {
  orderId: string;
  vendorOrders: Array<{
    vendorId: string;
    vendorName: string;
    orderLines: OrderLineRecommendation[];
  }>;
  summary: {
    totalProducts: number;
    highConfidence: number;
    moderateConfidence: number;
    needsReview: number;
  };
}
