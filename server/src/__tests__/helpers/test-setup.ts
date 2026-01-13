/**
 * Test setup and utilities
 */

import { beforeAll, afterAll, beforeEach, vi } from 'vitest';

/**
 * Mock Supabase client for testing
 * In real tests, you would use a test database
 */
export function createMockSupabaseClient() {
  return {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      single: vi.fn(),
      range: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    })),
    auth: {
      getUser: vi.fn(),
    },
  };
}

/**
 * Test data factories
 */
export const testFactories = {
  business: () => ({
    id: 'test-business-id',
    name: 'Test Business',
  }),

  user: () => ({
    id: 'test-user-id',
    email: 'test@example.com',
  }),

  vendor: () => ({
    id: 'test-vendor-id',
    business_id: 'test-business-id',
    name: 'Test Vendor',
    ordering_method: 'email',
  }),

  product: () => ({
    id: 'test-product-id',
    business_id: 'test-business-id',
    name: 'Test Product',
    waste_sensitive: false,
  }),

  order: () => ({
    id: 'test-order-id',
    business_id: 'test-business-id',
    order_period_start: '2026-01-01',
    order_period_end: '2026-01-07',
    status: 'needs_review',
    mode: 'guided',
  }),
};
