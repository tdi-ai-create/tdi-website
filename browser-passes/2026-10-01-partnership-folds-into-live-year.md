# Browser pass

## What this change touches

The partner dashboard tab strip, the Our Partnership content, and the contract
badge in the dashboard header.

## Why

Rae, 30 September 2026: "i actually think we can put our partnership and the
current school year together."

She was right, and reading both tabs showed why. They were two tabs describing
one thing. Our Partnership carried a "Partnership Timeline" while the live year
carried a "2026-2027 timeline", so one partnership printed two timelines. The
live engagement panel, "What your team is working on", sat on the tab that
otherwise described the contract. And what a school bought was one tab away from
what a school could add next, when a leader reads those as one decision.

Reading it also turned up two placeholders aimed at a school in month one, shown
to a school in year two:

- "Our Partnership Goal" said "Your partnership goal will be set during your
  onboarding call with our team", while the Your Goals card on Overview was
  already showing three goals. Two answers to one question on one dashboard.
- "Your Partnership Story" said "As we work together, this page will fill with
  session notes, teacher feedback..." in future tense.

## What I did

- Opened: http://localhost:3000/partners/addison-sd4
- Saw, before: **8 tabs** including "Our Partnership", whose panel carried six
  headings: What your team is working on, Your Partnership Story, What Your
  Partnership Includes, Our Partnership Goal, Your TDI Journey, Partnership
  Timeline.
- Made the change, reloaded
- Saw: **7 tabs**, "Overview, 2025-2026 Complete, 2026-2027 Live, 2027-2028
  Proposed, Reports, Schools, Team". No "Our Partnership".
- Pressed: the "2026-2027" tab
- Saw the headings in this order:
  1. "Eleven weeks in, and your team is going straight to de-escalation."
  2. "2026-2027 in numbers"
  3. "What stood out"
  4. "Your next 98"
  5. "What your team is working on"
  6. "What Your Partnership Includes"
  7. "Your TDI Journey"
  8. "Use your second Executive Impact Session on this"
  9. "2026-2027 timeline"
  10. "What districts add next", then the two offer cards
- Saw: "Your Partnership Story", "Our Partnership Goal" and the duplicate
  "Partnership Timeline" are all gone.

## One thing I had to redo

My first attempt rendered the partnership content after the whole year record,
which put "What districts add next" and the two offer cards **above** "What your
team is working on". That shows a leader what we are selling before their own
team's activity. Moved inside the record instead, so everything real comes
first and the upsell is last.

## The header badge

Rae spotted "2026-2026" beside the district name. `DashboardHeader` built the
badge from the two contract calendar years, and Addison's contract runs July to
December 2026, so both years were the same. Literally accurate, unreadable, and
sitting two inches from tabs reading "2026-2027".

- Saw, after: the badge reads **"Jul to Dec 2026"**.

A contract spanning two calendar years still shows the year range. The dates are
built from their parts rather than parsed, because `new Date('2026-07-01')` is
UTC midnight and renders as June in Chicago.

## Not duplicated

The content is defined once as `partnershipContext` and rendered in two places:
inside the live year for a school that has one, and as its own tab for a school
that does not. Addison is the only partnership with year records, so it is the
only tab strip that changes.

## What I did not press

The nudge. It opens a mail client addressed to 98 real paraprofessionals.

## What I could not verify

Production, a separate deploy.

A school with no year record still having its Our Partnership tab. I verified
that by reading the condition, `currentYearTabId` being null, and by knowing
Addison is the only partnership in `partnership_semester_data`, not by loading
a second school's dashboard.

The visual rendering. The dashboard waits on an intro animation whose timer does
not fire in a backgrounded automated tab, so every figure above was read from
the DOM rather than from a screenshot.
