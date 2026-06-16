-- Add granted_by column to hub_memberships for audit trail on comped access
-- Additive only — no columns dropped or renamed
-- Created: 2026-06-16

ALTER TABLE hub_memberships
  ADD COLUMN IF NOT EXISTS granted_by text;

COMMENT ON COLUMN hub_memberships.granted_by IS 'Email of the admin who granted comped access. NULL for self-service or Stripe signups.';
