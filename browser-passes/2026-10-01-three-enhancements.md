# Browser pass

## What this change touches

Three enhancements that land on every dashboard from one change each: the
observation notes slot, a cohort benchmark, and a Vibe Check panel covering all
five areas.

## Why

Rae, 1 October 2026, after a strategic review of gaps: "please do 1-3 but then
lets discuss 4 before we build anything - also as a ntoe for the vibe checks, we
track 5 areas, please make sure all dashboards have a spot on the current year
tab logs all 5 areas of vibe checks in a visually apealing way that also
provides quick insight and the ability to track progress throughout th eyear".

## One: the observation slot already existed and rendered nowhere

`observation_notes` has been a stored, typed field on the year record since it
was built. `para_quotes` sits beside it and renders. This did not.

Across the fleet roughly 44 Love Notes have been written, 25 at St Peter Chanel
in a single day. None of it had ever reached a dashboard, which made the
strongest craft TDI produces the least visible part of the product.

Now renders as "What we saw in your building", above the quotes, so the day comes
before what people said about it. Content goes in per partnership with no code
change.

## Two: how a typical partner school compares, with no data entry at all

Every dashboard quoted a 10% industry average from research and never our own
fleet, which is the more credible number and was already in the database.

Computed server side across partnerships with a real roster, so it needs nothing
entered per client and keeps working as the fleet grows.

Suppressed below four schools, because a median of two is a coin toss. I also
removed the "strongest is at N%" line after seeing it resolve to 100%, which is a
two-person school: true, and useless beside a 27-person one.

**Three corrections from Rae on this one, all of them right.**

It is not called cohort. Cohort is the name of a TDI offering, and using it as a
statistics word made her think a client had bought one. Renamed
`typicalActivation` in the code as well.

It must never state how many schools we work with, nor name them. My first
version printed "across the 8 schools we run". The count, ranking and best
performer are still computed because the median needs them, and none of the three
is returned to the browser, so a future change cannot leak one.

And the comparison stays, with the skew acknowledged. I argued for removing it,
because rosters run from two people to a hundred and fifty and a two-person
school at full activation counts the same as a large district at a third. Rae's
call was to keep it and say so plainly, which is better: a rough bearing with its
limits stated is more use to a leader than no bearing, and it gives them a reason
to call. The card now reads "Treat that as a rough bearing rather than a league
table" and links to the team.

## Three: all five Vibe Check areas, with the year's trend

Mood, energy, belonging and purpose are scored 1 to 5. **Needs is not scored at
all** and is the most directly useful of the five, because it is the only one
where staff say what they want rather than how they feel. It gets its own
treatment as their chosen words rather than being forced into a bar.

An area reports no average below three people. Two reasons, and the second
matters more: a mean of one answer is not a measurement, and in a school where
the leader knows everybody it is that person's private answer with a number on
it.

## What I did

- Opened: http://localhost:3000/partners/saunemin-ccsd-438
- Pressed: the "2026-2027" tab
- Saw: the Vibe Check panel reading "**9 people, 33% of your team**", then "Mood **3.1 /
  5** How the day is actually going, 9 people" and "Energy **3.2 / 5** What is
  left in the tank, 5 people", then "What your team says it needs: **time**",
  then "Belonging, Purpose **are not reported yet**. An area needs at least three
  people before it shows an average".
- Saw: the comparison reading "**Your 44% sits below the 56% typical of the
  schools we work with.**", then "Treat that as a rough bearing rather than a
  league table", then an "Ask the team" link. Confirmed no school count appears
  anywhere on the page and the word cohort appears nowhere.
- Opened: http://localhost:3000/partners/st-peter-chanel
- Pressed: the "2026-2027" tab
- Saw: the trend render, because they have four months of data where Saunemin
  has one. "Mood **3.7 / 5** ... **Jun Jul Aug Sep** ... 8 people · **steady since
  Jun**" and "Energy **4.3 / 5** ... Jul Aug Sep ... 3 people · steady since
  Jul". Counted **7** hoverable monthly bars across the two areas.

Both schools matter here. Saunemin proves the suppression works and St Peter
Chanel proves the trend does. A single school would have shown only one.

## The instrument problem, narrowed rather than blanket-fixed

Fourteen goals across eight partnerships name Quick Win responses. A blanket swap
to Vibe Checks would have been wrong, because Vibe Checks measure how staff feel
and not whether anyone tried a strategy.

Filtering to goals with **no** viable instrument left five, and three of those
already have a working primary: Glen Ellyn's observation day, and Roosevelt's Hub
activity records, whose text already admits the Quick Win count stands at zero.

The real problem was St Mary, where three of four goals rested on Quick Win
responses and course completions. Across the entire Hub there are 12 course
certificates, and St Mary's team has left no Quick Win responses. Those three
goals were unmeasurable.

They now lead with a short self report at the December progress check they already
have scheduled, and again in May. St Mary is the school most able to answer one:
83% activation and 9 of 12 completing Vibe Checks is a better response rate than
most schools manage on anything. Each card says plainly why the instrument
changed.

## What I could not verify

Production, a separate deploy.

The empty state of the Vibe Check panel, where nobody has checked in. Every
partnership has at least three people, so that branch was verified by reading the
condition.

The observation section rendering with real content. The slot renders and is
verified empty-safe, but no partnership has `observation_notes` populated yet, so
the section is correctly absent everywhere until the notes are entered. That is
the next piece of work, not a defect.

The visual rendering. The dashboard waits on an intro animation whose timer does
not fire in a backgrounded automated tab, so every figure above was read from the
DOM.

## The same claim, in the board report

Checking whether the phrase Rae rejected survived anywhere else turned up
something worse than phrasing. The engagement report asserted "exceeds the
typical TDI partner benchmark of 60% in the first quarter", "Most TDI partners
reach 60%+ within the first quarter", and "Typical TDI partners see 30-40%
adoption in the first two weeks". All three were hardcoded. Nobody ever measured
any of them, and the median computed from live rosters is 56%, so the invented
figure was also wrong. It printed into a document a principal hands to a board.

Three lines above it sat a comment stating the rule it broke: a report must not
put a number in front of a school board that we invented.

So the report now carries `typicalPct` from the same measured source as the
panel, in the same words, and makes no comparison at all when there are too few
schools to publish a median.

The AI path needed the same guard, because it is handed the whole data object
and had no instruction about comparisons. It is deliberately a rule about
authorship rather than phrasing: nothing new may be invented, and figures
already in the data or the template may be repeated. A blanket ban on the phrase
"national average" would have contradicted TDI's own 74% against 10% claim,
which is written into eight of these templates on purpose.

- Pressed: the **Reports** tab, then **Generate Report** under Staff Engagement,
  on Saunemin CCSD #438.
- Saw: the AI path returned a 3,113 character report containing no peer
  comparison and no invented benchmark, with TDI's own 74% claim intact.
- Pressed: the same button again with the AI route forced to fail, to exercise
  the fallback text itself.
- Saw: "**Your adoption rate of 44% sits below the 56% typical in our
  community.**" followed by the caveat and "Ask the TDI team if you want it put
  in context for a school like yours." Confirmed none of
  "benchmark of 60%", "60%+ within", or "30-40% adoption" appears in either path.

## Wording, on Rae's instruction

"rather than 'we work with' lets just say 'in our community'". Changed in the
panel, the caveat and the report. `grep` for "schools we work with" across the
dashboard returns nothing outside comments quoting the rule itself.
