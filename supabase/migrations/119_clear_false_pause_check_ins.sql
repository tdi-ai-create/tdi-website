-- ---------------------------------------------------------------------------
-- Undo check-ins that never happened
--
-- app/api/cron/pause-check-ins ran on 11 Aug 2026 for six creators who had been
-- paused since 12 May. It logged a check_in_sent event and stamped
-- last_check_in_at, but the email itself had never been written, so nothing was
-- delivered. Because the cron treats that stamp as "recently contacted", it
-- pushed their next attempt out to 9 Nov, which would have taken them to
-- roughly six months of silence after pausing.
--
-- The route now only stamps on a send that actually succeeded. This clears the
-- false stamps so those six become eligible again on the next run and receive a
-- real check-in with a working reactivation link.
--
-- Scoped to the exact date of the bad run so a genuine future check-in is never
-- caught by this.
-- ---------------------------------------------------------------------------

update creators
   set last_check_in_at = null
 where lifecycle_state = 'paused'
   and last_check_in_at::date = date '2026-08-11';

-- The history rows stay. They are an accurate record that the system believed
-- it checked in, which is worth keeping, but they are annotated so nobody
-- later reads them as evidence a creator was contacted.
update creator_pause_history
   set notes = 'No email was sent. The check-in template did not exist at the time; stamp cleared by migration 119.'
 where event_type = 'check_in_sent'
   and event_at::date = date '2026-08-11';
