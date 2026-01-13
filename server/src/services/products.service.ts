import { getSupabaseAdmin } from '../lib/supabase';
import { Product, CreateProductData, UpdateProductData, ProductFilters } from '../types/product';
import { ConflictError, NotFoundError } from '../errors';

export interface PaginatedProductsResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export async function listProducts(
  businessId: string,
  filters: ProductFilters = {}
): Promise<PaginatedProductsResponse> {
  const supabase = getSupabaseAdmin();
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 50;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('business_id', businessId);

  // Default behavior: if archived is not specified, show only non-archived products
  // If archived === false, explicitly show only non-archived
  // If archived === true, show only archived
  // Handle both boolean and string values (in case validation didn't convert)
  const archivedFilter = filters.archived;
  const isArchivedFalse = archivedFilter === false || archivedFilter === 'false' || archivedFilter === undefined;
  const isArchivedTrue = archivedFilter === true || archivedFilter === 'true';
  
  if (isArchivedFalse) {
    query = query.is('archived_at', null);
  } else if (isArchivedTrue) {
    query = query.not('archived_at', 'is', null);
  }

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  const { data, error, count } = await query
    .order('name', { ascending: true })
    .range(offset, offset + pageSize - 1);

  if (error) {
    throw new Error(`Failed to list products: ${error.message}`);
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize);

  return {
    data: data || [],
    meta: {
      total,
      page,
      pageSize,
      totalPages,
    },
  };
}

export async function getProductById(businessId: string, productId: string): Promise<Product> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('business_id', businessId)
    .eq('id', productId)
    .single();

  if (error || !data) {
    throw new NotFoundError(`Product with ID ${productId} not found`);
  }
  return data;
}

export async function createProduct(businessId: string, data: CreateProductData): Promise<Product> {
  const supabase = getSupabaseAdmin();

  // Check for duplicate product name within the business
  const { count, error: countError } = await supabase
    .from('products')
    .select('id', { count: 'exact' })
    .eq('business_id', businessId)
    .eq('name', data.name)
    .is('archived_at', null);

  if (countError) {
    throw new Error(`Failed to check for duplicate product: ${countError.message}`);
  }
  if (count && count > 0) {
    throw new ConflictError(`Product with name '${data.name}' already exists.`);
  }

  const { data: newProduct, error } = await supabase
    .from('products')
    .insert({
      business_id: businessId,
      name: data.name,
      category: data.category || null,
      waste_sensitive: data.waste_sensitive ?? false,
    })
    .select('*')
    .single();

  if (error || !newProduct) {
    throw new Error(`Failed to create product: ${error?.message}`);
  }
  return newProduct;
}

export async function updateProduct(
  businessId: string,
  productId: string,
  data: UpdateProductData
): Promise<Product> {
  const supabase = getSupabaseAdmin();

  // Check for duplicate name if name is being updated
  if (data.name) {
    const { count, error: countError } = await supabase
      .from('products')
      .select('id', { count: 'exact' })
      .eq('business_id', businessId)
      .eq('name', data.name)
      .is('archived_at', null)
      .not('id', 'eq', productId); // Exclude current product

    if (countError) {
      throw new Error(`Failed to check for duplicate product name: ${countError.message}`);
    }
    if (count && count > 0) {
      throw new ConflictError(`Product with name '${data.name}' already exists.`);
    }
  }

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.category !== undefined) updateData.category = data.category || null;
  if (data.waste_sensitive !== undefined) updateData.waste_sensitive = data.waste_sensitive;

  const { data: updatedProduct, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('business_id', businessId)
    .eq('id', productId)
    .select('*')
    .single();

  if (error || !updatedProduct) {
    throw new NotFoundError(`Product with ID ${productId} not found or failed to update`);
  }
  return updatedProduct;
}

export async function archiveProduct(businessId: string, productId: string): Promise<Product> {
  const supabase = getSupabaseAdmin();
  const { data: archivedProduct, error } = await supabase
    .from('products')
    .update({ archived_at: new Date().toISOString() })
    .eq('business_id', businessId)
    .eq('id', productId)
    .is('archived_at', null) // Only archive if not already archived
    .select('*')
    .single();

  if (error || !archivedProduct) {
    throw new NotFoundError(`Product with ID ${productId} not found or already archived`);
  }
  return archivedProduct;
}
