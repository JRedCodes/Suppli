/**
 * Order generation service
 * Orchestrates order generation logic
 */

import { supabaseAdmin } from '../lib/supabase';
import {
  OrderGenerationInput,
  OrderGenerationResult,
  ProductContext,
  OrderLineRecommendation,
} from '../domain/orders/types';
import { calculateRecommendedQuantity } from '../domain/orders/quantity-calculator';
import { getQuantityBiases } from './learning.service';

/**
 * Fetch sales data for products
 */
async function fetchSalesData(
  businessId: string,
  productIds: string[],
  periodStart: Date,
  periodEnd: Date
): Promise<Map<string, any>> {
  // For MVP: Simple average calculation from sales_events
  // In production, this would be more sophisticated
  const { data: salesEvents } = await supabaseAdmin
    .from('sales_events')
    .select('product_id, quantity, event_date')
    .eq('business_id', businessId)
    .in('product_id', productIds)
    .gte('event_date', periodStart.toISOString().split('T')[0])
    .lte('event_date', periodEnd.toISOString().split('T')[0]);

  if (!salesEvents) {
    return new Map();
  }

  // Group by product and calculate averages
  const salesMap = new Map<string, any>();
  const productGroups = new Map<string, typeof salesEvents>();

  for (const event of salesEvents) {
    if (!productGroups.has(event.product_id)) {
      productGroups.set(event.product_id, []);
    }
    productGroups.get(event.product_id)!.push(event);
  }

  for (const [productId, events] of productGroups.entries()) {
    const quantities = events.map((e) => Number(e.quantity));
    const average = quantities.reduce((a, b) => a + b, 0) / quantities.length;

    // Calculate data recency (days since most recent sale)
    const mostRecent = new Date(Math.max(...events.map((e) => new Date(e.event_date).getTime())));
    const daysSince = Math.floor((Date.now() - mostRecent.getTime()) / (1000 * 60 * 60 * 24));

    // Simple consistency score (1 - coefficient of variation)
    const mean = average;
    const variance =
      quantities.reduce((sum, q) => sum + Math.pow(q - mean, 2), 0) / quantities.length;
    const stdDev = Math.sqrt(variance);
    const consistency = mean > 0 ? Math.max(0, 1 - stdDev / mean) : 0;

    salesMap.set(productId, {
      productId,
      averageQuantity: average,
      recentSales: events.map((e) => ({
        date: new Date(e.event_date),
        quantity: Number(e.quantity),
      })),
      dataRecency: daysSince,
      dataConsistency: consistency,
    });
  }

  return salesMap;
}

/**
 * Fetch previous order data
 */
async function fetchPreviousOrders(
  businessId: string,
  productIds: string[]
): Promise<Map<string, any>> {
  // Get most recent approved order for each product
  const { data: orderLines } = await supabaseAdmin
    .from('order_lines')
    .select(
      `
      product_id,
      final_quantity,
      vendor_order_id,
      vendor_orders!inner(
        order_id,
        orders!inner(
          approved_at,
          status
        )
      )
    `
    )
    .eq('business_id', businessId)
    .in('product_id', productIds)
    .order('created_at', { ascending: false });

  if (!orderLines) {
    return new Map();
  }

  // Get unique most recent approved order per product
  const previousOrders = new Map<string, any>();
  const seenProducts = new Set<string>();

  for (const line of orderLines) {
    const productId = line.product_id;
    if (seenProducts.has(productId)) continue;

    const order = (line.vendor_orders as any)?.orders;
    if (order?.status === 'approved' && order?.approved_at) {
      previousOrders.set(productId, {
        productId,
        quantity: Number(line.final_quantity),
        orderDate: new Date(order.approved_at),
        wasApproved: true,
      });
      seenProducts.add(productId);
    }
  }

  return previousOrders;
}

/**
 * Fetch active promotions
 */
async function fetchActivePromotions(
  businessId: string,
  productIds: string[],
  periodStart: Date,
  periodEnd: Date
): Promise<Map<string, any>> {
  const { data: promotions } = await supabaseAdmin
    .from('promotions')
    .select(
      `
      id,
      start_date,
      end_date,
      promotion_products!inner(
        product_id,
        uplift
      )
    `
    )
    .eq('business_id', businessId)
    .lte('start_date', periodEnd.toISOString().split('T')[0])
    .gte('end_date', periodStart.toISOString().split('T')[0]);

  if (!promotions) {
    return new Map();
  }

  const promotionMap = new Map<string, any>();

  for (const promo of promotions) {
    const products = (promo.promotion_products as any[]) || [];
    for (const pp of products) {
      if (productIds.includes(pp.product_id)) {
        promotionMap.set(pp.product_id, {
          productId: pp.product_id,
          uplift: pp.uplift || 'low',
          startDate: new Date(promo.start_date),
          endDate: new Date(promo.end_date),
        });
      }
    }
  }

  return promotionMap;
}

/**
 * Generate order recommendations
 */
export async function generateOrder(input: OrderGenerationInput): Promise<OrderGenerationResult> {
  const { businessId, orderPeriodStart, orderPeriodEnd, mode, vendorIds } = input;

  // Fetch vendors
  let vendorQuery = supabaseAdmin
    .from('vendors')
    .select('id, name, ordering_method')
    .eq('business_id', businessId)
    .is('archived_at', null);

  if (vendorIds && vendorIds.length > 0) {
    vendorQuery = vendorQuery.in('id', vendorIds);
  }

  const { data: vendors } = await vendorQuery;

  if (!vendors || vendors.length === 0) {
    throw new Error('No vendors found for order generation');
  }

  // Fetch products for each vendor
  const { data: vendorProducts } = await supabaseAdmin
    .from('vendor_products')
    .select(
      `
      vendor_id,
      product_id,
      unit_type,
      products!inner(
        id,
        name,
        waste_sensitive
      )
    `
    )
    .eq('business_id', businessId)
    .in(
      'vendor_id',
      vendors.map((v) => v.id)
    );

  if (!vendorProducts || vendorProducts.length === 0) {
    throw new Error(
      'No products found for the selected vendors. Please add products to your vendors before generating orders. Products can be added through the vendor management interface.'
    );
  }

  // Group products by vendor
  const vendorProductMap = new Map<string, typeof vendorProducts>();
  for (const vp of vendorProducts) {
    if (!vendorProductMap.has(vp.vendor_id)) {
      vendorProductMap.set(vp.vendor_id, []);
    }
    vendorProductMap.get(vp.vendor_id)!.push(vp);
  }

  // Fetch all product IDs
  const allProductIds = vendorProducts.map((vp) => (vp.products as any).id);

  // Fetch supporting data in parallel
  const [salesDataMap, previousOrdersMap, promotionsMap, learningBiasesMap] = await Promise.all([
    fetchSalesData(businessId, allProductIds, orderPeriodStart, orderPeriodEnd),
    fetchPreviousOrders(businessId, allProductIds),
    fetchActivePromotions(businessId, allProductIds, orderPeriodStart, orderPeriodEnd),
    getQuantityBiases(businessId, allProductIds),
  ]);

  // Build product contexts and generate recommendations
  const vendorOrders: OrderGenerationResult['vendorOrders'] = [];

  for (const vendor of vendors) {
    const vendorProductsList = vendorProductMap.get(vendor.id) || [];
    const orderLines: OrderLineRecommendation[] = [];

    for (const vp of vendorProductsList) {
      const product = vp.products as any;
      const productId = product.id;

      // Build product context
      const context: ProductContext = {
        productId,
        productName: product.name,
        wasteSensitive: product.waste_sensitive || false,
        unitType: (vp.unit_type as any) || 'unit',
        salesData: salesDataMap.get(productId),
        previousOrder: previousOrdersMap.get(productId),
        activePromotion: promotionsMap.get(productId),
        learningAdjustment: learningBiasesMap.get(productId), // Quantity bias from learning loop
      };

      // Calculate recommendation
      const recommendation = calculateRecommendedQuantity(context, mode);
      orderLines.push(recommendation);
    }

    if (orderLines.length > 0) {
      vendorOrders.push({
        vendorId: vendor.id,
        vendorName: vendor.name,
        orderLines,
      });
    }
  }

  // Calculate summary
  const allLines = vendorOrders.flatMap((vo) => vo.orderLines);
  const summary = {
    totalProducts: allLines.length,
    highConfidence: allLines.filter((l) => l.confidenceLevel === 'high').length,
    moderateConfidence: allLines.filter((l) => l.confidenceLevel === 'moderate').length,
    needsReview: allLines.filter((l) => l.confidenceLevel === 'needs_review').length,
  };

  // For now, return without orderId (will be created by API layer)
  return {
    orderId: '', // Will be set when order is created
    vendorOrders,
    summary,
  };
}
