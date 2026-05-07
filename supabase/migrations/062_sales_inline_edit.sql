-- Sales inline edit: audit log + expected_close_date

CREATE TABLE IF NOT EXISTS sales_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  edited_by TEXT NOT NULL DEFAULT 'admin',
  edited_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_audit_log_opp
  ON sales_audit_log(opportunity_id, edited_at DESC);

-- Add expected_close_date if not exists
ALTER TABLE sales_opportunities
  ADD COLUMN IF NOT EXISTS expected_close_date DATE;
