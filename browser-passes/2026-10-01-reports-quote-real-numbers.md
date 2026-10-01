# Browser pass

## What this change touches

The data context behind all nine report templates, both export builders, the
Overview metric tiles, and the CSV export.

## The bug, and that I caused the exposure

Earlier on 30 September I unlocked six partnership reports by fixing a
readiness gate that read a calendar-month counter. I fixed the lock and not the
reports behind it.

Every report template quotes three figures: `hubLoginPct`, `staffLoggedIn` and
`toolsExplored`. All three came from the same broken sources.

`hubLoginPct` read `hubStats.hub_login_pct`, which is distinct sign ins since
the first of the calendar month over provisioned seats. `toolsExplored` read
`hubStats.quick_wins_completed`, an action the Hub has never written.

So a Board Presentation generated on 1 October would have told a school board
"**0% are actively engaged, 0 tools explored**" for a district with 51 active
staff and 87 lesson views in the last 30 days. Nine templates, including the
board and community ones, carried the same two numbers.

## The fix

`hubLoginPct` is now the same arithmetic as the Team Activation card and the
Overview summary, so a leader quoting the report and a leader quoting the screen
say the same number. `toolsExplored` counts the distinct courses and quick wins
the team actually opened, which required adding `distinctContent` to the
engagement API because `topContent` is sliced to 8 for display and reports print
this as a total.

The Overview month tile also read the calendar counter, so the month figure was
smaller than the week figure beside it every time a new month began. Now rolling
both ways.

Five call sites rewired in total, plus the API field.

## What I did

- Opened: http://localhost:3000/partners/addison-sd4
- Saw, before: the Overview summary read "exploring **0** tools", and the report
  data context fed `hub_login_pct` and `quick_wins_completed` to all nine
  templates.
- Pressed: the "Reports" tab, then "Generate Report" on Community Update
- Saw, before the change: the button cycled Generate Report, "Generating...",
  back to Generate Report, with the server logging POST /api/hub/insights 200.
  The report it produced drew 0% and 0 tools from the broken fields.
- Made the change, reloaded
- Pressed: the "Reports" tab, then "Generate Report" on Community Update again
- Saw: the same cycle, Generate Report to "Generating..." and back, no error copy
  anywhere in the panel, and the server logged POST /api/hub/insights 200.
- Saw: the Overview summary now reads "**34% of 149 educators logged into the
  Hub this month, exploring 52 tools across 9 buildings**".
- Saw: the Team Activation card reads "**51 of 149**". 51 over 149 is 34 percent,
  so the summary and the card agree rather than contradicting each other.

## What I could not verify, and why it matters here

The text inside a generated report. `generateAIReport` writes into a popup, and
I stubbed `window.open` so no tab escaped the session. The stub captured only the
placeholder write, so I verified the three figures where they render directly on
the page instead. They come from the same `dataContext` object the templates
read, so the values are the same values, but I did not read them inside a
finished report.

Worth a single manual check on production: open Reports, generate the Board
Presentation, and confirm it says 34 percent and not 0.

Production, a separate deploy.

The visual rendering. The dashboard waits on an intro animation whose timer does
not fire in a backgrounded automated tab, so every figure above was read from the
DOM rather than from a screenshot.
