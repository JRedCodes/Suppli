# Suppli — RLS Testing Guide

## Overview
This document describes how to test Row Level Security (RLS) policies to ensure tenant isolation is working correctly.

## Prerequisites
- All migrations applied (001-012)
- RLS enabled on all tables
- Test users created in Supabase Auth

## Testing Strategy

### Test 1: Cross-Tenant Isolation

**Goal**: Verify users cannot access data from other businesses.

**Steps**:
1. Create two test businesses
2. Create two test users (one per business)
3. As User 1, try to query Business 2's data
4. Verify: Should return 0 rows

**Test Queries**:
```sql
-- As User 1, try to see Business 2 (should fail)
SELECT * FROM businesses WHERE id = '<business-2-id>';

-- As User 1, try to see Business 2's vendors (should return 0 rows)
SELECT * FROM vendors WHERE business_id = '<business-2-id>';

-- As User 1, try to insert into Business 2 (should fail)
INSERT INTO vendors (business_id, name, ordering_method) 
VALUES ('<business-2-id>', 'Hacker Vendor', 'email');
```

### Test 2: Role-Based Access

**Goal**: Verify role restrictions work correctly.

**Steps**:
1. Create a staff user
2. As staff, try to create a vendor
3. Verify: Should fail with permission error

**Test Queries**:
```sql
-- As staff user, try to create vendor (should fail)
INSERT INTO vendors (business_id, name, ordering_method) 
VALUES ('<business-id>', 'Test Vendor', 'email');
-- Expected: Permission denied or 0 rows affected
```

### Test 3: Business Membership

**Goal**: Verify users can only see businesses they belong to.

**Steps**:
1. As User 1, query all businesses
2. Verify: Should only see businesses where user is a member

**Test Queries**:
```sql
-- As User 1, should only see businesses they belong to
SELECT * FROM businesses;

-- Should only see business_users for their businesses
SELECT * FROM business_users;
```

### Test 4: Owner Privileges

**Goal**: Verify owners can manage business_users.

**Steps**:
1. As owner, try to invite a user
2. As owner, try to change a user's role
3. Verify: Should succeed

**Test Queries**:
```sql
-- As owner, invite user (should succeed)
INSERT INTO business_users (business_id, user_id, role) 
VALUES ('<business-id>', '<user-id>', 'manager');

-- As owner, update role (should succeed)
UPDATE business_users 
SET role = 'staff' 
WHERE business_id = '<business-id>' AND user_id = '<user-id>';
```

## Manual Testing Checklist

- [ ] User can only see their own businesses
- [ ] User cannot query other business's data
- [ ] User cannot insert into other business's tables
- [ ] Staff cannot create vendors/products
- [ ] Manager can create vendors/products
- [ ] Owner can manage business_users
- [ ] Owner cannot remove themselves
- [ ] Cross-tenant queries return 0 rows

## Automated Testing (Future)

Consider creating automated tests that:
- Create test businesses and users
- Verify RLS policies programmatically
- Run as part of CI/CD pipeline

## Troubleshooting

### RLS Not Working
- Verify RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`
- Check policies exist: `SELECT * FROM pg_policies WHERE tablename = '<table>';`
- Verify user is authenticated: `SELECT auth.uid();`

### Policies Too Restrictive
- Check business_users membership
- Verify role assignments
- Test with service role (bypasses RLS) to isolate issue

## Security Notes

- **Never disable RLS in production**
- **Always test RLS after schema changes**
- **Service role should only be used server-side**
- **RLS is the final security layer**
