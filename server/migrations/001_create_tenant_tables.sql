-- Migration: Create Tenant and User Tables
-- Description: Core tenant isolation tables (businesses, users, business_users)
-- Run this first before any other migrations

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Businesses table
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  business_type TEXT,
  timezone TEXT DEFAULT 'UTC',
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users table (synced with Supabase Auth)
-- Note: Supabase Auth manages the actual user records
-- This table stores additional user metadata if needed
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Business Users join table (membership and roles)
CREATE TABLE business_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'staff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(business_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_business_users_business_id ON business_users(business_id);
CREATE INDEX idx_business_users_user_id ON business_users(user_id);
CREATE INDEX idx_business_users_role ON business_users(role);

-- Comments for documentation
COMMENT ON TABLE businesses IS 'Represents a single business entity (tenant)';
COMMENT ON TABLE users IS 'User metadata synced with Supabase Auth';
COMMENT ON TABLE business_users IS 'Join table for user-business membership and roles';
