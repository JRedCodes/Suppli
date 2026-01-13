import { getSupabaseAdmin } from '../lib/supabase';
import {
  VendorProduct,
  CreateVendorProductData,
  UpdateVendorProductData,
} from '../types/product';
import { ConflictError, NotFoundError } from '../errors';

export async function listVendorProducts(
  businessId: string,
  vendorId?: string,
  productId?: string
): Promise<VendorProduct[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('vendor_products')
    .select('*')
    .eq('business_id', businessId);

  if (vendorId) {
    query = query.eq('vendor_id', vendorId);
  }

  if (productId) {
    query = query.eq('product_id', productId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list vendor products: ${error.message}`);
  }

  return data || [];
}

export async function getVendorProductById(
  businessId: string,
  vendorProductId: string
): Promise<VendorProduct> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('vendor_products')
    .select('*')
    .eq('business_id', businessId)
    .eq('id', vendorProductId)
    .single();

  if (error || !data) {
    throw new NotFoundError(`Vendor product with ID ${vendorProductId} not found`);
  }
  return data;
}

export async function createVendorProduct(
  businessId: string,
  data: CreateVendorProductData
): Promise<VendorProduct> {
  const supabase = getSupabaseAdmin();

  // Check for duplicate vendor-product combination
  const { data: existing, error: checkError } = await supabase
    .from('vendor_products')
    .select('id')
    .eq('business_id', businessId)
    .eq('vendor_id', data.vendor_id)
    .eq('product_id', data.product_id)
    .maybeSingle();

  if (checkError) {
    throw new Error(`Failed to check for duplicate vendor product: ${checkError.message}`);
  }
  if (existing) {
    throw new ConflictError('This product is already linked to this vendor.');
  }

  const { data: newVendorProduct, error } = await supabase
    .from('vendor_products')
    .insert({
      business_id: businessId,
      vendor_id: data.vendor_id,
      product_id: data.product_id,
      sku: data.sku || null,
      unit_type: data.unit_type || 'unit',
    })
    .select('*')
    .single();

  if (error || !newVendorProduct) {
    throw new Error(`Failed to create vendor product: ${error?.message}`);
  }
  return newVendorProduct;
}

export async function updateVendorProduct(
  businessId: string,
  vendorProductId: string,
  data: UpdateVendorProductData
): Promise<VendorProduct> {
  const supabase = getSupabaseAdmin();
  const { data: updatedVendorProduct, error } = await supabase
    .from('vendor_products')
    .update({
      sku: data.sku,
      unit_type: data.unit_type,
    })
    .eq('business_id', businessId)
    .eq('id', vendorProductId)
    .select('*')
    .single();

  if (error || !updatedVendorProduct) {
    throw new NotFoundError(`Vendor product with ID ${vendorProductId} not found or failed to update`);
  }
  return updatedVendorProduct;
}

export async function deleteVendorProduct(
  businessId: string,
  vendorProductId: string
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('vendor_products')
    .delete()
    .eq('business_id', businessId)
    .eq('id', vendorProductId);

  if (error) {
    throw new NotFoundError(`Vendor product with ID ${vendorProductId} not found or failed to delete`);
  }
}
