-- 132: let a human clear an integrity finding that has been dealt with
--
-- The integrity panel reports records that contradict themselves. Some of those
-- contradictions are permanent history and can never resolve on their own.
--
-- Dr. Stephanie Nardi is the example. She was closed by the agreement gate on
-- 2026-08-25 despite having submitted a blog draft in March. Both facts live in
-- creator_notes forever, so the check fires forever, no matter what anyone does
-- about it. Once Bella has written to her the row is finished business, but it
-- would sit on the Creator Command Center permanently.
--
-- A panel with a row that never clears teaches people to skim past the panel,
-- which is the exact failure it was built to prevent. So a person can mark one
-- handled, with their name and their reason attached.
--
-- Deliberately NOT a delete or a flag on the source data. The contradiction
-- stays true; what changes is that someone has looked at it. Dismissals are
-- shown as a count on the panel and can be undone, so nothing becomes invisible.
--
-- Only per-creator findings are dismissible. System-level ones, currently
-- "milestones completed with no date", are aggregates that clear when the data
-- is fixed, so there is nothing to acknowledge.

create table if not exists public.creator_integrity_dismissals (
  id            uuid primary key default gen_random_uuid(),
  check_id      text        not null,
  creator_id    uuid        not null references public.creators(id) on delete cascade,
  reason        text,
  dismissed_by  text        not null,
  dismissed_at  timestamptz not null default now()
);

-- One dismissal per finding. Re-dismissing updates the existing row rather than
-- stacking duplicates, so the panel count stays honest.
create unique index if not exists creator_integrity_dismissals_check_creator_key
  on public.creator_integrity_dismissals (check_id, creator_id);

create index if not exists creator_integrity_dismissals_creator_idx
  on public.creator_integrity_dismissals (creator_id);

comment on table  public.creator_integrity_dismissals            is 'A human has looked at an integrity finding and marked it handled. The underlying contradiction is untouched.';
comment on column public.creator_integrity_dismissals.check_id   is 'Matches IntegrityCheckId in lib/creator-integrity.ts, for example closed_but_submitted.';
comment on column public.creator_integrity_dismissals.reason     is 'Why it was cleared. Optional, but it is the only record of the judgement call.';
comment on column public.creator_integrity_dismissals.dismissed_by is 'Admin email. Who to ask if the dismissal looks wrong later.';
