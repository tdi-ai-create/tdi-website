-- Migration 088: Simple funding opportunities checklist
-- Replaces the complex Plan A/B/C/D JSONB approach with a proper table

CREATE TABLE IF NOT EXISTS funding_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pursuit_id UUID REFERENCES funding_pursuits(id) ON DELETE CASCADE,
  partnership_id UUID REFERENCES partnerships(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  amount NUMERIC,
  status TEXT DEFAULT 'researching' CHECK (status IN ('researching', 'applied', 'waiting', 'awarded', 'denied', 'stalled', 'backup', 'not_started')),
  contact_name TEXT,
  contact_email TEXT,
  last_action TEXT,
  last_action_date DATE,
  next_action TEXT,
  next_action_due DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_funding_opportunities_pursuit ON funding_opportunities(pursuit_id);
CREATE INDEX IF NOT EXISTS idx_funding_opportunities_partnership ON funding_opportunities(partnership_id);

-- Notes per opportunity
CREATE TABLE IF NOT EXISTS funding_opportunity_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES funding_opportunities(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_funding_opp_notes ON funding_opportunity_notes(opportunity_id, created_at DESC);

ALTER TABLE funding_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_opportunity_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "full_access_funding_opportunities" ON funding_opportunities FOR ALL USING (TRUE);
CREATE POLICY "full_access_funding_opp_notes" ON funding_opportunity_notes FOR ALL USING (TRUE);
