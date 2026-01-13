/**
 * Orders service - API calls for orders
 */

import { apiGet, apiPost, apiPatch, RequestOptions } from '../lib/api-client';

export interface Order {
  id: string;
  business_id: string;
  order_period_start: string;
  order_period_end: string;
  status: 'draft' | 'needs_review' | 'approved' | 'sent' | 'cancelled';
  mode: 'guided' | 'full_auto' | 'simulation';
  created_at: string;
  approved_at?: string;
  approved_by?: string;
  vendor_orders?: VendorOrder[];
}

export interface VendorOrder {
  id: string;
  vendor_id: string;
  vendors?: {
    name: string;
  };
  order_lines: OrderLine[];
}

export interface OrderLine {
  id: string;
  product_id: string;
  recommended_quantity: number;
  final_quantity: number;
  unit_type: 'case' | 'unit';
  confidence_level: 'high' | 'moderate' | 'needs_review';
  explanation?: string;
  products?: {
    name: string;
  };
}

export interface OrderSummary {
  totalProducts: number;
  highConfidence: number;
  moderateConfidence: number;
  needsReview: number;
}

export interface GenerateOrderRequest {
  orderPeriodStart: string;
  orderPeriodEnd: string;
  mode: 'guided' | 'full_auto' | 'simulation';
  vendorIds?: string[];
}

export interface GenerateOrderResponse {
  orderId: string;
  status: string;
  summary: OrderSummary;
}

export interface OrderFilters {
  status?: Order['status'];
  vendorId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface OrdersPaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateOrderLineRequest {
  finalQuantity: number;
}

export const ordersService = {
  /**
   * Generate a new order
   */
  generate: async (
    data: GenerateOrderRequest,
    options: RequestOptions
  ): Promise<GenerateOrderResponse> => {
    return apiPost<GenerateOrderResponse>('/orders/generate', data, options);
  },

  /**
   * List orders with optional filters
   */
  list: async (
    filters: OrderFilters = {},
    options: RequestOptions
  ): Promise<OrdersPaginatedResponse<Order>> => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.vendorId) params.append('vendorId', filters.vendorId);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

    const query = params.toString();
    const endpoint = query ? `/orders?${query}` : '/orders';
    return apiGet<OrdersPaginatedResponse<Order>>(endpoint, options);
  },

  /**
   * Get order by ID
   */
  get: async (orderId: string, options: RequestOptions): Promise<Order> => {
    return apiGet<Order>(`/orders/${orderId}`, options);
  },

  /**
   * Update order line quantity
   */
  updateLine: async (
    orderId: string,
    lineId: string,
    data: UpdateOrderLineRequest,
    options: RequestOptions
  ): Promise<OrderLine> => {
    return apiPatch<OrderLine>(`/orders/${orderId}/lines/${lineId}`, data, options);
  },

  /**
   * Approve order
   */
  approve: async (orderId: string, options: RequestOptions): Promise<Order> => {
    return apiPost<Order>(`/orders/${orderId}/approve`, {}, options);
  },

  /**
   * Send order
   */
  send: async (orderId: string, options: RequestOptions): Promise<Order> => {
    return apiPost<Order>(`/orders/${orderId}/send`, {}, options);
  },
};
