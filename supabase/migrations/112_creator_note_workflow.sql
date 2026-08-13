-- ---------------------------------------------------------------------------
-- Creator note workflow: internal reminders, scheduled sends, typed rejections
--
-- Three gaps in the check-in note queue this closes:
--   1. No place to document why a note is being held, so context lived in
--      someone's head and was lost when the draft was actioned.
--   2. Approval and sending were the same event. Approving a note at 9pm on a
--      Friday sent it at 9pm on a Friday.
--   3. Rejections recorded nothing. A draft rejected because the wording was
--      wrong looked identical to one rejected because the creator had paused,
--      so Anne Marie could not learn from either.
-- ---------------------------------------------------------------------------

-- Internal reminders. Set on a note with visible_to_creator = false, which is
-- how TDI-only documentation is already stored, so these ride along on the
-- existing internal notes rather than needing a parallel table.
alter table creator_notes
  add column if not exists reminder_at date,
  add column if not exists reminder_completed_at timestamptz,
  add column if not exists reminder_completed_by text;

-- Scheduled sends. draft_status moves to 'scheduled' and the note stays
-- invisible until the cron publishes it at scheduled_send_at.
alter table creator_notes
  add column if not exists scheduled_send_at timestamptz,
  add column if not exists scheduled_by text;

-- Typed rejections, so "the note was wrong" and "we decided not to reach out"
-- are distinguishable when reviewing what Anne Marie is producing.
alter table creator_notes
  add column if not exists rejection_category text,
  add column if not exists rejection_reason text,
  add column if not exists rejected_by text,
  add column if not exists rejected_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'creator_notes_rejection_category_check'
  ) then
    alter table creator_notes
      add constraint creator_notes_rejection_category_check
      check (rejection_category is null or rejection_category in (
        'note_content',    -- wording, tone, or facts were wrong
        'system_decision', -- note was fine, we chose not to send
        'creator_state',   -- paused, withdrawn, or otherwise should not be contacted
        'already_handled', -- someone already reached out
        'other'
      ));
  end if;
end $$;

-- Cron lookup: due scheduled sends. Partial so it stays small.
create index if not exists idx_creator_notes_scheduled_send
  on creator_notes (scheduled_send_at)
  where draft_status = 'scheduled';

-- Action Center lookup: open reminders that have come due.
create index if not exists idx_creator_notes_open_reminders
  on creator_notes (reminder_at)
  where reminder_at is not null and reminder_completed_at is null;

-- Queue lookup: drafts awaiting review.
create index if not exists idx_creator_notes_draft_status
  on creator_notes (draft_status, created_at desc);

comment on column creator_notes.reminder_at is
  'Internal follow-up date for TDI staff. Never surfaced to the creator.';
comment on column creator_notes.scheduled_send_at is
  'When an approved-but-held note should publish. Set with draft_status = scheduled.';
comment on column creator_notes.rejection_category is
  'Why a draft was rejected, so note-quality problems are separable from business decisions.';
