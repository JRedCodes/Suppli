-- Migration: Create Orders Domain Tables
-- Description: Core ordering tables (orders, vendor_orders, order_lines, order_events)

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  order_period_start DATE NOT NULL,
  order_period_end DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'needs_review', 'approved', 'sent', 'cancelled')) DEFAULT 'draft',
  mode TEXT NOT NULL CHECK (mode IN ('guided', 'full_auto', 'simulation')) DEFAULT 'guided',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id)
);

-- Vendor Orders table
CREATE TABLE vendor_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  ordering_method TEXT NOT NULL CHECK (ordering_method IN ('email', 'phone', 'portal', 'in_person')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order Lines table
CREATE TABLE order_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  vendor_order_id UUID NOT NULL REFERENCES vendor_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  recommended_quantity NUMERIC(10, 2) NOT NULL,
  final_quantity NUMERIC(10, 2) NOT NULL,
  unit_type TEXT NOT NULL CHECK (unit_type IN ('case', 'unit')) DEFAULT 'unit',
  confidence_level TEXT NOT NULL CHECK (confidence_level IN ('high', 'moderate', 'needs_review')) DEFAULT 'needs_review',
  explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order Events table (audit trail)
CREATE TABLE order_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('generated', 'edited', 'approved', 'sent', 'cancelled')),
  actor_type TEXT NOT NULL CHECK (actor_type IN ('system', 'user')),
  actor_id UUID REFERENCES users(id),
  before_snapshot JSONB,
  after_snapshot JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_business_id ON orders(business_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_vendor_orders_business_id ON vendor_orders(business_id);
CREATE INDEX idx_vendor_orders_order_id ON vendor_orders(order_id);
CREATE INDEX idx_vendor_orders_vendor_id ON vendor_orders(vendor_id);
CREATE INDEX idx_order_lines_business_id ON order_lines(business_id);
CREATE INDEX idx_order_lines_vendor_order_id ON order_lines(vendor_order_id);
CREATE INDEX idx_order_lines_product_id ON order_lines(product_id);
CREATE INDEX idx_order_events_business_id ON order_events(business_id);
CREATE INDEX idx_order_events_order_id ON order_events(order_id);
CREATE INDEX idx_order_events_created_at ON order_events(created_at DESC);

-- Comments
COMMENT ON TABLE orders IS 'Main order records representing ordering cycles';
COMMENT ON TABLE vendor_orders IS 'Vendor-specific orders within a main order';
COMMENT ON TABLE order_lines IS 'Individual product lines within vendor orders';
COMMENT ON TABLE order_events IS 'Audit trail of all order-related events';
