-- ============================================================
-- Migration: Sales Invoice Tracking
-- Adds invoice tracking columns for AR management
-- ============================================================

ALTER TABLE sales_opportunities
  ADD COLUMN IF NOT EXISTS needs_invoice BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS invoice_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS invoice_notes TEXT,
  ADD COLUMN IF NOT EXISTS contract_year TEXT;

CREATE INDEX IF NOT EXISTS idx_sales_opp_needs_invoice
  ON sales_opportunities(needs_invoice) WHERE needs_invoice = TRUE;
