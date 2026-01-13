/**
 * Vendors service - Database operations for vendors
 */

import { supabaseAdmin } from '../lib/supabase';
import { NotFoundError, ConflictError } from '../errors';

/**
 * Create a new vendor
 */
export async function createVendor(
  businessId: string,
  vendorData: {
    name: string;
    ordering_method: 'email' | 'phone' | 'portal' | 'in_person';
    contact_email?: string | null;
    contact_phone?: string | null;
    portal_url?: string | null;
  }
) {
  // Check if vendor with same name already exists (non-archived)
  const { data: existing } = await supabaseAdmin
    .from('vendors')
    .select('id')
    .eq('business_id', businessId)
    .eq('name', vendorData.name)
    .is('archived_at', null)
    .single();

  if (existing) {
    throw new ConflictError('Vendor with this name already exists');
  }

  // Clean up empty strings to null
  const cleanData = {
    ...vendorData,
    contact_email: vendorData.contact_email || null,
    contact_phone: vendorData.contact_phone || null,
    portal_url: vendorData.portal_url || null,
  };

  const { data: vendor, error } = await supabaseAdmin
    .from('vendors')
    .insert({
      business_id: businessId,
      ...cleanData,
    })
    .select()
    .single();

  if (error || !vendor) {
    throw new Error(`Failed to create vendor: ${error?.message}`);
  }

  return vendor;
}

/**
 * Get vendor by ID
 */
export async function getVendorById(businessId: string, vendorId: string) {
  const { data: vendor, error } = await supabaseAdmin
    .from('vendors')
    .select('*')
    .eq('business_id', businessId)
    .eq('id', vendorId)
    .single();

  if (error || !vendor) {
    throw new NotFoundError('Vendor not found');
  }

  return vendor;
}

/**
 * List vendors with filters and pagination
 */
export async function listVendors(
  businessId: string,
  filters: {
    includeArchived?: boolean;
    page?: number;
    pageSize?: number;
  }
) {
  let query = supabaseAdmin
    .from('vendors')
    .select('*', { count: 'exact' })
    .eq('business_id', businessId)
    .order('name', { ascending: true });

  // Filter archived vendors
  if (!filters.includeArchived) {
    query = query.is('archived_at', null);
  }

  const page = filters.page || 1;
  const pageSize = filters.pageSize || 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  query = query.range(from, to);

  const { data: vendors, error, count } = await query;

  if (error) {
    throw new Error(`Failed to list vendors: ${error.message}`);
  }

  return {
    vendors: vendors || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

/**
 * Update vendor
 */
export async function updateVendor(
  businessId: string,
  vendorId: string,
  updates: {
    name?: string;
    ordering_method?: 'email' | 'phone' | 'portal' | 'in_person';
    contact_email?: string | null;
    contact_phone?: string | null;
    portal_url?: string | null;
  }
) {
  // Verify vendor exists and belongs to business
  const existing = await getVendorById(businessId, vendorId);

  // If name is being updated, check for conflicts
  if (updates.name && updates.name !== existing.name) {
    const { data: conflict } = await supabaseAdmin
      .from('vendors')
      .select('id')
      .eq('business_id', businessId)
      .eq('name', updates.name)
      .is('archived_at', null)
      .neq('id', vendorId)
      .single();

    if (conflict) {
      throw new ConflictError('Vendor with this name already exists');
    }
  }

  // Clean up empty strings to null
  const cleanUpdates: any = {};
  if (updates.name !== undefined) cleanUpdates.name = updates.name;
  if (updates.ordering_method !== undefined) cleanUpdates.ordering_method = updates.ordering_method;
  if (updates.contact_email !== undefined)
    cleanUpdates.contact_email = updates.contact_email || null;
  if (updates.contact_phone !== undefined)
    cleanUpdates.contact_phone = updates.contact_phone || null;
  if (updates.portal_url !== undefined) cleanUpdates.portal_url = updates.portal_url || null;

  const { data: vendor, error } = await supabaseAdmin
    .from('vendors')
    .update(cleanUpdates)
    .eq('id', vendorId)
    .eq('business_id', businessId)
    .select()
    .single();

  if (error || !vendor) {
    throw new Error(`Failed to update vendor: ${error?.message}`);
  }

  return vendor;
}

/**
 * Archive vendor (soft delete)
 */
export async function archiveVendor(businessId: string, vendorId: string) {
  // Verify vendor exists
  await getVendorById(businessId, vendorId);

  // Check if vendor has active orders
  const { data: activeOrders } = await supabaseAdmin
    .from('vendor_orders')
    .select('id')
    .eq('business_id', businessId)
    .eq('vendor_id', vendorId)
    .limit(1);

  if (activeOrders && activeOrders.length > 0) {
    throw new ConflictError('Cannot archive vendor with active orders. Archive orders first.');
  }

  const { data: vendor, error } = await supabaseAdmin
    .from('vendors')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', vendorId)
    .eq('business_id', businessId)
    .select()
    .single();

  if (error || !vendor) {
    throw new Error(`Failed to archive vendor: ${error?.message}`);
  }

  return vendor;
}
