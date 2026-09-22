# Browser pass

## What this change touches

The sales board at `/tdi-admin/sales`. Two things: the order of the Outreach
Queue tab, and the pipeline figure in the sticky top bar.

## What I did

- Opened: https://www.teachersdeserveit.com/tdi-admin/sales, signed in as Rae.
  Unlike the 17 and 21 September passes, this one had real rows in front of it.
- Saw: "$1.20M pipeline" over "166 active", with "1164 muck" / "21 heavy" and
  "1148 you" / "16 Bella" across the top bar. 166 leads loaded, so the board
  was populated rather than empty.
- Saw: muck pills rendering on the cards. Sharon City SD reads "$2,500 PRED"
  and "$1K factored" with a 16 pill; Monmouth County reads "$6,200 PRED" and
  "$3K factored" with a 22 pill. Stage headers carry their own totals, e.g.
  Engaged "$56K · $20K factored" over 44 leads.
- Saw: "WeGo D94" now sitting under the WARM group in Engaged, which is the
  heat correction written to the CRM earlier today.
- Pressed: the "Outreach Queue" tab.
- Saw: the subtitle reads "160 leads needing outreach, sorted by priority.
  Muck, staleness and value." That is the formula this change replaces.
- Saw: the top four rows read "$18K", "$18K", "$18K" on their money lines
  (MSB Private School, Sam Chizauskie, Maplebrook). Those are pre-restructure
  imports. Ponaganset at rank 1 shows "$18K" here while its own kanban card
  shows "$2,500 PRED", a 7x disagreement between two views of one lead.
- Saw: the order running 68d, 68d, 68d, 141d, 95d, 141d, 141d down the page.
  Staleness, not value per point.
- Saw: "8 muck" on Maplebrook ranked above "20 muck" on Sam Chizauskie in one
  place and below it in another, because muck contributes at most 30 points
  against staleness at 60.
- Opened: the preview build at
  teachersdeserveit-git-fix-outreac-dca797-raes-projects-94e0788c.vercel.app
- Saw: "Loading admin portal..." for 5 seconds, then a redirect to
  "/tdi-admin/login". The admin session does not carry to a preview domain. I
  did not sign in.

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
