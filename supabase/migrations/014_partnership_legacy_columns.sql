-- Migration 014: Add legacy dashboard URL and additional partnership columns
-- For CCP: SEED ACTIVE PARTNERSHIPS INTO LEAD DASHBOARD
-- March 2026

-- Add legacy dashboard URL column
ALTER TABLE partnerships
ADD COLUMN IF NOT EXISTS legacy_dashboard_url TEXT;

-- Add anchor/contract URL column
ALTER TABLE partnerships
ADD COLUMN IF NOT EXISTS contract_url TEXT;

-- Add primary contact email for principal login
ALTER TABLE partnerships
ADD COLUMN IF NOT EXISTS primary_contact_email TEXT;

-- Add primary contact name
ALTER TABLE partnerships
ADD COLUMN IF NOT EXISTS primary_contact_name TEXT;

-- Add school/district address
ALTER TABLE partnerships
ADD COLUMN IF NOT EXISTS address TEXT;

-- Add website
ALTER TABLE partnerships
ADD COLUMN IF NOT EXISTS website TEXT;

-- Add comment for documentation
COMMENT ON COLUMN partnerships.legacy_dashboard_url IS 'URL path to existing hardcoded legacy dashboard (e.g., /Allenwood-Dashboard)';
COMMENT ON COLUMN partnerships.contract_url IS 'URL to contract/agreement document';
COMMENT ON COLUMN partnerships.primary_contact_email IS 'Primary contact email for principal login';
COMMENT ON COLUMN partnerships.primary_contact_name IS 'Primary contact name';
COMMENT ON COLUMN partnerships.address IS 'School or district address';
COMMENT ON COLUMN partnerships.website IS 'School or district website';
