import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth';
import { sendSuccess, sendPaginated } from '../lib/response';
import * as productsService from '../services/products.service';
import * as vendorProductsService from '../services/vendor-products.service';
import type {
  CreateProductData,
  UpdateProductData,
  ProductFilters,
  CreateVendorProductData,
  UpdateVendorProductData,
} from '../types/product';
import { UnauthorizedError } from '../errors';

export async function listProductsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const filters = req.query as unknown as ProductFilters;

    if (!authReq.businessId) {
      throw new UnauthorizedError('Business context is required');
    }

    const { data, meta } = await productsService.listProducts(authReq.businessId, filters);
    sendPaginated(res, data, meta);
  } catch (error) {
    next(error);
  }
}

export async function getProductHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const productId = Array.isArray(req.params.productId)
      ? req.params.productId[0]
      : req.params.productId;

    if (!authReq.businessId) {
      throw new UnauthorizedError('Business context is required');
    }

    const product = await productsService.getProductById(authReq.businessId, productId);
    sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
}

export async function createProductHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const createData = req.body as CreateProductData;

    if (!authReq.businessId) {
      throw new UnauthorizedError('Business context is required');
    }

    const newProduct = await productsService.createProduct(authReq.businessId, createData);
    sendSuccess(res, newProduct, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateProductHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const productId = Array.isArray(req.params.productId)
      ? req.params.productId[0]
      : req.params.productId;
    const updateData = req.body as UpdateProductData;

    if (!authReq.businessId) {
      throw new UnauthorizedError('Business context is required');
    }

    const updatedProduct = await productsService.updateProduct(
      authReq.businessId,
      productId,
      updateData
    );
    sendSuccess(res, updatedProduct);
  } catch (error) {
    next(error);
  }
}

export async function archiveProductHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const productId = Array.isArray(req.params.productId)
      ? req.params.productId[0]
      : req.params.productId;

    if (!authReq.businessId) {
      throw new UnauthorizedError('Business context is required');
    }

    const archivedProduct = await productsService.archiveProduct(authReq.businessId, productId);
    sendSuccess(res, archivedProduct);
  } catch (error) {
    next(error);
  }
}

// Vendor Products handlers
export async function listVendorProductsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const { vendorId, productId } = req.query;

    if (!authReq.businessId) {
      throw new UnauthorizedError('Business context is required');
    }

    const vendorProducts = await vendorProductsService.listVendorProducts(
      authReq.businessId,
      vendorId as string | undefined,
      productId as string | undefined
    );
    sendSuccess(res, vendorProducts);
  } catch (error) {
    next(error);
  }
}

export async function createVendorProductHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const createData = req.body as CreateVendorProductData;

    if (!authReq.businessId) {
      throw new UnauthorizedError('Business context is required');
    }

    const newVendorProduct = await vendorProductsService.createVendorProduct(
      authReq.businessId,
      createData
    );
    sendSuccess(res, newVendorProduct, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateVendorProductHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const vendorProductId = Array.isArray(req.params.vendorProductId)
      ? req.params.vendorProductId[0]
      : req.params.vendorProductId;
    const updateData = req.body as UpdateVendorProductData;

    if (!authReq.businessId) {
      throw new UnauthorizedError('Business context is required');
    }

    const updatedVendorProduct = await vendorProductsService.updateVendorProduct(
      authReq.businessId,
      vendorProductId,
      updateData
    );
    sendSuccess(res, updatedVendorProduct);
  } catch (error) {
    next(error);
  }
}

export async function deleteVendorProductHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const vendorProductId = Array.isArray(req.params.vendorProductId)
      ? req.params.vendorProductId[0]
      : req.params.vendorProductId;

    if (!authReq.businessId) {
      throw new UnauthorizedError('Business context is required');
    }

    await vendorProductsService.deleteVendorProduct(authReq.businessId, vendorProductId);
    sendSuccess(res, { success: true });
  } catch (error) {
    next(error);
  }
}
