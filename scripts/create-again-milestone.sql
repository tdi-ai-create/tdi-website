-- ============================================
-- CREATE WITH US AGAIN - FULL MIGRATION
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- SECTION 1: CREATE PROJECTS TABLE
-- ============================================

-- Create creator_projects table to track multiple projects per creator
CREATE TABLE IF NOT EXISTS public.creator_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  project_number INTEGER NOT NULL DEFAULT 1,
  content_path TEXT CHECK (content_path IN ('blog', 'download', 'course')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  project_title TEXT, -- Optional title for the project (e.g., course title)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  archived_by TEXT, -- Admin email who archived it
  UNIQUE(creator_id, project_number)
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_creator_projects_creator ON public.creator_projects(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_projects_status ON public.creator_projects(creator_id, status);

-- ============================================
-- SECTION 2: ADD PROJECT_ID TO CREATOR_MILESTONES
-- ============================================

-- Add project_id column to creator_milestones
ALTER TABLE public.creator_milestones
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.creator_projects(id) ON DELETE CASCADE;

-- Create index for efficient lookups by project
CREATE INDEX IF NOT EXISTS idx_creator_milestones_project ON public.creator_milestones(project_id);

-- ============================================
-- SECTION 3: MIGRATE EXISTING DATA TO PROJECT 1
-- ============================================

-- Create Project 1 for all existing creators
INSERT INTO public.creator_projects (creator_id, project_number, content_path, status, project_title, created_at)
SELECT
  c.id,
  1,
  c.content_path,
  CASE
    WHEN c.status = 'archived' THEN 'archived'
    ELSE 'active'
  END,
  c.course_title,
  c.created_at
FROM public.creators c
WHERE NOT EXISTS (
  SELECT 1 FROM public.creator_projects cp
  WHERE cp.creator_id = c.id AND cp.project_number = 1
);

-- Update all existing creator_milestones to point to project 1
UPDATE public.creator_milestones cm
SET project_id = cp.id
FROM public.creator_projects cp
WHERE cm.creator_id = cp.creator_id
  AND cp.project_number = 1
  AND cm.project_id IS NULL;

-- ============================================
-- SECTION 4: ADD CREATE_AGAIN MILESTONE
-- ============================================

-- Insert the create_again milestone into the launch phase
INSERT INTO public.milestones (
  id,
  phase_id,
  name,
  description,
  sort_order,
  requires_team_action,
  applies_to,
  action_type,
  action_config
) VALUES (
  'create_again',
  'launch',
  'Create With Us Again?',
  'You did it! Ready to create something new with TDI?',
  99,  -- High sort order to guarantee it's always last
  false,
  '{blog,download,course}',
  'create_again_choice',
  '{
    "heading": "You Did It!",
    "subtext_template": "Congratulations on completing your {content_path}! We''d love to keep creating with you.",
    "yes_label": "Yes, I have more to share!",
    "no_label": "Hold off for now"
  }'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  applies_to = EXCLUDED.applies_to,
  action_type = EXCLUDED.action_type,
  action_config = EXCLUDED.action_config;

-- ============================================
-- SECTION 5: ADD MILESTONE TO ALL EXISTING CREATORS
-- ============================================

-- Create create_again milestone record for all existing creator projects
INSERT INTO public.creator_milestones (creator_id, milestone_id, status, project_id)
SELECT c.id, 'create_again', 'locked', cp.id
FROM public.creators c
JOIN public.creator_projects cp ON cp.creator_id = c.id
WHERE NOT EXISTS (
  SELECT 1 FROM public.creator_milestones cm
  WHERE cm.creator_id = c.id
    AND cm.milestone_id = 'create_again'
    AND cm.project_id = cp.id
);

-- ============================================
-- SECTION 6: ADD ACTIVE_PROJECT_ID TO CREATORS
-- ============================================

-- Add active_project_id for quick lookups of the current project
ALTER TABLE public.creators
ADD COLUMN IF NOT EXISTS active_project_id UUID REFERENCES public.creator_projects(id);

-- Set active_project_id for all existing creators
UPDATE public.creators c
SET active_project_id = cp.id
FROM public.creator_projects cp
WHERE c.id = cp.creator_id
  AND cp.status = 'active'
  AND cp.project_number = (
    SELECT MAX(cp2.project_number)
    FROM public.creator_projects cp2
    WHERE cp2.creator_id = c.id AND cp2.status = 'active'
  );

-- ============================================
-- SECTION 7: ADD RLS POLICIES FOR PROJECTS TABLE
-- ============================================

-- Enable RLS
ALTER TABLE public.creator_projects ENABLE ROW LEVEL SECURITY;

-- TDI admin full access
CREATE POLICY "TDI admin full access creator_projects" ON public.creator_projects FOR ALL
  USING (auth.jwt() ->> 'email' LIKE '%@teachersdeserveit.com');

-- Creators can view their own projects
CREATE POLICY "Creators view own projects" ON public.creator_projects FOR SELECT
  USING (
    creator_id IN (
      SELECT id FROM public.creators WHERE email = auth.jwt() ->> 'email'
    )
  );

-- ============================================
-- VERIFICATION QUERIES (run after migration)
-- ============================================

-- Check projects were created:
-- SELECT COUNT(*) FROM public.creator_projects;

-- Check all milestones have project_id:
-- SELECT COUNT(*) FROM public.creator_milestones WHERE project_id IS NULL;

-- Check create_again milestone exists:
-- SELECT * FROM public.milestones WHERE id = 'create_again';

-- Check all creators have the create_again milestone:
-- SELECT c.name, cm.status
-- FROM public.creators c
-- LEFT JOIN public.creator_milestones cm ON cm.creator_id = c.id AND cm.milestone_id = 'create_again'
-- ORDER BY c.name;
