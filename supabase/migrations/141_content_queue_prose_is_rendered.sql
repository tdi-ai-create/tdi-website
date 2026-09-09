-- Prose counts as rendered.
--
-- Rule 3 said nothing reaches an approver unrendered. It was satisfied, until
-- today, by artifact_rendered_at being stamped on every submit whether or not
-- anything had been rendered. PR #424 removed that fiction, which is correct,
-- and the consequence is that rule 3 now blocks every text-only piece: a
-- Substack post has no separate rendered file because the body is the finished
-- thing.
--
-- This is a loosening, not a tightening, so it is safe to apply ahead of code.
-- Rule 0 still guarantees there is content; this only says prose counts as
-- rendered. Rules 0 to 6 are otherwise unchanged.

BEGIN;

CREATE OR REPLACE FUNCTION public.content_queue_gate()
RETURNS TRIGGER AS $$
DECLARE
  hit text;
BEGIN
  NEW.updated_at := now();

  -- 0. There has to be something to judge.
  --
  -- On 9 September an empty draft passed QA. body was null, artifact_refs was
  -- empty, and artifact_rendered_at had been stamped anyway. Julie passed it and
  -- Lily wrote that it read "clean and on-voice". There was nothing to read.
  --
  -- Rules 4, 5 and 6 below all guard against BAD content, and each one reads
  -- COALESCE(NEW.body,''), so an empty body satisfies every one of them
  -- trivially. The gate could see what was wrong with the text and could not
  -- see that there was no text.
  --
  -- brief, drafting, changes_requested and cancelled are exempt on purpose: a
  -- brief has not been written yet, and a piece sent back to its writer is
  -- allowed to sit empty while they work.
  IF NEW.status NOT IN ('brief','drafting','changes_requested','cancelled') THEN
    IF COALESCE(btrim(NEW.body),'') = ''
       AND jsonb_array_length(COALESCE(NEW.artifact_refs,'[]'::jsonb)) = 0 THEN
      RAISE EXCEPTION 'Content queue: "%" has no body and no rendered artifact, so it cannot be %. A gate cannot review what is not there.', COALESCE(NEW.title, NEW.id::text), NEW.status
        USING ERRCODE = 'P0001';
    END IF;
  END IF;

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
  --
  -- Amended 9 September. For prose, the body IS the finished thing; a Substack
  -- post has no separate rendered file. Until today every submit stamped
  -- artifact_rendered_at whether or not anything had been rendered, so this rule
  -- passed on a fiction and never actually bit. Removing that fiction made it
  -- bite everything text-shaped. A full body satisfies it; an empty one never
  -- gets this far, because rule 0 stops it.
  IF NEW.status = 'pending_approval' AND OLD.status IS DISTINCT FROM 'pending_approval' THEN
    IF NEW.artifact_rendered_at IS NULL AND COALESCE(btrim(NEW.body),'') = '' THEN
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

COMMIT;
