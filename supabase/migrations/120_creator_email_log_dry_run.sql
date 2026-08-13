-- ---------------------------------------------------------------------------
-- Record intended sends, not just real ones
--
-- Creator re-engagement sends were frozen on 13 Aug 2026 after an audit found
-- the stall trigger was reading creators.updated_at rather than anything the
-- creator did. A bulk edit on 19 Jul aged past the 15 day threshold and
-- enrolled 19 creators who had not gone quiet at all.
--
-- While sends are frozen the cron still needs to run its full scan so the new
-- signal can be checked against the old one before anything is delivered. This
-- column lets those intended sends live in the same table as real ones, so the
-- admin Re-engagement tab can show "would have sent" beside "did send" without
-- a parallel table and without polluting the real send history.
--
-- Nullable with a default, no constraint, so it is safe to apply ahead of the
-- code that writes it.
-- ---------------------------------------------------------------------------

alter table creator_email_log
  add column if not exists dry_run boolean not null default false;

comment on column creator_email_log.dry_run is
  'True when the send was suppressed by REENGAGEMENT_SENDS_ENABLED and only recorded. No email left the building.';

-- The dry-run queue is read by recency, filtered to intended sends.
create index if not exists idx_creator_email_log_dry_run
  on creator_email_log (sent_at desc)
  where dry_run = true;
