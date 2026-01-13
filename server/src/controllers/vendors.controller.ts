/**
 * Vendors controller - request handlers for vendor endpoints
 */

import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth';
import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../lib/response';
import { AuthRequest } from '../types/auth';
import * as vendorsService from '../services/vendors.service';
import type { CreateVendorData, UpdateVendorData, VendorFilters } from '../services/vendors.service';

/**
 * List vendors
 * GET /api/v1/vendors
 */
export async function listVendorsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const filters: VendorFilters = {
      archived: typeof req.query.archived === 'boolean' ? req.query.archived : undefined,
      page: typeof req.query.page === 'number' ? req.query.page : undefined,
      pageSize: typeof req.query.pageSize === 'number' ? req.query.pageSize : undefined,
    };

    const result = await vendorsService.listVendors(authReq.businessId!, filters);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single vendor
 * GET /api/v1/vendors/:vendorId
 */
export async function getVendorHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const vendorId = Array.isArray(req.params.vendorId) ? req.params.vendorId[0] : req.params.vendorId;

    if (!authReq.businessId || !vendorId) {
      return next(new Error('Missing required parameters'));
    }

    const vendor = await vendorsService.getVendor(authReq.businessId, vendorId);
    sendSuccess(res, vendor);
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new vendor
 * POST /api/v1/vendors
 */
export async function createVendorHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const vendorData = req.body as CreateVendorData;

    if (!authReq.businessId) {
      return next(new Error('Missing business context'));
    }

    const vendor = await vendorsService.createVendor(authReq.businessId, vendorData);
    sendSuccess(res, vendor, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Update a vendor
 * PUT /api/v1/vendors/:vendorId
 */
export async function updateVendorHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const vendorId = Array.isArray(req.params.vendorId) ? req.params.vendorId[0] : req.params.vendorId;
    const vendorData = req.body as UpdateVendorData;

    if (!authReq.businessId || !vendorId) {
      return next(new Error('Missing required parameters'));
    }

    const vendor = await vendorsService.updateVendor(authReq.businessId, vendorId, vendorData);
    sendSuccess(res, vendor);
  } catch (error) {
    next(error);
  }
}

/**
 * Archive a vendor
 * PATCH /api/v1/vendors/:vendorId/archive
 */
export async function archiveVendorHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const vendorId = Array.isArray(req.params.vendorId) ? req.params.vendorId[0] : req.params.vendorId;

    if (!authReq.businessId || !vendorId) {
      return next(new Error('Missing required parameters'));
    }

    const vendor = await vendorsService.archiveVendor(authReq.businessId, vendorId);
    sendSuccess(res, vendor);
  } catch (error) {
    next(error);
  }
}
