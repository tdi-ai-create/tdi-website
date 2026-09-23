-- When a piece goes out, per channel.
--
-- Rae asked why approving something does not put it on a day. The answer was
-- that nothing knew what the right day would be: approve set approved_at and
-- stopped, and the calendar places by date, so approved work with no date fell
-- into the "No day yet" rail and sat there.
--
-- Her rule, in her words: "substack is every m, w, f, and only 3 hub content
-- pieces a day."
--
-- The Hub half already exists and runs. lib/hub/release-schedule.ts caps Hub
-- publishing at three a day on weekdays and hands approved Quick Wins the next
-- open slot; Rae set that on 6 September 2026. It is deliberately NOT copied in
-- here, because two tables describing one rule is how they drift apart. This
-- table covers the marketing queue only.
--
-- A channel with no row here gets no automatic date, which is exactly today's
-- behaviour. That keeps this additive: nothing changes for a channel until
-- somebody says what its rhythm is.

create table if not exists content_queue_cadence (
  channel     text primary key,
  -- ISO weekday numbers, 1 = Monday through 7 = Sunday, matching extract(isodow).
  weekdays    smallint[] not null,
  daily_cap   integer not null default 1,
  note        text,
  updated_at  timestamptz not null default now(),
  -- Containment rather than a subquery: a check constraint may not contain one.
  constraint weekdays_are_real check (
    array_length(weekdays, 1) between 1 and 7
    and weekdays <@ '{1,2,3,4,5,6,7}'::smallint[]
  ),
  constraint cap_is_positive check (daily_cap >= 1)
);

alter table content_queue_cadence enable row level security;

drop policy if exists "service role manages cadence" on content_queue_cadence;
create policy "service role manages cadence"
  on content_queue_cadence for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Only what Rae actually specified. Seeding a guess for LinkedIn or Instagram
-- would put work on days nobody chose, and the calendar would then look
-- decided when it is not.
insert into content_queue_cadence (channel, weekdays, daily_cap, note) values
  ('substack', '{1,3,5}', 1, 'Monday, Wednesday, Friday. Rae, 22 September 2026.')
on conflict (channel) do update
  set weekdays = excluded.weekdays,
      daily_cap = excluded.daily_cap,
      note = excluded.note,
      updated_at = now();

-- Ships dark. Approve keeps behaving exactly as it does today until this is
-- flipped, which is one update and needs no deploy in either direction.
insert into hub_config (key, value) values ('content_cadence_enabled', 'false')
on conflict (key) do nothing;
