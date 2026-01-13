/**
 * Vendors controller
 */

import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth';
import { sendSuccess, sendPaginated } from '../lib/response';
import {
  createVendor,
  getVendorById,
  listVendors,
  updateVendor,
  archiveVendor,
} from '../services/vendors.service';

/**
 * Create a new vendor
 * POST /api/v1/vendors
 */
export async function createVendorHandler(req: Request, res: Response): Promise<void> {
  const authReq = req as AuthRequest;
  const vendorData = req.body;

  const vendor = await createVendor(authReq.businessId!, vendorData);
  sendSuccess(res, vendor, 201);
}

/**
 * List vendors
 * GET /api/v1/vendors
 */
export async function listVendorsHandler(req: Request, res: Response): Promise<void> {
  const authReq = req as AuthRequest;
  const { includeArchived, page, pageSize } = req.query;

  const result = await listVendors(authReq.businessId!, {
    includeArchived: includeArchived === 'true',
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined,
  });

  sendPaginated(res, result.vendors, {
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
    totalPages: result.totalPages,
  });
}

/**
 * Get vendor by ID
 * GET /api/v1/vendors/:id
 */
export async function getVendorHandler(req: Request, res: Response): Promise<void> {
  const authReq = req as AuthRequest;
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const vendor = await getVendorById(authReq.businessId!, id);
  sendSuccess(res, vendor);
}

/**
 * Update vendor
 * PATCH /api/v1/vendors/:id
 */
export async function updateVendorHandler(req: Request, res: Response): Promise<void> {
  const authReq = req as AuthRequest;
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const updates = req.body;

  const vendor = await updateVendor(authReq.businessId!, id, updates);
  sendSuccess(res, vendor);
}

/**
 * Archive vendor (soft delete)
 * DELETE /api/v1/vendors/:id
 */
export async function archiveVendorHandler(req: Request, res: Response): Promise<void> {
  const authReq = req as AuthRequest;
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const vendor = await archiveVendor(authReq.businessId!, id);
  sendSuccess(res, vendor);
}
