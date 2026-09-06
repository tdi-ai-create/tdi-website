-- The nightly board sweep, shipped dark.
--
-- The job runs whether or not this row exists: it compares every live board
-- against the step engine and reports what has drifted. What the flag controls
-- is the one thing that touches a creator, which is whether it may repair a
-- board it found drifted.
--
-- creatorFlag() treats a missing row, a failed read and an explicit false all
-- as off, so the code is safe before this ever runs. The row exists so that
-- turning the sweep on is one statement rather than a deploy, and so that the
-- reason it is off is written down next to the switch.
--
-- Arm it:     update creator_config set enabled = true  where key = 'board_sweep';
-- Roll back:  update creator_config set enabled = false where key = 'board_sweep';
--
-- Dry run first, which needs no flag and writes nothing either way:
--   curl -H "Authorization: Bearer $CRON_SECRET" \
--     "https://www.teachersdeserveit.com/api/cron/creator-board-sweep?dryRun=1"

insert into creator_config (key, enabled, note)
values (
  'board_sweep',
  false,
  'Nightly board sweep, /api/cron/creator-board-sweep at 08:00 UTC. OFF means the job still runs, still compares every live board against the engine, and still reports, but writes nothing. Turning it ON lets it repair a drifted board. Rollback is this row back to false, no deploy.'
)
on conflict (key) do nothing;
