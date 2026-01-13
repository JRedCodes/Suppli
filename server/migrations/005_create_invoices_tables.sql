-- Migration: Create Invoice Verification Tables
-- Description: Invoice upload, parsing, and verification tables

-- Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  file_path TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'matched', 'mismatch')) DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invoice Lines table
CREATE TABLE invoice_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_id UUID REFERENCES products(id),
  quantity NUMERIC(10, 2) NOT NULL CHECK (quantity >= 0),
  unit TEXT NOT NULL,
  price NUMERIC(10, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invoice Mismatches table
CREATE TABLE invoice_mismatches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  order_line_id UUID REFERENCES order_lines(id),
  mismatch_type TEXT NOT NULL CHECK (mismatch_type IN ('missing', 'extra', 'quantity', 'price')),
  notes TEXT,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_invoices_business_id ON invoices(business_id);
CREATE INDEX idx_invoices_vendor_id ON invoices(vendor_id);
CREATE INDEX idx_invoices_order_id ON invoices(order_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoice_lines_business_id ON invoice_lines(business_id);
CREATE INDEX idx_invoice_lines_invoice_id ON invoice_lines(invoice_id);
CREATE INDEX idx_invoice_lines_product_id ON invoice_lines(product_id);
CREATE INDEX idx_invoice_mismatches_business_id ON invoice_mismatches(business_id);
CREATE INDEX idx_invoice_mismatches_invoice_id ON invoice_mismatches(invoice_id);
CREATE INDEX idx_invoice_mismatches_resolved ON invoice_mismatches(resolved) WHERE resolved = false;

-- Comments
COMMENT ON TABLE invoices IS 'Uploaded vendor invoices';
COMMENT ON TABLE invoice_lines IS 'Parsed line items from invoices';
COMMENT ON TABLE invoice_mismatches IS 'Detected mismatches between invoices and orders';
