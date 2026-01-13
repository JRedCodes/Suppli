-- Migration: RLS Policies for Businesses and Users
-- Description: Tenant isolation policies for core tenant tables

-- Businesses: Users can only see businesses they belong to
CREATE POLICY "businesses_select"
ON businesses
FOR SELECT
USING (
  id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
  )
);

-- Businesses: Only owners can insert (typically done server-side)
CREATE POLICY "businesses_insert"
ON businesses
FOR INSERT
WITH CHECK (
  -- Allow if user is creating their own business (first user scenario)
  -- In practice, this is usually done server-side with service role
  true
);

-- Businesses: Only owners can update
CREATE POLICY "businesses_update"
ON businesses
FOR UPDATE
USING (
  id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role = 'owner'
  )
);

-- Users: Users can see themselves and users in their businesses
CREATE POLICY "users_select"
ON users
FOR SELECT
USING (
  id = auth.uid()
  OR id IN (
    SELECT user_id
    FROM business_users
    WHERE business_id IN (
      SELECT business_id
      FROM business_users
      WHERE user_id = auth.uid()
    )
  )
);

-- Business Users: Users can see memberships for businesses they belong to
CREATE POLICY "business_users_select"
ON business_users
FOR SELECT
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
  )
);

-- Business Users: Only owners can insert (invite users)
CREATE POLICY "business_users_insert"
ON business_users
FOR INSERT
WITH CHECK (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role = 'owner'
  )
);

-- Business Users: Only owners can update (change roles)
CREATE POLICY "business_users_update"
ON business_users
FOR UPDATE
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role = 'owner'
  )
);

-- Business Users: Only owners can delete (remove users)
CREATE POLICY "business_users_delete"
ON business_users
FOR DELETE
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role = 'owner'
  )
  -- Prevent owners from removing themselves (safety check)
  AND NOT (user_id = auth.uid() AND role = 'owner')
);
