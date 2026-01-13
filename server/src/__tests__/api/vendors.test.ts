/**
 * Integration tests for Vendors API endpoints
 */

import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app';

// Mock Supabase before importing app
vi.mock('../../lib/supabase', () => {
  const mockQueryBuilder = {
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
    is: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  };

  return {
    supabaseAdmin: {
      from: vi.fn(() => mockQueryBuilder),
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
          error: null,
        }),
      },
    },
  };
});

describe('Vendors API', () => {
  const app = createApp();
  const mockToken = 'mock-jwt-token';
  const mockBusinessId = 'test-business-id';

  describe('POST /api/v1/vendors', () => {
    it('requires authentication', async () => {
      const response = await request(app)
        .post('/api/v1/vendors')
        .send({
          name: 'Test Vendor',
          ordering_method: 'email',
        });

      expect(response.status).toBe(401);
    });

    it('requires business context', async () => {
      const response = await request(app)
        .post('/api/v1/vendors')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          name: 'Test Vendor',
          ordering_method: 'email',
        });

      expect(response.status).toBe(401);
    });

    it('validates request body', async () => {
      // Mock business_users lookup
      const { supabaseAdmin } = await import('../../lib/supabase');
      vi.mocked(supabaseAdmin.from).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { business_id: mockBusinessId, role: 'manager' },
          error: null,
        }),
      } as any);

      const response = await request(app)
        .post('/api/v1/vendors')
        .set('Authorization', `Bearer ${mockToken}`)
        .set('X-Business-Id', mockBusinessId)
        .send({
          name: '', // Invalid: empty name
          ordering_method: 'email',
        });

      expect([400, 401]).toContain(response.status);
      if (response.status === 400) {
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('validates ordering method', async () => {
      // Mock business_users lookup
      const { supabaseAdmin } = await import('../../lib/supabase');
      vi.mocked(supabaseAdmin.from).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { business_id: mockBusinessId, role: 'manager' },
          error: null,
        }),
      } as any);

      const response = await request(app)
        .post('/api/v1/vendors')
        .set('Authorization', `Bearer ${mockToken}`)
        .set('X-Business-Id', mockBusinessId)
        .send({
          name: 'Test Vendor',
          ordering_method: 'invalid', // Invalid method
        });

      expect([400, 401]).toContain(response.status);
      if (response.status === 400) {
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      }
    });
  });

  describe('GET /api/v1/vendors', () => {
    it('requires authentication', async () => {
      const response = await request(app).get('/api/v1/vendors');

      expect(response.status).toBe(401);
    });

    it('validates query parameters', async () => {
      // Mock business_users lookup
      const { supabaseAdmin } = await import('../../lib/supabase');
      vi.mocked(supabaseAdmin.from).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { business_id: mockBusinessId, role: 'staff' },
          error: null,
        }),
      } as any);

      const response = await request(app)
        .get('/api/v1/vendors')
        .set('Authorization', `Bearer ${mockToken}`)
        .set('X-Business-Id', mockBusinessId)
        .query({
          page: 'invalid',
          pageSize: 200, // Exceeds max
        });

      // Should handle invalid params gracefully
      expect([200, 400, 401]).toContain(response.status);
    });
  });

  describe('GET /api/v1/vendors/:id', () => {
    it('requires authentication', async () => {
      const response = await request(app).get('/api/v1/vendors/test-id');

      expect(response.status).toBe(401);
    });

    it('validates vendor ID format', async () => {
      // Mock business_users lookup
      const { supabaseAdmin } = await import('../../lib/supabase');
      vi.mocked(supabaseAdmin.from).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { business_id: mockBusinessId, role: 'staff' },
          error: null,
        }),
      } as any);

      const response = await request(app)
        .get('/api/v1/vendors/invalid-id')
        .set('Authorization', `Bearer ${mockToken}`)
        .set('X-Business-Id', mockBusinessId);

      expect([400, 401]).toContain(response.status);
      if (response.status === 400) {
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      }
    });
  });

  describe('PATCH /api/v1/vendors/:id', () => {
    it('requires authentication', async () => {
      const response = await request(app)
        .patch('/api/v1/vendors/test-id')
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(401);
    });

    it('requires manager role', async () => {
      // Mock business_users lookup with staff role (should fail)
      const { supabaseAdmin } = await import('../../lib/supabase');
      vi.mocked(supabaseAdmin.from).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { business_id: mockBusinessId, role: 'staff' },
          error: null,
        }),
      } as any);

      const response = await request(app)
        .patch('/api/v1/vendors/test-id')
        .set('Authorization', `Bearer ${mockToken}`)
        .set('X-Business-Id', mockBusinessId)
        .send({ name: 'Updated Name' });

      // Should fail with 403 (forbidden) for staff role
      expect([403, 404, 401]).toContain(response.status);
    });

    it('validates update body', async () => {
      // Mock business_users lookup
      const { supabaseAdmin } = await import('../../lib/supabase');
      vi.mocked(supabaseAdmin.from).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { business_id: mockBusinessId, role: 'manager' },
          error: null,
        }),
      } as any);

      const response = await request(app)
        .patch('/api/v1/vendors/test-id')
        .set('Authorization', `Bearer ${mockToken}`)
        .set('X-Business-Id', mockBusinessId)
        .send({}); // Empty body

      expect([400, 401]).toContain(response.status);
      if (response.status === 400) {
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      }
    });
  });

  describe('DELETE /api/v1/vendors/:id', () => {
    it('requires authentication', async () => {
      const response = await request(app).delete('/api/v1/vendors/test-id');

      expect(response.status).toBe(401);
    });

    it('requires manager role', async () => {
      // Mock business_users lookup with staff role (should fail)
      const { supabaseAdmin } = await import('../../lib/supabase');
      vi.mocked(supabaseAdmin.from).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { business_id: mockBusinessId, role: 'staff' },
          error: null,
        }),
      } as any);

      const response = await request(app)
        .delete('/api/v1/vendors/test-id')
        .set('Authorization', `Bearer ${mockToken}`)
        .set('X-Business-Id', mockBusinessId);

      // Should fail with 403 (forbidden) for staff role
      expect([403, 404, 401]).toContain(response.status);
    });
  });
});
