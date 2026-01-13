# Suppli Database Migrations

## Overview
This directory contains SQL migration files for creating and updating the Suppli database schema.

## Migration Order
Migrations must be run in order:

1. `001_create_tenant_tables.sql` - Core tenant isolation (businesses, users, business_users)
2. `002_create_vendor_product_tables.sql` - Vendors and products
3. `003_create_orders_tables.sql` - Orders domain (orders, vendor_orders, order_lines, order_events)
4. `004_create_sales_promotions_tables.sql` - Sales data and promotions
5. `005_create_invoices_tables.sql` - Invoice verification
6. `006_create_files_learning_tables.sql` - Files and learning adjustments

## Running Migrations

### Option 1: Supabase SQL Editor (Recommended for MVP)
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run each migration file in order
4. Verify tables were created successfully

### Option 2: Supabase CLI (Future)
```bash
supabase migration up
```

## Verification

After running migrations, verify:
- All tables exist
- Foreign keys are properly set up
- Indexes are created
- Constraints are in place

## Rollback

For MVP, rollbacks should be done manually if needed. In production, consider:
- Creating reverse migration scripts
- Using Supabase migration tools
- Database backups before migrations

## Notes

- All tables include `business_id` for tenant isolation
- All tables have `created_at` timestamps
- Foreign keys use `ON DELETE CASCADE` for data integrity
- Indexes are created for common query patterns
- Check constraints enforce data validity
