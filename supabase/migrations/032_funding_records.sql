-- ============================================================
-- Migration 032: Funding Records
-- Grant tracking for TDI district funding assistance
-- ============================================================

CREATE TABLE IF NOT EXISTS funding_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_name TEXT NOT NULL,
  district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
  funding_source_type TEXT CHECK (funding_source_type IN (
    'title_ii_a', 'title_i', 'esser_arp', 'state_grant',
    'foundation_grant', 'general_pd_budget', 'corporate',
    'community', 'diocesan', 'other'
  )) NOT NULL,
  funding_source_name TEXT,
  amount_pursued NUMERIC(10,2),
  application_deadline DATE,
  status TEXT CHECK (status IN (
    'researching', 'writing', 'submitted', 'awarded', 'denied', 'on_hold'
  )) DEFAULT 'researching',
  grant_writer TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_funding_records_district ON funding_records(district_id);
CREATE INDEX IF NOT EXISTS idx_funding_records_status ON funding_records(status);
CREATE INDEX IF NOT EXISTS idx_funding_records_deadline ON funding_records(application_deadline);

ALTER TABLE funding_records ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (internal admin tool)
CREATE POLICY "Allow authenticated users full access to funding_records"
ON funding_records FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access to funding_records"
ON funding_records FOR ALL TO service_role
USING (true) WITH CHECK (true);
