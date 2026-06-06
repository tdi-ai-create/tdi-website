-- Add grant_support flag to sales_opportunities
-- When stage = 'signed', this distinguishes between:
--   false (default) = "Signed (w/o Grant Support)" - money is ensured
--   true = "Signed (w/ Grant Support)" - funding team still working on it
ALTER TABLE sales_opportunities
ADD COLUMN IF NOT EXISTS grant_support boolean DEFAULT false;
