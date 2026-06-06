-- Migration 085: Partnership KPIs and goal setting
-- Principals pick 3-5 KPIs from a curated menu. Each has benchmarks,
-- targets, and a "how TDI delivers" explanation tied to contract deliverables.

CREATE TABLE IF NOT EXISTS partnership_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
  kpi_key TEXT NOT NULL,
  kpi_label TEXT NOT NULL,
  target_value DECIMAL,
  target_unit TEXT,
  target_date DATE,
  current_value DECIMAL,
  benchmark_low DECIMAL,
  benchmark_high DECIMAL,
  benchmark_label TEXT,
  data_source TEXT,
  how_tdi_delivers TEXT,
  sort_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'at_risk', 'paused')),
  achieved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partnership_kpis_partnership
ON partnership_kpis(partnership_id, status);

-- Educator-level goals (set by individual teachers or mandated by district)
CREATE TABLE IF NOT EXISTS educator_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
  educator_email TEXT,
  goal_text TEXT NOT NULL,
  goal_type TEXT DEFAULT 'personal' CHECK (goal_type IN ('personal', 'mandated')),
  target_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_educator_goals_partnership
ON educator_goals(partnership_id);

ALTER TABLE partnership_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE educator_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "TDI admin full access partnership_kpis" ON partnership_kpis FOR ALL USING (TRUE);
CREATE POLICY "TDI admin full access educator_goals" ON educator_goals FOR ALL USING (TRUE);
