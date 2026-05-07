ALTER TABLE sales_opportunities
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT;

CREATE INDEX IF NOT EXISTS idx_sales_opportunities_state
  ON sales_opportunities(state)
  WHERE state IS NOT NULL;
