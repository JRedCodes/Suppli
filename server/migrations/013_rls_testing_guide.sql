-- Migration: RLS Testing Guide (Not a migration - documentation)
-- Description: SQL queries to test RLS policies

-- ============================================
-- RLS TESTING GUIDE
-- ============================================
-- This file contains test queries to verify RLS is working correctly
-- DO NOT RUN THIS AS A MIGRATION
-- Use these queries manually to test RLS policies
-- ============================================

-- Test 1: Create test businesses and users
-- (Run these with service role or as admin)

/*
-- Create test business 1
INSERT INTO businesses (id, name, business_type) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Test Business 1', 'retail');

-- Create test business 2
INSERT INTO businesses (id, name, business_type) 
VALUES ('00000000-0000-0000-0000-000000000002', 'Test Business 2', 'retail');

-- Create test user 1 (use real auth.uid() from Supabase Auth)
-- INSERT INTO users (id, email) VALUES ('user-1-uuid', 'user1@test.com');
-- INSERT INTO business_users (business_id, user_id, role) 
-- VALUES ('00000000-0000-0000-0000-000000000001', 'user-1-uuid', 'owner');

-- Create test user 2
-- INSERT INTO users (id, email) VALUES ('user-2-uuid', 'user2@test.com');
-- INSERT INTO business_users (business_id, user_id, role) 
-- VALUES ('00000000-0000-0000-0000-000000000002', 'user-2-uuid', 'owner');
*/

-- Test 2: Verify cross-tenant isolation
-- (Run as user 1 - should only see business 1 data)

/*
-- As user 1, try to see business 2 (should return 0 rows)
SELECT * FROM businesses WHERE id = '00000000-0000-0000-0000-000000000002';

-- As user 1, try to insert into business 2 (should fail)
-- INSERT INTO vendors (business_id, name, ordering_method) 
-- VALUES ('00000000-0000-0000-0000-000000000002', 'Hacker Vendor', 'email');
*/

-- Test 3: Verify role-based access
-- (Test that staff cannot create vendors)

/*
-- As staff user, try to create vendor (should fail)
-- INSERT INTO vendors (business_id, name, ordering_method) 
-- VALUES ('business-id', 'Test Vendor', 'email');
*/

-- Test 4: Verify business_users policies
-- (Test that users can only see memberships for their businesses)

/*
-- As user 1, should only see business_users for business 1
SELECT * FROM business_users;
*/

-- ============================================
-- EXPECTED RESULTS
-- ============================================
-- ✅ Users can only see data from businesses they belong to
-- ✅ Users cannot insert/update/delete data for other businesses
-- ✅ Staff cannot perform manager/owner actions
-- ✅ Owners can manage business_users
-- ✅ Cross-tenant queries return 0 rows
-- ============================================
