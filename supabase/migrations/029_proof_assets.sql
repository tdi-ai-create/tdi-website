-- ============================================================
-- Migration 029: Proof Assets
-- Intelligence Hub Phase 6
-- ============================================================

CREATE TABLE IF NOT EXISTS proof_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  asset_type TEXT CHECK (asset_type IN (
    'case_study', 'testimonial', 'dashboard_screenshot',
    'before_after', 'grant_letter', 'love_notes',
    'impact_quote', 'board_deck', 'renewal_letter',
    'media_mention', 'other'
  )) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  quote_text TEXT,
  quote_attribution TEXT,
  stat_before TEXT,
  stat_after TEXT,
  stat_label TEXT,
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proof_assets_district ON proof_assets(district_id);
CREATE INDEX IF NOT EXISTS idx_proof_assets_type ON proof_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_proof_assets_featured ON proof_assets(is_featured);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_proof_assets_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_proof_assets_updated
  BEFORE UPDATE ON proof_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_proof_assets_timestamp();

ALTER TABLE proof_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access_proof_assets" ON proof_assets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- ============================================================
-- Comments for documentation
-- ============================================================
COMMENT ON TABLE proof_assets IS 'Proof assets for district partnerships - testimonials, case studies, before/after data, etc.';
COMMENT ON COLUMN proof_assets.asset_type IS 'Type of proof asset: case_study, testimonial, dashboard_screenshot, before_after, grant_letter, love_notes, impact_quote, board_deck, renewal_letter, media_mention, other';
COMMENT ON COLUMN proof_assets.quote_text IS 'Full quote text for testimonials and impact quotes';
COMMENT ON COLUMN proof_assets.quote_attribution IS 'Attribution for quotes (e.g., Principal Name, Title - School)';
COMMENT ON COLUMN proof_assets.stat_before IS 'Before value for before/after comparisons';
COMMENT ON COLUMN proof_assets.stat_after IS 'After value for before/after comparisons';
COMMENT ON COLUMN proof_assets.stat_label IS 'Label for the metric being compared (e.g., Stress Score)';
COMMENT ON COLUMN proof_assets.is_featured IS 'Featured assets appear first in lists';
