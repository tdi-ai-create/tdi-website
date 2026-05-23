-- ============================================================
-- Migration: Sales Soft Delete
-- Adds soft delete + merge tracking columns
-- ============================================================

ALTER TABLE sales_opportunities
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS merged_into_id UUID,
  ADD COLUMN IF NOT EXISTS deleted_by TEXT,
  ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_sales_opportunities_deleted_at
  ON sales_opportunities(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_sales_opportunities_merged_into
  ON sales_opportunities(merged_into_id) WHERE merged_into_id IS NOT NULL;
