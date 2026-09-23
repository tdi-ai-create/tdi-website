-- ============================================================
-- RECONCILIATION MIGRATION: Pause / Lifecycle System
-- Captures schema changes applied directly to production Supabase
-- on 2026-05-12 as part of the Creator Studio overhaul.
-- ============================================================

-- 1. Add lifecycle columns to creators table
ALTER TABLE public.creators
ADD COLUMN IF NOT EXISTS lifecycle_state text NOT NULL DEFAULT 'active'
  CHECK (lifecycle_state IN ('active', 'paused', 'archived'));

ALTER TABLE public.creators
ADD COLUMN IF NOT EXISTS paused_at timestamptz;

ALTER TABLE public.creators
ADD COLUMN IF NOT EXISTS paused_by text;

ALTER TABLE public.creators
ADD COLUMN IF NOT EXISTS pause_reason text;

ALTER TABLE public.creators
ADD COLUMN IF NOT EXISTS pause_type text
  CHECK (pause_type IS NULL OR pause_type IN ('mid_project', 'between_projects'));

ALTER TABLE public.creators
ADD COLUMN IF NOT EXISTS last_check_in_at timestamptz;

ALTER TABLE public.creators
ADD COLUMN IF NOT EXISTS unpaused_at timestamptz;

ALTER TABLE public.creators
ADD COLUMN IF NOT EXISTS unpause_token text UNIQUE;

-- 2. Pause history audit trail
CREATE TABLE IF NOT EXISTS public.creator_pause_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id uuid NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('paused', 'unpaused', 'check_in')),
  pause_type text CHECK (pause_type IS NULL OR pause_type IN ('mid_project', 'between_projects')),
  reason text,
  performed_by text,
  performed_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_creator_pause_history_creator_id
  ON public.creator_pause_history(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_pause_history_performed_at
  ON public.creator_pause_history(performed_at);

-- 3. Index on lifecycle_state for filtering active creators
CREATE INDEX IF NOT EXISTS idx_creators_lifecycle_state
  ON public.creators(lifecycle_state);
