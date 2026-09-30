-- 164: Visit prep. Somewhere to put what a school sends back before an
-- observation day, on the record that already represents the visit.
--
-- Why this exists. The School Visit Prep SOP asks a school for a roster, bell
-- times and a schedule three weeks before the day. Those answers currently
-- arrive in Rae's or Bella's inbox and stop there. The schedule is a PDF in a
-- reply, the roster is a paste in an email, and neither is attached to
-- anything. On the morning of the visit somebody goes looking through Gmail.
--
-- Why it goes on observation_visits rather than a new table. That row already
-- exists to represent one visit, already holds uploaded files in the
-- partnership-files bucket, and is already what the notepad photos and Love
-- Notes hang off afterwards. The only problem was timing: the row was created
-- at upload time, which is after the visit, so nothing represented a visit that
-- had not happened yet. These columns let the same row start at scheduling and
-- run through to Love Notes sent. One visit, one row, cradle to grave.
--
-- timeline_event_id is the link back to the calendar. A scheduled observation
-- lives in timeline_events with event_type 'observation' and an event_date, and
-- that is what the 30 day prep card on the partnership page already reads. This
-- column is what lets a prep row be found again for the same visit rather than
-- a second one being created every time somebody opens the panel.
--
-- prep_token exists so a reminder email can carry a one click "done" link. It
-- follows the creator unpause pattern: a random value on the row, checked
-- server side, cleared on use. Deliberately not a signed payload, because the
-- worst case for a leaked token is that a visit gets marked prepared early,
-- which a person can undo.
--
-- prep_reminder_sent_at is the anti-nag. The reminder is sent once and then
-- this is stamped. Every status email in this system that re-fires daily with
-- an escalating counter has been ignored rather than acted on, and the Hub
-- Content Health check is on its fourth consecutive unread day proving it.
--
-- Everything here is nullable with no constraints, so it is inert until the
-- code that reads it is deployed. Nothing existing selects these columns and
-- observation_visits currently holds zero rows.

alter table public.observation_visits
  add column if not exists timeline_event_id      uuid,
  add column if not exists prep_notes             text,
  add column if not exists prep_files             jsonb default '[]'::jsonb,
  add column if not exists prep_done_at           timestamptz,
  add column if not exists prep_token             text,
  add column if not exists prep_reminder_sent_at  timestamptz;

-- Find the prep row for a scheduled visit without scanning.
create index if not exists observation_visits_timeline_event_id_idx
  on public.observation_visits (timeline_event_id);

-- Token lookup on the done link. Partial, because almost every row has no
-- live token: it is cleared once used and never set on historical visits.
create index if not exists observation_visits_prep_token_idx
  on public.observation_visits (prep_token)
  where prep_token is not null;

comment on column public.observation_visits.timeline_event_id is
  'The scheduled timeline_events row this visit came from. Null for visits created from a notepad upload with no prior calendar entry.';
comment on column public.observation_visits.prep_done_at is
  'Set when someone confirms the prep is handled, from the panel or the emailed link. Suppresses the reminder and the partnership card.';
