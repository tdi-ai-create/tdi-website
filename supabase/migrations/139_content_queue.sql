-- ============================================================
-- The Content Queue
--
-- Somewhere for agent-written marketing content to go, with the same shape as
-- the Hub release schedule that shipped on 7 September: a table, an endpoint
-- agents call, a calendar, and gates the database enforces rather than the
-- instructions request.
--
-- Deliberately NOT a Paperclip plugin. That was the original plan, copied from
-- another company's architecture, and it meant weeks on a third-party SDK that
-- only two people here can write. This extends what already works.
--
-- Eleven states, each with exactly one owner, so a stalled item always has
-- precisely one name to ask. Kristin asked for three gates on 7 September:
-- QA (Julie), creative (Lily), editorial (Olivia), then an approver.
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.content_queue_items (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- what it is
  channel               text NOT NULL,            -- substack | instagram | video_script | hub | email
  content_type          text NOT NULL,
  title                 text,
  brief                 text,                     -- kept unchanged so a reviewer can compare intent against output
  body                  text,
  audience_tag          text NOT NULL,            -- a blocker on Kristin's list, so it cannot be null

  -- the finished thing, never a description of it
  artifact_refs         jsonb NOT NULL DEFAULT '[]'::jsonb,
  artifact_rendered_at  timestamptz,

  -- when
  scheduled_for         date,                     -- null until approved
  published_at          timestamptz,

  -- workflow
  status                text NOT NULL DEFAULT 'brief',
  owner                 text,                     -- who it waits on, stored so a stalled item is answerable
  approver              text,                     -- kristin | rae, decided by purpose rather than channel
  approved_by           text,
  approved_at           timestamptz,
  qa_spec_version       text,                     -- which standard it passed; an audit needs this
  feedback_log          jsonb NOT NULL DEFAULT '[]'::jsonb,  -- append only, written by the endpoint and nothing else

  -- results
  published_url         text,
  verified_at           timestamptz,
  verification_note     text,

  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT content_queue_status_known CHECK (status IN (
    'brief','drafting','pending_qa','pending_creative','pending_editorial',
    'pending_approval','approved','scheduled','published','verified',
    'changes_requested','cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_cq_status        ON public.content_queue_items (status);
CREATE INDEX IF NOT EXISTS idx_cq_scheduled     ON public.content_queue_items (scheduled_for)
  WHERE scheduled_for IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cq_channel       ON public.content_queue_items (channel);

-- ── Terms that stop a post, checked in the database ──
--
-- Partner and district names live in the other Supabase project, so a trigger
-- cannot reach them. This table is the local copy the gate checks against, kept
-- current by the endpoint. A denylist that lives beside the rule it enforces
-- beats one that requires a cross-project query nobody will maintain.
CREATE TABLE IF NOT EXISTS public.content_queue_blocked_terms (
  term        text PRIMARY KEY,
  reason      text NOT NULL DEFAULT 'named district or client',
  added_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.content_queue_blocked_terms IS
  'Names that must never appear in published content. Rae, 6 Sep 2026: published content never identifies a real district or school. Sync from partnerships; the gate reads only this table.';

-- ── The gates ──
--
-- Every one of these is a rule rather than a convention. Julie''s Quick Win
-- trigger has held for months because it is a trigger; the same reasoning
-- applies here, and more so, because the callers are agents.
CREATE OR REPLACE FUNCTION public.content_queue_gate()
RETURNS TRIGGER AS $$
DECLARE
  hit text;
BEGIN
  NEW.updated_at := now();

  -- 1. No approval without a person having been recorded.
  --
  -- Detection is behavioural, and the same trick the reference build uses: the
  -- endpoint ALWAYS appends to feedback_log in the same statement as an approval.
  -- A direct database write sets status alone. Honest limit: an agent that also
  -- writes a junk log entry would pass. This stops accidents and shortcuts, not
  -- a determined bypass.
  IF NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved' THEN
    IF NEW.feedback_log IS NOT DISTINCT FROM OLD.feedback_log THEN
      RAISE EXCEPTION 'Content queue: approving "%" requires going through the endpoint. A direct status write leaves no record of who approved it.', COALESCE(NEW.title, NEW.id::text)
        USING ERRCODE = 'P0001';
    END IF;
    IF NEW.approved_by IS NULL OR btrim(NEW.approved_by) = '' THEN
      RAISE EXCEPTION 'Content queue: approving "%" requires approved_by. An approval nobody signed is not an approval.', COALESCE(NEW.title, NEW.id::text)
        USING ERRCODE = 'P0001';
    END IF;
  END IF;

  -- 2. Nothing publishes that was not approved.
  IF NEW.status IN ('scheduled','published','verified') AND NEW.approved_at IS NULL THEN
    RAISE EXCEPTION 'Content queue: "%" cannot reach % without an approval. There is no path from a review gate to live.', COALESCE(NEW.title, NEW.id::text), NEW.status
      USING ERRCODE = 'P0001';
  END IF;

  -- 3. Nothing reaches a human approver unrendered.
  --
  -- Rae, 2 Sep: content in the queue is as close to ready to publish as possible,
  -- even in draft. This is what makes that true rather than aspirational.
  IF NEW.status = 'pending_approval' AND OLD.status IS DISTINCT FROM 'pending_approval' THEN
    IF NEW.artifact_rendered_at IS NULL THEN
      RAISE EXCEPTION 'Content queue: "%" cannot reach an approver before it is rendered. Reviewing means looking at the finished thing, not a description of it.', COALESCE(NEW.title, NEW.id::text)
        USING ERRCODE = 'P0001';
    END IF;
  END IF;

  -- 4. No named districts, schools or clients. Only checked once there is a
  --    body to check, so a bare brief is not blocked before anyone writes it.
  IF NEW.status NOT IN ('brief','cancelled') AND (NEW.body IS NOT NULL OR NEW.title IS NOT NULL) THEN
    SELECT b.term INTO hit
    FROM public.content_queue_blocked_terms b
    WHERE COALESCE(NEW.body,'') ILIKE '%' || b.term || '%'
       OR COALESCE(NEW.title,'') ILIKE '%' || b.term || '%'
    LIMIT 1;
    IF hit IS NOT NULL THEN
      RAISE EXCEPTION 'Content queue: "%" names "%". Published content never identifies a real district or client. Use a non-identifiable descriptor.', COALESCE(NEW.title, NEW.id::text), hit
        USING ERRCODE = 'P0001';
    END IF;
  END IF;

  -- 5. No dashes. 34 published Quick Wins had to be fixed by hand on 8 September;
  --    the point of a rule is not doing that again.
  IF NEW.status NOT IN ('brief','cancelled') THEN
    IF COALESCE(NEW.body,'') LIKE '%--%' OR COALESCE(NEW.title,'') LIKE '%--%'
       OR COALESCE(NEW.body,'') ~ '[—–]' OR COALESCE(NEW.title,'') ~ '[—–]' THEN
      RAISE EXCEPTION 'Content queue: "%" contains a double hyphen or an em dash. Use commas, periods or "and".', COALESCE(NEW.title, NEW.id::text)
        USING ERRCODE = 'P0001';
    END IF;
  END IF;

  -- 6. No raw headcounts in anything outside TDI. Percentages and words are fine.
  IF NEW.status NOT IN ('brief','cancelled') AND COALESCE(NEW.body,'') ~* '\y[0-9]{1,6}\s+(educators|teachers|paras|schools|districts|subscribers|members|leaders)\y' THEN
    RAISE EXCEPTION 'Content queue: "%" states a count of people. Use a percentage or a word like most. Counts are an internal gauge.', COALESCE(NEW.title, NEW.id::text)
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_content_queue_gate ON public.content_queue_items;
CREATE TRIGGER trg_content_queue_gate
  BEFORE INSERT OR UPDATE ON public.content_queue_items
  FOR EACH ROW EXECUTE FUNCTION public.content_queue_gate();

COMMIT;
