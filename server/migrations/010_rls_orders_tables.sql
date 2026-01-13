-- Migration: RLS Policies for Orders Domain Tables
-- Description: Tenant isolation for orders, vendor_orders, order_lines, order_events

-- Orders: Standard tenant isolation
CREATE POLICY "orders_select"
ON orders
FOR SELECT
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "orders_insert"
ON orders
FOR INSERT
WITH CHECK (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'manager')
  )
);

CREATE POLICY "orders_update"
ON orders
FOR UPDATE
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'manager')
  )
);

-- Staff can view orders but not modify (unless explicitly allowed)
-- Orders are read-only for staff by default

-- Vendor Orders: Standard tenant isolation
CREATE POLICY "vendor_orders_select"
ON vendor_orders
FOR SELECT
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "vendor_orders_insert"
ON vendor_orders
FOR INSERT
WITH CHECK (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'manager')
  )
);

CREATE POLICY "vendor_orders_update"
ON vendor_orders
FOR UPDATE
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'manager')
  )
);

-- Order Lines: Standard tenant isolation
CREATE POLICY "order_lines_select"
ON order_lines
FOR SELECT
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "order_lines_insert"
ON order_lines
FOR INSERT
WITH CHECK (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'manager')
  )
);

CREATE POLICY "order_lines_update"
ON order_lines
FOR UPDATE
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'manager', 'staff')
  )
);

-- Order Events: Read-only for all members, insert by system/managers
CREATE POLICY "order_events_select"
ON order_events
FOR SELECT
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "order_events_insert"
ON order_events
FOR INSERT
WITH CHECK (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'manager')
  )
  OR actor_type = 'system'
);
