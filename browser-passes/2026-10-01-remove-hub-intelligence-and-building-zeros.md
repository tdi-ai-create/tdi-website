# Browser pass

## What this change touches

The Overview tab's Hub Intelligence panel, which is removed, and the Schools tab,
which stops printing nine zeros.

## Why

Rae, 30 September 2026, reviewing the live dashboard: "is this space fully
updated?" and then "or is this section needed?"

It was not updated, and it was not needed.

### The panel

It rendered "0% of your team logged in this month" directly beside "20 active in
the last 7 days" on the same card. Both cannot be true. That 0% was the same
calendar-month bug fixed for Reports earlier today, living in a second place:
`hub_login_pct` divides `logins_this_month` by the seat count, and
`logins_this_month` counts from the first of the calendar month.

"0 tools explored" counted an action named `quick_win_completed`. Measured
against the live Hub, Addison's last 30 days contain no such action at all. What
they do contain is `lesson_viewed` 87 times by 22 people and `quick_win_viewed`
28 times by 11 people. So the number was not low, it was reading a field nothing
writes.

"Popular in your building" and "your building's most common educator type"
called a nine school district a building, and derived that type from 1 anchor
and 1 connector. Two people.

The 4.5 out of 5 wellness score came from 3 people and contradicted the 3.71
vibe check average across 35 people that the goals on the same page are built on.

Everything honest about it already exists on the live year tab as "What your team
is working on", so this was a broken duplicate rather than a lost capability.

### The Schools tab

All nine buildings read "0 staff" with four empty indicator dots each. Nine zeros
in a column reads as nine schools where nobody is doing anything. The truth is we
have never been given a roster with a school column.

## What I did

- Opened: http://localhost:3000/partners/addison-sd4
- Saw, before: "Hub Intelligence", "Learning Hub Activity", "0% of your team
  logged in this month", "0 tools explored by your educators", "POPULAR IN YOUR
  BUILDING", and "Your building's most common educator type: The anchor, 1
  anchor, 1 connector".
- Pressed: the "Schools" tab
- Saw, before: "District Overview 9 Buildings 149 Total Staff 34% Avg Hub Login"
  then nine cards each reading "Army Trail elementary · **0 staff**".
- Made the changes, reloaded
- Saw: Hub Intelligence and Learning Hub Activity are **gone**, and so is every
  "building" reference and the 0% tile.
- Pressed: the "Schools" tab
- Saw: the sample card now reads "Army Trail elementary · **staff list not
  received yet**", and a block above the list headed "Waiting on one thing from
  you" explaining that the nine buildings are set up and all 149 staff have
  access, and that a roster with a school column splits every figure by building.

## Two more things the sweep found

I swept all seven tabs for zeros, placeholders and voice violations rather than
only fixing what Rae pointed at.

**"Need Attention" was hardcoded to an em dash.** A fourth stat tile on the
Schools district row whose value is the literal character. It was never computed,
so it could never show anything, and it sat beside three real figures. Removed.

**An em dash was the generic missing-value fallback** on the Team tab, so a
partnership with no address on file printed "Address —". Now "Not on file", which
says which side the gap is on and does not break the no em dash rule.

- Saw, after the sweep: **zero** em dashes and **zero** double hyphens across all
  seven tabs.

## One false positive, for the record

My sweep flagged "0% of your team" on two year tabs. It was my own regex matching
the "0%" inside "**100%** of your team engaged with the Hub by the end of
spring". There was no problem there.

## What I did not press

The nudge. It opens a mail client addressed to 98 real paraprofessionals.

## What I could not verify

Production, a separate deploy.

The visual rendering. The dashboard waits on an intro animation whose timer does
not fire in a backgrounded automated tab, so every figure above was read from the
DOM rather than from a screenshot.
