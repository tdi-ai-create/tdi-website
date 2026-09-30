# Browser pass

## What this change touches

Two screens. `app/tdi-admin/leadership/[id]/page.tsx` gains a smart action card
on a partnership whose observation day is within 30 days, linking into the new
School Visit Prep SOP. `app/tdi-admin/docs/page.tsx` gains `?doc=` support so
that link opens the SOP directly instead of landing on the Admin Guide.

## What I did

- Opened: https://tdi-website-git-visit-prep-sop-raes-projects-94e0788c.vercel.app/tdi-admin/leadership/02f4b713-f258-4dff-a526-91565ff9a8e6
- Saw: "This page is unavailable", "Routing Middleware for this page temporarily
  failed", and "500 MIDDLEWARE_INVOCATION_FAILED" with id
  "cle1:cle1::p6jrt-1790696120345-916d56ee931f". The preview build cannot be
  signed in to or exercised at all. This is the known open preview-deployment
  failure, still unfixed as of today.

So the pass below is the before state, captured on production where the code is
not yet deployed, plus a verification deferred to after deploy.

### Before state, production, signed in as Rae

- Opened: https://www.teachersdeserveit.com/tdi-admin/leadership/02f4b713-f258-4dff-a526-91565ff9a8e6
  (Saunemin CCSD #438, chosen because it is the only partnership with an
  observation day inside 30 days)
- Saw: header "Saunemin CCSD #438", "ACCELERATE", "Jul 2026 to Jul 2027", and the
  metric row "Last Login 13d", "Items Due 7", "Provisioned 18/23",
  "Hub Login 44%", "Last Contact 6d".
- Correction, and worth recording because it nearly became a bug report. On the
  first look this row read "Provisioned 0/23" and "Hub Login 50%", and I took it
  for a reporting fault. It is not. Those two metrics come from
  `/api/partnerships/[id]/hub-stats`, which the page fetches as non-blocking
  secondary data, so the first paint shows 0 and the stored fallback percentage
  before the response lands. Waiting six seconds gives 18/23 and 44%, which match
  the endpoint exactly. **Screenshotting this page immediately after navigation
  reads a loading state as a number.**
- Saw: exactly two smart action cards, "Prep for Next Call" and "2 overdue items".
  No visit prep card, which is correct because this change is not deployed here.
  Two cards also means the new one lands third and pushes nothing off the
  four-card cap on this partnership.
- Pressed: nothing that writes. This is a live partnership with 7 open action
  items and a real client.
- Saw: the contract line item "On-Campus Observation & Feedback Visit 1 (50% off)"
  planned for Oct 7, and a completed system action "Confirm observation day
  schedule with TDI team" dated "Sep 16, 2026, 4:18 PM". So the trigger condition
  is real data on a real partnership, 8 days out, not a fixture.
- Saw: the open flag "Principal has still not logged in after 21 days. Immediate
  follow up required.", "first raised 8/28/2026, open 32 days".

### The trigger condition, verified against the database rather than the screen

Queried `timeline_events` for `event_type = 'observation'` with a future
`event_date`. Four rows: Saunemin 2026-10-07 (8 days), Glen Ellyn 2026-11-05
(37 days), St. Peter Chanel 2026-11-30 (62 days), Saunemin 2027-03-03 (155 days).
Only the first is inside 30 days, so exactly one partnership should show the card
today, and it should render the urgent variant because 8 is under the 14 day
threshold.

## What I did not press

I did not press anything that writes on a live partnership. No note posted, no
action item closed, no timeline event created. Saunemin has a real visit in 8
days and I am not putting test data on it.

- Deferred: the preview deployment returns 500 on every route, so the new card
  and the `?doc=` deep link cannot be exercised before merge.
- Verify after deploy: open
  https://www.teachersdeserveit.com/tdi-admin/leadership/02f4b713-f258-4dff-a526-91565ff9a8e6
  and confirm a third card reading "Open visit prep SOP" with the description
  "Observation day in N days", in the urgent style. Press it and confirm it opens
  /tdi-admin/docs?doc=visit-prep-sop showing "School Visit Prep SOP" rather than
  the Admin Guide. Then open the Glen Ellyn partnership and confirm no card
  appears yet, because that visit is 37 days out.

## Verified on production after deploy, 30 September 2026

Deploy of #660 reached production. A hard reload was needed: the API route served
the new SOP immediately while the browser still held the previous client bundle,
so the first look showed the old sidebar with no School Visit Prep entry. Worth
knowing before reporting a deploy as broken.

- Opened: https://www.teachersdeserveit.com/tdi-admin/leadership/02f4b713-f258-4dff-a526-91565ff9a8e6
- Saw: a third card, first in the row, in the urgent red style, reading
  "Open visit prep SOP" and "Observation day in 7 days. Ask for the roster,
  building addresses and school day times." 7 days is correct for 30 September
  against the 7 October visit, and under the 14 day urgent threshold.
- Saw: it did not displace anything. All three cards render, "Prep for Next Call"
  and "2 overdue items" both still present.
- Pressed: the "Open visit prep SOP" card.
- Saw: a new tab at /tdi-admin/docs?doc=visit-prep-sop showing "School Visit Prep
  SOP" with "School Visit Prep" highlighted in the Partnerships list, not the
  Admin Guide. The deep link works.

Negative control:

- Opened: https://www.teachersdeserveit.com/tdi-admin/leadership/6884a5e5-f934-4f92-a348-839bdae1dd00
- Saw: "Glen Ellyn School District 41" with one card only, "Schedule check-in",
  "Principal hasn't logged in for 46 days." No visit prep card, which is correct:
  that observation day is 5 November, 36 days out and outside the 30 day window.

## A thing this pass found

Saunemin's observation day is 7 October, 8 days away. No prep email has gone to
the school, the SOP this change adds says to send it around three weeks ahead,
and a note on 23 September flagged that 7 October is also when Patrick Berry has
a booked Lenox call, which was never resolved. The card being built here would
have surfaced this a fortnight ago.
