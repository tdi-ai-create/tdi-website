# Browser pass

## What this change touches

The trend arrow on "What your team is working on". It is withheld entirely when
either 30 day half of the comparison contains an organised event, and the legend
says why instead of leaving a silent gap.

## What I did

- Ran: `npm run check:popularity`, which replays real activity for every live
  partnership through the exported rules.
- Saw: "Directions: 33 up, 5 down, 1 steady, 16 no claim", against "43 up, 11
  down, 1 steady, 0 no claim" before this change. Two schools now withhold
  arrows entirely, addison-sd4 and st-mary-catholic-school.
- Opened: http://localhost:3217/partners/addison-sd4
- Pressed: the close control on the "Welcome to Your Dashboard" modal.
- Pressed: the "2026-2027" tab, badged Live.
- Queried: `GET /api/partners/dashboard/1e2ba852-dca5-49f1-b9dc-654443f5b2cd`
  against the running dev server.
- Saw: `trendComparable: false`, `truncated: false`, `activeThisWeek: 19`,
  `activeThisMonth: 28`, and all 8 topContent rows carrying `trend: null` with
  their `peopleRecent` values intact (4, 7, 1, 2, 2 on the first five). That is
  the behaviour this change exists to produce, measured on the real response for
  the school that exposed the bug.

## What I could not verify

**The rendered panel, this time.** I could not get the engagement panel into the
DOM in the local browser. The tab click did not take effect across several
attempts and `document.body.innerText` never contained "What your team is
working on", so the legend sentence was never on screen to read. The API is
right and the component logic is two lines, but I did not see it.

That is a real gap and I am not dressing it up. What makes it tolerable rather
than reckless: the same two components rendered correctly in production earlier
today, verified on Saunemin by me and on Addison by Rae, and the only difference
here is an absent icon and one extra sentence.

- Verify after deploy: open https://www.teachersdeserveit.com/partners/addison-sd4
  and read under the content list. Expect percentages with NO arrows, and the
  sentence beginning "No direction is shown yet, because the 30 days before this
  one include a day when most of your staff were in the Hub at once". Then open
  saunemin-ccsd-438, which is still comparable, and expect arrows and the
  original legend. If Addison shows percentages but no explanatory sentence, the
  prop is not reaching PopularityLegend.

## What I did not press

Nothing that writes or sends. The only control pressed was a modal close and a
tab.

## Why this change exists

Addison's dashboard pointed down on six of eight rows the morning the arrow
shipped, while the school was climbing: 6, 1, 13 and 19 distinct people over its
four most recent weeks. The earlier half of the comparison held both of its
August in-service days, 27 people on one and 28 on another against an ordinary
day of one or two.

Every school on a US calendar has that shape. For the first two months of the
year every prior window is August, so every dashboard would have pointed down
exactly when schools were ramping up. Rae caught it by asking whether the data
was old.
