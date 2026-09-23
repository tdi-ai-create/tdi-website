# Browser pass

## What this change touches

The Paperclip content calendar plugin. Published work is now placed on the day
it went out in Central time rather than in UTC, and facebook is gone from the
channel picker when planning a slot.

## What I did

- Opened: https://paperclip-railway-template-production.up.railway.app/TEA/content-calendar
  signed in as Rae, after deploying the built bundle to the Railway volume and
  toggling the plugin off and on in Plugin Manager.
- Pressed: "Plan this month", then "Plan something" on 1 September.
- Saw: the Channel dropdown offers "Hub, Substack, Instagram, LinkedIn, Video,
  Email". Facebook is no longer offered. The strip above still reads
  "Facebook 4", so the four already published pieces keep their real label.
- Pressed: Cancel, then reloaded the board after deploying the timezone fix.
- Saw: "Rae Personal LinkedIn (founder voice): Why I started TDI" and
  "Team Facebook (community/teacher voice): Seasonal fall check-in" have both
  moved off 22 September onto 21 September. The 22nd is now empty. Those two
  published at 22:24 and 22:26 Central on the 21st, so the 22nd was never right.
- Saw: the board still reads "33 pieces on this month, cancelled work excluded",
  unchanged, so nothing fell off the calendar in the move.

## Checked without the browser

- `npx vitest run` exited 0, 34 tests, including four new ones for `localDay`
  built from the two real timestamps that were misplaced.
- `npx tsc --noEmit` exited 0 in the plugin.
- On the volume, `grep -c localDay` on the live bundle returns 4 and
  `grep -c PLANNABLE` returns 2.

## What I did not press

The trash control in Plugin Manager. Uninstalling cascades and deletes
`plugin_config`, which takes the calendar key with it. Disable and enable is the
only redeploy path.

## Claim tiers

- Measured: everything above.
- Worth knowing: Plugin Manager still displays v0.8.1 after a disable and enable
  even with 0.8.2 on disk, so the recorded version is not refreshed by the
  toggle on this build. The bundle itself is served fresh, which is what the
  two observations above demonstrate.
