-- ============================================================
-- CCP E: SEED REAL DATA FOR ALL 7 ACTIVE PARTNER SCHOOLS
-- Run in Supabase SQL Editor
-- Source: Legacy dashboard files (wego, stpchanel, allenwood, etc.)
-- ============================================================

-- ============================================================
-- WEGO DISTRICT 94
-- Source: app/wego-dashboard/page.tsx
-- ============================================================
UPDATE partnerships SET
  staff_enrolled               = 19,
  hub_login_pct                = 89,
  love_notes_count             = 21,
  high_engagement_pct          = 62.5,
  cost_per_educator            = 842,
  observation_days_used        = 3,
  observation_days_total       = 4,
  virtual_sessions_used        = 2,
  virtual_sessions_total       = 6,
  executive_sessions_used      = 0,
  executive_sessions_total     = 4,
  momentum_status              = 'Strong',
  momentum_detail              = '100% Hub login rate - all 19 PAs activated. 3 observation days + 3 on-site coachings complete. 21 personalized Love Notes delivered. Year 1 Celebration + Year 2 Planning to schedule.',
  contract_phase               = 'IGNITE',
  contract_start               = '2025-07-31',
  contract_end                 = '2026-05-30',
  data_updated_at              = '2026-02-25'
WHERE slug = 'wego-district-94';

-- ============================================================
-- ST. PETER CHANEL
-- Source: app/stpchanel-dashboard/page.tsx
-- ============================================================
UPDATE partnerships SET
  staff_enrolled               = 25,
  hub_login_pct                = 100,
  love_notes_count             = 25,
  high_engagement_pct          = 21,
  cost_per_educator            = 446,
  observation_days_used        = 2,
  observation_days_total       = 2,
  virtual_sessions_used        = 0,
  virtual_sessions_total       = 2,
  executive_sessions_used      = 0,
  executive_sessions_total     = 0,
  momentum_status              = 'Building',
  momentum_detail              = 'Hub engagement at 100% - all contracted staff active. Retention intent 9.8/10 - nearly every teacher returning. 2 Growth Group virtual sessions pending. Strategy implementation at 21% - 2x the 10% industry average.',
  contract_phase               = 'ACCELERATE',
  contract_start               = '2025-09-01',
  contract_end                 = '2026-06-30',
  data_updated_at              = now()
WHERE slug = 'st-peter-chanel';

-- ============================================================
-- ALLENWOOD ELEMENTARY
-- Source: app/Allenwood-Dashboard/page.tsx
-- ============================================================
UPDATE partnerships SET
  staff_enrolled               = 13,
  hub_login_pct                = 100,
  love_notes_count             = 21,
  high_engagement_pct          = NULL,
  cost_per_educator            = 592,
  observation_days_used        = 2,
  observation_days_total       = 2,
  virtual_sessions_used        = 2,
  virtual_sessions_total       = 6,
  executive_sessions_used      = 0,
  executive_sessions_total     = 0,
  momentum_status              = 'Strong',
  momentum_detail              = '2 observations + 2 virtual sessions complete. 21 Love Notes delivered across 2 observation days. 4 virtual sessions already scheduled through April.',
  contract_phase               = 'IGNITE',
  contract_start               = '2025-09-01',
  contract_end                 = '2026-04-30',
  data_updated_at              = now()
WHERE slug = 'allenwood-elementary';

-- ============================================================
-- ADDISON SCHOOL DISTRICT 4
-- Source: app/asd4-dashboard/page.tsx
-- ============================================================
UPDATE partnerships SET
  staff_enrolled               = 122,
  hub_login_pct                = 100,
  love_notes_count             = 18,
  high_engagement_pct          = 70,
  cost_per_educator            = 299,
  observation_days_used        = 1,
  observation_days_total       = 2,
  virtual_sessions_used        = 1,
  virtual_sessions_total       = 4,
  executive_sessions_used      = 0,
  executive_sessions_total     = 0,
  momentum_status              = 'Strong',
  momentum_detail              = 'All 122 paras activated. Observation Day 1 complete - 17 classrooms visited, 18 Love Notes delivered, 10 para replies. 70% demonstrated Collaborative Support strategies. Observation Day 2 scheduled March 19.',
  contract_phase               = 'IGNITE',
  contract_start               = '2025-10-01',
  contract_end                 = '2026-05-31',
  data_updated_at              = now()
WHERE slug = 'addison-school-district-4';

-- ============================================================
-- SAUNEMIN CCSD #438
-- Source: app/saunemin-dashboard/page.tsx
-- ============================================================
UPDATE partnerships SET
  staff_enrolled               = 12,
  hub_login_pct                = 75,
  love_notes_count             = 9,
  high_engagement_pct          = NULL,
  cost_per_educator            = 550,
  observation_days_used        = 1,
  observation_days_total       = 2,
  virtual_sessions_used        = 0,
  virtual_sessions_total       = 1,
  executive_sessions_used      = 0,
  executive_sessions_total     = 0,
  momentum_status              = 'Building',
  momentum_detail              = 'Observation Day 1 complete - 9 Love Notes delivered. 9 of 12 staff actively using Hub. Observation Day 2 scheduled April 8. Virtual session planning underway.',
  contract_phase               = 'IGNITE',
  contract_start               = '2025-09-01',
  contract_end                 = '2026-05-31',
  data_updated_at              = now()
WHERE slug = 'saunemin-ccsd-438';

-- ============================================================
-- GLEN ELLYN D41
-- Source: app/D41-dashboard/page.tsx
-- ============================================================
UPDATE partnerships SET
  staff_enrolled               = 10,
  hub_login_pct                = 60,
  love_notes_count             = 0,
  high_engagement_pct          = NULL,
  cost_per_educator            = 100,
  observation_days_used        = 0,
  observation_days_total       = 0,
  virtual_sessions_used        = 0,
  virtual_sessions_total       = 0,
  executive_sessions_used      = 0,
  executive_sessions_total     = 0,
  momentum_status              = 'Needs Attention',
  momentum_detail              = 'Hub-only partnership. 6 of 10 memberships in use. Hub access fully activated. Seat utilization at 60%.',
  contract_phase               = 'IGNITE',
  contract_start               = '2025-09-01',
  contract_end                 = '2026-06-30',
  data_updated_at              = now()
WHERE slug = 'glen-ellyn-d41';

-- ============================================================
-- TIDIOUTE COMMUNITY CHARTER SCHOOL
-- Source: app/tccs-dashboard/page.tsx
-- ============================================================
UPDATE partnerships SET
  staff_enrolled               = 2,
  hub_login_pct                = 100,
  love_notes_count             = 0,
  high_engagement_pct          = NULL,
  cost_per_educator            = NULL,
  observation_days_used        = 0,
  observation_days_total       = 0,
  virtual_sessions_used        = 3,
  virtual_sessions_total       = 4,
  executive_sessions_used      = 0,
  executive_sessions_total     = 0,
  momentum_status              = 'Strong',
  momentum_detail              = 'Pilot virtual coaching partnership. 3 of 4 sessions complete. Both staff members actively engaged. Beth: 3 engaged days, 11 courses touched. James: 1 engaged day, 2 courses touched.',
  contract_phase               = 'IGNITE',
  contract_start               = '2025-10-01',
  contract_end                 = '2026-05-31',
  data_updated_at              = now()
WHERE slug = 'tidioute-community-charter';


-- ============================================================
-- STEP 2: CLEAR DEFAULT PLACEHOLDER TIMELINE EVENTS
-- ============================================================
DELETE FROM timeline_events
WHERE event_title IN (
  'Partnership launched',
  'Staff onboarding to Learning Hub',
  'First Observation Day - date TBD'
)
AND partnership_id IN (
  SELECT id FROM partnerships
  WHERE slug IN (
    'wego-district-94', 'st-peter-chanel', 'allenwood-elementary',
    'addison-school-district-4', 'saunemin-ccsd-438',
    'glen-ellyn-d41', 'tidioute-community-charter'
  )
);


-- ============================================================
-- STEP 3: SEED TIMELINE EVENTS
-- ============================================================

-- WEGO Timeline Events
DO $$
DECLARE wego_id UUID;
BEGIN
  SELECT id INTO wego_id FROM partnerships WHERE slug = 'wego-district-94';

  IF wego_id IS NOT NULL THEN
    INSERT INTO timeline_events (partnership_id, event_title, event_type, status, event_date, sort_order)
    VALUES
      -- DONE (completed)
      (wego_id, 'Partnership launched - 19 PAs enrolled',              'custom',          'completed', '2025-09-25', 1),
      (wego_id, '100% Hub activation - all 19 PAs logged in',          'custom',          'completed', '2025-10-01', 2),
      (wego_id, 'Subgroups established - 4 groups meeting every Monday','custom',          'completed', '2025-10-01', 3),
      (wego_id, 'Observation Day 1 - 8 PAs observed, Love Notes delivered','observation', 'completed', '2025-11-12', 4),
      (wego_id, 'On-Site Coaching 1 - strategies session complete',     'custom',          'completed', '2025-11-01', 5),
      (wego_id, 'Observation Day 2 - 11 PAs observed, Love Notes delivered','observation','completed', '2025-12-03', 6),
      (wego_id, 'On-Site Coaching 2 - strategies session complete',     'custom',          'completed', '2025-12-01', 7),
      (wego_id, 'On-Site Coaching 3 - strategies session complete',     'custom',          'completed', '2026-01-01', 8),
      (wego_id, 'Virtual Session 1 complete',                          'virtual_session',  'completed', '2026-01-01', 9),
      (wego_id, 'Virtual Session 2 complete',                          'virtual_session',  'completed', '2026-02-01', 10),
      (wego_id, 'Observation Day 3 - 7 PAs observed, Love Notes delivered','observation', 'completed', '2026-02-25', 11),
      -- IN PROGRESS
      (wego_id, '19/19 PAs Hub activated - 17 with tracked course activity', 'custom',    'in_progress', NULL, 12),
      (wego_id, 'Weekly subgroups running - every Monday 7:45-9AM',    'custom',          'in_progress', NULL, 13),
      (wego_id, 'Monthly full-group session with Rae - ongoing',        'custom',          'in_progress', NULL, 14),
      -- COMING SOON
      (wego_id, 'Virtual Session 4',                                   'virtual_session',  'upcoming', '2026-03-16', 15),
      (wego_id, 'Virtual Session 5',                                   'virtual_session',  'upcoming', '2026-04-13', 16),
      (wego_id, 'Year 1 Celebration + Year 2 Planning',                'custom',           'upcoming', '2026-04-01', 17),
      (wego_id, 'Virtual Session 6 (Final)',                           'virtual_session',  'upcoming', '2026-05-11', 18)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ST. PETER CHANEL Timeline Events
DO $$
DECLARE spc_id UUID;
BEGIN
  SELECT id INTO spc_id FROM partnerships WHERE slug = 'st-peter-chanel';

  IF spc_id IS NOT NULL THEN
    INSERT INTO timeline_events (partnership_id, event_title, event_type, status, event_date, sort_order)
    VALUES
      -- DONE
      (spc_id, 'Partnership kickoff - Initial Observations',           'custom',          'completed', '2025-09-30', 1),
      (spc_id, 'Hub access activated - all 25 staff enrolled',         'custom',          'completed', '2025-09-01', 2),
      (spc_id, 'Growth Groups formed - Instructional Design (9) + Class Management (11)', 'custom', 'completed', '2025-10-01', 3),
      (spc_id, 'On-Site Visit + Group Sessions - 100% Hub engagement', 'observation',     'completed', '2026-01-14', 4),
      (spc_id, 'Teacher survey complete - 19/19 responded (100%)',     'custom',          'completed', '2026-01-14', 5),
      (spc_id, '25 Love Notes delivered - all staff observed',         'custom',          'completed', '2026-01-14', 6),
      (spc_id, 'Phase 1 complete - moved to ACCELERATE',               'custom',          'completed', '2026-01-01', 7),
      -- IN PROGRESS
      (spc_id, 'Hub engagement - 28 staff actively using Hub',         'custom',          'in_progress', NULL, 8),
      (spc_id, 'Strategy implementation tracking - 21% implemented',   'custom',          'in_progress', NULL, 9),
      -- COMING SOON
      (spc_id, 'Spring Leadership Recap',                              'executive_session','upcoming', '2026-04-01', 10),
      (spc_id, 'Virtual session - Instructional Design group',         'virtual_session',  'upcoming', '2026-05-01', 11),
      (spc_id, 'Virtual session - Class Management group',             'virtual_session',  'upcoming', '2026-05-01', 12)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ALLENWOOD Timeline Events
DO $$
DECLARE allen_id UUID;
BEGIN
  SELECT id INTO allen_id FROM partnerships WHERE slug = 'allenwood-elementary';

  IF allen_id IS NOT NULL THEN
    INSERT INTO timeline_events (partnership_id, event_title, event_type, status, event_date, sort_order)
    VALUES
      -- DONE
      (allen_id, 'Partnership launched - 13 teachers enrolled',        'custom',          'completed', '2025-09-01', 1),
      (allen_id, 'Virtual Session 1 - Hub onboarding + partnership goals', 'virtual_session', 'completed', '2025-09-17', 2),
      (allen_id, 'Observation Day 1 - 11 classrooms, 11 Love Notes',   'observation',     'completed', '2025-10-15', 3),
      (allen_id, 'Virtual Session 2 - Hub update, tools discussion',   'virtual_session', 'completed', '2026-02-25', 4),
      (allen_id, 'Observation Day 2 - 10 classrooms, Love Notes delivered', 'observation','completed', '2026-02-18', 5),
      -- IN PROGRESS
      (allen_id, 'Hub engagement - 100% login rate maintained',        'custom',          'in_progress', NULL, 6),
      (allen_id, 'Virtual Sessions 3-6 - TDI preparing content',       'custom',          'in_progress', NULL, 7),
      -- COMING SOON
      (allen_id, 'Virtual Session 3',                                  'virtual_session',  'upcoming', '2026-03-11', 8),
      (allen_id, 'Virtual Session 4',                                  'virtual_session',  'upcoming', '2026-03-25', 9),
      (allen_id, 'Virtual Session 5',                                  'virtual_session',  'upcoming', '2026-04-08', 10),
      (allen_id, 'Virtual Session 6',                                  'virtual_session',  'upcoming', '2026-04-15', 11)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ASD4 Timeline Events
DO $$
DECLARE asd4_id UUID;
BEGIN
  SELECT id INTO asd4_id FROM partnerships WHERE slug = 'addison-school-district-4';

  IF asd4_id IS NOT NULL THEN
    INSERT INTO timeline_events (partnership_id, event_title, event_type, status, event_date, sort_order)
    VALUES
      -- DONE
      (asd4_id, 'Partnership launched - 122 paras enrolled',           'custom',          'completed', '2025-10-01', 1),
      (asd4_id, 'Virtual Support Session 1',                           'virtual_session', 'completed', '2026-03-02', 2),
      (asd4_id, 'Observation Day 1 - 17 classrooms, 18 Love Notes, 10 para replies', 'observation', 'completed', '2026-03-03', 3),
      -- IN PROGRESS
      (asd4_id, '122/122 paras Hub activated - 100% login rate',       'custom',          'in_progress', NULL, 4),
      (asd4_id, '70% demonstrated Collaborative Support strategies',   'custom',          'in_progress', NULL, 5),
      -- COMING SOON
      (asd4_id, 'Observation Day 2',                                   'observation',      'upcoming', '2026-03-19', 6),
      (asd4_id, 'Virtual Support Session 2',                           'virtual_session',  'upcoming', '2026-04-06', 7),
      (asd4_id, 'Virtual Support Session 3',                           'virtual_session',  'upcoming', '2026-04-20', 8),
      (asd4_id, 'Virtual Support Session 4 - scheduling in progress',  'virtual_session',  'upcoming', NULL, 9)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- SAUNEMIN Timeline Events
DO $$
DECLARE saun_id UUID;
BEGIN
  SELECT id INTO saun_id FROM partnerships WHERE slug = 'saunemin-ccsd-438';

  IF saun_id IS NOT NULL THEN
    INSERT INTO timeline_events (partnership_id, event_title, event_type, status, event_date, sort_order)
    VALUES
      -- DONE
      (saun_id, 'Partnership launched - 12 staff enrolled',            'custom',          'completed', '2025-09-01', 1),
      (saun_id, 'Hub access activated - 9 of 12 staff logged in',      'custom',          'completed', '2025-09-15', 2),
      (saun_id, 'Observation Day 1 - 9 staff observed, 9 Love Notes',  'observation',     'completed', '2025-11-19', 3),
      -- IN PROGRESS
      (saun_id, '75% Hub login rate - 9 of 12 staff active',           'custom',          'in_progress', NULL, 4),
      (saun_id, 'Virtual session planning underway',                   'custom',          'in_progress', NULL, 5),
      -- COMING SOON
      (saun_id, 'Observation Day 2',                                   'observation',      'upcoming', '2026-04-08', 6),
      (saun_id, 'Virtual Session - full team',                         'virtual_session',  'upcoming', NULL, 7)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- D41 Timeline Events
DO $$
DECLARE d41_id UUID;
BEGIN
  SELECT id INTO d41_id FROM partnerships WHERE slug = 'glen-ellyn-d41';

  IF d41_id IS NOT NULL THEN
    INSERT INTO timeline_events (partnership_id, event_title, event_type, status, event_date, sort_order)
    VALUES
      -- DONE
      (d41_id, 'Partnership launched - Hub-only membership',           'custom',          'completed', '2025-09-01', 1),
      (d41_id, 'Hub access activated - 10 seats',                      'custom',          'completed', '2025-09-01', 2),
      -- IN PROGRESS
      (d41_id, '6 of 10 members actively learning',                    'custom',          'in_progress', NULL, 3),
      (d41_id, 'Seat utilization at 60%',                              'custom',          'in_progress', NULL, 4)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- TCCS Timeline Events
DO $$
DECLARE tccs_id UUID;
BEGIN
  SELECT id INTO tccs_id FROM partnerships WHERE slug = 'tidioute-community-charter';

  IF tccs_id IS NOT NULL THEN
    INSERT INTO timeline_events (partnership_id, event_title, event_type, status, event_date, sort_order)
    VALUES
      -- DONE
      (tccs_id, 'Pilot partnership launched - 2 staff enrolled',       'custom',          'completed', '2025-10-01', 1),
      (tccs_id, 'Hub access activated - 100% login rate',              'custom',          'completed', '2025-10-01', 2),
      (tccs_id, 'Virtual Coaching Session 1',                          'virtual_session', 'completed', '2025-11-01', 3),
      (tccs_id, 'Virtual Coaching Session 2',                          'virtual_session', 'completed', '2025-12-01', 4),
      (tccs_id, 'Virtual Coaching Session 3',                          'virtual_session', 'completed', '2026-01-01', 5),
      -- IN PROGRESS
      (tccs_id, 'Beth: 3 engaged days, 11 courses touched',            'custom',          'in_progress', NULL, 6),
      (tccs_id, 'James: 1 engaged day, 2 courses touched',             'custom',          'in_progress', NULL, 7),
      -- COMING SOON
      (tccs_id, 'Virtual Coaching Session 4 (Final)',                  'virtual_session',  'upcoming', NULL, 8)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;


-- ============================================================
-- STEP 4: UPSERT ORGANIZATION RECORDS
-- ============================================================
INSERT INTO organizations (partnership_id, name, org_type)
SELECT id, 'WEGO High School District 94', 'district'
FROM partnerships WHERE slug = 'wego-district-94'
ON CONFLICT (partnership_id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO organizations (partnership_id, name, org_type)
SELECT id, 'St. Peter Chanel Catholic School', 'school'
FROM partnerships WHERE slug = 'st-peter-chanel'
ON CONFLICT (partnership_id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO organizations (partnership_id, name, org_type)
SELECT id, 'Allenwood Elementary School', 'school'
FROM partnerships WHERE slug = 'allenwood-elementary'
ON CONFLICT (partnership_id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO organizations (partnership_id, name, org_type)
SELECT id, 'Addison School District 4', 'district'
FROM partnerships WHERE slug = 'addison-school-district-4'
ON CONFLICT (partnership_id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO organizations (partnership_id, name, org_type)
SELECT id, 'Saunemin CCSD #438', 'school'
FROM partnerships WHERE slug = 'saunemin-ccsd-438'
ON CONFLICT (partnership_id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO organizations (partnership_id, name, org_type)
SELECT id, 'Glen Ellyn School District 41', 'district'
FROM partnerships WHERE slug = 'glen-ellyn-d41'
ON CONFLICT (partnership_id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO organizations (partnership_id, name, org_type)
SELECT id, 'Tidioute Community Charter School', 'school'
FROM partnerships WHERE slug = 'tidioute-community-charter'
ON CONFLICT (partnership_id) DO UPDATE SET name = EXCLUDED.name;


-- ============================================================
-- STEP 5: VERIFY
-- ============================================================
SELECT
  p.slug,
  o.name,
  p.staff_enrolled,
  p.hub_login_pct,
  p.love_notes_count,
  p.momentum_status,
  p.observation_days_used,
  p.observation_days_total,
  COUNT(DISTINCT t.id) as timeline_events
FROM partnerships p
LEFT JOIN organizations o ON o.partnership_id = p.id
LEFT JOIN timeline_events t ON t.partnership_id = p.id
WHERE p.status = 'active'
  AND p.slug IN (
    'wego-district-94', 'st-peter-chanel', 'allenwood-elementary',
    'addison-school-district-4', 'saunemin-ccsd-438',
    'glen-ellyn-d41', 'tidioute-community-charter'
  )
GROUP BY p.slug, o.name, p.staff_enrolled, p.hub_login_pct,
         p.love_notes_count, p.momentum_status,
         p.observation_days_used, p.observation_days_total
ORDER BY p.slug;
