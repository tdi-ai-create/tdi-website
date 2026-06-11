-- Lead Fit Scoring: 6-factor manual assessment model
-- Complements the existing AI enrichment scores (migration 063)

ALTER TABLE sales_opportunities
  ADD COLUMN IF NOT EXISTS fit_district_size INTEGER CHECK (fit_district_size >= 1 AND fit_district_size <= 10),
  ADD COLUMN IF NOT EXISTS fit_turnover_signal INTEGER CHECK (fit_turnover_signal >= 1 AND fit_turnover_signal <= 10),
  ADD COLUMN IF NOT EXISTS fit_pd_investment INTEGER CHECK (fit_pd_investment >= 1 AND fit_pd_investment <= 10),
  ADD COLUMN IF NOT EXISTS fit_budget_timing INTEGER CHECK (fit_budget_timing >= 1 AND fit_budget_timing <= 10),
  ADD COLUMN IF NOT EXISTS fit_leadership_stability INTEGER CHECK (fit_leadership_stability >= 1 AND fit_leadership_stability <= 10),
  ADD COLUMN IF NOT EXISTS fit_tdi_alignment INTEGER CHECK (fit_tdi_alignment >= 1 AND fit_tdi_alignment <= 10),
  ADD COLUMN IF NOT EXISTS fit_composite_score INTEGER,
  ADD COLUMN IF NOT EXISTS fit_tier TEXT CHECK (fit_tier IN ('tier_1', 'tier_2', 'tier_3'));
