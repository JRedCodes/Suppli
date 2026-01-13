-- Migration: Enable Row Level Security on All Tables
-- Description: Enable RLS on all tenant-scoped tables
-- IMPORTANT: Run this after creating all tables but before inserting any data

-- Enable RLS on all tenant-scoped tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_mismatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_adjustments ENABLE ROW LEVEL SECURITY;

-- Comments
COMMENT ON TABLE businesses IS 'RLS enabled - users can only see businesses they belong to';
COMMENT ON TABLE users IS 'RLS enabled - users can only see users in their businesses';
COMMENT ON TABLE business_users IS 'RLS enabled - users can only see memberships for their businesses';
