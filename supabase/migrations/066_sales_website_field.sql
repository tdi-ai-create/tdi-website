-- Add website field to sales_opportunities
ALTER TABLE sales_opportunities
  ADD COLUMN IF NOT EXISTS website TEXT;
