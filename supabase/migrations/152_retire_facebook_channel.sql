-- Retire facebook as a content destination.
--
-- Rae, 22 September 2026: "there is NO FACEBOOK Group anymore for TDI, this
-- should be removed everywhere."
--
-- `content_queue_blocked_terms` already existed and already carried a
-- "Facebook Group" row. It did not stop four posts going out to the group,
-- because that guard reads the COPY and nothing has ever read the CHANNEL. A
-- post written for a dead destination passes every gate as long as nobody
-- types the phrase, which is exactly what happened: the piece published at
-- 03:26 UTC on 22 Sep opens "I'll go first" and never names the group.
--
-- So this is the missing half: a destination can be retired, not just a word.
-- Table-driven for the same reason the terms are, so a channel can come back
-- without a deploy if Rae ever restarts one.

create table if not exists content_queue_blocked_channels (
  channel     text primary key,
  reason      text not null,
  blocked_at  timestamptz not null default now()
);

alter table content_queue_blocked_channels enable row level security;

-- Service role only, same as the rest of the queue. No client reads this.
drop policy if exists "service role manages blocked channels" on content_queue_blocked_channels;
create policy "service role manages blocked channels"
  on content_queue_blocked_channels for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

insert into content_queue_blocked_channels (channel, reason) values
  ('facebook', 'retired 22 Sep 2026. TDI no longer runs a Facebook group or community, so there is no audience at this destination. Send people to the Hub, teachersdeserveit.com/hub, or a quote request.')
on conflict (channel) do update set reason = excluded.reason;
