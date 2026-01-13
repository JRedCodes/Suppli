/**
 * Vendors service - API calls for vendors
 * Note: Vendors API endpoints will be implemented in a later phase
 */

import { apiGet, apiPost, apiPut, apiPatch, RequestOptions } from '../lib/api-client';

export interface Vendor {
  id: string;
  business_id: string;
  name: string;
  ordering_method: 'email' | 'phone' | 'portal' | 'in_person';
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  archived_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateVendorRequest {
  name: string;
  ordering_method: Vendor['ordering_method'];
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
}

export interface UpdateVendorRequest {
  name?: string;
  ordering_method?: Vendor['ordering_method'];
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
}

export interface VendorFilters {
  archived?: boolean;
  page?: number;
  pageSize?: number;
}

export interface VendorsPaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const vendorsService = {
  /**
   * List vendors
   */
  list: async (
    filters: VendorFilters = {},
    options: RequestOptions
  ): Promise<VendorsPaginatedResponse<Vendor>> => {
    const params = new URLSearchParams();
    if (filters.archived !== undefined) params.append('archived', filters.archived.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

    const query = params.toString();
    const endpoint = query ? `/vendors?${query}` : '/vendors';
    return apiGet<VendorsPaginatedResponse<Vendor>>(endpoint, options);
  },

  /**
   * Get vendor by ID
   */
  get: async (vendorId: string, options: RequestOptions): Promise<Vendor> => {
    return apiGet<Vendor>(`/vendors/${vendorId}`, options);
  },

  /**
   * Create vendor
   */
  create: async (data: CreateVendorRequest, options: RequestOptions): Promise<Vendor> => {
    return apiPost<Vendor>('/vendors', data, options);
  },

  /**
   * Update vendor
   */
  update: async (
    vendorId: string,
    data: UpdateVendorRequest,
    options: RequestOptions
  ): Promise<Vendor> => {
    return apiPut<Vendor>(`/vendors/${vendorId}`, data, options);
  },

  /**
   * Archive vendor
   */
  archive: async (vendorId: string, options: RequestOptions): Promise<Vendor> => {
    return apiPatch<Vendor>(`/vendors/${vendorId}/archive`, {}, options);
  },
};
