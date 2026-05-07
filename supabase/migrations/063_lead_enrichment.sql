-- Migration 063: Lead enrichment system
-- Adds AI-powered enrichment, scoring, and strategic briefs to sales pipeline
-- Date: 2026-05-07

-- =============================================================================
-- 1. Add enrichment + contact columns to sales_opportunities
-- =============================================================================

ALTER TABLE sales_opportunities
  ADD COLUMN IF NOT EXISTS contact_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_role TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS state_code TEXT,
  ADD COLUMN IF NOT EXISTS enrichment_status TEXT DEFAULT 'pending'
    CHECK (enrichment_status IN ('pending', 'in_progress', 'complete', 'failed', 'skipped')),
  ADD COLUMN IF NOT EXISTS enrichment_data JSONB,
  ADD COLUMN IF NOT EXISTS ai_strategic_brief TEXT,
  ADD COLUMN IF NOT EXISTS lead_score INTEGER CHECK (lead_score >= 0 AND lead_score <= 100),
  ADD COLUMN IF NOT EXISTS score_breakdown JSONB,
  ADD COLUMN IF NOT EXISTS nces_district_id TEXT,
  ADD COLUMN IF NOT EXISTS enriched_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS enrichment_error TEXT;

-- Mark existing rows as skipped so they don't show enrichment spinners
UPDATE sales_opportunities
SET enrichment_status = 'skipped'
WHERE enrichment_status = 'pending';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sales_opps_lead_score ON sales_opportunities(lead_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_sales_opps_enrichment_status ON sales_opportunities(enrichment_status);
CREATE INDEX IF NOT EXISTS idx_sales_opps_state ON sales_opportunities(state_code);

-- =============================================================================
-- 2. Lead enrichment jobs table (audit trail + debugging)
-- =============================================================================

CREATE TABLE IF NOT EXISTS lead_enrichment_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES sales_opportunities(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'in_progress', 'complete', 'failed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  raw_response JSONB,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enrichment_jobs_lead ON lead_enrichment_jobs(lead_id);
CREATE INDEX IF NOT EXISTS idx_enrichment_jobs_status ON lead_enrichment_jobs(status);
CREATE INDEX IF NOT EXISTS idx_enrichment_jobs_created ON lead_enrichment_jobs(created_at DESC);

-- =============================================================================
-- 3. RLS policies
-- =============================================================================

ALTER TABLE lead_enrichment_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users full access on enrichment jobs"
  ON lead_enrichment_jobs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid()
    )
  );

-- =============================================================================
-- 4. Helper function: reset enrichment for retry
-- =============================================================================

CREATE OR REPLACE FUNCTION reset_lead_enrichment(target_lead_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE sales_opportunities
  SET enrichment_status = 'pending',
      enrichment_error = NULL
  WHERE id = target_lead_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION reset_lead_enrichment IS
  'Resets a lead enrichment to pending so it can be retried. Call from API route.';
