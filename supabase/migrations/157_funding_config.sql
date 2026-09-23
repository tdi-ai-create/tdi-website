-- Runtime switches for the funding portal.
--
-- The Hub has hub_config and Creator Studio has creator_config. Funding had
-- nothing, so every change to those screens was all or nothing at deploy time
-- and rolling one back meant another deploy.
--
-- This exists because the funding portal is being rebuilt into three screens,
-- a calendar, a schools list and a school page, and the old pages have to keep
-- working the whole time. Both live at once, and Rae turns the new ones on once
-- she has clicked them.
--
-- Arm it:     update funding_config set enabled = true  where key = 'new_pages';
-- Roll back:  update funding_config set enabled = false where key = 'new_pages';
--
-- Rollback is that one statement. No deploy, no build, no waiting.

create table if not exists funding_config (
  key         text primary key,
  enabled     boolean not null default false,
  note        text,
  updated_at  timestamptz not null default now()
);

alter table funding_config enable row level security;

-- Read through the service role only, the same as creator_config. Nothing in a
-- browser needs to know these, and a flag the anon key can read is a flag an
-- anon key can be tricked into reporting wrongly.
drop policy if exists "Service role full access on funding_config" on funding_config;
create policy "Service role full access on funding_config"
  on funding_config for all
  using (true) with check (true);

insert into funding_config (key, enabled, note)
values (
  'new_pages',
  false,
  'The rebuilt funding screens: a month calendar, a partnership schools list, and a school page holding its log and its profile. OFF means the existing portal is served and the new routes answer 404, so this is safe to deploy long before the screens are finished. Turning it ON swaps the navigation and exposes the new routes. The old pages are not deleted until every control they hold exists in the new ones.'
)
on conflict (key) do nothing;
