-- Runs against the LEARNING HUB project (asdwpkcsbcnpknklchdq), not the creator portal.
--
-- staff_members.hub_login_date is read in 10+ places (partner dashboard, 7 crons,
-- the admin briefing, the KPI updater) and written nowhere, so every leader-facing
-- surface reports 0 educators logged in regardless of reality.
--
-- The truth lives in auth.users.last_sign_in_at, which PostgREST cannot reach.
-- This exposes just the two columns a sync job needs, to the service role only.

create or replace view public.hub_user_last_login
with (security_invoker = true) as
select
  u.id           as user_id,
  lower(u.email) as email,
  u.last_sign_in_at
from auth.users u
where u.email is not null;

comment on view public.hub_user_last_login is
  'Service-role only. Feeds the sync that populates staff_members.hub_login_date in the creator portal.';

-- No anon/authenticated access. Emails must not be readable from the browser.
revoke all on public.hub_user_last_login from anon, authenticated;
grant select on public.hub_user_last_login to service_role;
