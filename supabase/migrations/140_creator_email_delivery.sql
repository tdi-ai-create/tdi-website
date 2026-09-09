-- What happened to a creator email after we handed it to Resend.
--
-- creator_email_log has recorded that we sent, and never what happened next.
-- So "we emailed them" has never meant "it arrived", and nine creators have
-- looked for months like they were ignoring us when nobody has ever checked
-- whether a single message reached them. Three of the eight silent addresses
-- are on district domains where filtering is aggressive.
--
-- Column names deliberately match billing_outbox, which already tracks exactly
-- this for invoices. Same question, same words, one webhook serving both.

alter table creator_email_log
  add column if not exists provider_id    text,
  add column if not exists delivered_at   timestamptz,
  add column if not exists bounced_at     timestamptz,
  add column if not exists bounce_reason  text,
  add column if not exists opened_at      timestamptz,
  add column if not exists complained_at  timestamptz,
  add column if not exists last_event     text,
  add column if not exists last_event_at  timestamptz;

-- The webhook looks a message up by the id Resend gave us at send time. Without
-- this index that is a sequential scan on every delivery event.
create index if not exists creator_email_log_provider_id_idx
  on creator_email_log (provider_id)
  where provider_id is not null;

-- Finding the silence: everyone we wrote to who never produced an outcome.
create index if not exists creator_email_log_delivery_gap_idx
  on creator_email_log (sent_at)
  where delivered_at is null and bounced_at is null and dry_run = false;

comment on column creator_email_log.provider_id is
  'Resend message id captured at send time. Null means the send site did not capture it, so no delivery outcome can ever be matched to this row.';
comment on column creator_email_log.last_event is
  'Most recent Resend event for this message. Null on a real send older than a few minutes means delivery tracking is not reaching us.';
