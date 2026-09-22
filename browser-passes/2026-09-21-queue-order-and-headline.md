# Browser pass

## What this change touches

The sales board at `/tdi-admin/sales`. Two things: the order of the Outreach
Queue tab, and the pipeline figure in the sticky top bar.

## What I did

- Opened: https://www.teachersdeserveit.com/tdi-admin/sales, signed in as Rae.
  The board loaded 166 active leads, so unlike the 17 and 21 September passes
  this one had real rows in front of it.
- Saw, on the Pipeline tab: "$1.20M pipeline / 166 active", "1164 muck / 21
  heavy", "1148 you / 16 Bella". Muck pills render on the cards. Sharon City SD
  reads "$2,500 PRED / $1K factored" with a 16 pill, Monmouth County "$6,200
  PRED / $3K factored" with a 22 pill. WeGo D94 now sits under WARM in Engaged,
  which is the heat correction made today.
- Pressed: the "Outreach Queue" tab.
- Saw the three defects this change exists to fix, on screen, in the live order:
  1. The top four leads read $18K, $18K, $18K on their money line. Those are the
     pre-restructure imports. Ponaganset is a Pulse and its own card shows
     $2,500 PRED, so the queue and the card disagree by 7x.
  2. The order runs 68d, 68d, 68d, 141d, 95d, 141d, 141d. Staleness, not value
     per point.
  3. An 8 muck lead (Maplebrook) ranks above a 20 muck lead (Sam Chizauskie)
     only sometimes, and below it here, because muck is a 30 point term against
     staleness at 60. The subtitle says so out loud: "sorted by priority. Muck,
     staleness and value."
- Opened: the preview build at
  teachersdeserveit-git-fix-outreac-dca797-raes-projects-94e0788c.vercel.app
- Saw: it redirects to `/tdi-admin/login`. The admin session does not carry to a
  preview domain. I did not sign in.

## What I could not verify

The fixed order and the corrected headline, because the only environment with
rows is production and this change is not deployed there yet. This is the same
condition the 17 and 21 September passes recorded, for the same reason.

- Deferred: preview redirects to login, production has not got the change yet.
- Verify after deploy, on https://www.teachersdeserveit.com/tdi-admin/sales:
  1. Outreach Queue subtitle should read "Ordered by deal value per muck point"
     rather than "Muck, staleness and value".
  2. The top of the queue should carry a $/pt pill and should no longer be three
     $18K rows. Expect Blueprints and Focus leads at the top.
  3. A "Cannot be ranked yet (N)" group should appear below the ranked list,
     with roughly 85 leads in it and a line explaining that no offering is
     recorded.
  4. Money lines in the queue should carry the PRED marker and match the kanban
     card for the same lead. Ponaganset should read $2,500, not $18K.
  5. The top bar pipeline figure should fall from $1.20M to roughly $0.6M, and
     should show "N not valued" beside the active count.

## What I did not press

Nothing that writes. No Draft Email button, since that posts a note to the
opportunity and opens a mail client. No inline value editor.
