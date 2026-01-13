-- Migration: RLS Policies for All Tenant-Scoped Tables
-- Description: Standard tenant isolation policies for all domain tables

-- Helper function to check business membership (reusable)
-- Note: This is a common pattern, but we'll inline it in each policy for clarity

-- Vendors: Standard tenant isolation
CREATE POLICY "vendors_select"
ON vendors
FOR SELECT
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "vendors_insert"
ON vendors
FOR INSERT
WITH CHECK (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'manager')
  )
);

CREATE POLICY "vendors_update"
ON vendors
FOR UPDATE
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'manager')
  )
);

CREATE POLICY "vendors_delete"
ON vendors
FOR DELETE
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role = 'owner'
  )
);

-- Products: Standard tenant isolation
CREATE POLICY "products_select"
ON products
FOR SELECT
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "products_insert"
ON products
FOR INSERT
WITH CHECK (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'manager')
  )
);

CREATE POLICY "products_update"
ON products
FOR UPDATE
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'manager')
  )
);

CREATE POLICY "products_delete"
ON products
FOR DELETE
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role = 'owner'
  )
);

-- Vendor Products: Standard tenant isolation
CREATE POLICY "vendor_products_select"
ON vendor_products
FOR SELECT
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "vendor_products_insert"
ON vendor_products
FOR INSERT
WITH CHECK (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'manager')
  )
);

CREATE POLICY "vendor_products_update"
ON vendor_products
FOR UPDATE
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'manager')
  )
);

CREATE POLICY "vendor_products_delete"
ON vendor_products
FOR DELETE
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'manager')
  )
);
