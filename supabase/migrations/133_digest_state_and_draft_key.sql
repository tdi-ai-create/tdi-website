-- Two fixes for notification noise.
--
-- 1. digest_state
--    The daily digests post the same message every day. Grant work for today
--    was byte-identical on 28, 29 and 30 August apart from a day counter, and
--    the creator "waiting on TDI" post named the same person for seventeen
--    consecutive days. Repetition is not escalation: it teaches people to
--    ignore the channel, which is the opposite of what an alert is for.
--
--    This table remembers what each digest last said, so a digest can stay
--    quiet when nothing has changed and still post a weekly heartbeat so it
--    never looks broken.
--
-- 2. funding_email_log.source_item_key
--    Follow-up drafts deduplicate on subject, but the subject changes at every
--    escalation rung ("Heads up on...", "Following up:...", "Can you help
--    with...?"). So one unanswered question produced four separate drafts and
--    the queue read as eight items of work when it was really about two.
--    The key is stable across rungs, so a rung can update the open draft
--    instead of adding another.

create table if not exists digest_state (
  key             text primary key,
  content_hash    text        not null,
  last_posted_at  timestamptz not null default now(),
  last_content    text,
  suppressed_runs integer     not null default 0,
  updated_at      timestamptz not null default now()
);

comment on table digest_state is
  'Last posted content per recurring digest, so an unchanged digest can stay quiet.';
comment on column digest_state.suppressed_runs is
  'How many times in a row this digest was skipped for being unchanged. Reset on post.';

alter table funding_email_log
  add column if not exists source_item_key text;

create index if not exists funding_email_log_source_item_key_idx
  on funding_email_log (source_item_key)
  where status = 'draft';

comment on column funding_email_log.source_item_key is
  'Stable identity of the underlying task, unchanged across escalation rungs. One open draft per key.';
