-- ============================================================
-- RECONCILIATION MIGRATION: Projected Date System Enhancement
-- Captures schema changes applied directly to production Supabase
-- on 2026-05-12 as part of the Creator Studio overhaul.
--
-- NOTE: Migration 013 already created target_completion_date,
-- target_date_set_at, target_date_set_by, and
-- creator_target_date_history. This migration adds the
-- projected_publish_date (auto-computed = completion + 30 days)
-- and the projected_date_history table with trigger.
-- If Rae renamed the columns, adjust accordingly.
-- ============================================================

-- 1. Add projected_publish_date (auto-computed from target_completion_date + 30 days)
ALTER TABLE public.creators
ADD COLUMN IF NOT EXISTS projected_publish_date date;

-- 2. Projected date history table (auto-logged via trigger)
-- This supplements creator_target_date_history from migration 013
CREATE TABLE IF NOT EXISTS public.projected_date_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id uuid NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  completion_date date,
  publish_date date,
  set_by text,
  set_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_projected_date_history_creator_id
  ON public.projected_date_history(creator_id);
CREATE INDEX IF NOT EXISTS idx_projected_date_history_set_at
  ON public.projected_date_history(set_at);

-- 3. Trigger: auto-compute projected_publish_date and log history
CREATE OR REPLACE FUNCTION public.fn_projected_date_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.target_completion_date IS DISTINCT FROM OLD.target_completion_date THEN
    NEW.projected_publish_date := NEW.target_completion_date + INTERVAL '30 days';

    INSERT INTO public.projected_date_history (
      creator_id, completion_date, publish_date, set_by, set_at
    ) VALUES (
      NEW.id,
      NEW.target_completion_date,
      NEW.target_completion_date + INTERVAL '30 days',
      NEW.target_date_set_by,
      now()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_projected_date_update ON public.creators;
CREATE TRIGGER trg_projected_date_update
  BEFORE UPDATE ON public.creators
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_projected_date_trigger();
