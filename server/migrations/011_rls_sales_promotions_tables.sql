-- Migration: RLS Policies for Sales and Promotions Tables
-- Description: Tenant isolation for sales_events, promotions, promotion_products

-- Sales Events: Standard tenant isolation
CREATE POLICY "sales_events_select"
ON sales_events
FOR SELECT
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "sales_events_insert"
ON sales_events
FOR INSERT
WITH CHECK (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'manager')
  )
);

-- Sales events are append-only, no update/delete

-- Promotions: Standard tenant isolation
CREATE POLICY "promotions_select"
ON promotions
FOR SELECT
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "promotions_insert"
ON promotions
FOR INSERT
WITH CHECK (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'manager')
  )
);

CREATE POLICY "promotions_update"
ON promotions
FOR UPDATE
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'manager')
  )
);

CREATE POLICY "promotions_delete"
ON promotions
FOR DELETE
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'manager')
  )
);

-- Promotion Products: Standard tenant isolation
CREATE POLICY "promotion_products_select"
ON promotion_products
FOR SELECT
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "promotion_products_insert"
ON promotion_products
FOR INSERT
WITH CHECK (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'manager')
  )
);

CREATE POLICY "promotion_products_delete"
ON promotion_products
FOR DELETE
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'manager')
  )
);
