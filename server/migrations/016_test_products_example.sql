-- Migration: Example SQL for adding test products
-- Description: This is NOT a migration - it's an example script for adding test products
-- Run this manually in Supabase SQL Editor to add test products for your vendors

-- IMPORTANT: Replace the UUIDs below with your actual business_id and vendor_id
-- You can find these by running:
-- SELECT id, name FROM businesses;
-- SELECT id, name FROM vendors;

-- Step 1: Add some test products
-- Replace 'YOUR_BUSINESS_ID' with your actual business UUID
INSERT INTO products (business_id, name, category, waste_sensitive)
VALUES
  ('YOUR_BUSINESS_ID', 'Milk', 'Dairy', true),
  ('YOUR_BUSINESS_ID', 'Bread', 'Bakery', true),
  ('YOUR_BUSINESS_ID', 'Eggs', 'Dairy', true),
  ('YOUR_BUSINESS_ID', 'Chicken Breast', 'Meat', true),
  ('YOUR_BUSINESS_ID', 'Lettuce', 'Produce', true),
  ('YOUR_BUSINESS_ID', 'Tomatoes', 'Produce', true),
  ('YOUR_BUSINESS_ID', 'Onions', 'Produce', false),
  ('YOUR_BUSINESS_ID', 'Potatoes', 'Produce', false),
  ('YOUR_BUSINESS_ID', 'Rice', 'Pantry', false),
  ('YOUR_BUSINESS_ID', 'Pasta', 'Pantry', false)
ON CONFLICT DO NOTHING;

-- Step 2: Link products to your vendor(s)
-- Replace 'YOUR_BUSINESS_ID' and 'YOUR_VENDOR_ID' with actual UUIDs
-- This example links all products to one vendor - adjust as needed
INSERT INTO vendor_products (business_id, vendor_id, product_id, unit_type, sku)
SELECT 
  'YOUR_BUSINESS_ID'::uuid,
  'YOUR_VENDOR_ID'::uuid,
  p.id,
  'case',
  'SKU-' || p.name
FROM products p
WHERE p.business_id = 'YOUR_BUSINESS_ID'::uuid
ON CONFLICT (vendor_id, product_id) DO NOTHING;

-- To verify products were added:
-- SELECT p.name, p.category, vp.unit_type, v.name as vendor_name
-- FROM products p
-- JOIN vendor_products vp ON p.id = vp.product_id
-- JOIN vendors v ON vp.vendor_id = v.id
-- WHERE p.business_id = 'YOUR_BUSINESS_ID'::uuid;
