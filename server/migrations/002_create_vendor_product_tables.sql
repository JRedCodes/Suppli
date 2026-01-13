-- Migration: Create Vendor and Product Tables
-- Description: Vendor and product management tables

-- Vendors table
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ordering_method TEXT NOT NULL CHECK (ordering_method IN ('email', 'phone', 'portal', 'in_person')),
  contact_email TEXT,
  contact_phone TEXT,
  portal_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  waste_sensitive BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

-- Vendor Products join table (optional - maps products to vendors)
CREATE TABLE vendor_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT,
  unit_type TEXT NOT NULL CHECK (unit_type IN ('case', 'unit')) DEFAULT 'unit',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(vendor_id, product_id)
);

-- Indexes
CREATE INDEX idx_vendors_business_id ON vendors(business_id);
CREATE INDEX idx_vendors_archived_at ON vendors(archived_at) WHERE archived_at IS NULL;
CREATE INDEX idx_products_business_id ON products(business_id);
CREATE INDEX idx_products_archived_at ON products(archived_at) WHERE archived_at IS NULL;
CREATE INDEX idx_vendor_products_business_id ON vendor_products(business_id);
CREATE INDEX idx_vendor_products_vendor_id ON vendor_products(vendor_id);
CREATE INDEX idx_vendor_products_product_id ON vendor_products(product_id);

-- Comments
COMMENT ON TABLE vendors IS 'Vendor/supplier information';
COMMENT ON TABLE products IS 'Product catalog items';
COMMENT ON TABLE vendor_products IS 'Maps products to vendors with vendor-specific metadata';
