# Browser pass

## What this change touches

The Reports tab on the partner dashboard. The readiness gate on the six
engagement-backed reports, and the copy in the locked panel.

## The bug

Rae, 30 September 2026: "shouldn't some of these reports be available now?"

They should. Addison has 149 seats and 28 people active in the last 30 days
against a threshold of 3.

The gate read `hubStats.logins_this_month`, which counts distinct users since
the first of the **calendar** month. I called the endpoint live and it returned
`logins_this_month: 0` next to `active_users_7d: 20` in the same response, which
cannot both be true. It was 01:47 UTC on 1 October, so the counter covered about
two hours.

Two consequences beyond Addison. Every partner dashboard locked these six
reports at midnight on the first of every month. And the locked panel told the
leader "No staff have logged into the Hub this month", which was false on a page
that printed "28 Active this month" one tab away.

## The fix, and why it is not a new window

The gate now reads `engagement.activeThisMonth`, the rolling 30 day count the
dashboard already displays. No new field and no fourth definition of engagement,
so the gate and the number a leader reads cannot disagree again. The fallback is
`active_users_7d`, the other rolling figure, never the calendar one.

## What I did

- Opened: https://www.teachersdeserveit.com/partners/addison-sd4 (before the fix)
- Pressed: the "Reports" tab
- Saw: a panel headed "Reports aren't ready yet" and **6 disabled buttons**
  reading "Not enough data yet" on Board Presentation, Staff Engagement, Impact
  & ROI, Quarterly Progress, Teacher Highlights and Community Update. Newsletter
  Ready, Staff Celebrations and the CSV exports were enabled.
- Called `/api/partnerships/1e2ba852-.../hub-stats` from the page and saw
  `logins_this_month: 0`, `active_users_7d: 20`, `member_count: 149`,
  `has_real_data: true`.
- Made the change, then opened http://localhost:3000/partners/addison-sd4
- Pressed: the "Reports" tab
- Saw: the "aren't ready yet" panel is **gone**, **0** disabled buttons, **6**
  buttons now reading "Generate Report", and **0** still reading "Not enough
  data yet".
- Pressed: "Generate Report" on Board Presentation
- Saw: the button changed to "Generating...", then back to "Generate Report"
  with no error copy anywhere in the panel. The dev server logged
  `POST /api/hub/insights 200 in 227ms` and
  `GET /api/partners/popular-content 200`.

## What I could not verify, and it matters here

The report's actual contents. `generateAIReport` opens a popup and writes into
it, and I stubbed `window.open` so the press could be observed without a tab
escaping the session. So I confirmed the request succeeded and the control
completed, not that the document reads well.

Worth knowing separately: on any failure of `/api/hub/insights` the code falls
back to `generateFallbackReport` and still prints a document. So a completed
press never proves the AI ran. Here the 200 does.

Production, a separate deploy.

The visual rendering. The dashboard waits on an intro animation whose timer does
not fire in a backgrounded automated tab, so every figure above was read from the
DOM rather than from a screenshot.
