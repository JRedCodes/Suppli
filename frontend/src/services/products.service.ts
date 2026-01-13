import { apiGet, apiPost, apiPut, apiPatch, apiDelete, RequestOptions } from '../lib/api-client';

export interface Product {
  id: string;
  business_id: string;
  name: string;
  category?: string;
  waste_sensitive: boolean;
  archived_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProductRequest {
  name: string;
  category?: string;
  waste_sensitive?: boolean;
}

export interface UpdateProductRequest {
  name?: string;
  category?: string;
  waste_sensitive?: boolean;
}

export interface ProductFilters {
  archived?: boolean;
  category?: string;
  page?: number;
  pageSize?: number;
}

export interface ProductsPaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface VendorProduct {
  id: string;
  business_id: string;
  vendor_id: string;
  product_id: string;
  sku?: string;
  unit_type: 'case' | 'unit';
  created_at: string;
}

export interface CreateVendorProductRequest {
  vendor_id: string;
  product_id: string;
  sku?: string;
  unit_type?: 'case' | 'unit';
}

export interface UpdateVendorProductRequest {
  sku?: string;
  unit_type?: 'case' | 'unit';
}

export const productsService = {
  /**
   * List products
   */
  list: async (
    filters: ProductFilters = {},
    options: RequestOptions
  ): Promise<ProductsPaginatedResponse<Product>> => {
    const params = new URLSearchParams();
    if (filters.archived !== undefined) params.append('archived', filters.archived.toString());
    if (filters.category) params.append('category', filters.category);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

    const query = params.toString();
    const endpoint = query ? `/products?${query}` : '/products';
    return apiGet<ProductsPaginatedResponse<Product>>(endpoint, options);
  },

  /**
   * Get product by ID
   */
  get: async (productId: string, options: RequestOptions): Promise<Product> => {
    return apiGet<Product>(`/products/${productId}`, options);
  },

  /**
   * Create product
   */
  create: async (data: CreateProductRequest, options: RequestOptions): Promise<Product> => {
    return apiPost<Product>('/products', data, options);
  },

  /**
   * Update product
   */
  update: async (
    productId: string,
    data: UpdateProductRequest,
    options: RequestOptions
  ): Promise<Product> => {
    return apiPut<Product>(`/products/${productId}`, data, options);
  },

  /**
   * Archive product
   */
  archive: async (productId: string, options: RequestOptions): Promise<Product> => {
    return apiPatch<Product>(`/products/${productId}/archive`, {}, options);
  },

  /**
   * List vendor products (links between vendors and products)
   */
  listVendorProducts: async (
    options: RequestOptions,
    vendorId?: string,
    productId?: string
  ): Promise<VendorProduct[]> => {
    const params = new URLSearchParams();
    if (vendorId) params.append('vendorId', vendorId);
    if (productId) params.append('productId', productId);

    const query = params.toString();
    const endpoint = query ? `/products/vendor-products?${query}` : '/products/vendor-products';
    return apiGet<VendorProduct[]>(endpoint, options);
  },

  /**
   * Create vendor product link
   */
  createVendorProduct: async (
    data: CreateVendorProductRequest,
    options: RequestOptions
  ): Promise<VendorProduct> => {
    return apiPost<VendorProduct>('/products/vendor-products', data, options);
  },

  /**
   * Update vendor product link
   */
  updateVendorProduct: async (
    vendorProductId: string,
    data: UpdateVendorProductRequest,
    options: RequestOptions
  ): Promise<VendorProduct> => {
    return apiPut<VendorProduct>(`/products/vendor-products/${vendorProductId}`, data, options);
  },

  /**
   * Delete vendor product link
   */
  deleteVendorProduct: async (
    vendorProductId: string,
    options: RequestOptions
  ): Promise<void> => {
    return apiDelete<void>(`/products/vendor-products/${vendorProductId}`, options);
  },
};
