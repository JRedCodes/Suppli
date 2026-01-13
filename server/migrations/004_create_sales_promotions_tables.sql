-- Migration: Create Sales and Promotions Tables
-- Description: Sales data and promotion tracking tables

-- Sales Events table
CREATE TABLE sales_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL CHECK (quantity >= 0),
  source TEXT NOT NULL CHECK (source IN ('pos', 'upload', 'manual')) DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Promotions table
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  uplift_level TEXT NOT NULL CHECK (uplift_level IN ('low', 'medium', 'high')) DEFAULT 'low',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ,
  CHECK (end_date >= start_date)
);

-- Promotion Products join table
CREATE TABLE promotion_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(promotion_id, product_id)
);

-- Indexes
CREATE INDEX idx_sales_events_business_id ON sales_events(business_id);
CREATE INDEX idx_sales_events_product_id ON sales_events(product_id);
CREATE INDEX idx_sales_events_date ON sales_events(date DESC);
CREATE INDEX idx_promotions_business_id ON promotions(business_id);
CREATE INDEX idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX idx_promotions_archived_at ON promotions(archived_at) WHERE archived_at IS NULL;
CREATE INDEX idx_promotion_products_business_id ON promotion_products(business_id);
CREATE INDEX idx_promotion_products_promotion_id ON promotion_products(promotion_id);
CREATE INDEX idx_promotion_products_product_id ON promotion_products(product_id);

-- Comments
COMMENT ON TABLE sales_events IS 'Historical sales data (append-only)';
COMMENT ON TABLE promotions IS 'Time-bound promotions that affect demand';
COMMENT ON TABLE promotion_products IS 'Maps products to promotions';
