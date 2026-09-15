-- Two tables the calendar needs: what good looks like, and what is planned.
--
-- Runs against the Learning Hub project (asdwpkcsbcnpknklchdq), which owns
-- content_queue_items.
--
-- ── content_queue_standards ──────────────────────────────────────────────
--
-- Substack posts and Instagram carousels have no structural contract, on
-- purpose. Julie and Lily refuse to invent one, so they flag
-- `NO STANDARD: <channel>` and Nora reads those out in standup, waiting for
-- Kristin to set a contract from real work rather than from an abstract spec.
--
-- That loop has never closed. The Substack post waiting since 8 September has
-- been flagged twice and the standard still does not exist, because setting one
-- currently means writing a spec document nobody has written.
--
-- This makes it a by-product of a decision Kristin is already making: approve a
-- piece, and optionally say "this one is the standard for its channel". One
-- standard per channel, replaced rather than versioned, because the question is
-- always "what does good look like now".
--
-- ── content_queue_slots ──────────────────────────────────────────────────
--
-- Today agents decide what gets made and a person meets the result at the end,
-- finished and undated. On 14 September nine of eleven pieces had no date and
-- every live piece was stacked at the approval step.
--
-- A slot is an intention with no work attached: a day, a channel, an audience,
-- and a sentence about what it is for. Kristin lays out the shape of a month and
-- Nora briefs into the open slots instead of inventing them.
--
-- filled_by is set when a piece is written against the slot. A slot whose date
-- is close and which is still empty is the gap worth seeing.
--
-- Nothing enforces slots. An agent can still place a brief without one, and
-- nothing in the pipeline rejects unslotted work. Enforcement would arrive
-- before any agent knows how to satisfy it, which is how a queue stops moving.

BEGIN;

CREATE TABLE IF NOT EXISTS public.content_queue_standards (
  channel      text PRIMARY KEY,
  item_id      uuid REFERENCES public.content_queue_items(id) ON DELETE SET NULL,
  -- Kept alongside item_id on purpose. The example can be deleted, and a
  -- standard that silently becomes "no standard" because a row was cleaned up
  -- is worse than one that says what it was.
  item_title   text,
  note         text,
  set_by       text NOT NULL,
  set_at       timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.content_queue_standards IS
  'What good looks like for a channel, named by pointing at a real approved piece rather than describing it. One row per channel, replaced when the answer changes.';

CREATE TABLE IF NOT EXISTS public.content_queue_slots (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  planned_for  date NOT NULL,
  channel      text NOT NULL,
  audience_tag text,
  purpose      text,
  filled_by    uuid REFERENCES public.content_queue_items(id) ON DELETE SET NULL,
  created_by   text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.content_queue_slots IS
  'An intention with no work attached yet: a day, a channel, an audience and what it is for. Kristin plans the shape of a month; Nora briefs into the open slots.';

CREATE INDEX IF NOT EXISTS content_queue_slots_month_idx
  ON public.content_queue_slots (planned_for);

-- One piece cannot fill two slots. Without this a brief written twice against
-- the same intention shows the month as fuller than it is, which is the exact
-- failure a plan is supposed to prevent.
CREATE UNIQUE INDEX IF NOT EXISTS content_queue_slots_filled_once_idx
  ON public.content_queue_slots (filled_by)
  WHERE filled_by IS NOT NULL;

COMMIT;
