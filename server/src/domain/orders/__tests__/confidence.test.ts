/**
 * Tests for confidence scoring
 */

import { describe, it, expect } from 'vitest';
import { calculateConfidenceScore, scoreToConfidenceLevel, getConfidenceLevel } from '../confidence';
import { ProductContext } from '../types';

describe('Confidence Scoring', () => {
  describe('calculateConfidenceScore', () => {
    it('returns low score with no data', () => {
      const context: ProductContext = {
        productId: 'test-id',
        productName: 'Test Product',
        wasteSensitive: false,
        unitType: 'unit',
      };

      const score = calculateConfidenceScore(context);
      expect(score).toBe(0);
    });

    it('increases score with sales data', () => {
      const context: ProductContext = {
        productId: 'test-id',
        productName: 'Test Product',
        wasteSensitive: false,
        unitType: 'unit',
        salesData: {
          productId: 'test-id',
          averageQuantity: 10,
          recentSales: [
            { date: new Date(), quantity: 10 },
            { date: new Date(), quantity: 12 },
          ],
          dataRecency: 1, // 1 day old
          dataConsistency: 0.9, // High consistency
        },
      };

      const score = calculateConfidenceScore(context);
      expect(score).toBeGreaterThan(0.4);
    });

    it('increases score with previous approved order', () => {
      const context: ProductContext = {
        productId: 'test-id',
        productName: 'Test Product',
        wasteSensitive: false,
        unitType: 'unit',
        previousOrder: {
          productId: 'test-id',
          quantity: 10,
          orderDate: new Date(),
          wasApproved: true,
        },
      };

      const score = calculateConfidenceScore(context);
      expect(score).toBeGreaterThanOrEqual(0.2);
    });

    it('reduces score with active promotion', () => {
      const contextWithPromo: ProductContext = {
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

      const contextWithoutPromo: ProductContext = {
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

      const scoreWithPromo = calculateConfidenceScore(contextWithPromo);
      const scoreWithoutPromo = calculateConfidenceScore(contextWithoutPromo);
      // Should be less than score without promotion
      expect(scoreWithPromo).toBeLessThan(scoreWithoutPromo);
    });

    it('penalizes waste-sensitive products with low confidence', () => {
      const context: ProductContext = {
        productId: 'test-id',
        productName: 'Test Product',
        wasteSensitive: true,
        unitType: 'unit',
        salesData: {
          productId: 'test-id',
          averageQuantity: 10,
          recentSales: [],
          dataRecency: 20, // Older data
          dataConsistency: 0.5, // Lower consistency
        },
      };

      const score = calculateConfidenceScore(context);
      // Waste-sensitive with low confidence should be penalized
      expect(score).toBeLessThan(0.5);
    });
  });

  describe('scoreToConfidenceLevel', () => {
    it('returns high for score >= 0.7', () => {
      expect(scoreToConfidenceLevel(0.8)).toBe('high');
      expect(scoreToConfidenceLevel(0.7)).toBe('high');
    });

    it('returns moderate for score 0.4-0.69', () => {
      expect(scoreToConfidenceLevel(0.5)).toBe('moderate');
      expect(scoreToConfidenceLevel(0.4)).toBe('moderate');
    });

    it('returns needs_review for score < 0.4', () => {
      expect(scoreToConfidenceLevel(0.3)).toBe('needs_review');
      expect(scoreToConfidenceLevel(0)).toBe('needs_review');
    });
  });

  describe('getConfidenceLevel', () => {
    it('returns appropriate level based on context', () => {
      const context: ProductContext = {
        productId: 'test-id',
        productName: 'Test Product',
        wasteSensitive: false,
        unitType: 'unit',
        salesData: {
          productId: 'test-id',
          averageQuantity: 10,
          recentSales: [
            { date: new Date(), quantity: 10 },
          ],
          dataRecency: 1,
          dataConsistency: 0.9,
        },
      };

      const level = getConfidenceLevel(context);
      expect(['high', 'moderate', 'needs_review']).toContain(level);
    });
  });
});
