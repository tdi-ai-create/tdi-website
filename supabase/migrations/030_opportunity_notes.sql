-- ============================================================
-- Migration 030: Opportunity Notes
-- Local notes layer on GHL opportunities
-- Survives GHL cancellation - stored in our own database
-- ============================================================

CREATE TABLE IF NOT EXISTS opportunity_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ghl_opportunity_id TEXT NOT NULL,
  ghl_opportunity_name TEXT,
  note TEXT NOT NULL,
  next_action_date DATE,
  needs_attention BOOLEAN DEFAULT FALSE,
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opportunity_notes_ghl_id ON opportunity_notes(ghl_opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_notes_next_action ON opportunity_notes(next_action_date);
CREATE INDEX IF NOT EXISTS idx_opportunity_notes_attention ON opportunity_notes(needs_attention);

CREATE TRIGGER trg_opportunity_notes_updated BEFORE UPDATE ON opportunity_notes
  FOR EACH ROW EXECUTE FUNCTION update_intelligence_updated_at();

ALTER TABLE opportunity_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access_opportunity_notes" ON opportunity_notes
  FOR ALL USING (auth.email() IN (SELECT email FROM admin_users));
