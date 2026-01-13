-- Migration: Add notes column to vendors table
-- Description: Adds optional notes field for vendor-specific information

ALTER TABLE vendors ADD COLUMN IF NOT EXISTS notes TEXT;

COMMENT ON COLUMN vendors.notes IS 'Optional notes or additional information about the vendor';
