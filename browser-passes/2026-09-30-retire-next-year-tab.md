# Browser pass

## What this change touches

The partner dashboard tab strip. The "Next Year" placeholder tab is retired for
any school that has a proposal year.

## Why

Rae, 30 September 2026, auditing Addison's tabs for what makes sense to the
leader reading them.

"Next Year" is 500 characters of placeholder. Its text reads "Once your
partnership is underway and we've collected baseline data, this space will
transform into your personalized growth plan."

Addison is in year two. They have a completed 2025-2026 record three tabs to the
left and a 2027-2028 proposal one tab to the left. So the tab told a returning
client we had not started yet, and it wore the only blue "New" badge on the
strip, which pointed the eye at the emptiest thing on the page.

Its copy also broke two voice rules: a spaced hyphen used as a dash, and "ROI
analysis".

## What I did

- Opened: http://localhost:3000/partners/addison-sd4
- Saw, before the change, **9 tabs** with "Next Year" seventh, carrying a badge
  reading "New" on computed background `rgb(219, 234, 254)`.
- Pressed: the "Next Year" tab
- Saw: one heading, "Building Your Foundation First", and **500 characters**
  total, ending in a "Schedule a Call" button.
- Made the change, reloaded
- Saw: **8 tabs**, reading "Overview, Our Partnership, 2025-2026 Complete,
  2026-2027 Live, 2027-2028 Proposed, Reports, Schools, Team"
- Saw: `hasNextYear` is false and the count of blue "New" badges anywhere on the
  strip is **0**
- Saw: the three year badges still compute correctly. Complete
  `rgb(238, 240, 244)`, Live `rgba(42, 157, 143, 0.14)`, Proposed
  `rgba(232, 184, 75, 0.2)`.

## The condition, and why it is not an Addison special case

The tab is dropped when any year record carries `is_proposal`. A school with a
real proposal has that content for real, with its own tab and badge, so the
placeholder retires the moment the real thing exists. A school in month one
still gets it.

## One thing I got wrong and corrected

While auditing I reported the Reports tab as rendering nothing, because no
element with id `panel-reporting` exists in the DOM. It does render. The panel is
a plain div that never carries the id its tab advertises in `aria-controls`, so
the content is fine and the accessibility link is broken. Not fixed here, and not
visible to the leader.

## What I did not press

The nudge on the year tabs. It opens a mail client addressed to 98 real
paraprofessionals.

## What I could not verify

Production, a separate deploy.

The visual rendering. The dashboard waits on an intro animation whose timer does
not fire in a backgrounded automated tab, so it sits at `visibility: hidden` and
a screenshot shows the loading splash. Every figure above was read from the DOM,
including the computed badge colours.
