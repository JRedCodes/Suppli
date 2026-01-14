-- Migration: Add max_stock_amount to products table
-- Description: Adds an optional max_stock_amount NUMERIC column to the products table to set upper limits for order quantities

ALTER TABLE products
ADD COLUMN IF NOT EXISTS max_stock_amount NUMERIC(10, 2);

-- Add comment for documentation
COMMENT ON COLUMN products.max_stock_amount IS 'Optional maximum stock amount to use as an upper limit safeguard when calculating order quantities';
