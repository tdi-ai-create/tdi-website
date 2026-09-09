-- A send that Resend refused to make.
--
-- Resend keeps a suppression list. Sending to an address on it returns 200 with
-- a real message id and delivers nothing, and fires no webhook, because nothing
-- was ever attempted. Forty addresses were on ours when this was found on
-- 8 September 2026, eleven of them a single district.
--
-- Kept separate from bounced_at because the two need opposite responses. A
-- bounce means the address is wrong. A suppression means the address may be
-- fine and Resend is still refusing, so somebody has to clear it there.

alter table creator_email_log
  add column if not exists suppressed_at timestamptz,
  add column if not exists status_checked_at timestamptz;

-- Drives the sweep: sends that carry an id but have never reported anything.
create index if not exists creator_email_log_awaiting_status_idx
  on creator_email_log (sent_at)
  where provider_id is not null
    and last_event is null
    and status_checked_at is null
    and dry_run = false;

comment on column creator_email_log.suppressed_at is
  'Resend refused to send to this address, so nothing was attempted and no delivery event will ever arrive. Different from a bounce: a bounce was tried and rejected.';
comment on column creator_email_log.status_checked_at is
  'When we last asked Resend directly what happened to this message. Backstop for the cases a webhook cannot report.';
