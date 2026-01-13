export interface Product {
  id: string;
  business_id: string;
  name: string;
  category: string | null;
  waste_sensitive: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CreateProductData {
  name: string;
  category?: string;
  waste_sensitive?: boolean;
}

export interface UpdateProductData {
  name?: string;
  category?: string;
  waste_sensitive?: boolean;
  archived_at?: string | null;
}

export interface ProductFilters {
  archived?: boolean;
  category?: string;
  page?: number;
  pageSize?: number;
}

export interface VendorProduct {
  id: string;
  business_id: string;
  vendor_id: string;
  product_id: string;
  sku: string | null;
  unit_type: 'case' | 'unit';
  created_at: string;
}

export interface CreateVendorProductData {
  vendor_id: string;
  product_id: string;
  sku?: string;
  unit_type?: 'case' | 'unit';
}

export interface UpdateVendorProductData {
  sku?: string;
  unit_type?: 'case' | 'unit';
}
