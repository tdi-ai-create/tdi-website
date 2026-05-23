-- ============================================================
-- Migration: Sales CRM Enhancements
-- Adds heat field + pipeline snapshots table for trend analysis
-- ============================================================

-- Heat: engagement temperature (separate from stage)
ALTER TABLE sales_opportunities
  ADD COLUMN IF NOT EXISTS heat TEXT DEFAULT 'warm'
  CHECK (heat IN ('hot', 'warm', 'cold', 'parked'));

CREATE INDEX IF NOT EXISTS idx_sales_opps_heat ON sales_opportunities(heat)
  WHERE stage NOT IN ('lost', 'paid');

-- Backfill heat
UPDATE sales_opportunities
SET heat = 'hot'
WHERE stage IN ('signed', 'proposal_sent', 'likely_yes')
   OR last_activity_at >= NOW() - INTERVAL '7 days';

UPDATE sales_opportunities
SET heat = 'cold'
WHERE last_activity_at < NOW() - INTERVAL '30 days'
  AND last_activity_at >= NOW() - INTERVAL '90 days'
  AND stage NOT IN ('signed', 'proposal_sent', 'likely_yes', 'lost', 'paid');

UPDATE sales_opportunities
SET heat = 'parked'
WHERE (last_activity_at < NOW() - INTERVAL '90 days'
       OR notes ILIKE '%parked%' OR notes ILIKE '%park til%')
  AND stage NOT IN ('signed', 'proposal_sent', 'likely_yes', 'lost', 'paid');

-- Snapshot table for trend analysis
CREATE TABLE IF NOT EXISTS sales_pipeline_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE DEFAULT CURRENT_DATE,
  total_pipeline NUMERIC,
  factored_pipeline NUMERIC,
  active_count INTEGER,
  by_stage JSONB,
  by_source JSONB,
  by_owner JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pipeline_snapshots_date
  ON sales_pipeline_snapshots(snapshot_date DESC);

-- Initial snapshot
INSERT INTO sales_pipeline_snapshots (
  snapshot_date, total_pipeline, factored_pipeline, active_count, by_stage
)
SELECT
  CURRENT_DATE,
  SUM(value) FILTER (WHERE stage NOT IN ('lost', 'paid')),
  SUM(value * COALESCE(probability, 0) / 100.0) FILTER (WHERE stage NOT IN ('lost', 'paid')),
  COUNT(*) FILTER (WHERE stage NOT IN ('lost', 'paid')),
  jsonb_build_object(
    'targeting', COUNT(*) FILTER (WHERE stage = 'targeting'),
    'engaged', COUNT(*) FILTER (WHERE stage = 'engaged'),
    'qualified', COUNT(*) FILTER (WHERE stage = 'qualified'),
    'likely_yes', COUNT(*) FILTER (WHERE stage = 'likely_yes'),
    'proposal_sent', COUNT(*) FILTER (WHERE stage = 'proposal_sent'),
    'signed', COUNT(*) FILTER (WHERE stage = 'signed'),
    'paid', COUNT(*) FILTER (WHERE stage = 'paid'),
    'lost', COUNT(*) FILTER (WHERE stage = 'lost')
  )
FROM sales_opportunities;

-- Verify
SELECT heat, COUNT(*) FROM sales_opportunities WHERE stage NOT IN ('lost', 'paid') GROUP BY heat;
