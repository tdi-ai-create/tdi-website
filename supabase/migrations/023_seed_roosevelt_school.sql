-- ============================================================
-- CCP F: SEED ROOSEVELT SCHOOL - LEADERSHIP DASHBOARD TEST SCHOOL
-- March 2026
-- First school using dynamic dashboard only (no legacy page)
-- Internal test case for principal-facing portal
-- ============================================================

-- ============================================================
-- STEP 1: CREATE PARTNERSHIP_STAFF TABLE (IF NOT EXISTS)
-- ============================================================
CREATE TABLE IF NOT EXISTS partnership_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  role_group TEXT,
  hub_enrolled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(partnership_id, email)
);

ALTER TABLE partnership_staff ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists, then recreate
DROP POLICY IF EXISTS "TDI admins can manage staff" ON partnership_staff;

CREATE POLICY "TDI admins can manage staff"
ON partnership_staff FOR ALL
USING (auth.email() LIKE '%@teachersdeserveit.com')
WITH CHECK (auth.email() LIKE '%@teachersdeserveit.com');

-- Index for fast staff lookups
CREATE INDEX IF NOT EXISTS idx_partnership_staff_partnership_id
  ON partnership_staff(partnership_id);


-- ============================================================
-- STEP 2: INSERT ROOSEVELT SCHOOL PARTNERSHIP
-- ============================================================
INSERT INTO partnerships (
  partnership_type,
  slug,
  contact_name,
  contact_email,
  primary_contact_name,
  primary_contact_email,
  contract_phase,
  status,
  building_count,
  observation_days_total,
  virtual_sessions_total,
  executive_sessions_total,
  observation_days_used,
  virtual_sessions_used,
  executive_sessions_used,
  momentum_status,
  staff_enrolled,
  hub_login_pct,
  love_notes_count,
  high_engagement_pct,
  legacy_dashboard_url,
  address,
  website
) VALUES (
  'school',
  'roosevelt-school',
  'TDI Team',
  'hello@teachersdeserveit.com',
  'TDI Team',
  'hello@teachersdeserveit.com',
  'IGNITE',
  'active',
  1,
  2,
  4,
  2,
  0,
  0,
  0,
  'Building',
  18,
  NULL,
  NULL,
  NULL,
  NULL,
  'Roosevelt School, Lodi, NJ 07644',
  'lodi.k12.nj.us'
)
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- STEP 3: INSERT ORGANIZATION RECORD
-- ============================================================
INSERT INTO organizations (partnership_id, name, org_type)
SELECT id, 'Roosevelt School', 'school'
FROM partnerships WHERE slug = 'roosevelt-school'
ON CONFLICT DO NOTHING;


-- ============================================================
-- STEP 4: SEED STAFF LIST (18 members)
-- ============================================================
-- Note: One email discrepancy to verify - display is "Cristina Quinonez"
-- but email shows cristina.quinones (missing z) - verify with school
-- before inviting to Hub

INSERT INTO partnership_staff (partnership_id, first_name, last_name, email, role_group)
SELECT
  p.id,
  s.first_name,
  s.last_name,
  s.email,
  s.role_group
FROM partnerships p
CROSS JOIN (VALUES
  -- Pre-K
  ('Jenna',     'Russo',            'jenna.russo@lodi.k12.nj.us',              'Pre-K'),
  ('Lisa',      'Costa',            'lisa.costa@lodi.k12.nj.us',               'Pre-K'),
  ('Michele',   'Nesbitt',          'michele.nesbitt@lodi.k12.nj.us',          'Pre-K'),
  -- Kindergarten
  ('Anna',      'Drotos',           'anna.drotos@lodi.k12.nj.us',              'Kindergarten'),
  ('Carrie',    'Bresnan',          'carrie.bresnan@lodi.k12.nj.us',           'Kindergarten'),
  ('Jessica',   'Bigos',            'jessica.bigos@lodi.k12.nj.us',            'Kindergarten'),
  -- 1st Grade
  ('Chelsea',   'Ruiz',             'chelsea.ruiz@lodi.k12.nj.us',             '1st Grade'),
  ('Samantha',  'Chimento',         'samantha.chimento@lodi.k12.nj.us',        '1st Grade'),
  ('Barbara',   'Colizza',          'barbara.colizza@lodi.k12.nj.us',          '1st Grade'),
  -- Resource Teachers
  ('Barb',      'Maggio',           'Barbara.maggio@lodi.k12.nj.us',           'Resource Teachers'),
  ('Cristina',  'Quinonez',         'cristina.quinones@lodi.k12.nj.us',        'Resource Teachers'),
  -- Aides
  ('Farah',     'Qureshi-Kipness',  'farah.qureshikipness@lodi.k12.nj.us',     'Aides'),
  ('KellyAnn',  'Annuzzi',          'kellyann.annuzzi@lodi.k12.nj.us',         'Aides'),
  ('Nikole',    'Gonzalez',         'nikole.gonzalez@lodi.k12.nj.us',          'Aides'),
  ('Debbie',    'Sileno',           'debbie.sileno@lodi.k12.nj.us',            'Aides'),
  ('Lodie',     'Shahine',          'lodie.shahine@lodi.k12.nj.us',            'Aides'),
  ('Karen',     'Burke',            'karen.burke@lodi.k12.nj.us',              'Aides'),
  ('Ingy',      'Morgan',           'ingy.morgan@lodi.k12.nj.us',              'Aides')
) AS s(first_name, last_name, email, role_group)
WHERE p.slug = 'roosevelt-school'
ON CONFLICT DO NOTHING;


-- ============================================================
-- STEP 5: SEED STARTER TIMELINE EVENTS
-- Clean IGNITE-phase timeline so dashboard doesn't look empty
-- Note: Using existing schema column names (event_title, event_type, sort_order)
-- ============================================================
INSERT INTO timeline_events (partnership_id, event_title, status, event_type, sort_order)
SELECT
  p.id,
  e.event_title,
  e.status,
  e.event_type,
  e.sort_order
FROM partnerships p
CROSS JOIN (VALUES
  ('Partnership Kickoff Call',          'completed',   'milestone', 1),
  ('Staff Roster Submitted',            'completed',   'milestone', 2),
  ('Hub Access Invitations Sent',       'in_progress', 'milestone', 3),
  ('Observation Day #1',                'upcoming',    'observation', 4),
  ('Virtual Session #1',                'upcoming',    'virtual_session', 5),
  ('Mid-Year Check-In',                 'upcoming',    'milestone', 6)
) AS e(event_title, status, event_type, sort_order)
WHERE p.slug = 'roosevelt-school'
ON CONFLICT DO NOTHING;


-- ============================================================
-- STEP 6: VERIFICATION QUERY
-- Run this after migration to confirm success
-- ============================================================
-- Expected: roosevelt-school | IGNITE | Building | 18 | 2 | 4 | 18 | 6

/*
SELECT
  p.slug,
  p.contract_phase,
  p.momentum_status,
  p.staff_enrolled,
  p.observation_days_total,
  p.virtual_sessions_total,
  COUNT(DISTINCT s.id) AS staff_records,
  COUNT(DISTINCT t.id) AS timeline_events
FROM partnerships p
LEFT JOIN partnership_staff s ON s.partnership_id = p.id
LEFT JOIN timeline_events t ON t.partnership_id = p.id
WHERE p.slug = 'roosevelt-school'
GROUP BY p.slug, p.contract_phase, p.momentum_status,
         p.staff_enrolled, p.observation_days_total, p.virtual_sessions_total;
*/
