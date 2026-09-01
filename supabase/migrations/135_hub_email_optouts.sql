-- Somewhere for a Hub member to say stop.
--
-- The Hub has 102,091 member rows and no opt out of any kind: no table, no
-- column, no route. That has been survivable only because nothing recurring has
-- ever been sent to them. The monthly Hub issue changes that, and a recurring
-- email to people who cannot leave is not something to ship.
--
-- Keyed on email rather than user_id on purpose. Someone who opts out and later
-- has their profile deleted and recreated must stay opted out; tying the record
-- to a row that can disappear would quietly resubscribe them.

create table if not exists hub_email_optouts (
  email         text primary key,
  user_id       uuid,
  email_type    text not null default 'all',
  opted_out_at  timestamptz not null default now(),
  source        text
);

comment on table hub_email_optouts is
  'Hub members who have asked not to receive email. Keyed on address so it survives profile deletion.';
comment on column hub_email_optouts.email_type is
  'Which stream they left. "all" covers everything; a specific type leaves the rest intact.';

create index if not exists hub_email_optouts_user_idx on hub_email_optouts (user_id);
