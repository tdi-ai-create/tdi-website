-- Migration 083: Add onboarding-related columns to action_items
-- For deal-to-partnership automation and Phase 0 onboarding flow

-- Visibility flag: controls whether principals see this item on their dashboard
ALTER TABLE action_items
ADD COLUMN IF NOT EXISTS visible_to_partner BOOLEAN DEFAULT TRUE;

-- CTA fields: action button text and URL for partner-facing items
ALTER TABLE action_items
ADD COLUMN IF NOT EXISTS cta_label TEXT;
ALTER TABLE action_items
ADD COLUMN IF NOT EXISTS cta_url TEXT;

-- Track who completed the item
ALTER TABLE action_items
ADD COLUMN IF NOT EXISTS completed_by TEXT;

-- Resurface paused items automatically
ALTER TABLE action_items
ADD COLUMN IF NOT EXISTS resurface_at TIMESTAMPTZ;

-- Link action items to the onboarding phase
COMMENT ON COLUMN action_items.visible_to_partner IS 'If false, only TDI admin sees this item. If true, shows on partner dashboard.';
COMMENT ON COLUMN action_items.cta_label IS 'Button text for call-to-action (e.g. Schedule via Calendly)';
COMMENT ON COLUMN action_items.cta_url IS 'URL for call-to-action button';
COMMENT ON COLUMN action_items.completed_by IS 'Email or name of person who completed the item';
COMMENT ON COLUMN action_items.resurface_at IS 'When a paused item should automatically return to pending';

-- Add sales_deal_id to partnerships for linking
ALTER TABLE partnerships
ADD COLUMN IF NOT EXISTS sales_deal_id TEXT;

COMMENT ON COLUMN partnerships.sales_deal_id IS 'ID of the sales_opportunities record that created this partnership';

-- Index for filtering partner-visible items
CREATE INDEX IF NOT EXISTS idx_action_items_partner_visible
ON action_items(partnership_id, visible_to_partner)
WHERE visible_to_partner = TRUE;
