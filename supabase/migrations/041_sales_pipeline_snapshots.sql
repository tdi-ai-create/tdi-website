-- Sales Pipeline Snapshots for trend analysis
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
