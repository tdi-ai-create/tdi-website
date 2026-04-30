-- Migration: Course proposal intake form
-- Purpose: Stores new course proposals run through the 6-filter decision system.
-- Source: TEA-2380 Course Creation Assignment Framework (Step 5: intake form)

CREATE TABLE hub_course_proposals (
  id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title                       TEXT        NOT NULL,
  description                 TEXT,
  category                    TEXT,
  target_audience             TEXT,
  filter_brand_voice          BOOLEAN     NOT NULL DEFAULT false,
  filter_structural           BOOLEAN     NOT NULL DEFAULT false,
  filter_expertise_external   BOOLEAN     NOT NULL DEFAULT false,
  filter_speed_urgent         BOOLEAN     NOT NULL DEFAULT false,
  filter_scale_repeatable     BOOLEAN     NOT NULL DEFAULT true,
  filter_cost_above_threshold BOOLEAN     NOT NULL DEFAULT false,
  recommendation              TEXT        NOT NULL CHECK (recommendation IN ('internal', 'external_creator', 'mixed')),
  recommendation_reason       TEXT,
  status                      TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hub_course_proposals_status ON hub_course_proposals (status);
CREATE INDEX idx_hub_course_proposals_recommendation ON hub_course_proposals (recommendation);

ALTER TABLE hub_course_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on hub_course_proposals"
  ON hub_course_proposals
  FOR ALL
  USING (true)
  WITH CHECK (true);
