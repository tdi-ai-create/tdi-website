# Browser pass

## What this change touches

The partner dashboard Overview and Our Partnership tabs. Overview becomes a
snapshot: the engagement panel moves to Our Partnership, and the AI summary
stops contradicting the card above it.

## What I did

- Opened: http://localhost:3000/partners/addison-sd4
- Saw: Overview now holds only "Your Goals", "Team Activation" and
  "Partnership Intelligence", then "Partnership Momentum". The "Set Up Your
  Partnership" checklist and the "Your Next Steps" list are both gone, because
  Addison's three action items were completed in the database and the setup
  card returns null once every step is done.
- Saw: "Team Activation" reads "51 of 149 educators active on Hub", "34%", and
  "98 educators haven't logged in yet."
- Saw: Partnership Intelligence now reads "Your team is getting started. 34% of
  149 educators logged into the Hub this month across 9 buildings. Your
  educators' average wellness score is 4.5 out of 5, stronger than the national
  average." Two things changed in that sentence. It said **19% of 149** before,
  three lines under a card saying 34%. And it used a double hyphen before
  "stronger", which is now a comma.
- Saw: "Partnership Momentum: Getting Started, 34% Hub engagement", agreeing
  with both.

- Pressed: the "Our Partnership" tab
- Saw: the tab became selected and "What your team is working on" now renders at
  the top of that panel, with "20 Active this week", "28 Active this month",
  "Sep 30 Most recent sign in", and the ranked list beginning "Calm Classrooms,
  Not Chaos 8 people", "In-the-Moment Student Conflict: Quick Reference 7
  people", "RINSE Method - Mindset Reset for Educators 5 people".
- Saw: that panel is no longer anywhere on Overview, confirmed by searching the
  accessibility tree for its heading while Overview was active and getting
  nothing back.

## What I did not press

"Download Board Report" and "See detailed breakdown" on Overview, and "Book
Call". None are part of this change, and the first two generate real documents.

## What I could not verify

Production. Verified on localhost against live production data; www is a
separate deploy.

Whether removing the checklist is right for a partnership that genuinely has
setup left to do. Addison's steps are all complete, so the card correctly
returns null here. A school mid-onboarding still sees it, which is the intent.

## Also cleaned up on this page

Five other double hyphens in client-facing strings: the staff photos step, the
"hasn't logged in yet" line, the course completions line, the community posts
line, and two teacher quote attributions.
