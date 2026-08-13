-- Creator Studio email automation repair.
--
-- Two schema gaps were silently disabling automated creator email:
--
-- 1. creator_reminder_log was never created.
--    app/api/cron/creator-reminders/route.ts reads this table to decide whether
--    a countdown reminder has already gone out, and writes to it after a send.
--    to_regclass('public.creator_reminder_log') returned null, so every read
--    failed with 42703/PGRST205. The route only forgives PGRST116 ("no rows"),
--    so every creator hit `continue` and the cron has never sent a single email
--    since it was written. Creating the table is what turns it back on.
--
-- 2. There is no record of when a creator actually used the portal.
--    app/api/cron/creator-reengagement/route.ts cancels a nudge sequence when
--    creators.updated_at is newer than the sequence start, treating that as
--    "the creator came back". But creators has a BEFORE UPDATE trigger
--    (creators_updated_at -> update_updated_at) that stamps updated_at on ANY
--    write, including admin edits and bulk scripts. A bulk write on
--    2026-07-19 19:17:02 touched 21 creators at once and cancelled the entire
--    July re-engagement cohort at step 1. Steps 2 through 6 have never fired.
--
--    No last_login / last_active / last_seen column exists anywhere in the
--    schema, so updated_at was standing in for a signal that was never
--    captured. This adds the real one.
--
-- Both changes are additive. No constraints are added to columns that existing
-- code does not already satisfy.

-- ---------------------------------------------------------------------------
-- 1. creator_reminder_log
-- ---------------------------------------------------------------------------

create table if not exists public.creator_reminder_log (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creators(id) on delete cascade,
  reminder_type text not null,
  target_date date not null,
  sent_at timestamptz not null default now()
);

-- The cron's dedupe key. Unique so a double-invocation cannot double-send:
-- the second insert conflicts instead of writing a duplicate row.
--
-- This also repairs a latent bug in the route's dedupe read. It used .single(),
-- which returns PGRST116 for BOTH "no rows" and "multiple rows". Without a
-- unique index, duplicate log rows would read back as "never sent" and the
-- reminder would resend on every run forever.
create unique index if not exists idx_creator_reminder_log_dedupe
  on public.creator_reminder_log (creator_id, reminder_type, target_date);

create index if not exists idx_creator_reminder_log_creator
  on public.creator_reminder_log (creator_id, sent_at desc);

alter table public.creator_reminder_log enable row level security;

-- Service role bypasses RLS, which is what the cron uses. This policy is for
-- admin reads from the portal, matching the pattern in migration 095.
drop policy if exists "Admin access to creator reminder log" on public.creator_reminder_log;
create policy "Admin access to creator reminder log"
  on public.creator_reminder_log
  for all
  using (
    exists (
      select 1 from public.admin_users
      where email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

comment on table public.creator_reminder_log is
  'One row per countdown reminder sent to a creator. Dedupe key for cron/creator-reminders.';

-- ---------------------------------------------------------------------------
-- 2. creators.last_portal_activity_at
-- ---------------------------------------------------------------------------

-- Added WITHOUT a default on purpose. `add column ... default now()` would
-- stamp every existing row with the migration timestamp, which would read as
-- "all 35 creators were active just now". That would cancel all 19 in-flight
-- re-engagement sequences on the next cron run and stop any new one from ever
-- starting. The column is added empty, backfilled from history below, and only
-- then given a default for future inserts.
alter table public.creators
  add column if not exists last_portal_activity_at timestamptz;

-- Backfill from the best signal we have for rows that predate this column.
-- updated_at is imperfect (it includes admin writes) but it is strictly better
-- than null, and seeding it keeps cron behavior continuous with today instead
-- of causing a step change on deploy. Verified against production before
-- writing this: with this seed, 0 sequences are wrongly cancelled and 0 new
-- sequences start.
--
-- The trigger must be disabled around this. creators_updated_at runs
-- unconditionally (NEW.updated_at = NOW()), so an unguarded backfill would
-- rewrite updated_at on every row to the migration time and destroy the very
-- history being read on the line below.
alter table public.creators disable trigger creators_updated_at;

update public.creators
   set last_portal_activity_at = coalesce(updated_at, created_at)
 where last_portal_activity_at is null;

alter table public.creators enable trigger creators_updated_at;

-- Future creators start "active as of now" rather than null, so the stall
-- query can filter on this column directly without a coalesce.
alter table public.creators
  alter column last_portal_activity_at set default now();

comment on column public.creators.last_portal_activity_at is
  'Last creator-initiated action in the Creator Portal (dashboard load, milestone submit, etc). Written by the portal, never by admin tooling. Re-engagement uses this instead of updated_at, which any admin write pollutes.';
