-- RW Sales Team Anonymous Survey responses
-- Run this SQL in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS rw_sales_surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),

  -- Section 1: Overall State
  overall_stress_level INTEGER NOT NULL,           -- 1-10
  energy_level INTEGER NOT NULL,                   -- 1-5
  confidence_level INTEGER NOT NULL,               -- 1-10
  team_morale INTEGER NOT NULL,                    -- 1-5
  supported_by_leadership INTEGER NOT NULL,        -- 1-5

  -- Section 2: Time & Workload
  hours_worked_per_week TEXT NOT NULL,             -- dropdown bucket
  hours_feel_sustainable TEXT NOT NULL,            -- Yes / No / Sometimes
  time_biggest_drain TEXT NOT NULL,                -- open text

  -- Section 3: Pipeline Honesty
  pipeline_confidence INTEGER NOT NULL,            -- 1-10
  last_month_reflection TEXT NOT NULL,             -- open text
  biggest_win_last_month TEXT NOT NULL,            -- open text
  biggest_challenge_last_month TEXT NOT NULL,      -- open text
  lead_or_deal_on_mind TEXT NOT NULL,              -- open text

  -- Section 4: Obstacles & Sticking Points
  most_common_objection TEXT NOT NULL,             -- open text
  part_of_process_feels_hard TEXT NOT NULL,        -- open text
  something_being_avoided TEXT NOT NULL,           -- open text
  tools_and_resources_adequate TEXT NOT NULL,      -- Yes / No / Partially
  tools_missing TEXT,                              -- open text (optional follow-up)

  -- Section 5: Feelings About the Work
  part_that_energizes TEXT NOT NULL,               -- open text
  part_that_drains TEXT NOT NULL,                  -- open text
  product_knowledge_confidence INTEGER NOT NULL,   -- 1-5
  product_knowledge_gaps TEXT NOT NULL,            -- open text

  -- Section 6: Looking Ahead (Next 4 Weeks)
  top_priority_next_4_weeks TEXT NOT NULL,         -- open text
  what_success_looks_like TEXT NOT NULL,           -- open text
  one_thing_to_do_differently TEXT NOT NULL,       -- open text
  support_needed TEXT NOT NULL,                    -- open text

  -- Section 7: Leadership & Culture
  leadership_feedback TEXT NOT NULL,               -- open text
  team_dynamic_feedback TEXT NOT NULL,             -- open text
  safe_to_say TEXT NOT NULL,                       -- open text
  anything_else TEXT                               -- open text (optional)
);

-- Disable RLS for anonymous submission
ALTER TABLE rw_sales_surveys DISABLE ROW LEVEL SECURITY;

-- Grant insert access
GRANT INSERT ON rw_sales_surveys TO anon;
GRANT INSERT ON rw_sales_surveys TO authenticated;
