# Suppli — Database Migrations Guide

## Overview
This document describes how to apply database migrations to set up the Suppli database schema.

## Prerequisites
- Supabase project created
- Access to Supabase SQL Editor
- Database credentials configured

## Migration Files

All migration files are in `server/migrations/`:

1. **001_create_tenant_tables.sql** - Core tenant model
2. **002_create_vendor_product_tables.sql** - Vendors and products
3. **003_create_orders_tables.sql** - Orders domain
4. **004_create_sales_promotions_tables.sql** - Sales and promotions
5. **005_create_invoices_tables.sql** - Invoice verification
6. **006_create_files_learning_tables.sql** - Files and learning

## Applying Migrations

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"

### Step 2: Run Migrations in Order
1. Open `server/migrations/001_create_tenant_tables.sql`
2. Copy the entire contents
3. Paste into SQL Editor
4. Click "Run" (or press Cmd/Ctrl + Enter)
5. Verify success message
6. Repeat for each migration file in order

### Step 3: Verify Tables
After running all migrations:
1. Go to "Table Editor" in Supabase dashboard
2. Verify all tables are listed:
   - businesses
   - users
   - business_users
   - vendors
   - products
   - vendor_products
   - orders
   - vendor_orders
   - order_lines
   - order_events
   - sales_events
   - promotions
   - promotion_products
   - invoices
   - invoice_lines
   - invoice_mismatches
   - files
   - learning_adjustments

## Troubleshooting

### Error: "relation already exists"
- Table was already created
- Skip that migration or drop the table first (if safe)

### Error: "foreign key constraint"
- Previous migration not run
- Run migrations in order

### Error: "permission denied"
- Check you're using the correct database user
- Verify Supabase project access

## Next Steps

After migrations are applied:
1. Proceed to Phase 2.3: Row Level Security (RLS) Policies
2. RLS must be enabled before any data is inserted

## Important Notes

- **Never run migrations on production without backup**
- **Test migrations in development first**
- **Keep migration files in version control**
- **Document any manual changes**
