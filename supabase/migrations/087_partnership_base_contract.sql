-- Migration 087: Base contract fields for two-tier contract display
-- When a school has grant support, the partnership shows two tiers:
-- 1. Base contract (guaranteed, what they pay for without grants)
-- 2. Full contract (what they get if grants are awarded)

ALTER TABLE partnerships
ADD COLUMN IF NOT EXISTS base_observation_days INTEGER,
ADD COLUMN IF NOT EXISTS base_virtual_sessions INTEGER,
ADD COLUMN IF NOT EXISTS base_executive_sessions INTEGER,
ADD COLUMN IF NOT EXISTS base_staff_enrolled INTEGER,
ADD COLUMN IF NOT EXISTS has_grant_support BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN partnerships.base_observation_days IS 'Guaranteed observation days without grant funding. If null, no separate base tier.';
COMMENT ON COLUMN partnerships.has_grant_support IS 'True if TDI is pursuing grant funding to expand this contract.';
