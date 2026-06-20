-- TEA-4840 Phase 1B step 1/3 -- hub_district_config
-- Decision: TEA-4837 (Rodrigo Option B), approved by Rae.
-- Keyed on free-text hub_profiles.district_id; no FK (no hub_districts entity yet).

CREATE TABLE IF NOT EXISTS hub_district_config (
  district_id            TEXT PRIMARY KEY,           -- matches hub_profiles.district_id; no FK yet
  school_year_start_date DATE NOT NULL,
  school_year_end_date   DATE NOT NULL,
  CHECK (school_year_end_date > school_year_start_date),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by             UUID REFERENCES auth.users(id),
  updated_by             UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_hub_district_config_district ON hub_district_config(district_id);

ALTER TABLE hub_district_config ENABLE ROW LEVEL SECURITY;

-- SELECT: any authenticated profile whose district_id matches
CREATE POLICY hub_district_config_select_same_district ON hub_district_config
  FOR SELECT TO authenticated
  USING (district_id = (SELECT district_id FROM hub_profiles WHERE id = auth.uid()));

-- INSERT/UPDATE/DELETE: admin role only, scoped to caller's district
CREATE POLICY hub_district_config_write_admin ON hub_district_config
  FOR ALL TO authenticated
  USING (district_id = (SELECT district_id FROM hub_profiles WHERE id = auth.uid())
         AND (SELECT role FROM hub_profiles WHERE id = auth.uid()) IN ('district_admin','school_admin'))
  WITH CHECK (district_id = (SELECT district_id FROM hub_profiles WHERE id = auth.uid()));

NOTIFY pgrst, 'reload schema';
