/**
 * Tests for quantity calculation
 */

import { describe, it, expect } from 'vitest';
import { calculateRecommendedQuantity } from '../quantity-calculator';
import { ProductContext } from '../types';

describe('Quantity Calculator', () => {
  describe('calculateRecommendedQuantity', () => {
    it('returns conservative default with no data', () => {
      const context: ProductContext = {
        productId: 'test-id',
        productName: 'Test Product',
        wasteSensitive: false,
        unitType: 'unit',
      };

      const result = calculateRecommendedQuantity(context, 'guided');
      expect(result.recommendedQuantity).toBeGreaterThan(0);
      expect(result.finalQuantity).toBe(result.recommendedQuantity);
      expect(result.confidenceLevel).toBe('needs_review');
      expect(result.explanation).toContain('Conservative estimate');
    });

    it('uses sales data when available', () => {
      const context: ProductContext = {
        productId: 'test-id',
        productName: 'Test Product',
        wasteSensitive: false,
        unitType: 'unit',
        salesData: {
          productId: 'test-id',
          averageQuantity: 10,
          recentSales: [{ date: new Date(), quantity: 10 }],
          dataRecency: 1,
          dataConsistency: 0.9,
        },
      };

      const result = calculateRecommendedQuantity(context, 'guided');
      expect(result.recommendedQuantity).toBeCloseTo(10, 1);
      expect(result.explanation).toContain('recent sales data');
    });

    it('uses previous order when sales data unavailable', () => {
      const context: ProductContext = {
        productId: 'test-id',
        productName: 'Test Product',
        wasteSensitive: false,
        unitType: 'unit',
        previousOrder: {
          productId: 'test-id',
          quantity: 15,
          orderDate: new Date(),
          wasApproved: true,
        },
      };

      const result = calculateRecommendedQuantity(context, 'guided');
      expect(result.recommendedQuantity).toBeCloseTo(15, 1);
      expect(result.explanation).toContain('previous approved order');
    });

    it('applies promotion uplift', () => {
      const context: ProductContext = {
        productId: 'test-id',
        productName: 'Test Product',
        wasteSensitive: false,
        unitType: 'unit',
        salesData: {
          productId: 'test-id',
          averageQuantity: 10,
          recentSales: [],
          dataRecency: 1,
          dataConsistency: 0.9,
        },
        activePromotion: {
          productId: 'test-id',
          uplift: 'medium',
          startDate: new Date(),
          endDate: new Date(),
        },
      };

      const result = calculateRecommendedQuantity(context, 'guided');
      // Medium uplift = 1.2x, but capped
      expect(result.recommendedQuantity).toBeGreaterThan(10);
      expect(result.explanation).toContain('promotion');
    });

    it('applies conservative caps in guided mode', () => {
      const context: ProductContext = {
        productId: 'test-id',
        productName: 'Test Product',
        wasteSensitive: false,
        unitType: 'unit',
        salesData: {
          productId: 'test-id',
          averageQuantity: 100,
          recentSales: [],
          dataRecency: 1,
          dataConsistency: 0.9,
        },
        activePromotion: {
          productId: 'test-id',
          uplift: 'high',
          startDate: new Date(),
          endDate: new Date(),
        },
      };

      const result = calculateRecommendedQuantity(context, 'guided');
      // Should be capped at +20% (120), not +30% (130)
      expect(result.recommendedQuantity).toBeLessThanOrEqual(120);
    });

    it('applies stricter caps for waste-sensitive products', () => {
      const context: ProductContext = {
        productId: 'test-id',
        productName: 'Test Product',
        wasteSensitive: true,
        unitType: 'unit',
        salesData: {
          productId: 'test-id',
          averageQuantity: 100,
          recentSales: [],
          dataRecency: 1,
          dataConsistency: 0.9,
        },
      };

      const result = calculateRecommendedQuantity(context, 'guided');
      // Waste-sensitive should be capped at +10% (110), not +20% (120)
      expect(result.recommendedQuantity).toBeLessThanOrEqual(110);
    });

    it('does not apply caps in simulation mode', () => {
      const context: ProductContext = {
        productId: 'test-id',
        productName: 'Test Product',
        wasteSensitive: false,
        unitType: 'unit',
        salesData: {
          productId: 'test-id',
          averageQuantity: 100,
          recentSales: [],
          dataRecency: 1,
          dataConsistency: 0.9,
        },
        activePromotion: {
          productId: 'test-id',
          uplift: 'high',
          startDate: new Date(),
          endDate: new Date(),
        },
      };

      const result = calculateRecommendedQuantity(context, 'simulation');
      // Simulation mode should allow higher quantities
      expect(result.recommendedQuantity).toBeGreaterThan(120);
    });

    it('generates explanation for all scenarios', () => {
      const context: ProductContext = {
        productId: 'test-id',
        productName: 'Test Product',
        wasteSensitive: false,
        unitType: 'unit',
        salesData: {
          productId: 'test-id',
          averageQuantity: 10,
          recentSales: [],
          dataRecency: 1,
          dataConsistency: 0.9,
        },
      };

      const result = calculateRecommendedQuantity(context, 'guided');
      expect(result.explanation).toBeTruthy();
      expect(result.explanation.length).toBeGreaterThan(0);
    });
  });
});
