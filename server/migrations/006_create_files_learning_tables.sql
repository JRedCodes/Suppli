-- Migration: Create Files and Learning Tables
-- Description: File storage metadata and learning adjustments

-- Files table
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  file_type TEXT NOT NULL CHECK (file_type IN ('sales', 'promo', 'invoice')),
  storage_path TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Learning Adjustments table
CREATE TABLE learning_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('quantity_bias')) DEFAULT 'quantity_bias',
  adjustment_value NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_files_business_id ON files(business_id);
CREATE INDEX idx_files_file_type ON files(file_type);
CREATE INDEX idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX idx_learning_adjustments_business_id ON learning_adjustments(business_id);
CREATE INDEX idx_learning_adjustments_product_id ON learning_adjustments(product_id);
CREATE INDEX idx_learning_adjustments_type ON learning_adjustments(adjustment_type);

-- Comments
COMMENT ON TABLE files IS 'Metadata for uploaded files (actual files stored in Supabase Storage)';
COMMENT ON TABLE learning_adjustments IS 'Conservative learning adjustments based on user behavior';
