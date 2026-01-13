/**
 * Vendors service - database operations for vendors
 */

import { supabaseAdmin } from '../lib/supabase';
import { NotFoundError, ConflictError } from '../errors';
import type { Vendor } from '../types/vendor';

export interface CreateVendorData {
  name: string;
  ordering_method: 'email' | 'phone' | 'portal' | 'in_person';
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
}

export interface UpdateVendorData {
  name?: string;
  ordering_method?: 'email' | 'phone' | 'portal' | 'in_person';
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
}

export interface VendorFilters {
  archived?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PaginatedVendorsResponse {
  data: Vendor[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * List vendors for a business
 */
export async function listVendors(
  businessId: string,
  filters: VendorFilters = {}
): Promise<PaginatedVendorsResponse> {
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 50;
  const offset = (page - 1) * pageSize;

  let query = supabaseAdmin
    .from('vendors')
    .select('*', { count: 'exact' })
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  // Filter by archived status
  if (filters.archived === true) {
    query = query.not('archived_at', 'is', null);
  } else if (filters.archived === false) {
    query = query.is('archived_at', null);
  }

  const { data, error, count } = await query.range(offset, offset + pageSize - 1);

  if (error) {
    throw new Error(`Failed to list vendors: ${error.message}`);
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize);

  return {
    data: (data || []) as Vendor[],
    meta: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
}

/**
 * Get a single vendor by ID
 */
export async function getVendor(businessId: string, vendorId: string): Promise<Vendor> {
  const { data, error } = await supabaseAdmin
    .from('vendors')
    .select('*')
    .eq('id', vendorId)
    .eq('business_id', businessId)
    .single();

  if (error || !data) {
    throw new NotFoundError('Vendor not found');
  }

  return data as Vendor;
}

/**
 * Create a new vendor
 */
export async function createVendor(businessId: string, vendorData: CreateVendorData): Promise<Vendor> {
  // Check for duplicate name (case-insensitive)
  const { data: existing } = await supabaseAdmin
    .from('vendors')
    .select('id')
    .eq('business_id', businessId)
    .eq('name', vendorData.name)
    .is('archived_at', null)
    .maybeSingle();

  if (existing) {
    throw new ConflictError('A vendor with this name already exists');
  }

  const { data, error } = await supabaseAdmin
    .from('vendors')
    .insert({
      business_id: businessId,
      name: vendorData.name,
      ordering_method: vendorData.ordering_method,
      contact_email: vendorData.contact_email || null,
      contact_phone: vendorData.contact_phone || null,
      notes: vendorData.notes || null,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to create vendor: ${error?.message || 'Unknown error'}`);
  }

  return data as Vendor;
}

/**
 * Update a vendor
 */
export async function updateVendor(
  businessId: string,
  vendorId: string,
  vendorData: UpdateVendorData
): Promise<Vendor> {
  // Check if vendor exists
  await getVendor(businessId, vendorId);

  // Check for duplicate name if name is being updated
  if (vendorData.name) {
    const { data: existing } = await supabaseAdmin
      .from('vendors')
      .select('id')
      .eq('business_id', businessId)
      .eq('name', vendorData.name)
      .neq('id', vendorId)
      .is('archived_at', null)
      .maybeSingle();

    if (existing) {
      throw new ConflictError('A vendor with this name already exists');
    }
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (vendorData.name !== undefined) updateData.name = vendorData.name;
  if (vendorData.ordering_method !== undefined) updateData.ordering_method = vendorData.ordering_method;
  if (vendorData.contact_email !== undefined) updateData.contact_email = vendorData.contact_email || null;
  if (vendorData.contact_phone !== undefined) updateData.contact_phone = vendorData.contact_phone || null;
  if (vendorData.notes !== undefined) updateData.notes = vendorData.notes || null;

  const { data, error } = await supabaseAdmin
    .from('vendors')
    .update(updateData)
    .eq('id', vendorId)
    .eq('business_id', businessId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to update vendor: ${error?.message || 'Unknown error'}`);
  }

  return data as Vendor;
}

/**
 * Archive a vendor
 */
export async function archiveVendor(businessId: string, vendorId: string): Promise<Vendor> {
  // Check if vendor exists
  await getVendor(businessId, vendorId);

  const { data, error } = await supabaseAdmin
    .from('vendors')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', vendorId)
    .eq('business_id', businessId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to archive vendor: ${error?.message || 'Unknown error'}`);
  }

  return data as Vendor;
}
