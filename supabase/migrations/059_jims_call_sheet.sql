-- ============================================================
-- Migration: Jim's Call Sheet System
-- Replaces assigned_to model with toggleable call sheet flag
-- ============================================================

ALTER TABLE sales_opportunities
  ADD COLUMN IF NOT EXISTS on_jims_call_sheet BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_sales_opportunities_call_sheet
  ON sales_opportunities(on_jims_call_sheet) WHERE on_jims_call_sheet = TRUE;
