# Browser pass

## What this change touches

The timeline on every year record, shared by every partner dashboard.

## The bug

Rae, before moving on from St Peter Chanel: "do you need to check anything to
confirm this dashboard is done well and strong before we move on?"

Sweeping it found this. The timeline always rendered three columns, Done, In
progress and Coming up, whether or not they had anything in them. So St Peter
Chanel's **completed** 2025-2026 record printed "In progress 0 Nothing here"
and "Coming up 0 Nothing here" beneath a year that had ended.

Two empty columns under their strongest record. A year that finished has nothing
in progress, and saying "Nothing here" twice reads as a broken feature rather
than as a year that ended.

## The fix

A column with no events does not render, and the grid collapses to one column
when only one survives. Nothing was changed about which events land where.

## What I did

- Opened: http://localhost:3000/partners/st-peter-chanel
- Pressed: the "2025-2026" tab
- Saw, before: "...moved to ACCELERATE Jun 30, 2026 **In progress 0 Nothing here
  Coming up 0 Nothing here**"
- Made the change, reloaded
- Pressed: the "2025-2026" tab
- Saw: the timeline reads "**Done 5**" and the string "Nothing here" appears
  nowhere on the page.
- Pressed: the "2026-2027" tab
- Saw: "2026-2027 timeline **Done 3** Year two begins Jul 1, 2026, Hub access and
  books delivered for 25 Aug 31, 2026, Executive Impact Session one Sep 22, 2026,
  **Coming up 4** On-campus observation day one Nov 30, 2026, On-campus
  observation day two Feb 22, 2027, Executive Impact Session two Apr 5, 2027,
  Virtual strategy session Apr 7, 2027"

Both directions matter. The finished year loses its empty columns and the live
year keeps all four of its upcoming events. If the fix had been too broad, the
second check would have lost those dates.

## What I could not verify

Production, a separate deploy.

A year with events in all three states. No partnership currently has an event
marked in_progress, so that branch was verified by reading the condition rather
than by loading it.

The visual rendering. The dashboard waits on an intro animation whose timer does
not fire in a backgrounded automated tab, so every figure above was read from the
DOM rather than from a screenshot.
