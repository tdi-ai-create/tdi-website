-- Migration 068: Affiliate Program
-- Adds affiliate tracking tables for creator referral program
-- Date: 2026-05-12

-- =============================================================================
-- 1. Add affiliate_slug to creators
-- =============================================================================

ALTER TABLE creators
  ADD COLUMN IF NOT EXISTS affiliate_slug TEXT UNIQUE;

-- Auto-generate slugs from creator names for existing creators
UPDATE creators
SET affiliate_slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(TRIM(name), '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  )
)
WHERE affiliate_slug IS NULL AND name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_creators_affiliate_slug ON creators(affiliate_slug);

-- =============================================================================
-- 2. Affiliate clicks
-- =============================================================================

CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  affiliate_slug TEXT NOT NULL,
  referrer_url TEXT,
  landing_page TEXT,
  ip_hash TEXT,
  user_agent TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_creator ON affiliate_clicks(creator_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_slug ON affiliate_clicks(affiliate_slug);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_at ON affiliate_clicks(clicked_at DESC);

ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 3. Affiliate signups
-- =============================================================================

CREATE TABLE IF NOT EXISTS affiliate_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  affiliate_slug TEXT NOT NULL,
  user_email TEXT,
  signed_up_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_signups_creator ON affiliate_signups(creator_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_signups_at ON affiliate_signups(signed_up_at DESC);

ALTER TABLE affiliate_signups ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 4. Affiliate conversions
-- =============================================================================

CREATE TABLE IF NOT EXISTS affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  affiliate_slug TEXT NOT NULL,
  user_email TEXT,
  conversion_type TEXT DEFAULT 'subscription',
  gross_amount_cents INTEGER NOT NULL DEFAULT 0,
  processing_fee_cents INTEGER NOT NULL DEFAULT 0,
  net_revenue_cents INTEGER GENERATED ALWAYS AS (gross_amount_cents - processing_fee_cents) STORED,
  creator_payout_cents INTEGER GENERATED ALWAYS AS ((gross_amount_cents - processing_fee_cents) / 2) STORED,
  refunded BOOLEAN DEFAULT FALSE,
  refunded_at TIMESTAMPTZ,
  payout_id UUID,
  paid_to_creator_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_creator ON affiliate_conversions(creator_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_payout ON affiliate_conversions(payout_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_at ON affiliate_conversions(converted_at DESC);

ALTER TABLE affiliate_conversions ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 5. Affiliate payouts (monthly batches)
-- =============================================================================

CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  conversion_count INTEGER NOT NULL DEFAULT 0,
  gross_revenue_cents INTEGER NOT NULL DEFAULT 0,
  net_revenue_cents INTEGER NOT NULL DEFAULT 0,
  payout_amount_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'cancelled')),
  paid_at TIMESTAMPTZ,
  paid_method TEXT,
  paid_reference TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  generated_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_creator ON affiliate_payouts(creator_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_period ON affiliate_payouts(period);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_status ON affiliate_payouts(status);

ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- Add FK from conversions to payouts
ALTER TABLE affiliate_conversions
  ADD CONSTRAINT fk_conversion_payout
  FOREIGN KEY (payout_id) REFERENCES affiliate_payouts(id) ON DELETE SET NULL;
