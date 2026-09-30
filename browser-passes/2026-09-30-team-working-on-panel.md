# Browser pass

## What this change touches

The Overview tab of the partner dashboard. A new panel, "What your team is
working on", showing the courses and Quick Wins a school's staff actually chose,
plus how many signed in this week and this month.

Verified locally against production data, not deferred. `npm run dev` serves
`/partners/addison-sd4` without the admin cookie, so this page can be driven
locally even though `/tdi-admin` cannot.

## What I did

- Opened: http://localhost:3000/partners/addison-sd4
- Pressed: "Skip" on the "Welcome to Your Dashboard" tour, which opens over the
  Overview tab and covers this panel
- Saw: the modal closed and the Overview tab was readable underneath

- Saw: the panel heading "What your team is working on", the subtitle "Nobody
  assigned these. Your staff chose them.", and "Last 90 days" on the right
- Saw: the three counters read "20 Active this week", "28 Active this month",
  and "Sep 30 Most recent sign in"
- Saw: the ranked list, each row carrying a COURSE or QUICK WIN tag:
  "Calm Classrooms, Not Chaos 8 people", "In-the-Moment Student Conflict: Quick
  Reference 7 people", "RINSE Method - Mindset Reset for Educators 5 people",
  "Classroom Management Toolkit 5 people", "Communication that Clicks 5 people",
  "Understanding Student Needs & Modifications 4 people", "Your Designation
  Isn't Your Destiny (Recorded Webinar) 4 people"

Every one of those counts matches a SQL aggregate I ran independently against
the Hub before writing the component, same titles in the same order.

- Saw, directly above it, "Team Activation 51 of 149 educators active on Hub",
  "34%", and "98 educators haven't logged in yet." 149 minus 51 is 98, and 34%
  is 51/149, so the new panel and the existing activation card agree. Before
  today those two disagreed, 50 of 148 against 51 of 149.

## What I did not press

"View all" on the Team Activation card, and "Open Learning Hub". Neither is part
of this change.

## What I could not verify

The truncation notice. It only renders when a partnership exceeds 5000 activity
rows in 90 days, and Addison has roughly 470, so no client hits it today. The
branch is written but unexercised.

Production. This was verified on localhost against live production data. The
same page on www is a separate deploy and should be re-checked after merge.

## One thing this surfaced that is not part of this change

The onboarding checklist item directly above reads "Your 136 staff from last
year are listed below." Addison's roster is 149. That 136 is stale text written
into `action_items.description` on 29 July and never updated. Raised separately.
